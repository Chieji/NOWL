// Content script that runs on Facebook pages

console.log('FACE content script loaded on Facebook');

// Notify background script that we're on Facebook
chrome.runtime.sendMessage({
  type: 'FACEBOOK_PAGE_LOADED',
  data: { url: window.location.href }
});

// Facebook automation functions
class FacebookAutomation {
  
  // Find the post composer
  static findPostComposer(): HTMLElement | null {
    // Facebook's post composer selectors (these may change)
    const selectors = [
      '[data-testid="status-attachment-mentions-input"]',
      '[contenteditable="true"][data-testid="status-attachment-mentions-input"]',
      'div[contenteditable="true"][role="textbox"]',
      '.notranslate._5rpu'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && element.isContentEditable) {
        return element;
      }
    }
    
    return null;
  }

  // Post text content
  static async postText(content: string): Promise<boolean> {
    try {
      const composer = this.findPostComposer();
      if (!composer) {
        console.error('Could not find post composer');
        return false;
      }

      // Click to focus the composer
      composer.click();
      await this.sleep(500);

      // Clear existing content and add new content
      composer.innerHTML = '';
      composer.textContent = content;

      // Trigger input events to make Facebook recognize the content
      const inputEvent = new Event('input', { bubbles: true });
      composer.dispatchEvent(inputEvent);

      await this.sleep(500);
      return true;
    } catch (error) {
      console.error('Error posting text:', error);
      return false;
    }
  }

  // Upload images
  static async uploadImages(imageFiles: File[]): Promise<boolean> {
    try {
      // Find file input for photos
      const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
      if (!fileInput) {
        console.error('Could not find file input');
        return false;
      }

      // Create a new FileList with our images
      const dataTransfer = new DataTransfer();
      imageFiles.forEach(file => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;

      // Trigger change event
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await this.sleep(2000); // Wait for images to upload
      return true;
    } catch (error) {
      console.error('Error uploading images:', error);
      return false;
    }
  }

  // Find and click the post button
  static async publishPost(): Promise<boolean> {
    try {
      // Common selectors for the post button
      const postButtonSelectors = [
        '[data-testid="react-composer-post-button"]',
        'div[aria-label="Post"]',
        'div[role="button"]:has-text("Post")',
        '.notranslate'
      ];

      for (const selector of postButtonSelectors) {
        const button = document.querySelector(selector) as HTMLElement;
        if (button && button.textContent?.toLowerCase().includes('post')) {
          button.click();
          await this.sleep(1000);
          return true;
        }
      }

      console.error('Could not find post button');
      return false;
    } catch (error) {
      console.error('Error publishing post:', error);
      return false;
    }
  }

  // Set post privacy
  static async setPrivacy(privacy: 'public' | 'friends' | 'only_me'): Promise<boolean> {
    try {
      // Find privacy selector button
      const privacyButton = document.querySelector('[data-testid="audience-selector"]') as HTMLElement;
      if (!privacyButton) {
        console.log('Privacy selector not found, using default');
        return true;
      }

      privacyButton.click();
      await this.sleep(500);

      // Map privacy settings to Facebook's options
      const privacyMap = {
        'public': 'Public',
        'friends': 'Friends',
        'only_me': 'Only me'
      };

      const targetPrivacy = privacyMap[privacy];
      const privacyOption = Array.from(document.querySelectorAll('div[role="option"]'))
        .find(option => option.textContent?.includes(targetPrivacy)) as HTMLElement;

      if (privacyOption) {
        privacyOption.click();
        await this.sleep(500);
        return true;
      }

      console.log('Could not set privacy to:', privacy);
      return false;
    } catch (error) {
      console.error('Error setting privacy:', error);
      return false;
    }
  }

  // Helper function to sleep
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Complete post creation flow
  static async createPost(data: {
    content: string;
    images?: File[];
    privacy?: 'public' | 'friends' | 'only_me';
  }): Promise<boolean> {
    try {
      console.log('Creating Facebook post:', data);

      // Step 1: Add text content
      if (data.content) {
        const textSuccess = await this.postText(data.content);
        if (!textSuccess) return false;
      }

      // Step 2: Upload images if any
      if (data.images && data.images.length > 0) {
        const imageSuccess = await this.uploadImages(data.images);
        if (!imageSuccess) return false;
      }

      // Step 3: Set privacy
      if (data.privacy) {
        await this.setPrivacy(data.privacy);
      }

      // Step 4: Publish the post
      const publishSuccess = await this.publishPost();
      return publishSuccess;

    } catch (error) {
      console.error('Error in createPost:', error);
      return false;
    }
  }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CREATE_POST':
      FacebookAutomation.createPost(message.data)
        .then(success => sendResponse({ success }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response

    case 'GET_PAGE_INFO':
      sendResponse({
        url: window.location.href,
        title: document.title,
        isOnFacebook: window.location.hostname.includes('facebook.com')
      });
      break;

    case 'CHECK_COMPOSER':
      const composer = FacebookAutomation.findPostComposer();
      sendResponse({ 
        hasComposer: !!composer,
        composerVisible: composer ? composer.offsetParent !== null : false
      });
      break;

    default:
      console.log('Unknown message type in content script:', message.type);
  }
});

// Inject additional scripts if needed
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  script.remove();
};
(document.head || document.documentElement).appendChild(script);

// Monitor for Facebook interface changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      // Check if post composer appeared/disappeared
      const composer = FacebookAutomation.findPostComposer();
      if (composer) {
        // Notify that composer is available
        chrome.runtime.sendMessage({
          type: 'COMPOSER_AVAILABLE',
          data: { available: true }
        }).catch(() => {
          // Extension context might be invalid
        });
      }
    }
  });
});

// Start observing Facebook page changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

export {};
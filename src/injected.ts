// Injected script that runs in the Facebook page context
// This has access to the page's JavaScript environment

(function() {
  'use strict';

  console.log('FACE injected script loaded');

  // Add FACE object to window for communication
  (window as any).FACE = {
    version: '1.0.0',
    
    // Helper to wait for elements
    waitForElement: (selector: string, timeout = 5000): Promise<Element | null> => {
      return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }

        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector);
          if (element) {
            observer.disconnect();
            resolve(element);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Timeout fallback
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, timeout);
      });
    },

    // Get Facebook's internal React fiber for advanced interactions
    getReactFiber: (element: Element) => {
      const fiberKey = Object.keys(element).find(key => 
        key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber')
      );
      return fiberKey ? (element as any)[fiberKey] : null;
    },

    // Simulate human-like typing
    simulateTyping: (element: HTMLElement, text: string) => {
      element.focus();
      
      // Clear existing content
      element.innerHTML = '';
      
      // Type character by character with random delays
      let i = 0;
      const typeChar = () => {
        if (i < text.length) {
          element.textContent += text[i];
          
          // Trigger input events
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('keyup', { bubbles: true }));
          
          i++;
          setTimeout(typeChar, Math.random() * 100 + 50); // 50-150ms delay
        }
      };
      
      typeChar();
    },

    // Enhanced post creation with Facebook's internal APIs
    createPostAdvanced: async (data: any) => {
      try {
        // This would use Facebook's internal JavaScript APIs
        // For now, fall back to DOM manipulation
        console.log('Creating post with advanced method:', data);
        
        // TODO: Implement Facebook Graph API calls from page context
        // This might require user's Facebook access token
        
        return { success: false, message: 'Advanced posting not yet implemented' };
      } catch (error) {
        console.error('Advanced post creation failed:', error);
        return { success: false, error: error.message };
      }
    }
  };

  // Listen for messages from content script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case 'FACE_CREATE_POST':
        (window as any).FACE.createPostAdvanced(data).then((result: any) => {
          window.postMessage({
            type: 'FACE_POST_RESULT',
            data: result
          }, '*');
        });
        break;
    }
  });

  // Detect Facebook's React components
  const detectFacebookComponents = () => {
    const composer = document.querySelector('[data-testid="status-attachment-mentions-input"]');
    if (composer) {
      console.log('Facebook composer detected');
      
      // Add custom styling or behavior if needed
      composer.addEventListener('focus', () => {
        console.log('User focused on composer');
      });
    }
  };

  // Run detection when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectFacebookComponents);
  } else {
    detectFacebookComponents();
  }

  // Monitor for dynamic content changes
  const observer = new MutationObserver(() => {
    detectFacebookComponents();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
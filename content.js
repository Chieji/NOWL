// Content script for Facebook automation

console.log('FACE content script loaded on Facebook')

// Detect if we're on Facebook
function isFacebookPage() {
  return window.location.hostname.includes('facebook.com')
}

// Initialize Facebook automation
function initFacebookAutomation() {
  if (!isFacebookPage()) {
    console.log('Not on Facebook, skipping automation init')
    return
  }

  console.log('Initializing Facebook automation...')
  
  // Add FACE indicator to the page
  addFACEIndicator()
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request)
    
    switch (request.action) {
      case 'executeFacebookAction':
        handleFacebookAction(request.facebookAction, request.data)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }))
        return true
      
      case 'detectFacebookFeatures':
        const features = detectAvailableFeatures()
        sendResponse({ success: true, features })
        return true
      
      default:
        sendResponse({ success: false, error: 'Unknown action' })
    }
  })
}

// Add visual indicator that FACE is active
function addFACEIndicator() {
  // Check if indicator already exists
  if (document.getElementById('face-indicator')) return
  
  const indicator = document.createElement('div')
  indicator.id = 'face-indicator'
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
    ">
      🤖 FACE Active
    </div>
  `
  
  document.body.appendChild(indicator)
  
  // Add click handler to open extension popup
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' })
  })
}

// Handle Facebook-specific actions
async function handleFacebookAction(action, data) {
  console.log('Executing Facebook action:', action, data)
  
  switch (action) {
    case 'createPost':
      return await createFacebookPost(data)
    
    case 'uploadPhoto':
      return await uploadPhotoToFacebook(data)
    
    case 'updateProfile':
      return await updateFacebookProfile(data)
    
    case 'schedulePost':
      return await scheduleFacebookPost(data)
    
    case 'getPostData':
      return await getFacebookPostData(data)
    
    default:
      throw new Error(`Unknown Facebook action: ${action}`)
  }
}

// Create a new Facebook post
async function createFacebookPost(data) {
  try {
    // Find the "What's on your mind?" input
    const postInput = document.querySelector('[data-testid="status-attachment-mentions-input"]') ||
                     document.querySelector('[placeholder*="What\'s on your mind"]') ||
                     document.querySelector('[aria-label*="What\'s on your mind"]')
    
    if (!postInput) {
      throw new Error('Could not find Facebook post input')
    }
    
    // Click the input to focus it
    postInput.click()
    await sleep(500)
    
    // Type the content
    postInput.focus()
    postInput.value = data.content || ''
    postInput.dispatchEvent(new Event('input', { bubbles: true }))
    
    // Handle photo upload if provided
    if (data.photo) {
      await uploadPhotoToPost(data.photo)
    }
    
    // Set privacy if specified
    if (data.privacy) {
      await setPostPrivacy(data.privacy)
    }
    
    // Find and click the post button
    const postButton = document.querySelector('[data-testid="react-composer-post-button"]') ||
                      document.querySelector('[aria-label="Post"]') ||
                      document.querySelector('button[type="submit"]')
    
    if (!postButton) {
      throw new Error('Could not find Facebook post button')
    }
    
    postButton.click()
    
    return { success: true, message: 'Post created successfully' }
    
  } catch (error) {
    console.error('Failed to create Facebook post:', error)
    throw error
  }
}

// Upload photo to Facebook post
async function uploadPhotoToPost(photoData) {
  try {
    // Find the photo/video button
    const photoButton = document.querySelector('[data-testid="media-attachment-button"]') ||
                       document.querySelector('[aria-label*="Photo"]') ||
                       document.querySelector('[aria-label*="Add photos"]')
    
    if (!photoButton) {
      throw new Error('Could not find photo upload button')
    }
    
    photoButton.click()
    await sleep(500)
    
    // Find the file input
    const fileInput = document.querySelector('input[type="file"][accept*="image"]')
    if (!fileInput) {
      throw new Error('Could not find file input for photo upload')
    }
    
    // Create a file from the photo data
    const file = new File([photoData], 'photo.jpg', { type: 'image/jpeg' })
    
    // Set the file
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    fileInput.files = dataTransfer.files
    
    // Trigger change event
    fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    
    return { success: true, message: 'Photo uploaded successfully' }
    
  } catch (error) {
    console.error('Failed to upload photo:', error)
    throw error
  }
}

// Set post privacy
async function setPostPrivacy(privacy) {
  try {
    // Find the privacy selector
    const privacyButton = document.querySelector('[data-testid="privacy-selector"]') ||
                         document.querySelector('[aria-label*="Privacy"]')
    
    if (!privacyButton) {
      console.log('Privacy selector not found, using default')
      return
    }
    
    privacyButton.click()
    await sleep(300)
    
    // Select the desired privacy option
    const privacyOptions = {
      'public': 'Public',
      'friends': 'Friends',
      'friends_except': 'Friends except...',
      'specific_friends': 'Specific friends',
      'only_me': 'Only me'
    }
    
    const optionText = privacyOptions[privacy] || 'Public'
    const option = Array.from(document.querySelectorAll('[role="menuitem"]'))
      .find(el => el.textContent.includes(optionText))
    
    if (option) {
      option.click()
    }
    
    return { success: true, message: `Privacy set to ${privacy}` }
    
  } catch (error) {
    console.error('Failed to set privacy:', error)
    throw error
  }
}

// Detect available Facebook features
function detectAvailableFeatures() {
  const features = {
    canCreatePost: !!document.querySelector('[data-testid="status-attachment-mentions-input"]'),
    canUploadPhotos: !!document.querySelector('[data-testid="media-attachment-button"]'),
    canSchedulePost: false, // Facebook doesn't allow scheduling via web interface
    canEditProfile: !!document.querySelector('[aria-label="Edit profile"]'),
    isLoggedIn: !!document.querySelector('[data-testid="left_nav_menu_item"]'),
    currentPage: getCurrentFacebookPage()
  }
  
  return features
}

// Get current Facebook page type
function getCurrentFacebookPage() {
  const path = window.location.pathname
  
  if (path === '/' || path === '/home.php') return 'home'
  if (path.includes('/profile.php') || path.includes('/me')) return 'profile'
  if (path.includes('/groups/')) return 'group'
  if (path.includes('/pages/')) return 'page'
  if (path.includes('/events/')) return 'event'
  
  return 'unknown'
}

// Utility function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFacebookAutomation)
} else {
  initFacebookAutomation()
}
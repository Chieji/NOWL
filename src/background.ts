// Background service worker for FACE Chrome Extension

import { StorageService } from './services/storage';

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('FACE Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set up default settings on first install
    console.log('Setting up FACE for first time...');
  }
});

// Handle alarms for scheduled posts
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('scheduled-post-')) {
    const postId = alarm.name.replace('scheduled-post-', '');
    await handleScheduledPost(postId);
  }
});

// Handle scheduled post execution
async function handleScheduledPost(postId: string) {
  try {
    const scheduledPosts = await StorageService.getScheduledPosts();
    const post = scheduledPosts.find(p => p.id === postId);
    
    if (!post) {
      console.error('Scheduled post not found:', postId);
      return;
    }

    // Find Facebook tab
    const tabs = await chrome.tabs.query({ url: '*://*.facebook.com/*' });
    
    if (tabs.length === 0) {
      console.log('No Facebook tab found, postponing post...');
      // Reschedule for 5 minutes later
      chrome.alarms.create(`scheduled-post-${postId}`, { delayInMinutes: 5 });
      return;
    }

    const facebookTab = tabs[0];
    
    // Execute the post via content script
    await chrome.scripting.executeScript({
      target: { tabId: facebookTab.id! },
      func: executeScheduledPost,
      args: [post]
    });

    // Update post status
    const updatedPosts = scheduledPosts.map(p => 
      p.id === postId ? { ...p, status: 'posted' as const } : p
    );
    await StorageService.saveScheduledPosts(updatedPosts);

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'FACE - Post Published',
      message: 'Your scheduled post has been published to Facebook!'
    });

  } catch (error) {
    console.error('Error executing scheduled post:', error);
    
    // Mark post as failed
    const scheduledPosts = await StorageService.getScheduledPosts();
    const updatedPosts = scheduledPosts.map(p => 
      p.id === postId ? { ...p, status: 'failed' as const } : p
    );
    await StorageService.saveScheduledPosts(updatedPosts);
  }
}

// Function to be injected into Facebook page for posting
function executeScheduledPost(post: any) {
  console.log('Executing scheduled post:', post);
  
  // This function runs in the Facebook page context
  // Implementation would interact with Facebook's DOM to create the post
  // For now, just log the attempt
  
  // TODO: Implement actual Facebook posting logic
  // This would involve:
  // 1. Finding the post composer
  // 2. Adding the content
  // 3. Uploading images if any
  // 4. Setting privacy
  // 5. Publishing the post
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SCHEDULE_POST':
      handleSchedulePost(message.data);
      sendResponse({ success: true });
      break;
      
    case 'GET_FACEBOOK_STATUS':
      checkFacebookStatus().then(sendResponse);
      return true; // Keep message channel open for async response
      
    default:
      console.log('Unknown message type:', message.type);
  }
});

// Schedule a post for later
async function handleSchedulePost(postData: any) {
  try {
    const { scheduledTime, ...post } = postData;
    
    // Save the post
    const scheduledPosts = await StorageService.getScheduledPosts();
    scheduledPosts.push(post);
    await StorageService.saveScheduledPosts(scheduledPosts);
    
    // Create alarm
    const alarmTime = new Date(scheduledTime).getTime();
    chrome.alarms.create(`scheduled-post-${post.id}`, { when: alarmTime });
    
    console.log('Post scheduled for:', scheduledTime);
  } catch (error) {
    console.error('Error scheduling post:', error);
  }
}

// Check if user has Facebook tabs open
async function checkFacebookStatus() {
  try {
    const tabs = await chrome.tabs.query({ url: '*://*.facebook.com/*' });
    return {
      isOnFacebook: tabs.length > 0,
      facebookTabs: tabs.length
    };
  } catch (error) {
    console.error('Error checking Facebook status:', error);
    return { isOnFacebook: false, facebookTabs: 0 };
  }
}

// Handle tab updates to detect Facebook navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('facebook.com')) {
    // Notify popup that user is on Facebook
    chrome.runtime.sendMessage({
      type: 'FACEBOOK_DETECTED',
      data: { tabId, url: tab.url }
    }).catch(() => {
      // Popup might not be open, that's okay
    });
  }
});

export {};
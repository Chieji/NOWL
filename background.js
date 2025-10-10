// Background service worker for FACE Chrome Extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('FACE extension installed/updated:', details.reason)
  
  // Set default settings
  chrome.storage.local.set({
    'face-settings': {
      version: '1.0.0',
      installedAt: Date.now()
    }
  })
})

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request)
  
  switch (request.action) {
    case 'testProviderConnection':
      handleTestProviderConnection(request.provider, request.apiKey)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true // Keep message channel open for async response
      
    case 'sendToLLM':
      handleLLMRequest(request.provider, request.messages, request.apiKey)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
      
    case 'schedulePost':
      handleSchedulePost(request.postData, request.scheduleTime)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
      
    case 'executeFacebookAction':
      handleFacebookAction(request.action, request.data)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
      
    default:
      sendResponse({ success: false, error: 'Unknown action' })
  }
})

// Test provider connection
async function handleTestProviderConnection(provider, apiKey) {
  try {
    const response = await fetch(getProviderEndpoint(provider), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...getProviderHeaders(provider)
      },
      body: JSON.stringify({
        model: getProviderModel(provider),
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Provider connection test failed:', error)
    return false
  }
}

// Send request to LLM provider
async function handleLLMRequest(provider, messages, apiKey) {
  try {
    const response = await fetch(getProviderEndpoint(provider), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...getProviderHeaders(provider)
      },
      body: JSON.stringify({
        model: getProviderModel(provider),
        messages: messages,
        stream: true
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    console.error('LLM request failed:', error)
    throw error
  }
}

// Schedule a post for later
async function handleSchedulePost(postData, scheduleTime) {
  const alarmName = `post-${Date.now()}`
  const scheduleTimestamp = new Date(scheduleTime).getTime()
  
  // Store post data
  await chrome.storage.local.set({
    [`scheduled-post-${alarmName}`]: {
      ...postData,
      scheduledFor: scheduleTimestamp,
      createdAt: Date.now()
    }
  })
  
  // Set alarm
  chrome.alarms.create(alarmName, {
    when: scheduleTimestamp
  })
  
  return { alarmName, scheduledFor: scheduleTimestamp }
}

// Execute Facebook actions
async function handleFacebookAction(action, data) {
  // This would communicate with the content script
  // to perform actions on the Facebook page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, {
      action: 'executeFacebookAction',
      facebookAction: action,
      data: data
    }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else if (response.success) {
        resolve(response.result)
      } else {
        reject(new Error(response.error))
      }
    })
  })
}

// Handle scheduled post alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('post-')) {
    try {
      const postData = await chrome.storage.local.get(`scheduled-post-${alarm.name}`)
      const post = postData[`scheduled-post-${alarm.name}`]
      
      if (post) {
        // Execute the scheduled post
        await handleFacebookAction('createPost', post)
        
        // Clean up
        await chrome.storage.local.remove(`scheduled-post-${alarm.name}`)
        
        // Notify user
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'FACE - Post Published',
          message: 'Your scheduled post has been published to Facebook!'
        })
      }
    } catch (error) {
      console.error('Failed to execute scheduled post:', error)
    }
  }
})

// Helper functions for different providers
function getProviderEndpoint(provider) {
  const endpoints = {
    'openrouter': 'https://openrouter.ai/api/v1/chat/completions',
    'groq': 'https://api.groq.com/openai/v1/chat/completions',
    'anthropic': 'https://api.anthropic.com/v1/messages',
    'openai': 'https://api.openai.com/v1/chat/completions',
    'together': 'https://api.together.xyz/v1/chat/completions',
    'cohere': 'https://api.cohere.ai/v1/chat',
    'deepinfra': 'https://api.deepinfra.com/v1/openai/chat/completions',
    'xai': 'https://api.x.ai/v1/chat/completions'
  }
  return endpoints[provider] || endpoints['openrouter']
}

function getProviderHeaders(provider) {
  const headers = {
    'anthropic': {
      'anthropic-version': '2023-06-01'
    }
  }
  return headers[provider] || {}
}

function getProviderModel(provider) {
  const models = {
    'openrouter': 'gpt-3.5-turbo',
    'groq': 'llama-3-8b-8192',
    'anthropic': 'claude-3-sonnet-20240229',
    'openai': 'gpt-3.5-turbo',
    'together': 'meta-llama/Llama-2-7b-chat-hf',
    'cohere': 'command',
    'deepinfra': 'meta-llama/Llama-2-7b-chat-hf',
    'xai': 'grok-beta'
  }
  return models[provider] || 'gpt-3.5-turbo'
}
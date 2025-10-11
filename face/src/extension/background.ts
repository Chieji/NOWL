// FACE background service worker (MV3)

chrome.runtime.onInstalled.addListener(() => {
  console.log("FACE installed: background ready");
});

// Track FB detection per tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "FACE_DETECTED") {
    const tabId = sender.tab?.id;
    if (typeof tabId === "number") {
      chrome.storage.session.set({ ["fb_detected_" + tabId]: true });
    }
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === "PING") {
    sendResponse({ pong: true });
    return true;
  }
});

// Alarm stub for scheduling posts
chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm?.name?.startsWith("face_post_")) return;
  // TODO: execute scheduled Facebook post flow
  try {
    chrome.notifications?.create({
      type: "basic",
      iconUrl: "vite.svg",
      title: "FACE",
      message: `Scheduled task triggered: ${alarm.name}`,
    });
  } catch {
    // ignore notification failures in dev
  }
});

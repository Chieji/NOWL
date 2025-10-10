// Content script injected on facebook.com pages

(function init() {
  try {
    if (/facebook\.com$/.test(location.hostname)) {
      chrome.runtime.sendMessage({ type: "FACE_DETECTED", url: location.href });
    }
  } catch {}
})();

// Placeholder for future DOM automation hooks
// Listen for commands from background/popup
chrome.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== "object") return;
  if (message.type === "FACE_PING_CONTENT") {
    // no-op
  }
});

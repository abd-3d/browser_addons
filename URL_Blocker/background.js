let blockedUrls = [];

chrome.runtime.onInstalled.addListener(() => {
  // Initialize blocked URLs in storage
  chrome.storage.local.set({ blockedUrls: [] });
});

// Listen for URL blocking updates from storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.blockedUrls) {
    blockedUrls = changes.blockedUrls.newValue || [];
    updateUrlBlocking();
  }
});

// Function to update the URLs being blocked
function updateUrlBlocking() {
  // Remove any existing listener
  chrome.webRequest.onBeforeRequest.removeListener(blockListener);

  if (blockedUrls.length > 0) {
    // Add a new listener that only blocks the URLs from blockedUrls array
    chrome.webRequest.onBeforeRequest.addListener(
      blockListener,
      { urls: blockedUrls }, // Only apply to user-specified URLs
      ["blocking"]
    );
  }
}

// Listener function to block requests
function blockListener(details) {
  return { cancel: true };
}

// Load blocked URLs on startup
chrome.storage.local.get('blockedUrls', (data) => {
  blockedUrls = data.blockedUrls || [];
  updateUrlBlocking();
});

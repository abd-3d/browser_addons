// background.js
let timer = 0;
const DAILY_LIMIT = 20 * 60; // 20 minutes in seconds

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    timer: 0,
    lastReset: new Date().setHours(0, 0, 0, 0)
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("instagram.com")) {
    checkAndUpdateTimer();
  }
});

function checkAndUpdateTimer() {
  chrome.storage.local.get(['timer', 'lastReset'], (data) => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Reset timer if it's a new day
    if (data.lastReset < today) {
      chrome.storage.local.set({
        timer: 0,
        lastReset: today
      });
      timer = 0;
    } else {
      timer = data.timer || 0;
    }
    
    if (timer >= DAILY_LIMIT) {
      chrome.tabs.query({url: "*://*.instagram.com/*"}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.update(tab.id, {url: "blocked.html"});
        });
      });
    }
  });
}

// Use setInterval to continuously track the time
setInterval(() => {
  chrome.tabs.query({url: "*://*.instagram.com/*"}, (tabs) => {
    if (tabs.length > 0) {
      chrome.storage.local.get('timer', (data) => {
        timer = data.timer || 0;
        timer++;
        chrome.storage.local.set({timer: timer});
        
        // Check if the timer exceeds the daily limit and block Instagram if necessary
        if (timer >= DAILY_LIMIT) {
          chrome.tabs.query({url: "*://*.instagram.com/*"}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.update(tab.id, {url: "blocked.html"});
            });
          });
        }
      });
    }
  });
}, 1000); 

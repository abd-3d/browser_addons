// content.js
const DAILY_LIMIT = 20 * 60; // 20 minutes in seconds

function createTimerElement() {
  const timeLeft = document.createElement("div");

  timeLeft.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1); /* Transparent white */
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25); /* Soft shadow */
        backdrop-filter: blur(10px) saturate(150%);
        -webkit-backdrop-filter: blur(10px) saturate(150%);
        border: 1px solid rgba(255, 255, 255, 0.2); /* Border to enhance glass effect */
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s ease;
    `;

  timeLeft.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
            <path d="M8 3V8L11 11" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="8" cy="8" r="6" stroke="white" stroke-width="2"/>
        </svg>
        <span id="timer-text"></span>
    `;

  return timeLeft;
}

function updateTimer(timerElement) {
  chrome.storage.local.get(["timer"], (data) => {
    if (chrome.runtime.lastError) {
      timerElement.querySelector("#timer-text").textContent =
        "Error loading timer";
      return;
    }

    const currentTimer = data.timer || 0;
    const remainingTime = Math.max(0, DAILY_LIMIT - currentTimer);
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    const timerText = timerElement.querySelector("#timer-text");
    timerText.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")} remaining`;

    // Change appearance when time is running low
    if (remainingTime < 300) {
      // Last 5 minutes
      timerElement.style.background = "#FF3040";
      timerElement.style.animation = "pulse 2s infinite";
    }
  });
}

// Add pulse animation
const style = document.createElement("style");
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Initialize timer
const timerElement = createTimerElement();
document.body.appendChild(timerElement);

// Update immediately
updateTimer(timerElement);

// Then update every second
setInterval(() => updateTimer(timerElement), 1000);

// Ensure timer stays visible even after Instagram's dynamic content updates
const observer = new MutationObserver(() => {
  if (!document.body.contains(timerElement)) {
    document.body.appendChild(timerElement);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

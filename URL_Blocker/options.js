document.addEventListener('DOMContentLoaded', function () {
  const urlInput = document.getElementById('urlInput');
  const addUrlButton = document.getElementById('addUrl');
  const blockedUrlsList = document.getElementById('blockedUrlsList');

  // Load blocked URLs from storage
  chrome.storage.local.get('blockedUrls', function (data) {
    const blockedUrls = data.blockedUrls || [];
    updateBlockedUrlsList(blockedUrls);
  });

  // Add URL to the blocked list
  addUrlButton.addEventListener('click', function () {
    const newUrl = urlInput.value.trim();
    if (newUrl === "") {
      return;
    }

    // Ensure the URL ends with a wildcard for subpages
    const wildcardUrl = newUrl.endsWith('/') ? newUrl + '*' : newUrl + '/*';

    chrome.storage.local.get('blockedUrls', function (data) {
      const blockedUrls = data.blockedUrls || [];
      blockedUrls.push(wildcardUrl);

      // Save updated list to storage
      chrome.storage.local.set({ blockedUrls: blockedUrls }, function () {
        updateBlockedUrlsList(blockedUrls);
        urlInput.value = ""; // Clear input field
      });
    });
  });

  // Remove a URL from the blocked list
  function removeUrl(urlToRemove) {
    chrome.storage.local.get('blockedUrls', function (data) {
      const blockedUrls = data.blockedUrls || [];
      const updatedUrls = blockedUrls.filter(url => url !== urlToRemove);

      // Save updated list to storage
      chrome.storage.local.set({ blockedUrls: updatedUrls }, function () {
        updateBlockedUrlsList(updatedUrls);
      });
    });
  }

  // Update the blocked URLs list in the UI
  function updateBlockedUrlsList(blockedUrls) {
    blockedUrlsList.innerHTML = "";

    blockedUrls.forEach(url => {
      const li = document.createElement('li');
      li.textContent = url;
      const removeButton = document.createElement('button');
      removeButton.textContent = "Remove";
      removeButton.addEventListener('click', function () {
        removeUrl(url);
      });

      li.appendChild(removeButton);
      blockedUrlsList.appendChild(li);
    });
  }
});

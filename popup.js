document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let activeTabId = tabs[0].id;
    updateButtonState(activeTabId);
    updateCurrentIntervalDisplay(activeTabId);
  });

  document.getElementById("interval").addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      triggerRefresh();
    }
  });

  document.getElementById("toggleButton").addEventListener("click", triggerRefresh);
});

function triggerRefresh() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let activeTabId = tabs[0].id;
    toggleTabRefreshState(activeTabId);
  });
}

function updateButtonState(tabId) {
  chrome.storage.local.get(['refreshData'], function(result) {
    const button = document.getElementById("toggleButton");
    if (result.refreshData && result.refreshData[tabId]) {
      button.textContent = 'Stop';
      button.classList.remove('off');
    } else {
      button.textContent = 'Start';
      button.classList.add('off');
    }
  });
}

function toggleTabRefreshState(tabId) {
  chrome.storage.local.get(['refreshData'], function(result) {
    let isRefreshing = result.refreshData && result.refreshData[tabId];
    const button = document.getElementById("toggleButton");
    const intervalInput = document.getElementById("interval").value;

    if (isRefreshing) {
      chrome.runtime.sendMessage({command: "stop", tabId: tabId});
      button.textContent = 'Start';
      button.classList.add('off');
    } else {
      chrome.runtime.sendMessage({command: "start", interval: intervalInput, tabId: tabId});
      button.textContent = 'Stop';
      button.classList.remove('off');
    }

    let newData = result.refreshData || {};
    newData[tabId] = { intervalSetting: intervalInput };
    chrome.storage.local.set({refreshData: newData});
  });
}

function updateCurrentIntervalDisplay(tabId) {
  chrome.storage.local.get(['refreshData'], function(result) {
    const currentIntervalSpan = document.getElementById("currentInterval");
    if (result.refreshData && result.refreshData[tabId]) {
      currentIntervalSpan.textContent = result.refreshData[tabId].intervalSetting;
    } else {
      currentIntervalSpan.textContent = "Not Set";
    }
  });
}

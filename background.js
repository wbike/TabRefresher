let refreshData = {};

function getRandomInterval(range) {
  const [min, max] = range.split('-').map(Number);
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

function updateBadge() {
  const count = Object.keys(refreshData).length;
  const text = count > 0 ? count.toString() : '';
  chrome.action.setBadgeText({ text: text });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = message.tabId;

  if (message.command === 'start') {
    let interval;
    let isRange = false;
    if (message.interval.includes('-')) {
      interval = getRandomInterval(message.interval);
      isRange = true;
    } else {
      interval = parseInt(message.interval) * 1000;
    }

    if (refreshData[tabId] && refreshData[tabId].intervalId) {
      clearInterval(refreshData[tabId].intervalId);
    }

    refreshData[tabId] = { 
      intervalId: setInterval(() => {
        chrome.tabs.reload(tabId);
        if (isRange) {
          clearInterval(refreshData[tabId].intervalId);
          refreshData[tabId].intervalId = setInterval(() => {
            chrome.tabs.reload(tabId);
          }, getRandomInterval(message.interval));
        }
      }, interval),
      intervalSetting: message.interval
    };

    chrome.storage.local.set({refreshData: refreshData});
  } else if (message.command === 'stop') {
    if (refreshData[tabId] && refreshData[tabId].intervalId) {
      clearInterval(refreshData[tabId].intervalId);
      delete refreshData[tabId];

      chrome.storage.local.set({refreshData: refreshData});
    }
  }

  updateBadge();
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#88C987' });
});

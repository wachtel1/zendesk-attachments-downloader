let ticketId = "";
let path = "Tickets";

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['path'], (result) => {
    if (result.path) {
      path = result.path;
    }
  });
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log(changes);
  if ("path" in changes) {
    path = changes.path.newValue;
  }
});

chrome.tabs.onActivated.addListener((info) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes("zendesk.com/agent/tickets/")) {
      ticketId = tabs[0].url.split("/")[5];
    }
  })
})

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id === tabId) {
      if (tab.url && tab.url.includes("zendesk.com/agent/tickets/")) {
        ticketId = tab.url.split("/")[5];
      }
    }
  })
})

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (item.url.includes("zendesk.com/")) {
    const filename = path + "/" + ticketId + "/" + item.filename;
    suggest({ filename: filename });
  }
});
//let ticketId = "";

function template(strings, ...keys) {
  return ((...values) => {
    let dict = values[values.length - 1] || {};
    if (keys.length === 0) {
      for (let i = 1; i < strings.length; i++) {
        keys.push(strings[i]);
      };
      strings = strings[0];
    };
    let result = [strings[0]];
    keys.forEach((key, i) => {
      let value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
};

function deconstructTemplate(string) {
  const re = /\$\{\'\w{1,}\'\}/gm;
  const templateKeys = string.match(re);
  const templateStringParts = string.split(re);
  let template = [templateStringParts];
  templateKeys.forEach((element) => {
    element = element.replace("${'", "").replace("'}", "");
    template.push(element);
  });
  return template;
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    let url = chrome.runtime.getURL("options.html");
    chrome.tabs.create({ url });
    chrome.storage.local.set({ pathTemplate: "Tickets/${'ticketId'}/${'filename'}" });
  };
  return true;
});

chrome.tabs.onActivated.addListener((info) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes("zendesk.com/agent/tickets/")) {
      const ticketId = tabs[0].url.split("/")[5];
      chrome.storage.local.set({
        ticketId: ticketId
      });
    };
  });
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id === tabId) {
      if (tab.url && tab.url.includes("zendesk.com/agent/tickets/")) {
        const ticketId = tabs[0].url.split("/")[5];
        chrome.storage.local.set({
          ticketId: ticketId
        });
      };
    };
  });
  return true;
});

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (item.url.includes("zendesk.com/")) {
    let pathTemplate = template`Tickets/${'ticketId'}/${'filename'}`;
    chrome.storage.local.get(['pathTemplate', 'ticketId'], (result) => {
      if (result.pathTemplate) {
        pathTemplate = template(deconstructTemplate(result.pathTemplate));
      };
      const filename = pathTemplate({ ticketId: result.ticketId, filename: item.filename });
      suggest({ filename: filename });
    });
  } else {
    suggest();
  };
  return true;
});
let ticketId = "";
let pathTemplate = template`Tickets/${'ticketId'}/${'filename'}`;

export function template(strings, ...keys) {
  return ((...values) => {
    let dict = values[values.length - 1] || {};
    if (keys.length === 0) {
      for (let i = 1; i < strings.length; i++) {
        keys.push(strings[i]);
      }
      strings = strings[0];
    }
    let result = [strings[0]];
    keys.forEach((key, i) => {
      let value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
}

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
}

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['pathTemplate'], (result) => {
    if (result.pathTemplate) {
      pathTemplate = template(deconstructTemplate(result.pathTemplate));
      console.log("created a template: " + pathTemplate({ ticketId: "111111", filename: "item.filename" }));
    } else {
      pathTemplate = template`Tickets/${'ticketId'}/${'filename'}`;
      console.log("using a default template: " + pathTemplate({ ticketId: "111111", filename: "item.filename" }));
    }
  })
  return true;
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  if ("pathTemplate" in changes) {
    pathTemplate = template(deconstructTemplate(changes.pathTemplate.newValue));
    console.log("changed a template: " + pathTemplate({ ticketId: "111111", filename: "item.filename" }));
  }
  return true;
});

chrome.tabs.onActivated.addListener((info) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes("zendesk.com/agent/tickets/")) {
      ticketId = tabs[0].url.split("/")[5];
    }
  })
  return true;
})

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id === tabId) {
      if (tab.url && tab.url.includes("zendesk.com/agent/tickets/")) {
        ticketId = tab.url.split("/")[5];
      }
    }
  })
  return true;
})

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (item.url.includes("zendesk.com/")) {
    console.log(pathTemplate);
    const filename = pathTemplate({ ticketId: ticketId, filename: item.filename });
    console.log("filename: " + filename)
    suggest({ filename: filename });
  } else {
    suggest()
  }
  return true;
});
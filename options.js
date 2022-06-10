import { template } from "./background.js";

const defaultTemplate = template`Tickets/${'ticketId'}/${'filename'}`;

function save_options() {
    var pathTemplate = document.getElementById('pathTemplate').value;
    chrome.storage.sync.set({
        pathTemplate: pathTemplate
    }, () => {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 1000);
    });
}

function restore_options() {
    const defaultTemplateString = defaultTemplate({
        ticketId: "${'ticketId'}", filename: "${'filename'}"
    });
    chrome.storage.sync.get({
        pathTemplate: defaultTemplateString
    }, (items) => {
        document.getElementById('pathTemplate').value = items.pathTemplate;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
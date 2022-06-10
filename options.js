function save_options() {
    let pathTemplate = document.getElementById('pathTemplate').value;
    chrome.storage.local.set({
        pathTemplate: pathTemplate
    }, () => {
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
};

function restore_options() {
    chrome.storage.local.get({
        pathTemplate: "Tickets/${'ticketId'}/${'filename'}"
    }, (items) => {
        document.getElementById('pathTemplate').value = items.pathTemplate;
    });
};
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
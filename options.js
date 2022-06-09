function save_options() {
    var path = document.getElementById('path').value;
    chrome.storage.sync.set({
        path: path
    }, function () {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        path: 'Tickets'
    }, function (items) {
        document.getElementById('path').value = items.path;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
function saveData(data){
    chrome.storage.sync.set({key: data}, function() {});
}

chrome.runtime.onConnect.addListener(function (port) {
    let todos = [];
    port.onMessage.addListener(function(data) {
            todos = data.filter(val=>val != "$$$delete");
        
    });
    port.onDisconnect.addListener(function() {
        var ignoreError = chrome.runtime.lastError;
        saveData(todos)
    });
})

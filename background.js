import './lib/jszip.min.js';
// import './lib/FileSaver.js';

chrome.runtime.onMessage.addListener(function(request, sender)
    {
        if (request.action == 'import_jszip') {
            import_jszip(sender);
        }
    });


function import_jszip(sender)
{
    console.log('WOW');
    chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: ["./lib/jszip.min.js"]});

        
    var zip = new JSZip();
    zip.file("Hello.txt", "Hello World\n");
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js
        saveAs(content, "example.zip");
    });
}

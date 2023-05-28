import './lib/jszip.min.js';
// import { saveAs } from './lib/FileSaver.js';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
    {
        if (request.action == 'import_jszip') {
            var zip = jszip_dwn(request);
            console.log(zip)
            sendResponse(zip);
        }
    });


function jszip_dwn(request)
{
    console.log('WOW');
    // chrome.scripting.executeScript({
    //     target: { tabId: sender.tab.id },
    //     files: ["./lib/jszip.min.js"]});

    console.log(request.content) 
    var zip = new JSZip();
    zip.file("test.txt", request.content);
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        return content;
        // // see FileSaver.js
        // console.log(content);
        // saveAs(content, "example.zip");
        // let a = document.createElement('a');
        // let url = URL.createObjectURL(content);
        // a.setAttribute('href', url);
        // a.setAttribute('download', this);
        // a.click();
    });
}



function download(url, filename) {
    fetch(url, {
        mode: 'no-cors' 
        /*
        * ALTERNATIVE MODE {
        mode: 'cors'
        }
        *
        */
    }).then((transfer) => {
        return transfer.blob();                 // RETURN DATA TRANSFERED AS BLOB
    }).then((bytes) => {
        let elm = document.createElement('a');  // CREATE A LINK ELEMENT IN DOM
        elm.href = URL.createObjectURL(bytes);  // SET LINK ELEMENTS CONTENTS
        elm.setAttribute('download', filename); // SET ELEMENT CREATED 'ATTRIBUTE' TO DOWNLOAD, FILENAME PARAM AUTOMATICALLY
        elm.click()                             // TRIGGER ELEMENT TO DOWNLOAD
    }).catch((error) => {
        console.log(error);                     // OUTPUT ERRORS, SUCH AS CORS WHEN TESTING NON LOCALLY
    })
}
undefined
 let zip = new Blob(['l'], { type: 'text/plain' });
    let url = URL.createObjectURL(zip);
undefined
download(url, 'test.zip');





chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // Create a zip file using JSZip
    var zip = new JSZip();
    
    // Extract the images and text from the message
    var images = message.images;
    var text = message.text;
    
    // Add images to the zip
    images.forEach(function (imageUrl, index) {
    fetch(imageUrl)
    .then(function (response) {
    return response.blob();
    })
    .then(function (blob) {
    zip.file("image" + (index + 1) + ".jpg", blob);
    
    // Check if all images have been added to the zip
    if (index === images.length - 1) {
    // Add the text file to the zip
    zip.file("text.txt", text);
    
    // Generate the zip file asynchronously
    zip.generateAsync({ type: "blob" }).then(function (content) {
    // Send the response blob back to the content script
    sendResponse({ zipResponseBlob: content });
    });
    }
    });
    });
    
    // Return true to indicate that the sendResponse callback will be called asynchronously
    return true;
    });

    function sendMessageToBackground() {
        // Create an array of image URLs
        var imageUrls = ["https://example.com/image1.jpg", "https://example.com/image2.jpg"];
        
        // Create a string
        var myString = "This is my string.";
        
        // Send the message to the background script
        chrome.runtime.sendMessage({ images: imageUrls, text: myString }, function (response) {
        console.log("Response from background script:", response);
        });
        }
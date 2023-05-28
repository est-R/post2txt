import './lib/jszip.min.js';

// function jszip(request)
// {
//     console.log('WOW');

//     console.log(request.content) 
//     var zip = new JSZip();
//     zip.file("test.txt", request.content);
//     zip.generateAsync({type:"blob"})
//     .then(function(content) {
//         return content;

//     });
// }

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (request.action != 'jszip')
    {return false}
    
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
  
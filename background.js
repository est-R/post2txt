import './lib/jszip.min.js';

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action != 'jszip') { return false }
  // Create a zip file using JSZip
  var zip = new JSZip();
  // Extract the images and text from the message
  var images = message.images;
  var text = message.text;
  // Add images to the zip
  images.forEach(function (imageUrl, index) {
    console.log("3");
    console.log("Index: " + index);
    fetch(imageUrl)
      .then(function (response) {
        return response.blob();
      })
      .then(function (blob) {
        zip.file("image" + (index + 1) + ".jpg", blob, { base64: true });
        // Check if all images have been added to the zip
        if (index === images.length - 1) {
          // Add the text file to the zip
          zip.file("text.txt", text);
          zip.generateAsync({ type: "blob" }).then(function (content) {
            // Send the response blob back to the content script
            blobToBase64(content)
              .then(base64String => { console.log(base64String); sendResponse({ zip: base64String }) });
          });
        }
      });
  });
  console.log("4");
  return true;
});


// Function to convert Blob to Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
import './lib/jszip.min.js';

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action != 'jszip') { return false }
  // Create a zip file using JSZip
  var zip = new JSZip();
  // Extract the images and text from the message
  var images = message.images;
  var text = message.text;
  // Add images to the zip
  Promise.all(images.map(async function (imageUrl, index) {
    console.log("Status: 3");
    console.log("Index: " + index);
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob();
      zip.file("image" + (index + 1) + ".jpg", blob, { base64: true });
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  })).then(async function () {
    zip.file("text.txt", text);
    const content = await zip.generateAsync({ type: "blob" });
    // Send the response blob back to the content script
    const base64String = await blobToBase64(content);
    console.log(base64String);
    sendResponse({ zip: base64String });
  }).catch(function (error) {
    console.error('Error processing images:', error);
  });
  console.log("Status: 4");
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

// Wait
function wait(milliseconds){
  return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
  });
}
// Default
var SETTINGS =
{
    language: 'en',
    vkText: true,
    vkImages: true,
    tumblrText: true,
    tumblrImages: true
}

//
const ACTIVE_SITE = location.host;
const CSS_MAP = getCssMap();
var textToggle = true;
var imagesToggle = true;

var LOCALIZATION;
(async function () {
    await getSettings(SETTINGS);
    // console.log(SETTINGS);
    await loadLocalization().then(() => {
    });
}()).then(
    setInterval(async () => {
        await getSettings(SETTINGS);
        btn_inject_base();
    }, 3000)
);

///////////////

// ====ButtonInjection
function btn_inject_base() {
    let posts = document.querySelectorAll('.' + CSS_MAP.post[0]);
    // console.log(posts);

    switch (ACTIVE_SITE) {
        case ('vk.com'):
            {
                textToggle = SETTINGS.vkText;
                imagesToggle = SETTINGS.vkImages;
                posts.forEach(post => inject_vk(post));
                break;
            }
        case ('www.tumblr.com'):
            {
                textToggle = SETTINGS.tumblrText;
                imagesToggle = SETTINGS.tumblrImages;
                posts.forEach(post => inject_tumblr(post));
                break;
            }
    }
}

function inject_vk(post) {
    // console.log('Inject');

    if (post.hasAttribute('postsaver_id'))
    {
        checkLang(post);
        return;
    }

    post.setAttribute('postsaver_id', Math.random().toString(16).slice(2)) // Generate custom post id
    post.setAttribute('postsaver_lang', SETTINGS.language);

    var postText = post.querySelectorAll('.' + CSS_MAP.postText)[0];
    if (postText) {
        postText.classList.add('postsaver_postText');
    }

    var buttonContainer = post.querySelectorAll('.' + CSS_MAP.buttonContainer)[0]; // [2], because anything in footer of a post has the same class
    if (buttonContainer == null) {
        return;
    }

    var btn = document.createElement('a');
    btn.innerHTML += LOCALIZATION[SETTINGS.language].Download;
    btn.classList.add(CSS_MAP.buttonStyle);
    btn.classList.add('postsaver_btn');
    buttonContainer.appendChild(btn);
    buttonContainer.querySelectorAll(".postsaver_btn")[0].addEventListener("click", btn_save);
}

function inject_tumblr(post) {
    if (post.hasAttribute('postsaver_id') && post.querySelectorAll(".postsaver_btn").length > 0)
    {
        checkLang(post);
        return;
    }

    var buttonContainer = post.querySelector(CSS_MAP.buttonContainer[1]);
    if (buttonContainer == null) {
        return;
    }

    var btn = document.createElement('div');
    btn.innerHTML += LOCALIZATION[SETTINGS.language].Download;
    btn.style.cursor = 'pointer';
    btn.classList.add(CSS_MAP.buttonStyle);
    btn.classList.add('postsaver_btn');


    var btnWrapper = buttonContainer.querySelectorAll('.' + CSS_MAP.buttonWrapper[1]);
    btnWrapper = Array.from(btnWrapper).pop().querySelector('.' + CSS_MAP.buttonWrapper[0]);
    btnWrapper.appendChild(btn);
    btnWrapper.querySelectorAll(".postsaver_btn")[0].addEventListener("click", btn_save);

    
    post.setAttribute('postsaver_id', Math.random().toString(16).slice(2)) // Generate custom post id
    post.setAttribute('postsaver_lang', SETTINGS.language);
    var postText = post.querySelectorAll('.' + CSS_MAP.postText);
    if (postText) {
        postText.forEach(textBlock => {textBlock.classList.add('postsaver_postText')});
    }
    // console.log("INJECTED TMBLR");

}

// ====SAVE
function btn_save() {
    if (!textToggle && !imagesToggle) return;

    var postText = '';
    var postTextRAW = '';
    var post = this.closest('.' + CSS_MAP.post[0]);

    if (textToggle && post !== null) {
        postTextRAW = this.closest('.' + CSS_MAP.post[0]).querySelectorAll(".postsaver_postText");
        postText = processText(textConvertRaw2Str(postTextRAW));
    }

    var imageUrls = getImageUrls(this.closest('.' + CSS_MAP.post[0]).querySelector('.' + CSS_MAP.postContent[0]).querySelectorAll("img"));

    console.log('img 2: ' + imageUrls);

    if (imagesToggle && imageUrls.length > 0)
    {
    // Send the message to the background script
    chrome.runtime.sendMessage({ action: "jszip", images: imageUrls, text: postText },
        function (response) {
            const zipBlob = base64ToBlob(response.zip)
            const url = URL.createObjectURL(zipBlob);
            download(url, "post.zip");
        });
    } else if (textToggle) {
        if (postText === '') return;

        console.log(postText);
        const txtBlob = new Blob([postText], { type: "text/plain" });
        const textUrl = URL.createObjectURL(txtBlob);
        download(textUrl, "post.txt");
    }
}


function textConvertRaw2Str(textNodelist)
{
    let processedText = '';

    textNodelist.forEach(textBlock => {
        processedText += textBlock.innerHTML + "\n\n"
    })

    return processedText;
}


function processText(text) {
    let result = text.replaceAll("<br>", "\n");
    let div = document.createElement('div');
    div.innerHTML = result;
    result = div.textContent;
    return result;

    // + <a>
}


// ====Tech
function getCssMap() {
    let css_map = {};

    switch (ACTIVE_SITE) {
        case "www.tumblr.com":
            css_map = {
                mainFeed: ['j8ha0', 'gPQR5', 'FGfuE'],
                post: ['rZlUD', 'KYCZY', 'F4Tcn'],
                img: ['RoN4R', 'tPU70', 'xhGbM'],
                imgSource: 'eqBap',
                buttonContainer: ['tOKgq', 'footer'],
                buttonMenuStyle: 'X1uIE',
                buttonMenu: 'iaJAj',
                buttonStyle: 'sfGru',
                buttonWrapper: ['MCavR', 'm5KTc'],
                tags: 'hAFp3',
                postContent: ['LaNUG'],
                postText: 'k31gt'
            };
            break;
        case "vk.com":
            css_map = {
                mainFeed: ['feed_rows', 'page_wall_posts'],
                post: ['_post', 'post'],
                img: ['img', 'RoN4R', 'tPU70', 'xhGbM'],
                imgSource: 'eqBap',
                buttonContainer: 'ui_actions_menu',
                buttonStyle: 'ui_actions_menu_item',
                buttonWrapper: ['ui_actions_menu_wrap'],
                postContent: ['post_info', '_post_content'],
                postText: 'wall_post_text'
            };
            break;
    }

    return css_map;
}

function throttle(func, delay) {
    let timeoutId;
    let lastExecutedTime = 0;

    return function (...args) {
        const currentTime = Date.now();

        if (currentTime - lastExecutedTime >= delay) {
            func.apply(this, args);
            lastExecutedTime = currentTime;
        }
        else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecutedTime = Date.now();
            }, delay);
        }
    };
}

function download(url, filename) {
    fetch(url, {
        mode: 'no-cors'
    }).then((transfer) => {
        return transfer.blob();
    }).then((bytes) => {
        let elm = document.createElement('a');
        elm.href = URL.createObjectURL(bytes);
        elm.setAttribute('download', filename);
        elm.click()
    }).catch((error) => {
        console.log(error);
    })
}

// Function to convert Base64 to Blob
function base64ToBlob(base64String) {
    const parts = base64String.split(';base64,');
    const data = atob(parts[1]);
    const dataLength = data.length;
    const byteArray = new Uint8Array(dataLength);

    for (let i = 0; i < dataLength; ++i) {
        byteArray[i] = data.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: "application/zip" });
    return blob;
}

function getImageUrls(imgNodes) {
    var urls = [];
    // var className;

    // console.log("ImageNodes 01: ", imgNodes);

    // If the filter fails to remove junk the replaceEscChars() will fail !!!!!!!
    // TODO: make filterlist 
    imgNodes = filterNodeList(imgNodes, "AvatarRich__img"); // imgNodes is array now
    imgNodes = filterNodeList(imgNodes, "emoji");
    imgNodes = filterNodeList(imgNodes, "image_status__statusImage");
    imgNodes = filterNodeList(imgNodes, "sticker_img");
    imgNodes = filterNodeList(imgNodes, "PhotoPrimaryAttachment__background");
    imgNodes = filterNodeList(imgNodes, "LinkImage-module__photo--Fjw9c");
    imgNodes = filterNodeList(imgNodes, "Overlay-module__root--FzKhf");
    
    // console.log("ImageNodes 02: ", imgNodes);

    imgNodes.forEach(img => {
        // console.log("IMG: ", img);

        // try/catch here probably makes filterNodeList() unnecessary
        try {
            switch (ACTIVE_SITE) {
                case ('vk.com'):
                    {
                        const imgString = replaceEscChars(img.parentNode.getAttribute("data-options"));
                        const imgJson = JSON.parse(imgString);
                        console.log(imgJson);
                        urls.push(getBestResolutionSource(imgJson));
                        break;
                    }
                case ('www.tumblr.com'):
                    {
                        const imgString = replaceEscChars(img.getAttribute("srcset"));
                        let url = "https" + imgString.split('https').pop();
                        url = url.split(' ').shift();
                        urls.push(url);
                        break;
                    }
            }
        }
        catch {
            return;
        }
    });
    // console.log("URLS: " + urls);
    return urls;
}

// Removes element from node list if there is a match
function filterNodeList(nodeList, className) {
    var newlist = Array.from(nodeList);

    for (let i = newlist.length - 1; i >= 0; i--) {
        const element = newlist[i];
        if (element.classList.contains(className)) {
            const index = newlist.indexOf(element);
            if (index > -1) {
                newlist.splice(index, 1);
            }
        }
    }
    return newlist;
}

function replaceEscChars(string) {
    let replacements = {
      "&amp;" : "&",
      "&lt;" : "<",
      "&gt;" : ">",
      "&quot;" : '"',
      "&apos;" : "'"
    }
    return string.replaceAll(/(&amp;|&lt;|&gt;|&quot;|&apos;)/gi, function(replTo) {
      return replacements[replTo];
    });
    }


// // Localization and storage
// function openLocalizationFile(lang)
// {
//     return new Promise((resolve, reject) => {
//         fetch(chrome.runtime.getURL('localization/' + lang + '.json'))
//           .then(response => response.json())
//           .then(data => resolve(data))
//           .catch(error => reject(error));
//       });
// }

async function loadLocalization() {
    chrome.runtime.sendMessage({message: 'loadLocalization'}, response => {
        LOCALIZATION = response.data;
    });
}

async function getSettings() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({message: 'getSettings', settings: SETTINGS}, response => {
        resolve(response.data);
      });
    }).then((data) => {
        for (let elem in data)
        {
            SETTINGS[elem] = data[elem];
        }}
    );
  }

  function checkLang(post)
  {
    const button = post.querySelector(".postsaver_btn");
    
    if (!button && !post.hasAttribute('postsaver_lang'))
    {
        return;
    }

    if (post.getAttribute('postsaver_lang') !== SETTINGS.language)
    {
        post.setAttribute('postsaver_lang', SETTINGS.language);
        button.innerHTML = LOCALIZATION[SETTINGS.language].Download;
    }
  }

  function getBestResolutionSource(json) {
    var resolutions = ['w_', 'z_', 'y_', 'x_']

    for (let i = 0; i < resolutions.length; i++) {
        if (json.temp[resolutions[i]] !== undefined) {
            return json.temp[resolutions[i]];
        }
    }

    return '';
}

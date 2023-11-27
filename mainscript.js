// const settings = {
// 	'context_menu': true,
// 	'hide_filtered_content': false,
// };

const ACTIVE_SITE = location.host;
const CSS_MAP = getCssMap();
var LOCALIZATION;
loadLocalization('ru');

setInterval(function()
{
    // console.log("WORKING");
    btn_inject_base();
}, 5000);

// ====MainApp
btn_inject_base();


///////////////

// ====ButtonInjection
function btn_inject_base() {
    let posts = document.querySelectorAll('.' + CSS_MAP.post[0]);
    // console.log(posts);

    switch (ACTIVE_SITE) {
        case ('vk.com'):
            {
                posts.forEach(post => inject_vk(post));
                break;
            }
        case ('www.tumblr.com'):
            {
                posts.forEach(post => inject_tumblr(post));
                break;
            }
    }
}

function inject_vk(post) {
    // console.log('Inject');

    if (post.hasAttribute('postsaver_id'))
    {
        return;
    }

    post.setAttribute('postsaver_id', Math.random().toString(16).slice(2)) // Generate custom post id
    var postText = post.querySelectorAll('.' + CSS_MAP.postText)[0];
    if (postText) {
        postText.classList.add('postsaver_postText');
    }

    var buttonContainer = post.querySelectorAll('.' + CSS_MAP.buttonContainer)[0]; // [2], because anything in footer of a post has the same class
    if (buttonContainer == null) {
        return;
    }

    var btn = document.createElement('a');
    btn.innerHTML += 'Скачать пост';
    btn.classList.add(CSS_MAP.buttonStyle);
    btn.classList.add('postsaver_btn');
    buttonContainer.appendChild(btn);
    buttonContainer.querySelectorAll(".postsaver_btn")[0].addEventListener("click", btn_save);
}

function inject_tumblr(post) {
    if (post.hasAttribute('postsaver_id'))
    {
        return;
    }

    var buttonContainer= post.querySelectorAll('.' + CSS_MAP.buttonContainer)[0];
    if (buttonContainer == null) {
        return;
    }

    var btn = document.createElement('div');
    btn.innerHTML += 'СКАЧАТЬ';
    btn.style.cursor = 'pointer';
    btn.classList.add(CSS_MAP.buttonStyle);
    btn.classList.add('postsaver_btn');
    var btnWrapper = buttonContainer.querySelector('.' + CSS_MAP.buttonWrapper[0]);
    btnWrapper.appendChild(btn);
    btnWrapper.querySelectorAll(".postsaver_btn")[0].addEventListener("click", btn_save);

    
    post.setAttribute('postsaver_id', Math.random().toString(16).slice(2)) // Generate custom post id
    var postText = post.querySelectorAll('.' + CSS_MAP.postText);
    if (postText) {
        postText.forEach(textBlock => {textBlock.classList.add('postsaver_postText')});
    }
    console.log("INJECTED TMBLR");

}

// ====SAVE
function btn_save() {
    //TODO: Uncaught TypeError: Cannot read properties of undefined (reading 'innerHTML') -> null check + tick + same for img
    var postTextRAW = this.closest('.' + CSS_MAP.post[0]).querySelectorAll(".postsaver_postText");
    
    postText = processText(textConvertRaw2Str(postTextRAW));

    // var imageUrls = ["https://static.wikia.nocookie.net/aesthetics/images/c/cd/Fantasy_World.jpg/"] // Get somehow
    // var imageUrls = getImageUrls(this.closest('.' + CSS_MAP.post[0]).querySelectorAll(img));
    var imageUrls = getImageUrls(this.closest('.' + CSS_MAP.post[0]).querySelector('.' + CSS_MAP.postContent[0]).querySelectorAll("img"));

    // Send the message to the background script
    chrome.runtime.sendMessage({ action: "jszip", images: imageUrls, text: postText },
        function (response) {
            const zipBlob = base64ToBlob(response.zip)
            const url = URL.createObjectURL(zipBlob);
            download(url, "placeholder" + ".zip");
        });
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
                buttonContainer: 'tOKgq',
                buttonMenuStyle: 'X1uIE',
                buttonMenu: 'iaJAj',
                buttonStyle: 'sfGru',
                buttonWrapper: ['MCavR', 'eIaSl'],
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

    // console.log(imgNodes);

    imgNodes = filterNodeList(imgNodes, "AvatarRich__img"); // imgNodes is array now
    imgNodes = filterNodeList(imgNodes, "emoji");
    imgNodes = filterNodeList(imgNodes, "image_status__statusImage");

    // if (/MediaGrid/.test(imgNodes[0].className))
    // {
    //     className = "MediaGrid__interactive";
    // }
    // if (/PhotoPrimaryAttachment/.test(imgNodes[0].className))
    // {
    //     className = "PhotoPrimaryAttachment__interactive";
    // }
    // console.log(imgNodes);
    // console.log(className);

    imgNodes.forEach(img => {
        console.log("IMG: " + img);
        // let imgTemp = img.closest("." + className).getAttribute("data-options");

        switch (ACTIVE_SITE) {
            case ('vk.com'):
        {
            const imgString = replaceEscChars(img.parentNode.getAttribute("data-options"));
            const imgJson = JSON.parse(imgString);
            urls.push(imgJson.temp.w_);
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
    });
    console.log("URLS: " + urls);
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


// Localization
function openLocalizationFile(lang)
{
    return new Promise((resolve, reject) => {
        fetch(chrome.runtime.getURL('localization/' + lang + '.json'))
          .then(response => response.json())
          .then(data => resolve(data))
          .catch(error => reject(error));
      });
}

async function loadLocalization(lang) {
    try {
      const data = await openLocalizationFile(lang);
      LOCALIZATION = data;
    } catch (error) {
        console.log("Failed to load localization file");
    }
  }

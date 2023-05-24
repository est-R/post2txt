// const settings = {
// 	'context_menu': true,
// 	'hide_filtered_content': false,
// };

chrome.runtime.sendMessage({action: 'import_jszip'});
// testZip();

const ACTIVE_SITE = location.host;
const CSS_MAP = getCssMap();

// MainApp
// const throttledInject = throttle(btn_inject_base, 200);
// if (location.host + location.pathname == "vk.com/feed") { btnFeedClass = 0 }
// else { btnFeedClass = 1 };
document.addEventListener("DOMContentLoaded", () => {document.querySelectorAll(CSS_MAP.mainFeed[0])[0].addEventListener('DOMSubtreeModified', throttle(btn_inject_base, 200))});
// document.addEventListener("DOMContentLoaded", btn_inject_base);
// document.querySelectorAll('.' + CSS_MAP.mainFeed[0])[0].addEventListener('DOMSubtreeModified', throttle(btn_inject_base, 200));
btn_inject_base();


// ButtonInjection
function btn_inject_base() {
    let posts = document.querySelectorAll('.' + CSS_MAP.post[0]);

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

// Button injection

function inject_vk(post) {
    post.setAttribute('postsaver_id:', Math.random().toString(16).slice(2)) // Generate custom post id
    var postText = post.querySelectorAll('.' + CSS_MAP.postText)[0];
    if (postText)
    {
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
    post.setAttribute('postsaver_id:', Math.random().toString(16).slice(2)) // Generate custom post id
    var buttonContainer = post.querySelectorAll('.' + CSS_MAP.buttonContainer)[2]; // [2], because anything in footer of a post has the same class
    if (buttonContainer == null) {
        return;
    }

    var btn = document.createElement('div');
    btn.innerHTML += 'SAVE';
    btn.classList.add(CSS_MAP.buttonStyle);
    btn.classList.add('postsaver_btn');
    buttonContainer.appendChild(btn);
    buttonContainer.querySelectorAll(".postsaver_btn")[0].addEventListener("click", btn_save);
}


function btn_save() {
    var postText = this.closest('.' + CSS_MAP.post[0]).querySelectorAll('.' + CSS_MAP.postText)[0].innerHTML;
    postText = processText(postText);
    alert(postText);
    //save string as file
    let a = document.createElement('a');
    let blob = new Blob([postText], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', this);
    a.click();
}


function processText(text) {
    let result = text.replaceAll("<br>", "\n");
    let div = document.createElement('div');
    div.innerHTML = result;
    result = div.textContent;
    return result;

    // + <a>
}


// Tech
function getCssMap() {
    let css_map = {};

    switch (ACTIVE_SITE) {
        case "www.tumblr.com":
            css_map = {
                mainFeed: ['j8ha0', 'gPQR5', 'FGfuE'],
                post: 'FtjPK',
                img: ['RoN4R', 'tPU70', 'xhGbM'],
                imgSource: 'eqBap',
                buttonContainer: 'MCavR',
                buttonStyle: 'sfGru',
                buttonWrapper: ['tOKgq', 'eIaSl'],
                tags: 'hAFp3',
                postText: 'k31gt'
            };
            break;
        case "vk.com":
            css_map = {
                mainFeed: ['feed_rows', 'page_wall_posts'],
                post: ['_post', 'post'],
                img: ['RoN4R', 'tPU70', 'xhGbM'],
                imgSource: 'eqBap',
                buttonContainer: 'ui_actions_menu',
                buttonStyle: 'ui_actions_menu_item',
                buttonWrapper: ['ui_actions_menu_wrap'],
                postContent: '_post_content',
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

// function testZip()
// {
//     var zip = new JSZip();
// zip.file("Hello.txt", "Hello World\n");
// var img = zip.folder("images");
// img.file("smile.gif", imgData, {base64: true});
// zip.generateAsync({type:"blob"})
// .then(function(content) {
//     // see FileSaver.js
//     saveAs(content, "example.zip");
// });
// }
//TODO: Track page change? When URL change https://vk.com/feed resetr first_scan | FOR VK
// Tumblrr, Facebook, blogpost, twitter, instagramm

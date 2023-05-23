// const settings = {
// 	'context_menu': true,
// 	'hide_filtered_content': false,
// };

const ACTIVE_SITE = location.host;
const CSS_MAP = getCssMap();

// MainApp
// document.addEventListener("DOMContentLoaded", () => {document.querySelectorAll('.' + CSS_MAP.mainFeed[0])[0].addEventListener('DOMSubtreeModified', btn_inject_base);});
// document.addEventListener("DOMContentLoaded", btn_inject_base);
// document.querySelectorAll('.' + CSS_MAP.mainFeed[0])[0].addEventListener('DOMSubtreeModified', btn_inject_base);
btn_inject_base();


// ButtonInjection
function btn_inject_base() {
    let posts = document.querySelectorAll('.' + CSS_MAP.post);

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
    // 4 if there is no '-'
    let postID = post.id.replace(/[^\d_]/g, '');
    let btnID = "postsaver_btn-" + postID;
    if (post.getElementsByClassName("postsaver_btn")[0]) { return; }

    post.querySelectorAll(".ui_actions_menu")[0].innerHTML += '<a class="ui_actions_menu_item postsaver_btn ' + btnID + '">Скачать пост</a>';
    post.querySelectorAll(".postsaver_btn")[0].addEventListener("click", btn_save);
}

function inject_tumblr(post) {
    post.setAttribute('postsaver_id:', Math.random().toString(16).slice(2)) // Generate custom post id
    var buttonContainer = post.querySelectorAll('.' + CSS_MAP.buttonContainer)[2]; // [2], because anything in footer of a post has the same class
    if (buttonContainer == null)
    {
        return;
    }

    var btn = document.createElement('div');
    btn.innerHTML += 'SAVE';
    btn.classList.add(CSS_MAP.buttonStyle);
    btn.classList.add('postsaver_btn');
    buttonContainer.appendChild(btn);
    buttonContainer.querySelectorAll(".postsaver_btn")[0].addEventListener("click", btn_save); 
}


function btn_save(post) {
    var postText = this.innerHTML;
    postText = processText(postText);
    alert(postText);
    //save string as file
    let a = document.createElement('a');
    let blob = new Blob([postText], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', postID);
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
                mainFeed: ['feed_rows'],
                post: 'wall_post_text',
                img: ['RoN4R', 'tPU70', 'xhGbM'],
                imgSource: 'eqBap',
                buttonContainer: 'MCavR',
                buttonStyle: 'sfGru',
                buttonWrapper: ['tOKgq', 'eIaSl'],
                tags: 'hAFp3',
                postText: 'wall_post_text'
            };
            break;
    }

    return css_map;
}




//TODO: Track page change? When URL change https://vk.com/feed resetr first_scan | FOR VK
// Tumblrr, Facebook, blogpost, twitter, instagramm

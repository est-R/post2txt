// Default
var settings =
{
    language: 'en',
    vkText: true,
    vkImages: true,
    tumblrText: true,
    tumblrImages: true
}


// Main
var localization;

// console.log("C0", localization);

(async function () {
    await getSettings();
    await loadLocalization().then(() => {
        console.log(settings.language);
        switchLanguage(settings.language);
        loadUI();
    });
}());

document.getElementById("lang_wrapper").getElementsByClassName("lang-en")[0].addEventListener("click", function () { setLanguage('en'); });
document.getElementById("lang_wrapper").getElementsByClassName("lang-ru")[0].addEventListener("click", function () { setLanguage('ru'); });
document.querySelectorAll(".table_toggleable").forEach(element => {
    element.addEventListener("click", function () { toggleUIauto(this); });
});


// Funcs

function toggleUIauto(div)
{
    //has class --on
    let target = div.classList.contains('table_toggleable--off');
    setSetting(div.getAttribute("option"), target);
    getSettings();
    toggleUI(div, target);
}

function toggleUI(div, target)
{
    if (target)
    {
        div.classList.replace('table_toggleable--off', 'table_toggleable--on');
        div.setAttribute("data-trans", "ON");
        div.textContent = localization[settings.language].ON;
    }
    else
    {
        div.classList.replace('table_toggleable--on', 'table_toggleable--off');
        div.setAttribute("data-trans", "OFF");
        div.textContent = localization[settings.language].OFF;
    }
}

// Adds the record to chrome extention settings
// AND localizes the interface
function setLanguage(lang) {
    setSetting('language', lang, async function () {
        await getSettings().then(() => {
            loadUI();
            switchLanguage(lang);
        })
    });
};

// Localizes the interface.
function switchLanguage(lang) {
    // console.log("C2", localization);

    var elements = document.querySelectorAll('[data-trans]');
    for (var i = 0; i < elements.length; i++) {
        var key = elements[i].getAttribute('data-trans');
        // console.log("C2-2", lang, key);
        elements[i].textContent = localization[lang][key];
    }
}

function switchLanguageSingle(div, lang)
{
    var key = div.getAttribute('data-trans');
    div.textContent = localization[lang][key];
}

async function getSettings() {
    for (let elem in settings) {
        chrome.storage.sync.get(elem, function (data) {
            if (data[elem] === undefined) { return }

            settings[elem] = data[elem];
        })
    }
}

function setSetting(settingName, value, callback) {
    let obj = {};
    obj[settingName] = value;
    chrome.storage.sync.set(obj, callback);
}

async function loadLocalization() {
    const response = await fetch(chrome.runtime.getURL('/assets/localization.json'));
    localization = await response.json();
}

// Changes the placeholders to the content depending on settings
function loadUI()
{
    document.querySelectorAll(".table_toggleable").forEach(element => {
        if (element.classList.contains('vkText'))
        {
            toggleUI(element, settings.vkText);
        }

        if (element.classList.contains('vkImages'))
        {
            toggleUI(element, settings.vkImages);
        }

        if (element.classList.contains('tumblrText'))
        {
            toggleUI(element, settings.tumblrText);
        }

        if (element.classList.contains('tumblrImages'))
        {
            toggleUI(element, settings.tumblrImages);
        }
    });
}



// function loadLocalization(lang)
// {
//     const json = require('localization/' + lang + '.json');

//     return json;
// }
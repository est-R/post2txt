// Default
var settings =
{
    language: 'en',
    vkText: true,
    vkImage: true,
    tumblrText: true,
    tumblrImage: true
}


// Main
var localization;

console.log("C0", localization);

(async function() {
    await getSettings();
    await loadLocalization();

    console.log("C1", settings.language);
    
    switchLanguage(settings.language);

}());

document.getElementById("lang-wrapper").getElementsByClassName("lang-en")[0].addEventListener("click", function () { setLanguage('en'); });
document.getElementById("lang-wrapper").getElementsByClassName("lang-ru")[0].addEventListener("click", function () { setLanguage('ru'); });


// Funcs
function setLanguage(lang) {
    setSetting('language', lang, function() {
        switchLanguage(lang);
        chrome.storage.sync.get(null, function(settings) {
            console.log('Settings: ', settings);
        });
    });
}

function switchLanguage(lang) {
    console.log("C2", localization);

    var elements = document.querySelectorAll('[data-trans]');
    for (var i = 0; i < elements.length; i++) {
        var key = elements[i].getAttribute('data-trans');
        console.log("C2-2", lang, key);
        elements[i].textContent = localization[lang][key];
    }
}

// function loadLocalization(lang)
// {
//     const json = require('localization/' + lang + '.json');

//     return json;
// }


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
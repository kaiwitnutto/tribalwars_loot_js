// Constants
const version = "1.13.1 Fixed By Ibra";
const scriptName = "LA Enhancer (1.13.1) - Fixed by Ibra Gonza II";
const scriptURL = "https://scripts.ibragonza.nl/enhancer/";
const updateNotesURL = "https://forum.tribalwars.net/index.php?threads/ntoombs19s-fa-filter.266604/page-15#post-7053294";

// Flags and Settings
let working = true;
let filtersApplied = false;
let cansend = true;
let keySetMode = false;
let editingKey = false;
let reason = [];

// Determine if the player is a sitter
const sitter = window.top.game_data.player.sitter !== "0" ? `t=${window.top.game_data.player.id}&` : "";

// Links and Paths
const link = [
    `https://${window.location.host}/game.php?${sitter}village=`,
    "&screen=am_farm"
];

// Key Codes
const keycodes = { a: 65, b: 66, c: 67, skip: 83, right: 39, left: 37, master: 77 };

// Load External Resources
const loadResources = async () => {
    try {
        await loadScript(`${scriptURL}lib/jstorage.js`);
        await loadScript(`${scriptURL}resources.js`);

        const language = window.top.$.jStorage.get("language") || setDefaultLanguage();
        await loadScript(`${scriptURL}lang/${language}.js`);
        console.log("Initialization complete");
        checkPage();
    } catch (error) {
        console.error("Error loading resources: ", error);
    }
};

// Helper function to load a script
const loadScript = (url) => {
    return new Promise((resolve, reject) => {
        window.top.$.getScript(url, () => resolve()).fail(() => reject(`Failed to load script: ${url}`));
    });
};

// Function to run the main script
const run = () => {
    console.log("Running script...");
    checkVersion();
    setVersion();
    makeItPretty();
    showSettings();
    turnOnHotkeys();

    if (userset[s.enable_auto_run] !== false) {
        applySettings();
    }
};

// Check if the current version is the latest
const checkVersion = () => {
    if (getVersion() !== version) {
        const message = `This script has recently been updated to version <strong>${version}</strong>.<br/><br/><a href='${updateNotesURL}' target='_blank'>See what's new</a>`;
        Dialog.show("update_dialog", message);
        clearProfilesIfNeeded();
    }
};

// Clear profiles if required by the update
const clearProfilesIfNeeded = () => {
    if (clearProfiles) {
        const profileList = window.top.$.jStorage.get("profileList");
        profileList.forEach(val => window.top.$.jStorage.deleteKey(`profile:${val}`));
        window.top.$.jStorage.set("keyPressSettings", keyPressSettings);
        console.log("Profiles cleared due to update.");
    }
};

// Set the current version in storage
const setVersion = () => {
    window.top.$.jStorage.set("version", version);
};

// Get the current version from storage
const getVersion = () => {
    return window.top.$.jStorage.get("version") || setVersion();
};

// Load the default language based on domain
const setDefaultLanguage = () => {
    const domain = window.location.hostname.split(".").slice(-1)[0];
    let lang = "en";
    switch (domain) {
        case "gr":
            lang = "el";
            break;
        case "it":
            lang = "it";
            break;
        case "es":
            lang = "es";
            break;
        case "ae":
            lang = "ar";
            break;
    }
    window.top.$.jStorage.set("language", lang);
    return lang;
};

// Check if the current page is correct, if not redirect
const checkPage = () => {
    if (window.top.game_data.screen !== 'am_farm') {
        getFA();
    } else {
        run();
    }
};

// Redirect to the Farming Assistant
const getFA = () => {
    console.log("Redirecting to Farming Assistant...");
    fadeThanksToCheese();
    openLoader();
    const vlink = `${link[0]}${window.top.game_data.village.id}${link[1]}`;
    window.top.$.getScript("https://" + window.top.location.host + "/js/game/Accountmanager.js", () => {
        window.top.$.ajax({
            type: "GET",
            url: vlink,
            dataType: "html",
            success: handleFASuccess,
            error: (xhr, statusText, error) => {
                alert(`Error getting LA: ${error}`);
                removeLoader();
            }
        });
    });
};

// Handle success in loading Farming Assistant page
const handleFASuccess = (data) => {
    const v = window.top.$(data);
    const title = /<title>([^<]+)<\/title>/g.exec(data)[1];
    const newGameData = JSON.parse(data.split("TribalWars.updateGameData(")[1].split(");")[0]);
    window.top.game_data = newGameData;
    
    if (history.pushState) {
        history.pushState({}, `${window.top.game_data.village.name} - Loot Assistant`, `https://${window.top.location.host}${game_data.link_base_pure}am_farm`);
    }

    updatePageContent(v, title);
    removeLoader();
    run();
};

// Update the page content
const updatePageContent = (v, title) => {
    window.top.$('#header_info').html(v.find('#header_info').html());
    window.top.$('#topContainer').html(v.find('#topContainer').html());
    window.top.$('#contentContainer').html(v.find('#contentContainer').html());
    window.top.$('head').find('title').html(title);
};

// Fade and loader functions
const fadeThanksToCheese = () => {
    const fader = document.createElement('div');
    fader.id = 'fader';
    fader.style = `position: fixed; height: 100%; width: 100%; background-color: black; top: 0; left: 0; opacity: 0.6; z-index: 12000;`;
    document.body.appendChild(fader);
};

const openLoader = () => {
    const widget = document.createElement('div');
    widget.id = 'loaders';
    widget.style = `position: fixed; width: 24px; height: 24px; top: 50%; left: 50%; margin-left: -12px; margin-top: -12px; z-index: 13000;`;
    widget.innerHTML = "<img src='graphic/throbber.gif' height='24' width='24'>";
    document.body.appendChild(widget);
};

const removeLoader = () => {
    window.top.$('#fader').remove();
    window.top.$('#loaders').remove();
};

// Helper function to remove loader
const makeItPretty = () => {
    window.top.$('.row_a').css("background-color", "rgb(216, 255, 216)");
    window.top.$('#plunder_list tr').eq(0).remove();
    window.top.$('#plunder_list').find('tr:gt(0)').each((index, element) => {
        window.top.$(element).removeClass('row_a row_b');
        if (index % 2 === 0) {
            window.top.$(element).addClass('row_a');
        } else {
            window.top.$(element).addClass('row_b');
        }
    });
    hideStuffs();
    console.log("Styled page elements.");
};

// Hide unnecessary elements
const hideStuffs = () => {
    window.top.$('#plunder_list').hide();
    window.top.$('#plunder_list_nav').hide();
    window.top.$('#contentContainer').find('div[class="vis"]').eq(0).children().eq(0).append(window.top.$("<div class='vis' style='float:right;text-align:center;line-height:100%;width:12px;height:12px;margin:0px 0px 0px 0px;position:relative;background-color:tan;opacity:.7'><a href='#' num='0' onclick='uglyHider(window.top.$(this));return false;'>+</a></div>"));
    window.top.$('#contentContainer').find('div[class="vis"]').eq(0).children().eq(1).hide();
    window.top.$('#am_widget_Farm').find('h4').eq(0).append(window.top.$("<div class='vis' style='float:right;text-align:center;line-height:100%;width:12px;height:12px;margin:0px 0px 0px 0px;position:relative;background-color:tan;opacity:.7'><a href='#' num='1' onclick='uglyHider(window.top.$(this));return false;'>+</a></div>"));
    window.top.$('#plunder_list_filters').hide();
};

// Hide or show sections
const uglyHider = (linker) => {
    let basd;
    if (window.top.$('#settingsBody').length > 0) {
        basd = 2;
    } else {
        basd = 1;
    }
    window.top.$(linker).text(window.top.$(linker).text() === "+" ? "-" : "+");
    switch (parseInt(window.top.$(linker).attr('num'), 10)) {
        case 0:
            window.top.$('#contentContainer').find('div[class="vis"]').eq(basd).children().eq(1).toggle();
            break;
        case 1:
            window.top.$('#plunder_list_filters').toggle();
            break;
        case 2:
            window.top.$('#settingsBody').toggle();
            break;
    }
};

// Initiate the script loading
loadResources();

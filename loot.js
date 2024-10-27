const version = "1.14.0 Updated by Kaiwit";
const scriptName = "LA Enhancer (1.14.0) - Updated by Kaiwit";
const scriptURL = "https://scripts.ibragonza.nl/enhancer/";
const updateNotesURL = "https://forum.tribalwars.net/index.php?threads/ntoombs19s-fa-filter.266604/page-15#post-7053294";

let scriptStatus = {
  working: true,
  resourcesLoaded: false,
  scriptLoaded: false,
  pagesLoaded: false,
  filtersApplied: false,
  canSend: true,
  keySetMode: false,
};

let keycodes = {"a": 65, "b": 66, "c": 67, "skip": 83, "right": 39, "left": 37, "master": 77};

const setupScripts = async () => {
  try {
    await loadScript(scriptURL + 'lib/jstorage.js');
    await loadScript(scriptURL + 'resources.js');
    const language = window.top.$.jStorage.get("language") || setDefaultLanguage();
    await loadScript(scriptURL + `lang/${language}.js`);
    await loadScript(scriptURL + 'notify.js');
    initialize();
  } catch (error) {
    console.error("Error loading scripts: ", error);
  }
};

const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    window.top.$.getScript(url, () => resolve()).fail((jqxhr, settings, exception) => reject(exception));
  });
};

const initialize = () => {
  console.log("Initializing script");
  checkVersion();
  updateUI();
  setupEventListeners();
};

const checkVersion = () => {
  const storedVersion = window.top.$.jStorage.get("version");
  if (storedVersion !== version) {
    window.top.$.jStorage.set("version", version);
    alert(`Script updated to version ${version}. Please check what's new at: ${updateNotesURL}`);
  }
};

const updateUI = () => {
  console.log("Updating UI...");
  makeItPretty();
  showSettings();
};

const setupEventListeners = () => {
  window.onkeydown = handleKeydown;
};

const handleKeydown = (e) => {
  const key = e.which;
  const row = window.top.$("#plunder_list tr:visible").eq(1);
  if (!scriptStatus.canSend || !scriptStatus.filtersApplied) return;

  switch (key) {
    case keycodes.a:
      tryClick(row.children("td").eq(9).children("a"));
      break;
    case keycodes.b:
      tryClick(row.children("td").eq(10).children("a"));
      break;
    case keycodes.c:
      tryClick(row.children("td").eq(11).children("a"));
      break;
    case keycodes.skip:
      row.hide();
      break;
    case keycodes.master:
      selectMasterButton(row);
      break;
    case keycodes.left:
      navigateToVillage("previous");
      break;
    case keycodes.right:
      navigateToVillage("next");
      break;
    default:
      return;
  }
  e.preventDefault();
};

const tryClick = (button) => {
  if (button.hasClass("farm_icon_disabled")) {
    console.log("Button disabled, skipping row...");
    button.closest('tr').hide();
  } else {
    button.click();
    delayNextClick();
  }
};

const delayNextClick = () => {
  scriptStatus.canSend = false;
  setTimeout(() => scriptStatus.canSend = true, 200);
};

const makeItPretty = () => {
  console.log("Applying custom styles...");
  window.top.$('.row_a').css("background-color", "rgb(216, 255, 216)");
  const plunderList = window.top.$('#plunder_list');
  plunderList.find('tr:gt(0)').each((index, row) => {
    window.top.$(row).removeClass('row_a row_b').addClass(index % 2 === 0 ? 'row_a' : 'row_b');
  });
  hideElements();
};

const hideElements = () => {
  window.top.$('#plunder_list, #plunder_list_nav, #plunder_list_filters').hide();
};

const selectMasterButton = (row) => {
  // Logic for selecting the master button based on profile priority settings.
  console.log("Selecting master button...");
  tryClick(row.children("td").eq(9).children("a"));
};

setupScripts();

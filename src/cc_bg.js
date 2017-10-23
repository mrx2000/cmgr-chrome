function test2(url) {
   chrome.contentSettings['cookies'].set({
       'primaryPattern': url,
       'setting': 'block'
   });
}


/*
 * Store per-tab settings in this array for further reference
 */
var cc_tab_info = [];
function tabSettingStore(tabid, setting)
{
   cc_tab_info[tabid] = { "setting": setting };
}

function tabSettingGet(tabid)
{
   if (cc_tab_info[tabid] && cc_tab_info[tabid].setting) {
      return cc_tab_info[tabid].setting;
   }

   return "other";
}

function tabSettingDelete(tabid)
{
   delete cc_tab_info[tabid];
}


/*
chrome.browserAction.onClicked.addListener(
   function(tab) {
      // lastFocusedWindow vs currentWindow
      chrome.tabs.query({ active: true, currentWindow: true}, function(tabs) {
         console.log("Stored status for tab id [" + tabs[0].id + "] is " + tabSettingGet(tabs[0].id));
         //chrome.tabs.sendMessage(activeTab.id, {"msg": "cc_clicked"});
      });
   }
);
*/


function isWebpageURL(url)
{
   var link = document.createElement('a');
   link.setAttribute('href', url);
   if (link.protocol == "http:" || link.protocol == "https:") {
      return true;
   } else {
      return false;
   }
}


function getIconBySetting(setting)
{
   var icon = "img/icon_0.png";

   switch (setting) {
   case "allow": icon = "img/icon_v.png"; break;
   case "session_only": icon = "img/icon_s.png"; break;
   case "block": icon = "img/icon_x.png"; break;
   default: icon="img/icon_0.png"; break;
   }

   return icon;
}



function processSetting(cb)
{
   if (cb.what == "tab") {
      tabSettingStore(cb.tab.id, cb.setting);

      chrome.browserAction.setIcon({
         'path': getIconBySetting(cb.setting),
         'tabId': cb.tab.id
      });
   }
}


function processURL(cb)
{
   // set icon for tabs that load http/https pages
   // anything else gets default icon
   if (isWebpageURL(cb.url)) {
      chrome.contentSettings['cookies'].get({
          'primaryUrl': cb.url,
          'incognito': false
      },
      function(details) {
         cb.setting = details.setting;
         processSetting(cb);
      });
   } else {
      cb.setting = "other";
      processSetting(cb);
   }
}


function setTabIcon(tab)
{
   var cb = { "what": "tab", "tab": tab, "url": tab.url };
   processURL(cb);
}


/*
 * Set tab icon when a new page is loaded
 */
chrome.tabs.onUpdated.addListener(
   function (tabId, changeInfo, tab) {
      if (changeInfo.status == 'loading' && tab.active) {
         setTabIcon(tab);
      }
   }
);


chrome.tabs.onRemoved.addListener(function(tabid, removed) {
   tabSettingDelete(tabid);
})


/*
 * Set all initial tab icons on reload 
 */
chrome.tabs.query({}, function(tabs) {
   for (var i = 0; i < tabs.length; i++) {
      setTabIcon(tabs[i]);
   }
});


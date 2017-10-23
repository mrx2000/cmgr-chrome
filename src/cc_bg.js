/*
function test2(url) {
   chrome.contentSettings['cookies'].set({
       'primaryPattern': url,
       'setting': 'block'
   });
}
*/

function setCurrentInfo(pattern, setting, cbfun)
{
   var p1 = "*://*." + pattern + ":*/*";

   console.log("Pattern: " + p1);

   chrome.tabs.query({ active: true, lastFocusedWindow: true}, function(tabs) {
      var tab = tabs[0];
      chrome.contentSettings['cookies'].set({
          'primaryPattern': p1,
          'setting': setting
      }, 
      function() {
         var cb = { "what": "tab", "tab": tab, "url": tab.url, "fun": cbfun };
         processURL(cb);
      });
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


function getPatternFromURL(url)
{
   var link = document.createElement('a');
   link.setAttribute('href', url);
   if (link.protocol != "http:" && link.protocol != "https:") return null;

   var hstr = link.hostname;
   var hparts = hstr.split('.');
   var pidx = 0, plen = hparts.length;

   // require at least 2 elements for common top level domains
   // at least 3 for others
   var hlast = hparts[plen - 1].toLowerCase();
   var toplevel = [ "com", "net", "org", "tv", "gov", "mil" ]; // xxx expand?
   var minrem = 3;
   if (toplevel.indexOf(hlast) > -1) {
      minrem = 2;
   }

   // remove leading "www" and one level, if any
   if ((hparts[pidx].toLowerCase() == "www") && ((plen - pidx) > minrem)) {
      ++pidx;
   }
   if ((plen - pidx) > minrem) { ++pidx; }
   hparts.splice(0, pidx);
   var patstr = hparts.join(".")

   //console.log("Pattern: " + patstr);
   return patstr;
}



// we are currentWindow - better use lastFocusedWindow
function getCurrentInfo(cbfun)
{
   chrome.tabs.query({ active: true, lastFocusedWindow: true}, function(tabs) {
      var url = tabs[0].url;
      var setting = tabSettingGet(tabs[0].id);
      var pattern = getPatternFromURL(url);
      cbfun(url, pattern, setting);
   });
}


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


function getTitleBySetting(setting)
{
   var title = "Cookie Manager";

   switch (setting) {
   case "allow": title = "Cookies Allowed"; break;
   case "session_only": title = "Cookies Allowed for Session"; break;
   case "block": title = "Cookies Denied"; break;
   default: title="Cookie Manager"; break;
   }

   return title;
}

function getPopupBySetting(setting)
{
   var popup = "cc_popup.html";

   switch (setting) {
   case "allow": 
   case "session_only": 
   case "block": 
      popup = "cc_popup.html";
      break;
   default: 
      popup = "cc_popup0.html";
      break;
   }

   return popup;
}




function setTabInfoComplete(cb)
{
   tabSettingStore(cb.tab.id, cb.setting);

   chrome.browserAction.setIcon({
      'path': getIconBySetting(cb.setting),
      'tabId': cb.tab.id
   });

   chrome.browserAction.setTitle({
      'title': getTitleBySetting(cb.setting),
      'tabId': cb.tab.id
   });

   chrome.browserAction.setPopup({
      'popup': getPopupBySetting(cb.setting),
      'tabId': cb.tab.id
   });
   
   if (cb.fun) cb.fun();
}


/*
 * Complete processing url with the returned cookie setting
 * Return control to appropriate completion function based
 * on caller choice
 */
function processURLSetting(cb)
{
   if (cb.what == "tab") {
      setTabInfoComplete(cb);
   }
}


/*
 * Process url, pass control based on caller selector
 */
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
         processURLSetting(cb);
      });
   } else {
      cb.setting = "other";
      processURLSetting(cb);
   }
}


/*
 * set completion to "tab" and invoke url processing
 */
function setTabInfo(tab)
{
   var cb = { "what": "tab", "tab": tab, "url": tab.url, "fun": null };
   processURL(cb);
}


/*
 * Set tab icon when a new page is loaded
 */
chrome.tabs.onUpdated.addListener(
   function (tabId, changeInfo, tab) {
      if (changeInfo.status == 'loading' && tab.active) {
         setTabInfo(tab);
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
      setTabInfo(tabs[i]);
   }
});


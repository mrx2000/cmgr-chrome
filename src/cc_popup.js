var bgWindow;
var cPattern;

function popUpdateInfo()
{
   bgWindow.getCurrentInfo(function(url, pattern, setting) {
      //var div = document.getElementById("div1");
      //div.innerHTML = "URL: " + url + ", pattern: " + pattern + ", setting: " + setting;
      var pstr = document.getElementById("txt_pattern");
      pstr.innerHTML = "" + pattern;
      cPattern = pattern;

      const arr = [ "ckV", "ckS", "ckX"];
      arr.forEach(function(elem) {
         document.getElementById(elem).src = "img/notick.png";
      });

      var ckimg = null;
      switch (setting) {
      case "allow": ckimg = document.getElementById("ckV"); break;
      case "session_only": ckimg = document.getElementById("ckS"); break;
      case "block": ckimg = document.getElementById("ckX"); break;
      }
      if (ckimg) { ckimg.src = "img/tick.png"; }
   });
}


var popOnRowClickComplete = function()
{
   popUpdateInfo();
}


var popOnRowClick = function()
{
   switch (this.id) {
   case "rowV": bgWindow.setCurrentInfo(cPattern, "allow", popOnRowClickComplete); break;
   case "rowS": bgWindow.setCurrentInfo(cPattern, "session_only", popOnRowClickComplete); break;
   case "rowX": bgWindow.setCurrentInfo(cPattern, "block", popOnRowClickComplete); break;
   }
}

function popAddRowHandlers(bgWindow) {
   var table = document.getElementById("main_table");
   var rows = table.getElementsByTagName("tr");
   for (i = 1; i < rows.length; i++) {
      rows[i].onclick = popOnRowClick;
   }
}


function popAddLink()
{
   var link = document.getElementById("div_bottom");
   link.onclick = function() {
      chrome.tabs.create({ "url": "chrome://settings/content/cookies" });
   };
}


var popInit = function()
{
   chrome.runtime.getBackgroundPage(function(bgw) {
      bgWindow = bgw;
      popAddRowHandlers();
      popAddLink();
      popUpdateInfo();
   });
}

var popInit0 = function()
{
   chrome.runtime.getBackgroundPage(function(bgw) {
      bgWindow = bgw;
      popAddLink();
   });
}

// must add event handlers from JS as Chrome will not allow
// embedded JS in the popup html
if (document.title == "popup") {
   document.addEventListener('DOMContentLoaded', popInit);
} else if (document.title == "popup0") {
   document.addEventListener('DOMContentLoaded', popInit0);
}



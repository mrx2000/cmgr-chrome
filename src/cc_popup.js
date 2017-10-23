var bgWindow;

/*
document.forms[0].onsubmit = function(e) {
   e.preventDefault(); // Prevent submission
   var password = document.getElementById('pass').value;
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.setPassword(password);
        window.close();     // Close dialog
    });
   alert(password);
   window.close();
};
*/

function popUpdateInfo()
{
   bgWindow.getCurrentInfo(function(url, pattern, setting) {
      //var div = document.getElementById("div1");
      //div.innerHTML = "URL: " + url + ", pattern: " + pattern + ", setting: " + setting;
      var pstr = document.getElementById("txt_pattern");
      pstr.innerHTML = "" + pattern;

      var ckimg = null;
      switch (setting) {
      case "allow": ckimg = document.getElementById("ckV"); break;
      case "session_only": ckimg = document.getElementById("ckS"); break;
      case "block": ckimg = document.getElementById("ckX"); break;
      }

      if (ckimg) { ckimg.src = "img/tick.png"; }
   });
}


var popOnRowClick = function()
{
   switch (this.id) {
   case "rowV":
   case "rowS":
   case "rowX":
   }
}

function popAddRowHandlers(bgWindow) {
   var table = document.getElementById("main_table");
   var rows = table.getElementsByTagName("tr");
   for (i = 1; i < rows.length; i++) {
      rows[i].onclick = popOnRowClick;
   }
}


function popInit()
{
   chrome.runtime.getBackgroundPage(function(bgw) {
      bgWindow = bgw;
      popAddRowHandlers();
      popUpdateInfo();
   });
}

// must add event handlers from JS as Chrome will not allow
// embedded JS in the popup html
document.addEventListener('DOMContentLoaded', popInit());



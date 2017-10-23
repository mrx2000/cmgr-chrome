chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
      if (request.msg == "cc_clicked") {
         chrome.runtime.sendMessage({"msg": "cc_update_url"});
      }
   }
);

'use strict';

var console = chrome.extension.getBackgroundPage().console;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    console.log('tab.url=' + tab.url + " , changeInfo.status=" + changeInfo.status)

    if(tab.url != undefined && changeInfo.status == 'complete'){

        window.config.some(function (v, k) {
            if (tab.url.match(v.path)) {
                chrome.tabs.insertCSS(tabId, {file: '/css/' + v.css});
                return true;
            }
        });
    }
});
'use strict';

var console = chrome.extension.getBackgroundPage().console;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    console.log('tab.url=' + tab.url + " , changeInfo.status=" + changeInfo.status)

    if(tab.url != undefined && changeInfo.status == 'complete'){

        // block all ads
        if(tab.url.match('baidu.com')){
            chrome.tabs.insertCSS(tabId, {file: "/css/baidu.css"});
        } else if (tab.url.match('csdn.net')) {
            chrome.tabs.insertCSS(tabId, {file: "/css/csdn.css"});
        }
    }
});
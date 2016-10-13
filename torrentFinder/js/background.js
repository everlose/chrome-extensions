'use strict';

var console = chrome.extension.getBackgroundPage().console;

var ajax = function (url) {
    var xhr = new XMLHttpRequest(),
        type = 'GET';

    xhr.open(type, url);

    xhr.send(null);

    //return promise
    return new Promise(function (resolve, reject) {
        //onload are executed just after the sync request is comple，
        //please use 'onreadystatechange' if need support IE9-
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(xhr.response);
            }
        };
        
    });
};

var getResourceUrl = function (id) {
    return ajax('http://bt2.bt87.cc/' + 'search/sky%20angel%20vol.' + id + '_ctime_1.html');
};

var getMagnet = function (path) {
    return ajax('http://bt2.bt87.cc/' + path);
};

var isLoading = false;
var start = function (date) {
    var searchId = window.localStorage.getItem('torrentFinderSearchTag') || 1;
    var torrentId = searchId < 10 ? '0' + searchId : searchId;

    getResourceUrl(torrentId)
    .then(function (json) {
        var aReg = /(?!<a class="title".* href=")\/\w+\.html(?=">)/;
        var res = json.match(aReg);
        if (res) {
            return getMagnet(res[0]);
        } else {
            Promise.reject('can not match aReg');
        }
        
    }, function () {
        Promise.reject('getResourceUrl failed')
    }).then(function (json) {
        window.result = json;
        var magnetReg = /magnet:\??[^"|<]+/;
        var res = json.match(magnetReg);
        if (res) {
            console.log(res[0]);
            window.localStorage.setItem('torrentFinderSearchTag', +searchId + 1);
            window.localStorage.setItem('torrentFinder-sky angle vol.' + torrentId, res[0]);
            isLoading = false;
        } else {
            Promise.reject('can not match magnetReg');
        }
    }, function (res) {
        console.log(res);
        isLoading = false;
    });
    
};


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if(tab.url != undefined && changeInfo.status == 'complete'){
        if (!isLoading) {
            isLoading = true;
            start();
        }
        
    }
});


'use strict';

var console = chrome.extension.getBackgroundPage().console;

var ajax = function (url) {
    var xhr = new XMLHttpRequest(),
        type = 'GET';

    xhr.open(type, url);

    xhr.send(null);

    //return promise
    return new Promise(function (resolve, reject) {
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
    return ajax('http://bt2.bt87.cc/' + 'search/SMDV-' + id + '_ctime_1.html');
};

var getMagnet = function (path) {
    return ajax('http://bt2.bt87.cc' + path);
};

var isLoading = false;
var start = function (date) {
    var searchId = window.localStorage.getItem('torrentFinderSearchTag') || 1;
    var torrentId = searchId < 10 ? '0' + searchId : searchId;

    getResourceUrl(torrentId)
    .then(function (json) {
        var aReg = /(?!<a class="title".* href=")\/\w+\.html(?=">)/g;
        var res = json.match(aReg);
        if (res) {
            return Promise.all([getMagnet(res[0]), getMagnet(res[1]), getMagnet(res[2])]);
        } else {
            Promise.reject('can not match aReg');
        }
        
    }, function () {
        Promise.reject('getResourceUrl failed')
    }).then(function (resArr) {
        var magnetReg = /magnet:\??[^"|<]+/;
        var res = '';
        resArr.forEach(function (v, k) {
            res += v.match(magnetReg)[0] + '，';
        });
        if (res) {
            window.localStorage.setItem('torrentFinderSearchTag', + searchId + 1);
            window.localStorage.setItem('torrentFinder-SMDV-' + torrentId, res);
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


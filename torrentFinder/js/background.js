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

var getResourceUrl = function (name, id) {
    return ajax('http://bt2.bt87.cc/' + 'search/' + name + id + '_ctime_1.html');
};

var getMagnet = function (path) {
    return ajax('http://bt2.bt87.cc' + path);
};

var isLoading = false;
var start = function (date) {
    var searchId = window.localStorage.getItem('torrentFinderSearchTag') || 1;
    var torrentName = window.localStorage.getItem('torrentName') || 'SMBD-';
    var torrentId = searchId < 10 ? '0' + searchId : searchId;
    var torrentSizeArr = [];
    getResourceUrl(torrentName, torrentId)
    .then(function (json) {
        // var aReg = /(?!<a class="title".* href=")\/\w+\.html(?=">)/g;
        // var res = json.match(aReg);
        // var reqArr = [];
        var reqArr = [];
        var dom = document.createElement('div');
        var ul = json.match(/<ul class="media-list media-list-set">[\s\S]*<\/ul>/);
        if (ul) {
            dom.innerHTML = ul;
            var mediaBody = dom.querySelectorAll('.media-list .media-body');
            mediaBody = Array.prototype.slice.call(mediaBody);
            mediaBody.some(function (v, k) {
                if (reqArr.length === 3) {
                    return true;
                }
                var size = v.querySelector('.label.label-warning').innerHTML;
                //小于4G则允许去获取
                if (size && size.indexOf('GB') > -1 && parseInt(size) < 4 || 
                    size && size.indexOf('MB') > -1) {
                    torrentSizeArr.push(size);
                    reqArr.push(getMagnet(v.querySelector('.title').getAttribute('href')));
                }
            });
            return Promise.all(reqArr);
        } else {
            Promise.reject('can not match ul');
        }
        
        // if (res && res[0]) {
        //     reqArr.push(getMagnet(res[0]));
        // }
        // if (res && res[1]) {
        //     reqArr.push(getMagnet(res[1]));
        // }
        // if (res && res[2]) {
        //     reqArr.push(getMagnet(res[2]));
        // }

        // if (res) {
        //     return Promise.all(reqArr);
        // } else {
        //     Promise.reject('can not match aReg');
        // }
        
    }, function () {
        Promise.reject('getResourceUrl failed');
    }).then(function (resArr) {
        isLoading = false;
        var magnetReg = /magnet:\??[^"|<]+/;
        var res = '';
        resArr.forEach(function (v, k) {
            res += torrentSizeArr[k] + '：' + v.match(magnetReg)[0] + '；';
        });
        if (res) {
            window.localStorage.setItem('torrentFinderSearchTag', + searchId + 1);
            window.localStorage.setItem('torrentFinder-' + torrentName + torrentId, res);
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


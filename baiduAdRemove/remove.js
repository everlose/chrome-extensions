'use strict';

var doRemove = function () {
    var baiduContainer = document.querySelector('#content_left');
    var normalContent = baiduContainer.querySelectorAll('.result-op, .result');

    var html = '';
    normalContent.forEach(function (v, k) {
        html += v.outerHTML;
    });
    baiduContainer.innerHTML = html;
};

setInterval(doRemove, 500);

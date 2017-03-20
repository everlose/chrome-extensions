'use strict';

var console = chrome.extension.getBackgroundPage().console;

var parseTime = function (timeStamp, format) {
    var date = new Date(timeStamp);
    var o = { 
        'M+' : date.getMonth() + 1, //month 
        'D+' : date.getDate(), //day 
        'h+' : date.getHours(), //hour 
        'm+' : date.getMinutes(), //minute 
        's+' : date.getSeconds(), //second 
        'S' : date.getMilliseconds() //millisecond 
    } 

    if(/(Y+)/.test(format)) { 
        format = format.replace(RegExp.$1, 
            (date.getFullYear() + '').substr(4 - RegExp.$1.length)); 
    } 

    for(var k in o) { 
        if (new RegExp('('+ k +')').test(format)) { 
            format = format.replace(RegExp.$1, 
                RegExp.$1.length == 1 ? o[k] : ('00'+ o[k]).substr((''+ o[k]).length)); 
        } 
    } 
    return format; 
};

var ajax = function (opts) {
    var xhr = new XMLHttpRequest(),
        type = opts.type || 'GET',
        url = opts.url,
        params = opts.data,
        dataType = opts.dataType || 'json';

    type = type.toUpperCase();

    if (type === 'GET') {
        params = (function(obj){
            var str = '';

            for(var prop in obj){
                str += prop + '=' + obj[prop] + '&'
            }
            str = str.slice(0, str.length - 1);
            return str;
        })(opts.data);
        url += url.indexOf('?') === -1 ? '?' + params : '&' + params;
    } 

    xhr.open(type, url);

    if (opts.contentType) {
        xhr.setRequestHeader('Content-type', opts.contentType);
    }

    xhr.send(params ? params : null);

    //return promise
    return new Promise(function (resolve, reject) {
        //onload are executed just after the sync request is comple，
        //please use 'onreadystatechange' if need support IE9-
        xhr.onload = function () {
            var result;
            try {
                result = JSON.parse(xhr.response);
            } catch (e) {
                result = xhr.response;
            }
            if (xhr.status === 200) {
                resolve(result);
            } else {
                reject(result);
            }
        };
        
    });
};

var createNotification = function (text, body, img) {
    var notification = new Notification(text, {
        body: body,
        icon: img || 'http://img.souche.com/20160126/png/8b99c8a30b73ff4edba7b69ec60c3b37.png'
    });
    notification.onclick = function() {
        window.open('https://meican.com')
    };
};

var orderFn = function (day) {
    var tabUniqueId = window.localStorage.getItem('tabUniqueId');
    var dishId = window.localStorage.getItem('dishId');
    var obj = {
        corpAddressUniqueId: 'e5606ba8d703',
        order: JSON.stringify([{"count":1,"dishId":dishId}]),
        tabUniqueId: tabUniqueId,
        targetTime: day + ' 16:30',
        userAddressUniqueId: 'e5606ba8d703'
    };

    var str = '';
    for(var prop in obj){
        if (obj.hasOwnProperty(prop)) {
            str += '&' + prop + '=' + obj[prop];
        }
    }

    ajax({
        url: 'https://meican.com/preorder/api/v2.1/orders/add?' + str.slice(1, str.length),
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
    })
    .then(function (d) {
        if (d.status === 'SUCCESSFUL') {
            createNotification('恭喜你订餐成功', d.order.uniqueId);
        } else {
            createNotification('订餐失败', d.message);
        }
        window.localStorage.setItem('orderDate', day);
        window.localStorage.setItem('orderMenu', 'xx饭');
    }, function (d) {
        createNotification('订餐失败', d.error_description);
        window.localStorage.setItem('orderDate', day);
    });
};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if(tab.url != undefined && changeInfo.status == 'complete'){
        var date = new Date();
        var hour = date.getHours();
        var day = parseTime(date.getTime(), 'YYYY-MM-DD');
        //检查今天是否已有订单用，值为一个字符串代表日期
        var orderDate = window.localStorage.getItem('orderDate');
        console.log('orderDate:' + orderDate + ' hour:' + hour + ' weekDay:' + date.getDay());
        if (hour >= 9 && hour <= 16 && day !== orderDate &&
            date.getDay() !== 0 && date.getDay() !== 6) {
            orderFn(day);
        }
    }
});


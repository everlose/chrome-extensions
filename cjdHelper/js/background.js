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

//获取商店名，如嘿尔社，元食等等。
var getShops = function (date) {
    return $.ajax({
        url: 'http://wos.chijidun.com/order/getMembersAndOrder.html',
        type : 'GET',
        dataType: 'json',
        data : {
            cid: '1648',
            date: date,
            mealType: 3
        }
    });
};
//获取菜单：如洋葱鸭胸肉套餐。
var getMenus = function (shopId, date) {
    return $.ajax({
        url: 'http://wos.chijidun.com/order/getMenu.html',
        type : 'GET',
        dataType: 'json',
        data : {
            mid: shopId,
            date: date,
            type: 3
        }
    });
};
//下订单
var saveOrder = function (foodId, date) {
    return $.ajax({
        url: 'http://wos.chijidun.com/order/saveOrder.html',
        type : 'POST',
        dataType: 'json',
        data : {
            items: foodId + ':1',
            addrId: 13,
            mealType: 3,
            date: date
        }
    })
};
//删除订单
var deleteOrder = function (orderId) {
    return $.ajax({
        url: 'http://wos.chijidun.com/order/deleteOrder.html',
        type : 'POST',
        dataType: 'json',
        data : {
            orderId: orderId
        }
    })
};

var order = function (date) {
    var shopName, menuName, orderId;

    getShops(date)
    .then(function (json) {
        if (json.data.order && json.data.order.id) {
            orderId = json.data.order.id;
            window.localStorage.setItem('cjdOrderDate', date);
            window.localStorage.setItem('cjdOrderMenu', json.data.order.menus);
            return $.Deferred().reject('已有订单');
        } else {
            var $members = $(json.data.members).find('.nav-item');
            var shops = [];
            $members.each(function (k, v) {
                var $dom = $(v);
                shops[$dom.text()] = $dom.data('id');
            });
            var keys = Object.keys(shops);
            if (keys.indexOf('嘿尔社') > -1) {
                shopName = '嘿尔社';
            } else {
                shopName = keys[0];
            }
            return $.when(getMenus(shops[shopName], date), getMenus(shops['元食'], date));
        }
        
    }, function (json) {
        console.log(json);
    })
    .then(function (json1, json2) {
        var $menu1 = $(json1[0].data);
        var $menu2 = $(json2[0].data);
        var menu = {};
        $menu1.each(function (k, v) {
            var $dom = $(v);
            var title = $dom.find('.title').text();
            menu[title] = $dom.data('id');
        });
        $menu2.each(function (k, v) {
            var $dom = $(v);
            var title = $dom.find('.title').text();
            menu[title] = $dom.data('id');
        });

        var menuKey = Object.keys(menu);
        for (var i in menu) {
            //正向匹配校园大排和蛋黄仔排选择，反向匹配沙拉，碰见沙拉则过滤。
            if (menu[i] === 15407 || menu[i] === 16588) {
                menuName = i;
                return saveOrder(menu[i], date);
            } else if (i.indexOf('沙拉') > -1) {
                menuKey.splice(i, 1);
            }
        }
        menuName = menuKey[0];
        return saveOrder(menu[menuKey[0]], date);
    }, function (json) {
        console.log(json);
    })
    .then(function (json) {
        //notification
        if (+json.status === 1) {
            orderId = json.result;
            window.localStorage.setItem('cjdOrderDate', date)
            window.localStorage.setItem('cjdOrderMenu', menuName);
            var notification = new Notification('恭喜你订餐成功', {
                body: '你订了' + shopName + '的' + menuName,
                icon: 'http://img.souche.com/20160126/png/8b99c8a30b73ff4edba7b69ec60c3b37.png'
            });
            notification.onclick = function() {
                window.open('http://wos.chijidun.com/order/index.html')
            };
        } else {
            var notification = new Notification('订单失败', {
                body: '点击这里手动订菜吧',
                icon: 'http://img.souche.com/20160126/png/8b99c8a30b73ff4edba7b69ec60c3b37.png'
            });
            window.localStorage.setItem('cjdOrderDate', date)
            window.localStorage.setItem('cjdOrderMenu', '暂无订单');
            notification.onclick = function() {
                window.open('http://wos.chijidun.com/order/index.html')
            };
        }
    }, function (json) {
        console.log(json);
    });
};

 
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if(tab.url != undefined && changeInfo.status == 'complete'){
        var date = new Date();
        var hour = date.getHours();
        var day = parseTime(date.getTime(), 'YYYY-MM-DD');
        //检查今天是否已有订单用，值为一个字符串代表日期
        var orderDate = window.localStorage.getItem('cjdOrderDate');
        console.log('orderDate:' + orderDate + ' hour:' + hour + ' weekDay:' + date.getDay());
        if (hour >= 9 && hour <= 14 && day !== orderDate &&
            date.getDay() !== 0 && date.getDay() !== 6) {

            order(day);

        }
    }
});


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

    //初始化匹配菜单与食品
    shopName = window.localStorage.getItem('cjdReserveMenu') || '嘿尔社';
    menuName = window.localStorage.getItem('cjdReserveFood') || '鸡';

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

            //以逗号分隔店名匹配诸如嘿尔社，元食几家店。
            var shopNames = shopName.split(';');
            var promises = [];
            var keys = Object.keys(shops);
            shopNames.forEach(function (v, k) {
                if (keys.indexOf(v) > -1) {
                    promises.push(getMenus(shops[v], date));
                }
            });
            if (promises.length === 0) {
                promises.push(getMenus(shops[keys[0]], date));
            }
            return $.when(promises[0], promises[1], promises[2], promises[3]);
            //return getMenus(shops[shopName], date);
        }
    }, function (json) {
        console.log(json);
        return json;
    })
    .then(function (json) {
        var menu = {};
        //整合所有菜单里的菜品，塞进menu对象中.
        if (arguments[1]) {
            var arr = Array.prototype.slice.call(arguments);
            arr.forEach(function (value, index) {
                if (value) {
                    var $menu = $(value[0].data);
                    $menu.each(function (k, v) {
                        var $dom = $(v);
                        var title = $dom.find('.title').text();
                        menu[title] = $dom.data('id');
                    });
                }
            });
        } else {
            var $menu = $(json.data);
            $menu.each(function (k, v) {
                var $dom = $(v);
                var title = $dom.find('.title').text();
                menu[title] = $dom.data('id');
            });
        }
        //筛选过滤出喜欢的菜品，正向匹配输入的菜品和口蘑，球球，仔排；反向匹配沙拉。
        var menuKey = Object.keys(menu);
        var isMatched = false;
        var menuNames = menuName.split(';');
        menuNames.some(function (v, k) {
            if (isMatched) {
                return true;
            }
            for (var i in menu) {
                //正向匹配校园大排和蛋黄仔排选择，反向匹配沙拉，碰见沙拉则过滤。
                if (i.indexOf(v) > -1) {
                    menuName = i;
                    isMatched = true;
                    break;
                }
            }
        })
        /*
        for (var i in menu) {
            //正向匹配校园大排和蛋黄仔排选择，反向匹配沙拉，碰见沙拉则过滤。
            if (i.indexOf(v) > -1 || i.indexOf('蘑人') > -1 || i.indexOf('球球') > -1 ||
                i.indexOf('蛋黄仔排') > -1) {

                menuName = i;
                isMatched = true;
                break;
            } else if (i.indexOf('沙拉') > -1) {
                menuKey.splice(i, 1);
            }
        }
        */
        //没有匹配到目标则取第一项。
        if (!isMatched)  {
            menuName = menuKey[0];
        }
        return saveOrder(menu[menuName], date);
    }, function (json) {
        console.log(json);
        return json;
    })
    .then(function (json) {
        //notification
        if (+json.status === 1) {
            orderId = json.result;
            window.localStorage.setItem('cjdOrderDate', date)
            window.localStorage.setItem('cjdOrderMenu', menuName);
            var notification = new Notification('恭喜你订餐成功', {
                body: '你订了' + menuName,
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


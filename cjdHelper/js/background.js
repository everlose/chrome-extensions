//var count = 0;

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
            haveOrder = date;
            return $.Deferred().reject('已有订单');
        } else {
            var $members = $(json.data.members).find('.nav-item');
            var shops = [];
            $members.each(function (k, v) {
                var $dom = $(v);
                shops[$dom.text()] = $dom.data('id');
            });
            shopName = '嘿尔社';
            return getMenus(shops[shopName], date);
        }
        
    }, function (json) {
        console.log(json);
    })
    .then(function (json) {
        var $menu = $(json.data);
        var menu = {};
        $menu.each(function (k, v) {
            var $dom = $(v);
            var title = $dom.find('.title').text();
            menu[title] = $dom.data('id');
        });
        menuName = Object.keys(menu)[0];
        return saveOrder(menu[menuName], date);
    }, function (json) {
        console.log(json);
    })
    .then(function (json) {
        //notification
        if (+json.status === 1) {
            orderId = json.result;
            haveOrder = date;
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
            notification.onclick = function() {
                window.open('http://wos.chijidun.com/order/index.html')
            };
        }
    }, function (json) {
        console.log(json);
    });
};


var haveOrder; //今天是否已有订单，值为一个字符串代表日期
var gotoOrderFn = function () {
    var date = new Date();
    var hour = date.getHours();
    var day = parseTime(date.getTime(), 'YYYY-MM-DD');

    console.log('吃几顿助手 now working... hour = ' + hour + ', day = ' + day + 
        ', haveOrder = ' + haveOrder);

    if (hour > 9 && hour < 14 && day !== haveOrder) {
        order(day);

        //点过了餐的话，就12小时后发动检测；43200000毫秒。先这样，看看会不会啥问题吧
        setTimeout(function () {
            gotoOrderFn();
        }, 43200000);

    } else {
        //半小时发动一次检测；1800000毫秒
        setTimeout(function () {
            gotoOrderFn();
        }, 1800000);
    }
};

gotoOrderFn();



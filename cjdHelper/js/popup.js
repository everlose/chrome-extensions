var console = chrome.extension.getBackgroundPage().console;
var text = window.localStorage.getItem('cjdOrderMenu');
if (!text) {
    text = '暂未点餐';
}
document.getElementById('cjd_tip').innerHTML = text;

var menu = document.querySelector('#menu input');
var food = document.querySelector('#food input');
var menuValue = window.localStorage.getItem('cjdReserveMenu') || '嘿尔社';
var foodValue = window.localStorage.getItem('cjdReserveFood') || '鸡';
menu.value = menuValue;
food.value = foodValue;
menu.onchange = function () {
    console.log(this.value);
    window.localStorage.setItem('cjdReserveMenu', this.value);
};
food.onchange = function () {
    console.log(this.value);
    window.localStorage.setItem('cjdReserveFood', this.value);
};
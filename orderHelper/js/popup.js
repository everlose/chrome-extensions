window.onload = function () {
    var text = window.localStorage.getItem('orderMenu');
    if (!text) {
        text = '暂未点餐';
    }
    document.getElementById('tip').innerHTML = text;

    var user = document.querySelector('#user input');
    var food = document.querySelector('#food input');
    
    user.value = window.localStorage.getItem('tabUniqueId');
    food.value = window.localStorage.getItem('dishId');

    user.onchange = function () {
        window.localStorage.setItem('tabUniqueId', this.value);
    };
    food.onchange = function () {
        window.localStorage.setItem('dishId', this.value);
    };

    //屏蔽右键
    document.oncontextmenu = function () {
        window.event.returnValue=false;  
        return false;
    };
}

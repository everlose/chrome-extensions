var num = window.localStorage.getItem('torrentFinderSearchTag');
var name = window.localStorage.getItem('torrentName');
if (!num) {
    num = '0';
}
if (!name) {
    name = '5无';
}
document.getElementById('num').innerHTML = num;
document.getElementById('name').innerHTML = name;
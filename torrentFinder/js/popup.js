var text = window.localStorage.getItem('torrentFinderSearchTag');
if (!text) {
	text = '0';
}
document.getElementById('num').innerHTML = text;
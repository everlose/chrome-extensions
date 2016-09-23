var text = window.localStorage.getItem('cjdOrderMenu');
if (!text) {
	text = '暂未点餐';
}
document.getElementById('cjd_tip').innerHTML = text;
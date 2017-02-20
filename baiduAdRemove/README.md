## 百度广告删除插件

为了删除百度的推广链接以及其它广告！目前屏蔽：
* 百度搜索页的广告
* csdn悬浮窗的百度推广
* bing搜索页的广告

### 2016年9月17日

不过目前作者功力有限，只能做到在百度已经渲染了DOM结构后，从DOM结构里找到推广内容并移除。这样做会使百度推广的内容在页面中一闪而过，还是做得不足，期待下次的优化。


### 2016年9月18日

作者找到了一个用css隐藏广告元素的办法，试了一下颇具成效。感谢unclehking的[baiduAdfinisher](https://github.com/unclehking/baiduAdfinisher)让我找到了灵感

### 2017年2月19日

更新规则[id="1"][srcid="1599"]的广告元素选中并屏蔽，这种做法可能会误伤一些非广告元素。

## 简介

百度广告实在太烦人，如果搜个医院这样的词，前一屏幕都是广告呢。但是使用bing搜索起来还是不太好用，搜的东西经常牛头不对马嘴，google的话要翻墙麻烦，其他的什么搜狗之流和百度比起来，那就大哥别笑话二哥了，正好笔者练习chrome插件编写，就来写个屏蔽百度广告的来练手了。

这里采用注入css的方式来隐藏搜索结果的广告项，[点击查看源码](https://github.com/everlose/chrome-extensions/tree/master/baiduAdRemove)

## 基础构建

一个基础的chrome插件构成目录。

```
.
|____css
| |____baidu.css  放置过滤规则
|____js
| |____background.js  常驻后台的js
|____manifest.json  插件配置
|____pic  插件的图标目录，放置适配三种尺寸
| |____icon_128.png
| |____icon_16.png
| |____icon_48.png
|____README.md
```

## 注入脚本

在background.js里加入以下就可以插入注入css

```javascript
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if(tab.url != undefined && changeInfo.status == 'complete'){
        if (tab.url.match('baidu.com')) {
            chrome.tabs.insertCSS(tabId, {file: '/css/baidu.css'});
        }
    }
});
```

## 编写css

笔者目前随手一搜“男科”两字（各位看官不要误会了，笔者很正常哟），前一屏全都是广告，打开控制台一瞧，发现广告的结果项的外容器元素，写了display:block!important

![](http://7xn4mw.com1.z0.glb.clouddn.com/17-2-20/58883943-file_1487558992842_172ec.png)

嘿嘿嘿，虽然广告外容器的class名一直再变，id也是一直再变，但是有了style这种属性，就可以利用css属性选择器选中，所以css的规则代码可以写成

```css
#content_left > div[style^="display"] {
    height: 0px !important;
    overflow: hidden !important;
    padding: 0px !important;
    margin: 0px !important;
    color: #ffffff !important;
}
```

接着百度的搜索结果右边出现的牛头不对马嘴的东西也实在惹人厌，于是再加一条规则去了

```css
.result-op.c-container.xpath-log{
    height: auto !important;
    color: #000000 !important;
}
```

然后一看效果，男科广告果然没了

![](http://7xn4mw.com1.z0.glb.clouddn.com/17-2-20/44689618-file_1487561140405_aa6d.png)

然而你们以为这样就结束了么，笔者一艘租房，哟呵，广告居然又出现了

![](http://7xn4mw.com1.z0.glb.clouddn.com/17-2-20/69497773-file_1487561337138_1f60.png)

可以看得到第一条的广告并没有强制样式display:block!important的，css有个限制不能通过子元素如何再选到它的祖先元素操作，因为这样会让渲染效率变得极低。所以我们没发选中子元素有广告标记的元素对它祖先进行操作，那么该如何破？

仔细观察看到似乎广告都有id为1并且srcid为1599的属性，虽然笔者并不清楚代表了什么，不过倒是可以试试选它，那么最终的css规则就是这样的

```css
#content_left > div[style^="display"],
.result-op.xpath-log,
[id="1"][srcid="1599"]{
    height: 0px !important;
    overflow: hidden !important;
    padding: 0px !important;
    margin: 0px !important;
    color: #ffffff !important;
}
.result-op.c-container.xpath-log{
    height: auto !important;
    color: #000000 !important;
}
```

这么做的确看不见广告了，但其实会误伤一些标记为官网的链接，只要搜索的文本再详细一点就好了，本着对广告宁杀错勿放过的原则，还是可以接受的。


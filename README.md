## baiduAdRemove

为了移除百度搜索页的广告而写的浏览器插件。主要利用css规则屏蔽了推广链接。

## cjdHelper

吃几顿点餐平台助手，在每个工作日早上九点到下午14点间，触发浏览器tab动作将会自动去点餐。

### 安装方法

把cjdHelper.crx文件拖入到浏览器的扩展程序页面里，就可以运行

![](http://img.souche.com/20161108/png/f3bbfab5bb13955fe9b7a28457acb966.png)

### 选餐规则

可自定义匹配菜单与菜品

![](http://img.souche.com/20161108/png/f835b5c2716a57b12bc83aba76f0750c.png)

* 菜名匹配的是出现过这个字样的菜品，比如仔排可以匹配蛋黄仔排和椒盐仔排。
* 如果菜名为空的话，匹配菜单里第一个菜品
* 如果菜单也为空的话，会匹配第一个菜单的第一个菜品
* 所有菜品都过滤了”沙拉“字样的菜品

点餐成功会跳出一个web通知，告诉用户点餐成功。如果手动去吃几顿页面取消点餐，则当日此脚本助手不会再次点餐（除非你删除了storage数据）。

点击浏览器地址栏右边的插件图标，出现的提示仅仅只是此脚本自动替您订下的餐，可能与你实际的餐并不一样，因为你可能去吃几顿网站上手动改动过。

另外，此脚本需要吃几顿的用户登陆信息，而用户信息存放的cookie有效期大概是一个月，所以一个月内总得登录一次吃几顿，保持你的登录状态。

## torrentFinder

一个种子搜索脚本的chrome插件版，笔者已经用node实现，地址见（https://github.com/everlose/nodePractice/tree/master/crawler），所以这个版本将不会在维护

## 安装

拿cjdHelper举例，下载cjdHelper.crx的文件，拖拽到chrome浏览器的扩展程序页面（chrome://extensions/）里就可以使用，如果使用的是非chrome浏览器，请自行搜索如何安装浏览器插件。个别有需要的可以翻阅源码，在文件夹cjdHelper中。

## chrome 插件开发资源

360翻译的Chrome开发文档，[链接在此](http://open.chrome.360.cn/extension_dev/overview.html)

* 从Hello World入门，[入门指南](http://open.chrome.360.cn/extension_dev/getstarted.html)
* 插件也可使用chrome调试器调试，[调试指南](http://open.chrome.360.cn/extension_dev/tut_debugging.html)
* 一些接口的文档，改变浏览器外观，与浏览器交互，部署打包等，[开发指南](http://open.chrome.360.cn/extension_dev/devguide.html)
* 一些示例，[示例代码](http://open.chrome.360.cn/extension_dev/samples.html)
* [Manifest文件配置](http://open.chrome.360.cn/extension_dev/manifest.html)
* [图灵社区Chrome扩展及应用开发电子书](http://www.ituring.com.cn/minibook/950)
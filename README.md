## baiduAdRemove

为了移除百度搜索页的广告而写的浏览器插件。主要利用css规则屏蔽了推广链接。

## cjdHelper

吃几顿点餐平台助手，在每个工作日早上九点到下午14点间，触发浏览器tab动作将会自动去点餐。匹配嘿尔社的，并且没有“沙拉”两个字餐品。

## torrentFinder

一个种子搜索脚本的chrome插件版，笔者已经用node实现，所以这个版本将不会在维护

## 安装

拿cjdHelper举例，下载cjdHelper.crx的文件，拖拽到chrome浏览器的扩展程序页面（chrome://extensions/）里就可以使用，如果使用的是非chrome浏览器，请自行搜索如何安装浏览器插件。个别有需要的可以翻阅源码，在文件夹cjdHelper中。

## chrome 插件开发资源

360翻译的Chrome开发文档，[链接在此](http://open.chrome.360.cn/extension_dev/overview.html)

* 从Hello World入门，[入门指南](http://open.chrome.360.cn/extension_dev/getstarted.html)
* 插件也可使用chrome调试器调试，[调试指南](http://open.chrome.360.cn/extension_dev/tut_debugging.html)
* 一些接口的文档，改变浏览器外观，与浏览器交互，部署打包等，[开发指南](http://open.chrome.360.cn/extension_dev/devguide.html)
* 一些示例，[示例代码](http://open.chrome.360.cn/extension_dev/samples.html)
* [Manifest文件配置](http://open.chrome.360.cn/extension_dev/manifest.html)
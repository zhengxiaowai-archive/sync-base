# sync_base
chrome 插件，用于同步base数据，能解决速度慢和跨域问题

## 安装方法
打开 chrome 在地址栏输入 ```chrome://extensions/``` ,把 **sync_base.crx** 拖入即可

## 使用方法
打开插件，点击同步，等待几秒后显示成功就可以关闭，在此期间关闭插件会导致同步失败。

如果显示失败，关闭翻墙插件，请再次点击上传，如果多次失败，恭喜你发现了BUG，请联系我。。。

## 开发方法
主要文件:
1. poput.html   界面文件
2. manifest.json    配置文件

首先需要在js/poput.js设置base的token,所有的js代码不能嵌入html中，必须从外部引入。

## 问题
暂时没有。。。。 


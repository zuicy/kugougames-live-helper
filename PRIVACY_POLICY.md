# 隐私政策 / Privacy Policy

**kugougames直播监控室 - 音频控制** 浏览器扩展

最后更新：2026年3月31日

---

## 概述

「kugougames直播监控室 - 音频控制」（以下简称"本扩展"）是一款开源的浏览器扩展，专为 [kugougames.cn](https://kugougames.cn) 直播监控页面提供多直播窗口音频控制功能。

## 数据收集

**本扩展不收集、存储或传输任何用户个人数据。**

具体而言：
- ❌ 不收集浏览历史
- ❌ 不收集个人身份信息
- ❌ 不使用 Cookie 或本地存储
- ❌ 不进行任何网络请求
- ❌ 不使用任何分析或追踪服务
- ❌ 不与任何第三方共享数据

## 权限说明

本扩展不请求任何特殊浏览器权限（`permissions` 为空）。

本扩展仅通过内容脚本（Content Script）在特定页面中运行，用于控制嵌入式直播播放器的音量和静音状态。内容脚本仅在以下 URL 模式匹配时加载：

```
https://www.bilibili.com/blackboard/live/*
```

这是因为 kugougames.cn 通过 iframe 嵌入了 B 站直播页面，扩展需要注入到 iframe 内部来控制音频。

## 工作原理

本扩展的工作方式完全在本地浏览器内完成：
1. 监听来自父页面（kugougames.cn）的 `postMessage` 消息
2. 根据消息内容控制页面内 `<video>` 元素的音量和静音状态
3. 不涉及任何外部服务器通信

## 开源

本扩展完全开源，源代码可在 GitHub 上查看和审计。

## 联系方式

如有任何关于隐私政策的疑问，请通过以下方式联系：

- GitHub Issues: [在 GitHub 仓库提交 Issue](https://github.com/zuicy/kugougames-live-helper/issues)
- 网站: [kugougames.cn](https://kugougames.cn)

---

*本隐私政策可能会不定期更新，更新后将在本页面发布。*

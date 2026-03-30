# kugougames直播监控室 - 音频控制

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?logo=googlechrome)](https://chrome.google.com/webstore)
[![Edge Add-ons](https://img.shields.io/badge/Edge-Add--ons-blue?logo=microsoftedge)](https://microsoftedge.microsoft.com/addons)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

专为 [kugougames.cn](https://kugougames.cn) 直播监控页面设计的浏览器扩展，提供多直播窗口独立音频控制能力。

## 功能

当 kugougames.cn 监控页面同时嵌入多个 B 站直播 iframe 时，本扩展提供：

- 🔊 **自动音频焦点切换** — 点击某个直播窗口时，自动将该窗口设为有声，其他窗口静音
- 🎚️ **独立音量控制** — 每个直播窗口可单独调节音量
- 🔇 **智能静音管理** — 避免多个直播间同时发声造成混乱
- 📡 **音频状态反馈** — 实时回传每个窗口的真实音量和静音状态
- 🔄 **自动重连恢复** — 直播断线重连或清晰度切换后自动恢复音频控制，无需手动刷新

## 安装

### 从商店安装（推荐）

- **Chrome**: [Chrome Web Store 链接]()（审核中）
- **Edge**: [Edge Add-ons 链接]()（审核中）

### 手动安装（开发者）

1. 下载或克隆本仓库
2. 打开浏览器扩展管理页面
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择本仓库根目录（包含 `manifest.json` 的目录）

## 项目结构

```
kugougames-live-helper/
├── manifest.json          # 扩展配置文件 (Manifest V3)
├── background.js          # Service Worker，负责消息中转
├── content-script.js      # 内容脚本，注入到直播 iframe 控制音频
├── icons/                 # 扩展图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   └── pack.sh            # 打包脚本
├── PRIVACY_POLICY.md      # 隐私政策
├── STORE_LISTING.md       # 商店提交信息备忘
├── LICENSE                # MIT 许可证
└── README.md              # 本文件
```

## 工作原理

```
kugougames.cn 监控页面
├── iframe (B站直播间 1)  ← content-script.js 注入
├── iframe (B站直播间 2)  ← content-script.js 注入
└── iframe (B站直播间 N)  ← content-script.js 注入

通信方式: 父页面 --postMessage--> iframe 内的 content-script --> 控制 <video> 元素
```

1. `content-script.js` 被注入到每个 B 站直播 iframe 中
2. 父页面（kugougames.cn）通过 `postMessage` 发送音频控制指令
3. Content Script 接收指令后，直接操作 iframe 内的 `<video>` 元素

## 打包

```bash
bash scripts/pack.sh
```

输出文件：`dist/kugougames-live-helper-v{版本号}.zip`，可直接上传到 Chrome Web Store 和 Edge Add-ons。

## 隐私

本扩展不收集、存储或传输任何用户数据。详见 [隐私政策](PRIVACY_POLICY.md)。

## 许可证

[MIT License](LICENSE)

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

- **Chrome**: [📦 Chrome Web Store 安装](https://chromewebstore.google.com/detail/kugougames%E7%9B%B4%E6%92%AD%E7%9B%91%E6%8E%A7%E5%AE%A4-%E9%9F%B3%E9%A2%91%E6%8E%A7%E5%88%B6/ofnegfadodhdmbcmciebogmepibfejcl)
- **Edge**: [Edge Add-ons 安装]()【审核中】
- **开源地址**: [Gitee](https://gitee.com/zuicy/kugougames-live-helper)

### 手动安装

1. 前往 [Releases](../../releases) 页面，下载最新版本的 `.zip` 文件
2. 解压到任意文件夹
3. 打开浏览器扩展管理页面
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
4. 开启「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的文件夹（包含 `manifest.json` 的目录）

### 开发者调试

```bash
# 克隆仓库后，生成干净的扩展目录
bash scripts/pack.sh dev
```

然后在浏览器加载 `dist/dev/` 目录即可。修改代码后重新运行上述命令，在扩展页面点击刷新按钮更新。

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
# 本地调试：生成干净的扩展目录到 dist/dev/
bash scripts/pack.sh dev

# 正式打包：生成 zip 用于提交商店或上传 Release
bash scripts/pack.sh
```

输出文件：`dist/kugougames-live-helper-v{版本号}.zip`，可直接上传到 Chrome Web Store、Edge Add-ons 或 GitHub Releases。

## 隐私

本扩展不收集、存储或传输任何用户数据。详见 [隐私政策](PRIVACY_POLICY.md)。

## 许可证

[MIT License](LICENSE)

# 商店提交信息备忘 / Store Listing Reference

> 本文件记录提交 Chrome Web Store 和 Edge Add-ons 时需要填写的信息，方便每次更新版本时参考。
> 这个文件不会被打包进 zip，仅作为开发备忘。

---

## 基本信息

| 字段 | 内容 |
|------|------|
| **扩展名称** | kugougames直播监控室 - 音频控制 |
| **简短描述** (132字符内) | 专为 kugougames.cn 直播监控页面设计，提供多直播窗口独立音频控制，支持自动音频焦点切换和独立音量调节。 |
| **版本号** | 见 manifest.json 中的 `version` 字段 |
| **分类** | Chrome: `Accessibility` / Edge: `Productivity` |
| **语言** | 中文（简体） |

## 详细描述

> 提交商店时粘贴以下内容到「详细描述」栏：

```
kugougames直播监控室 - 音频控制

专为 kugougames.cn 直播监控页面设计的浏览器扩展。

当监控页面同时嵌入多个 B 站直播 iframe 时，浏览器默认无法独立控制每个 iframe 的音频。本扩展解决了这个问题，提供：

✅ 自动音频焦点切换 — 点击某个直播窗口时，自动将该窗口设为有声，其他窗口静音
✅ 独立音量控制 — 每个直播窗口可单独调节音量
✅ 智能静音管理 — 避免多个直播间同时发声造成混乱
✅ 音频状态反馈 — 实时回传每个窗口的真实音量和静音状态
✅ 自动重连恢复 — 直播断线重连或清晰度切换后自动恢复音频控制，无需手动刷新

本扩展仅在 kugougames.cn 的直播监控页面中生效，不收集任何用户数据。

开源地址：https://github.com/zuicy/kugougames-live-helper
```

## 链接

| 字段 | URL |
|------|-----|
| **网站** | https://kugougames.cn |
| **隐私政策** | https://github.com/zuicy/kugougames-live-helper/blob/main/PRIVACY_POLICY.md |
| **支持/反馈** | https://github.com/zuicy/kugougames-live-helper/issues |
| **源代码** | https://github.com/zuicy/kugougames-live-helper |

## 截图要求

| 平台 | 尺寸要求 | 数量 |
|------|----------|------|
| **Chrome** | 1280×800 或 640×400 (PNG/JPEG) | 至少 1 张，最多 5 张 |
| **Edge** | 1280×800 或 640×400 (PNG/JPEG) | 至少 1 张，最多 10 张 |

> 💡 建议截图内容：在 kugougames.cn 监控页面上展示多个直播窗口，体现音频控制功能。

## 图标要求

| 用途 | 尺寸 | 状态 |
|------|------|------|
| 商店图标 | 128×128 PNG | ✅ 已有 `icons/icon128.png` |
| Chrome 宣传图（可选） | 440×280 PNG | ❌ 未准备 |

## 审核注意事项

- 本扩展 `permissions` 为空，不请求任何特殊权限
- `content_scripts` 仅匹配 `https://www.bilibili.com/blackboard/live/*`
- 这是因为 kugougames.cn 通过 iframe 嵌入了 B 站直播页面，扩展需要注入到 iframe 内部来控制音频
- 如果审核员需要测试，需要访问 kugougames.cn 的直播监控页面才能看到效果

## 发版流程

1. 更新 `manifest.json` 中的 `version`
2. 运行 `bash scripts/pack.sh` 生成 zip
3. 上传到 Chrome Web Store / Edge Add-ons
4. git tag 打版本标签：`git tag v1.0.0 && git push --tags`

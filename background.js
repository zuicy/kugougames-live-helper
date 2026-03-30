/**
 * kugougames直播监控室 - 音频控制 Background Service Worker
 * 
 * 负责：
 * 1. 扩展安装/更新时的初始化
 * 2. 消息中转（如果需要从 popup 发消息到 content script）
 */

const LOG_PREFIX = '[kugougames音频控制 BG]';

// 扩展安装/更新时
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log(`${LOG_PREFIX} 扩展已安装 v${chrome.runtime.getManifest().version}`);
    } else if (details.reason === 'update') {
        console.log(`${LOG_PREFIX} 扩展已更新到 v${chrome.runtime.getManifest().version}`);
    }
});

// 监听来自 popup 或其他页面的消息，转发给对应的 content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 如果是从 content script 发来的状态报告，直接忽略
    if (message.type === 'STUDIO_EXTENSION_STATUS') {
        sendResponse({ received: true });
        return;
    }

    // 转发音频控制消息到指定 tab 的所有 frames
    if (message.type === 'STUDIO_AUDIO_CONTROL' && message.tabId) {
        chrome.tabs.sendMessage(
            message.tabId,
            {
                type: 'STUDIO_AUDIO_CONTROL',
                volume: message.volume,
                muted: message.muted,
            },
            { frameId: message.frameId || 0 },
            (response) => {
                sendResponse(response || { success: false });
            }
        );
        return true; // 异步响应
    }
});

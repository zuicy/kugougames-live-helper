/**
 * kugougames直播监控室 - 音频控制 Content Script
 * 
 * 注入到 B 站直播播放器 iframe 内部（bilibili.com/blackboard/live/*）
 * 监听来自父页面的 postMessage，控制 <video> 元素的音量和静音状态
 * 
 * 通信协议：
 * {
 *   type: 'STUDIO_AUDIO_CONTROL',
 *   volume: number (0-1),     // 音量大小
 *   muted: boolean            // 是否静音
 * }
 */

(function () {
    'use strict';

    const LOG_PREFIX = '[kugougames音频控制]';

    // 查找页面中的 video 元素（B 站播放器通常有一个 <video> 标签）
    function findVideo() {
        return document.querySelector('video');
    }

    // 等待 video 元素出现（播放器可能还没加载完）
    function waitForVideo(timeout = 15000) {
        return new Promise((resolve) => {
            const video = findVideo();
            if (video) {
                resolve(video);
                return;
            }

            const observer = new MutationObserver(() => {
                const v = findVideo();
                if (v) {
                    observer.disconnect();
                    resolve(v);
                }
            });

            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true,
            });

            // 超时兜底
            setTimeout(() => {
                observer.disconnect();
                resolve(findVideo());
            }, timeout);
        });
    }

    // 控制音频
    function controlAudio(video, { volume, muted }) {
        if (!video) return;

        if (typeof volume === 'number') {
            video.volume = Math.max(0, Math.min(1, volume));
        }

        if (typeof muted === 'boolean') {
            video.muted = muted;
        }

        console.log(
            `${LOG_PREFIX} 音频控制: muted=${video.muted}, volume=${video.volume.toFixed(2)}`
        );
    }

    // 初始化
    async function init() {
        console.log(`${LOG_PREFIX} Content Script 已加载，等待播放器...`);

        const video = await waitForVideo();

        if (!video) {
            console.warn(`${LOG_PREFIX} 未找到 video 元素，音频控制不可用`);
            return;
        }

        console.log(`${LOG_PREFIX} 播放器已就绪，开始监听音频控制消息`);

        // 方式1：监听 postMessage（来自父页面）
        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || data.type !== 'STUDIO_AUDIO_CONTROL') return;

            // 重新查找 video（以防 DOM 变化）
            const currentVideo = findVideo() || video;
            controlAudio(currentVideo, data);
        });

        // 方式2：监听 chrome.runtime.onMessage（来自 background / popup）
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (!message || message.type !== 'STUDIO_AUDIO_CONTROL') return;

                const currentVideo = findVideo() || video;
                controlAudio(currentVideo, message);
                sendResponse({ success: true, muted: currentVideo.muted, volume: currentVideo.volume });
            });
        }

        // 向父页面报告扩展已就绪
        try {
            window.parent.postMessage({
                type: 'STUDIO_EXTENSION_READY',
                ready: true,
            }, '*');
        } catch (e) {
            // 跨域可能失败，忽略
        }
    }

    // 确保 DOM 已加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

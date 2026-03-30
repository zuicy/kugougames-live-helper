/**
 * kugougames直播监控室 - 音频控制 Content Script
 * 
 * 注入到 B 站直播播放器 iframe 内部（bilibili.com/blackboard/live/*）
 * 监听来自父页面的 postMessage，控制 <video> 元素的音量和静音状态
 * 
 * 通信协议：
 * 
 * 父页面 → iframe（控制指令）:
 * {
 *   type: 'STUDIO_AUDIO_CONTROL',
 *   volume: number (0-1),     // 音量大小
 *   muted: boolean            // 是否静音
 * }
 * 
 * iframe → 父页面（状态反馈）:
 * {
 *   type: 'STUDIO_AUDIO_STATUS',
 *   volume: number (0-1),     // 当前真实音量
 *   muted: boolean,           // 当前真实静音状态
 *   hasVideo: boolean         // 是否存在 video 元素
 * }
 */

(function () {
    'use strict';

    const LOG_PREFIX = '[kugougames音频控制]';

    /** 当前绑定的 video 元素引用 */
    let currentVideo = null;

    /** 持续监听 DOM 变化的 MutationObserver（自动重连机制） */
    let reconnectObserver = null;

    // ─── 查找 video 元素 ───

    function findVideo() {
        return document.querySelector('video');
    }

    // ─── 向父页面回传音频真实状态 ───

    function reportAudioStatus(video) {
        try {
            window.parent.postMessage({
                type: 'STUDIO_AUDIO_STATUS',
                volume: video ? video.volume : 0,
                muted: video ? video.muted : true,
                hasVideo: !!video,
            }, '*');
        } catch (e) {
            // 跨域可能失败，忽略
        }
    }

    // ─── 控制音频 ───

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

        // 控制完成后，回传真实状态给父页面
        reportAudioStatus(video);
    }

    // ─── 绑定 video 元素 ───

    function bindVideo(video) {
        if (!video || video === currentVideo) return;

        currentVideo = video;
        console.log(`${LOG_PREFIX} 已绑定 video 元素`);

        // 绑定新 video 后，立即上报一次状态
        reportAudioStatus(video);
    }

    // ─── 自动重连：持续监听 DOM 变化，video 被替换时自动重新绑定 ───

    function startReconnectObserver() {
        if (reconnectObserver) return; // 已在运行

        reconnectObserver = new MutationObserver(() => {
            const video = findVideo();

            if (video && video !== currentVideo) {
                // video 元素被替换了（如直播断线重连、清晰度切换等）
                console.log(`${LOG_PREFIX} 检测到 video 元素变化，自动重新绑定`);
                bindVideo(video);
            } else if (!video && currentVideo) {
                // video 被移除了
                console.log(`${LOG_PREFIX} video 元素已移除，等待重新出现...`);
                currentVideo = null;
                reportAudioStatus(null);
            }
        });

        reconnectObserver.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true,
        });

        console.log(`${LOG_PREFIX} 自动重连监听已启动`);
    }

    // ─── 等待首个 video 元素出现 ───

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

    // ─── 初始化 ───

    async function init() {
        console.log(`${LOG_PREFIX} Content Script 已加载，等待播放器...`);

        const video = await waitForVideo();

        if (!video) {
            console.warn(`${LOG_PREFIX} 未找到 video 元素，音频控制不可用`);
            // 即使没找到 video，也启动重连监听，后续出现时自动绑定
            startReconnectObserver();
            return;
        }

        console.log(`${LOG_PREFIX} 播放器已就绪，开始监听音频控制消息`);

        // 绑定当前 video
        bindVideo(video);

        // 启动自动重连监听（持续运行，应对 video 被替换的情况）
        startReconnectObserver();

        // 方式1：监听 postMessage（来自父页面）
        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || data.type !== 'STUDIO_AUDIO_CONTROL') return;

            // 优先使用当前绑定的 video，回退到重新查找
            const targetVideo = currentVideo || findVideo();
            controlAudio(targetVideo, data);
        });

        // 方式2：监听 chrome.runtime.onMessage（来自 background / popup）
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (!message || message.type !== 'STUDIO_AUDIO_CONTROL') return;

                const targetVideo = currentVideo || findVideo();
                controlAudio(targetVideo, message);
                sendResponse({ success: true, muted: targetVideo?.muted, volume: targetVideo?.volume });
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

# 变量城夜巡音频系统

当前版本使用程序化 WebAudio 合成音效，不依赖外部音频素材，保证 GitHub Pages 仍然可以静态托管。

## 已接入能力

- 设置面板支持静音和总音量。
- 浏览器首次点击或按键后解锁音频上下文。
- UI cue：打开面板、关闭面板、确认、危险操作、暂停、继续、开局。
- 战斗 cue：武器发射、闪避、修复脉冲、受击、拾取、敌人击破。
- Boss cue：开战、阶段变化、危险攻击预警。
- 结算 cue：胜利和失败。

## 后续素材化路线

1. 保留 `playAudioCue(name)` 作为游戏逻辑入口。
2. 将 `src/audio/synth-audio.js` 中的 cue 调度替换为音频素材播放器或混合方案。
3. 增加 BGM、章节环境氛围和 Boss 主题，并继续复用 `masterVolume` 与 `audioMuted` 设置。
4. 桌面版可把音频缓存和平台策略放入 `window.VariableCityPlatform` 的后续扩展中。

## 验证重点

- 静音后不再播放音效。
- 调整总音量后立即影响后续音效。
- 页面无用户手势时不强制播放，避免浏览器自动播放限制报错。
- `npm run check` 必须包含 `src/audio/synth-audio.js` 的语法检查。

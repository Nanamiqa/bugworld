# 变量城夜巡 Steam 化推进计划

目标：保留 GitHub Pages 在线试玩，同时逐步形成可提交 Steam Demo / 正式版的桌面发行能力。

## 当前原则

- `index.html` 和 `src/` 继续作为网页试玩入口，GitHub Pages 必须始终可玩。
- Steam 专属能力通过平台适配层接入，网页环境提供 no-op 或 localStorage fallback。
- 每轮自动推进至少交付一个端到端切片，并完成语法、资源、页面或构建验证。
- 新依赖、桌面构建、Steamworks SDK 接入需要按权限流程请求批准。

## 优先级路线

1. 平台适配层
   - 抽象存档、设置、全屏、成就、手柄状态。
   - 网页版仍使用 localStorage，桌面版改为文件存档并预留 Steam Cloud。
2. 基础 PC / Steam Deck 体验
   - 暂停菜单、设置菜单、全屏切换。
   - 手柄移动、修复脉冲、闪避、暂停。
   - UI 提示区显示当前输入方式。
3. 桌面发行壳
   - 添加 Electron 构建目录。
   - 输出 Windows 可执行目录，保持静态网页入口复用。
   - 后续接 SteamPipe 上传目录。
4. 文件存档与 Steam Cloud
   - 将跑局、档案、设置封装为平台存储 API。
   - 桌面版落地 JSON 文件，预留 Steam Auto-Cloud 路径。
5. 音频系统
   - BGM、环境氛围、Boss 音乐、危险预警、UI 音效。
   - 音量设置和静音能力。
6. 成就与商店素材
   - 先做本地成就事件，再接 Steamworks。
   - 准备 capsule、截图、宣传片素材清单。
7. 稳定性与性能
   - 30 分钟运行压测。
   - 全章节通关路线检查。
   - Canvas 非空、资源缺失、控制台错误自动检查。

## 当前切片

- [x] 五章内容、地图、Boss 机制已经形成可试玩主线。
- [x] 添加平台适配层，保证 Pages 和桌面版共用核心逻辑。
- [x] 添加暂停、设置、全屏、手柄基础输入。
- [x] 为桌面壳接入准备不破坏网页的目录结构。
- [x] 将桌面存档路径整理成 Steam Auto-Cloud 配置草案。
- [ ] 安装 Electron 依赖并验证桌面窗口启动。
- [x] 接入音频系统的设置项、静音和第一批 UI / 战斗音效。
- [x] 增加本地成就事件、成就清单与 Steamworks 映射草案。
- [x] 准备 Steam 商店截图、capsule 和宣传片素材清单。
- [x] 从 capsule source board 导出最终 capsule PNG，并接入尺寸校验流程。
- [ ] 接入截图自动捕获或人工复核流程，生成首批 1920x1080 商店截图。

## 每小时自动检查模板

每次自动执行时：

1. `git status -sb` 和 `git fetch origin`。
2. 阅读本文档，更新“当前切片”状态。
3. 完成一个小切片。
4. 运行：
   - `node --check src/main.js`
   - `node --check src/data/game-data.js`
   - `node --check src/platform/web-platform.js`
   - 新增桌面脚本的 `node --check`
   - 资源引用检查
   - 必要时浏览器本地加载检查
5. 提交并推送 `origin/main`。
6. 检查 GitHub Pages 仍可访问。

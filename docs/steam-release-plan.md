# 变量城夜巡 Steam 化推进计划

目标：保留 GitHub Pages 在线试玩，同时逐步形成可提交 Steam Demo / 正式版的桌面发行能力。

## 当前原则

- `index.html` 和 `src/` 继续作为网页试玩入口，GitHub Pages 必须始终可玩。
- Steam 专属能力通过平台适配层接入，网页环境提供 no-op 或 localStorage fallback。
- 每轮自动推进至少交付一个端到端切片，并完成语法、资源、页面或构建验证。
- 所有涉及图片素材的任务，包括地图元素、怪物、武器、特效、UI、Steam 商店图、截图占位和宣传素材，都优先自行生成、导出或处理成好看的可用素材，并保存到仓库合适目录；不要只写素材需求清单。
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
- [x] 增加 Electron 桌面壳预检和可自动退出的桌面窗口 smoke test。
- [x] 将桌面存档路径整理成 Steam Auto-Cloud 配置草案。
- [x] 安装 Electron 依赖并运行 `npm run desktop:smoke` 验证桌面窗口启动。
- [x] 解决 Electron 二进制下载超时，生成 `package-lock.json`，详见 `docs/steam-desktop-smoke.md`。
- [x] 接入音频系统的设置项、静音和第一批 UI / 战斗音效。
- [x] 增加本地成就事件、成就清单与 Steamworks 映射草案。
- [x] 准备 Steam 商店截图、capsule 和宣传片素材清单。
- [x] 从 capsule source board 导出最终 capsule PNG，并接入尺寸校验流程。
- [x] 接入截图自动捕获流程，生成首批 1920x1080 商店截图并做尺寸校验。
- [x] 人工复核首批商店截图并按 Steam 页面顺序筛选最终展示图。
- [x] 补齐 Steam 商店页面文案、标签、支持语言与最低配置草案。
- [x] 生成 Steam 商店页面文案预览图，便于人工检查中英文排版和卖点顺序。
- [x] 制作首版 Steam 新闻/公告草案，用于 Demo 上线前说明玩法范围、路线图和反馈入口。
- [x] 针对公告草案生成 Steam 富文本粘贴版，减少发布前的手工排版成本。
- [x] 生成 Steam 活动本地化导入 CSV 草案，方便后续批量录入事件标题、摘要和正文。
- [x] 回到 Electron 阻塞项，清理/重装 Electron 二进制并重新尝试 `npm run desktop:smoke`。
- [x] 运行 `npm run dist:win` 并校验 `dist/steam-demo` 目录包可作为 SteamPipe 上传源。
- [x] 稳定 Electron Builder 在自动化中的退出行为，避免目录包已产出但命令超时。
- [x] 增加桌面版长时间运行巡检脚本，采样 10-15 分钟内的页面错误、FPS 区间、存档写入和内存占用。
- [ ] 扩展桌面巡检为章节路线压力测试，覆盖全章节入口、Boss 触发、存档恢复和长地图移动。

## 每小时自动检查模板

每次自动执行时：

1. `git status -sb` 和 `git fetch origin`。
2. 阅读本文档，更新“当前切片”状态。
3. 完成一个小切片；如果涉及图片素材，先生成或导出素材，再接入代码、数据或文档。
4. 运行：
   - `node --check src/main.js`
   - `node --check src/data/game-data.js`
   - `node --check src/platform/web-platform.js`
   - 新增桌面脚本的 `node --check`
   - 资源引用检查、图片尺寸或透明度等素材检查
   - `npm run desktop:monitor:quick`
   - 涉及桌面发行时运行 `npm run dist:win`，它会自动串联目录包结构检查和打包 exe smoke test
   - 必要时浏览器本地加载检查
5. 提交并推送 `origin/main`。
6. 检查 GitHub Pages 仍可访问。

# 变量城夜巡桌面发行壳

这个目录保存 Steam / Windows 桌面版的最小 Electron 壳。网页入口仍然是根目录的 `index.html` 和 `src/`，所以 GitHub Pages 可以继续直接托管同一份游戏。

## 当前能力

- 复用 Canvas 网页版核心逻辑。
- 通过 `preload.cjs` 把 `window.VariableCityPlatform` 替换为桌面平台实现。
- 将档案、跑局存档、设置和本地成就写入 `%APPDATA%/variable-city-nightwatch/saves` 下的 JSON 文件，方便后续配置 Steam Auto-Cloud。
- 保留全屏、手柄读取和外链拦截基础。
- 使用 `desktop/steam/save-layout.json` 作为代码和 Steam Cloud 草案共用的存档清单。

## 本地验证

首次桌面运行需要安装依赖：

```powershell
npm install
npm run desktop
```

无依赖的桌面壳预检：

```powershell
npm run check:electron-shell
```

安装依赖后的自动窗口加载检查：

```powershell
npm run desktop:smoke
```

验证细节和当前 Electron 下载阻塞记录见 `docs/steam-desktop-smoke.md`。

构建 Windows 目录包：

```powershell
npm run dist:win
```

构建输出会进入 `dist/steam-demo`。下一步接 SteamPipe 时可以把该目录作为上传源之一。

检查 Steam Cloud 存档清单：

```powershell
npm run check:cloud
```

检查 Steam 商店素材生产清单：

```powershell
npm run check:store-assets
npm run check:store-page
npm run check:store-content
npm run check:announcement
```

导出 Steam capsule PNG：

```powershell
npm run export:store-capsules
```

捕获 1920 x 1080 Steam 商店截图：

```powershell
npm run capture:store-screenshots
```

生成 Steam 商店文案预览图：

```powershell
npm run export:store-content-preview
```

生成 Steam Demo 公告事件图：

```powershell
npm run export:announcement-assets
```

生成 Steam Demo 公告富文本粘贴版：

```powershell
npm run export:announcement-richtext
```

生成 Steam Demo 公告本地化 CSV 交接表：

```powershell
npm run export:announcement-localization
```

当前 Auto-Cloud 草案在 `desktop/steam/steam-autocloud.example.vdf`：

- Root: `WinAppDataRoaming`
- Subdirectory: `variable-city-nightwatch/saves`
- Pattern: `variable-city-*.json`

商店素材生产包在 `desktop/steam/store-assets/`：

- `store-assets.json` 记录 capsule、截图、宣传片镜头和中英文短描述。
- `../store-content.json` 记录可录入 Steamworks 的文案、标签、语言支持和系统需求草案。
- `../announcement-draft.json` 记录 Demo 上线前公告草案、路线图、反馈入口和事件图。
- `../announcements/` 保存可粘贴到 Steam 事件编辑器的 BBCode 草案。
- `capsules.html` 用现有 key art 生成第一版 capsule source board。
- `export/` 保存可提交的 capsule PNG，`screenshots/` 保存 headless 浏览器捕获的 Steam 截图，`review/` 保存截图顺序和文案预览图，`events/` 保存公告事件图。

## 不影响 Pages 的约束

- 不移动 `index.html`。
- 不把 Electron 专属代码引入 `src/main.js`。
- 平台差异只通过 `window.VariableCityPlatform` 注入。
- 网页版继续使用 `src/platform/web-platform.js` 的 localStorage fallback。

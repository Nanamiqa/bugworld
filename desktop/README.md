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

构建 Windows 目录包：

```powershell
npm run dist:win
```

构建输出会进入 `dist/steam-demo`。下一步接 SteamPipe 时可以把该目录作为上传源之一。

检查 Steam Cloud 存档清单：

```powershell
npm run check:cloud
```

当前 Auto-Cloud 草案在 `desktop/steam/steam-autocloud.example.vdf`：

- Root: `WinAppDataRoaming`
- Subdirectory: `variable-city-nightwatch/saves`
- Pattern: `variable-city-*.json`

## 不影响 Pages 的约束

- 不移动 `index.html`。
- 不把 Electron 专属代码引入 `src/main.js`。
- 平台差异只通过 `window.VariableCityPlatform` 注入。
- 网页版继续使用 `src/platform/web-platform.js` 的 localStorage fallback。

# Steam 桌面壳验证

本文件记录《变量城夜巡》桌面发行壳的验证方式。网页试玩入口仍是根目录 `index.html`，Electron 只作为 Steam / Windows 桌面版外壳。

## 已接入命令

无依赖预检：

```powershell
npm run check:electron-shell
```

该检查会验证：

- `package.json` 的 `main`、`desktop`、`desktop:smoke`、`dist:win` 和 build files。
- `desktop/electron/main.cjs` 会加载根目录 `index.html`。
- Electron 主进程保留外链拦截。
- `desktop/electron/preload.cjs` 会注入 `window.VariableCityPlatform`。
- 桌面存档和 Steam Cloud 元数据仍通过 `desktop/steam/save-layout.json` 读取。

安装依赖后的窗口 smoke test：

```powershell
npm install
npm run desktop:install-electron
npm run desktop:smoke
```

`desktop:smoke` 会启动 Electron，但不显示窗口；页面加载完成后自动检查：

- 页面标题是 `变量城夜巡`。
- `#gameCanvas` 存在。
- `window.VariableCityPlatform.id` 是 `electron`。
- 桌面存储模式能通过 preload bridge 暴露。

成功时会输出类似：

```text
Electron smoke ok: {"title":"变量城夜巡","hasCanvas":true,"platformId":"electron","storageMode":"file"}
```

如果 Electron 的 npm 包存在但 `node_modules/electron/dist/electron.exe` 缺失，可以单独重跑二进制安装：

```powershell
npm run desktop:install-electron
```

该脚本默认使用 `https://npmmirror.com/mirrors/electron/` 作为 `ELECTRON_MIRROR`，并把下载缓存放在 `tmp/electron-cache`。如需使用其他镜像，先设置 `ELECTRON_MIRROR` 环境变量再运行该脚本。

构建 Windows 目录包后验证产物：

```powershell
npm run dist:win
npm run dist:check
npm run dist:smoke
```

构建输出会进入 `dist/steam-demo`。`dist:check` 会确认 `win-unpacked`、产品 exe、`resources/app.asar` 和关键运行库存在；`dist:smoke` 会直接启动打包后的 exe，并用 `VARIABLE_CITY_ELECTRON_SMOKE=1` 验证它能加载游戏页面后自动退出。下一步接 SteamPipe 时可以把 `dist/steam-demo/win-unpacked` 作为上传源之一。

## 2026-07-02 修复记录

前序尝试：

```powershell
npm install
npm rebuild electron
npm run desktop:smoke
```

结果：`npm install` 与 `npm rebuild electron` 都在长时间等待后超时，`node_modules/electron` 只有 npm 包元数据，Electron 二进制没有成功下载。`npm run desktop:smoke` 因此提示 Electron 未正确安装。

本轮已完成：

```powershell
npm run desktop:install-electron
npm run desktop:smoke
npm install --package-lock-only --ignore-scripts
```

结果：Electron 31.7.7 Windows 二进制已下载到 `node_modules/electron/dist/electron.exe`，`desktop:smoke` 已通过，`package-lock.json` 已生成。

## 2026-07-02 目录包验证

本轮运行 `npm run dist:win` 时，Electron Builder 已产出 `dist/steam-demo/win-unpacked`，但命令在自动化 shell 中超过 180 秒超时。随后已直接验证产物：

```powershell
npm run dist:check
npm run dist:smoke
```

结果：`win-unpacked` 结构完整，打包后的 `变量城夜巡.exe` 在 smoke 模式下能加载页面并返回：

```text
Electron smoke ok: {"title":"变量城夜巡","hasCanvas":true,"platformId":"electron","storageMode":"file"}
```

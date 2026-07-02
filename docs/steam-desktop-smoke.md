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

## 2026-07-02 当前阻塞

本轮已尝试：

```powershell
npm install
npm rebuild electron
npm run desktop:smoke
```

结果：`npm install` 与 `npm rebuild electron` 都在长时间等待后超时，`node_modules/electron` 只有 npm 包元数据，Electron 二进制没有成功下载。`npm run desktop:smoke` 因此提示 Electron 未正确安装。

下一轮可继续从以下任一方向推进：

- 在网络稳定后重新运行 `npm install`，生成 `package-lock.json` 并完成 Electron 二进制下载。
- 若 registry / mirror 继续卡住，切换 Electron 下载镜像或预下载缓存目录。
- 依赖完成后运行 `npm run desktop:smoke`，通过后再尝试 `npm run dist:win`。

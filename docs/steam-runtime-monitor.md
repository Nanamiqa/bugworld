# Steam 运行时巡检

本文件记录桌面版稳定性巡检脚本。它不会替代人工试玩，但会把 Steam Demo 发包前最容易漏掉的技术问题提前拦住。

## 命令

快速门禁：

```powershell
npm run desktop:monitor:quick
```

正式巡检：

```powershell
npm run desktop:monitor
```

`desktop:monitor` 默认运行 10 分钟。可以用环境变量调整：

- `VARIABLE_CITY_RUNTIME_MONITOR_MS`：巡检时长，默认 `600000`。
- `VARIABLE_CITY_RUNTIME_MONITOR_SAMPLE_MS`：采样间隔，默认 `1000`。
- `VARIABLE_CITY_RUNTIME_MONITOR_MIN_FPS`：平均 FPS 下限，默认 `24`。
- `VARIABLE_CITY_RUNTIME_MONITOR_MAX_MB`：单进程 working set 上限，默认 `1200` MB。

## 覆盖范围

脚本会启动屏幕外 Electron 窗口，加载根目录 `index.html` 和同一个 `desktop/electron/preload.cjs` 平台桥，然后采样。窗口保持可渲染状态，避免 Chromium 对隐藏窗口进行 1 FPS 后台节流：

- 页面标题、Canvas 是否存在、Canvas 像素是否非空。
- `window.VariableCityPlatform.id` 是否为 `electron`。
- requestAnimationFrame 帧间隔，计算平均 FPS 和最差近期 FPS。
- `console.error`、页面 `error`、`unhandledrejection`、load failure、renderer crash。
- 桌面文件存储桥的 `writeJson`、`readJson`、`remove` 是否完整可用。
- Electron 主进程和渲染进程的内存 working set / private bytes。

每次运行会把完整报告写入：

```text
tmp/electron-runtime-monitor/latest.json
```

`tmp/` 不提交到仓库。自动任务使用 `desktop:monitor:quick`，发布候选包或长时间稳定性检查时使用默认 10 分钟的 `desktop:monitor`。

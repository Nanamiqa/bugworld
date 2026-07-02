# Steam 商店素材生产包

本文件记录《变量城夜巡》Steam 商店页素材的生产清单。网页试玩入口继续保持在 `index.html`，商店素材源文件独立放在 `desktop/steam/store-assets/`，不会影响 GitHub Pages。

## 官方参考

- Steamworks Graphical Assets: https://partner.steamgames.com/doc/store/assets
- Steamworks Trailers: https://partner.steamgames.com/doc/store/trailer

## 已落地文件

- `desktop/steam/store-assets/store-assets.json`：capsule、截图、宣传片镜头和中英文短描述清单。
- `desktop/steam/store-assets/capsules.html`：使用现有 key art 排版的 capsule source board。
- `desktop/tools/export-store-capsules.ps1`：使用现有 key art 和 manifest 导出 Steam capsule PNG。
- `desktop/tools/capture-store-screenshots.ps1`：启动本地静态服务器，用 Edge / Chrome headless 捕获商店截图。
- `desktop/tools/export-store-contact-sheet.ps1`：把最终截图展示顺序导出为 1920 x 1080 复核图。
- `desktop/tools/check-store-assets.cjs`：校验必需 capsule 尺寸、截图数量、源素材引用、宣传片镜头结构。
- `desktop/tools/check-store-page.cjs`：校验 Steam 页面截图顺序、capsule 引用和复核图尺寸。
- `desktop/steam/store-assets/export/`：后续导出 PNG 的目标目录。
- `desktop/steam/store-assets/screenshots/`：后续捕获商店截图的目标目录。
- `desktop/steam/store-assets/review/`：商店页人工复核和排序确认图。

## Capsule 当前尺寸

| 素材 | 尺寸 | 当前状态 |
| --- | --- | --- |
| Header Capsule | 920 x 430 | ready |
| Small Capsule | 462 x 174 | ready |
| Main Capsule | 1232 x 706 | ready |
| Vertical Capsule | 748 x 896 | ready |
| Library Capsule | 600 x 900 | ready |
| Library Hero | 3840 x 1240 | ready |
| Community Icon | 184 x 184 | ready |

导出当前 capsule PNG：

```powershell
npm run export:store-capsules
```

输出文件：

- `desktop/steam/store-assets/export/header_capsule.png`
- `desktop/steam/store-assets/export/small_capsule.png`
- `desktop/steam/store-assets/export/main_capsule.png`
- `desktop/steam/store-assets/export/vertical_capsule.png`
- `desktop/steam/store-assets/export/library_capsule.png`
- `desktop/steam/store-assets/export/library_hero.png`
- `desktop/steam/store-assets/export/community_icon.png`

## 截图计划

首批准备 6 张 1920 x 1080 商店截图。最终 Steam 页面展示顺序记录在 `desktop/steam/store-assets/store-page.json`：

1. 第一章 Boss 协议骑手·周行。
2. 第一章办公室地图与新办公桌椅。
3. 变量祝福与概念共鸣构筑。
4. 后续章节公共规则引擎核心。
5. 档案柜与章节练习入口。
6. PC 设置、全屏、音频与手柄。

每张截图都在 `store-assets.json` 里记录 `mustShow` 检查项。后续可以把 `storeShot` 查询参数接入游戏调试态，让 Playwright 或浏览器手动捕获稳定场景。

捕获当前 6 张截图：

```powershell
npm run capture:store-screenshots
```

输出文件：

- `desktop/steam/store-assets/screenshots/01-start-menu.png`
- `desktop/steam/store-assets/screenshots/02-office-map.png`
- `desktop/steam/store-assets/screenshots/03-roguelite-build.png`
- `desktop/steam/store-assets/screenshots/04-boss-protocol-rider.png`
- `desktop/steam/store-assets/screenshots/05-whitebox-core.png`
- `desktop/steam/store-assets/screenshots/06-pc-settings.png`

生成当前页面顺序复核图：

```powershell
npm run export:store-contact-sheet
```

输出文件：

- `desktop/steam/store-assets/review/store-screenshot-contact-sheet.png`

## 宣传片结构

首版宣传片目标 75 秒，按以下顺序剪：

1. 7 秒：规则引擎苏醒和 key art hook。
2. 11 秒：办公室探索、武器、拾取 bug 点。
3. 13 秒：变量祝福、概念共鸣、武器搭配。
4. 15 秒：五章地图机制差异。
5. 17 秒：Boss 阶段、窗口期和可读攻击。
6. 12 秒：标题、愿望单、试玩入口和 Steam Deck / PC 体验点。

## 校验

```powershell
npm run check:store-assets
npm run check:store-page
```

完整项目校验也会执行该脚本：

```powershell
npm run check
```

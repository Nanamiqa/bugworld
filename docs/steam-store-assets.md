# Steam 商店素材生产包

本文件记录《变量城夜巡》Steam 商店页素材的生产清单。网页试玩入口继续保持在 `index.html`，商店素材源文件独立放在 `desktop/steam/store-assets/`，不会影响 GitHub Pages。

## 官方参考

- Steamworks Graphical Assets: https://partner.steamgames.com/doc/store/assets
- Steamworks Trailers: https://partner.steamgames.com/doc/store/trailer

## 已落地文件

- `desktop/steam/store-assets/store-assets.json`：capsule、截图、宣传片镜头和中英文短描述清单。
- `desktop/steam/store-assets/capsules.html`：使用现有 key art 排版的 capsule source board。
- `desktop/tools/export-store-capsules.ps1`：使用现有 key art 和 manifest 导出 Steam capsule PNG。
- `desktop/tools/capture-store-screenshots.ps1`：转发到 Node/CDP 捕获器，启动本地静态服务器，用 Edge / Chrome headless 等待 `window.__variableCityStoreShotReady` 后捕获商店截图。
- `desktop/tools/export-store-contact-sheet.ps1`：把最终截图展示顺序导出为 1920 x 1080 复核图。
- `desktop/tools/export-store-content-preview.ps1`：把中英文商店页文案导出为人工复核预览图。
- `desktop/tools/export-steam-announcement-assets.ps1`：导出 Demo 公告 cover/header 图。
- `desktop/tools/export-steam-announcement-richtext.cjs`：导出 Demo 公告中英文 Steam BBCode 粘贴版。
- `desktop/tools/export-steam-announcement-localization.cjs`：导出 Demo 公告中英本地化 CSV 交接表。
- `desktop/tools/check-store-assets.cjs`：校验必需 capsule 尺寸、截图数量、源素材引用、宣传片镜头结构。
- `desktop/tools/check-store-page.cjs`：校验 Steam 页面截图顺序、capsule 引用和复核图尺寸。
- `desktop/tools/check-store-first-impression.cjs`：校验 Steam 截图首屏是否以 Boss 战斗和第二至五章实战证明开场，并检查截图尺寸、文件密度、取景路由和复核图。
- `desktop/tools/check-store-content.cjs`：校验商店页文案、标签、语言支持、功能和配置草案。
- `desktop/tools/check-steam-announcement.cjs`：校验 Demo 公告文案、路线图、反馈入口和事件图尺寸。
- `desktop/steam/store-content.json`：Steam 商店页录入草案，包含中英文文案、标签顺序、语言表和系统需求。
- `desktop/steam/announcement-draft.json`：Demo 上线前 Steam 新闻/公告草案。
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

当前准备 10 张 1920 x 1080 商店截图。最终 Steam 页面展示顺序记录在 `desktop/steam/store-assets/store-page.json`，首屏优先证明“能打、章节有差异、机制可读”：

1. 第一章 Boss 协议骑手·周行。
2. 第二章站台错拍实战镜头。
3. 第三章哈希盐雨实战镜头。
4. 第四章承诺根层实战镜头。
5. 第五章白箱申诉实战镜头。
6. 第一章办公室地图与新办公桌椅。
7. 变量祝福与概念共鸣构筑。
8. 后续章节公共规则引擎核心。
9. 档案柜与章节练习入口。
10. PC 设置、全屏、音频与手柄。

每张截图都在 `store-assets.json` 里记录 `mustShow` 检查项；第二至五章实战图使用 `storeShot=chapter-X-combat` 从可玩版本直接搭建装置、章节敌人机制、Boss 弱点窗口和武器特效。首屏排序和素材密度由 `check-store-first-impression.cjs` 自动校验，避免后续退回菜单/设置占据第一眼。

捕获当前 10 张截图：

```powershell
npm run capture:store-screenshots
```

只重捕某一张截图时使用截图 ID：

```powershell
npm run capture:store-screenshots -- screenshot_07_metro_combat_showcase
```

直接运行 PowerShell 脚本时也可以使用 `-OnlyId screenshot_07_metro_combat_showcase`。

输出文件：

- `desktop/steam/store-assets/screenshots/01-start-menu.png`：开场榜单、三套流派首榜、首榜奖励与 S 连胜局外成长截图，来自 `storeShot=leaderboard`。
- `desktop/steam/store-assets/screenshots/02-office-map.png`
- `desktop/steam/store-assets/screenshots/03-roguelite-build.png`
- `desktop/steam/store-assets/screenshots/04-boss-protocol-rider.png`
- `desktop/steam/store-assets/screenshots/05-whitebox-core.png`
- `desktop/steam/store-assets/screenshots/06-pc-settings.png`
- `desktop/steam/store-assets/screenshots/07-metro-combat-showcase.png`
- `desktop/steam/store-assets/screenshots/08-hash-combat-showcase.png`
- `desktop/steam/store-assets/screenshots/09-promise-combat-showcase.png`
- `desktop/steam/store-assets/screenshots/10-whitebox-combat-showcase.png`

生成当前页面顺序复核图：

```powershell
npm run export:store-contact-sheet
```

输出文件：

- `desktop/steam/store-assets/review/store-screenshot-contact-sheet.png`

生成开场榜传播图：

```powershell
npm run export:leaderboard-promo
```

输出文件：

- `desktop/steam/store-assets/review/leaderboard-meta-promo.png`：30 秒开场榜传播图，突出总榜 #1、三套 #1 全 S、S 连胜、首榜奖励和成就证明。

生成商店文案预览图：

```powershell
npm run export:store-content-preview
```

输出文件：

- `desktop/steam/store-assets/review/store-content-preview-zh-CN.png`
- `desktop/steam/store-assets/review/store-content-preview-en-US.png`

生成 Demo 公告事件图：

```powershell
npm run export:announcement-assets
```

输出文件：

- `desktop/steam/store-assets/events/demo-announcement-cover.png`
- `desktop/steam/store-assets/events/demo-announcement-header.png`

生成 Demo 公告富文本粘贴版：

```powershell
npm run export:announcement-richtext
```

输出文件：

- `desktop/steam/announcements/demo-scope-preview-001.zh-CN.bbcode`
- `desktop/steam/announcements/demo-scope-preview-001.en-US.bbcode`

生成 Demo 公告本地化 CSV：

```powershell
npm run export:announcement-localization
```

输出文件：

- `desktop/steam/announcements/demo-scope-preview-001.localization.csv`

## 宣传片结构

首版宣传片目标 75 秒，按以下顺序剪：

1. 7 秒：规则引擎苏醒和 key art hook。
2. 11 秒：办公室探索、武器、拾取 bug 点。
3. 13 秒：变量祝福、概念共鸣、武器搭配。
4. 15 秒：五章地图机制差异。
5. 17 秒：Boss 阶段、窗口期和可读攻击。
6. 12 秒：标题、愿望单、试玩入口和 Steam Deck / PC 体验点。

## 商店页内容草案

`desktop/steam/store-content.json` 现在记录可录入 Steamworks 的首版内容：

- 中文与英文 fallback 短描述、About This Game 段落和功能 bullet。
- 16 个按权重排序的 Steam 标签，首位突出 `Action Roguelike`。
- 语言支持：简体中文和英文界面/字幕，暂不声明完整音频。
- 商店功能：单人、成就草案、Steam Cloud 草案、基础手柄输入。
- Windows 最低/推荐配置草案；Electron 打包成功后需要实测并更新。
- 中英文 1920 x 1080 商店页预览图，用于人工检查标题、短描述、卖点、标签和系统需求顺序。

校验重点包括：描述不含外链、不使用 Steam UI 或价格导向措辞、标签数量在 5 到 20 之间、英文 fallback 存在、系统需求字段完整。

## 校验

```powershell
npm run check:store-assets
npm run check:store-page
npm run check:store-first-impression
npm run check:store-content
npm run check:announcement
```

完整项目校验也会执行该脚本：

```powershell
npm run check
```

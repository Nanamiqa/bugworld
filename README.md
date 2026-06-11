# 变量城夜巡

一个原创的都市异常轻肉鸽网页游戏原型。玩家扮演夜班调试员，在一座由规则引擎维持的现代城市里处理异常数据、选择武器构筑，并在系统关注度升高前稳定失控现场。

## 当前玩法

- 白色办公室场景中探索随机异常，场景包含工位、盆景、打印机、饮水机、会议桌、服务器柜、外卖取餐区等办公元素。
- 开局选择初始武器：回形针弹弓、键盘宏飞弹、修正液喷枪。
- 武器会自动锁定最近的异常实体并发射子弹，且每把武器已有专属特性雏形。
- 怪物会更密集地从办公室边缘涌入，击败后掉落可拾取的 `bug点`。
- 拾取 `bug点` 获得经验与 `bug点数`，经验满后升级并从三个“变量祝福”中选择强化。
- 第一章任务线：办公室弹幕异常、断点工牌回滚、乔柚登场、订单传输异常、外卖取餐区 Boss 战。
- 第一章 Boss：被 bug 附身的外卖小哥周行，会使用 TCP 握手冲刺、超时重传、UDP 乱送、FTP 大件传输、DNS 地址错误等网络协议化攻击。
- 处理异常会获得或消耗 `bug点数`。
- 武器升级参考动作肉鸽的祝福式三选一结构，包含普通、稀有、史诗品质。
- 修改 bug 会增加反噬，反噬过高会引来白箱巡检员。
- 击败 Boss 后救回周行，获得指向 `0号服务器间` 的后续线索。

## 操作

- `WASD` / 方向键：移动
- `J` / 回车：修复脉冲
- `Space`：短距闪避，消耗 1 点 `bug点数`
- 武器：自动发射，无需额外按键

## 文件

- `index.html`：游戏入口
- `src/styles.css`：界面样式
- `src/main.js`：游戏逻辑
- `src/data/game-data.js`：世界观、角色、章节、事件、武器、敌人、补丁数据
- `src/assets/abilities/`：升级祝福与概念能力图标素材
- `src/assets/characters/`：角色头像与游戏内小人素材
- `src/assets/enemies/`：怪物与敌人素材
- `src/assets/items/`：掉落物、资源与剧情道具素材
- `src/assets/props/`：办公室工位、设备、盆栽、服务器等场景道具素材
- `src/assets/scenes/`：场景背景、场景道具与场景素材表
- `src/assets/ui/`：卡牌、界面底板与 UI 图标素材
- `src/assets/weapons/`：武器图标与武器素材
- `src/assets/projectiles/`：子弹与投射物素材
- `src/assets/effects/`：技能和范围特效素材
- `src/assets/sheets/`：原始素材表归档
- `docs/world-bible.md`：世界观圣经与游戏化方向
- `docs/art/asset-generation-prompts.md`：AI 图像素材生成提示词
- `docs/design/00-game-pillars.md`：长期项目定位与设计支柱
- `docs/design/01-long-term-roadmap.md`：长期制作路线与双周节奏
- `docs/design/02-content-templates.md`：地图、武器、能力、敌人与羁绊模板
- `docs/design/03-chapter-one-steam-demo-template.md`：第一章 Steam Demo 质量补充模板

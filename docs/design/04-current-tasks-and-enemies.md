# 当前任务线与怪物整理

本文档记录当前原型里已经接入的第一章任务、异常事件、怪物与 Boss 信息，方便后续继续做正式关卡设计。

## 第一章任务线

章节名：第一章：订单已超时

当前目标总数：7

核心体验：办公室夜班中出现异常，安渡从工位异常一路追到外卖取餐区，发现外卖订单被公共规则引擎误识别成网络传输协议，最终解救被错误协议附身的外卖员周行。

### 开局：凌晨 03:32

触发内容：安渡从键盘上惊醒，报表停在错误代码行，手机显示外卖已超时 999 分钟。

玩家动作：选择初始武器。

已接入武器：

| 武器 | 定位 | 专属特性 |
| --- | --- | --- |
| 回形针弹弓 | 精准点杀 | 每第 4 次射击发射加粗精准弹 |
| 键盘宏飞弹 | 稳定覆盖 | 命中时轻微击退异常实体 |
| 修正液喷枪 | 近距控场 | 命中后短暂减速异常实体 |

### Step 0：调查工位区的弹幕异常

目标：调查工位区的弹幕异常

事件节点：`bullet-comments`，坐标约 `(540, 190)`

剧情结果：获得第一枚 bug点数，断点工牌开始发烫，外卖地图把办公室标成取餐终点。

下一步：查看断点工牌。

### Step 1：查看断点工牌中的旧版提示

目标：查看断点工牌中的旧版提示

事件节点：`debug-badge`，坐标约 `(250, 430)`

剧情结果：工牌提示“不要把所有差异都当成错误”，引出乔柚。

下一步：去找乔柚。

### Step 2：与乔柚会合，追踪订单异常源头

目标：与乔柚会合，追踪订单异常源头

前置剧情：乔柚第一次登场，解释情绪层漏进现实，压力毛球在重复“别超时、别差评、别取消”。

需要处理 2 个事件节点：

| 节点 | 坐标 | 作用 |
| --- | --- | --- |
| `emo-fluff` | `(910, 560)` | 情绪层异常，强化“订单焦虑”的主题 |
| `delivery-meat` | `(742, 248)` | 美食维度异常，把外卖和时间补偿绑定起来 |

剧情结果：乔柚解释“订单不是在配送食物，而是被规则引擎当成了网络数据包”。

下一步：清理通往外卖取餐区的错误路线。

### Step 3：清理通往外卖取餐区的错误路线

目标：清理通往外卖取餐区的错误路线

前置剧情：老梁通过办公室广播提醒，外卖异常不是普通怪物，而是一个人被订单规则套住了。

需要处理 2 个事件节点：

| 节点 | 坐标 | 作用 |
| --- | --- | --- |
| `promise-bloat` | `(1040, 190)` | 承诺层异常，制造“承诺膨胀”的办公讽刺 |
| `talking-cat` | `(250, 560)` | 动物维度异常，作为轻喜剧缓冲 |

额外效果：白箱巡检员会短暂锁定并出现。

剧情结果：取餐区灯光亮起，外卖柜弹开，地面路线像网线一样重算。

下一步：进入外卖取餐区。

### Step 4：Boss 战，协议骑手·周行

目标：靠近外卖取餐区，唤醒被附身的骑手

Boss 名：协议骑手·周行

剧情状态：周行被规则引擎当成传输节点，听不见人声，只重复“还有三单。不能超时。不能取消。不能停。”

战斗目标：打路线，别打人。断开错误配送协议，让周行醒来。

胜利结果：周行醒来，乔柚捡到一张冷掉的配送单，终点指向 0号服务器间。

胜利奖励：已处理 +1，bug点数 +4，反噬 -20。

## 当前异常事件牌

| ID | 名称 | 维度/类型 | 当前功能 |
| --- | --- | --- | --- |
| `bullet-comments` | 工牌上方冒出弹幕 | 异常弹幕 | 第一任务节点；可修复、改写成会议纪要或忽视 |
| `delivery-meat` | 超时外卖长出时间补偿肉 | 美食维度 | 乔柚线中的订单异常证据 |
| `promise-bloat` | 白板承诺膨胀成实体 | 承诺层 | 通往取餐区路线清理节点 |
| `emo-fluff` | emo 情绪滚成黑毛球 | emo维度 | 乔柚登场主题节点 |
| `debug-badge` | 断点工牌突然回滚 | 时空维度 | 主角信物节点 |
| `talking-cat` | 会说话的加班猫占领键盘 | 动物维度 | 路线清理中的轻喜剧节点 |
| `fish-dimension` | 茶水间出现摸鱼维度入口 | 摸鱼维度 | 已在事件池中，但第一章主线暂未固定使用 |

## 当前怪物信息

| ID | 名称 | 层级 | 角色定位 | HP | 速度 | 伤害 | XP | bug点 | 当前素材 |
| --- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | --- |
| `stress` | 压力毛球 | 情绪层 | 普通追击怪 | 55 | 72-98 | 6 | 2 | 1 | `stress-fluff.png` |
| `deadline` | 工单飞虫 | 结构层 | 快速追击怪 | 48 | 92-126 | 7 | 3 | 1 | `work-order-bug.png` |
| `cleaner` | 白箱巡检员 | 规则引擎 | 精英追击/清理机制 | 130 | 112 | 18 | 10 | 4 | `whitebox-inspector-sprite.png` |
| `floatError` | 浮点误差泡 | 数据层 | 摆动追击怪 | 42 | 62-118 | 5 | 3 | 1 | `floating-point-error-bubble.png` |
| `queueSnake` | 队列长蛇 | 结构层 | 中速队列怪 | 70 | 66-92 | 8 | 4 | 1 | `queue-snake.png` |
| `promise` | 承诺球 | 承诺层 | 慢速坦克怪 | 115 | 48-68 | 12 | 5 | 2 | `promise-ball.png` |
| `stackPile` | 栈叠叠怪 | 结构层 | 坦克怪 | 100 | 54-76 | 10 | 5 | 2 | `stack-pile-monster.png` |
| `inspectionProbe` | 巡检探针 | 规则引擎 | 高速巡逻怪 | 76 | 118-148 | 9 | 4 | 1 | `inspection-probe.png` |

### 当前刷怪池

| 阶段 | 刷怪池 |
| --- | --- |
| Step 0-1 | 压力毛球、压力毛球、工单飞虫 |
| Step 2 | 压力毛球、压力毛球、工单飞虫、浮点误差泡、队列长蛇 |
| Step 3 | 压力毛球、工单飞虫、工单飞虫、浮点误差泡、队列长蛇、承诺球、栈叠叠怪 |
| Step 4 / 章节完成后 | 全部普通怪物 + 巡检探针 |

## Boss 当前原型

Boss ID：`delivery-rider`

名称：协议骑手·周行

基础数值：

| 属性 | 当前值 |
| --- | ---: |
| HP | 1250 |
| 半径 | 34 |
| 移动速度 | 98 |
| 接触伤害 | 18 |
| Phase 2 阈值 | HP <= 65% |
| Phase 3 阈值 | HP <= 35% |

### 当前技能

| 技能 | 当前实现 | 设计意图 |
| --- | --- | --- |
| TCP 三次握手 | 先显示路线，随后沿路线冲刺；Phase 2 后留下重传路线 | 可预判的直线冲锋，强调“确认后送达” |
| 超时重传路线 | Boss 冲锋后留下旧路线影子，延迟造成伤害 | 让玩家记住旧路线，压缩走位空间 |
| UDP 乱送模式 | 向四周发射多个外卖包，Phase 3 数量更多 | 弹幕压力，表现“快但不确认收货” |
| FTP 大件传输 | 场地中央生成可破坏大件外卖包，带倒计时 | 强迫玩家转火处理目标 |
| DNS 地址解析错误 | 生成多个延迟爆点，部分靠近玩家 | 迫使玩家移动，表现地址被翻译到错误位置 |

## 后续设计待补充

### 任务线需要补充

1. 每个任务节点的明确教学目的：移动、拾取、武器升级、修复脉冲、躲避路线、转火目标。
2. 每个节点的场景摆放：障碍物、怪物入口、事件点、掉落密度。
3. 任务完成后的短期奖励：武器升级、bug点数、生命恢复、剧情信物。
4. 第一章 Demo 的结束节奏：打完 Boss 后是否直接结算，还是进入 0号服务器间预告。

### 怪物需要补充

1. 每个怪物的正式行为差异。当前大多数怪物仍是追击 AI，主要差异在数值。
2. 每个怪物的攻击预警与受击反馈。
3. 怪物与数据结构概念的玩法对应关系。
4. 怪物的掉落表和出现波次。

### Boss 需要补充

1. 周行的视觉关键词：外卖员、雨衣、头盔灯、外卖箱、数据线、倒计时、订单噪声。
2. 三阶段外观变化：普通骑手 -> 数据线缠绕 -> 规则引擎完全接管。
3. 每个技能的美术表现：地面路线、外卖包、传输进度条、错误地址标记、重传残影。
4. Boss 弱点是否可视化：外卖箱、头盔灯、背后数据线、订单核心。

## Boss 外卖员图像生成提示词

### Boss 本体：协议骑手·周行

已入库素材：`src/assets/bosses/delivery-rider-boss-phase1.png`

来源文件：`ChatGPT Image 2026年6月11日 22_14_30.png` 左侧阶段 1。

```text
Original 2D top-down chibi boss sprite for an urban anomaly roguelite game, pixel-art inspired, crisp outline, soft cel shading, transparent background, centered full body, readable at small size, game-ready PNG.

A Chinese delivery rider boss named Zhou Xing, exhausted but not evil, yellow raincoat with dark waterproof pants, delivery helmet with blinking teal status light, large square insulated delivery box on his back, teal data cables growing from the box and connecting to glowing order tickets, small countdown lights, rain droplets, office-at-night anomaly theme. He is standing in a tense forward-leaning pose, one hand holding a phone-like order scanner, the other gripping a delivery bag strap. The design should feel like a human trapped inside a wrong protocol, sympathetic and intense, not a monster. 3/4 top-down view, strong silhouette, teal data glow plus warm yellow delivery color.

no text, no readable letters, no numbers, no logo, no brand mark, no watermark, no signature, no UI, no frame, no border, no realistic photo, no copyrighted character, no fan art, no imitation of existing IP
```

### Boss 头像/剧情立绘

已入库素材：`src/assets/bosses/delivery-rider-boss-portrait.png`

来源文件：`ChatGPT Image 2026年6月11日 17_03_00.png`

```text
Original 2D game portrait, stylized anime-chibi hybrid, crisp outline, soft cel shading, transparent background, centered bust portrait, urban anomaly roguelite theme.

Zhou Xing, a tired Chinese delivery rider in a yellow raincoat and helmet, rain on his face shield, anxious eyes visible under the helmet, teal glitch light reflected in his eyes, delivery box straps crossing his shoulders, small data cables and glowing order-ticket fragments around him. Expression: overwhelmed, repeating orders in his head, but still human and worth saving. Warm yellow and teal color contrast, sympathetic boss character portrait.

no text, no readable letters, no numbers, no logo, no brand mark, no watermark, no signature, no UI frame, no realistic photo, no copyrighted character, no fan art, no imitation of existing IP
```

### Boss 技能与特效素材表

已入库素材表：`src/assets/sheets/boss-delivery-protocol-effect-sheet.png`

已切分素材：

- `src/assets/effects/boss-tcp-handshake-route.png`：TCP 三次握手冲刺路线预警。
- `src/assets/effects/boss-udp-delivery-package.png`：UDP 外卖包裹投射物。
- `src/assets/effects/boss-ftp-transfer-package.png`：FTP 大文件传输重箱危险物。
- `src/assets/effects/boss-dns-error-marker.png`：DNS 错误定位地面标记。
- `src/assets/effects/boss-timeout-retransmit-route.png`：超时重传残影路线。
- `src/assets/effects/boss-order-overload-aura.png`：订单过载环形力场。

```text
Original 2D game VFX and projectile sprite sheet, pixel-art inspired, transparent background, separated assets with enough spacing for cropping, modern office anomaly roguelite theme, teal data glow and warm yellow delivery color, no text.

Create a 3x2 sprite sheet of boss attack assets for a delivery rider protocol boss:
top-left: TCP handshake route telegraph, three glowing teal route pulses on an office floor line, directional dash warning.
top-middle: UDP delivery package projectile, small square delivery bag or parcel wrapped in yellow tape with teal data trail.
top-right: FTP large transfer package hazard, oversized delivery box with upload-like teal glow, cables, heavy dangerous feeling.
bottom-left: DNS error marker, circular ground warning reticle with broken location pin shape, teal and amber pulse.
bottom-middle: timeout retransmit ghost route, semi-transparent afterimage path with repeated parcel shadows, delayed danger feeling.
bottom-right: order overload aura, radial ring of floating blank order tickets and teal glitch particles around a rider.

Each asset must be isolated, readable at small size, no built-in words, no numbers, no logos, no UI frame, no background, no realistic photo, no copyrighted elements, no fan art, no imitation of existing IP
```

### Boss 三阶段外观变体

已入库素材表：`src/assets/sheets/delivery-rider-boss-phase-sheet.png`

已切分素材：

- `src/assets/bosses/delivery-rider-boss-phase1.png`：阶段 1，轻度协议异常。
- `src/assets/bosses/delivery-rider-boss-phase2.png`：阶段 2，订单线缆和路线环增强。
- `src/assets/bosses/delivery-rider-boss-phase3.png`：阶段 3，配送箱展开为协议核心。

```text
Original 2D top-down chibi boss character variant sheet, pixel-art inspired, transparent background, three separated full-body sprites in one horizontal row, game-ready PNG.

Show three phases of Zhou Xing, a delivery rider trapped by a wrong delivery protocol:
phase 1: exhausted human delivery rider, yellow raincoat, helmet light, delivery box, subtle teal data cables.
phase 2: more cables from the delivery box, glowing route lines around his boots, floating blank order slips, stronger teal glitch light.
phase 3: protocol overload, delivery box opened like a server core, many data cables, helmet light red-orange and teal, raincoat torn by glitch energy, still human silhouette visible and sympathetic.

Consistent proportions and pose language, 3/4 top-down view, no text, no readable letters, no numbers, no logo, no watermark, no signature, no UI, no frame, no realistic photo, no copyrighted character, no fan art, no imitation of existing IP
```

# AI 图像素材生成提示词

这些提示词用于为《变量城夜巡》生成可直接接入游戏的角色、武器、怪物、场景与 UI 素材。当前游戏是 Canvas 俯视轻像素风，所以优先生成透明背景 PNG，小体积、清晰轮廓、3/4 俯视角。

## 使用原则

### 最推荐的交付格式

- 角色、怪物、武器、道具：`PNG`，透明背景，正方形画布。
- 单体游戏内精灵：`1024 x 1024`，主体占画面 70%-85%，四周留 8%-12% 空白。
- 头像或立绘：`1024 x 1024` 或 `1536 x 1536`。
- 场景背景：`1920 x 1080` 或 `2048 x 1152`。
- 地图地块、办公家具：`1024 x 1024`，透明背景，可重复使用。

### 通用负面提示词

每次生成都建议带上：

```text
no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 通用风格锁定

建议把这一段放在每条提示词最前面，保持统一美术风格：

```text
Original 2D game asset for an urban anomaly roguelite RPG, cute chibi proportions, clean pixel-art inspired illustration, crisp silhouette, thick readable outline, soft cel shading, slightly top-down three-quarter view, modern white office and glowing data-anomaly theme, teal blue and warm yellow accent colors, transparent background, centered single subject, game-ready sprite, high readability at small size.
```

如果要做更像当前 Canvas 的小人，可以改成：

```text
Original 2D top-down chibi sprite, pixel-art inspired, blocky simplified shapes, clean readable silhouette, soft shadow, limited color palette, modern office anomaly theme, transparent background, centered single subject, game-ready PNG sprite.
```

## 命名建议

- `andu_sprite_idle.png`
- `qiao_you_sprite_idle.png`
- `lao_liang_sprite_idle.png`
- `whitebox_inspector_sprite_idle.png`
- `weapon_paperclip_slingshot_icon.png`
- `enemy_stress_fluff_sprite.png`
- `scene_office_night_background.png`
- `prop_server_rack.png`

## 角色素材

### 安渡：游戏内小人

用途：主角移动精灵。

```text
Original 2D top-down chibi sprite, pixel-art inspired, blocky simplified shapes, clean readable silhouette, soft shadow, limited color palette, modern office anomaly theme, transparent background, centered single subject, game-ready PNG sprite.

A 24-year-old male night-shift debugger in a modern office, slightly messy black hair, tired but kind eyes, white office shirt, dark tie with glowing blue data badge, black trousers, holding a smartphone-like debugging device in one hand and a small teal anomaly scanner in the other. Personality: reluctant worker becoming brave protector. Cute chibi proportions, 3/4 top-down view, full body, neutral idle pose.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 安渡：头像

用途：对话框头像、角色面板。

```text
Original 2D game portrait for an urban anomaly roguelite RPG, cute anime-inspired chibi portrait, crisp outline, soft cel shading, modern office anomaly theme, teal blue accent glow, clean transparent background, centered character bust.

A 24-year-old male night-shift debugger, messy black hair, tired warm eyes, white shirt, loosened dark tie, glowing blue data badge near the collar, expression of sleepy determination, subtle teal digital particles around him, original character design, friendly and readable.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no copyrighted character, no fan art, no imitation of existing IP
```

### 乔柚：游戏内小人

用途：跟随玩家的伙伴精灵。

```text
Original 2D top-down chibi sprite, pixel-art inspired, blocky simplified shapes, clean readable silhouette, soft shadow, limited color palette, modern office anomaly theme, transparent background, centered single subject, game-ready PNG sprite.

A 23-year-old female anomaly translator, cheerful and brave, brown twin ponytails with small purple hair clips, warm orange-brown eyes, soft pink and cream office-casual outfit, small bottle of signal-correction fluid in one hand, surrounded by two tiny pastel speech bubbles and a small dark emotion fluff companion. Cute chibi proportions, 3/4 top-down view, full body, friendly idle pose.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 乔柚：头像

用途：对话框头像、羁绊界面。

```text
Original 2D game portrait for an urban anomaly roguelite RPG, cute anime-inspired chibi portrait, crisp outline, soft cel shading, transparent background, centered character bust, pink and purple accent colors.

A 23-year-old female anomaly translator, lively and thoughtful, brown twin ponytails, purple hair clips, bright warm eyes, cream blouse with pink office jacket, holding a tiny bottle of correction fluid, listening carefully to invisible data noise, gentle confident smile, original character design.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no copyrighted character, no fan art, no imitation of existing IP
```

### 老梁：游戏内小人

用途：办公室 NPC、基地 NPC。

```text
Original 2D top-down chibi sprite, pixel-art inspired, blocky simplified shapes, clean readable silhouette, soft shadow, limited color palette, modern office anomaly theme, transparent background, centered single subject, game-ready PNG sprite.

A 45-year-old former office supervisor and hidden rules-engine maintainer, stocky chibi body, receding black hair, round glasses, small mustache, black jacket with warm yellow tie, holding a golden process-token coin and a worn clipboard, grounded humorous expression, protective senior coworker energy, 3/4 top-down view, full body.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 老梁：头像

用途：对话框头像、基地升级说明。

```text
Original 2D game portrait for an urban anomaly roguelite RPG, chibi portrait, crisp outline, soft cel shading, transparent background, centered character bust, warm yellow accent color.

A 45-year-old former supervisor, round glasses, small mustache, receding black hair, black office jacket, yellow tie, confident but kind expression, holding a clipboard with abstract flowchart shapes but no readable text, experienced mentor energy, original character design.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no copyrighted character, no fan art, no imitation of existing IP
```

### 白箱巡检员：游戏内小人

用途：精英敌人、追击者、后期伙伴。

```text
Original 2D top-down chibi sprite, pixel-art inspired, blocky simplified shapes, clean readable silhouette, soft shadow, limited color palette, modern office anomaly theme, transparent background, centered single subject, game-ready PNG sprite.

A small white inspection robot from a public rules engine, square monitor-like head, white and pale gray shell, black screen face with teal error glow but no readable text, blue antenna lights, compact body, two mechanical arms, one arm holding a vacuum-like data recovery hose, orderly and slightly intimidating, 3/4 top-down view, full body.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 白箱巡检员：头像

用途：系统广播、Boss 对话头像。

```text
Original 2D game portrait for an urban anomaly roguelite RPG, cute but intimidating robot portrait, crisp outline, soft cel shading, transparent background, centered bust.

A white inspection robot with a square monitor head, pale gray shell, black glass screen face, teal scanning line, small blue antenna lights, emotionless but curious, data recovery hose visible near shoulder, clean original robot design, no readable screen text.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no copyrighted character, no fan art, no imitation of existing IP
```

## 武器素材

### 回形针弹弓

用途：开局武器选择图标、HUD 武器图标、弹道强化图标。

```text
Original 2D game weapon icon, pixel-art inspired, crisp outline, soft cel shading, transparent background, centered single object, readable at small size.

A playful office-made slingshot built from oversized silver paperclips, teal rubber band made of glowing data threads, small blue debugging charm attached, precise and lightweight weapon, modern office anomaly theme, diagonal dynamic angle, no character holding it.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 键盘宏飞弹

用途：开局武器选择图标、武器图标。

```text
Original 2D game weapon icon, pixel-art inspired, crisp outline, soft cel shading, transparent background, centered single object, readable at small size.

A compact toy-like launcher made from keyboard keys and a small office keyboard frame, three glowing blue keycap missiles loaded at the front, stable multi-shot weapon, modern office anomaly theme, clean silhouette, diagonal dynamic angle, no readable letters on keycaps.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 修正液喷枪

用途：开局武器选择图标、武器图标。

```text
Original 2D game weapon icon, pixel-art inspired, crisp outline, soft cel shading, transparent background, centered single object, readable at small size.

A cute office correction-fluid spray gun, white bottle body, pink nozzle, teal glowing liquid chamber, short-range control weapon, small droplets of clean data mist around it, modern office anomaly theme, diagonal dynamic angle, no character holding it.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

## 子弹与特效素材

### 精准回形针弹

用途：回形针弹弓子弹。

```text
Original 2D game projectile sprite, pixel-art inspired, crisp outline, transparent background, centered single object.

A tiny glowing silver paperclip projectile wrapped in teal data light, fast precise bullet, simple readable silhouette, slight motion streak, top-down game sprite.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background
```

### 键盘按键弹

用途：键盘宏飞弹子弹。

```text
Original 2D game projectile sprite, pixel-art inspired, crisp outline, transparent background, centered single object.

A small square keyboard keycap projectile with blue glow, no letters or symbols on the keycap, toy-like missile feeling, soft motion trail, top-down game sprite, readable at small size.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background
```

### 修正液雾弹

用途：修正液喷枪子弹。

```text
Original 2D game projectile sprite, pixel-art inspired, crisp outline, transparent background, centered single object.

A small pink-white correction fluid droplet mixed with teal data sparkles, soft mist edge, short-range control projectile, top-down game sprite, readable at small size.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background
```

### 修复脉冲

用途：玩家按 `J`/回车触发的范围脉冲特效。

```text
Original 2D game VFX sprite, transparent background, centered circular effect, readable at small size.

A teal-blue circular debugging pulse, clean ring wave, small square pixel particles, soft glow, modern data anomaly theme, top-down area-of-effect effect, no text, no symbols, no character.

no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background
```

## 怪物素材

### 压力毛球

用途：普通追击怪，情绪层。

```text
Original 2D top-down chibi enemy sprite, pixel-art inspired, blocky simplified shapes, clean readable silhouette, soft shadow, transparent background, centered single creature, game-ready PNG sprite.

A dark fluffy stress creature from the emotion layer, round black-purple furball body, small tired white eyes, tiny horns or hair tufts, little purple arms, anxious but cute, faint red pressure sparks, 3/4 top-down view, no background.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 工单飞虫

用途：快速追击怪，结构层。

```text
Original 2D top-down chibi enemy sprite, pixel-art inspired, blocky simplified shapes, clean readable silhouette, soft shadow, transparent background, centered single creature, game-ready PNG sprite.

A red-orange office ticket bug creature, rectangular paper-like body, tiny wings made of sticky notes, two black eyes, small antenna with blue data ring, urgent and annoying expression, fast chaser enemy, 3/4 top-down view, no readable text on body.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 承诺球

用途：未来护盾怪，承诺层。

```text
Original 2D top-down chibi enemy sprite, pixel-art inspired, clean readable silhouette, soft shadow, transparent background, centered single creature, game-ready PNG sprite.

A swollen promise orb from an office whiteboard, round green-yellow sticky-note creature, shield-like shell made of layered blank notes, confident over-promising expression, small floating checkmark-shaped abstract marks with no text, slow tank enemy, 3/4 top-down view.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 巡检探针

用途：未来快速巡逻怪，规则引擎。

```text
Original 2D top-down chibi enemy sprite, pixel-art inspired, clean readable silhouette, soft shadow, transparent background, centered single robot, game-ready PNG sprite.

A small white inspection drone probe from a public rules engine, round camera eye, pale gray shell, blue scanning beam, tiny floating fins, neat and mechanical, fast patrol enemy, 3/4 top-down view, no readable screen text.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 浮点误差泡

用途：未来浮点数概念怪。

```text
Original 2D top-down chibi enemy sprite, pixel-art inspired, clean readable silhouette, soft shadow, transparent background, centered single creature, game-ready PNG sprite.

A translucent floating error bubble creature, soft cyan and violet colors, slightly distorted oval shape, tiny uncertain eyes, small orbiting decimal-like dots but no numbers, wobbly movement feeling, represents tiny accumulated measurement errors, 3/4 top-down view.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 队列长蛇

用途：未来队列概念怪。

```text
Original 2D top-down chibi enemy sprite, pixel-art inspired, clean readable silhouette, soft shadow, transparent background, centered single creature, game-ready PNG sprite.

A queue-shaped office anomaly creature made of several small connected ticket blocks, cute segmented body, first segment has a face, each segment is a blank ticket with no text, orderly line movement, represents first-in first-out behavior, 3/4 top-down view.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

### 栈叠叠怪

用途：未来栈概念怪。

```text
Original 2D top-down chibi enemy sprite, pixel-art inspired, clean readable silhouette, soft shadow, transparent background, centered single creature, game-ready PNG sprite.

A stack anomaly creature made of piled office folders and sticky notes, the top folder has a tiny face and little arms, unstable vertical pile, represents last-in first-out behavior, warm yellow and teal accents, 3/4 top-down view, no readable text.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI, no frame, no border, no blurry edges, no realistic photo, no complex background, no copyrighted character, no fan art, no imitation of existing IP
```

## 场景素材

### 办公室夜巡背景

用途：第一章主地图背景或宣传图。

```text
Original 2D top-down game background for an urban anomaly roguelite RPG, modern white office at 3 AM, clean readable layout, soft pixel-art inspired illustration, no characters, no UI, no text.

A bright but eerie modern office floor seen from a slightly top-down view, rows of desks, chairs, monitors, printer, water cooler, potted plants, meeting table, server racks near a sealed server room door, teal data glows leaking from corners, warm yellow office lights, subtle anomaly particles, clear walkable paths for a game map, high readability.

no text, no letters, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no copyrighted elements, no fan art, no imitation of existing IP
```

### 工位区地块

用途：可切成地图装饰和障碍物。

```text
Original 2D top-down game prop sheet, pixel-art inspired, transparent background, clean readable objects, modern white office theme, no text.

A set of separate office workstation props: white desks, gray chairs, black monitors with teal glow, blank papers, keyboard, coffee cup, small desk lamp, each object separated with enough space, consistent top-down three-quarter perspective, game-ready prop assets.

no letters, no numbers, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background
```

### 茶水间入口

用途：摸鱼维度入口、事件节点。

```text
Original 2D game prop, pixel-art inspired, transparent background, centered single object, modern office anomaly theme.

A cute office water cooler with a tiny glowing hidden door beside it, teal and green anomaly light leaking out, small floating relaxation particles, playful but mysterious, top-down three-quarter view, no readable sign text.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background
```

### 0号服务器间门口

用途：第一章最终节点、守门战背景装饰。

```text
Original 2D top-down game environment prop, pixel-art inspired, transparent background or simple isolated background, modern office anomaly theme.

A sealed server room entrance in a modern office, heavy white-gray sliding door, two dark server racks on both sides, teal warning glow from the door seam, blue cable lines on the floor, clean readable silhouette, mysterious final objective feeling, no readable text or numbers on the door.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no copyrighted elements
```

### 白色办公室家具包

用途：后续替换 Canvas 绘制的桌椅、打印机、绿植、服务器柜。

```text
Original 2D top-down game prop sheet, pixel-art inspired, transparent background, clean readable separate objects, modern white office theme, teal and warm yellow accents.

A prop sheet containing separated objects: office desk, office chair, printer, copier, water cooler, potted plant, meeting table, server rack, whiteboard with abstract colored lines but no readable text, window segment, all in consistent top-down three-quarter perspective, enough spacing between objects for cropping.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI, no frame, no border, no realistic photo, no complex background
```

## UI 与图标素材

### bug点

用途：掉落物、资源图标。

```text
Original 2D game resource icon, pixel-art inspired, crisp outline, transparent background, centered single object.

A small teal diamond-shaped data shard, glowing softly, white highlight in the center, cute and collectible, modern anomaly currency icon, readable at 32 pixels.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI frame, no border, no realistic photo, no complex background
```

### 断点工牌

用途：信物、剧情道具。

```text
Original 2D game item icon, pixel-art inspired, crisp outline, transparent background, centered single object.

A modern office ID badge with a glowing blue breakpoint symbol made of abstract shapes, white plastic card, dark lanyard, teal data particles, important story relic, no readable text or numbers on the badge.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI frame, no border, no realistic photo, no complex background
```

### 变量祝福卡

用途：升级三选一卡面背景。

```text
Original 2D game card background asset, clean stylized illustration, modern office anomaly roguelite theme, no text, no logo, no watermark.

A vertical upgrade card background with rounded corners, subtle teal data grid, warm yellow highlight, small abstract office icons and floating data particles, enough empty space in the center for game text to be added later, high readability, no built-in words.

no text, no letters, no numbers, no logo, no watermark, no signature, no character, no complex scene
```

## 概念能力图标

### 整数精准

```text
Original 2D game ability icon, pixel-art inspired, transparent background, centered symbol, readable at small size.

A solid teal cube snapping perfectly into a glowing grid cell, precise and stable feeling, represents whole numbers and exact counting, modern data anomaly theme, no text or numbers.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI frame, no realistic photo
```

### 浮点误差

```text
Original 2D game ability icon, pixel-art inspired, transparent background, centered symbol, readable at small size.

A soft cyan-violet liquid orb slightly missing the center of a target ring, tiny offset sparkles, represents small measurement error and flexible decimals, modern data anomaly theme, no text or numbers.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI frame, no realistic photo
```

### 数组连发

```text
Original 2D game ability icon, pixel-art inspired, transparent background, centered symbol, readable at small size.

A neat row of five small blank square tiles connected by a teal line, one tile glowing brighter, represents ordered slots and indexed sequence, modern data anomaly theme, no text or numbers.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI frame, no realistic photo
```

### 队列处理

```text
Original 2D game ability icon, pixel-art inspired, transparent background, centered symbol, readable at small size.

A line of small blank ticket blocks entering one side of a glowing office scanner and leaving the other side, first-in first-out feeling, teal and warm yellow accents, no text or numbers.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI frame, no realistic photo
```

### 栈回弹

```text
Original 2D game ability icon, pixel-art inspired, transparent background, centered symbol, readable at small size.

A vertical pile of blank sticky notes, the top note bouncing upward with a teal glow, represents last-in first-out behavior, modern office anomaly theme, no text or numbers.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI frame, no realistic photo
```

### 哈希锁定

```text
Original 2D game ability icon, pixel-art inspired, transparent background, centered symbol, readable at small size.

A glowing teal tag connected directly to a target reticle, fast lookup and precise matching feeling, modern data anomaly theme, warm yellow highlight, no text or numbers.

no text, no letters, no numbers, no logo, no watermark, no signature, no UI frame, no realistic photo
```

## 生成批次建议

第一批最值得生成：

1. `andu_sprite_idle.png`
2. `qiao_you_sprite_idle.png`
3. `lao_liang_sprite_idle.png`
4. `whitebox_inspector_sprite_idle.png`
5. `enemy_stress_fluff_sprite.png`
6. `enemy_deadline_bug_sprite.png`
7. `weapon_paperclip_slingshot_icon.png`
8. `weapon_keyboard_macro_icon.png`
9. `weapon_correction_fluid_icon.png`
10. `scene_office_night_background.png`

第二批再做：

1. 角色头像。
2. 子弹和特效。
3. 办公家具包。
4. 概念能力图标。
5. 未来怪物。

## 接入前检查

生成后先检查：

- 是否透明背景。
- 是否没有任何文字、数字、水印和 logo。
- 缩到 64px 时还能认出是谁。
- 主体是否居中，四周有没有裁切。
- 同类素材视角是否一致。
- 是否看起来像原创角色，而不是某个已有作品的变体。

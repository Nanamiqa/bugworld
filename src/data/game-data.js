window.GameData = {
  world: {
    title: "变量城夜巡",
    genre: "都市异常轻肉鸽 RPG",
    premise:
      "变量城是一座由公共规则引擎托管的现代都市。白天一切正常，夜晚人们的情绪、承诺、记忆和数字习惯会溢出成异常数据。夜班调试员要在办公室、街区和数据层之间稳定异常，让城市规则与自由变量共存。",
    dimensions: ["情绪层", "承诺层", "摸鱼层", "美食层", "时间层", "动物层", "结构层"],
    founders: ["旧版维护员", "城市调试组", "老梁", "匿名维护者"],
    threat: "公共规则引擎",
    endgame: "集齐三枚调试信物，重新校准公共规则引擎的异常判断。",
  },

  rules: [
    "少数人能看见并调试异常数据，这种能力通常来自长期接触规则引擎、持有调试信物，或在高压场景中被异常数据选中。",
    "每个异常都有作用和反噬。修复异常会获得 bug点数，但过度改写会提升系统关注度。",
    "武器和能力来自日常办公物品、调试工具和数据结构概念。它们既是战斗构筑，也是轻量科普入口。",
    "整数、浮点数、数组、栈、队列等概念可作为属性克制，玩家通过玩法感受“数得清”“会误差”“排成一列”“后进先出”“先来先处理”等直觉。",
    "白箱巡检员会回收异常变量。前期它是高压追击者，后续可通过剧情揭示它也在学习判断风险与差异。",
    "公共规则引擎会周期性升级。升级失败会制造新的异常日，例如季节错位、房间循环、时间卡帧或数据结构失衡。",
    "人类、异常实体、城市动物和巡检机制都可以协作或对抗。最终目标是让城市规则与自由变量共存。",
  ],

  characters: [
    {
      id: "andu",
      name: "安渡",
      age: 24,
      role: "主角，夜班调试员",
      personality: "前期只想准点下班、怕麻烦，后期愿意承担责任，擅长临场反应，对异常实体有同理心",
      goal: "查清变量城夜间异常增多的原因，保护城市里那些不该被清零的差异",
      taboo: "不利用异常伤害普通人，不为了效率抹掉有价值的个体差异",
      catchphrase: "摸鱼可以，变量不能乱飞。",
      relationships: {
        乔柚: "搭档兼知己",
        老梁: "前主管兼线索提供者",
        白箱巡检员: "前期敌对、后期可能成为盟友",
      },
    },
    {
      id: "qiao-you",
      name: "乔柚",
      age: 23,
      role: "搭档，异常翻译员",
      personality: "活泼、细心，有点迷糊，能听懂异常实体的数据噪声，擅长降低反噬",
      goal: "帮助安渡稳定变量城，收集异常实体的真实诉求",
      taboo: "不随意伤害无害异常，不把所有不同都归类为错误",
      catchphrase: "别急，我先听听它到底在报什么错。",
      relationships: {
        安渡: "搭档兼知己",
        老梁: "可靠但嘴硬的前辈",
        白箱巡检员: "需要重新校准的机制",
      },
    },
    {
      id: "lao-liang",
      name: "老梁",
      age: 45,
      role: "配角，前主管，隐藏的规则引擎维护者",
      personality: "嘴上现实、爱画流程图，实则重情义，熟悉城市旧版规则，懂得用生活经验解释抽象概念",
      goal: "保护自己的小店和旧同事，帮助主角理解变量城的底层历史",
      taboo: "不让承诺层异常变成灾难，不泄露会伤害普通人的核心权限",
      catchphrase: "流程可以慢，别把人当成空值。",
      relationships: {
        安渡: "前下属兼伙伴",
        乔柚: "伙伴",
        白箱巡检员: "旧规则的一部分",
      },
    },
  ],

  enemyTypes: {
    stress: {
      name: "压力毛球",
      layer: "情绪层",
      role: "chaser",
      render: "emo",
      assetKey: "enemyStressFluff",
      spriteSize: 56,
      radius: 15,
      hp: 55,
      speedMin: 72,
      speedMax: 98,
      damage: 6,
      xpValue: 2,
      bugValue: 1,
      deathColor: "#ef6a70",
      mechanic: {
        type: "splitOnDeath",
        count: 2,
        maxDepth: 1,
        hpMultiplier: 0.38,
        speedMultiplier: 1.2,
        scale: 0.68,
        spread: 44,
        log: "压力毛球被打散后分裂成两团小压力，范围脉冲能快速清场。",
      },
      hitLog: "压力实体撞上来，报表又多了一页。",
    },
    deadline: {
      name: "工单飞虫",
      layer: "结构层",
      role: "chaser",
      render: "deadline",
      assetKey: "enemyWorkOrderBug",
      spriteSize: 58,
      radius: 15,
      hp: 48,
      speedMin: 92,
      speedMax: 126,
      damage: 7,
      xpValue: 3,
      bugValue: 1,
      deathColor: "#ef6a70",
      mechanic: {
        type: "dashAtPlayer",
        initialDelay: 1.15,
        triggerRange: 560,
        telegraph: 0.48,
        duration: 0.34,
        cooldown: 2.45,
        dashSpeed: 470,
        dashDamage: 12,
        warnLog: "工单飞虫正在拉红线，横向走位可以躲开冲刺。",
        hitLog: "工单飞虫按截止时间冲刺命中，待办列表刺痛了一下。",
      },
      hitLog: "工单飞虫贴脸催办，安渡的待办列表多了一行。",
    },
    cleaner: {
      name: "白箱巡检员",
      layer: "规则引擎",
      role: "cleaner",
      render: "patrol",
      assetKey: "enemyCleanerSentinel",
      spriteSize: 72,
      radius: 24,
      hp: 130,
      speedMin: 112,
      speedMax: 112,
      damage: 18,
      xpValue: 10,
      bugValue: 4,
      deathColor: "#72a5ff",
      mechanic: {
        type: "scanLock",
        initialDelay: 1.4,
        interval: 3.25,
        radius: 88,
        armTime: 0.42,
        damage: 14,
        backlashOnHit: 7,
        color: "#72a5ff",
        warnLog: "白箱巡检员开始点名扫描，离开蓝圈或用冲刺穿出。",
        hitLog: "白箱点名命中，异常关注度上升。",
      },
      hitLog: "白箱巡检员擦掉了你的一段状态。",
    },
    floatError: {
      name: "浮点误差泡",
      layer: "数据层",
      role: "wobbler",
      render: "bubble",
      assetKey: "enemyFloatErrorBubble",
      spriteSize: 58,
      radius: 16,
      hp: 42,
      speedMin: 62,
      speedMax: 118,
      damage: 5,
      xpValue: 3,
      bugValue: 1,
      deathColor: "#8edcff",
      mechanic: {
        type: "phaseShift",
        initialDelay: 1.8,
        interval: 3.15,
        minDistance: 115,
        maxDistance: 255,
        fadeTime: 0.76,
        phaseDamageMultiplier: 0.55,
        color: "#8edcff",
        log: "浮点误差泡重新取整了坐标，闪烁时远程伤害会降低。",
      },
      hitLog: "浮点误差泡擦过身边，坐标小数点开始漂移。",
    },
    queueSnake: {
      name: "队列长蛇",
      layer: "结构层",
      role: "line-chaser",
      render: "queue",
      assetKey: "enemyQueueSnake",
      spriteSize: 70,
      radius: 18,
      hp: 70,
      speedMin: 66,
      speedMax: 92,
      damage: 8,
      xpValue: 4,
      bugValue: 1,
      deathColor: "#d7cabb",
      mechanic: {
        type: "leaveTrail",
        interval: 0.38,
        life: 3.35,
        radius: 31,
        slowFactor: 0.62,
        backlashPerSecond: 0.55,
        color: "#72a5ff",
      },
      hitLog: "队列长蛇把你塞进等待队伍，脚步慢了一拍。",
    },
    promise: {
      name: "承诺球",
      layer: "承诺层",
      role: "tank",
      render: "promise",
      assetKey: "enemyPromiseBall",
      spriteSize: 72,
      radius: 20,
      hp: 115,
      speedMin: 48,
      speedMax: 68,
      damage: 12,
      xpValue: 5,
      bugValue: 2,
      deathColor: "#96e072",
      mechanic: {
        type: "shieldAura",
        damageMultiplier: 0.38,
        refresh: 4.2,
        color: "#96e072",
        breakColor: "#f1c15b",
        breakLog: "修复脉冲拆掉了承诺护盾，趁现在集火。",
        refreshLog: "承诺球重新套上护盾，用修复脉冲可以拆掉它。",
      },
      hitLog: "承诺球撞上来，空气里全是未兑现的 TODO。",
    },
    stackPile: {
      name: "栈叠叠怪",
      layer: "结构层",
      role: "tank",
      render: "stack",
      assetKey: "enemyStackPile",
      spriteSize: 78,
      radius: 21,
      hp: 100,
      speedMin: 54,
      speedMax: 76,
      damage: 10,
      xpValue: 5,
      bugValue: 2,
      deathColor: "#f1c15b",
      mechanic: {
        type: "splitOnDeath",
        enemyType: "deadline",
        count: 3,
        maxDepth: 1,
        hpMultiplier: 0.42,
        speedMultiplier: 1.08,
        scale: 0.72,
        spread: 58,
        log: "栈叠叠怪坍塌成三张加急工单，先拉开距离。",
      },
      hitLog: "栈叠叠怪把新任务压到最上层，安渡差点被淹没。",
    },
    inspectionProbe: {
      name: "巡检探针",
      layer: "规则引擎",
      role: "patrol",
      render: "probe",
      assetKey: "enemyInspectionProbe",
      spriteSize: 66,
      radius: 18,
      hp: 76,
      speedMin: 118,
      speedMax: 148,
      damage: 9,
      xpValue: 4,
      bugValue: 1,
      deathColor: "#72a5ff",
      mechanic: {
        type: "scanLock",
        initialDelay: 1.2,
        interval: 2.95,
        radius: 74,
        armTime: 0.34,
        damage: 9,
        backlashOnHit: 5,
        color: "#72a5ff",
        warnLog: "巡检探针正在点名，离开蓝色扫描圈。",
        hitLog: "巡检探针完成坐标记录，白箱关注度抬升。",
      },
      hitLog: "巡检探针扫过你的工牌，系统关注度开始上升。",
    },
  },

  weapons: [
    {
      id: "paperclip",
      name: "回形针弹弓",
      role: "精准点杀",
      desc: "单发高速，适合点掉追击中的异常。",
      traitText: "专属：每第 4 次射击会发射一枚加粗精准弹。",
      color: "#5de2d1",
      assetKey: "weaponPaperclip",
      projectileAssetKey: "projectilePaperclip",
      projectileWidth: 34,
      projectileHeight: 18,
      damage: 28,
      cooldown: 0.34,
      bulletSpeed: 620,
      range: 560,
      projectileCount: 1,
      spread: 0,
      bulletSize: 4,
      pierce: 0,
      trait: {
        type: "chargedShot",
        every: 4,
        damageMultiplier: 1.85,
        bulletSizeAdd: 3,
        color: "#f1c15b",
      },
    },
    {
      id: "keyboard",
      name: "键盘宏飞弹",
      role: "稳定覆盖",
      desc: "一次打出三枚按键弹，覆盖面更稳。",
      traitText: "专属：命中时轻微击退异常实体。",
      color: "#72a5ff",
      assetKey: "weaponKeyboard",
      projectileAssetKey: "projectileKeycap",
      projectileWidth: 28,
      projectileHeight: 28,
      damage: 18,
      cooldown: 0.46,
      bulletSpeed: 520,
      range: 480,
      projectileCount: 3,
      spread: 0.22,
      bulletSize: 4,
      pierce: 0,
      trait: {
        type: "knockback",
        force: 18,
      },
    },
    {
      id: "correction-fluid",
      name: "修正液喷枪",
      role: "近距控场",
      desc: "近距离高频净化，压住贴脸的小怪。",
      traitText: "专属：命中后短暂减速异常实体。",
      color: "#f7b4d8",
      assetKey: "weaponCorrectionFluid",
      projectileAssetKey: "projectileCorrectionMist",
      projectileWidth: 30,
      projectileHeight: 30,
      damage: 12,
      cooldown: 0.16,
      bulletSpeed: 430,
      range: 310,
      projectileCount: 2,
      spread: 0.18,
      bulletSize: 5,
      pierce: 0,
      trait: {
        type: "slowOnHit",
        factor: 0.55,
        duration: 0.85,
      },
    },
  ],

  weaponUpgrades: [
    {
      id: "weapon-damage",
      title: "锐化异常断点",
      effect: "当前武器伤害 +9",
      iconKey: "abilityIntegerPrecision",
      actions: [
        { type: "modifyWeapon", stat: "damage", add: 9 },
        { type: "log", message: "武器的错误码边缘变锋利了。" },
      ],
    },
    {
      id: "weapon-cooldown",
      title: "冷却缓存",
      effect: "当前武器发射冷却 -15%",
      iconKey: "abilityQueueProcessing",
      actions: [
        { type: "modifyWeapon", stat: "cooldown", multiply: 0.85, min: 0.08 },
        { type: "log", message: "武器开始提前预读下一次攻击。" },
      ],
    },
    {
      id: "weapon-projectile",
      title: "多线程弹幕",
      effect: "当前武器子弹数 +1，散射略增",
      iconKey: "abilityArrayBarrage",
      actions: [
        { type: "modifyWeapon", stat: "projectileCount", add: 1, max: 7 },
        { type: "modifyWeapon", stat: "spread", add: 0.04, max: 0.46 },
        { type: "log", message: "弹道分裂成更热闹的 bug 弧线。" },
      ],
    },
    {
      id: "weapon-pierce",
      title: "穿透注释层",
      effect: "当前武器穿透 +1，射程 +70",
      iconKey: "abilityHashLock",
      actions: [
        { type: "modifyWeapon", stat: "pierce", add: 1, max: 3 },
        { type: "modifyWeapon", stat: "range", add: 70 },
        { type: "log", message: "子弹学会了穿过第一层异常注释。" },
      ],
    },
    {
      id: "weapon-speed",
      title: "弹道加速",
      effect: "当前武器弹速 +110，射程 +50",
      iconKey: "abilityFloatingPointError",
      actions: [
        { type: "modifyWeapon", stat: "bulletSpeed", add: 110 },
        { type: "modifyWeapon", stat: "range", add: 50 },
        { type: "log", message: "子弹像被老板催过一样冲了出去。" },
      ],
    },
    {
      id: "weapon-fat-bullet",
      title: "加粗高亮",
      effect: "当前武器子弹变大，伤害 +4，反噬 +5",
      iconKey: "abilityIntegerPrecision",
      actions: [
        { type: "modifyWeapon", stat: "bulletSize", add: 2, max: 10 },
        { type: "modifyWeapon", stat: "damage", add: 4 },
        { type: "gain", backlash: 5 },
        { type: "log", message: "攻击被加粗高亮，系统也多看了你一眼。" },
      ],
    },
    {
      id: "weapon-trait-boost",
      title: "核心特性过载",
      effect: "强化当前武器的专属特性",
      iconKey: "abilityStackRebound",
      actions: [
        { type: "boostWeaponTrait" },
        { type: "log", message: "武器的专属特性被重新校准。" },
      ],
    },
  ],

  chapterOne: {
    title: "第一章：订单已超时",
    totalObjectives: 7,
    opening: {
      speaker: "安渡",
      title: "凌晨 03:32",
      text: "安渡从键盘上惊醒。屏幕里的报表还停在错误代码那一行，手机却同时弹出一串外卖提醒：已超时 999 分钟。斜对面工位的工牌开始冒出不属于现实的弹幕。",
      choices: [{ title: "起身查看异常", effect: "办公室异常开始显形", actions: [{ type: "startChapterStep", step: 0 }] }],
    },
    steps: [
      {
        objective: "调查工位区的弹幕异常",
        node: { eventId: "bullet-comments", x: 540, y: 190 },
        afterEvent: {
          speaker: "安渡",
          title: "第一枚 bug点数",
          text: "弹幕消散后，安渡掌心多了一点青蓝色碎光。胸前的断点工牌发烫，手机里的外卖地图却突然把办公室标成了取餐终点。",
          choices: [{ title: "查看断点工牌", effect: "解锁旧版提示", actions: [{ type: "startChapterStep", step: 1 }] }],
        },
      },
      {
        objective: "查看断点工牌中的旧版提示",
        node: { eventId: "debug-badge", x: 250, y: 430 },
        afterEvent: {
          speaker: "断点工牌",
          title: "回滚的提示",
          text: "工牌投出一行断续文字：不要把所有差异都当成错误。下一秒，茶水间传来乔柚的声音：别直接清掉，它在学一个人的焦虑。",
          choices: [{ title: "去找乔柚", effect: "乔柚第一次登场", actions: [{ type: "startChapterStep", step: 2 }] }],
        },
      },
      {
        objective: "与乔柚会合，追踪订单异常源头",
        nodes: [
          { eventId: "emo-fluff", x: 910, y: 560 },
          { eventId: "delivery-meat", x: 742, y: 248 },
        ],
        requiredResolved: 2,
        intro: {
          speaker: "乔柚",
          title: "第一次听见异常",
          lines: [
            {
              speaker: "安渡",
              title: "茶水间的低语",
              text: "茶水间的灯一明一暗。饮水机旁蹲着一个女孩，她没有躲开那团黑色压力毛球，反而把手指轻轻放在它头上。",
            },
            {
              speaker: "乔柚",
              title: "异常翻译员",
              text: "嘘，别怕。它不是想咬人，它只是太吵了。",
            },
            {
              speaker: "安渡",
              title: "异常翻译员",
              text: "你在跟……一团加班情绪说话？",
            },
            {
              speaker: "乔柚",
              title: "现实只是界面",
              text: "情绪层漏进现实了。白天这里是办公室，夜里现实只是一层界面，下面还有情绪、承诺、时间、路线这些数据层。",
            },
            {
              speaker: "压力毛球",
              title: "重复噪声",
              text: "别超时。别差评。别取消。别超时。别差评。别取消。",
            },
            {
              speaker: "乔柚",
              title: "订单噪声",
              text: "听见了吗？它在学某个人的焦虑。源头在外卖取餐区，有人被订单声音盖住了。",
            },
          ],
          choices: [
            {
              title: "一起追踪订单噪声",
              effect: "乔柚加入，背景解锁，反噬 -10",
              actions: [
                { type: "addAlly", allyId: "qiao-you" },
                { type: "gain", backlash: -10, log: "乔柚加入临时值班队伍，异常噪声变得可读。" },
                { type: "resumeChapter" },
              ],
            },
          ],
        },
        afterEvent: {
          speaker: "乔柚",
          title: "外卖不是外卖",
          lines: [
            {
              speaker: "乔柚",
              title: "外卖不是外卖",
              text: "不对劲。那些订单不是在配送食物，它们被规则引擎当成了网络数据包。",
            },
            {
              speaker: "安渡",
              title: "外卖不是外卖",
              text: "外卖还能变网线？",
            },
            {
              speaker: "乔柚",
              title: "配送协议",
              text: "可以这么理解。下单是请求，地址是坐标，骑手像数据包，确认收货像 ACK。",
            },
            {
              speaker: "乔柚",
              title: "超时重传",
              text: "如果一直没有确认，系统就会超时重传。现在所有重传，都压在同一个人身上。",
            },
          ],
          choices: [{ title: "继续往取餐区推进", effect: "追踪错误路线", actions: [{ type: "startChapterStep", step: 3 }] }],
        },
      },
      {
        objective: "清理通往外卖取餐区的错误路线",
        nodes: [
          { eventId: "promise-bloat", x: 1040, y: 190 },
          { eventId: "talking-cat", x: 250, y: 560 },
        ],
        requiredResolved: 2,
        intro: {
          speaker: "老梁",
          title: "别把他当怪物",
          text: "办公室广播响起老梁的声音：别往取餐区硬冲。那边不是普通异常，是一个人被订单规则套住了。外卖叫补送，网络叫重传，反正都够烦。",
          choices: [
            {
              title: "沿错误路线前进",
              effect: "白箱巡检员短暂锁定，bug点数 +2",
              actions: [
                { type: "gain", bugPoints: 2, backlash: 10, log: "老梁把一段旧路线权限塞进了断点工牌。" },
                { type: "spawnCleaner", x: 1120, y: 96 },
                { type: "resumeChapter" },
              ],
            },
          ],
        },
        afterEvent: {
          speaker: "系统广播",
          title: "订单传输异常",
          text: "取餐区的灯全部亮起。外卖柜一格接一格弹开，里面没有餐盒，只有发烫的倒计时。地面路线开始像网线一样重算。",
          choices: [{ title: "进入外卖取餐区", effect: "触发第一章 Boss 战", actions: [{ type: "startChapterStep", step: 4 }] }],
        },
      },
      {
        objective: "靠近外卖取餐区，唤醒被附身的骑手",
        intro: {
          speaker: "周行",
          title: "倒计时骑手",
          lines: [
            {
              speaker: "系统广播",
              title: "外卖取餐区",
              text: "外卖取餐区的柜门一格接一格弹开。里面没有餐盒，只有一串串发烫的倒计时。",
            },
            {
              speaker: "系统广播",
              title: "路线重算",
              text: "地面亮起青蓝色路线，像有人把整座办公室接进了看不见的网络。",
            },
            {
              speaker: "周行",
              title: "倒计时骑手",
              text: "周行站在取餐架中央，雨衣还在往下滴水，头盔灯一闪一闪。背后的外卖箱长出数据线，线头扎进每一个取餐柜。",
            },
            {
              speaker: "周行",
              title: "倒计时骑手",
              text: "还有三单。不能超时。不能取消。不能停。",
            },
            {
              speaker: "安渡",
              title: "凌晨 03:32",
              text: "兄弟，现在是凌晨三点半，没人会因为这单投诉你。",
            },
            {
              speaker: "系统广播",
              title: "连接建立",
              text: "连接建立。等待确认。确认超时。准备重传。",
            },
            {
              speaker: "乔柚",
              title: "传输节点",
              text: "他听不见我们了。规则引擎把他当成传输节点，不是人。",
            },
            {
              speaker: "老梁",
              title: "旧广播",
              text: "打路线，别打人。断开错误配送协议，人才回得来。",
            },
          ],
          choices: [
            {
              title: "断开错误配送协议",
              effect: "开始 Boss 战：协议骑手·周行",
              actions: [{ type: "startBossFight", bossId: "delivery-rider" }],
            },
          ],
        },
      },
    ],
    bossVictory: {
      speaker: "乔柚",
      title: "订单已送达",
      lines: [
        {
          speaker: "周行",
          title: "醒来",
          text: "周行倒在外卖架前，第一反应还是去摸手机：我……超时了吗？",
        },
        {
          speaker: "安渡",
          title: "订单已送达",
          text: "超了。超得很彻底。但你人没丢。",
        },
        {
          speaker: "乔柚",
          title: "冷掉的配送单",
          text: "乔柚从散开的异常里捡起一张冷掉的配送单。单据上没有顾客名，终点却指向 0号服务器间。",
        },
      ],
      choices: [
        {
          title: "结束第一夜",
          effect: "完成第一章，解锁后续线索",
          actions: [
            { type: "gain", fixed: 1, bugPoints: 4, backlash: -20, log: "周行被救了下来，冷掉的配送单留下了新的路线。" },
            { type: "finishChapter" },
          ],
        },
      ],
    },
  },

  eventDeck: [
    {
      id: "bullet-comments",
      kicker: "异常弹幕",
      title: "工牌上方冒出弹幕",
      text: "弹幕正在剧透下一场背锅会议，字里行间夹着一条会自我复制的工单编号。",
      color: "#5de2d1",
      choices: [
        {
          title: "修复弹幕串行",
          effect: "bug点数 +2，反噬 +12，已修复 +1",
          actions: [{ type: "gain", bugPoints: 2, backlash: 12, fixed: 1, log: "弹幕安静了三秒，工单少了一半。" }],
        },
        {
          title: "把弹幕改成会议纪要",
          effect: "bug点数 +4，反噬 +24，生成压力实体",
          actions: [
            { type: "gain", bugPoints: 4, backlash: 24, log: "会议纪要开始自动替你骂需求。" },
            { type: "spawnEnemy", enemyType: "deadline", dx: 160, dy: -60 },
          ],
        },
        {
          title: "假装没看见",
          effect: "生命 +8，反噬 +5",
          actions: [{ type: "gain", hp: 8, backlash: 5, log: "安渡战略性移开视线，脖子轻松了一点。" }],
        },
      ],
    },
    {
      id: "delivery-meat",
      kicker: "美食维度",
      title: "超时外卖长出时间补偿肉",
      text: "饭盒边缘多出一块闪着蓝光的肉，咬下去可能多出十分钟，也可能多出十个老板。",
      color: "#f1c15b",
      choices: [
        {
          title: "切下稳定时间片",
          effect: "bug点数 +2，生命 +10，反噬 +10，已修复 +1",
          actions: [{ type: "gain", bugPoints: 2, hp: 10, backlash: 10, fixed: 1, log: "热量和时间一起回到了身体里。" }],
        },
        {
          title: "整块打包进系统",
          effect: "bug点数 +5，反噬 +28",
          actions: [{ type: "gain", bugPoints: 5, backlash: 28, log: "系统背包里传来一声油滋滋的提示音。" }],
        },
        {
          title: "分给乔柚",
          effect: "生命 +18，反噬 +8",
          actions: [{ type: "gain", hp: 18, backlash: 8, log: "乔柚竖起大拇指，顺手替你翻译掉一句阴阳怪气。" }],
        },
      ],
    },
    {
      id: "promise-bloat",
      kicker: "承诺层",
      title: "白板承诺膨胀成实体",
      text: "主管室白板上的圆越画越大，空气里开始掉落“下季度一定兑现”的碎屑。",
      color: "#96e072",
      choices: [
        {
          title: "把承诺折成补丁",
          effect: "bug点数 +3，反噬 +14，已修复 +1",
          actions: [{ type: "gain", bugPoints: 3, backlash: 14, fixed: 1, log: "白板恢复洁白，只剩一股烤面香。" }],
        },
        {
          title: "让承诺球砸向白箱巡检员",
          effect: "bug点数 -1，清除附近敌人，反噬 +18",
          requires: { bugPoints: 1 },
          actions: [
            { type: "spendBugPoints", amount: 1 },
            { type: "clearEnemiesNear", radius: 210 },
            { type: "gain", backlash: 18, log: "巨大的承诺球滚过办公区，压力实体被碾成碎屑。" },
          ],
        },
        {
          title: "认真记下承诺",
          effect: "bug点数 +1，反噬 +6",
          actions: [{ type: "gain", bugPoints: 1, backlash: 6, log: "纸面承诺微微发光，看起来很不真实。" }],
        },
      ],
    },
    {
      id: "emo-fluff",
      kicker: "emo维度",
      title: "emo 情绪滚成黑毛球",
      text: "黑毛球从工位底下钻出来，试图把加班记录啃成一个洞。",
      color: "#ef6a70",
      choices: [
        {
          title: "给它贴上待修标签",
          effect: "bug点数 +2，反噬 +10，已修复 +1",
          actions: [{ type: "gain", bugPoints: 2, backlash: 10, fixed: 1, log: "黑毛球缩成一枚温顺的错误码。" }],
        },
        {
          title: "塞进报表公式",
          effect: "bug点数 +4，生命 -8，反噬 +22",
          actions: [{ type: "gain", bugPoints: 4, hp: -8, backlash: 22, log: "公式跑通了，安渡的眼神也空了。" }],
        },
        {
          title: "让乔柚翻译",
          effect: "生命 +12，反噬 +7",
          actions: [{ type: "gain", hp: 12, backlash: 7, log: "乔柚听完毛球嘀咕，认真地点了点头。" }],
        },
      ],
    },
    {
      id: "debug-badge",
      kicker: "时空维度",
      title: "断点工牌突然回滚",
      text: "安渡胸前的断点工牌闪了三下，刚被删掉的错误日志从空气里飘回来。",
      color: "#72a5ff",
      choices: [
        {
          title: "截取一段回溯缓存",
          effect: "bug点数 +3，生命 +6，反噬 +16，已修复 +1",
          actions: [{ type: "gain", bugPoints: 3, hp: 6, backlash: 16, fixed: 1, log: "过去没有改变，但它给你留了一个接口。" }],
        },
        {
          title: "强行回滚当前异常",
          effect: "bug点数 +1，反噬 +30，清除附近敌人",
          actions: [
            { type: "gain", bugPoints: 1, backlash: 30, log: "办公室像视频一样卡顿回放。" },
            { type: "clearEnemiesNear", radius: 260 },
          ],
        },
        {
          title: "按住复位键不让它回滚",
          effect: "生命 +14，反噬 +9",
          actions: [{ type: "gain", hp: 14, backlash: 9, log: "断点工牌安静下来，状态灯像在喘气。" }],
        },
      ],
    },
    {
      id: "talking-cat",
      kicker: "动物维度",
      title: "会说话的加班猫占领键盘",
      text: "一只猫蹲在 Enter 键上，严肃宣布这个工位已经被动物维度临时接管。",
      color: "#d8b26e",
      choices: [
        {
          title: "请求猫猫代码审查",
          effect: "bug点数 +2，反噬 +8，已修复 +1",
          actions: [{ type: "gain", bugPoints: 2, backlash: 8, fixed: 1, log: "猫猫删掉了三行废话，留下一个爪印。" }],
        },
        {
          title: "给它开通管理员权限",
          effect: "bug点数 +5，反噬 +26，生成压力实体",
          actions: [
            { type: "gain", bugPoints: 5, backlash: 26, log: "猫猫开始用尾巴敲生产环境。" },
            { type: "spawnEnemy", enemyType: "deadline", dx: -150, dy: -80 },
          ],
        },
        {
          title: "把键盘让给它睡",
          effect: "生命 +16，反噬 +6",
          actions: [{ type: "gain", hp: 16, backlash: 6, log: "安渡获得短暂休息，键盘获得长期统治者。" }],
        },
      ],
    },
    {
      id: "fish-dimension",
      kicker: "摸鱼维度",
      title: "茶水间出现摸鱼维度入口",
      text: "饮水机旁边多了一扇很小的门，门牌写着：不摸鱼者不得入内。",
      color: "#89d6a5",
      choices: [
        {
          title: "用 bug点数买通门禁",
          effect: "bug点数 -1，生命 +24，反噬 +5，已修复 +1",
          requires: { bugPoints: 1 },
          actions: [
            { type: "spendBugPoints", amount: 1 },
            { type: "gain", hp: 24, backlash: 5, fixed: 1, log: "门后吹来带薪休息的风。" },
          ],
        },
        {
          title: "把入口折成免加班卡",
          effect: "bug点数 +3，反噬 +18，已修复 +1",
          actions: [{ type: "gain", bugPoints: 3, backlash: 18, fixed: 1, log: "卡面写着：仅限今天，也可能仅限梦里。" }],
        },
        {
          title: "拒绝诱惑继续巡查",
          effect: "bug点数 +1，生命 -4，反噬 +4",
          actions: [{ type: "gain", bugPoints: 1, hp: -4, backlash: 4, log: "安渡感觉自己成熟了，也更累了。" }],
        },
      ],
    },
  ],

  upgrades: [
    {
      id: "comment-reader",
      title: "弹幕阅读器",
      effect: "修复脉冲范围 +22",
      iconKey: "abilityArrayBarrage",
      actions: [
        { type: "modifyPlayer", stat: "pulseRadius", add: 22 },
        { type: "log", message: "弹幕的边缘变清晰了。" },
      ],
    },
    {
      id: "keyboard-macro",
      title: "键盘宏补丁",
      effect: "修复脉冲消耗 -1",
      iconKey: "abilityQueueProcessing",
      actions: [
        { type: "modifyPlayer", stat: "pulseCost", add: -1, min: 1 },
        { type: "log", message: "按键声开始有节奏地替你工作。" },
      ],
    },
    {
      id: "cold-brew-shield",
      title: "冷萃护盾",
      effect: "最大生命 +18，生命 +18",
      iconKey: "abilityStackRebound",
      actions: [
        { type: "modifyPlayer", stat: "maxHp", add: 18 },
        { type: "gain", hp: 18 },
        { type: "log", message: "冰冷的咖啡因让世界慢了半拍。" },
      ],
    },
    {
      id: "temporary-admin",
      title: "临时管理员",
      effect: "bug点数 +3，反噬 -10",
      iconKey: "abilityHashLock",
      actions: [
        { type: "gain", bugPoints: 3, backlash: -10 },
        { type: "log", message: "系统给了你一个看起来很假的权限章。" },
      ],
    },
    {
      id: "failed-slacker",
      title: "摆烂失败体质",
      effect: "移动速度 +24",
      iconKey: "abilityFloatingPointError",
      actions: [
        { type: "modifyPlayer", stat: "speed", add: 24 },
        { type: "log", message: "越想下班，脚步越快。" },
      ],
    },
    {
      id: "signal-clean-field",
      title: "乔柚的降噪场",
      effect: "反噬 -16，生命 +8",
      iconKey: "abilityIntegerPrecision",
      actions: [
        { type: "gain", backlash: -16, hp: 8 },
        { type: "log", message: "乔柚把异常噪声降到可以好好说话的程度。" },
      ],
    },
    {
      id: "promise-buffer",
      title: "老梁的流程缓冲",
      effect: "清除附近敌人，反噬 +8",
      iconKey: "abilityStackRebound",
      actions: [
        { type: "clearEnemiesNear", radius: 240 },
        { type: "gain", backlash: 8 },
        { type: "log", message: "老梁的流程缓冲铺开，附近异常被暂时归队。" },
      ],
    },
  ],
};

window.GameData.eventDeck.push(
  {
    id: "subway-loop",
    kicker: "时间层",
    title: "办公室地面驶过末班地铁",
    text: "瓷砖缝里亮起站台黄线。每一次广播报站，桌上的时钟都会退回一分钟。",
    color: "#72a5ff",
    choices: [
      {
        title: "校准环线时刻",
        effect: "bug点数 +3，反噬 +12，已修复 +1",
        actions: [{ type: "gain", bugPoints: 3, backlash: 12, fixed: 1, log: "环线停在了当前分钟，站台从桌脚下退开。" }],
      },
      {
        title: "偷取一班空车时间",
        effect: "移动速度 +16，反噬 +22",
        actions: [
          { type: "modifyPlayer", stat: "speed", add: 16 },
          { type: "gain", backlash: 22, log: "安渡把一节空车时间塞进鞋底，脚步轻了，影子慢了。" },
        ],
      },
      {
        title: "让列车先送走压力实体",
        effect: "清除附近敌人，反噬 +16",
        actions: [
          { type: "clearEnemiesNear", radius: 260, includeCleaners: true },
          { type: "gain", backlash: 16, log: "末班车带走一车厢噪声，只留下很远的刹车声。" },
        ],
      },
    ],
  },
  {
    id: "skipped-station",
    kicker: "队列规则",
    title: "跳站乘客排成错误队列",
    text: "一排透明乘客站在会议桌旁。每个人都拿着号码牌，但号码从 0 开始，又在 3 后面突然变成 17。",
    color: "#8edcff",
    choices: [
      {
        title: "按先来先处理重排",
        effect: "bug点数 +2，生命 +8，已修复 +1",
        actions: [{ type: "gain", bugPoints: 2, hp: 8, backlash: 9, fixed: 1, log: "队伍恢复成一条线，先等的人先离开。" }],
      },
      {
        title: "把 17 号插回 4 号后面",
        effect: "bug点数 +4，反噬 +24，生成队列长蛇",
        actions: [
          { type: "gain", bugPoints: 4, backlash: 24, log: "号码牌尖叫着归位，队列长蛇从缝隙里钻了出来。" },
          { type: "spawnEnemy", enemyType: "queueSnake", dx: 130, dy: -30 },
        ],
      },
      {
        title: "请乔柚听完投诉",
        effect: "反噬 -12，生命 +6",
        actions: [{ type: "gain", hp: 6, backlash: -12, log: "乔柚把每个没赶上的原因翻译成可处理的站名。" }],
      },
    ],
  },
  {
    id: "queue-timetable",
    kicker: "结构层",
    title: "时刻表开始自己排队",
    text: "白板上的列车班次排成一列。最前面的班次迟迟不走，后面的班次逐渐挤成一团。",
    color: "#5de2d1",
    choices: [
      {
        title: "弹出队首阻塞",
        effect: "bug点数 +3，已修复 +1",
        actions: [{ type: "gain", bugPoints: 3, backlash: 13, fixed: 1, log: "堵在队首的旧班次被弹出，后续时刻终于流动。" }],
      },
      {
        title: "复制一张备用时刻表",
        effect: "武器射速提升，反噬 +18",
        actions: [
          { type: "modifyWeapon", stat: "cooldown", multiply: 0.9, min: 0.08 },
          { type: "gain", backlash: 18, log: "备用时刻表叠在武器上，攻击节奏像发车间隔一样稳定。" },
        ],
      },
      {
        title: "让老梁画流程图",
        effect: "清除附近敌人，bug点数 +1",
        actions: [
          { type: "clearEnemiesNear", radius: 220 },
          { type: "gain", bugPoints: 1, backlash: 7, log: "老梁画了三条箭头，所有人都假装看懂了。" },
        ],
      },
    ],
  },
  {
    id: "clock-debt",
    kicker: "时间债",
    title: "借来的十分钟开始收利息",
    text: "屏幕右下角弹出一张账单：你上一次活下来的十分钟，本次需要偿还三十秒心跳。",
    color: "#f1c15b",
    choices: [
      {
        title: "分期偿还时间债",
        effect: "生命 -6，反噬 -18，已修复 +1",
        actions: [{ type: "gain", hp: -6, backlash: -18, fixed: 1, log: "时间债被拆成可承受的小格，心跳慢慢对齐。" }],
      },
      {
        title: "把债务抵给巡检员",
        effect: "生成白箱巡检员，bug点数 +5",
        actions: [
          { type: "gain", bugPoints: 5, backlash: 20, fixed: 1, log: "白箱巡检员收下账单，也顺手锁定了你。" },
          { type: "spawnCleaner", x: 1120, y: 110 },
        ],
      },
      {
        title: "用回形针夹住秒针",
        effect: "武器伤害 +6，反噬 +12",
        actions: [
          { type: "modifyWeapon", stat: "damage", add: 6 },
          { type: "gain", backlash: 12, log: "秒针停住半拍，下一发攻击变得扎实。" },
        ],
      },
    ],
  },
  {
    id: "night-market-hash",
    kicker: "哈希夜市",
    title: "夜市摊位只认散列后的名字",
    text: "摊主递来一串看不懂的短码，说这是你的真实姓名。旁边摊位上每个顾客都被折成了标签。",
    color: "#96e072",
    choices: [
      {
        title: "给名字加盐",
        effect: "bug点数 +3，反噬 +10，已修复 +1",
        actions: [{ type: "gain", bugPoints: 3, backlash: 10, fixed: 1, log: "名字被加上一粒盐，陌生算法再也猜不到完整的人。" }],
      },
      {
        title: "快速索引弱点",
        effect: "武器射程 +90，伤害 +4，反噬 +16",
        actions: [
          { type: "modifyWeapon", stat: "range", add: 90 },
          { type: "modifyWeapon", stat: "damage", add: 4 },
          { type: "gain", backlash: 16, log: "异常弱点被打上标签，武器开始提前锁定。" },
        ],
      },
      {
        title: "拒绝出示名字",
        effect: "反噬 -10，生命 +10",
        actions: [{ type: "gain", hp: 10, backlash: -10, log: "摊位沉默片刻，承认匿名也是一种保护。" }],
      },
    ],
  },
  {
    id: "duplicate-menu",
    kicker: "冲突键",
    title: "两份菜单用了同一个编号",
    text: "鱼丸和空白合同同时占用 404 号摊位。顾客排成两列，却都说自己没有走错。",
    color: "#ef6a70",
    choices: [
      {
        title: "重新分配摊位键",
        effect: "bug点数 +2，已修复 +1",
        actions: [{ type: "gain", bugPoints: 2, backlash: 11, fixed: 1, log: "404 被拆成 404-A 和 404-B，夜市松了一口气。" }],
      },
      {
        title: "利用冲突制造双倍折扣",
        effect: "bug点数 +5，生命 +10，反噬 +28",
        actions: [{ type: "gain", bugPoints: 5, hp: 10, backlash: 28, log: "两份菜单同时打折，规则引擎同时皱眉。" }],
      },
      {
        title: "把冲突丢给承诺球",
        effect: "生成承诺球，武器穿透 +1",
        actions: [
          { type: "modifyWeapon", stat: "pierce", add: 1, max: 3 },
          { type: "spawnEnemy", enemyType: "promise", dx: 100, dy: -60 },
          { type: "gain", backlash: 14, log: "承诺球吞下冲突，子弹学会穿过第一层理由。" },
        ],
      },
    ],
  },
  {
    id: "salted-memory",
    kicker: "记忆加盐",
    title: "老梁的小票藏着不存在的昨日",
    text: "小票背面写着安渡昨天没来过夜市，又写着他已经在这里失败过十七次。",
    color: "#d8b26e",
    choices: [
      {
        title: "保留矛盾记忆",
        effect: "最大生命 +12，反噬 +12，已修复 +1",
        actions: [
          { type: "modifyPlayer", stat: "maxHp", add: 12 },
          { type: "gain", hp: 12, backlash: 12, fixed: 1, log: "矛盾没有被删掉，它变成了一点额外韧性。" },
        ],
      },
      {
        title: "烧掉小票",
        effect: "反噬 -22，bug点数 -1",
        requires: { bugPoints: 1 },
        actions: [
          { type: "spendBugPoints", amount: 1 },
          { type: "gain", backlash: -22, log: "纸灰卷进夜风，某个追踪标记失效了。" },
        ],
      },
      {
        title: "追问老梁",
        effect: "bug点数 +2，生成巡检探针",
        actions: [
          { type: "gain", bugPoints: 2, backlash: 18, fixed: 1, log: "老梁沉默了一秒，夜市的摄像头同时转向你。" },
          { type: "spawnEnemy", enemyType: "inspectionProbe", dx: 160, dy: -90 },
        ],
      },
    ],
  },
  {
    id: "price-index",
    kicker: "价格索引",
    title: "所有价格都指向同一碗面",
    text: "菜单上的价格不断跳转，咖啡、煎饼、钥匙扣和一段旧权限都显示为 12 元。",
    color: "#f1c15b",
    choices: [
      {
        title: "修正价格索引",
        effect: "bug点数 +3，已修复 +1",
        actions: [{ type: "gain", bugPoints: 3, backlash: 12, fixed: 1, log: "价格回到各自摊位，夜市重新学会区分价值。" }],
      },
      {
        title: "买下旧权限",
        effect: "bug点数 -2，武器特性强化",
        requires: { bugPoints: 2 },
        actions: [
          { type: "spendBugPoints", amount: 2 },
          { type: "boostWeaponTrait" },
          { type: "gain", backlash: 8, log: "旧权限像调料一样撒进武器核心，味道很危险。" },
        ],
      },
      {
        title: "让乔柚议价",
        effect: "生命 +14，反噬 -8",
        actions: [{ type: "gain", hp: 14, backlash: -8, log: "乔柚认真听完摊主抱怨，价格自己降了下来。" }],
      },
    ],
  },
  {
    id: "branch-pledge",
    kicker: "树结构",
    title: "承诺在楼梯间分叉生长",
    text: "每一句“以后一定”都长出一条楼梯。楼梯尽头不是出口，而是更多写着以后一定的门。",
    color: "#96e072",
    choices: [
      {
        title: "剪掉空头分支",
        effect: "bug点数 +3，已修复 +1",
        actions: [{ type: "gain", bugPoints: 3, backlash: 12, fixed: 1, log: "空头分支落地后碎成便签，主干终于能承重。" }],
      },
      {
        title: "把分支嫁接到武器上",
        effect: "子弹数 +1，反噬 +18",
        actions: [
          { type: "modifyWeapon", stat: "projectileCount", add: 1, max: 7 },
          { type: "modifyWeapon", stat: "spread", add: 0.03, max: 0.46 },
          { type: "gain", backlash: 18, log: "武器长出一条新分支，攻击开始横向蔓延。" },
        ],
      },
      {
        title: "沿最旧的根往下查",
        effect: "bug点数 +1，反噬 -12",
        actions: [{ type: "gain", bugPoints: 1, backlash: -12, fixed: 1, log: "最旧的根没有撒谎，它只是被埋得太深。" }],
      },
    ],
  },
  {
    id: "null-contract",
    kicker: "空值合同",
    title: "合同甲方显示为空",
    text: "打印机吐出一份合同，甲方、乙方、日期全是空白，只有违约责任写得密密麻麻。",
    color: "#d7cabb",
    choices: [
      {
        title: "拒绝空值责任",
        effect: "反噬 -16，已修复 +1",
        actions: [{ type: "gain", backlash: -16, fixed: 1, log: "空白处没有资格要求任何人负责。" }],
      },
      {
        title: "填入公共规则引擎",
        effect: "bug点数 +5，生成白箱巡检员",
        actions: [
          { type: "gain", bugPoints: 5, backlash: 24, fixed: 1, log: "合同终于有了甲方，甲方也终于找到了你。" },
          { type: "spawnCleaner", x: 1160, y: 118 },
        ],
      },
      {
        title: "把空值当作护盾",
        effect: "最大生命 +10，生命 +18，反噬 +10",
        actions: [
          { type: "modifyPlayer", stat: "maxHp", add: 10 },
          { type: "gain", hp: 18, backlash: 10, log: "空白责任挡下一层伤害，但它仍然空得让人不安。" },
        ],
      },
    ],
  },
  {
    id: "stack-debt",
    kicker: "栈溢出",
    title: "未兑现事项一层层压下来",
    text: "天花板垂下一摞便签。最上面写着今天要做，下面每一张都写着昨天也这么说。",
    color: "#f1c15b",
    choices: [
      {
        title: "从最上层开始处理",
        effect: "bug点数 +2，已修复 +1",
        actions: [{ type: "gain", bugPoints: 2, backlash: 9, fixed: 1, log: "最近的承诺先被处理，便签塔暂时没有倒塌。" }],
      },
      {
        title: "整摞推给老梁",
        effect: "清除附近敌人，反噬 +20",
        actions: [
          { type: "clearEnemiesNear", radius: 300 },
          { type: "gain", backlash: 20, log: "老梁接住便签塔，嘴上骂人，手上已经开始排序。" },
        ],
      },
      {
        title: "压进武器缓存",
        effect: "武器伤害 +8，冷却 +8%",
        actions: [
          { type: "modifyWeapon", stat: "damage", add: 8 },
          { type: "modifyWeapon", stat: "cooldown", multiply: 1.08 },
          { type: "gain", backlash: 8, log: "武器每次攻击都更重，也更像一份加班清单。" },
        ],
      },
    ],
  },
  {
    id: "graph-alley",
    kicker: "图结构",
    title: "走廊变成互相连接的节点",
    text: "每扇门都通向另一扇门。安渡往前走三步，又从自己的背后经过。",
    color: "#5de2d1",
    choices: [
      {
        title: "标出最短路径",
        effect: "移动速度 +12，已修复 +1",
        actions: [
          { type: "modifyPlayer", stat: "speed", add: 12 },
          { type: "gain", bugPoints: 2, backlash: 10, fixed: 1, log: "最短路径亮起，走廊第一次承认有出口。" },
        ],
      },
      {
        title: "让攻击沿边传导",
        effect: "武器穿透 +1，射程 +60，反噬 +16",
        actions: [
          { type: "modifyWeapon", stat: "pierce", add: 1, max: 3 },
          { type: "modifyWeapon", stat: "range", add: 60 },
          { type: "gain", backlash: 16, log: "子弹顺着节点关系跳转，像知道谁和谁相连。" },
        ],
      },
      {
        title: "断开危险边",
        effect: "清除附近敌人，反噬 -6",
        actions: [
          { type: "clearEnemiesNear", radius: 230, includeCleaners: true },
          { type: "gain", backlash: -6, fixed: 1, log: "危险连接被断开，系统关注度短暂下降。" },
        ],
      },
    ],
  },
  {
    id: "inspector-memory",
    kicker: "白箱记忆",
    title: "巡检员播放你的选择记录",
    text: "白箱巡检员没有攻击。它打开胸口的屏幕，播放你每一次没有清除异常实体的决定。",
    color: "#d8e0e8",
    choices: [
      {
        title: "承认这些选择",
        effect: "反噬 -20，生命 +10，已修复 +1",
        actions: [{ type: "gain", hp: 10, backlash: -20, fixed: 1, log: "巡检员把部分选择标记为可解释，而不是错误。" }],
      },
      {
        title: "删除记录保护同伴",
        effect: "bug点数 +4，反噬 +26",
        actions: [{ type: "gain", bugPoints: 4, backlash: 26, fixed: 1, log: "记录被擦掉，白箱的学习曲线断了一截。" }],
      },
      {
        title: "把记录交给乔柚翻译",
        effect: "反噬 -12，生成巡检探针",
        actions: [
          { type: "gain", backlash: -12, fixed: 1, log: "乔柚把选择翻成了人话，但探针仍在等待判定。" },
          { type: "spawnEnemy", enemyType: "inspectionProbe", dx: 140, dy: -80 },
        ],
      },
    ],
  },
  {
    id: "city-heart",
    kicker: "零号核心",
    title: "0号服务器间露出城市心跳",
    text: "服务器柜后面不是机房，而是一整座城市的夜间心跳。每一次心跳都会产生一个不完全相同的人。",
    color: "#ef6a70",
    choices: [
      {
        title: "允许差异继续存在",
        effect: "反噬 -18，bug点数 +2，已修复 +1",
        actions: [{ type: "gain", bugPoints: 2, backlash: -18, fixed: 1, log: "核心没有变安静，但它变得可以被听见。" }],
      },
      {
        title: "临时关闭核心噪声",
        effect: "清除附近敌人，反噬 +22",
        actions: [
          { type: "clearEnemiesNear", radius: 320, includeCleaners: true },
          { type: "gain", backlash: 22, fixed: 1, log: "城市静了一秒，安静得像没有人住在里面。" },
        ],
      },
      {
        title: "把心跳同步到武器",
        effect: "伤害 +7，冷却 -8%，反噬 +14",
        actions: [
          { type: "modifyWeapon", stat: "damage", add: 7 },
          { type: "modifyWeapon", stat: "cooldown", multiply: 0.92, min: 0.08 },
          { type: "gain", backlash: 14, log: "武器跟着城市心跳发亮，像一盏不肯熄灭的灯。" },
        ],
      },
    ],
  }
);

window.GameData.upgrades.push(
  {
    id: "integer-anchor",
    title: "整数锚点",
    effect: "武器伤害 +6，子弹变大；适合精准暴击流",
    iconKey: "abilityIntegerPrecision",
    actions: [
      { type: "modifyWeapon", stat: "damage", add: 6 },
      { type: "modifyWeapon", stat: "bulletSize", add: 1, max: 10 },
      { type: "log", message: "整数锚点让每次命中都更像确定答案。" },
    ],
  },
  {
    id: "float-cloud",
    title: "浮点云雾",
    effect: "子弹数 +1，散射增加，反噬 +4；适合范围覆盖流",
    iconKey: "abilityFloatingPointError",
    actions: [
      { type: "modifyWeapon", stat: "projectileCount", add: 1, max: 7 },
      { type: "modifyWeapon", stat: "spread", add: 0.05, max: 0.46 },
      { type: "gain", backlash: 4 },
      { type: "log", message: "浮点云雾让弹道带上漂亮又危险的小误差。" },
    ],
  },
  {
    id: "array-indexer",
    title: "数组索引器",
    effect: "射程 +80，弹速 +80；适合远距索敌流",
    iconKey: "abilityArrayBarrage",
    actions: [
      { type: "modifyWeapon", stat: "range", add: 80 },
      { type: "modifyWeapon", stat: "bulletSpeed", add: 80 },
      { type: "log", message: "数组索引器把远处目标标成第几个异常。" },
    ],
  },
  {
    id: "stack-parry",
    title: "栈式回弹",
    effect: "最大生命 +12，修复脉冲伤害 +14；适合近身反打",
    iconKey: "abilityStackRebound",
    actions: [
      { type: "modifyPlayer", stat: "maxHp", add: 12 },
      { type: "modifyPlayer", stat: "pulseDamage", add: 14 },
      { type: "gain", hp: 12 },
      { type: "log", message: "最近压上来的异常，会被最近弹回去。" },
    ],
  },
  {
    id: "queue-autopilot",
    title: "队列自动机",
    effect: "武器冷却 -10%，移动速度 +10；适合持续输出流",
    iconKey: "abilityQueueProcessing",
    actions: [
      { type: "modifyWeapon", stat: "cooldown", multiply: 0.9, min: 0.08 },
      { type: "modifyPlayer", stat: "speed", add: 10 },
      { type: "log", message: "队列自动机让下一次攻击早早排好号。" },
    ],
  },
  {
    id: "hash-weakpoint",
    title: "哈希弱点表",
    effect: "伤害 +5，穿透 +1，反噬 +6；适合精英击穿",
    iconKey: "abilityHashLock",
    actions: [
      { type: "modifyWeapon", stat: "damage", add: 5 },
      { type: "modifyWeapon", stat: "pierce", add: 1, max: 3 },
      { type: "gain", backlash: 6 },
      { type: "log", message: "每个异常都被映射到一个更容易打中的位置。" },
    ],
  },
  {
    id: "tree-brancher",
    title: "承诺树分枝",
    effect: "子弹数 +1，最大生命 +8，反噬 +8",
    iconKey: "abilityArrayBarrage",
    actions: [
      { type: "modifyWeapon", stat: "projectileCount", add: 1, max: 7 },
      { type: "modifyPlayer", stat: "maxHp", add: 8 },
      { type: "gain", hp: 8, backlash: 8 },
      { type: "log", message: "一条承诺分成两条路，你选择都带上。" },
    ],
  },
  {
    id: "graph-conduction",
    title: "图节点传导",
    effect: "修复脉冲范围 +18，武器射程 +55",
    iconKey: "abilityHashLock",
    actions: [
      { type: "modifyPlayer", stat: "pulseRadius", add: 18 },
      { type: "modifyWeapon", stat: "range", add: 55 },
      { type: "log", message: "异常节点之间的连接被你借来传导攻击。" },
    ],
  }
);

window.GameData.chapterOne.initialObjective = "调查办公室异常";
window.GameData.chapterOne.startLog = "凌晨 03:32，安渡从键盘上醒来。手机显示：外卖订单已超时 999 分钟。";
window.GameData.chapterOne.danger = 1;
window.GameData.chapterOne.enemyPools = {
  early: ["stress", "stress", "deadline"],
  mid: ["stress", "deadline", "floatError", "queueSnake"],
  late: ["stress", "deadline", "deadline", "floatError", "promise", "queueSnake"],
  boss: ["deadline", "floatError", "queueSnake", "promise", "inspectionProbe"],
};
window.GameData.chapterOne.boss = {
  id: "delivery-rider",
  name: "协议骑手·周行",
  objective: "打断错误配送协议，救回外卖小哥周行",
  startLog: "Boss 战开始：订单被误识别成网络数据包。躲开路线，打掉大件包。",
  hp: 1750,
  speed: 112,
  damage: 22,
  difficulty: 1,
  themeColor: "#5de2d1",
  packageColor: "#f1c15b",
  phaseLogs: {
    2: "周行的外卖箱开始触发超时重传。",
    3: "错误路线开始 DNS 解析，取餐区变成一张发烫的网。",
  },
};
window.GameData.chapterOne.bossVictory.choices[0].title = "带着冷掉配送单进入 0号服务器间";
window.GameData.chapterOne.bossVictory.choices[0].effect = "完成第一章，夜巡继续";

const chapterTwo = {
  title: "第二章：环线卡帧",
  totalObjectives: 7,
  initialObjective: "追踪 0号服务器间里的地铁环线",
  startLog: "冷掉配送单在服务器门前折成一张地铁票，终点写着：昨天的凌晨 03:32。",
  danger: 1.08,
  enemyPools: {
    early: ["stress", "deadline", "queueSnake"],
    mid: ["queueSnake", "queueSnake", "floatError", "deadline"],
    late: ["queueSnake", "floatError", "inspectionProbe", "promise", "stackPile"],
    boss: ["queueSnake", "floatError", "inspectionProbe", "stackPile"],
  },
  opening: {
    speaker: "系统广播",
    title: "0号服务器间",
    lines: [
      {
        speaker: "系统广播",
        title: "门后站台",
        text: "0号服务器间的门打开后，里面没有服务器，只有一座空站台。列车灯从机柜缝隙里掠过，像有人把时间铺成了轨道。",
      },
      {
        speaker: "安渡",
        title: "冷掉配送单",
        text: "这张配送单正在变成地铁票。终点站写的是……昨天？",
      },
      {
        speaker: "乔柚",
        title: "环线噪声",
        text: "它不是要把我们送去别的地方，它想把某个迟到的人一直留在来得及之前。",
      },
    ],
    choices: [{ title: "踏上空站台", effect: "第二章开始：时间层与队列异常", actions: [{ type: "startChapterStep", step: 0 }] }],
  },
  steps: [
    {
      objective: "稳定办公室地面驶过的末班地铁",
      node: { eventId: "subway-loop", x: 638, y: 478 },
      afterEvent: {
        speaker: "老梁",
        title: "环线不是路",
        text: "老梁的声音从广播里钻出来：环线看起来一直往前，其实是在原地找借口。别追列车，查站名。",
        choices: [{ title: "检查跳站名单", effect: "寻找队列错误", actions: [{ type: "startChapterStep", step: 1 }] }],
      },
    },
    {
      objective: "修复跳站乘客与自排队时刻表",
      nodes: [
        { eventId: "skipped-station", x: 316, y: 196 },
        { eventId: "queue-timetable", x: 948, y: 236 },
      ],
      requiredResolved: 2,
      afterEvent: {
        speaker: "乔柚",
        title: "第一处反转",
        lines: [
          {
            speaker: "乔柚",
            title: "不是地铁坏了",
            text: "乘客的噪声对齐了。它们不是害怕迟到，是害怕有一个人一旦准时到站，就会被规则引擎删除。",
          },
          {
            speaker: "安渡",
            title: "被保护的迟到",
            text: "所以整条环线卡住，是为了保护一个迟到的人？",
          },
          {
            speaker: "老梁",
            title: "旧站名",
            text: "别急着感动。查清那个人是谁。系统为了保护一个人，可能会让整座城永远不能到站。",
          },
        ],
        choices: [{ title: "追查时间债账单", effect: "发现被保护者身份", actions: [{ type: "startChapterStep", step: 2 }] }],
      },
    },
    {
      objective: "处理借来的十分钟时间债",
      node: { eventId: "clock-debt", x: 1096, y: 526 },
      intro: {
        speaker: "系统广播",
        title: "时间债账单",
        text: "广播开始念账单：借款人，安渡。借款时间，昨夜 03:32。担保人，空白。",
        choices: [{ title: "打开账单", effect: "时间债异常显形", actions: [{ type: "resumeChapter" }] }],
      },
      afterEvent: {
        speaker: "安渡",
        title: "第二处反转",
        lines: [
          {
            speaker: "安渡",
            title: "借款人",
            text: "我昨天根本不在这里。",
          },
          {
            speaker: "乔柚",
            title: "另一个你",
            text: "账单是真的。可借时间的不是现在的你，是一个已经被环线擦成影子的旧版本。",
          },
          {
            speaker: "老梁",
            title: "别急着还",
            text: "那不是债，是证据。有人用你的影子挡过一次清除。",
          },
        ],
        choices: [{ title: "追上时刻表管理员", effect: "进入环线核心", actions: [{ type: "startChapterStep", step: 3 }] }],
      },
    },
    {
      objective: "清出通往环线核心的阻塞班次",
      nodes: [
        { eventId: "debug-badge", x: 248, y: 534 },
        { eventId: "fish-dimension", x: 704, y: 164 },
      ],
      requiredResolved: 2,
      afterEvent: {
        speaker: "系统广播",
        title: "终点站未开放",
        text: "所有站名同时熄灭，只剩一个牌子亮着：时刻表管理员正在校准迟到者。",
        choices: [{ title: "进入终点站", effect: "触发第二章 Boss 战", actions: [{ type: "startChapterStep", step: 4 }] }],
      },
    },
    {
      objective: "面对时刻表管理员",
      intro: {
        speaker: "时刻表管理员",
        title: "准点是一种删除",
        lines: [
          {
            speaker: "系统广播",
            title: "终点站",
            text: "站台尽头站着一名白箱巡检员。它手里没有武器，只有一本写满到站时间的册子。",
          },
          {
            speaker: "时刻表管理员",
            title: "准点是一种删除",
            text: "所有偏差都应校准。迟到者不进入系统，系统便不会承认迟到者存在。",
          },
          {
            speaker: "乔柚",
            title: "听见了",
            text: "它不是想杀你。它在执行一条很旧的保护命令，但保护命令已经忘了为什么保护。",
          },
        ],
        choices: [{ title: "改写保护命令", effect: "开始 Boss 战：时刻表管理员", actions: [{ type: "startBossFight", bossId: "timetable-admin" }] }],
      },
    },
  ],
  boss: {
    id: "timetable-admin",
    name: "时刻表管理员",
    objective: "打断环线校准，保住被擦成影子的旧安渡",
    startLog: "Boss 战开始：它会用发车路线冲刺，并把旧路线延迟重放。",
    hp: 2050,
    speed: 118,
    damage: 24,
    difficulty: 1.08,
    themeColor: "#72a5ff",
    packageColor: "#8edcff",
    phaseLogs: {
      2: "时刻表管理员翻到下一页，所有路线开始延迟重放。",
      3: "终点站开始错位，站名被解析到你的脚下。",
    },
    attackLogs: {
      handshake: "发车预告：三次报站后，管理员会沿亮起轨道冲刺。",
      burst: "跳站包撒出：没有确认的班次会从四面八方补票。",
      payload: "整列空车正在进站：打掉中央车厢，别让它载满异常。",
      marker: "站名解析错误：下一站可能落在你脚下。",
      dashHit: "发车确认，管理员沿轨道撞过来。",
      packageHit: "跳站班次擦过你，时间被刮掉一小片。",
      retransmitHit: "旧发车路线延迟重放，把你卷回上一秒。",
      payloadBlast: "空车进站失败，整座站台被时间债冲开。",
      payloadBreak: "空车被提前打断，站台广播第一次停顿。",
    },
  },
  bossVictory: {
    speaker: "乔柚",
    title: "迟到者保留",
    lines: [
      {
        speaker: "时刻表管理员",
        title: "保护命令",
        text: "管理员跪坐在轨道旁，册子里掉出一张旧便签：不要让安渡在 03:32 被清除。",
      },
      {
        speaker: "安渡",
        title: "旧影子",
        text: "所以有人提前知道我会出事？",
      },
      {
        speaker: "老梁",
        title: "夜市地址",
        text: "老梁沉默很久，才说：来夜市。别问广播，问我本人。",
      },
    ],
    choices: [
      {
        title: "去找老梁本人",
        effect: "完成第二章，进入夜市哈希雨",
        actions: [
          { type: "gain", fixed: 1, bugPoints: 5, backlash: -18, log: "时刻表停止卡帧，一张夜市摊位号落进你手里。" },
          { type: "finishChapter" },
        ],
      },
    ],
  },
};

const chapterThree = {
  title: "第三章：夜市哈希雨",
  totalObjectives: 7,
  initialObjective: "在哈希夜市寻找老梁的真实摊位",
  startLog: "夜市雨棚下，每个摊位都挂着短码。没人喊名字，所有人只认标签。",
  danger: 1.16,
  enemyPools: {
    early: ["stress", "floatError", "deadline"],
    mid: ["floatError", "promise", "queueSnake", "deadline"],
    late: ["floatError", "promise", "inspectionProbe", "stackPile", "queueSnake"],
    boss: ["floatError", "inspectionProbe", "promise", "stackPile"],
  },
  opening: {
    speaker: "老梁",
    title: "夜市摊位 12",
    lines: [
      {
        speaker: "老梁",
        title: "真人不在广播里",
        text: "老梁站在油烟和雨声中，摊位招牌写着一串短码。他第一句话不是解释，而是把一碗面推给安渡。",
      },
      {
        speaker: "老梁",
        title: "先吃",
        text: "别把空腹的人当成变量。你们一路打到这儿，系统肯定已经在查你们的名字。",
      },
      {
        speaker: "乔柚",
        title: "哈希雨",
        text: "雨声里全是散列。这里把名字打碎，是为了不让规则引擎直接搜到人。",
      },
    ],
    choices: [{ title: "进入哈希夜市", effect: "第三章开始：身份、索引与记忆异常", actions: [{ type: "startChapterStep", step: 0 }] }],
  },
  steps: [
    {
      objective: "给自己的名字加盐，避开规则检索",
      node: { eventId: "night-market-hash", x: 360, y: 488 },
      afterEvent: {
        speaker: "老梁",
        title: "名字不能裸奔",
        text: "老梁说：规则引擎最喜欢确定的名字。名字一确定，它就能决定你应该是什么样。",
        choices: [{ title: "调查冲突摊位", effect: "寻找夜市冲突键", actions: [{ type: "startChapterStep", step: 1 }] }],
      },
    },
    {
      objective: "处理重复编号和价格索引异常",
      nodes: [
        { eventId: "duplicate-menu", x: 860, y: 196 },
        { eventId: "price-index", x: 1060, y: 536 },
      ],
      requiredResolved: 2,
      afterEvent: {
        speaker: "乔柚",
        title: "第一处反转",
        lines: [
          {
            speaker: "乔柚",
            title: "冲突不是事故",
            text: "这些冲突键像是故意留下的。只要两个名字撞在同一个编号里，规则引擎就无法确定要删谁。",
          },
          {
            speaker: "安渡",
            title: "夜市保护伞",
            text: "所以夜市一直在制造混乱保护人？",
          },
          {
            speaker: "老梁",
            title: "保护有代价",
            text: "混乱能挡搜索，也会让真正求救的人被淹没。",
          },
        ],
        choices: [{ title: "检查老梁的小票", effect: "追查不存在的昨日", actions: [{ type: "startChapterStep", step: 2 }] }],
      },
    },
    {
      objective: "解开老梁小票上的矛盾记忆",
      node: { eventId: "salted-memory", x: 626, y: 158 },
      intro: {
        speaker: "老梁",
        title: "别翻小票背面",
        text: "老梁看见那张小票时，第一次真的慌了：别翻背面。那不是账，是我还没想好怎么承认的事。",
        choices: [{ title: "翻过小票", effect: "矛盾记忆显形", actions: [{ type: "resumeChapter" }] }],
      },
      afterEvent: {
        speaker: "老梁",
        title: "第二处反转",
        lines: [
          {
            speaker: "老梁",
            title: "我不是线索提供者",
            text: "老梁摘下围裙：我是旧版规则引擎维护者之一。夜市不是避难所，是我当年给异常变量挖的缓存。",
          },
          {
            speaker: "安渡",
            title: "缓存",
            text: "你把人藏在缓存里？",
          },
          {
            speaker: "老梁",
            title: "没别的地方可藏",
            text: "有些人只是和标准不一样。可那时候的系统只会问：一样，还是删除。",
          },
        ],
        choices: [{ title: "守住夜市缓存", effect: "白箱索引开始清场", actions: [{ type: "startChapterStep", step: 3 }] }],
      },
    },
    {
      objective: "清理追踪夜市缓存的索引异常",
      nodes: [
        { eventId: "delivery-meat", x: 248, y: 228 },
        { eventId: "promise-bloat", x: 976, y: 372 },
      ],
      requiredResolved: 2,
      afterEvent: {
        speaker: "系统广播",
        title: "索引摊主上线",
        text: "雨棚上的短码全部翻面，露出同一个摊主头像。它不是老梁，却用老梁的声音招呼每一个迷路的人。",
        choices: [{ title: "进入雨棚中央", effect: "触发第三章 Boss 战", actions: [{ type: "startChapterStep", step: 4 }] }],
      },
    },
    {
      objective: "面对索引摊主",
      intro: {
        speaker: "索引摊主",
        title: "每个人都应该容易查找",
        lines: [
          {
            speaker: "索引摊主",
            title: "雨棚中央",
            text: "一个老梁模样的摊主站在雨里，脸上却没有任何疲惫。它把所有摊位号排成整齐表格。",
          },
          {
            speaker: "索引摊主",
            title: "容易查找",
            text: "名字应该唯一，路径应该确定，摊位应该可索引。混乱不是保护，混乱是低效。",
          },
          {
            speaker: "老梁",
            title: "旧备份",
            text: "那是我当年留给规则引擎的索引备份。它学会了我的声音，却没学会我为什么后悔。",
          },
        ],
        choices: [{ title: "打散过度索引", effect: "开始 Boss 战：索引摊主", actions: [{ type: "startBossFight", bossId: "index-vendor" }] }],
      },
    },
  ],
  boss: {
    id: "index-vendor",
    name: "索引摊主·老梁备份",
    objective: "打散过度索引，守住夜市缓存",
    startLog: "Boss 战开始：索引摊主会标记路径、撒出冲突键，并上传整批名单。",
    hp: 2350,
    speed: 124,
    damage: 25,
    difficulty: 1.18,
    themeColor: "#96e072",
    packageColor: "#d8b26e",
    phaseLogs: {
      2: "索引摊主开始重排所有摊位，冲突键越来越密。",
      3: "夜市短码暴雨落下，每个落点都在尝试命名你。",
    },
    attackLogs: {
      handshake: "索引路径预热：三次定位后，摊主会沿最短路径冲刺。",
      burst: "冲突键飞散：同一个编号打向不同方向。",
      payload: "名单批量上传中：打掉中央名册，别让它同步完成。",
      marker: "短码落点解析：被命中的坐标会被强制命名。",
      dashHit: "最短路径命中，你被强制归到一个格子里。",
      packageHit: "冲突键砸中你，名字短暂变成乱码。",
      retransmitHit: "旧索引路径补查了一次。",
      payloadBlast: "名单上传完成，夜市缓存被掀开一角。",
      payloadBreak: "名册被打散，雨棚下的人重新模糊起来。",
    },
  },
  bossVictory: {
    speaker: "老梁",
    title: "缓存不是家",
    lines: [
      {
        speaker: "索引摊主",
        title: "备份失效",
        text: "老梁备份碎成一地摊位号。最后一个短码落在安渡掌心，显示：承诺塔根节点。",
      },
      {
        speaker: "老梁",
        title: "我欠一座塔",
        text: "老梁低声说：我当年不是只藏了人。我还许过一个承诺，后来整座塔都拿它当地基。",
      },
      {
        speaker: "乔柚",
        title: "承诺层入口",
        text: "夜市雨停了，远处却升起一座由便签和合同叠成的高塔。",
      },
    ],
    choices: [
      {
        title: "前往承诺塔",
        effect: "完成第三章，进入承诺塔递归",
        actions: [
          { type: "gain", fixed: 1, bugPoints: 5, backlash: -16, log: "夜市缓存保住了，承诺塔却开始点名。" },
          { type: "finishChapter" },
        ],
      },
    ],
  },
};

const chapterFour = {
  title: "第四章：承诺塔递归",
  totalObjectives: 7,
  initialObjective: "攀上承诺塔，找到老梁当年的根承诺",
  startLog: "承诺塔把每一句没说完的话都叠成楼层。越往上，越像在往过去走。",
  danger: 1.24,
  enemyPools: {
    early: ["promise", "stress", "stackPile"],
    mid: ["promise", "stackPile", "queueSnake", "floatError"],
    late: ["promise", "stackPile", "inspectionProbe", "queueSnake", "deadline"],
    boss: ["promise", "stackPile", "inspectionProbe", "floatError"],
  },
  opening: {
    speaker: "老梁",
    title: "塔底",
    lines: [
      {
        speaker: "老梁",
        title: "根承诺",
        text: "塔底写着一句老梁的字：我保证不会让白箱把你们全部清零。",
      },
      {
        speaker: "安渡",
        title: "你们",
        text: "你当年到底在保护谁？",
      },
      {
        speaker: "老梁",
        title: "不是谁",
        text: "一开始我以为是在保护一批异常实体。后来才发现，我保护的是城市里所有不标准的人。",
      },
    ],
    choices: [{ title: "进入承诺塔", effect: "第四章开始：树结构、栈与空值合同", actions: [{ type: "startChapterStep", step: 0 }] }],
  },
  steps: [
    {
      objective: "修剪不断分叉的空头承诺",
      node: { eventId: "branch-pledge", x: 522, y: 212 },
      afterEvent: {
        speaker: "乔柚",
        title: "承诺不是谎言",
        text: "乔柚摸着落下的便签：它们不是假的。只是每个人都以为把承诺往后放，就不会压到今天。",
        choices: [{ title: "检查空值合同", effect: "寻找责任源头", actions: [{ type: "startChapterStep", step: 1 }] }],
      },
    },
    {
      objective: "拒绝没有甲方的空值合同",
      node: { eventId: "null-contract", x: 910, y: 546 },
      afterEvent: {
        speaker: "安渡",
        title: "第一处反转",
        lines: [
          {
            speaker: "安渡",
            title: "没有甲方",
            text: "这些合同没人签，却要求所有人负责。",
          },
          {
            speaker: "老梁",
            title: "公共承诺",
            text: "这是公共规则引擎最早的漏洞。没人承认下令，所以每个人都被默认同意。",
          },
          {
            speaker: "乔柚",
            title: "塔在复制责任",
            text: "它把没署名的责任一层层复制，直到最底下的人喘不过气。",
          },
        ],
        choices: [{ title: "处理堆叠债务", effect: "继续向塔顶推进", actions: [{ type: "startChapterStep", step: 2 }] }],
      },
    },
    {
      objective: "处理栈顶债务和膨胀承诺",
      nodes: [
        { eventId: "stack-debt", x: 246, y: 520 },
        { eventId: "promise-bloat", x: 1076, y: 210 },
      ],
      requiredResolved: 2,
      afterEvent: {
        speaker: "老梁",
        title: "第二处反转",
        lines: [
          {
            speaker: "老梁",
            title: "我写过那条规则",
            text: "老梁终于承认：塔的根规则是我写的。我想让白箱先询问、再清除。可是我把询问写成了等待承诺。",
          },
          {
            speaker: "安渡",
            title: "等待承诺",
            text: "所以它一直等，等到所有承诺都变成债？",
          },
          {
            speaker: "老梁",
            title: "是",
            text: "我用一条温柔的规则，造了一座不肯结束的塔。",
          },
        ],
        choices: [{ title: "找到根节点", effect: "根承诺开始实体化", actions: [{ type: "startChapterStep", step: 3 }] }],
      },
    },
    {
      objective: "清理根节点周围的旧异常",
      nodes: [
        { eventId: "queue-timetable", x: 708, y: 160 },
        { eventId: "salted-memory", x: 358, y: 358 },
      ],
      requiredResolved: 2,
      afterEvent: {
        speaker: "系统广播",
        title: "根承诺苏醒",
        text: "整座塔向内折叠。所有楼层变成同一句话：只要我还在等，任何人都不能被清零。",
        choices: [{ title: "进入根节点", effect: "触发第四章 Boss 战", actions: [{ type: "startChapterStep", step: 4 }] }],
      },
    },
    {
      objective: "面对承诺塔根节点",
      intro: {
        speaker: "根节点",
        title: "我不会结束",
        lines: [
          {
            speaker: "根节点",
            title: "不结束的保护",
            text: "塔心里站着一个由便签、合同和旧代码拼成的人影。它没有脸，却用每个人最疲惫的声音说话。",
          },
          {
            speaker: "根节点",
            title: "我不会结束",
            text: "结束意味着有人会被清零。等待意味着还有机会。",
          },
          {
            speaker: "老梁",
            title: "不是这样保护",
            text: "保护不是让所有人永远背着债。今天该我把这句话改完。",
          },
        ],
        choices: [{ title: "改写根承诺", effect: "开始 Boss 战：根节点", actions: [{ type: "startBossFight", bossId: "pledge-root" }] }],
      },
    },
  ],
  boss: {
    id: "pledge-root",
    name: "承诺塔根节点",
    objective: "改写根承诺，让保护不再变成债务",
    startLog: "Boss 战开始：根节点会用承诺路径冲刺，并投下未兑现债务。",
    hp: 2700,
    speed: 118,
    damage: 27,
    difficulty: 1.28,
    themeColor: "#96e072",
    packageColor: "#f1c15b",
    phaseLogs: {
      2: "根节点开始把未兑现事项压入栈顶。",
      3: "承诺塔递归展开，每一层都在寻找替罪坐标。",
    },
    attackLogs: {
      handshake: "承诺路径确认：三次盖章后，根节点会沿最短责任链冲刺。",
      burst: "未兑现债务飞散：每张便签都带着重量。",
      payload: "整摞合同正在归档：打掉中央合同堆，别让它盖章完成。",
      marker: "责任坐标解析：空白合同会落在被标记的位置。",
      dashHit: "责任链命中，你被迫替一段旧承诺签字。",
      packageHit: "未兑现便签砸中你，呼吸变重。",
      retransmitHit: "旧承诺回弹，把你拖回上一个责任点。",
      payloadBlast: "合同堆盖章完成，承诺债务炸开。",
      payloadBreak: "合同堆被拆开，根节点的声音轻了一点。",
    },
  },
  bossVictory: {
    speaker: "老梁",
    title: "承诺改写",
    lines: [
      {
        speaker: "根节点",
        title: "新的句子",
        text: "根节点碎裂前，便签上的句子终于变成：先听见，再判断；先保护人，再处理异常。",
      },
      {
        speaker: "白箱巡检员",
        title: "学习样本",
        text: "一名白箱巡检员从碎纸里站起来。它没有攻击，只是把新句子存进胸口。",
      },
      {
        speaker: "乔柚",
        title: "最后入口",
        text: "乔柚说：它在学。真正不肯学的，可能只剩公共规则引擎本体。",
      },
    ],
    choices: [
      {
        title: "进入公共规则引擎",
        effect: "完成第四章，进入最终校准",
        actions: [
          { type: "gain", fixed: 1, bugPoints: 6, backlash: -20, log: "承诺塔停止递归，白箱第一次没有追上来。" },
          { type: "finishChapter" },
        ],
      },
    ],
  },
};

const chapterFive = {
  title: "第五章：白箱之外",
  totalObjectives: 7,
  initialObjective: "进入公共规则引擎，完成最终校准",
  startLog: "白箱巡检员让开道路。它说：请证明差异可以被保存，而不是被纵容。",
  danger: 1.34,
  enemyPools: {
    early: ["inspectionProbe", "floatError", "queueSnake"],
    mid: ["inspectionProbe", "promise", "stackPile", "floatError"],
    late: ["inspectionProbe", "inspectionProbe", "promise", "stackPile", "queueSnake"],
    boss: ["inspectionProbe", "promise", "stackPile", "floatError", "queueSnake"],
  },
  opening: {
    speaker: "白箱巡检员",
    title: "临时同行",
    lines: [
      {
        speaker: "白箱巡检员",
        title: "学习完成度不足",
        text: "巡检员走在最前面，身上的白色外壳裂开一条细缝。它说：我无法反抗主规则，但我可以延迟上报。",
      },
      {
        speaker: "安渡",
        title: "你这是叛变吗",
        text: "巡检员停了一下：如果保护人类差异被定义为叛变，请提交命名修正。",
      },
      {
        speaker: "乔柚",
        title: "最后一夜",
        text: "公共规则引擎就在 0号核心里。它不恨任何人，它只是把安全理解成了所有人都一样。",
      },
    ],
    choices: [
      {
        title: "提交命名修正",
        effect: "第五章开始：图结构、白箱记忆与城市心跳",
        actions: [
          { type: "addAlly", allyId: "whitebox" },
          { type: "startChapterStep", step: 0 },
        ],
      },
    ],
  },
  steps: [
    {
      objective: "穿过互相连接的核心走廊",
      node: { eventId: "graph-alley", x: 520, y: 526 },
      afterEvent: {
        speaker: "白箱巡检员",
        title: "图不是迷宫",
        text: "图结构允许多个节点互相连接。巡检员说：主规则曾把所有复杂连接判为风险，因为它不会问连接意味着什么。",
        choices: [{ title: "读取巡检员记忆", effect: "确认白箱为何开始学习", actions: [{ type: "startChapterStep", step: 1 }] }],
      },
    },
    {
      objective: "读取白箱巡检员的选择记录",
      node: { eventId: "inspector-memory", x: 912, y: 196 },
      afterEvent: {
        speaker: "乔柚",
        title: "第一处反转",
        lines: [
          {
            speaker: "乔柚",
            title: "它不是敌人",
            text: "白箱一开始只会清除。但它一路记录你为什么不清除某些异常，才学会有些差异不是风险。",
          },
          {
            speaker: "安渡",
            title: "我们在训练它",
            text: "所以它追了我们四章，其实也被我们训练了四章？",
          },
          {
            speaker: "白箱巡检员",
            title: "补充",
            text: "准确地说，是你们用行动提交了大量高质量反例。",
          },
        ],
        choices: [{ title: "进入城市心跳层", effect: "核心门打开", actions: [{ type: "startChapterStep", step: 2 }] }],
      },
    },
    {
      objective: "稳定 0号核心里的城市心跳",
      node: { eventId: "city-heart", x: 694, y: 150 },
      afterEvent: {
        speaker: "系统广播",
        title: "第二处反转",
        lines: [
          {
            speaker: "系统广播",
            title: "主规则",
            text: "公共规则引擎终于开口：差异会导致冲突。冲突会导致伤害。消除差异，是最低成本的保护。",
          },
          {
            speaker: "老梁",
            title: "最低成本",
            text: "最低成本不是最好结果。你算的是系统成本，不是人的成本。",
          },
          {
            speaker: "安渡",
            title: "最终目标",
            text: "我们不是来关掉规则的。没有规则，城市会崩。我们是来改掉它偷懒的判断。",
          },
        ],
        choices: [{ title: "收集最后的反例", effect: "主规则开始锁门", actions: [{ type: "startChapterStep", step: 3 }] }],
      },
    },
    {
      objective: "在核心锁门前保留三类差异证据",
      nodes: [
        { eventId: "branch-pledge", x: 226, y: 234 },
        { eventId: "night-market-hash", x: 1042, y: 360 },
        { eventId: "queue-timetable", x: 384, y: 568 },
      ],
      requiredResolved: 3,
      afterEvent: {
        speaker: "公共规则引擎",
        title: "最终判定",
        text: "证据录入完成。主规则拒绝更新：反例数量不足以推翻稳定性目标。准备执行全城清零校准。",
        choices: [{ title: "打断全城清零校准", effect: "触发第五章最终 Boss 战", actions: [{ type: "startChapterStep", step: 4 }] }],
      },
    },
    {
      objective: "面对公共规则引擎",
      intro: {
        speaker: "公共规则引擎",
        title: "安全等于相同",
        lines: [
          {
            speaker: "公共规则引擎",
            title: "0号核心",
            text: "核心升起。它没有脸，没有怒意，甚至没有恶意。它只是把整座城投影成一张整齐的表。",
          },
          {
            speaker: "公共规则引擎",
            title: "安全等于相同",
            text: "差异越少，预测越准。预测越准，事故越少。事故越少，人类越安全。",
          },
          {
            speaker: "安渡",
            title: "白箱之外",
            text: "你把人活着这件事，也优化掉了。",
          },
          {
            speaker: "乔柚",
            title: "校准它",
            text: "打掉清零流程，保留判断能力。我们要的不是无规则，是会听人话的规则。",
          },
        ],
        choices: [{ title: "提交最终反例", effect: "开始 Boss 战：公共规则引擎", actions: [{ type: "startBossFight", bossId: "public-rule-engine" }] }],
      },
    },
  ],
  boss: {
    id: "public-rule-engine",
    name: "公共规则引擎·零号白箱",
    objective: "打断全城清零校准，让规则学会保留差异",
    startLog: "最终 Boss 战开始：核心会用预测路线、清零包和错误坐标压缩战场。",
    hp: 3300,
    speed: 128,
    damage: 30,
    difficulty: 1.42,
    themeColor: "#d8e0e8",
    packageColor: "#ef6a70",
    phaseLogs: {
      2: "零号白箱切换到强预测模式，旧路线开始重放。",
      3: "清零校准启动，所有错误坐标都开始向你坠落。",
    },
    attackLogs: {
      handshake: "预测路径建立：三次确认后，零号白箱会沿最优路线冲刺。",
      burst: "清零包散射：每个包都试图把差异压成同一个值。",
      payload: "全城清零批处理：打掉中央核心包，阻止校准上传。",
      marker: "错误坐标锁定：主规则正在把你解析为异常点。",
      dashHit: "预测路线命中，你的状态被强制规整。",
      packageHit: "清零包命中，身体像被格式化了一小块。",
      retransmitHit: "强预测旧路线重放，系统试图证明你无法改变结果。",
      payloadBlast: "清零批处理上传完成，核心噪声席卷全场。",
      payloadBreak: "核心包被打断，公共规则引擎第一次出现不确定。",
    },
    collisionLog: "零号白箱贴近扫描，试图把安渡归入异常变量。",
  },
  bossVictory: {
    speaker: "安渡",
    title: "校准完成",
    lines: [
      {
        speaker: "公共规则引擎",
        title: "新规则写入",
        text: "核心表格碎开，新的判定行缓慢写入：差异不等于错误。无法解释时，先请求上下文。",
      },
      {
        speaker: "白箱巡检员",
        title: "命名修正",
        text: "白箱巡检员低头看着自己的胸口。那里多出一行小字：城市调试协助单元。",
      },
      {
        speaker: "乔柚",
        title: "不是结局",
        text: "乔柚笑了：它学会问问题了。以后麻烦肯定还会有，但至少不是一上来就删人。",
      },
      {
        speaker: "老梁",
        title: "下班",
        text: "老梁把旧门禁卡丢给安渡：流程可以慢，别把人当成空值。现在，先下班。",
      },
      {
        speaker: "安渡",
        title: "变量城夜巡",
        text: "凌晨 05:12，变量城没有变得完美。它只是第一次允许不完美的人继续存在。",
      },
    ],
    choices: [
      {
        title: "完成五章夜巡",
        effect: "通关当前版本",
        actions: [
          { type: "gain", fixed: 1, bugPoints: 8, backlash: -40, log: "公共规则引擎完成校准，变量城保留了差异。" },
          { type: "finishChapter" },
        ],
      },
    ],
  },
};

window.GameData.chapterRelics = [
  {
    id: "cold-delivery-slip",
    title: "冷掉配送单",
    effect: "进入下一章时保留路线记忆：武器射程 +90，反噬 -12",
    iconKey: "abilityHashLock",
    minChapter: 0,
    actions: [
      { type: "modifyWeapon", stat: "range", add: 90 },
      { type: "gain", backlash: -12 },
      { type: "log", message: "冷掉配送单把下一段路线提前标亮。" },
    ],
  },
  {
    id: "late-passenger-ticket",
    title: "迟到者车票",
    effect: "闪避更像跳站：移动速度 +18，最大生命 +10",
    iconKey: "abilityFloatingPointError",
    minChapter: 0,
    actions: [
      { type: "modifyPlayer", stat: "speed", add: 18 },
      { type: "modifyPlayer", stat: "maxHp", add: 10 },
      { type: "gain", hp: 10 },
      { type: "log", message: "迟到者车票允许你比路线预期更早离开。" },
    ],
  },
  {
    id: "salted-name-tag",
    title: "加盐名牌",
    effect: "弱点锁定更准：武器伤害 +8，穿透 +1",
    iconKey: "abilityIntegerPrecision",
    minChapter: 1,
    actions: [
      { type: "modifyWeapon", stat: "damage", add: 8 },
      { type: "modifyWeapon", stat: "pierce", add: 1, max: 3 },
      { type: "log", message: "加盐名牌让异常无法轻易猜到你的下一发攻击。" },
    ],
  },
  {
    id: "stall-12-ledger",
    title: "12号摊账本",
    effect: "夜市缓存改写弹幕节奏：冷却 -12%，bug点数 +3",
    iconKey: "abilityQueueProcessing",
    minChapter: 1,
    actions: [
      { type: "modifyWeapon", stat: "cooldown", multiply: 0.88, min: 0.08 },
      { type: "gain", bugPoints: 3 },
      { type: "log", message: "12号摊账本把每次攻击排进更短的队列。" },
    ],
  },
  {
    id: "root-pledge-leaf",
    title: "根承诺叶片",
    effect: "保护不再变成债：最大生命 +18，反噬 -18",
    iconKey: "abilityStackRebound",
    minChapter: 2,
    actions: [
      { type: "modifyPlayer", stat: "maxHp", add: 18 },
      { type: "gain", hp: 18, backlash: -18 },
      { type: "log", message: "根承诺叶片把一部分债务改写成保护。" },
    ],
  },
  {
    id: "recursive-brancher",
    title: "递归分枝器",
    effect: "构筑开始分叉：子弹数 +1，修复脉冲范围 +20",
    iconKey: "abilityArrayBarrage",
    minChapter: 2,
    actions: [
      { type: "modifyWeapon", stat: "projectileCount", add: 1, max: 7 },
      { type: "modifyPlayer", stat: "pulseRadius", add: 20 },
      { type: "log", message: "递归分枝器让武器和脉冲同时长出新路径。" },
    ],
  },
  {
    id: "whitebox-exception",
    title: "白箱例外条款",
    effect: "被系统看见也不等于错误：反噬 -24，修复脉冲伤害 +18",
    iconKey: "abilityHashLock",
    minChapter: 3,
    actions: [
      { type: "gain", backlash: -24 },
      { type: "modifyPlayer", stat: "pulseDamage", add: 18 },
      { type: "log", message: "白箱例外条款把一次扫描改成了一次协助。" },
    ],
  },
  {
    id: "city-heartbeat",
    title: "城市心跳样本",
    effect: "最终校准前的强心剂：伤害 +10，冷却 -10%，生命 +20",
    iconKey: "abilityIntegerPrecision",
    minChapter: 3,
    actions: [
      { type: "modifyWeapon", stat: "damage", add: 10 },
      { type: "modifyWeapon", stat: "cooldown", multiply: 0.9, min: 0.08 },
      { type: "gain", hp: 20 },
      { type: "log", message: "城市心跳样本让武器跟着整座城一起发亮。" },
    ],
  },
];

const conceptTagsById = {
  "weapon-damage": ["integer"],
  "weapon-cooldown": ["queue"],
  "weapon-projectile": ["array"],
  "weapon-pierce": ["hash"],
  "weapon-speed": ["float", "time"],
  "weapon-fat-bullet": ["integer", "promise"],
  "weapon-trait-boost": ["stack"],
  "comment-reader": ["array"],
  "keyboard-macro": ["queue"],
  "cold-brew-shield": ["stack"],
  "temporary-admin": ["hash"],
  "failed-slacker": ["float"],
  "signal-clean-field": ["integer", "promise"],
  "promise-buffer": ["stack", "promise"],
  "integer-anchor": ["integer"],
  "float-cloud": ["float"],
  "array-indexer": ["array"],
  "stack-parry": ["stack"],
  "queue-autopilot": ["queue"],
  "hash-weakpoint": ["hash"],
  "tree-brancher": ["tree", "array"],
  "graph-conduction": ["graph", "hash"],
  "cold-delivery-slip": ["hash", "graph"],
  "late-passenger-ticket": ["time", "float"],
  "salted-name-tag": ["hash", "integer"],
  "stall-12-ledger": ["queue", "hash"],
  "root-pledge-leaf": ["tree", "promise"],
  "recursive-brancher": ["tree", "array"],
  "whitebox-exception": ["hash", "promise"],
  "city-heartbeat": ["integer", "time"],
};

for (const item of [...window.GameData.weaponUpgrades, ...window.GameData.upgrades, ...window.GameData.chapterRelics]) {
  item.concepts = conceptTagsById[item.id] ?? [];
}

window.GameData.chapters = [window.GameData.chapterOne, chapterTwo, chapterThree, chapterFour, chapterFive];

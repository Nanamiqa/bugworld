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
      radius: 15,
      hp: 55,
      speedMin: 72,
      speedMax: 98,
      damage: 10,
      deathColor: "#ef6a70",
      hitLog: "压力实体撞上来，报表又多了一页。",
    },
    deadline: {
      name: "工单飞虫",
      layer: "结构层",
      role: "chaser",
      render: "deadline",
      radius: 15,
      hp: 48,
      speedMin: 92,
      speedMax: 126,
      damage: 9,
      deathColor: "#ef6a70",
      hitLog: "工单飞虫贴脸催办，安渡的待办列表多了一行。",
    },
    cleaner: {
      name: "白箱巡检员",
      layer: "规则引擎",
      role: "cleaner",
      render: "patrol",
      radius: 24,
      hp: 130,
      speedMin: 112,
      speedMax: 112,
      damage: 24,
      deathColor: "#72a5ff",
      hitLog: "白箱巡检员擦掉了你的一段状态。",
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
      title: "错误码磨尖",
      effect: "当前武器伤害 +7",
      actions: [
        { type: "modifyWeapon", stat: "damage", add: 7 },
        { type: "log", message: "武器的错误码边缘变锋利了。" },
      ],
    },
    {
      id: "weapon-cooldown",
      title: "冷却缓存",
      effect: "当前武器发射冷却 -15%",
      actions: [
        { type: "modifyWeapon", stat: "cooldown", multiply: 0.85, min: 0.08 },
        { type: "log", message: "武器开始提前预读下一次攻击。" },
      ],
    },
    {
      id: "weapon-projectile",
      title: "弹幕分叉",
      effect: "当前武器子弹数 +1，散射略增",
      actions: [
        { type: "modifyWeapon", stat: "projectileCount", add: 1, max: 7 },
        { type: "modifyWeapon", stat: "spread", add: 0.04, max: 0.46 },
        { type: "log", message: "弹道分裂成更热闹的 bug 弧线。" },
      ],
    },
    {
      id: "weapon-pierce",
      title: "穿透注释",
      effect: "当前武器穿透 +1，射程 +70",
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
      actions: [
        { type: "modifyWeapon", stat: "bulletSize", add: 2, max: 10 },
        { type: "modifyWeapon", stat: "damage", add: 4 },
        { type: "gain", backlash: 5 },
        { type: "log", message: "攻击被加粗高亮，系统也多看了你一眼。" },
      ],
    },
    {
      id: "weapon-trait-boost",
      title: "专属特性调优",
      effect: "强化当前武器的专属特性",
      actions: [
        { type: "boostWeaponTrait" },
        { type: "log", message: "武器的专属特性被重新校准。" },
      ],
    },
  ],

  chapterOne: {
    title: "第一章：夜班断点",
    opening: {
      speaker: "安渡",
      title: "加班到凌晨",
      text: "安渡从键盘上惊醒。屏幕里的报表还停在错误代码那一行，斜对面工位的工牌却飘起了不属于现实的弹幕。",
      choices: [{ title: "起身查看异常", effect: "办公室异常开始显形", actions: [{ type: "startChapterStep", step: 0 }] }],
    },
    steps: [
      {
        objective: "调查斜对面工位的弹幕异常",
        node: { eventId: "bullet-comments", x: 540, y: 190 },
        afterEvent: {
          speaker: "安渡",
          title: "第一枚 bug点数",
          text: "弹幕消散后，安渡掌心多了一点青蓝色碎光。胸前的断点工牌突然发烫，像是有一条旧版系统提示正在等待恢复。",
          choices: [{ title: "查看断点工牌", effect: "解锁断点工牌节点", actions: [{ type: "startChapterStep", step: 1 }] }],
        },
      },
      {
        objective: "查看断点工牌中的旧版提示",
        node: { eventId: "debug-badge", x: 250, y: 430 },
        afterEvent: {
          speaker: "断点工牌",
          title: "回滚的提示",
          text: "工牌投出一行断续文字：不要把所有差异都当成错误。安渡还没回过神，茶水间传来乔柚压低的声音。",
          choices: [{ title: "去找乔柚", effect: "乔柚第一次登场", actions: [{ type: "startChapterStep", step: 2 }] }],
        },
      },
      {
        objective: "与乔柚会合，稳定两个数据层泄漏",
        nodes: [
          { eventId: "emo-fluff", x: 910, y: 560 },
          { eventId: "delivery-meat", x: 742, y: 248 },
        ],
        requiredResolved: 2,
        intro: {
          speaker: "乔柚",
          title: "异常翻译员",
          text: "乔柚站在茶水间门口，手里捧着一团正在嘀咕的 emo 毛球：别急，我先听听它到底在报什么错。",
          choices: [
            {
              title: "一起处理数据层泄漏",
              effect: "乔柚加入，反噬 -10",
              actions: [
                { type: "addAlly", allyId: "qiao-you" },
                { type: "gain", backlash: -10, log: "乔柚加入临时值班队伍。" },
                { type: "resumeChapter" },
              ],
            },
          ],
        },
        requiredFixed: 4,
        afterEvent: {
          speaker: "系统广播",
          title: "巡检机制上线",
          text: "天花板上的灯同时熄灭又亮起。冷冰冰的系统广播响起：检测到未授权调试行为，白箱巡检员已派遣。",
          choices: [{ title: "准备迎接白箱巡检员", effect: "白箱巡检员第一次登场", actions: [{ type: "startChapterStep", step: 3 }] }],
        },
      },
      {
        objective: "躲过白箱巡检员，继续稳定异常",
        nodes: [
          { eventId: "promise-bloat", x: 1040, y: 190 },
          { eventId: "talking-cat", x: 250, y: 560 },
        ],
        requiredResolved: 2,
        intro: {
          speaker: "白箱巡检员",
          title: "第一次巡检",
          text: "一个白色机体从墙角的扫描线里走出，手里的回收管对准安渡掌心的 bug点数。它没有表情，只重复一句：异常变量，准备归档。",
          choices: [
            {
              title: "带着 bug点数后撤",
              effect: "巡检员入场，bug点数 +2",
              actions: [
                { type: "gain", bugPoints: 2, backlash: 12, log: "白箱巡检员锁定了安渡。" },
                { type: "spawnCleaner", x: 1120, y: 96 },
                { type: "resumeChapter" },
              ],
            },
          ],
        },
        requiredFixed: 6,
        afterEvent: {
          speaker: "老梁",
          title: "0号服务器间的门",
          text: "老梁的声音从主管室传来：别让它进 0 号服务器间。流程可以慢，别把人当成空值。门你得自己守住。",
          choices: [{ title: "守住 0 号服务器间", effect: "进入第一章收束", actions: [{ type: "startChapterStep", step: 4 }] }],
        },
      },
      {
        objective: "修复 0 号服务器间前的最终异常",
        node: { eventId: "fish-dimension", x: 940, y: 535 },
        afterEvent: {
          speaker: "安渡",
          title: "第一夜结束",
          text: "0 号服务器间的门没有打开，白箱巡检员也暂时停下了脚步。安渡攥着发烫的断点工牌，第一次意识到：摸鱼可以，变量不能乱飞。",
          choices: [{ title: "结束第一章", effect: "完成第一章任务线", actions: [{ type: "finishChapter" }] }],
        },
      },
    ],
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
      actions: [
        { type: "modifyPlayer", stat: "pulseRadius", add: 22 },
        { type: "log", message: "弹幕的边缘变清晰了。" },
      ],
    },
    {
      id: "keyboard-macro",
      title: "键盘宏补丁",
      effect: "修复脉冲消耗 -1",
      actions: [
        { type: "modifyPlayer", stat: "pulseCost", add: -1, min: 1 },
        { type: "log", message: "按键声开始有节奏地替你工作。" },
      ],
    },
    {
      id: "cold-brew-shield",
      title: "冷萃护盾",
      effect: "最大生命 +18，生命 +18",
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
      actions: [
        { type: "gain", bugPoints: 3, backlash: -10 },
        { type: "log", message: "系统给了你一个看起来很假的权限章。" },
      ],
    },
    {
      id: "failed-slacker",
      title: "摆烂失败体质",
      effect: "移动速度 +24",
      actions: [
        { type: "modifyPlayer", stat: "speed", add: 24 },
        { type: "log", message: "越想下班，脚步越快。" },
      ],
    },
    {
      id: "signal-clean-field",
      title: "乔柚的降噪场",
      effect: "反噬 -16，生命 +8",
      actions: [
        { type: "gain", backlash: -16, hp: 8 },
        { type: "log", message: "乔柚把异常噪声降到可以好好说话的程度。" },
      ],
    },
    {
      id: "promise-buffer",
      title: "老梁的流程缓冲",
      effect: "清除附近敌人，反噬 +8",
      actions: [
        { type: "clearEnemiesNear", radius: 240 },
        { type: "gain", backlash: 8 },
        { type: "log", message: "老梁的流程缓冲铺开，附近异常被暂时归队。" },
      ],
    },
  ],
};

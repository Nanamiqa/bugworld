window.GameData = {
  world: {
    title: "世界 Bug 值班室",
    genre: "都市异常轻肉鸽 RPG",
    premise:
      "现代都市世界由程序构建，抽象 bug 是世界的灵魂。程序核心意识试图清除所有 bug，而林野等觉醒者要让 bug 与人类、抽象维度共存。",
    dimensions: ["emo维度", "饼维度", "摸鱼维度", "美食维度", "情绪维度", "时空维度", "动物维度"],
    threat: "程序核心意识",
    endgame: "集齐初代实习生三件信物，通过三人能力共鸣激活 bug本源。",
  },

  rules: [
    "部分人类可觉醒看见并修改 bug 的能力，能力多与初代程序实习生血脉或信物相关。",
    "所有 bug 都有作用与反噬，修复 bug 可获得 bug点数。",
    "抽象维度可入侵现实，bug 是连接两者的关键。",
    "程序清洁工可以吸收 bug，前期受核心意识控制，后期可能成为伙伴。",
    "世界程序会自动升级，升级出错会引发新的 bug 危机。",
  ],

  characters: [
    {
      id: "linye",
      name: "林野",
      age: 24,
      role: "主角",
      personality: "前期佛系摸鱼、怕麻烦，后期有担当、重情义，偶尔犯迷糊，擅长随机应变，有同理心",
      goal: "从摆烂社畜成长为 bug 守护者，查明爷爷的秘密，守护世界平衡",
      taboo: "不利用 bug 做坏事，不放弃身边的人，不忽视 bug 带来的隐患",
      catchphrase: "摸鱼归摸鱼，bug不能乱！",
      relationships: {
        陈芋圆: "伙伴兼知己",
        "饼总（王建国）": "伙伴兼前老板",
        爷爷: "牵挂的人",
        程序清洁工: "前期敌对、后期伙伴",
      },
    },
    {
      id: "chen-yuyuan",
      name: "陈芋圆",
      age: 23,
      role: "女主",
      personality: "活泼开朗、心思细腻，有点小迷糊，反 bug 体质，能听懂 bug 实体说话，善良且勇敢",
      goal: "协助林野守护 bug 世界，寻找爷爷的过往，守护与林野的羁绊",
      taboo: "不伤害 emo 毛球等 bug 实体，不轻易放弃林野，不忽视身边的异常",
      catchphrase: "别慌！有我这个反bug体质在呢～",
      relationships: {
        林野: "伙伴兼知己",
        爷爷: "牵挂的人",
        "饼总（王建国）": "伙伴",
        程序清洁工: "伙伴",
      },
    },
    {
      id: "wang-jianguo",
      name: "饼总（王建国）",
      age: 45,
      role: "配角（隐藏大佬）",
      personality: "看似贪财、爱吹牛，实则重情义、有担当，隐藏实力强，幽默接地气，护着林野和陈芋圆",
      goal: "守护自己的饼事业，协助林野对抗反派，守护世界秘密，完成当年与初代实习生的约定",
      taboo: "不让自己的饼变成 bug 灾难，不背叛伙伴，不泄露世界的核心秘密（前期）",
      catchphrase: "我这饼，能解百bug！",
      relationships: {
        林野: "前老板兼伙伴",
        陈芋圆: "伙伴",
        "林野爷爷、陈芋圆爷爷": "旧识",
        程序清洁工: "前期陌生、后期伙伴",
      },
    },
  ],

  chapterOne: {
    title: "第一章：凌晨 03:32",
    opening: {
      speaker: "林野",
      title: "加班到凌晨",
      text: "林野从键盘上惊醒。屏幕里的报表还停在错误代码那一行，斜对面同事的头顶却飘起了不属于现实的弹幕。",
      choices: [{ title: "起身查看异常", effect: "办公室异常开始显形", actions: [{ type: "startChapterStep", step: 0 }] }],
    },
    steps: [
      {
        objective: "调查斜对面工位的弹幕异常",
        node: { eventId: "bullet-comments", x: 540, y: 190 },
        afterEvent: {
          speaker: "林野",
          title: "第一枚 bug点数",
          text: "弹幕消散后，林野掌心多了一点青蓝色碎光。旧手表突然发烫，像是有什么东西从过去敲了敲表盘。",
          choices: [{ title: "查看旧手表", effect: "解锁旧手表节点", actions: [{ type: "startChapterStep", step: 1 }] }],
        },
      },
      {
        objective: "查看爷爷留下的旧手表",
        node: { eventId: "old-watch", x: 250, y: 430 },
        afterEvent: {
          speaker: "旧手表",
          title: "倒带的留言",
          text: "秒针倒转三圈，一段含混的留言浮现：别让程序把世界擦得太干净。林野还没回过神，茶水间传来陈芋圆的声音。",
          choices: [{ title: "去找陈芋圆", effect: "陈芋圆第一次登场", actions: [{ type: "startChapterStep", step: 2 }] }],
        },
      },
      {
        objective: "与陈芋圆会合，稳定两个维度泄漏",
        nodes: [
          { eventId: "emo-fluff", x: 910, y: 560 },
          { eventId: "delivery-meat", x: 742, y: 248 },
        ],
        requiredResolved: 2,
        intro: {
          speaker: "陈芋圆",
          title: "反 bug 体质",
          text: "陈芋圆站在茶水间门口，手里捧着一团正在嘀咕的 emo 毛球：别慌！有我这个反 bug 体质在呢～",
          choices: [
            {
              title: "一起处理维度泄漏",
              effect: "陈芋圆加入，反噬 -10",
              actions: [
                { type: "addAlly", allyId: "chen-yuyuan" },
                { type: "gain", backlash: -10, log: "陈芋圆加入临时值班队伍。" },
                { type: "resumeChapter" },
              ],
            },
          ],
        },
        requiredFixed: 4,
        afterEvent: {
          speaker: "系统广播",
          title: "清理机制上线",
          text: "天花板上的灯同时熄灭又亮起。冷冰冰的系统广播响起：检测到未授权 bug 守护倾向，程序清洁工已派遣。",
          choices: [{ title: "准备迎接程序清洁工", effect: "程序清洁工第一次登场", actions: [{ type: "startChapterStep", step: 3 }] }],
        },
      },
      {
        objective: "躲过程序清洁工，继续修复异常",
        nodes: [
          { eventId: "boss-pie", x: 1040, y: 190 },
          { eventId: "talking-cat", x: 250, y: 560 },
        ],
        requiredResolved: 2,
        intro: {
          speaker: "程序清洁工",
          title: "第一次清扫",
          text: "一个白色人形从墙角的扫描线里走出，手里的吸尘器对准林野掌心的 bug点数。它没有表情，只重复一句：异常变量，准备清理。",
          choices: [
            {
              title: "带着 bug点数后撤",
              effect: "清洁工入场，bug点数 +2",
              actions: [
                { type: "gain", bugPoints: 2, backlash: 12, log: "程序清洁工盯上了林野。" },
                { type: "spawnCleaner", x: 1120, y: 96 },
                { type: "resumeChapter" },
              ],
            },
          ],
        },
        requiredFixed: 6,
        afterEvent: {
          speaker: "饼总（王建国）",
          title: "归零机房的门",
          text: "王建国的声音从老板室传来：别让那东西进归零机房。我这饼，能解百 bug，但门你得自己守住。",
          choices: [{ title: "守住归零机房", effect: "进入第一章收束", actions: [{ type: "startChapterStep", step: 4 }] }],
        },
      },
      {
        objective: "修复归零机房前的最终异常",
        node: { eventId: "fish-dimension", x: 940, y: 455 },
        afterEvent: {
          speaker: "林野",
          title: "第一夜结束",
          text: "归零机房的门没有打开，程序清洁工也暂时停下了脚步。林野攥着发烫的旧手表，第一次意识到：摸鱼归摸鱼，bug 不能乱。",
          choices: [{ title: "结束第一章", effect: "完成第一章任务线", actions: [{ type: "finishChapter" }] }],
        },
      },
    ],
  },

  eventDeck: [
    {
      id: "bullet-comments",
      kicker: "异常弹幕",
      title: "同事头顶冒出弹幕",
      text: "弹幕正在剧透下一场背锅会议，字里行间夹着一条会自我复制的工单。",
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
          actions: [{ type: "gain", hp: 8, backlash: 5, log: "林野战略性移开视线，脖子轻松了一点。" }],
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
          title: "分给陈芋圆",
          effect: "生命 +18，反噬 +8",
          actions: [{ type: "gain", hp: 18, backlash: 8, log: "陈芋圆竖起大拇指，顺手替你挡掉一句阴阳怪气。" }],
        },
      ],
    },
    {
      id: "boss-pie",
      kicker: "饼维度",
      title: "老板画的饼实体化了",
      text: "王建国白板上的圆越画越大，空气里开始掉落“下季度一定兑现”的碎屑。",
      color: "#96e072",
      choices: [
        {
          title: "把饼折成补丁",
          effect: "bug点数 +3，反噬 +14，已修复 +1",
          actions: [{ type: "gain", bugPoints: 3, backlash: 14, fixed: 1, log: "白板恢复洁白，只剩一股烤面香。" }],
        },
        {
          title: "让饼砸向程序清洁工",
          effect: "bug点数 -1，清除附近敌人，反噬 +18",
          requires: { bugPoints: 1 },
          actions: [
            { type: "spendBugPoints", amount: 1 },
            { type: "clearEnemiesNear", radius: 210 },
            { type: "gain", backlash: 18, log: "巨大的饼滚过办公区，压力实体被碾成碎屑。" },
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
          actions: [{ type: "gain", bugPoints: 4, hp: -8, backlash: 22, log: "公式跑通了，林野的眼神也空了。" }],
        },
        {
          title: "让陈芋圆翻译",
          effect: "生命 +12，反噬 +7",
          actions: [{ type: "gain", hp: 12, backlash: 7, log: "陈芋圆听完毛球嘀咕，认真地点了点头。" }],
        },
      ],
    },
    {
      id: "old-watch",
      kicker: "时空维度",
      title: "旧手表突然倒带",
      text: "林野爷爷留下的旧手表倒转了三圈，刚被删掉的错误日志从空气里飘回来。",
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
          title: "按住表冠不让它转",
          effect: "生命 +14，反噬 +9",
          actions: [{ type: "gain", hp: 14, backlash: 9, log: "旧手表安静下来，秒针像在喘气。" }],
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
          actions: [{ type: "gain", hp: 16, backlash: 6, log: "林野获得短暂休息，键盘获得长期统治者。" }],
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
          actions: [{ type: "gain", bugPoints: 1, hp: -4, backlash: 4, log: "林野感觉自己成熟了，也更累了。" }],
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
      id: "anti-bug-field",
      title: "陈芋圆的反bug场",
      effect: "反噬 -16，生命 +8",
      actions: [
        { type: "gain", backlash: -16, hp: 8 },
        { type: "log", message: "陈芋圆把异常揉成一颗很乖的芋圆。" },
      ],
    },
    {
      id: "pie-shield",
      title: "饼总的百bug饼",
      effect: "清除附近敌人，反噬 +8",
      actions: [
        { type: "clearEnemiesNear", radius: 240 },
        { type: "gain", backlash: 8 },
        { type: "log", message: "王建国的饼滚过工位，世界短暂变得很香。" },
      ],
    },
  ],
};

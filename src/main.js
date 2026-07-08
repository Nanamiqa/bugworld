const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const ui = {
  hp: document.querySelector("#hpValue"),
  level: document.querySelector("#levelValue"),
  xp: document.querySelector("#xpValue"),
  bug: document.querySelector("#bugValue"),
  weapon: document.querySelector("#weaponValue"),
  backlash: document.querySelector("#backlashValue"),
  fixed: document.querySelector("#fixedValue"),
  log: document.querySelector("#logLine"),
  eventPanel: document.querySelector("#eventPanel"),
  eventKicker: document.querySelector("#eventKicker"),
  eventTitle: document.querySelector("#eventTitle"),
  eventText: document.querySelector("#eventText"),
  eventChoices: document.querySelector("#eventChoices"),
  chapterTitle: document.querySelector("#chapterTitle"),
  objectiveText: document.querySelector("#objectiveText"),
  chapterPips: document.querySelector("#chapterPips"),
  archive: document.querySelector("#archiveValue"),
  build: document.querySelector("#buildValue"),
  resonance: document.querySelector("#resonanceValue"),
  defeat: document.querySelector("#defeatValue"),
  openingTracker: document.querySelector("#openingTracker"),
  hookTracker: document.querySelector("#hookTracker"),
  tempoTracker: document.querySelector("#tempoTracker"),
  starterTracker: document.querySelector("#starterTracker"),
  deviceTracker: document.querySelector("#deviceTracker"),
  storyPanel: document.querySelector("#storyPanel"),
  storySpeaker: document.querySelector("#storySpeaker"),
  storyTitle: document.querySelector("#storyTitle"),
  storyText: document.querySelector("#storyText"),
  storyAvatarFrame: document.querySelector("#storyAvatarFrame"),
  storyAvatar: document.querySelector("#storyAvatar"),
  storyAvatarFallback: document.querySelector("#storyAvatarFallback"),
  storyProgress: document.querySelector("#storyProgress"),
  storyContinue: document.querySelector("#storyContinue"),
  storyChoices: document.querySelector("#storyChoices"),
  startPanel: document.querySelector("#startPanel"),
  startSummary: document.querySelector("#startSummary"),
  tonightHook: document.querySelector("#tonightHook"),
  startStats: document.querySelector("#startStats"),
  echoArchive: document.querySelector("#echoArchive"),
  starterBuilds: document.querySelector("#starterBuilds"),
  metaSummary: document.querySelector("#metaSummary"),
  metaProgression: document.querySelector("#metaProgression"),
  startActions: document.querySelector("#startActions"),
  chapterSelect: document.querySelector("#chapterSelect"),
  pauseButton: document.querySelector("#pauseButton"),
  settingsButton: document.querySelector("#settingsButton"),
  fullscreenButton: document.querySelector("#fullscreenButton"),
  inputHint: document.querySelector("#inputHint"),
  pausePanel: document.querySelector("#pausePanel"),
  pauseSummary: document.querySelector("#pauseSummary"),
  resumeButton: document.querySelector("#resumeButton"),
  pauseSettingsButton: document.querySelector("#pauseSettingsButton"),
  returnMenuButton: document.querySelector("#returnMenuButton"),
  settingsPanel: document.querySelector("#settingsPanel"),
  shakeToggle: document.querySelector("#shakeToggle"),
  gamepadToggle: document.querySelector("#gamepadToggle"),
  inputHintToggle: document.querySelector("#inputHintToggle"),
  fullscreenPrefToggle: document.querySelector("#fullscreenPrefToggle"),
  audioMuteToggle: document.querySelector("#audioMuteToggle"),
  masterVolumeSlider: document.querySelector("#masterVolumeSlider"),
  masterVolumeValue: document.querySelector("#masterVolumeValue"),
  audioTestButton: document.querySelector("#audioTestButton"),
  settingsFullscreenButton: document.querySelector("#settingsFullscreenButton"),
  settingsCloseButton: document.querySelector("#settingsCloseButton"),
  upgradePanel: document.querySelector("#upgradePanel"),
  upgradeKicker: document.querySelector("#upgradeKicker"),
  upgradeTitle: document.querySelector("#upgradeTitle"),
  upgradeChoices: document.querySelector("#upgradeChoices"),
  resultPanel: document.querySelector("#resultPanel"),
  resultKicker: document.querySelector("#resultKicker"),
  resultTitle: document.querySelector("#resultTitle"),
  resultText: document.querySelector("#resultText"),
  resultStats: document.querySelector("#resultStats"),
  resultInsights: document.querySelector("#resultInsights"),
  restartButton: document.querySelector("#restartButton"),
};

const keys = new Set();
const platform = window.VariableCityPlatform ?? {
  id: "web-fallback",
  label: "Web",
  storage: {
    readJson(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    writeJson(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore unavailable local storage.
      }
    },
  },
  requestFullscreen: async (target = document.documentElement) => {
    if (!target?.requestFullscreen) return false;
    await target.requestFullscreen();
    return true;
  },
  exitFullscreen: async () => {
    if (!document.exitFullscreen) return false;
    await document.exitFullscreen();
    return true;
  },
  isFullscreen: () => Boolean(document.fullscreenElement),
  getGamepads: () => (navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []),
  unlockAchievement: () => false,
};
const ARCHIVE_STORAGE_KEY = "variableCityArchive";
const RUN_SAVE_STORAGE_KEY = "variableCityRunSave";
const SETTINGS_STORAGE_KEY = "variableCitySettings";
const ACHIEVEMENT_STORAGE_KEY = "variableCityAchievements";
const ARCHIVE_VERSION = 6;
const RUN_SAVE_VERSION = 2;
const achievements = window.variableCityAchievementCatalog ?? [];
const urlParams = new URLSearchParams(window.location.search);
const storeShotMode = urlParams.get("storeShot")?.trim() ?? "";
const isStoreShotMode = Boolean(storeShotMode);
const isAutomationMode = urlParams.get("automation") === "1";
const world = {
  width: 1280,
  height: 720,
  viewWidth: canvas.width,
  viewHeight: canvas.height,
  cameraX: 0,
  cameraY: 0,
  mode: "playing",
  lastTime: 0,
  animTime: 0,
  spawnTimer: 0,
  pulseCooldown: 0,
  dashCooldown: 0,
  allyAssistCooldown: 0,
  mapHazardCooldown: 0,
  enemyLogCooldown: 0,
  cameraShake: 0,
  saveCooldown: 0,
  previousMode: "playing",
};

const playerBase = {
  x: 170,
  y: 560,
  radius: 18,
  speed: 230,
  maxHp: 100,
  hp: 100,
  level: 1,
  xp: 0,
  xpToNext: 8,
  pendingLevelUps: 0,
  bugPoints: 0,
  backlash: 0,
  fixed: 0,
  pulseCost: 2,
  pulseRadius: 120,
  pulseDamage: 44,
  dashPower: 120,
  invulnerable: 0,
};

const metaProgressNodes = [
  {
    id: "steady-heart",
    title: "稳定心跳",
    maxLevel: 4,
    costs: [8, 14, 22, 32],
    requirement: null,
    iconKey: "metaSteadyHeart",
    summary: "每级开局生命上限 +8",
    detail: "把前几次失误从立刻崩盘改成可修正的节奏窗口。",
  },
  {
    id: "warm-cache",
    title: "热缓存口袋",
    maxLevel: 3,
    costs: [6, 13, 24],
    requirement: null,
    iconKey: "metaWarmCache",
    summary: "每级开局 bug点数 +1",
    detail: "开局就能更早使用修复脉冲或冲刺，重开手感更轻。",
  },
  {
    id: "route-shoes",
    title: "巡线路鞋",
    maxLevel: 3,
    costs: [10, 18, 30],
    requirement: { bestChapter: 2 },
    iconKey: "metaRouteShoes",
    summary: "每级冲刺距离 +12",
    detail: "适合大地图章节，给躲 Boss 预警和跨危险区更多余量。",
  },
  {
    id: "chapter-insurance",
    title: "章节练习保险",
    maxLevel: 2,
    costs: [16, 28],
    requirement: { bestChapter: 3 },
    iconKey: "metaChapterInsurance",
    summary: "章节练习开局额外生命 +8、bug点数 +1",
    detail: "从已解锁章节练习时补一点基础资源，避免跳章开局太干。",
  },
  {
    id: "paperclip-specialist",
    title: "回形针专精",
    maxLevel: 3,
    costs: [12, 22, 36],
    requirement: { bestChapter: 2 },
    weaponId: "paperclip",
    iconKey: "metaPaperclipSpecialist",
    summary: "每级回形针伤害 +3，精准弹更强",
    detail: "适合喜欢点杀和控距离的路线，满级后加粗精准弹更快进入循环。",
  },
  {
    id: "keyboard-specialist",
    title: "键盘宏专精",
    maxLevel: 3,
    costs: [14, 24, 38],
    requirement: { bestChapter: 3 },
    weaponId: "keyboard",
    iconKey: "metaKeyboardSpecialist",
    summary: "每级键盘宏冷却 -4%，击退更强",
    detail: "让覆盖型武器在大地图里更稳定，适合清理分裂和召唤型敌人。",
  },
  {
    id: "correction-specialist",
    title: "修正液专精",
    maxLevel: 3,
    costs: [16, 26, 40],
    requirement: { bestChapter: 4 },
    weaponId: "correction-fluid",
    iconKey: "metaCorrectionSpecialist",
    summary: "每级修正液射程 +22，减速更久",
    detail: "强化近距控场的容错，让 Boss 召唤物和高速敌人更容易被压住。",
  },
];

const nightwatchHooks = [
  {
    id: "delivery-save-90",
    chapterIndex: 0,
    kicker: "首局钩子",
    title: "90秒救下超时单",
    promise: "先处理 1 个异常，再击破 8 个错误实体。完成后立刻拿碎片和补给，第一把就有成型感。",
    criteria: { events: 1, defeats: 8, timeLimit: 90 },
    rewardShards: 3,
    rewardBugPoints: 2,
    rewardHp: 10,
    startLog: "今晚委托已接取：先处理 1 个异常，再击破 8 个错误实体。",
    completeLog: "夜巡委托完成：超时单被抢回来了，档案柜吐出新的校准碎片。",
    failLog: "今晚委托超时：超时单被重新派发，但本轮夜巡仍可继续。",
  },
  {
    id: "metro-fast-line",
    chapterIndex: 1,
    kicker: "移动钩子",
    title: "追上 03:32 末班车",
    promise: "在限定时间内巡线 10 段并处理 1 个站台异常，逼玩家跑起来而不是站桩刷怪。",
    criteria: { distance: 1000, events: 1, maxDamage: 70, timeLimit: 150 },
    rewardShards: 4,
    rewardBugPoints: 2,
    rewardHp: 12,
    startLog: "今晚委托已接取：沿环线跑起来，处理站台异常前别被末班车拖慢。",
    completeLog: "夜巡委托完成：末班车停在正确帧上，车票背面多出一枚校准码。",
    failLog: "今晚委托失败：末班车离站了，但时刻表管理员还在前方等你。",
  },
  {
    id: "hash-no-duplicate",
    chapterIndex: 2,
    kicker: "探索钩子",
    title: "夜市不留重复编号",
    promise: "清掉 2 个摊位异常并击破 12 个追踪实体，让哈希夜市的探索目标更明确。",
    criteria: { events: 2, defeats: 12, timeLimit: 190 },
    rewardShards: 5,
    rewardBugPoints: 3,
    rewardHp: 12,
    startLog: "今晚委托已接取：夜市编号开始重复，优先处理两个摊位信标。",
    completeLog: "夜巡委托完成：重复编号被加盐拆开，夜市雨棚亮了一整排。",
    failLog: "今晚委托失败：重复编号扩散到后街，继续推进主线仍可追回缓存。",
  },
  {
    id: "pledge-no-debt",
    chapterIndex: 3,
    kicker: "低伤钩子",
    title: "不欠新的承诺债",
    promise: "在承诺塔里处理 2 个异常、击破 14 个敌人，并把受伤压在 80 以内。",
    criteria: { events: 2, defeats: 14, maxDamage: 80, timeLimit: 210 },
    rewardShards: 6,
    rewardBugPoints: 3,
    rewardHp: 14,
    startLog: "今晚委托已接取：别让承诺债滚起来，低伤处理两个根层异常。",
    completeLog: "夜巡委托完成：承诺债被截断，根层给你留出了一段安全窗口。",
    failLog: "今晚委托失败：新债已经入账，但根节点仍有弱点窗口。",
  },
  {
    id: "whitebox-counterexample",
    chapterIndex: 4,
    kicker: "终章钩子",
    title: "提交第一份反例",
    promise: "在白箱核心里巡线 12 段、处理 1 个证据点并保持低伤，开局就建立最终章目标。",
    criteria: { distance: 1200, events: 1, maxDamage: 90, timeLimit: 220 },
    rewardShards: 7,
    rewardBugPoints: 4,
    rewardHp: 16,
    startLog: "今晚委托已接取：提交第一份反例前，别让白箱把差异清零。",
    completeLog: "夜巡委托完成：第一份反例被写进核心日志，公共规则开始松动。",
    failLog: "今晚委托失败：白箱暂时归档了反例，但最终提交仍然有效。",
  },
];

const combatTempoConfig = {
  window: 4.2,
  rewardEvery: 5,
  maxRewardsPerRun: 12,
  bugPointReward: 1,
  healReward: 4,
  pickupXpReward: 2,
};
const fairWarningConfig = {
  lowHpRatio: 0.35,
  criticalHpRatio: 0.2,
  lowInvulnerable: 0.78,
  criticalInvulnerable: 1.05,
};

let player;
let bugNodes;
let enemies;
let particles;
let bullets;
let bugPickups;
let cleaners;
let boss;
let protocolHazards;
let enemyHazards;
let activeEvent = null;
let nextUpgradeAt = 2;
let chapterState;
let storyState = null;
let currentChapterIndex = 0;
let runStats;
let archiveState;
let runPanelSignature = "";
let gameSettings;
let gamepadState;
let audioSystem;
let lastInputMethod = "keyboard";
let metaUnlockPulseNodeId = null;
let resultRetryStarterBuildId = null;
let resultRetryBoost = null;
let resultRetryPlan = null;

const desks = [
  { x: 84, y: 104, w: 136, h: 54, tag: "Q3报表", assetKey: "propWorkstationA" },
  { x: 278, y: 104, w: 136, h: 54, tag: "需求池", assetKey: "propWorkstationB" },
  { x: 472, y: 104, w: 136, h: 54, tag: "灰度", assetKey: "propWorkstationC" },
  { x: 84, y: 236, w: 136, h: 54, tag: "咖啡", assetKey: "propWorkstationD" },
  { x: 278, y: 236, w: 136, h: 54, tag: "工单", assetKey: "propWorkstationE" },
  { x: 472, y: 236, w: 136, h: 54, tag: "弹幕", assetKey: "propWorkstationF" },
  { x: 742, y: 132, w: 210, h: 74, tag: "会议室" },
  { x: 1006, y: 132, w: 152, h: 74, tag: "老板室", assetKey: "propWorkstationB" },
  { x: 742, y: 420, w: 416, h: 78, tag: "0号服务器间" },
];

const chapterMaps = [
  {
    id: "office-dispatch",
    name: "超时订单办公室",
    width: 2240,
    height: 1280,
    start: { x: 170, y: 560 },
    bossSpawn: { x: 1890, y: 680 },
    bossPayload: { x: 1814, y: 694 },
    stepTargets: {
      0: [{ eventId: "bullet-comments", x: 540, y: 190 }],
      1: [{ eventId: "debug-badge", x: 250, y: 430 }],
      2: [
        { eventId: "emo-fluff", x: 1230, y: 865 },
        { eventId: "delivery-meat", x: 1582, y: 606 },
      ],
      3: [
        { eventId: "promise-bloat", x: 1916, y: 382 },
        { eventId: "talking-cat", x: 1840, y: 932 },
      ],
    },
    stepHints: {
      0: "目标信标已亮起：先检查工位区的弹幕异常。",
      1: "断点工牌在旧工位旁闪烁，靠近青蓝信标即可交互。",
      2: "办公室向茶水间和配送走廊展开，跟着地面路线继续推进。",
      3: "外卖取餐区在东侧深处，穿过重算路线后再进入 Boss 区。",
    },
    echoes: [
      {
        id: "office-cold-receipt",
        x: 826,
        y: 540,
        label: "冷掉配送单",
        message: "回声：配送单背面写着“03:32 后不要相信自动重派”。",
        bugPoints: 1,
        xp: 3,
        color: "#f1c15b",
      },
      {
        id: "office-server-whisper",
        x: 1868,
        y: 924,
        label: "服务器门缝",
        message: "回声：门缝里传来老梁的咳嗽声，他说异常不是第一次发生。",
        bugPoints: 1,
        xp: 4,
        color: "#5de2d1",
      },
    ],
    caches: [
      {
        id: "office-overtime-sorter",
        x: 940,
        y: 558,
        label: "超时件分拣台",
        message: "地标补给：超时件分拣台吐出一份还能用的凌晨补给。",
        bugPoints: 1,
        xp: 3,
        hp: 6,
        color: "#f1c15b",
        code: "999",
      },
    ],
    paths: [
      { kind: "corridor", x: 58, y: 332, w: 760, h: 92, label: "工位通道", color: "#5de2d1" },
      { kind: "corridor", x: 676, y: 512, w: 684, h: 112, label: "配送走廊", color: "#f1c15b" },
      { kind: "corridor", x: 1138, y: 756, w: 456, h: 150, label: "茶水间", color: "#72a5ff" },
      { kind: "corridor", x: 1508, y: 420, w: 520, h: 246, label: "外卖取餐区", color: "#f1c15b" },
      { kind: "corridor", x: 1712, y: 842, w: 408, h: 210, label: "服务器入口", color: "#5de2d1" },
      { kind: "route", x1: 614, y1: 380, x2: 1200, y2: 822, color: "#72a5ff", label: "去茶水间" },
      { kind: "route", x1: 1018, y1: 558, x2: 1842, y2: 620, color: "#f1c15b", label: "去取餐区" },
      { kind: "route", x1: 1846, y1: 704, x2: 1900, y2: 936, color: "#5de2d1", label: "去服务器间" },
    ],
    spawnPoints: [
      { x: 72, y: 92 }, { x: 1188, y: 102 }, { x: 86, y: 628 }, { x: 1166, y: 634 },
      { x: 624, y: 94 }, { x: 622, y: 646 }, { x: 1360, y: 1028 }, { x: 2144, y: 164 },
      { x: 2106, y: 1096 }, { x: 1518, y: 740 },
    ],
    zones: [
      {
        id: "delivery-buffer",
        x: 888,
        y: 510,
        w: 282,
        h: 118,
        type: "focus",
        label: "外卖缓存区",
        color: "#f1c15b",
        slowFactor: 0.9,
      },
      {
        id: "tea-break",
        x: 1138,
        y: 756,
        w: 456,
        h: 150,
        type: "focus",
        label: "茶水间低语",
        color: "#72a5ff",
        slowFactor: 0.94,
      },
      {
        id: "route-recalculate",
        x: 1512,
        y: 314,
        w: 232,
        h: 462,
        type: "hazard",
        label: "重算路线",
        color: "#ef6a70",
        damage: 5,
        cooldown: 1.45,
        slowFactor: 0.78,
        log: "地面路线突然重算，错误坐标擦过脚边。",
      },
      {
        id: "server-threshold",
        x: 1712,
        y: 842,
        w: 408,
        h: 210,
        type: "slow",
        label: "服务器门禁",
        color: "#5de2d1",
        slowFactor: 0.86,
      },
    ],
    obstacles: [
      ...desks.map((desk) => ({ ...desk, kind: "desk" })),
      { kind: "singleDesk", x: 34, y: 586, w: 210, h: 80, label: "安渡工位" },
      { kind: "desk", x: 1124, y: 802, w: 136, h: 54, tag: "咖啡因", assetKey: "propWorkstationD" },
      { kind: "desk", x: 1332, y: 802, w: 136, h: 54, tag: "排班表", assetKey: "propWorkstationE" },
      { kind: "kiosk", x: 1506, y: 254, w: 146, h: 112, label: "路线柜" },
      { kind: "serverCluster", x: 1816, y: 292, w: 246, h: 112, label: "取餐柜背板" },
      { kind: "singleDesk", x: 1842, y: 966, w: 210, h: 80, label: "临时调度台" },
      { kind: "partitionWide", x: 760, y: 682, w: 360, h: 72, label: "玻璃隔断" },
      { kind: "partitionWide", x: 1210, y: 594, w: 320, h: 72, label: "路线隔断" },
    ],
    props: [
      { kind: "windowRow", x: 32, y: 14, count: 4 },
      { kind: "windowRow", x: 788, y: 14, count: 3 },
      { kind: "windowRow", x: 1440, y: 14, count: 4 },
      { kind: "whiteboard", x: 386, y: 14, w: 170, h: 38 },
      { kind: "whiteboard", x: 1200, y: 698, w: 190, h: 42 },
      { kind: "water", x: 628, y: 94 },
      { kind: "water", x: 1452, y: 846 },
      { kind: "copier", x: 1116, y: 96 },
      { kind: "plant", x: 52, y: 96, scale: 1 },
      { kind: "plant", x: 1196, y: 602, scale: 1.1 },
      { kind: "plant", x: 650, y: 622, scale: 0.85 },
      { kind: "plant", x: 1380, y: 740, scale: 0.9 },
      { kind: "plant", x: 2106, y: 1034, scale: 1.05 },
      { kind: "meeting", x: 750, y: 262 },
      { kind: "meeting", x: 1198, y: 964 },
      { kind: "visitorStool", x: 700, y: 360, w: 42, h: 46, label: "临时座" },
      { kind: "visitorStool", x: 1010, y: 352, w: 42, h: 46, label: "临时座" },
      { kind: "visitorStool", x: 1288, y: 910, w: 42, h: 46, label: "咖啡凳" },
      { kind: "visitorStool", x: 1430, y: 910, w: 42, h: 46, label: "咖啡凳" },
      { kind: "meetingBench", x: 818, y: 218, w: 148, h: 78, label: "协作凳" },
      { kind: "meetingBench", x: 1248, y: 736, w: 148, h: 78, label: "等候凳" },
      { kind: "serverDoor", x: 738, y: 388 },
      { kind: "serverDoor", x: 1686, y: 908 },
      { kind: "printer", x: 1034, y: 526 },
      { kind: "printer", x: 1628, y: 780 },
      { kind: "deliveryZone", x: 940, y: 558 },
      { kind: "deliveryZone", x: 1810, y: 626 },
      { kind: "deliveryCrates", x: 900, y: 456, w: 146, h: 58, label: "超时件" },
      { kind: "deliveryCrates", x: 1704, y: 520, w: 180, h: 72, label: "待取件" },
      { kind: "deliveryCrates", x: 1958, y: 710, w: 156, h: 62, label: "重传件" },
      { kind: "routeTerminal", x: 1160, y: 426, w: 64, h: 76, label: "路由" },
      { kind: "routeTerminal", x: 1648, y: 536, w: 74, h: 92, label: "重算" },
      { kind: "phoneBeacon", x: 814, y: 540, label: "999" },
      { kind: "phoneBeacon", x: 1960, y: 562, label: "ACK?" },
      { kind: "areaGate", x: 676, y: 534, w: 260, h: 58, label: "前往茶水间", color: "#72a5ff" },
      { kind: "areaGate", x: 1406, y: 522, w: 274, h: 58, label: "前往取餐区", color: "#f1c15b" },
      { kind: "areaGate", x: 1760, y: 888, w: 294, h: 62, label: "进入服务器入口", color: "#5de2d1" },
      { kind: "fileCabinet", x: 1098, y: 688, w: 92, h: 112, label: "茶水档案" },
      { kind: "planterBox", x: 1516, y: 1008, w: 210, h: 84, label: "绿植隔离带" },
    ],
    decorations: [
      { kind: "parcelTape", x: 884, y: 500, w: 296, h: 142, color: "#f1c15b" },
      { kind: "parcelTape", x: 1662, y: 478, w: 496, h: 326, color: "#f1c15b" },
      { kind: "floorCable", x1: 738, y1: 454, x2: 1016, y2: 552, color: "#5de2d1" },
      { kind: "floorCable", x1: 1016, y1: 552, x2: 1814, y2: 694, color: "#5de2d1" },
      { kind: "floorCable", x1: 1272, y1: 820, x2: 1842, y2: 938, color: "#72a5ff" },
      { kind: "routeArrow", x: 852, y: 560, angle: -0.08, label: "配送路线", color: "#f1c15b" },
      { kind: "routeArrow", x: 1208, y: 844, angle: 0.04, label: "茶水间", color: "#72a5ff" },
      { kind: "routeArrow", x: 1710, y: 620, angle: 0.02, label: "取餐区", color: "#f1c15b" },
      { kind: "routeArrow", x: 1906, y: 924, angle: 1.44, label: "服务器入口", color: "#5de2d1" },
      { kind: "stickyCluster", x: 392, y: 76, count: 7, color: "#f1c15b" },
      { kind: "stickyCluster", x: 1296, y: 706, count: 6, color: "#72a5ff" },
      { kind: "deskGlowGrid", x: 72, y: 96, w: 560, h: 210, color: "#5de2d1" },
      { kind: "deskGlowGrid", x: 1116, y: 776, w: 370, h: 132, color: "#72a5ff" },
      { kind: "chairScuffs", x: 98, y: 184, count: 9, color: "#718096" },
      { kind: "chairScuffs", x: 306, y: 314, count: 7, color: "#718096" },
      { kind: "chairScuffs", x: 1188, y: 912, count: 8, color: "#718096" },
    ],
  },
  {
    id: "metro-loop",
    name: "03:32 环线站台",
    badgeKey: "chapterBadgeMetroLoop",
    width: 2240,
    height: 1260,
    start: { x: 160, y: 610 },
    bossSpawn: { x: 1938, y: 936 },
    bossPayload: { x: 1768, y: 890 },
    stepTargets: {
      0: [{ eventId: "subway-loop", x: 638, y: 478 }],
      1: [
        { eventId: "skipped-station", x: 316, y: 196 },
        { eventId: "queue-timetable", x: 948, y: 236 },
      ],
      2: [{ eventId: "clock-debt", x: 1398, y: 742 }],
      3: [
        { eventId: "debug-badge", x: 1668, y: 330 },
        { eventId: "fish-dimension", x: 1886, y: 1082 },
      ],
    },
    stepHints: {
      0: "末班车残影沿左侧站台循环，先稳定起点轨道。",
      1: "跳站名单分散在旧闸机和补票大厅，两个信标都要处理。",
      2: "时间债账单被冲到东侧换乘厅，沿蓝色轨道继续前进。",
      3: "终点站在远端折返区，清掉阻塞班次后再进入管理员站台。",
    },
    echoes: [
      {
        id: "metro-late-ticket",
        x: 412,
        y: 430,
        label: "迟到者车票",
        message: "回声：车票打孔处写着“下一站会提前到达昨天”。",
        bugPoints: 1,
        xp: 4,
        color: "#72a5ff",
      },
      {
        id: "metro-terminal-echo",
        x: 1888,
        y: 786,
        label: "终点广播",
        message: "回声：终点站广播重复安渡的名字，却少念了一个字。",
        bugPoints: 1,
        xp: 5,
        color: "#f1c15b",
      },
    ],
    caches: [
      {
        id: "metro-turnback-signal",
        x: 1528,
        y: 850,
        label: "折返信号箱",
        message: "地标补给：折返信号箱吐出一张提前到站的车票。",
        bugPoints: 2,
        xp: 4,
        hp: 6,
        color: "#72a5ff",
        code: "SIG",
      },
    ],
    interactives: [
      {
        id: "metro-time-gate",
        x: 1038,
        y: 492,
        label: "准点闸门",
        message: "互动地标：准点闸门把下一班车锁在当前帧，闪避和修复脉冲立刻冷却。",
        bugPoints: 1,
        xp: 4,
        hp: 5,
        cooldownReset: true,
        invulnerable: 1,
        color: "#72a5ff",
        code: "T+",
      },
    ],
    spawnPoints: [
      { x: 90, y: 106 }, { x: 1190, y: 112 }, { x: 94, y: 618 }, { x: 1188, y: 624 },
      { x: 520, y: 98 }, { x: 760, y: 638 },
      { x: 1460, y: 118 }, { x: 2076, y: 176 }, { x: 2140, y: 1120 }, { x: 1520, y: 1010 },
    ],
    paths: [
      { kind: "rail", x1: 84, y1: 504, x2: 1196, y2: 384, color: "#72a5ff" },
      { kind: "rail", x1: 92, y1: 558, x2: 1198, y2: 440, color: "#f1c15b" },
      { kind: "rail", x1: 1118, y1: 426, x2: 2076, y2: 314, color: "#72a5ff", label: "东行环线" },
      { kind: "rail", x1: 1178, y1: 506, x2: 2058, y2: 830, color: "#f1c15b", label: "折返线" },
      { kind: "corridor", x: 1338, y: 666, w: 560, h: 128, label: "换乘厅", color: "#5de2d1" },
      { kind: "corridor", x: 1768, y: 882, w: 352, h: 164, label: "终点站", color: "#72a5ff" },
    ],
    zones: [
      {
        id: "frame-track",
        x: 118,
        y: 474,
        w: 1046,
        h: 74,
        type: "hazard",
        label: "失帧轨道",
        color: "#72a5ff",
        damage: 7,
        cooldown: 1.25,
        slowFactor: 0.72,
        log: "脚下轨道突然丢帧，安渡被下一班车的残影擦过。",
      },
      {
        id: "commuter-flow",
        x: 236,
        y: 256,
        w: 760,
        h: 58,
        type: "slow",
        label: "通勤人流",
        color: "#5de2d1",
        slowFactor: 0.84,
      },
      {
        id: "transfer-crowd",
        x: 1358,
        y: 652,
        w: 506,
        h: 156,
        type: "slow",
        label: "换乘人潮",
        color: "#5de2d1",
        slowFactor: 0.8,
      },
      {
        id: "terminal-echo",
        x: 1740,
        y: 858,
        w: 420,
        h: 218,
        type: "hazard",
        label: "终点站重播",
        color: "#ef6a70",
        damage: 7,
        cooldown: 1.2,
        slowFactor: 0.72,
        log: "终点站广播重播旧日到站，脚下轨道闪了一下。",
      },
    ],
    obstacles: [
      { kind: "gate", x: 172, y: 164, w: 178, h: 52, label: "检票闸机" },
      { kind: "gate", x: 458, y: 164, w: 178, h: 52, label: "补票窗口" },
      { kind: "gate", x: 744, y: 164, w: 178, h: 52, label: "换乘门" },
      { kind: "kiosk", x: 1048, y: 182, w: 132, h: 96, label: "调度亭" },
      { kind: "pillar", x: 292, y: 360, w: 52, h: 52, label: "立柱" },
      { kind: "pillar", x: 608, y: 334, w: 52, h: 52, label: "立柱" },
      { kind: "pillar", x: 924, y: 310, w: 52, h: 52, label: "立柱" },
      { kind: "gate", x: 1328, y: 184, w: 196, h: 54, label: "东厅闸机" },
      { kind: "gate", x: 1618, y: 184, w: 196, h: 54, label: "迟到者门" },
      { kind: "kiosk", x: 1878, y: 206, w: 148, h: 102, label: "终点调度" },
      { kind: "pillar", x: 1488, y: 470, w: 58, h: 58, label: "换乘柱" },
      { kind: "pillar", x: 1788, y: 642, w: 58, h: 58, label: "折返柱" },
      { kind: "train", x: 1328, y: 1012, w: 382, h: 82, label: "空车厢" },
    ],
    props: [
      { kind: "stationSign", x: 760, y: 92, label: "环线 03:32" },
      { kind: "train", x: 42, y: 604, w: 338, h: 72, label: "停摆车厢" },
      { kind: "metroBench", x: 388, y: 412, w: 188, h: 42, label: "候车椅" },
      { kind: "metroBench", x: 758, y: 386, w: 188, h: 42, label: "候车椅" },
      { kind: "ticketMachine", x: 1058, y: 492, w: 84, h: 92, label: "补票机" },
      { kind: "signalLight", x: 108, y: 334, w: 54, h: 94, label: "信号" },
      { kind: "plant", x: 1168, y: 520, scale: 0.78 },
      { kind: "printer", x: 1048, y: 306 },
      { kind: "stationSign", x: 1516, y: 112, label: "换乘厅" },
      { kind: "stationSign", x: 1950, y: 808, label: "终点站" },
      { kind: "metroBench", x: 1388, y: 548, w: 188, h: 42, label: "换乘椅" },
      { kind: "metroBench", x: 1818, y: 758, w: 188, h: 42, label: "终点椅" },
      { kind: "ticketMachine", x: 1528, y: 850, w: 84, h: 92, label: "旧票机" },
      { kind: "signalLight", x: 2028, y: 616, w: 54, h: 94, label: "折返" },
    ],
    decorations: [
      { kind: "platformEdge", x: 94, y: 574, w: 1090, h: 24, color: "#f1c15b" },
      { kind: "ticketTrail", x: 252, y: 292, count: 9, color: "#72a5ff" },
      { kind: "signalPulse", x: 136, y: 338, color: "#ef6a70" },
      { kind: "crowdGhosts", x: 286, y: 252, count: 11, color: "#5de2d1" },
      { kind: "platformEdge", x: 1288, y: 618, w: 772, h: 24, color: "#72a5ff" },
      { kind: "ticketTrail", x: 1398, y: 742, count: 12, color: "#f1c15b" },
      { kind: "crowdGhosts", x: 1458, y: 646, count: 14, color: "#5de2d1" },
      { kind: "signalPulse", x: 2048, y: 640, color: "#ef6a70" },
    ],
  },
  {
    id: "hash-market",
    name: "哈希夜市雨棚",
    badgeKey: "chapterBadgeHashMarket",
    width: 2180,
    height: 1260,
    start: { x: 158, y: 602 },
    bossSpawn: { x: 1846, y: 892 },
    bossPayload: { x: 1668, y: 740 },
    stepTargets: {
      0: [{ eventId: "night-market-hash", x: 360, y: 488 }],
      1: [
        { eventId: "duplicate-menu", x: 860, y: 196 },
        { eventId: "price-index", x: 1538, y: 558 },
      ],
      2: [{ eventId: "salted-memory", x: 1328, y: 228 }],
      3: [
        { eventId: "delivery-meat", x: 520, y: 930 },
        { eventId: "promise-bloat", x: 1768, y: 412 },
      ],
    },
    stepHints: {
      0: "夜市入口的短码招牌亮起，先给名字加盐。",
      1: "重复编号藏在西侧摊位，价格索引已经滑到东侧扩容街。",
      2: "老梁的小票被盐雨冲到雨棚背面，沿绿光摊位追过去。",
      3: "缓存保卫战分成前街和索引中庭，两个信标都要清掉。",
    },
    echoes: [
      {
        id: "hash-salted-receipt",
        x: 842,
        y: 556,
        label: "昨日小票",
        message: "回声：小票上的名字被加盐，只有老梁还记得原价。",
        bugPoints: 1,
        xp: 5,
        color: "#d8b26e",
      },
      {
        id: "hash-short-code",
        x: 1706,
        y: 386,
        label: "短码柜台",
        message: "回声：#404 柜台拒绝承认自己卖过同一道面。",
        bugPoints: 2,
        xp: 4,
        color: "#96e072",
      },
    ],
    caches: [
      {
        id: "hash-spice-counter",
        x: 1540,
        y: 742,
        label: "重号面车",
        message: "地标补给：重号面车把同一份订单拆成两份可读缓存。",
        bugPoints: 2,
        xp: 5,
        backlash: 8,
        color: "#96e072",
        code: "#+",
      },
    ],
    interactives: [
      {
        id: "hash-salt-lantern",
        x: 1328,
        y: 228,
        label: "盐值灯串",
        message: "互动地标：盐值灯串重新打散重复编号，掉出几份可读缓存。",
        bugPoints: 1,
        xp: 5,
        backlash: 6,
        spawnPickups: 3,
        color: "#96e072",
        code: "#!",
      },
    ],
    spawnPoints: [
      { x: 86, y: 110 }, { x: 1190, y: 116 }, { x: 92, y: 636 }, { x: 1170, y: 628 },
      { x: 636, y: 104 }, { x: 640, y: 634 },
      { x: 1440, y: 110 }, { x: 2072, y: 188 }, { x: 2048, y: 1074 }, { x: 1110, y: 1120 },
    ],
    paths: [
      { kind: "corridor", x: 70, y: 476, w: 1036, h: 112, label: "夜市前街", color: "#d8b26e" },
      { kind: "corridor", x: 1008, y: 320, w: 760, h: 152, label: "短码雨棚", color: "#96e072" },
      { kind: "corridor", x: 1450, y: 712, w: 548, h: 168, label: "索引中庭", color: "#72a5ff" },
      { kind: "route", x1: 620, y1: 510, x2: 1328, y2: 228, color: "#96e072", label: "盐雨小票" },
      { kind: "route", x1: 1090, y1: 536, x2: 1846, y2: 892, color: "#d8b26e", label: "索引摊主" },
    ],
    zones: [
      {
        id: "salt-rain",
        x: 438,
        y: 238,
        w: 398,
        h: 178,
        type: "backlash",
        label: "哈希盐雨",
        color: "#96e072",
        backlashPerSecond: 3.8,
        slowFactor: 0.88,
      },
      {
        id: "crowd-corridor",
        x: 192,
        y: 500,
        w: 884,
        h: 56,
        type: "slow",
        label: "摊位人潮",
        color: "#d8b26e",
        slowFactor: 0.78,
      },
      {
        id: "salt-rain-east",
        x: 1218,
        y: 168,
        w: 452,
        h: 176,
        type: "backlash",
        label: "背面盐雨",
        color: "#96e072",
        backlashPerSecond: 4.4,
        slowFactor: 0.86,
      },
      {
        id: "index-clearance",
        x: 1512,
        y: 686,
        w: 438,
        h: 226,
        type: "hazard",
        label: "索引清场线",
        color: "#ef6a70",
        damage: 7,
        cooldown: 1.25,
        slowFactor: 0.76,
        log: "摊位号被强制重排，脚下的编号突然变成红色。",
      },
    ],
    obstacles: [
      { kind: "stall", x: 92, y: 144, w: 214, h: 110, label: "字符串烤摊", color: "#d8b26e" },
      { kind: "stall", x: 382, y: 118, w: 214, h: 110, label: "数组糖水", color: "#96e072" },
      { kind: "stall", x: 686, y: 126, w: 214, h: 110, label: "弱引用铺", color: "#72a5ff" },
      { kind: "stall", x: 978, y: 156, w: 210, h: 106, label: "盐值档案" },
      { kind: "stall", x: 104, y: 384, w: 214, h: 112, label: "冲突修补" },
      { kind: "stall", x: 902, y: 406, w: 234, h: 112, label: "桶扩容" },
      { kind: "stall", x: 1264, y: 122, w: 224, h: 112, label: "昨日小票" },
      { kind: "stall", x: 1582, y: 126, w: 224, h: 112, label: "短码伞铺" },
      { kind: "stall", x: 1368, y: 482, w: 220, h: 112, label: "价格索引" },
      { kind: "stall", x: 1740, y: 534, w: 246, h: 118, label: "缓存门面" },
      { kind: "gate", x: 1088, y: 880, w: 232, h: 58, label: "雨棚后门" },
      { kind: "pillar", x: 1968, y: 760, w: 58, h: 58, label: "短码柱" },
    ],
    props: [
      { kind: "marketCanopy", x: 198, y: 584, color: "#d8b26e", label: "夜市出口" },
      { kind: "marketCanopy", x: 806, y: 328, color: "#96e072", label: "HASH" },
      { kind: "saltCrates", x: 456, y: 438, w: 128, h: 58, label: "盐值箱" },
      { kind: "noodleCart", x: 636, y: 500, w: 142, h: 64, label: "同号面摊" },
      { kind: "memoryReceipt", x: 842, y: 556, w: 98, h: 44, label: "昨日小票" },
      { kind: "hashCounter", x: 596, y: 302, w: 86, h: 76, label: "#12" },
      { kind: "plant", x: 620, y: 624, scale: 0.82 },
      { kind: "water", x: 1170, y: 570 },
      { kind: "marketCanopy", x: 1360, y: 310, color: "#96e072", label: "背面盐棚" },
      { kind: "marketCanopy", x: 1788, y: 842, color: "#72a5ff", label: "索引中庭" },
      { kind: "saltCrates", x: 1248, y: 438, w: 128, h: 58, label: "盐值缓存" },
      { kind: "noodleCart", x: 1540, y: 742, w: 150, h: 66, label: "重号面车" },
      { kind: "memoryReceipt", x: 1328, y: 228, w: 112, h: 48, label: "背面小票" },
      { kind: "hashCounter", x: 1706, y: 386, w: 92, h: 82, label: "#404" },
      { kind: "water", x: 2028, y: 1002 },
    ],
    decorations: [
      { kind: "lanternString", x1: 72, y1: 92, x2: 1188, y2: 128, color: "#f1c15b" },
      { kind: "neonPuddle", x: 628, y: 348, radius: 120, color: "#96e072" },
      { kind: "saltRain", x: 438, y: 238, w: 398, h: 178, color: "#96e072" },
      { kind: "receiptTrail", x: 766, y: 482, count: 8, color: "#d8b26e" },
      { kind: "lanternString", x1: 1128, y1: 108, x2: 2056, y2: 166, color: "#96e072" },
      { kind: "saltRain", x: 1218, y: 168, w: 452, h: 176, color: "#96e072" },
      { kind: "neonPuddle", x: 1708, y: 812, radius: 138, color: "#72a5ff" },
      { kind: "receiptTrail", x: 1462, y: 724, count: 11, color: "#d8b26e" },
    ],
  },
  {
    id: "promise-tower",
    name: "承诺塔根层",
    badgeKey: "chapterBadgePromiseTower",
    width: 2160,
    height: 1320,
    start: { x: 160, y: 604 },
    bossSpawn: { x: 1828, y: 982 },
    bossPayload: { x: 1608, y: 826 },
    stepTargets: {
      0: [{ eventId: "branch-pledge", x: 522, y: 212 }],
      1: [{ eventId: "null-contract", x: 1418, y: 558 }],
      2: [
        { eventId: "stack-debt", x: 246, y: 872 },
        { eventId: "promise-bloat", x: 1642, y: 232 },
      ],
      3: [
        { eventId: "queue-timetable", x: 920, y: 170 },
        { eventId: "salted-memory", x: 1782, y: 622 },
      ],
    },
    stepHints: {
      0: "根层入口分叉正在抽芽，先修剪左侧空头承诺。",
      1: "空值合同被推到东侧责任廊，沿主根向右上推进。",
      2: "债务堆分散到下层和高层分枝，两个栈顶都要卸掉。",
      3: "根节点苏醒前，时间账和盐雨记忆在远端合流。",
    },
    echoes: [
      {
        id: "pledge-null-contract",
        x: 1418,
        y: 558,
        label: "空值合同",
        message: "回声：合同第一页没有甲方，最后一页却签着安渡。",
        bugPoints: 1,
        xp: 5,
        color: "#72a5ff",
      },
      {
        id: "pledge-root-lamp",
        x: 1948,
        y: 742,
        label: "根灯",
        message: "回声：根灯每亮一次，就有一个旧承诺被写成债务。",
        bugPoints: 2,
        xp: 5,
        color: "#96e072",
      },
    ],
    caches: [
      {
        id: "pledge-await-hourglass",
        x: 874,
        y: 546,
        label: "await 沙漏",
        message: "地标补给：await 沙漏倒转一圈，把一次旧承诺换成呼吸空间。",
        bugPoints: 1,
        xp: 5,
        hp: 10,
        color: "#f1c15b",
        code: "AWT",
      },
    ],
    interactives: [
      {
        id: "pledge-branch-relay",
        x: 1028,
        y: 182,
        label: "叶灯中继",
        message: "互动地标：叶灯中继截断一段新承诺，给安渡留出短暂安全窗口。",
        bugPoints: 1,
        xp: 5,
        hp: 12,
        invulnerable: 1.6,
        cooldownReset: true,
        color: "#96e072",
        code: "OK",
      },
    ],
    spawnPoints: [
      { x: 82, y: 112 }, { x: 1192, y: 110 }, { x: 86, y: 638 }, { x: 1188, y: 634 },
      { x: 640, y: 92 }, { x: 640, y: 642 },
      { x: 1478, y: 104 }, { x: 2074, y: 208 }, { x: 2020, y: 1120 }, { x: 850, y: 1174 },
    ],
    paths: [
      { kind: "root", x1: 640, y1: 688, x2: 640, y2: 92, color: "#96e072" },
      { kind: "root", x1: 640, y1: 420, x2: 286, y2: 262, color: "#96e072" },
      { kind: "root", x1: 640, y1: 350, x2: 1028, y2: 216, color: "#96e072" },
      { kind: "root", x1: 640, y1: 420, x2: 1418, y2: 558, color: "#72a5ff", label: "责任廊" },
      { kind: "root", x1: 1028, y1: 216, x2: 1642, y2: 232, color: "#96e072", label: "高层分枝" },
      { kind: "root", x1: 1418, y1: 558, x2: 1828, y2: 982, color: "#f1c15b", label: "根节点" },
      { kind: "corridor", x: 1328, y: 500, w: 498, h: 134, label: "责任廊", color: "#72a5ff" },
      { kind: "corridor", x: 1548, y: 878, w: 456, h: 182, label: "根心平台", color: "#96e072" },
    ],
    zones: [
      {
        id: "recursion-pool",
        x: 432,
        y: 206,
        w: 184,
        h: 132,
        type: "hazard",
        label: "递归回声池",
        color: "#96e072",
        damage: 6,
        cooldown: 1.35,
        slowFactor: 0.66,
        log: "递归回声把脚步重新压栈，安渡被承诺残响拖住。",
      },
      {
        id: "await-fog",
        x: 736,
        y: 448,
        w: 260,
        h: 92,
        type: "slow",
        label: "await 雾带",
        color: "#72a5ff",
        slowFactor: 0.74,
      },
      {
        id: "debt-stack",
        x: 1568,
        y: 178,
        w: 318,
        h: 170,
        type: "hazard",
        label: "债务栈顶",
        color: "#f1c15b",
        damage: 7,
        cooldown: 1.28,
        slowFactor: 0.7,
        log: "一叠旧承诺从高层分枝落下，砸出新的责任坐标。",
      },
      {
        id: "root-heart-fog",
        x: 1550,
        y: 876,
        w: 470,
        h: 196,
        type: "slow",
        label: "根心雾带",
        color: "#96e072",
        slowFactor: 0.76,
      },
    ],
    obstacles: [
      { kind: "rootWall", x: 584, y: 116, w: 112, h: 168, label: "主根" },
      { kind: "rootWall", x: 322, y: 348, w: 226, h: 58, label: "分枝承诺" },
      { kind: "rootWall", x: 760, y: 298, w: 256, h: 58, label: "未决链" },
      { kind: "pillar", x: 176, y: 488, w: 62, h: 62, label: "叶节点" },
      { kind: "pillar", x: 1078, y: 514, w: 62, h: 62, label: "叶节点" },
      { kind: "rootWall", x: 1292, y: 318, w: 276, h: 58, label: "责任分枝" },
      { kind: "rootWall", x: 1580, y: 690, w: 320, h: 62, label: "根心护栏" },
      { kind: "pillar", x: 1448, y: 762, w: 66, h: 66, label: "债务柱" },
      { kind: "pillar", x: 1982, y: 928, w: 66, h: 66, label: "盖章柱" },
      { kind: "gate", x: 988, y: 930, w: 260, h: 58, label: "下层回廊" },
    ],
    props: [
      { kind: "stationSign", x: 824, y: 92, label: "根承诺" },
      { kind: "coreTree", x: 610, y: 468, w: 92, h: 142, label: "承诺中枢" },
      { kind: "promiseTablet", x: 270, y: 210, w: 92, h: 118, label: "空值合同" },
      { kind: "awaitHourglass", x: 874, y: 546, w: 78, h: 86, label: "await" },
      { kind: "rootLantern", x: 1028, y: 182, w: 68, h: 76, label: "叶灯" },
      { kind: "contractMonolith", x: 116, y: 354, w: 72, h: 112, label: "责任碑" },
      { kind: "plant", x: 1160, y: 160, scale: 0.86 },
      { kind: "whiteboard", x: 86, y: 92, w: 184, h: 46 },
      { kind: "stationSign", x: 1506, y: 118, label: "高层分枝" },
      { kind: "coreTree", x: 1768, y: 820, w: 104, h: 156, label: "根心" },
      { kind: "promiseTablet", x: 1372, y: 506, w: 104, h: 124, label: "空值合同" },
      { kind: "awaitHourglass", x: 1630, y: 544, w: 78, h: 86, label: "等待" },
      { kind: "rootLantern", x: 1948, y: 742, w: 74, h: 82, label: "根灯" },
      { kind: "contractMonolith", x: 884, y: 1012, w: 80, h: 122, label: "债碑" },
    ],
    decorations: [
      { kind: "contractRibbon", x1: 236, y1: 188, x2: 1018, y2: 566, color: "#96e072" },
      { kind: "rootBud", x: 640, y: 418, count: 12, color: "#96e072" },
      { kind: "awaitGlyphs", x: 736, y: 448, w: 260, h: 92, color: "#72a5ff" },
      { kind: "recursionRings", x: 524, y: 272, radius: 92, color: "#96e072" },
      { kind: "contractRibbon", x1: 1028, y1: 216, x2: 1828, y2: 982, color: "#96e072" },
      { kind: "rootBud", x: 1506, y: 548, count: 14, color: "#72a5ff" },
      { kind: "awaitGlyphs", x: 1550, y: 876, w: 470, h: 196, color: "#96e072" },
      { kind: "recursionRings", x: 1776, y: 916, radius: 128, color: "#f1c15b" },
    ],
  },
  {
    id: "whitebox-core",
    name: "零号白箱核心",
    badgeKey: "chapterBadgeWhiteboxCore",
    width: 2240,
    height: 1320,
    start: { x: 150, y: 600 },
    bossSpawn: { x: 1884, y: 904 },
    bossPayload: { x: 1698, y: 790 },
    stepTargets: {
      0: [{ eventId: "graph-alley", x: 520, y: 526 }],
      1: [{ eventId: "inspector-memory", x: 1298, y: 196 }],
      2: [{ eventId: "city-heart", x: 1698, y: 790 }],
      3: [
        { eventId: "branch-pledge", x: 226, y: 234 },
        { eventId: "night-market-hash", x: 1462, y: 1038 },
        { eventId: "queue-timetable", x: 1980, y: 376 },
      ],
    },
    stepHints: {
      0: "核心入口像图一样分叉，先稳定左侧连接走廊。",
      1: "巡检员记忆被封在北侧白箱舱，穿过扫描线读取。",
      2: "城市心跳藏在远端核心室，沿红蓝证据链推进。",
      3: "最终反例散落在旧承诺、夜市缓存和环线时刻表三处。",
    },
    echoes: [
      {
        id: "whitebox-evidence-pod",
        x: 520,
        y: 526,
        label: "保留证据",
        message: "回声：证据柜里有一张便签：差异不是错误。",
        bugPoints: 2,
        xp: 5,
        color: "#72a5ff",
      },
      {
        id: "whitebox-city-heart",
        x: 1698,
        y: 790,
        label: "城市心跳",
        message: "回声：心跳室短暂承认，规则也需要被别人保护。",
        bugPoints: 2,
        xp: 6,
        color: "#ef6a70",
      },
    ],
    caches: [
      {
        id: "whitebox-counterexample-cache",
        x: 1238,
        y: 452,
        label: "反例缓存台",
        message: "地标补给：反例缓存台保留了一段不该被清零的差异。",
        bugPoints: 2,
        xp: 6,
        backlash: 10,
        color: "#72a5ff",
        code: "EX",
      },
    ],
    interactives: [
      {
        id: "whitebox-diff-console",
        x: 1704,
        y: 842,
        label: "差异控制台",
        message: "互动地标：差异控制台把周围追踪实体标成非必删项，白箱清场短暂停顿。",
        bugPoints: 1,
        xp: 6,
        backlash: 8,
        weakenRadius: 340,
        weakenDamage: 38,
        color: "#72a5ff",
        code: "!=",
      },
    ],
    spawnPoints: [
      { x: 84, y: 106 }, { x: 1190, y: 110 }, { x: 90, y: 632 }, { x: 1190, y: 632 },
      { x: 640, y: 94 }, { x: 640, y: 640 },
      { x: 1478, y: 112 }, { x: 2112, y: 198 }, { x: 2090, y: 1136 }, { x: 1486, y: 1168 },
    ],
    paths: [
      { kind: "corridor", x: 92, y: 496, w: 1030, h: 118, label: "图结构走廊", color: "#72a5ff" },
      { kind: "corridor", x: 1106, y: 286, w: 650, h: 126, label: "巡检记忆舱", color: "#d8e0e8" },
      { kind: "corridor", x: 1518, y: 646, w: 520, h: 174, label: "城市心跳室", color: "#ef6a70" },
      { kind: "route", x1: 520, y1: 526, x2: 1298, y2: 196, color: "#72a5ff", label: "记忆链" },
      { kind: "route", x1: 1298, y1: 196, x2: 1698, y2: 790, color: "#ef6a70", label: "心跳链" },
      { kind: "route", x1: 1462, y1: 1038, x2: 1980, y2: 376, color: "#f1c15b", label: "反例链" },
    ],
    zones: [
      {
        id: "scan-lane-a",
        x: 268,
        y: 214,
        w: 742,
        h: 46,
        type: "hazard",
        label: "白箱扫描线",
        color: "#ef6a70",
        damage: 8,
        cooldown: 1.15,
        log: "白箱扫描线扫过，差异值被强制归档。",
      },
      {
        id: "exception-grid",
        x: 492,
        y: 384,
        w: 318,
        h: 154,
        type: "backlash",
        label: "例外网格",
        color: "#72a5ff",
        backlashPerSecond: -5.5,
        slowFactor: 0.92,
      },
      {
        id: "memory-scan-lane",
        x: 1138,
        y: 258,
        w: 590,
        h: 58,
        type: "hazard",
        label: "记忆扫描线",
        color: "#ef6a70",
        damage: 8,
        cooldown: 1.08,
        slowFactor: 0.74,
        log: "白箱记忆扫描线划过，未命名差异被临时冻结。",
      },
      {
        id: "city-heart-field",
        x: 1518,
        y: 646,
        w: 520,
        h: 174,
        type: "backlash",
        label: "城市心跳场",
        color: "#72a5ff",
        backlashPerSecond: -6.4,
        slowFactor: 0.9,
      },
    ],
    obstacles: [
      { kind: "coreBlock", x: 520, y: 118, w: 240, h: 132, label: "零号核心" },
      { kind: "serverCluster", x: 126, y: 170, w: 188, h: 112, label: "证据柜" },
      { kind: "serverCluster", x: 962, y: 172, w: 188, h: 112, label: "归档柜" },
      { kind: "gate", x: 228, y: 464, w: 228, h: 62, label: "保留门" },
      { kind: "gate", x: 824, y: 464, w: 228, h: 62, label: "重写门" },
      { kind: "pillar", x: 606, y: 586, w: 68, h: 68, label: "判定柱" },
      { kind: "coreBlock", x: 1582, y: 598, w: 252, h: 138, label: "城市心跳" },
      { kind: "serverCluster", x: 1168, y: 132, w: 206, h: 112, label: "巡检记忆" },
      { kind: "serverCluster", x: 1888, y: 204, w: 206, h: 112, label: "规则缓存" },
      { kind: "gate", x: 1188, y: 924, w: 246, h: 62, label: "反例门" },
      { kind: "gate", x: 1802, y: 1032, w: 246, h: 62, label: "清零门" },
      { kind: "pillar", x: 2048, y: 706, w: 70, h: 70, label: "校准柱" },
    ],
    props: [
      { kind: "stationSign", x: 744, y: 92, label: "差异保留" },
      { kind: "whiteboard", x: 90, y: 92, w: 190, h: 44 },
      { kind: "scanConsole", x: 352, y: 312, w: 92, h: 72, label: "扫描台" },
      { kind: "evidencePod", x: 846, y: 310, w: 86, h: 84, label: "反例舱" },
      { kind: "archiveTerminal", x: 704, y: 560, w: 88, h: 82, label: "归档端" },
      { kind: "calibrationObelisk", x: 602, y: 286, w: 86, h: 122, label: "校准柱" },
      { kind: "rack", x: 1120, y: 548 },
      { kind: "rack", x: 62, y: 542 },
      { kind: "stationSign", x: 1388, y: 110, label: "巡检记忆" },
      { kind: "stationSign", x: 1818, y: 560, label: "城市心跳" },
      { kind: "scanConsole", x: 1238, y: 452, w: 100, h: 78, label: "记忆台" },
      { kind: "evidencePod", x: 1462, y: 988, w: 92, h: 92, label: "夜市反例" },
      { kind: "archiveTerminal", x: 1972, y: 350, w: 96, h: 88, label: "环线证据" },
      { kind: "calibrationObelisk", x: 1704, y: 842, w: 92, h: 132, label: "主规则" },
      { kind: "rack", x: 2120, y: 938 },
    ],
    decorations: [
      { kind: "scanGrid", x: 240, y: 180, w: 800, h: 392, color: "#ef6a70" },
      { kind: "evidenceLinks", color: "#72a5ff" },
      { kind: "coreConduit", x1: 640, y1: 184, x2: 640, y2: 636, color: "#ef6a70" },
      { kind: "exceptionDots", x: 492, y: 384, w: 318, h: 154, color: "#72a5ff" },
      { kind: "scanGrid", x: 1120, y: 146, w: 962, h: 332, color: "#ef6a70" },
      { kind: "coreConduit", x1: 1298, y1: 196, x2: 1698, y2: 790, color: "#72a5ff" },
      { kind: "coreConduit", x1: 1698, y1: 790, x2: 1980, y2: 376, color: "#ef6a70" },
      { kind: "exceptionDots", x: 1518, y: 646, w: 520, h: 174, color: "#72a5ff" },
    ],
  },
];

const gameData = window.GameData ?? { eventDeck: [], upgrades: [] };
const bugEvents = gameData.eventDeck;
const upgrades = gameData.upgrades;
const chapters = gameData.chapters?.length ? gameData.chapters : [gameData.chapterOne].filter(Boolean);
const weaponDefinitions = gameData.weapons ?? [];
const weaponUpgrades = gameData.weaponUpgrades ?? [];
const chapterRelics = gameData.chapterRelics ?? [];
const enemyTypes = gameData.enemyTypes ?? {};
const openingSprintSteps = [
  {
    id: "first-anomaly",
    title: "处理第一处异常",
    metric: "events",
    target: 1,
    rewardBugPoints: 1,
    rewardXp: 2,
    log: "开场牵引：第一处异常被处理，路线不再只是一团噪声。",
  },
  {
    id: "first-wave",
    title: "打穿第一波追击",
    metric: "defeats",
    target: 6,
    rewardBugPoints: 1,
    rewardHp: 6,
    log: "开场牵引：第一波追击被打穿，补给节奏已经接上。",
  },
  {
    id: "first-build-spark",
    title: "点亮第一种打法",
    metric: "build",
    target: 1,
    rewardBugPoints: 2,
    rewardXp: 4,
    log: "开场牵引完成：武器、目标和补给连成一条可继续推进的路线。",
  },
];
const openingSurgeConfig = {
  id: "delivery-rift",
  label: "快递裂隙",
  spawnDelay: 1.15,
  timeLimit: 28,
  targetDefeats: 4,
  rewardBugPoints: 1,
  rewardHp: 5,
  rewardXp: 4,
  tempoKick: 1,
  ignitionCredit: 1,
  spawnGrace: 0.55,
  firstStrikeBugPoints: 1,
  firstStrikeHp: 2,
  enemyPattern: [
    { type: "deadline", dx: 230, dy: -88, hpMultiplier: 0.5, speedMultiplier: 0.82, scale: 0.84 },
    { type: "stress", dx: 270, dy: 18, hpMultiplier: 0.46, speedMultiplier: 0.82, scale: 0.78, mechanicDepth: 1 },
    { type: "deadline", dx: 228, dy: 104, hpMultiplier: 0.5, speedMultiplier: 0.82, scale: 0.84 },
    { type: "stress", dx: 304, dy: -6, hpMultiplier: 0.42, speedMultiplier: 0.8, scale: 0.72, mechanicDepth: 1 },
  ],
};
const openingRushConfig = {
  windowSeconds: 30,
  milestones: [
    { id: "anomaly", label: "首个异常", score: 28 },
    { id: "surge", label: "裂隙清场", score: 30 },
    { id: "overclock", label: "武器超频", score: 32 },
    { id: "retry-route", label: "推荐路线", score: 10 },
  ],
  grades: [
    { grade: "S", min: 90, title: "S级开场", text: "首个异常、裂隙清场和武器超频在 30 秒内连成了完整爽点。" },
    { grade: "A", min: 75, title: "A级开场", text: "开局节奏已经成立，下一把可以追更短用时和更干净的清场。" },
    { grade: "B", min: 55, title: "B级开场", text: "开场目标已经接上，但裂隙、连段或超频还有一步可以更快。" },
    { grade: "C", min: 28, title: "C级开场", text: "至少处理了第一个关键点，下一把优先把裂隙和超频串起来。" },
    { grade: "D", min: 0, title: "D级开场", text: "开场还没形成连续反馈，下一把跟随推荐路线先拿第一波收益。" },
  ],
};
const chapterShowcaseConfigs = {
  "metro-loop": {
    title: "站台错拍镜头",
    hook: "准点闸门、工单冲刺和管理员二拍落点要能同屏读懂。",
    deviceLabel: "准点闸门",
    mechanicLabel: "冲刺红线",
    bossLabel: "二拍落点",
  },
  "hash-market": {
    title: "哈希盐雨镜头",
    hook: "盐值灯串、队列拖尾和索引锁弱点要形成夜市场面。",
    deviceLabel: "盐值灯串",
    mechanicLabel: "盐雨拖尾",
    bossLabel: "索引锁窗口",
  },
  "promise-tower": {
    title: "承诺塔根层镜头",
    hook: "叶灯中继、承诺护盾和责任锚兑现要成为章节记忆点。",
    deviceLabel: "叶灯中继",
    mechanicLabel: "承诺护盾",
    bossLabel: "责任锚窗口",
  },
  "whitebox-core": {
    title: "白箱核心镜头",
    hook: "差异控制台、点名扫描和申诉窗口要说明最终章玩法。",
    deviceLabel: "差异控制台",
    mechanicLabel: "点名扫描",
    bossLabel: "申诉窗口",
  },
};
const chapterCombatStoreShotConfigs = {
  "chapter-2-combat": {
    chapterIndex: 1,
    enemyType: "deadline",
    weaponIndex: 1,
    enemyOffset: { x: 142, y: -44 },
    bossOffset: { x: 328, y: 74 },
    hazardType: "enemyTrail",
    hazardColor: "#ef6a70",
    objective: "第二章实战镜头：读准闸门节拍，穿过冲刺红线",
    log: "商店截图：准点闸门、冲刺红线、二拍落点和键盘宏弹幕必须同屏可读。",
  },
  "chapter-3-combat": {
    chapterIndex: 2,
    enemyType: "queueSnake",
    weaponIndex: 1,
    enemyOffset: { x: 150, y: 50 },
    bossOffset: { x: 320, y: -88 },
    hazardType: "enemyTrail",
    hazardColor: "#f1c15b",
    objective: "第三章实战镜头：在盐雨拖尾里找索引锁窗口",
    log: "商店截图：盐值灯串、队列拖尾、索引锁弱点和弹幕覆盖展示夜市场景。",
  },
  "chapter-4-combat": {
    chapterIndex: 3,
    enemyType: "promise",
    weaponIndex: 2,
    allies: ["qiao-you"],
    enemyOffset: { x: 132, y: 92 },
    bossOffset: { x: 316, y: 66 },
    hazardType: "enemyTrail",
    hazardColor: "#96e072",
    objective: "第四章实战镜头：用叶灯中继拆开承诺护盾",
    log: "商店截图：叶灯中继、承诺护盾、责任锚窗口和修正液命中展示根层压迫。",
  },
  "chapter-5-combat": {
    chapterIndex: 4,
    enemyType: "inspectionProbe",
    weaponIndex: 0,
    allies: ["qiao-you", "whitebox"],
    enemyOffset: { x: 138, y: -52 },
    bossOffset: { x: 332, y: 76 },
    hazardType: "scanLock",
    hazardColor: "#72a5ff",
    objective: "第五章实战镜头：在点名扫描里提交申诉窗口",
    log: "商店截图：差异控制台、点名扫描、申诉窗口和断点特效说明终局反制方式。",
  },
};
const starterBuilds = [
  {
    id: "precision-breakpoint",
    title: "断点点杀流",
    weaponId: "paperclip",
    chapterIndex: 0,
    promise: "用回形针高速点掉第一批追击怪，适合想看 Boss 弱点窗口的玩家。",
    tags: ["远距", "精英击穿", "低风险"],
    perkText: "开局提示：优先拿伤害、穿透和弹速强化。",
    log: "推荐流派：断点点杀流。保持距离，先打掉最快的异常实体。",
    ignition: {
      targetDefeats: 4,
      timeLimit: 40,
      rewardBugPoints: 2,
      rewardHp: 8,
      rewardXp: 4,
      overclockText: "精准弹加粗：伤害 +5，穿透 +1。",
      overclock: [
        { stat: "damage", add: 5 },
        { stat: "pierce", add: 1, max: 4 },
      ],
      completeLog: "断点点杀流启动：第一批异常被干净点掉，武器开始进入手感区。",
    },
  },
  {
    id: "queue-barrage",
    title: "键盘弹幕流",
    weaponId: "keyboard",
    chapterIndex: 0,
    promise: "三枚按键弹快速铺开安全区，第一波就能看到连段补给亮起来。",
    tags: ["覆盖", "连段", "新手友好"],
    perkText: "开局提示：优先拿冷却、多线程和队列共鸣。",
    log: "推荐流派：键盘弹幕流。把第一波敌人压在屏幕外，尽快点燃战斗节奏。",
    ignition: {
      targetDefeats: 5,
      timeLimit: 42,
      rewardBugPoints: 2,
      rewardHp: 6,
      rewardXp: 5,
      overclockText: "宏队列预热：冷却 -8%，射程 +45。",
      overclock: [
        { stat: "cooldown", multiply: 0.92, min: 0.08 },
        { stat: "range", add: 45 },
      ],
      completeLog: "键盘弹幕流启动：按键弹铺开安全区，连段补给准备接上。",
    },
  },
  {
    id: "close-control",
    title: "修正控场流",
    weaponId: "correction-fluid",
    chapterIndex: 0,
    promise: "近距离高频减速，贴脸怪不再只会吓人，适合喜欢边躲边反打。",
    tags: ["近战", "减速", "容错"],
    perkText: "开局提示：优先拿生命、范围和核心特性过载。",
    log: "推荐流派：修正控场流。贴身绕圈，用减速把压力怪拆开。",
    ignition: {
      targetDefeats: 4,
      timeLimit: 44,
      rewardBugPoints: 3,
      rewardHp: 10,
      rewardXp: 3,
      overclockText: "雾化阀门打开：射程 +55，弹体 +2。",
      overclock: [
        { stat: "range", add: 55 },
        { stat: "bulletSize", add: 2, max: 14 },
      ],
      completeLog: "修正控场流启动：贴脸压力被压慢，下一波可以更大胆地绕。",
    },
  },
];

const weaponOpeningHooks = {
  paperclip: {
    title: "首 30 秒：断点点杀",
    text: "远距点掉裂隙怪，清场后更快触发精准弹超频。",
    tag: "适合想稳扎稳打看弱点窗口",
  },
  keyboard: {
    title: "首 30 秒：弹幕连段",
    text: "三枚按键弹铺安全区，第一波直接点亮连段补给。",
    tag: "适合新手快速看到爽点",
  },
  "correction-fluid": {
    title: "首 30 秒：近身控场",
    text: "高频减速拆开贴脸怪，清裂隙后马上获得容错。",
    tag: "适合边躲边反打",
  },
};
const weaponImpactProfiles = {
  paperclip: {
    id: "paperclip",
    label: "断点",
    chargedLabel: "精准断点",
    textPrefix: "断点",
    cue: "weapon-hit-paperclip",
    color: "#f1c15b",
    chargedColor: "#ffe58a",
    shape: "slash",
    count: 9,
    sizeMin: 2,
    sizeMax: 4,
    speedMin: 80,
    speedMax: 230,
    lengthMin: 10,
    lengthMax: 24,
    lifeMin: 0.18,
    lifeMax: 0.44,
    ring: true,
    shake: 0.018,
  },
  keyboard: {
    id: "keyboard",
    label: "键帽",
    textPrefix: "键帽",
    cue: "weapon-hit-keyboard",
    color: "#72a5ff",
    shape: "keycap",
    count: 8,
    sizeMin: 4,
    sizeMax: 7,
    speedMin: 60,
    speedMax: 170,
    lengthMin: 7,
    lengthMax: 13,
    lifeMin: 0.22,
    lifeMax: 0.5,
    ring: false,
    shake: 0.012,
  },
  "correction-fluid": {
    id: "correction-fluid",
    label: "减速",
    textPrefix: "雾化",
    cue: "weapon-hit-correction",
    color: "#f7b4d8",
    shape: "mist",
    count: 10,
    sizeMin: 5,
    sizeMax: 11,
    speedMin: 36,
    speedMax: 125,
    lengthMin: 8,
    lengthMax: 16,
    lifeMin: 0.28,
    lifeMax: 0.66,
    ring: true,
    shake: 0.006,
  },
  default: {
    id: "default",
    label: "命中",
    textPrefix: "",
    cue: "weapon",
    color: "#f1c15b",
    shape: "square",
    count: 7,
    sizeMin: 2,
    sizeMax: 5,
    speedMin: 45,
    speedMax: 160,
    lengthMin: 8,
    lengthMax: 18,
    lifeMin: 0.22,
    lifeMax: 0.52,
    ring: false,
    shake: 0.008,
  },
};
const bossPhaseTuning = {
  1: {
    desiredDistance: 235,
    speedMultiplier: 1,
    routeLength: 620,
    handshakeTime: 1.05,
    dashDuration: 0.38,
    dashDamage: 28,
    postDashCooldown: 0.72,
    retransmitTimer: 1.22,
    retransmitActiveTime: 0.36,
    retransmitDamage: 16,
    udpCount: 8,
    udpMinSpeed: 170,
    udpMaxSpeed: 235,
    udpDamage: 9,
    udpCooldown: 1.14,
    ftpHp: 260,
    ftpTimer: 4.8,
    ftpBlastDamage: 22,
    dnsCount: 0,
    dnsRadius: 44,
    dnsTimer: 1.35,
    dnsDamage: 15,
  },
  2: {
    desiredDistance: 220,
    speedMultiplier: 1.14,
    routeLength: 700,
    handshakeTime: 0.92,
    dashDuration: 0.3,
    dashDamage: 34,
    postDashCooldown: 0.58,
    retransmitTimer: 1.04,
    retransmitActiveTime: 0.44,
    retransmitDamage: 18,
    udpCount: 14,
    udpMinSpeed: 210,
    udpMaxSpeed: 290,
    udpDamage: 12,
    udpCooldown: 0.95,
    ftpHp: 290,
    ftpTimer: 4.45,
    ftpBlastDamage: 26,
    dnsCount: 0,
    dnsRadius: 44,
    dnsTimer: 1.25,
    dnsDamage: 17,
  },
  3: {
    desiredDistance: 190,
    speedMultiplier: 1.28,
    routeLength: 760,
    handshakeTime: 0.76,
    dashDuration: 0.24,
    dashDamage: 42,
    postDashCooldown: 0.38,
    retransmitTimer: 0.86,
    retransmitActiveTime: 0.52,
    retransmitDamage: 22,
    udpCount: 22,
    udpMinSpeed: 230,
    udpMaxSpeed: 345,
    udpDamage: 15,
    udpCooldown: 0.72,
    ftpHp: 340,
    ftpTimer: 4.05,
    ftpBlastDamage: 30,
    dnsCount: 7,
    dnsRadius: 48,
    dnsTimer: 1.05,
    dnsDamage: 22,
  },
};
const assetSources = {
  andu: "src/assets/characters/andu-sprite.png",
  qiaoYou: "src/assets/characters/qiao-you-sprite.png",
  laoLiang: "src/assets/characters/lao-liang-sprite.png",
  inspector: "src/assets/characters/whitebox-inspector-sprite.png",
  weaponPaperclip: "src/assets/weapons/paperclip-slingshot-v2.png",
  weaponKeyboard: "src/assets/weapons/keyboard-macro-missile-v2.png",
  weaponCorrectionFluid: "src/assets/weapons/correction-fluid-sprayer-v2.png",
  projectilePaperclip: "src/assets/projectiles/paperclip-projectile-v2.png",
  projectileKeycap: "src/assets/projectiles/keycap-projectile-v2.png",
  projectileCorrectionMist: "src/assets/projectiles/correction-fluid-mist-v2.png",
  repairPulse: "src/assets/effects/repair-pulse-ring-v2.png",
  bossDeliveryPhase1: "src/assets/bosses/delivery-rider-boss-phase1-v2.png",
  bossDeliveryPhase2: "src/assets/bosses/delivery-rider-boss-phase2-v2.png",
  bossDeliveryPhase3: "src/assets/bosses/delivery-rider-boss-phase3-v2.png",
  bossTcpRoute: "src/assets/effects/boss-tcp-handshake-route-v2.png",
  bossUdpPackage: "src/assets/effects/boss-udp-delivery-package-v2.png",
  bossFtpPackage: "src/assets/effects/boss-ftp-transfer-package-v2.png",
  bossDnsMarker: "src/assets/effects/boss-dns-error-marker-v2.png",
  bossTimeoutRoute: "src/assets/effects/boss-timeout-retransmit-route-v2.png",
  bossOrderAura: "src/assets/effects/boss-order-overload-aura-v2.png",
  enemyStressFluff: "src/assets/enemies/stress-fluff-v2.png",
  enemyWorkOrderBug: "src/assets/enemies/work-order-bug-v2.png",
  enemyInspectionProbe: "src/assets/enemies/inspection-probe-v2.png",
  enemyCleanerSentinel: "src/assets/enemies/cleaner-sentinel-v2.png",
  enemyPromiseBall: "src/assets/enemies/promise-ball-v2.png",
  enemyQueueSnake: "src/assets/enemies/queue-snake-v2.png",
  enemyStackPile: "src/assets/enemies/stack-pile-monster-v2.png",
  enemyFloatErrorBubble: "src/assets/enemies/floating-point-error-bubble-v2.png",
  bugPoint: "src/assets/items/bug-point-v2.png",
  breakpointBadge: "src/assets/items/breakpoint-badge-v2.png",
  sceneKeyArt: "src/assets/scenes/variable-city-key-art.png",
  variableBlessingCard: "src/assets/ui/variable-blessing-card.png",
  metaSteadyHeart: "src/assets/ui/meta-steady-heart-v1.png",
  metaWarmCache: "src/assets/ui/meta-warm-cache-v1.png",
  metaRouteShoes: "src/assets/ui/meta-route-shoes-v1.png",
  metaChapterInsurance: "src/assets/ui/meta-chapter-insurance-v1.png",
  metaPaperclipSpecialist: "src/assets/ui/meta-paperclip-specialist-v1.png",
  metaKeyboardSpecialist: "src/assets/ui/meta-keyboard-specialist-v1.png",
  metaCorrectionSpecialist: "src/assets/ui/meta-correction-specialist-v1.png",
  abilityIntegerPrecision: "src/assets/abilities/integer-precision-v2.png",
  abilityFloatingPointError: "src/assets/abilities/floating-point-error-v2.png",
  abilityArrayBarrage: "src/assets/abilities/array-barrage-v2.png",
  abilityQueueProcessing: "src/assets/abilities/queue-processing-v2.png",
  abilityStackRebound: "src/assets/abilities/stack-rebound-v2.png",
  abilityHashLock: "src/assets/abilities/hash-lock-v2.png",
  propWorkstationA: "src/assets/props/workstation-a-v2.png",
  propWorkstationB: "src/assets/props/workstation-b-v2.png",
  propWorkstationC: "src/assets/props/workstation-c-v2.png",
  propWorkstationD: "src/assets/props/workstation-d-v2.png",
  propWorkstationE: "src/assets/props/workstation-e-v2.png",
  propWorkstationF: "src/assets/props/workstation-f-v2.png",
  propSingleDesk: "src/assets/props/single-desk-v2.png",
  propDeskChair: "src/assets/props/desk-chair-v2.png",
  propOfficeChair: "src/assets/props/visitor-stool-v2.png",
  propMeetingBench: "src/assets/props/meeting-bench-v2.png",
  propFileCabinet: "src/assets/props/file-cabinet.png",
  propPrinter: "src/assets/props/printer.png",
  propCopier: "src/assets/props/copier.png",
  propWaterCooler: "src/assets/props/water-cooler.png",
  propWaterCoolerPortal: "src/assets/props/water-cooler-portal.png",
  propPlantTall: "src/assets/props/plant-tall.png",
  propPlantRound: "src/assets/props/plant-round.png",
  propPlantLeafy: "src/assets/props/plant-leafy.png",
  propPlantSmall: "src/assets/props/plant-small.png",
  propServerRoomDoor: "src/assets/props/server-room-door.png",
  propServerRack: "src/assets/props/server-rack.png",
  propWhiteboard: "src/assets/props/whiteboard.png",
  propWindowRow: "src/assets/props/window-row.png",
  propPlanterBox: "src/assets/props/planter-box.png",
  propPartitionWide: "src/assets/props/partition-wide.png",
  propPartitionLeft: "src/assets/props/partition-left.png",
  propPartitionRight: "src/assets/props/partition-right.png",
  propMeetingTable: "src/assets/props/meeting-table-v2.png",
  chapterBadgeMetroLoop: "src/assets/maps/chapter-badge-metro-loop-v1.png",
  chapterBadgeHashMarket: "src/assets/maps/chapter-badge-hash-market-v1.png",
  chapterBadgePromiseTower: "src/assets/maps/chapter-badge-promise-tower-v1.png",
  chapterBadgeWhiteboxCore: "src/assets/maps/chapter-badge-whitebox-core-v1.png",
};
const storyAvatarSources = {
  安渡: "src/assets/characters/andu-avatar.png",
  乔柚: "src/assets/characters/qiao-you-avatar.png",
  老梁: "src/assets/characters/lao-liang-avatar.png",
  白箱巡检员: "src/assets/characters/whitebox-inspector-avatar.png",
  周行: "src/assets/bosses/delivery-rider-boss-portrait-v2.png",
  andu: "src/assets/characters/andu-avatar.png",
  qiaoYou: "src/assets/characters/qiao-you-avatar.png",
  laoLiang: "src/assets/characters/lao-liang-avatar.png",
  inspector: "src/assets/characters/whitebox-inspector-avatar.png",
  deliveryRider: "src/assets/bosses/delivery-rider-boss-portrait-v2.png",
};
const assets = loadGameAssets(assetSources);

function loadGameAssets(sources) {
  const loaded = {};
  for (const [key, src] of Object.entries(sources)) {
    const image = new Image();
    image.onload = () => {
      loaded[key].ready = true;
    };
    image.onerror = () => {
      loaded[key].ready = false;
    };
    loaded[key] = { image, ready: false };
    image.src = encodeURI(src);
  }
  return loaded;
}

function assetUrl(key) {
  const src = assetSources[key];
  return src ? encodeURI(src) : "";
}

function readPlatformJson(key, fallback = null) {
  return platform.storage?.readJson?.(key, fallback) ?? fallback;
}

function writePlatformJson(key, value) {
  return platform.storage?.writeJson?.(key, value) ?? false;
}

function removePlatformJson(key) {
  platform.storage?.remove?.(key);
}

function readUnlockedAchievements() {
  const unlocked = readPlatformJson(ACHIEVEMENT_STORAGE_KEY, []);
  return Array.isArray(unlocked) ? unlocked : [];
}

function achievementById(id) {
  return achievements.find((achievement) => achievement.id === id);
}

function unlockLocalAchievement(id) {
  const achievement = achievementById(id);
  if (!achievement) {
    return false;
  }
  const unlocked = platform.unlockAchievement?.(achievement.steamApiName ?? achievement.id);
  if (unlocked) {
    setLog(`成就解锁：${achievement.title}。`);
    playAudioCue("upgrade-select");
    return true;
  }
  return false;
}

function evaluateRunAchievements(eventName = "manual") {
  if (!runStats) {
    return;
  }
  if (eventName === "run_start") {
    unlockLocalAchievement("ACH_FIRST_SHIFT");
  }
  if ((runStats.eventsResolved ?? 0) >= 1) {
    unlockLocalAchievement("ACH_FIRST_FIX");
  }
  if ((runStats.enemiesDefeated ?? 0) >= 10) {
    unlockLocalAchievement("ACH_TEN_CLEANUPS");
  }
  if ((runStats.bossesDefeated ?? 0) >= 1) {
    unlockLocalAchievement("ACH_FIRST_BOSS");
  }
  if ((runStats.chaptersCleared ?? 0) >= 3) {
    unlockLocalAchievement("ACH_THREE_CHAPTERS");
  }
  if ((runStats.synergiesUnlocked?.length ?? 0) >= 1) {
    unlockLocalAchievement("ACH_RESONANCE");
  }
}

function createAudioSystem() {
  return window.createVariableCityAudio?.({ getSettings: () => gameSettings }) ?? null;
}

function unlockAudioContext() {
  audioSystem?.unlock?.();
}

function syncAudioSettings() {
  audioSystem?.syncSettings?.();
}

function playAudioCue(cue, options = {}) {
  audioSystem?.playCue?.(cue, options);
}

function describePlatformStorage() {
  try {
    return platform.storage?.describe?.() ?? null;
  } catch {
    return null;
  }
}

function getPlatformDisplayLabel() {
  if (platform.isDesktop) {
    return platform.label ?? "Desktop";
  }
  return platform.label ?? platform.id ?? "Web";
}

function getStorageDisplayLabel() {
  const info = describePlatformStorage();
  if (info?.mode === "file") {
    return info.cloudPattern ? "JSON 云存档" : "JSON 文件";
  }
  if (info?.mode === "browser") {
    return "浏览器存档";
  }
  return "本地存档";
}

async function applyStartupFullscreenPreference() {
  if (!gameSettings?.fullscreenOnStart || !platform.isDesktop || platform.isFullscreen?.()) {
    return;
  }

  try {
    const enteredFullscreen = await platform.requestFullscreen?.(document.documentElement);
    if (enteredFullscreen) {
      syncSystemControls();
    }
  } catch {
    syncSystemControls();
  }
}

function createDefaultSettings() {
  return {
    screenShake: true,
    gamepadEnabled: true,
    showInputHints: true,
    fullscreenOnStart: false,
    audioMuted: false,
    masterVolume: 0.62,
    controllerDeadzone: 0.24,
  };
}

function loadGameSettings() {
  const saved = readPlatformJson(SETTINGS_STORAGE_KEY, {});
  const settings = {
    ...createDefaultSettings(),
    ...(saved && typeof saved === "object" ? saved : {}),
  };
  settings.masterVolume = clamp(Number(settings.masterVolume ?? 0.62), 0, 1);
  settings.audioMuted = Boolean(settings.audioMuted);
  return settings;
}

function saveGameSettings() {
  if (isStoreShotMode) {
    syncAudioSettings();
    renderSettingsControls();
    syncSystemControls();
    return;
  }
  writePlatformJson(SETTINGS_STORAGE_KEY, gameSettings);
  syncAudioSettings();
  renderSettingsControls();
  syncSystemControls();
}

function createGamepadState() {
  return {
    active: false,
    moveX: 0,
    moveY: 0,
    buttons: new Set(),
    justPressed: new Set(),
    name: "",
  };
}

function currentChapter() {
  return chapters[currentChapterIndex] ?? chapters[0] ?? { title: "变量城夜巡", steps: [], totalObjectives: 1 };
}

function currentMap() {
  return chapterMaps[currentChapterIndex] ?? chapterMaps[0];
}

function syncWorldToCurrentMap() {
  const map = currentMap();
  world.viewWidth = canvas.width;
  world.viewHeight = canvas.height;
  world.width = Math.max(world.viewWidth, map.width ?? 1280);
  world.height = Math.max(world.viewHeight, map.height ?? 720);
  world.cameraX = clamp(world.cameraX ?? 0, 0, Math.max(0, world.width - world.viewWidth));
  world.cameraY = clamp(world.cameraY ?? 0, 0, Math.max(0, world.height - world.viewHeight));
}

function getMapObstacles() {
  return (currentMap().obstacles ?? desks).filter((object) => object.solid !== false);
}

function getMapZones() {
  return currentMap().zones ?? [];
}

function positionPlayerAtMapStart() {
  syncWorldToCurrentMap();
  const start = currentMap().start ?? { x: 170, y: 560 };
  const safeStart = findNearestFreePoint(start.x, start.y, player?.radius ?? playerBase.radius);
  player.x = safeStart.x;
  player.y = safeStart.y;
  centerCameraOnPlayer();
}

function createRunStats() {
  return {
    startedAt: Date.now(),
    chaptersCleared: 0,
    eventsResolved: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    upgradesChosen: [],
    relicsChosen: [],
    conceptsChosen: [],
    synergiesUnlocked: [],
    damageTaken: 0,
    distanceTraveled: 0,
    activeHook: null,
    mapInteractivesActivated: [],
    deviceGuide: null,
    retryBoost: null,
    retryPlan: null,
    openingRush: createOpeningRushState(),
    openingShowcase: null,
    chapterShowcase: null,
    fairWarning: createFairWarningState(),
    tempo: createCombatTempoState(),
    openingSprint: null,
    starterBuild: null,
    starterIgnition: null,
    highestLevel: 1,
    bestChapterReached: 0,
  };
}

function createArchiveFallback() {
  return {
    archiveVersion: ARCHIVE_VERSION,
    bestChapter: 1,
    wins: 0,
    runs: 0,
    totalEnemiesDefeated: 0,
    totalEventsResolved: 0,
    unlockedChapters: [0],
    lastBuild: "未记录",
    calibrationShards: 0,
    totalCalibrationEarned: 0,
    completedNightHooks: [],
    nightHookCompletions: 0,
    bestTempoStreak: 0,
    bestOpeningRushScore: 0,
    bestOpeningRushGrade: "D",
    bestOpeningRushAt: null,
    lastOpeningRush: null,
    discoveredEchoes: [],
    completedEchoChapters: [],
    lastEchoDiscovery: null,
    discoveredMapCaches: [],
    completedMapCacheChapters: [],
    lastMapCacheDiscovery: null,
    activatedMapInteractives: [],
    completedMapInteractiveChapters: [],
    lastMapInteractiveDiscovery: null,
    metaUpgrades: Object.fromEntries(metaProgressNodes.map((node) => [node.id, 0])),
    lastRunShardGain: null,
    lastRunReview: null,
  };
}

function getAllDiscoveryEchoes() {
  return chapterMaps.flatMap((map, chapterIndex) => getMapEchoes(map).map((echo) => ({
    ...echo,
    chapterIndex,
    chapterId: map.id,
    chapterTitle: chapters[chapterIndex]?.title ?? map.name ?? `第 ${chapterIndex + 1} 章`,
  })));
}

function normalizeEchoIds(savedEchoIds = []) {
  const validEchoIds = new Set(getAllDiscoveryEchoes().map((echo) => echo.id));
  return [...new Set(Array.isArray(savedEchoIds) ? savedEchoIds : [])]
    .filter((id) => typeof id === "string" && validEchoIds.has(id));
}

function normalizeEchoChapterIds(savedChapterIds = []) {
  const validChapterIds = new Set(chapterMaps.map((map) => map.id).filter(Boolean));
  return [...new Set(Array.isArray(savedChapterIds) ? savedChapterIds : [])]
    .filter((id) => typeof id === "string" && validChapterIds.has(id));
}

function normalizeLastEchoDiscovery(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  return {
    id: typeof value.id === "string" ? value.id : "",
    label: typeof value.label === "string" ? value.label : "地图回声",
    chapterId: typeof value.chapterId === "string" ? value.chapterId : "",
    chapterTitle: typeof value.chapterTitle === "string" ? value.chapterTitle : "未知章节",
    completedChapter: Boolean(value.completedChapter),
    shardReward: Math.max(0, Math.trunc(Number(value.shardReward) || 0)),
    at: Number(value.at) || Date.now(),
  };
}

function getAllMapCaches() {
  return chapterMaps.flatMap((map, chapterIndex) => getMapCaches(map).map((cache) => ({
    ...cache,
    chapterIndex,
    chapterId: map.id,
    chapterTitle: chapters[chapterIndex]?.title ?? map.name ?? `第 ${chapterIndex + 1} 章`,
  })));
}

function normalizeMapCacheIds(savedCacheIds = []) {
  const validCacheIds = new Set(getAllMapCaches().map((cache) => cache.id));
  return [...new Set(Array.isArray(savedCacheIds) ? savedCacheIds : [])]
    .filter((id) => typeof id === "string" && validCacheIds.has(id));
}

function normalizeMapCacheChapterIds(savedChapterIds = []) {
  const validChapterIds = new Set(chapterMaps
    .filter((map) => getMapCaches(map).length > 0)
    .map((map) => map.id)
    .filter(Boolean));
  return [...new Set(Array.isArray(savedChapterIds) ? savedChapterIds : [])]
    .filter((id) => typeof id === "string" && validChapterIds.has(id));
}

function normalizeLastMapCacheDiscovery(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  return {
    id: typeof value.id === "string" ? value.id : "",
    label: typeof value.label === "string" ? value.label : "地标补给",
    chapterId: typeof value.chapterId === "string" ? value.chapterId : "",
    chapterTitle: typeof value.chapterTitle === "string" ? value.chapterTitle : "未知章节",
    completedChapter: Boolean(value.completedChapter),
    shardReward: Math.max(0, Math.trunc(Number(value.shardReward) || 0)),
    at: Number(value.at) || Date.now(),
  };
}

function getAllMapInteractives() {
  return chapterMaps.flatMap((map, chapterIndex) => getMapInteractives(map).map((device) => ({
    ...device,
    chapterIndex,
    chapterId: map.id,
    chapterTitle: chapters[chapterIndex]?.title ?? map.name ?? `第 ${chapterIndex + 1} 章`,
  })));
}

function normalizeMapInteractiveIds(savedDeviceIds = []) {
  const validDeviceIds = new Set(getAllMapInteractives().map((device) => device.id));
  return [...new Set(Array.isArray(savedDeviceIds) ? savedDeviceIds : [])]
    .filter((id) => typeof id === "string" && validDeviceIds.has(id));
}

function normalizeMapInteractiveChapterIds(savedChapterIds = []) {
  const validChapterIds = new Set(chapterMaps
    .filter((map) => getMapInteractives(map).length > 0)
    .map((map) => map.id)
    .filter(Boolean));
  return [...new Set(Array.isArray(savedChapterIds) ? savedChapterIds : [])]
    .filter((id) => typeof id === "string" && validChapterIds.has(id));
}

function normalizeLastMapInteractiveDiscovery(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  return {
    id: typeof value.id === "string" ? value.id : "",
    label: typeof value.label === "string" ? value.label : "互动装置",
    chapterId: typeof value.chapterId === "string" ? value.chapterId : "",
    chapterTitle: typeof value.chapterTitle === "string" ? value.chapterTitle : "未知章节",
    completedChapter: Boolean(value.completedChapter),
    shardReward: Math.max(0, Math.trunc(Number(value.shardReward) || 0)),
    at: Number(value.at) || Date.now(),
  };
}

function normalizeMetaUpgrades(savedUpgrades = {}) {
  const normalized = {};
  for (const node of metaProgressNodes) {
    const raw = Number(savedUpgrades?.[node.id] ?? 0);
    normalized[node.id] = clamp(Math.trunc(Number.isFinite(raw) ? raw : 0), 0, node.maxLevel);
  }
  return normalized;
}

function normalizeLastRunShardGain(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  return {
    amount: Math.max(0, Math.trunc(Number(value.amount) || 0)),
    reason: typeof value.reason === "string" ? value.reason : "夜巡结算",
    at: Number(value.at) || Date.now(),
  };
}

function normalizeRetryBoost(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const normalized = {
    id: typeof value.id === "string" && value.id ? value.id : "review-retry-boost",
    title: typeof value.title === "string" ? value.title : "复盘助推",
    summary: typeof value.summary === "string" ? value.summary : "下一把开局获得一点额外容错。",
    log: typeof value.log === "string" ? value.log : "复盘助推已生效。",
    bonusBugPoints: clamp(Math.trunc(Number(value.bonusBugPoints) || 0), 0, 4),
    bonusHp: clamp(Math.trunc(Number(value.bonusHp) || 0), 0, 18),
    openingTargetBonusBugPoints: clamp(Math.trunc(Number(value.openingTargetBonusBugPoints) || 0), 0, 2),
    applied: Boolean(value.applied),
    appliedAt: Number(value.appliedAt) || null,
  };
  if (
    normalized.bonusBugPoints <= 0
    && normalized.bonusHp <= 0
    && normalized.openingTargetBonusBugPoints <= 0
  ) {
    return null;
  }
  return normalized;
}

function normalizeRetryPlan(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const build = getStarterBuildById(value.starterBuildId) ?? starterBuilds[0] ?? null;
  if (!build) {
    return null;
  }
  return {
    id: typeof value.id === "string" && value.id ? value.id : `${build.id}-retry-plan`,
    starterBuildId: build.id,
    title: typeof value.title === "string" ? value.title : "下一局 30 秒路线",
    promise: typeof value.promise === "string" ? value.promise : "按推荐流派重开，先拿到第一处异常和第一波补给。",
    firstGoal: typeof value.firstGoal === "string" ? value.firstGoal : "处理首个异常 -> 清掉第一波追击 -> 点亮流派超频",
    rewardText: typeof value.rewardText === "string" ? value.rewardText : "开局资源、复盘加成和武器超频会合并成第一波收益。",
    screenshotFocus: typeof value.screenshotFocus === "string" ? value.screenshotFocus : "第一波追击、武器命中特效和 HUD 目标同时入镜。",
    log: typeof value.log === "string" ? value.log : "复盘路线已带入：先按 30 秒路线打出第一波收益。",
    openingSurgeDelayMultiplier: clamp(Number(value.openingSurgeDelayMultiplier) || 1, 0.45, 1),
    starterIgnitionCredit: clamp(Math.trunc(Number(value.starterIgnitionCredit) || 0), 0, 2),
    applied: Boolean(value.applied),
    appliedAt: Number(value.appliedAt) || null,
  };
}

function normalizeFairDamageCue(value = null) {
  if (!value || typeof value !== "object") {
    return null;
  }
  return {
    label: typeof value.label === "string" ? value.label : "伤害来源",
    message: typeof value.message === "string" ? value.message : "未知伤害",
    amount: Math.max(0, Math.round(Number(value.amount) || 0)),
    hpBefore: Math.max(0, Math.round(Number(value.hpBefore) || 0)),
    hpAfter: Math.round(Number(value.hpAfter) || 0),
    level: ["low", "critical", "lethal"].includes(value.level) ? value.level : "hit",
    hint: typeof value.hint === "string" ? value.hint : "",
    invulnerable: Math.max(0, Number(value.invulnerable) || 0),
    at: Number(value.at) || Date.now(),
  };
}

function normalizeFailureReplay(value = null) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const lethalHit = normalizeFairDamageCue(value.lethalHit);
  const lastCue = normalizeFairDamageCue(value.lastCue);
  return {
    title: typeof value.title === "string" ? value.title : "失败回放",
    summary: typeof value.summary === "string" ? value.summary : "最后一次失误已经记录。",
    counter: typeof value.counter === "string" ? value.counter : "下一把按推荐路线重开，先拿容错再清第一波。",
    lethalHit,
    lastCue,
    warningCount: Math.max(0, Math.trunc(Number(value.warningCount) || 0)),
    safetyWindowCount: Math.max(0, Math.trunc(Number(value.safetyWindowCount) || 0)),
  };
}

function normalizeLastRunReview(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const build = getStarterBuildById(value.recommendedStarterBuildId) ?? starterBuilds[0] ?? null;
  return {
    outcome: value.outcome === "victory" ? "victory" : "defeat",
    chapterTitle: typeof value.chapterTitle === "string" ? value.chapterTitle : "未知章节",
    highlightTitle: typeof value.highlightTitle === "string" ? value.highlightTitle : "本局亮点",
    highlightText: typeof value.highlightText === "string" ? value.highlightText : "已经推进了一段路线。",
    pressureTitle: typeof value.pressureTitle === "string" ? value.pressureTitle : "下次注意",
    pressureText: typeof value.pressureText === "string" ? value.pressureText : "保持移动，先追最近的目标信标。",
    nextTitle: typeof value.nextTitle === "string" ? value.nextTitle : "下一把建议",
    nextText: typeof value.nextText === "string" ? value.nextText : "用推荐流派更快进入第一波爽点。",
    recommendedStarterBuildId: build?.id ?? null,
    retryBoost: normalizeRetryBoost(value.retryBoost),
    retryPlan: normalizeRetryPlan(value.retryPlan),
    failureReplay: normalizeFailureReplay(value.failureReplay),
    openingRush: normalizeOpeningRushArchive(value.openingRush),
    at: Number(value.at) || Date.now(),
  };
}

function createFairWarningState() {
  return {
    lowHpWarned: false,
    criticalHpWarned: false,
    warningCount: 0,
    lastWarningAt: 0,
    safetyWindowCount: 0,
    lastHit: null,
    lastCue: null,
    lethalHit: null,
  };
}

function normalizeFairWarningState(value = {}) {
  return {
    ...createFairWarningState(),
    lowHpWarned: Boolean(value?.lowHpWarned),
    criticalHpWarned: Boolean(value?.criticalHpWarned),
    warningCount: Math.max(0, Math.trunc(Number(value?.warningCount) || 0)),
    lastWarningAt: Number(value?.lastWarningAt) || 0,
    safetyWindowCount: Math.max(0, Math.trunc(Number(value?.safetyWindowCount) || 0)),
    lastHit: normalizeFairDamageCue(value?.lastHit),
    lastCue: normalizeFairDamageCue(value?.lastCue),
    lethalHit: normalizeFairDamageCue(value?.lethalHit),
  };
}

function loadArchive() {
  const fallback = createArchiveFallback();
  try {
    const saved = readPlatformJson(ARCHIVE_STORAGE_KEY, null);
    if (!saved || typeof saved !== "object") {
      return fallback;
    }
    const normalized = {
      ...fallback,
      ...saved,
      unlockedChapters: Array.isArray(saved.unlockedChapters) ? saved.unlockedChapters : fallback.unlockedChapters,
      metaUpgrades: normalizeMetaUpgrades(saved.metaUpgrades),
      lastRunShardGain: normalizeLastRunShardGain(saved.lastRunShardGain),
      lastRunReview: normalizeLastRunReview(saved.lastRunReview),
      completedNightHooks: Array.isArray(saved.completedNightHooks) ? [...new Set(saved.completedNightHooks)] : fallback.completedNightHooks,
      discoveredEchoes: normalizeEchoIds(saved.discoveredEchoes),
      completedEchoChapters: normalizeEchoChapterIds(saved.completedEchoChapters),
      lastEchoDiscovery: normalizeLastEchoDiscovery(saved.lastEchoDiscovery),
      discoveredMapCaches: normalizeMapCacheIds(saved.discoveredMapCaches),
      completedMapCacheChapters: normalizeMapCacheChapterIds(saved.completedMapCacheChapters),
      lastMapCacheDiscovery: normalizeLastMapCacheDiscovery(saved.lastMapCacheDiscovery),
      activatedMapInteractives: normalizeMapInteractiveIds(saved.activatedMapInteractives),
      completedMapInteractiveChapters: normalizeMapInteractiveChapterIds(saved.completedMapInteractiveChapters),
      lastMapInteractiveDiscovery: normalizeLastMapInteractiveDiscovery(saved.lastMapInteractiveDiscovery),
      lastOpeningRush: normalizeOpeningRushArchive(saved.lastOpeningRush),
    };
    normalized.archiveVersion = ARCHIVE_VERSION;
    normalized.bestChapter = clamp(Number(normalized.bestChapter) || 1, 1, chapters.length);
    normalized.calibrationShards = Math.max(0, Math.trunc(Number(normalized.calibrationShards) || 0));
    normalized.totalCalibrationEarned = Math.max(
      normalized.calibrationShards,
      Math.trunc(Number(normalized.totalCalibrationEarned) || 0),
    );
    normalized.nightHookCompletions = Math.max(
      normalized.completedNightHooks.length,
      Math.trunc(Number(normalized.nightHookCompletions) || 0),
    );
    normalized.bestTempoStreak = Math.max(0, Math.trunc(Number(normalized.bestTempoStreak) || 0));
    normalized.bestOpeningRushScore = clamp(Math.trunc(Number(normalized.bestOpeningRushScore) || 0), 0, 100);
    normalized.bestOpeningRushGrade = ["S", "A", "B", "C", "D"].includes(normalized.bestOpeningRushGrade)
      ? normalized.bestOpeningRushGrade
      : getOpeningRushGrade(normalized.bestOpeningRushScore).grade;
    normalized.bestOpeningRushAt = Number(normalized.bestOpeningRushAt) || null;
    if (!normalized.unlockedChapters.includes(0)) {
      normalized.unlockedChapters.unshift(0);
    }
    return normalized;
  } catch {
    return fallback;
  }
}

function saveArchive() {
  if (isStoreShotMode) {
    return;
  }
  try {
    writePlatformJson(ARCHIVE_STORAGE_KEY, archiveState);
  } catch {
    // Local storage can be unavailable in some embedded previews.
  }
}

function getMetaLevel(id) {
  return clamp(Math.trunc(Number(archiveState?.metaUpgrades?.[id]) || 0), 0, metaProgressNodes.find((node) => node.id === id)?.maxLevel ?? 0);
}

function getMetaNodeCost(node) {
  const level = getMetaLevel(node.id);
  return level >= node.maxLevel ? null : node.costs[level] ?? node.costs.at(-1) ?? 0;
}

function getMetaRequirementText(node) {
  const requiredChapter = node.requirement?.bestChapter;
  if (!requiredChapter || (archiveState?.bestChapter ?? 1) >= requiredChapter) {
    return "";
  }
  return `最远到达第 ${requiredChapter} 章后解锁`;
}

function buyMetaUpgrade(id) {
  const node = metaProgressNodes.find((candidate) => candidate.id === id);
  if (!node) {
    return false;
  }
  const lockedText = getMetaRequirementText(node);
  if (lockedText) {
    setLog(`${node.title} 尚未解锁：${lockedText}。`);
    return false;
  }
  const level = getMetaLevel(node.id);
  const cost = getMetaNodeCost(node);
  if (level >= node.maxLevel || cost === null) {
    setLog(`${node.title} 已达到上限。`);
    return false;
  }
  if ((archiveState.calibrationShards ?? 0) < cost) {
    setLog(`校准碎片不足：${node.title} 需要 ${cost}。`);
    return false;
  }

  archiveState.calibrationShards -= cost;
  archiveState.metaUpgrades[node.id] = level + 1;
  saveArchive();
  metaUnlockPulseNodeId = node.id;
  playAudioCue("upgrade-select");
  setLog(`档案校准完成：${node.title} Lv.${level + 1}/${node.maxLevel}。`);
  renderStartMenu();
  syncHud();
  return true;
}

function calculateRunShardReward(victory) {
  const chaptersCleared = runStats?.chaptersCleared ?? 0;
  const bossesDefeated = runStats?.bossesDefeated ?? 0;
  const eventsResolved = runStats?.eventsResolved ?? 0;
  const enemiesDefeated = runStats?.enemiesDefeated ?? 0;
  const depthBonus = Math.max(0, currentChapterIndex - chaptersCleared) * 2;
  const raw = 4
    + chaptersCleared * 7
    + bossesDefeated * 5
    + Math.floor(eventsResolved / 2)
    + Math.floor(enemiesDefeated / 22)
    + depthBonus
    + (victory ? 18 : 0);
  return clamp(raw, 4, 72);
}

function grantCalibrationShards(amount, reason) {
  const reward = Math.max(0, Math.trunc(Number(amount) || 0));
  archiveState.calibrationShards = Math.max(0, (archiveState.calibrationShards ?? 0) + reward);
  archiveState.totalCalibrationEarned = Math.max(archiveState.totalCalibrationEarned ?? 0, 0) + reward;
  archiveState.lastRunShardGain = {
    amount: reward,
    reason,
    at: Date.now(),
  };
  return reward;
}

function getEchoChapterReward(chapterIndex = currentChapterIndex) {
  return 2 + Math.max(0, Math.trunc(Number(chapterIndex) || 0));
}

function getMapCacheChapterReward(chapterIndex = currentChapterIndex) {
  return 1 + Math.max(0, Math.trunc(Number(chapterIndex) || 0));
}

function getMapInteractiveChapterReward(chapterIndex = currentChapterIndex) {
  return 1 + Math.max(0, Math.trunc(Number(chapterIndex) || 0));
}

function getEchoArchiveSummary(archive = archiveState) {
  const discovered = new Set(normalizeEchoIds(archive?.discoveredEchoes));
  const completedChapters = new Set(normalizeEchoChapterIds(archive?.completedEchoChapters));
  const chaptersSummary = chapterMaps.map((map, chapterIndex) => {
    const echoes = getMapEchoes(map);
    const discoveredInChapter = echoes.filter((echo) => discovered.has(echo.id));
    return {
      chapterIndex,
      chapterId: map.id,
      title: chapters[chapterIndex]?.title ?? map.name ?? `第 ${chapterIndex + 1} 章`,
      discovered: discoveredInChapter.length,
      total: echoes.length,
      complete: echoes.length > 0 && discoveredInChapter.length === echoes.length,
      rewardClaimed: completedChapters.has(map.id),
      echoes: echoes.map((echo) => ({
        id: echo.id,
        label: echo.label ?? "地图回声",
        discovered: discovered.has(echo.id),
      })),
    };
  });
  return {
    discovered: discovered.size,
    total: getAllDiscoveryEchoes().length,
    completedChapters: completedChapters.size,
    chapterCount: chaptersSummary.length,
    chapters: chaptersSummary,
    last: normalizeLastEchoDiscovery(archive?.lastEchoDiscovery),
  };
}

function getMapCacheArchiveSummary(archive = archiveState) {
  const discovered = new Set(normalizeMapCacheIds(archive?.discoveredMapCaches));
  const completedChapters = new Set(normalizeMapCacheChapterIds(archive?.completedMapCacheChapters));
  const chaptersSummary = chapterMaps.map((map, chapterIndex) => {
    const caches = getMapCaches(map);
    const discoveredInChapter = caches.filter((cache) => discovered.has(cache.id));
    return {
      chapterIndex,
      chapterId: map.id,
      title: chapters[chapterIndex]?.title ?? map.name ?? `第 ${chapterIndex + 1} 章`,
      discovered: discoveredInChapter.length,
      total: caches.length,
      complete: caches.length > 0 && discoveredInChapter.length === caches.length,
      rewardClaimed: completedChapters.has(map.id),
      caches: caches.map((cache) => ({
        id: cache.id,
        label: cache.label ?? "地标补给",
        discovered: discovered.has(cache.id),
      })),
    };
  });
  return {
    discovered: discovered.size,
    total: getAllMapCaches().length,
    completedChapters: completedChapters.size,
    chapterCount: chaptersSummary.length,
    chapters: chaptersSummary,
    last: normalizeLastMapCacheDiscovery(archive?.lastMapCacheDiscovery),
  };
}

function getMapInteractiveArchiveSummary(archive = archiveState) {
  const activated = new Set(normalizeMapInteractiveIds(archive?.activatedMapInteractives));
  const completedChapters = new Set(normalizeMapInteractiveChapterIds(archive?.completedMapInteractiveChapters));
  const chaptersSummary = chapterMaps.map((map, chapterIndex) => {
    const devices = getMapInteractives(map);
    const activatedInChapter = devices.filter((device) => activated.has(device.id));
    return {
      chapterIndex,
      chapterId: map.id,
      title: chapters[chapterIndex]?.title ?? map.name ?? `第 ${chapterIndex + 1} 章`,
      activated: activatedInChapter.length,
      total: devices.length,
      complete: devices.length > 0 && activatedInChapter.length === devices.length,
      rewardClaimed: completedChapters.has(map.id),
      devices: devices.map((device) => ({
        id: device.id,
        label: device.label ?? "互动装置",
        activated: activated.has(device.id),
      })),
    };
  });
  return {
    activated: activated.size,
    total: getAllMapInteractives().length,
    completedChapters: completedChapters.size,
    chapterCount: chaptersSummary.length,
    chapters: chaptersSummary,
    last: normalizeLastMapInteractiveDiscovery(archive?.lastMapInteractiveDiscovery),
  };
}

function recordDiscoveryEchoInArchive(echo) {
  if (!echo?.id) {
    return { wasNew: false, chapterCompleted: false, shardReward: 0, summary: getEchoArchiveSummary() };
  }

  if (!archiveState) {
    archiveState = loadArchive();
  }
  archiveState.discoveredEchoes = normalizeEchoIds(archiveState.discoveredEchoes);
  archiveState.completedEchoChapters = normalizeEchoChapterIds(archiveState.completedEchoChapters);

  const map = currentMap();
  const chapterId = map?.id ?? "";
  const chapterEchoes = getMapEchoes(map);
  const discoveredSet = new Set(archiveState.discoveredEchoes);
  const wasNew = !discoveredSet.has(echo.id);
  if (wasNew) {
    archiveState.discoveredEchoes.push(echo.id);
    discoveredSet.add(echo.id);
  }

  const chapterComplete = Boolean(chapterId)
    && chapterEchoes.length > 0
    && chapterEchoes.every((chapterEcho) => discoveredSet.has(chapterEcho.id));
  const chapterAlreadyRewarded = archiveState.completedEchoChapters.includes(chapterId);
  let shardReward = 0;
  if (chapterComplete && !chapterAlreadyRewarded) {
    archiveState.completedEchoChapters.push(chapterId);
    shardReward = grantCalibrationShards(getEchoChapterReward(currentChapterIndex), `回声档案：${currentChapter().title}`);
  }

  archiveState.lastEchoDiscovery = {
    id: echo.id,
    label: echo.label ?? "地图回声",
    chapterId,
    chapterTitle: currentChapter().title,
    completedChapter: chapterComplete && !chapterAlreadyRewarded,
    shardReward,
    at: Date.now(),
  };
  saveArchive();
  return {
    wasNew,
    chapterCompleted: chapterComplete && !chapterAlreadyRewarded,
    shardReward,
    summary: getEchoArchiveSummary(),
  };
}

function recordMapCacheInArchive(cache) {
  if (!cache?.id) {
    return { wasNew: false, chapterCompleted: false, shardReward: 0, summary: getMapCacheArchiveSummary() };
  }

  if (!archiveState) {
    archiveState = loadArchive();
  }
  archiveState.discoveredMapCaches = normalizeMapCacheIds(archiveState.discoveredMapCaches);
  archiveState.completedMapCacheChapters = normalizeMapCacheChapterIds(archiveState.completedMapCacheChapters);

  const map = currentMap();
  const chapterId = map?.id ?? "";
  const chapterCaches = getMapCaches(map);
  const discoveredSet = new Set(archiveState.discoveredMapCaches);
  const wasNew = !discoveredSet.has(cache.id);
  if (wasNew) {
    archiveState.discoveredMapCaches.push(cache.id);
    discoveredSet.add(cache.id);
  }

  const chapterComplete = Boolean(chapterId)
    && chapterCaches.length > 0
    && chapterCaches.every((chapterCache) => discoveredSet.has(chapterCache.id));
  const chapterAlreadyRewarded = archiveState.completedMapCacheChapters.includes(chapterId);
  let shardReward = 0;
  if (chapterComplete && !chapterAlreadyRewarded) {
    archiveState.completedMapCacheChapters.push(chapterId);
    shardReward = grantCalibrationShards(getMapCacheChapterReward(currentChapterIndex), `地标档案：${currentChapter().title}`);
  }

  archiveState.lastMapCacheDiscovery = {
    id: cache.id,
    label: cache.label ?? "地标补给",
    chapterId,
    chapterTitle: currentChapter().title,
    completedChapter: chapterComplete && !chapterAlreadyRewarded,
    shardReward,
    at: Date.now(),
  };
  saveArchive();
  return {
    wasNew,
    chapterCompleted: chapterComplete && !chapterAlreadyRewarded,
    shardReward,
    summary: getMapCacheArchiveSummary(),
  };
}

function recordMapInteractiveInArchive(device) {
  if (!device?.id) {
    return { wasNew: false, chapterCompleted: false, shardReward: 0, summary: getMapInteractiveArchiveSummary() };
  }

  if (!archiveState) {
    archiveState = loadArchive();
  }
  archiveState.activatedMapInteractives = normalizeMapInteractiveIds(archiveState.activatedMapInteractives);
  archiveState.completedMapInteractiveChapters = normalizeMapInteractiveChapterIds(archiveState.completedMapInteractiveChapters);

  const map = currentMap();
  const chapterId = map?.id ?? "";
  const chapterDevices = getMapInteractives(map);
  const activatedSet = new Set(archiveState.activatedMapInteractives);
  const wasNew = !activatedSet.has(device.id);
  if (wasNew) {
    archiveState.activatedMapInteractives.push(device.id);
    activatedSet.add(device.id);
  }

  const chapterComplete = Boolean(chapterId)
    && chapterDevices.length > 0
    && chapterDevices.every((chapterDevice) => activatedSet.has(chapterDevice.id));
  const chapterAlreadyRewarded = archiveState.completedMapInteractiveChapters.includes(chapterId);
  let shardReward = 0;
  if (chapterComplete && !chapterAlreadyRewarded) {
    archiveState.completedMapInteractiveChapters.push(chapterId);
    shardReward = grantCalibrationShards(getMapInteractiveChapterReward(currentChapterIndex), `装置档案：${currentChapter().title}`);
  }

  archiveState.lastMapInteractiveDiscovery = {
    id: device.id,
    label: device.label ?? "互动装置",
    chapterId,
    chapterTitle: currentChapter().title,
    completedChapter: chapterComplete && !chapterAlreadyRewarded,
    shardReward,
    at: Date.now(),
  };
  saveArchive();
  return {
    wasNew,
    chapterCompleted: chapterComplete && !chapterAlreadyRewarded,
    shardReward,
    summary: getMapInteractiveArchiveSummary(),
  };
}

function getNightHookConfigById(id) {
  return nightwatchHooks.find((hook) => hook.id === id) ?? null;
}

function getNightHookConfigForChapter(chapterIndex = 0) {
  return nightwatchHooks.find((hook) => hook.chapterIndex === chapterIndex) ?? null;
}

function getFeaturedNightHook() {
  const unlocked = new Set(archiveState?.unlockedChapters?.length ? archiveState.unlockedChapters : [0]);
  const completed = new Set(archiveState?.completedNightHooks ?? []);
  return nightwatchHooks.find((hook) => unlocked.has(hook.chapterIndex) && !completed.has(hook.id))
    ?? nightwatchHooks.find((hook) => unlocked.has(hook.chapterIndex))
    ?? nightwatchHooks[0]
    ?? null;
}

function createNightHookState(chapterIndex = currentChapterIndex) {
  const config = getNightHookConfigForChapter(chapterIndex);
  if (!config) {
    return null;
  }
  return {
    id: config.id,
    chapterIndex,
    elapsed: 0,
    startDefeats: runStats?.enemiesDefeated ?? 0,
    startEvents: runStats?.eventsResolved ?? 0,
    startDamage: runStats?.damageTaken ?? 0,
    startDistance: runStats?.distanceTraveled ?? 0,
    defeats: 0,
    events: 0,
    damage: 0,
    distance: 0,
    completed: false,
    failed: false,
    rewardClaimed: false,
  };
}

function normalizeNightHookState(savedHook, chapterIndex = currentChapterIndex) {
  if (!savedHook || typeof savedHook !== "object") {
    return null;
  }
  const config = getNightHookConfigById(savedHook.id) ?? getNightHookConfigForChapter(chapterIndex);
  if (!config) {
    return null;
  }
  const fallback = createNightHookState(config.chapterIndex) ?? {};
  return {
    ...fallback,
    ...savedHook,
    id: config.id,
    chapterIndex: config.chapterIndex,
    elapsed: Math.max(0, Number(savedHook.elapsed) || 0),
    startDefeats: Math.max(0, Math.trunc(Number(savedHook.startDefeats) || 0)),
    startEvents: Math.max(0, Math.trunc(Number(savedHook.startEvents) || 0)),
    startDamage: Math.max(0, Number(savedHook.startDamage) || 0),
    startDistance: Math.max(0, Number(savedHook.startDistance) || 0),
    completed: Boolean(savedHook.completed),
    failed: Boolean(savedHook.failed),
    rewardClaimed: Boolean(savedHook.rewardClaimed),
  };
}

function activateNightHookForChapter(chapterIndex = currentChapterIndex) {
  if (!runStats) {
    return;
  }
  runStats.activeHook = createNightHookState(chapterIndex);
  const config = getNightHookConfigById(runStats.activeHook?.id);
  if (config) {
    setLog(config.startLog);
  }
}

function refreshNightHookProgress(hook = runStats?.activeHook) {
  const config = getNightHookConfigById(hook?.id);
  if (!hook || !config || !runStats) {
    return null;
  }
  hook.defeats = Math.max(0, (runStats.enemiesDefeated ?? 0) - (hook.startDefeats ?? 0));
  hook.events = Math.max(0, (runStats.eventsResolved ?? 0) - (hook.startEvents ?? 0));
  hook.damage = Math.max(0, (runStats.damageTaken ?? 0) - (hook.startDamage ?? 0));
  hook.distance = Math.max(0, (runStats.distanceTraveled ?? 0) - (hook.startDistance ?? 0));
  return { hook, config };
}

function nightHookCriteriaMet(hook, config) {
  const criteria = config?.criteria ?? {};
  if (criteria.defeats && hook.defeats < criteria.defeats) return false;
  if (criteria.events && hook.events < criteria.events) return false;
  if (criteria.distance && hook.distance < criteria.distance) return false;
  if (criteria.maxDamage && hook.damage > criteria.maxDamage) return false;
  if (criteria.timeLimit && hook.elapsed > criteria.timeLimit) return false;
  return true;
}

function completeNightHook(hook, config) {
  if (!hook || !config || hook.completed || hook.failed) {
    return;
  }

  hook.completed = true;
  hook.rewardClaimed = true;
  grantCalibrationShards(config.rewardShards ?? 0, `夜巡委托：${config.title}`);
  player.bugPoints += config.rewardBugPoints ?? 0;
  player.hp = clamp(player.hp + (config.rewardHp ?? 0), 1, player.maxHp);
  archiveState.completedNightHooks = [...new Set([...(archiveState.completedNightHooks ?? []), config.id])];
  archiveState.nightHookCompletions = Math.max(archiveState.nightHookCompletions ?? 0, 0) + 1;
  saveArchive();
  burst(player.x, player.y, "#f1c15b", 34);
  burst(player.x, player.y, "#5de2d1", 22);
  playAudioCue("upgrade-select");
  setLog(`${config.completeLog} +${config.rewardShards ?? 0} 校准碎片，+${config.rewardBugPoints ?? 0} bug点数。`);
  saveRunCheckpoint("night-hook-complete");
}

function failNightHook(hook, config, reason = "") {
  if (!hook || !config || hook.completed || hook.failed) {
    return;
  }
  hook.failed = true;
  setLog(reason || config.failLog);
  saveRunCheckpoint("night-hook-failed");
}

function updateNightHook(dt = 0) {
  const state = refreshNightHookProgress();
  if (!state || state.hook.completed || state.hook.failed) {
    return;
  }

  const { hook, config } = state;
  hook.elapsed = Math.max(0, (hook.elapsed ?? 0) + Math.max(0, dt));
  refreshNightHookProgress(hook);

  if (nightHookCriteriaMet(hook, config)) {
    completeNightHook(hook, config);
    return;
  }

  const criteria = config.criteria ?? {};
  if (criteria.maxDamage && hook.damage > criteria.maxDamage) {
    failNightHook(hook, config, config.failLog);
    return;
  }
  if (criteria.timeLimit && hook.elapsed > criteria.timeLimit) {
    failNightHook(hook, config, config.failLog);
  }
}

function formatHookTime(seconds) {
  const safe = Math.max(0, Math.ceil(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function formatHookDistance(distance) {
  return Math.floor((Number(distance) || 0) / 100);
}

function getNightHookProgressText(hook, config) {
  if (!hook || !config) {
    return "";
  }
  const criteria = config.criteria ?? {};
  const parts = [];
  if (criteria.events) parts.push(`异常 ${Math.min(hook.events, criteria.events)}/${criteria.events}`);
  if (criteria.defeats) parts.push(`击破 ${Math.min(hook.defeats, criteria.defeats)}/${criteria.defeats}`);
  if (criteria.distance) parts.push(`巡线 ${Math.min(formatHookDistance(hook.distance), formatHookDistance(criteria.distance))}/${formatHookDistance(criteria.distance)} 段`);
  if (criteria.maxDamage) parts.push(`受伤 ${Math.round(hook.damage)}/${criteria.maxDamage}`);
  if (criteria.timeLimit) parts.push(`剩余 ${formatHookTime(criteria.timeLimit - hook.elapsed)}`);
  return parts.join(" · ");
}

function getRunHookResultText() {
  const hook = runStats?.activeHook;
  const config = getNightHookConfigById(hook?.id);
  if (!hook || !config) {
    return "未接取";
  }
  if (hook.completed) {
    return `${config.title} 已完成`;
  }
  if (hook.failed) {
    return `${config.title} 未完成`;
  }
  return getNightHookProgressText(hook, config);
}

function createCombatTempoState() {
  return {
    streak: 0,
    bestStreak: 0,
    timer: 0,
    rewardLevel: 0,
    rewardsClaimed: 0,
    hotFlash: 0,
  };
}

function normalizeCombatTempoState(savedTempo = {}) {
  return {
    ...createCombatTempoState(),
    streak: Math.max(0, Math.trunc(Number(savedTempo?.streak) || 0)),
    bestStreak: Math.max(0, Math.trunc(Number(savedTempo?.bestStreak) || 0)),
    timer: clamp(Number(savedTempo?.timer) || 0, 0, combatTempoConfig.window),
    rewardLevel: Math.max(0, Math.trunc(Number(savedTempo?.rewardLevel) || 0)),
    rewardsClaimed: Math.max(0, Math.trunc(Number(savedTempo?.rewardsClaimed) || 0)),
    hotFlash: Math.max(0, Number(savedTempo?.hotFlash) || 0),
  };
}

function ensureCombatTempoState() {
  if (!runStats) {
    return null;
  }
  runStats.tempo = normalizeCombatTempoState(runStats.tempo);
  return runStats.tempo;
}

function updateCombatTempo(dt = 0) {
  const tempo = runStats?.tempo;
  if (!tempo) {
    return;
  }
  tempo.hotFlash = Math.max(0, (tempo.hotFlash ?? 0) - dt);
  if (tempo.streak <= 0) {
    tempo.timer = 0;
    tempo.rewardLevel = 0;
    return;
  }
  tempo.timer = Math.max(0, (tempo.timer ?? 0) - dt);
  if (tempo.timer <= 0) {
    tempo.streak = 0;
    tempo.rewardLevel = 0;
  }
}

function breakCombatTempo() {
  const tempo = runStats?.tempo;
  if (!tempo) {
    return;
  }
  tempo.streak = 0;
  tempo.timer = 0;
  tempo.rewardLevel = 0;
}

function registerCombatTempoHit(enemy) {
  const tempo = ensureCombatTempoState();
  if (!tempo || world.mode !== "playing") {
    return;
  }
  const wasActive = tempo.timer > 0 && tempo.streak > 0;
  tempo.streak = wasActive ? tempo.streak + 1 : 1;
  tempo.timer = combatTempoConfig.window;
  tempo.bestStreak = Math.max(tempo.bestStreak ?? 0, tempo.streak);
  tempo.hotFlash = 0.42;

  const nextRewardLevel = Math.floor(tempo.streak / combatTempoConfig.rewardEvery);
  const canReward = nextRewardLevel > (tempo.rewardLevel ?? 0)
    && (tempo.rewardsClaimed ?? 0) < combatTempoConfig.maxRewardsPerRun;
  if (!canReward) {
    return;
  }

  tempo.rewardLevel = nextRewardLevel;
  tempo.rewardsClaimed += 1;
  player.bugPoints += combatTempoConfig.bugPointReward;
  player.hp = clamp(player.hp + combatTempoConfig.healReward, 1, player.maxHp);
  spawnBugPickup(enemy.x, enemy.y, 0, combatTempoConfig.pickupXpReward);
  burst(enemy.x, enemy.y, "#f1c15b", 18);
  burst(player.x, player.y, "#5de2d1", 16);
  playAudioCue("upgrade-select");
  setLog(`战斗节奏 x${tempo.streak}：连段补给 +${combatTempoConfig.bugPointReward} bug点数，稳住这一波。`);
}

function getCombatTempoText() {
  const tempo = runStats?.tempo;
  if (!tempo || tempo.streak <= 0) {
    return "尚未点燃";
  }
  const next = Math.max(combatTempoConfig.rewardEvery, (Math.floor(tempo.streak / combatTempoConfig.rewardEvery) + 1) * combatTempoConfig.rewardEvery);
  return `x${tempo.streak} · ${formatHookTime(tempo.timer)} · 下次补给 ${Math.min(tempo.streak, next)}/${next}`;
}

function createOpeningSprintState() {
  return {
    id: "first-night-sprint",
    active: currentChapterIndex === 0,
    completed: false,
    elapsed: 0,
    stepIndex: 0,
    completedStepIds: [],
    startEvents: runStats?.eventsResolved ?? 0,
    startDefeats: runStats?.enemiesDefeated ?? 0,
    startUpgrades: runStats?.upgradesChosen?.length ?? 0,
    startTempoRewards: runStats?.tempo?.rewardsClaimed ?? 0,
    retryBonusBugPoints: 0,
    surge: createOpeningSurgeState(),
  };
}

function createOpeningSurgeState() {
  return {
    id: openingSurgeConfig.id,
    active: currentChapterIndex === 0,
    spawned: false,
    completed: false,
    failed: false,
    elapsed: 0,
    delayRemaining: openingSurgeConfig.spawnDelay,
    targetDefeats: openingSurgeConfig.targetDefeats,
    defeats: 0,
    spawnedCount: 0,
    tempoKickClaimed: false,
    ignitionCreditClaimed: false,
    firstStrikeClaimed: false,
    firstStrikeAt: null,
    firstStrikeSource: null,
    firstStrikeEnemyIndex: null,
    x: null,
    y: null,
  };
}

function normalizeOpeningSurgeState(savedSurge = null) {
  const fallback = createOpeningSurgeState();
  if (!savedSurge || typeof savedSurge !== "object") {
    return fallback;
  }
  const defeats = clamp(
    Math.trunc(Number(savedSurge.defeats) || 0),
    0,
    openingSurgeConfig.targetDefeats,
  );
  const completed = Boolean(savedSurge.completed) || defeats >= openingSurgeConfig.targetDefeats;
  return {
    ...fallback,
    ...savedSurge,
    id: openingSurgeConfig.id,
    active: Boolean(savedSurge.active) && !completed && !savedSurge.failed,
    spawned: Boolean(savedSurge.spawned),
    completed,
    failed: Boolean(savedSurge.failed) && !completed,
    elapsed: Math.max(0, Number(savedSurge.elapsed) || 0),
    delayRemaining: Math.max(0, Number(savedSurge.delayRemaining) || 0),
    targetDefeats: openingSurgeConfig.targetDefeats,
    defeats,
    spawnedCount: Math.max(0, Math.trunc(Number(savedSurge.spawnedCount) || 0)),
    tempoKickClaimed: Boolean(savedSurge.tempoKickClaimed),
    ignitionCreditClaimed: Boolean(savedSurge.ignitionCreditClaimed),
    firstStrikeClaimed: Boolean(savedSurge.firstStrikeClaimed),
    firstStrikeAt: Number.isFinite(savedSurge.firstStrikeAt) ? Math.max(0, savedSurge.firstStrikeAt) : null,
    firstStrikeSource: typeof savedSurge.firstStrikeSource === "string" ? savedSurge.firstStrikeSource : null,
    firstStrikeEnemyIndex: Number.isFinite(savedSurge.firstStrikeEnemyIndex)
      ? Math.max(0, Math.trunc(savedSurge.firstStrikeEnemyIndex))
      : null,
    x: Number.isFinite(savedSurge.x) ? savedSurge.x : null,
    y: Number.isFinite(savedSurge.y) ? savedSurge.y : null,
  };
}

const openingShowcaseChecklistItems = [
  { key: "target", label: "目标罗盘" },
  { key: "enemies", label: "首波敌群" },
  { key: "effect", label: "武器特效" },
  { key: "reward", label: "奖励反馈" },
];

function createOpeningShowcaseChecklist(value = {}) {
  return {
    target: Boolean(value.target),
    enemies: Boolean(value.enemies),
    effect: Boolean(value.effect),
    reward: Boolean(value.reward),
    ready: Boolean(value.ready),
    readyHold: Math.max(0, Number(value.readyHold) || 0),
    enemyCount: Math.max(0, Math.trunc(Number(value.enemyCount) || 0)),
    effectPulse: Math.max(0, Number(value.effectPulse) || 0),
    effectLabel: typeof value.effectLabel === "string" ? value.effectLabel : "",
  };
}

function normalizeOpeningShowcasePhase(phase) {
  if (phase === "preview" || phase === "cleared" || phase === "retry" || phase === "combat") {
    return phase;
  }
  return "spawned";
}

function createOpeningShowcaseState(phase = "spawned", options = {}) {
  const normalizedPhase = normalizeOpeningShowcasePhase(phase);
  const plan = normalizeRetryPlan(options.retryPlan ?? runStats?.retryPlan);
  const weapon = player?.weapon ?? getWeaponById(plan?.starterBuildId ? getStarterBuildById(plan.starterBuildId)?.weaponId : null) ?? weaponDefinitions[0] ?? {};
  const title = normalizedPhase === "cleared"
    ? "第一波高光已成片"
    : normalizedPhase === "retry"
      ? "推荐再来 30 秒路线"
      : normalizedPhase === "combat"
        ? "推荐再来实战镜头"
        : normalizedPhase === "preview"
          ? "下一波裂隙预告"
      : "第一波截图高光";
  const defaultFocus = `${weapon.name ?? "当前武器"}、快递裂隙、开场牵引和连段奖励同屏可读。`;
  const previewFocus = `${weapon.name ?? "当前武器"}准备好，下一波快递裂隙将在黄框处刷新。`;
  const focus = options.screenshotFocus ?? plan?.screenshotFocus ?? (normalizedPhase === "preview" ? previewFocus : defaultFocus);
  return {
    id: "opening-first-wave-showcase",
    phase: normalizedPhase,
    active: true,
    title: options.title ?? title,
    promise: options.promise ?? plan?.promise ?? "把首个异常、第一波追击和武器命中特效压进同一屏。",
    focus,
    rewardText: options.rewardText ?? plan?.rewardText ?? `清场奖励 +${openingSurgeConfig.rewardBugPoints} bug点数 / +${openingSurgeConfig.rewardXp} 经验，并推进流派启动。`,
    callout: options.callout ?? (
      normalizedPhase === "cleared"
        ? "清场奖励已入账"
        : normalizedPhase === "retry"
          ? "复盘路线已带入，先按这条线打"
          : normalizedPhase === "combat"
            ? "同屏检查：目标 / 敌群 / 特效 / 奖励"
            : normalizedPhase === "preview"
              ? "黄框预告：下一波裂隙马上刷新"
          : "先看裂隙，再看武器特效"
    ),
    weaponName: weapon.name ?? "初始武器",
    x: Number.isFinite(options.x) ? options.x : null,
    y: Number.isFinite(options.y) ? options.y : null,
    radius: Math.max(80, Number(options.radius) || 168),
    spawnedCount: Math.max(0, Math.trunc(Number(options.spawnedCount) || 0)),
    defeats: clamp(Math.trunc(Number(options.defeats) || 0), 0, openingSurgeConfig.targetDefeats),
    targetDefeats: openingSurgeConfig.targetDefeats,
    checklist: createOpeningShowcaseChecklist(options.checklist),
    flash: normalizedPhase === "cleared" ? 2.2 : normalizedPhase === "retry" ? 1.9 : normalizedPhase === "combat" ? 2 : normalizedPhase === "preview" ? 1.4 : 1.6,
    hold: normalizedPhase === "cleared" ? 8 : normalizedPhase === "retry" ? 14 : normalizedPhase === "combat" ? 12 : normalizedPhase === "preview" ? 5 : 12,
    completed: normalizedPhase === "cleared",
  };
}

function normalizeOpeningShowcaseState(savedShowcase = null) {
  if (!savedShowcase || typeof savedShowcase !== "object") {
    return null;
  }
  const phase = normalizeOpeningShowcasePhase(savedShowcase.phase);
  const fallback = createOpeningShowcaseState(phase);
  const hold = Math.max(0, Number(savedShowcase.hold ?? fallback.hold) || 0);
  return {
    ...fallback,
    ...savedShowcase,
    id: "opening-first-wave-showcase",
    phase,
    active: Boolean(savedShowcase.active) && hold > 0,
    title: typeof savedShowcase.title === "string" ? savedShowcase.title : fallback.title,
    promise: typeof savedShowcase.promise === "string" ? savedShowcase.promise : fallback.promise,
    focus: typeof savedShowcase.focus === "string" ? savedShowcase.focus : fallback.focus,
    rewardText: typeof savedShowcase.rewardText === "string" ? savedShowcase.rewardText : fallback.rewardText,
    callout: typeof savedShowcase.callout === "string" ? savedShowcase.callout : fallback.callout,
    weaponName: typeof savedShowcase.weaponName === "string" ? savedShowcase.weaponName : fallback.weaponName,
    x: Number.isFinite(savedShowcase.x) ? savedShowcase.x : fallback.x,
    y: Number.isFinite(savedShowcase.y) ? savedShowcase.y : fallback.y,
    radius: Math.max(80, Number(savedShowcase.radius ?? fallback.radius) || fallback.radius),
    spawnedCount: Math.max(0, Math.trunc(Number(savedShowcase.spawnedCount) || 0)),
    defeats: clamp(Math.trunc(Number(savedShowcase.defeats) || 0), 0, openingSurgeConfig.targetDefeats),
    targetDefeats: openingSurgeConfig.targetDefeats,
    checklist: createOpeningShowcaseChecklist(savedShowcase.checklist ?? fallback.checklist),
    flash: Math.max(0, Number(savedShowcase.flash) || 0),
    hold,
    completed: Boolean(savedShowcase.completed) || phase === "cleared",
  };
}

function activateOpeningShowcase(phase, surge, options = {}) {
  if (!runStats || currentChapterIndex !== 0) {
    return null;
  }
  const state = createOpeningShowcaseState(phase, {
    ...options,
    x: Number.isFinite(options.x) ? options.x : surge?.x,
    y: Number.isFinite(options.y) ? options.y : surge?.y,
    spawnedCount: options.spawnedCount ?? surge?.spawnedCount,
    defeats: options.defeats ?? surge?.defeats,
    retryPlan: options.retryPlan ?? runStats.retryPlan,
  });
  runStats.openingShowcase = state;
  return state;
}

function getOpeningSurgePreviewPoint() {
  const map = currentMap();
  const anchor = map.stepTargets?.[0]?.[0] ?? {
    x: player.x + 260,
    y: player.y,
  };
  return findNearestFreePoint(
    clamp((player.x + anchor.x) / 2 + 42, player.radius + 72, world.width - player.radius - 72),
    clamp((player.y + anchor.y) / 2, 112, world.height - player.radius - 72),
    64,
  );
}

function getOpeningSurgeLandingPreviewPoints(center = getOpeningSurgePreviewPoint()) {
  return openingSurgeConfig.enemyPattern.map((pattern, index) => {
    const point = findNearestFreePoint(center.x + pattern.dx - 260, center.y + pattern.dy, 28);
    return {
      ...point,
      index,
      type: pattern.type,
      scale: pattern.scale ?? 1,
    };
  });
}

function activateOpeningSurgePreview(sprint = runStats?.openingSprint) {
  const surge = sprint?.surge;
  if (!surge || currentChapterIndex !== 0 || world.mode !== "playing" || surge.spawned || surge.completed || surge.failed) {
    return null;
  }
  const point = getOpeningSurgePreviewPoint();
  surge.x = point.x;
  surge.y = point.y;
  return activateOpeningShowcase("preview", surge, {
    x: point.x,
    y: point.y,
    radius: 190,
    callout: "黄框预告：看 4 个落点，倒计时后接怪",
    screenshotFocus: `${player.weapon?.name ?? "当前武器"}准备好，沿黄框路线接第一波追击。`,
  });
}

function isPointInCurrentCamera(x, y, margin = 28) {
  return Number.isFinite(x)
    && Number.isFinite(y)
    && x >= world.cameraX + margin
    && x <= world.cameraX + world.viewWidth - margin
    && y >= world.cameraY + 92
    && y <= world.cameraY + world.viewHeight - margin;
}

function refreshOpeningShowcaseChecklist(showcase, dt = 0) {
  if (!showcase || !["retry", "combat", "spawned", "cleared"].includes(showcase.phase)) {
    return;
  }
  const checklist = createOpeningShowcaseChecklist(showcase.checklist);
  const targets = getObjectiveTargets();
  const surgeEnemies = enemies.filter((enemy) => enemy.openingSurge && enemy.hp > 0);
  const visibleSurgeEnemies = surgeEnemies.filter((enemy) => isPointInCurrentCamera(enemy.x, enemy.y, -10));
  const visibleEffects = particles.some((particle) => {
    return particle.type === "impact"
      && particle.life > 0
      && isPointInCurrentCamera(particle.x, particle.y, -20);
  }) || bullets.some((bullet) => {
    return bullet.weaponId === player?.weapon?.id
      && bullet.life > 0
      && isPointInCurrentCamera(bullet.x, bullet.y, -20);
  });

  checklist.target = checklist.target || targets.length > 0;
  checklist.enemies = checklist.enemies || visibleSurgeEnemies.length >= Math.min(2, openingSurgeConfig.targetDefeats);
  checklist.effectPulse = Math.max(0, checklist.effectPulse - dt);
  checklist.effect = checklist.effect || checklist.effectPulse > 0 || visibleEffects;
  checklist.reward = checklist.reward || Boolean(showcase.rewardText) || Boolean(showcase.completed);
  checklist.enemyCount = Math.max(checklist.enemyCount, visibleSurgeEnemies.length);
  checklist.ready = checklist.target && checklist.enemies && checklist.effect && checklist.reward;
  checklist.readyHold = checklist.ready
    ? Math.min(6, checklist.readyHold + dt)
    : Math.max(0, checklist.readyHold - dt * 0.5);
  showcase.checklist = checklist;
}

function markOpeningShowcaseWeaponEffect(enemy, profile = null) {
  const showcase = runStats?.openingShowcase;
  if (!showcase?.active || !enemy?.openingSurge) {
    return;
  }
  showcase.checklist = createOpeningShowcaseChecklist(showcase.checklist);
  showcase.checklist.effect = true;
  showcase.checklist.effectPulse = 1.2;
  showcase.checklist.effectLabel = profile?.label ?? profile?.id ?? player?.weapon?.name ?? "武器命中";
}

function updateOpeningShowcase(dt = 0) {
  const showcase = runStats?.openingShowcase;
  if (!showcase?.active) {
    return;
  }
  refreshOpeningShowcaseChecklist(showcase, dt);
  showcase.flash = Math.max(0, (showcase.flash ?? 0) - dt);
  showcase.hold = Math.max(0, (showcase.hold ?? 0) - dt);
  if (showcase.hold <= 0) {
    showcase.active = false;
  }
}

function getChapterShowcaseConfig(chapterIndex = currentChapterIndex) {
  const mapId = chapterMaps[chapterIndex]?.id;
  if (!mapId) {
    return null;
  }
  return chapterShowcaseConfigs[mapId] ?? null;
}

function createChapterShowcaseChecklist(value = {}) {
  return {
    device: Boolean(value.device),
    mechanic: Boolean(value.mechanic),
    boss: Boolean(value.boss),
    effect: Boolean(value.effect),
    ready: Boolean(value.ready),
    effectLabel: typeof value.effectLabel === "string" ? value.effectLabel : "",
    bossPhase: Math.max(0, Math.trunc(Number(value.bossPhase) || 0)),
  };
}

function createChapterShowcaseState(chapterIndex = currentChapterIndex, trigger = "chapter", options = {}) {
  const config = getChapterShowcaseConfig(chapterIndex);
  if (!config || chapterIndex <= 0) {
    return null;
  }
  const map = chapterMaps[chapterIndex] ?? currentMap();
  const focus = options.focus ?? getMapInteractives(map)[0] ?? map.bossSpawn ?? map.start ?? player;
  return {
    id: `${map.id}-combat-showcase`,
    chapterIndex,
    mapId: map.id,
    trigger,
    active: true,
    title: options.title ?? config.title,
    hook: options.hook ?? config.hook,
    deviceLabel: options.deviceLabel ?? config.deviceLabel,
    mechanicLabel: options.mechanicLabel ?? config.mechanicLabel,
    bossLabel: options.bossLabel ?? config.bossLabel,
    callout: options.callout ?? "章节镜头检查点",
    x: Number.isFinite(options.x) ? options.x : focus?.x ?? player?.x ?? 0,
    y: Number.isFinite(options.y) ? options.y : focus?.y ?? player?.y ?? 0,
    radius: Math.max(110, Number(options.radius) || 220),
    checklist: createChapterShowcaseChecklist(options.checklist),
    flash: Math.max(0, Number(options.flash) || 1.6),
    hold: Math.max(8, Number(options.hold) || 18),
    completed: Boolean(options.completed),
  };
}

function normalizeChapterShowcaseState(value = null) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const chapterIndex = clamp(Math.trunc(Number(value.chapterIndex) || currentChapterIndex), 0, chapters.length - 1);
  const fallback = createChapterShowcaseState(chapterIndex, value.trigger ?? "chapter");
  if (!fallback) {
    return null;
  }
  const hold = Math.max(0, Number(value.hold ?? fallback.hold) || 0);
  return {
    ...fallback,
    ...value,
    id: fallback.id,
    chapterIndex,
    mapId: fallback.mapId,
    active: Boolean(value.active) && hold > 0,
    title: typeof value.title === "string" ? value.title : fallback.title,
    hook: typeof value.hook === "string" ? value.hook : fallback.hook,
    deviceLabel: typeof value.deviceLabel === "string" ? value.deviceLabel : fallback.deviceLabel,
    mechanicLabel: typeof value.mechanicLabel === "string" ? value.mechanicLabel : fallback.mechanicLabel,
    bossLabel: typeof value.bossLabel === "string" ? value.bossLabel : fallback.bossLabel,
    callout: typeof value.callout === "string" ? value.callout : fallback.callout,
    x: Number.isFinite(value.x) ? value.x : fallback.x,
    y: Number.isFinite(value.y) ? value.y : fallback.y,
    radius: Math.max(110, Number(value.radius ?? fallback.radius) || fallback.radius),
    checklist: createChapterShowcaseChecklist(value.checklist ?? fallback.checklist),
    flash: Math.max(0, Number(value.flash) || 0),
    hold,
    completed: Boolean(value.completed),
  };
}

function activateChapterShowcase(trigger = "chapter", options = {}) {
  if (!runStats || currentChapterIndex <= 0 || !getChapterShowcaseConfig(currentChapterIndex)) {
    return null;
  }
  const previous = runStats.chapterShowcase?.mapId === currentMap().id
    ? runStats.chapterShowcase
    : null;
  const state = createChapterShowcaseState(currentChapterIndex, trigger, {
    ...options,
    checklist: {
      ...(previous?.checklist ?? {}),
      ...(options.checklist ?? {}),
    },
    hold: Math.max(previous?.hold ?? 0, Number(options.hold) || 18),
  });
  if (!state) {
    return null;
  }
  state.completed = Boolean(previous?.completed) || state.completed;
  runStats.chapterShowcase = state;
  return state;
}

function markChapterShowcase(key, options = {}) {
  const showcase = activateChapterShowcase(options.trigger ?? key, options);
  if (!showcase || !["device", "mechanic", "boss", "effect"].includes(key)) {
    return null;
  }
  showcase.checklist = createChapterShowcaseChecklist(showcase.checklist);
  showcase.checklist[key] = true;
  if (key === "effect" && options.effectLabel) {
    showcase.checklist.effectLabel = options.effectLabel;
  }
  if (key === "boss" && boss?.phase) {
    showcase.checklist.bossPhase = Math.max(showcase.checklist.bossPhase ?? 0, boss.phase);
  }
  showcase.x = Number.isFinite(options.x) ? options.x : showcase.x;
  showcase.y = Number.isFinite(options.y) ? options.y : showcase.y;
  showcase.flash = Math.max(showcase.flash ?? 0, 1.2);
  return showcase;
}

function updateChapterShowcase(dt = 0) {
  if (!runStats || currentChapterIndex <= 0 || world.mode !== "playing") {
    return;
  }
  const config = getChapterShowcaseConfig(currentChapterIndex);
  if (!config) {
    return;
  }
  let showcase = runStats.chapterShowcase?.mapId === currentMap().id
    ? runStats.chapterShowcase
    : activateChapterShowcase("chapter", { callout: "章节镜头检查点" });
  if (!showcase?.active) {
    showcase = activateChapterShowcase("chapter", {
      callout: "章节镜头检查点",
      hold: 18,
    });
  }
  if (!showcase?.active) {
    return;
  }

  const checklist = createChapterShowcaseChecklist(showcase.checklist);
  const pendingDevice = getMapInteractives().find((device) => !isMapInteractiveActivated(device)) ?? getMapInteractives()[0];
  if (pendingDevice && (isMapInteractiveActivated(pendingDevice) || isPointInCurrentCamera(pendingDevice.x, pendingDevice.y, -20))) {
    checklist.device = true;
  }
  const visibleMechanic = [...enemies, ...cleaners].some((enemy) => {
    return enemy.mechanic && enemy.hp > 0 && isPointInCurrentCamera(enemy.x, enemy.y, -30);
  }) || enemyHazards.some((hazard) => isPointInCurrentCamera(hazard.x, hazard.y, -40));
  checklist.mechanic = checklist.mechanic || visibleMechanic;
  const bossWindow = Boolean(boss && boss.hp > 0 && (boss.phase >= 2 || boss.hitFlash > 0 || boss.slowTimer > 0));
  checklist.boss = checklist.boss || bossWindow;
  if (boss?.phase) {
    checklist.bossPhase = Math.max(checklist.bossPhase ?? 0, boss.phase);
  }
  const visibleEffect = particles.some((particle) => {
    return particle.type === "impact" && particle.life > 0 && isPointInCurrentCamera(particle.x, particle.y, -20);
  });
  checklist.effect = checklist.effect || visibleEffect;
  checklist.ready = checklist.device && checklist.mechanic && checklist.boss && checklist.effect;
  showcase.checklist = checklist;
  showcase.completed = showcase.completed || checklist.ready;
  showcase.flash = Math.max(0, (showcase.flash ?? 0) - dt);
  showcase.hold = Math.max(showcase.completed ? 6 : 0, (showcase.hold ?? 0) - dt);
  if (showcase.hold <= 0) {
    showcase.active = false;
  }
}

function normalizeOpeningSprintState(savedSprint = null) {
  if (!savedSprint || typeof savedSprint !== "object") {
    return null;
  }
  const fallback = createOpeningSprintState();
  const completedStepIds = Array.isArray(savedSprint.completedStepIds)
    ? savedSprint.completedStepIds.filter((id) => openingSprintSteps.some((step) => step.id === id))
    : [];
  const stepIndex = clamp(
    Math.trunc(Number(savedSprint.stepIndex) || completedStepIds.length),
    0,
    openingSprintSteps.length,
  );
  return {
    ...fallback,
    ...savedSprint,
    id: "first-night-sprint",
    active: Boolean(savedSprint.active),
    completed: Boolean(savedSprint.completed) || completedStepIds.length >= openingSprintSteps.length,
    elapsed: Math.max(0, Number(savedSprint.elapsed) || 0),
    stepIndex,
    completedStepIds,
    startEvents: Math.max(0, Math.trunc(Number(savedSprint.startEvents) || 0)),
    startDefeats: Math.max(0, Math.trunc(Number(savedSprint.startDefeats) || 0)),
    startUpgrades: Math.max(0, Math.trunc(Number(savedSprint.startUpgrades) || 0)),
    startTempoRewards: Math.max(0, Math.trunc(Number(savedSprint.startTempoRewards) || 0)),
    retryBonusBugPoints: clamp(Math.trunc(Number(savedSprint.retryBonusBugPoints) || 0), 0, 2),
    surge: normalizeOpeningSurgeState(savedSprint.surge),
  };
}

function getOpeningRushGrade(score = 0) {
  const value = clamp(Math.trunc(Number(score) || 0), 0, 100);
  return openingRushConfig.grades.find((grade) => value >= grade.min) ?? openingRushConfig.grades.at(-1);
}

function getOpeningRushMilestone(id) {
  return openingRushConfig.milestones.find((milestone) => milestone.id === id) ?? null;
}

function calculateOpeningRushScore(completedIds = []) {
  const completed = new Set(Array.isArray(completedIds) ? completedIds : []);
  return clamp(
    openingRushConfig.milestones.reduce((sum, milestone) => (
      completed.has(milestone.id) ? sum + milestone.score : sum
    ), 0),
    0,
    100,
  );
}

function createOpeningRushState(value = {}) {
  const completedIds = Array.isArray(value.completedIds)
    ? [...new Set(value.completedIds.filter((id) => getOpeningRushMilestone(id)))]
    : [];
  const score = calculateOpeningRushScore(completedIds);
  const gradeInfo = getOpeningRushGrade(score);
  const elapsed = Math.max(0, Number(value.elapsed) || 0);
  return {
    id: "first-30-rush",
    active: value.active === undefined ? true : Boolean(value.active),
    windowSeconds: openingRushConfig.windowSeconds,
    elapsed,
    completedIds,
    score,
    grade: gradeInfo.grade,
    gradeTitle: gradeInfo.title,
    gradeText: gradeInfo.text,
    bestAt: Number(value.bestAt) || null,
    flash: Math.max(0, Number(value.flash) || 0),
    lastMilestone: typeof value.lastMilestone === "string" ? value.lastMilestone : "",
  };
}

function normalizeOpeningRushState(savedRush = null) {
  if (!savedRush || typeof savedRush !== "object") {
    return createOpeningRushState();
  }
  const normalized = createOpeningRushState(savedRush);
  normalized.active = Boolean(savedRush.active) && normalized.elapsed < openingRushConfig.windowSeconds;
  return normalized;
}

function getOpeningRushSnapshot(rush = runStats?.openingRush) {
  if (!rush) {
    return normalizeOpeningRushArchive(null);
  }
  const normalized = createOpeningRushState(rush);
  return normalizeOpeningRushArchive({
    score: normalized.score,
    grade: normalized.grade,
    gradeTitle: normalized.gradeTitle,
    gradeText: normalized.gradeText,
    elapsed: normalized.elapsed,
    completedIds: normalized.completedIds,
    at: normalized.bestAt ?? Date.now(),
  });
}

function normalizeOpeningRushArchive(value = null) {
  if (!value || typeof value !== "object") {
    const gradeInfo = getOpeningRushGrade(0);
    return {
      score: 0,
      grade: gradeInfo.grade,
      gradeTitle: gradeInfo.title,
      gradeText: gradeInfo.text,
      elapsed: 0,
      completedIds: [],
      at: null,
    };
  }
  const completedIds = Array.isArray(value.completedIds)
    ? [...new Set(value.completedIds.filter((id) => getOpeningRushMilestone(id)))]
    : [];
  const score = clamp(Math.trunc(Number(value.score) || calculateOpeningRushScore(completedIds)), 0, 100);
  const gradeInfo = getOpeningRushGrade(score);
  return {
    score,
    grade: ["S", "A", "B", "C", "D"].includes(value.grade) ? value.grade : gradeInfo.grade,
    gradeTitle: typeof value.gradeTitle === "string" ? value.gradeTitle : gradeInfo.title,
    gradeText: typeof value.gradeText === "string" ? value.gradeText : gradeInfo.text,
    elapsed: Math.max(0, Number(value.elapsed) || 0),
    completedIds,
    at: Number(value.at) || null,
  };
}

function completeOpeningRushMilestone(id) {
  const milestone = getOpeningRushMilestone(id);
  const rush = runStats?.openingRush;
  if (!milestone || !rush || currentChapterIndex !== 0) {
    return null;
  }
  if ((rush.elapsed ?? 0) > openingRushConfig.windowSeconds || rush.completedIds?.includes(id)) {
    return createOpeningRushState(rush);
  }

  rush.completedIds = [...new Set([...(rush.completedIds ?? []), id])];
  const refreshed = createOpeningRushState({
    ...rush,
    completedIds: rush.completedIds,
    flash: 1.6,
    lastMilestone: milestone.label,
    bestAt: Date.now(),
  });
  runStats.openingRush = {
    ...rush,
    ...refreshed,
    active: refreshed.elapsed < openingRushConfig.windowSeconds,
  };
  return runStats.openingRush;
}

function updateOpeningRush(dt = 0) {
  const rush = runStats?.openingRush;
  if (!rush || currentChapterIndex !== 0 || world.mode !== "playing") {
    return;
  }
  rush.elapsed = Math.max(0, (rush.elapsed ?? 0) + Math.max(0, dt));
  rush.flash = Math.max(0, (rush.flash ?? 0) - dt);
  if (rush.elapsed >= openingRushConfig.windowSeconds) {
    rush.active = false;
  }
  const refreshed = createOpeningRushState(rush);
  Object.assign(rush, {
    score: refreshed.score,
    grade: refreshed.grade,
    gradeTitle: refreshed.gradeTitle,
    gradeText: refreshed.gradeText,
  });
}

function recordOpeningRushInArchive(rush = runStats?.openingRush) {
  if (!archiveState) {
    archiveState = loadArchive();
  }
  const snapshot = getOpeningRushSnapshot(rush);
  archiveState.lastOpeningRush = snapshot;
  if (snapshot.score > Math.max(0, Math.trunc(Number(archiveState.bestOpeningRushScore) || 0))) {
    archiveState.bestOpeningRushScore = snapshot.score;
    archiveState.bestOpeningRushGrade = snapshot.grade;
    archiveState.bestOpeningRushAt = Date.now();
  }
  return snapshot;
}

function formatOpeningRushScore(rush = runStats?.openingRush) {
  const snapshot = getOpeningRushSnapshot(rush);
  if (!snapshot.score) {
    return "未评级";
  }
  const seconds = snapshot.elapsed > 0 ? ` · ${Math.round(snapshot.elapsed)}s` : "";
  return `${snapshot.grade} ${snapshot.score}/100${seconds}`;
}

function formatOpeningRushArchiveBest(archive = archiveState) {
  const score = Math.max(0, Math.trunc(Number(archive?.bestOpeningRushScore) || 0));
  if (!score) {
    return "未评级";
  }
  const grade = archive?.bestOpeningRushGrade || getOpeningRushGrade(score).grade;
  return `${grade} ${score}/100`;
}

function getOpeningRushCoachText(rush = runStats?.openingRush) {
  if (!rush) {
    return "";
  }
  const snapshot = getOpeningRushSnapshot(rush);
  const secondsLeft = Math.max(0, Math.ceil(openingRushConfig.windowSeconds - (rush.elapsed ?? snapshot.elapsed ?? 0)));
  if (snapshot.score >= 90) {
    return `S级已达成 · ${secondsLeft}s 内继续滚连段`;
  }
  const nextMilestone = openingRushConfig.milestones.find((milestone) => !snapshot.completedIds.includes(milestone.id));
  if (!nextMilestone) {
    return `追S还差 ${Math.max(0, 90 - snapshot.score)} 分 · 继续清最近异常`;
  }
  if (nextMilestone.id === "surge") {
    const phase = runStats?.openingShowcase?.active ? runStats.openingShowcase.phase : "";
    const previewDelay = runStats?.openingSprint?.surge?.delayRemaining ?? 0;
    const routeHint = phase === "preview"
      ? `等 ${formatHookTime(previewDelay)} 接黄框落点`
      : phase === "spawned" || phase === "combat"
        ? "清黄框裂隙"
        : "准备第一波裂隙";
    return `追S：${nextMilestone.label} +${nextMilestone.score} · ${routeHint} · ${secondsLeft}s`;
  }
  const shortfall = Math.max(0, 90 - snapshot.score);
  return `追S：${nextMilestone.label} +${nextMilestone.score} · 还差 ${shortfall} 分 · ${secondsLeft}s`;
}

function getOpeningSprintProgress(step, sprint = runStats?.openingSprint) {
  if (!step || !sprint || !runStats) {
    return { value: 0, target: 1, complete: false };
  }

  let value = 0;
  if (step.metric === "events") {
    value = Math.max(0, (runStats.eventsResolved ?? 0) - (sprint.startEvents ?? 0));
  } else if (step.metric === "defeats") {
    value = Math.max(0, (runStats.enemiesDefeated ?? 0) - (sprint.startDefeats ?? 0));
  } else if (step.metric === "build") {
    value = (runStats.starterIgnition?.completed
      || (runStats.upgradesChosen?.length ?? 0) > (sprint.startUpgrades ?? 0)
      || (runStats.tempo?.rewardsClaimed ?? 0) > (sprint.startTempoRewards ?? 0))
      ? 1
      : 0;
  }

  const target = Math.max(1, Math.trunc(Number(step.target) || 1));
  return {
    value: clamp(value, 0, target),
    target,
    complete: value >= target,
  };
}

function completeOpeningSprintStep(sprint, step) {
  if (!sprint || !step || sprint.completedStepIds?.includes(step.id)) {
    return;
  }

  sprint.completedStepIds = [...(sprint.completedStepIds ?? []), step.id];
  sprint.stepIndex = Math.min(openingSprintSteps.length, (sprint.stepIndex ?? 0) + 1);
  const retryBonusBugPoints = step.id === openingSprintSteps[0]?.id
    ? clamp(Math.trunc(Number(sprint.retryBonusBugPoints) || 0), 0, 2)
    : 0;
  const rewardBugPoints = Math.max(0, Math.trunc(Number(step.rewardBugPoints) || 0)) + retryBonusBugPoints;
  player.bugPoints += rewardBugPoints;
  if (step.rewardHp > 0) {
    player.hp = clamp(player.hp + step.rewardHp, 1, player.maxHp);
  }
  if (step.rewardXp > 0) {
    addExperience(step.rewardXp);
  }

  const isFinal = sprint.completedStepIds.length >= openingSprintSteps.length;
  sprint.completed = isFinal;
  sprint.active = !isFinal;
  if (step.id === "first-anomaly") {
    completeOpeningRushMilestone("anomaly");
    activateOpeningSurgePreview(sprint);
  }
  burst(player.x, player.y, isFinal ? "#5de2d1" : "#72a5ff", isFinal ? 24 : 14);
  playAudioCue(isFinal ? "upgrade-select" : "pickup");
  const retryText = retryBonusBugPoints > 0 ? `（复盘 +${retryBonusBugPoints}）` : "";
  setLog(`${step.log} +${rewardBugPoints} bug点数${retryText}${step.rewardXp ? `，+${step.rewardXp} 经验` : ""}${step.rewardHp ? `，+${step.rewardHp} 生命` : ""}。`);
  saveRunCheckpoint(isFinal ? "opening-sprint-complete" : "opening-sprint-step");
}

function canSpawnOpeningSurge(sprint = runStats?.openingSprint) {
  const surge = sprint?.surge;
  return Boolean(sprint && surge)
    && currentChapterIndex === 0
    && chapterState?.stepIndex === 0
    && world.mode === "playing"
    && Boolean(player?.weapon)
    && !boss
    && sprint.active
    && !sprint.completed
    && surge.active
    && !surge.spawned
    && !surge.completed
    && !surge.failed;
}

function spawnOpeningSurge(sprint = runStats?.openingSprint) {
  const surge = sprint?.surge;
  if (!canSpawnOpeningSurge(sprint)) {
    return false;
  }

  const center = getOpeningSurgePreviewPoint();
  const landingPoints = getOpeningSurgeLandingPreviewPoints(center);
  let spawnedCount = 0;
  for (const [index, pattern] of openingSurgeConfig.enemyPattern.entries()) {
    const point = landingPoints[index] ?? findNearestFreePoint(center.x + pattern.dx - 260, center.y + pattern.dy, 28);
    spawnEnemyNear(point.x, point.y, pattern.type, {
      hpMultiplier: pattern.hpMultiplier,
      speedMultiplier: pattern.speedMultiplier,
      scale: pattern.scale,
      mechanicDepth: pattern.mechanicDepth ?? 0,
      openingSurge: true,
      openingSurgeIndex: index,
      openingSurgeArmTime: openingSurgeConfig.spawnGrace,
    });
    spawnedCount += 1;
  }

  surge.spawned = true;
  surge.active = true;
  surge.elapsed = 0;
  surge.delayRemaining = 0;
  surge.spawnedCount = spawnedCount;
  surge.x = center.x;
  surge.y = center.y;
  world.spawnTimer = 0;
  world.cameraShake = Math.max(world.cameraShake ?? 0, 0.12);
  burst(center.x, center.y, "#f1c15b", 26);
  playAudioCue("boss-phase");
  const retryPlan = runStats.retryPlan?.applied ? runStats.retryPlan : null;
  activateOpeningShowcase(retryPlan ? "combat" : "spawned", surge, {
    title: retryPlan ? "推荐再来实战镜头" : undefined,
    promise: retryPlan?.promise,
    screenshotFocus: retryPlan?.screenshotFocus,
    rewardText: retryPlan?.rewardText,
    callout: retryPlan ? "同屏检查：目标 / 敌群 / 特效 / 奖励" : "截图点：目标、武器、第一波敌人同屏",
    retryPlan,
  });
  setLog(`开场快递裂隙出现：${openingSurgeConfig.targetDefeats} 个低血量异常正在靠近，打穿它们就能立刻接上第一波爽点。`);
  saveRunCheckpoint("opening-surge-spawn");
  return true;
}

function applyOpeningSurgeMomentum(surge) {
  if (!surge || !player || !runStats) {
    return { tempoKicked: false, ignitionCredited: false };
  }

  let tempoKicked = false;
  if (!surge.tempoKickClaimed && openingSurgeConfig.tempoKick > 0) {
    surge.tempoKickClaimed = true;
    for (let index = 0; index < openingSurgeConfig.tempoKick; index += 1) {
      registerCombatTempoHit({
        x: surge.x ?? player.x,
        y: surge.y ?? player.y,
      });
    }
    tempoKicked = true;
  }

  let ignitionCredited = false;
  const ignition = runStats.starterIgnition;
  if (
    ignition
    && !surge.ignitionCreditClaimed
    && !ignition.completed
    && !ignition.failed
    && openingSurgeConfig.ignitionCredit > 0
  ) {
    surge.ignitionCreditClaimed = true;
    ignition.surgeCredit = clamp(
      Math.trunc(Number(ignition.surgeCredit) || 0) + openingSurgeConfig.ignitionCredit,
      0,
      3,
    );
    ignitionCredited = true;
    updateStarterIgnition(0);
  }

  return { tempoKicked, ignitionCredited };
}

function claimOpeningSurgeFirstStrike(enemy, source = "weapon") {
  const surge = runStats?.openingSprint?.surge;
  const armTime = Math.max(0, Number(enemy?.openingSurgeArmTime) || 0);
  const isPlayerAction = ["weapon", "pulse", "probe"].includes(source);
  if (
    !enemy?.openingSurge
    || !surge
    || !surge.spawned
    || surge.completed
    || surge.failed
    || surge.firstStrikeClaimed
    || armTime <= 0
    || !isPlayerAction
  ) {
    return false;
  }

  const bugReward = Math.max(0, Math.trunc(Number(openingSurgeConfig.firstStrikeBugPoints) || 0));
  const hpReward = Math.max(0, Number(openingSurgeConfig.firstStrikeHp) || 0);
  surge.firstStrikeClaimed = true;
  surge.firstStrikeAt = Math.round((surge.elapsed ?? 0) * 100) / 100;
  surge.firstStrikeSource = source;
  surge.firstStrikeEnemyIndex = Math.max(0, Math.trunc(Number(enemy.openingSurgeIndex) || 0));
  enemy.openingSurgeFirstStrike = true;
  enemy.hitFlash = Math.max(enemy.hitFlash ?? 0, 0.24);
  player.bugPoints += bugReward;
  if (hpReward > 0) {
    player.hp = clamp(player.hp + hpReward, 1, player.maxHp);
  }

  const showcase = runStats.openingShowcase;
  if (showcase?.active && ["spawned", "combat"].includes(showcase.phase)) {
    showcase.callout = "先手截击：命中窗口抢到奖励";
    showcase.rewardText = `先手 +${bugReward} bug点数${hpReward ? ` / +${hpReward} 生命` : ""}`;
    showcase.checklist = createOpeningShowcaseChecklist({
      ...showcase.checklist,
      reward: true,
      effectPulse: 0.8,
      effectLabel: "先手截击",
    });
  }

  burst(enemy.x, enemy.y, "#ffffff", 16);
  burst(enemy.x, enemy.y, "#f1c15b", 14);
  burst(player.x, player.y, "#5de2d1", 10);
  playAudioCue("pickup");
  setLog(`先手截击：在接怪窗口命中裂隙异常，+${bugReward} bug点数${hpReward ? `，+${hpReward} 生命` : ""}。`);
  saveRunCheckpoint("opening-surge-first-strike");
  return true;
}

function completeOpeningSurge(surge = runStats?.openingSprint?.surge) {
  if (!surge || surge.completed || surge.failed) {
    return;
  }

  surge.completed = true;
  surge.active = false;
  surge.defeats = Math.max(surge.defeats ?? 0, openingSurgeConfig.targetDefeats);
  player.bugPoints += Math.max(0, Math.trunc(Number(openingSurgeConfig.rewardBugPoints) || 0));
  if (openingSurgeConfig.rewardHp > 0) {
    player.hp = clamp(player.hp + openingSurgeConfig.rewardHp, 1, player.maxHp);
  }
  if (openingSurgeConfig.rewardXp > 0) {
    addExperience(openingSurgeConfig.rewardXp);
  }
  const momentum = applyOpeningSurgeMomentum(surge);
  completeOpeningRushMilestone("surge");
  world.spawnTimer = Math.min(world.spawnTimer ?? 0, 0.25);
  burst(player.x, player.y, "#f1c15b", 18);
  burst(player.x, player.y, "#72a5ff", momentum.ignitionCredited ? 18 : 10);
  playAudioCue("upgrade-select");
  const momentumText = [
    momentum.tempoKicked ? "连段补给已点亮" : "",
    momentum.ignitionCredited ? "流派启动加速" : "",
  ].filter(Boolean).join("，");
  activateOpeningShowcase("cleared", surge, {
    x: player.x,
    y: player.y,
    defeats: openingSurgeConfig.targetDefeats,
    callout: momentumText || "清场奖励已入账",
  });
  setLog(`开场快递裂隙清场：+${openingSurgeConfig.rewardBugPoints} bug点数，+${openingSurgeConfig.rewardXp} 经验${momentumText ? `，${momentumText}` : ""}。`);
  saveRunCheckpoint("opening-surge-complete");
}

function registerOpeningSurgeDefeat(enemy) {
  const surge = runStats?.openingSprint?.surge;
  if (!enemy?.openingSurge || !surge || !surge.spawned || surge.completed || surge.failed) {
    return;
  }

  surge.defeats = clamp((surge.defeats ?? 0) + 1, 0, openingSurgeConfig.targetDefeats);
  if (surge.defeats >= openingSurgeConfig.targetDefeats) {
    completeOpeningSurge(surge);
  }
}

function updateOpeningSurge(dt = 0) {
  const sprint = runStats?.openingSprint;
  const surge = sprint?.surge;
  if (!sprint || !surge || sprint.completed || !sprint.active || currentChapterIndex !== 0 || world.mode !== "playing") {
    return;
  }
  const firstStepId = openingSprintSteps[0]?.id;
  if (firstStepId && !sprint.completedStepIds?.includes(firstStepId)) {
    return;
  }

  if (!surge.spawned) {
    surge.delayRemaining = Math.max(0, (surge.delayRemaining ?? 0) - Math.max(0, dt));
    if (surge.delayRemaining <= 0) {
      spawnOpeningSurge(sprint);
    }
    return;
  }

  if (surge.completed || surge.failed) {
    return;
  }

  surge.elapsed = Math.max(0, (surge.elapsed ?? 0) + Math.max(0, dt));
  if ((surge.defeats ?? 0) >= openingSurgeConfig.targetDefeats) {
    completeOpeningSurge(surge);
    return;
  }

  if (surge.elapsed > openingSurgeConfig.timeLimit) {
    surge.failed = true;
    surge.active = false;
    setLog("开场快递裂隙超时散开，但夜巡路线仍可继续：先处理最近的异常信标。");
    saveRunCheckpoint("opening-surge-timeout");
  }
}

function updateOpeningSprint(dt = 0) {
  const sprint = runStats?.openingSprint;
  if (!sprint || sprint.completed || !sprint.active || currentChapterIndex !== 0) {
    return;
  }

  sprint.elapsed = Math.max(0, (sprint.elapsed ?? 0) + Math.max(0, dt));
  while (sprint.stepIndex < openingSprintSteps.length) {
    const step = openingSprintSteps[sprint.stepIndex];
    const progress = getOpeningSprintProgress(step, sprint);
    if (!progress.complete) {
      break;
    }
    completeOpeningSprintStep(sprint, step);
    if (world.mode !== "playing") {
      break;
    }
  }
}

function getMetaProgressionBonuses(chapterIndex = 0) {
  const steadyHeart = getMetaLevel("steady-heart");
  const warmCache = getMetaLevel("warm-cache");
  const routeShoes = getMetaLevel("route-shoes");
  const chapterInsurance = chapterIndex > 0 ? getMetaLevel("chapter-insurance") : 0;
  return {
    maxHp: steadyHeart * 8 + chapterInsurance * 8,
    bugPoints: warmCache + chapterInsurance,
    dashPower: routeShoes * 12,
  };
}

function applyMetaProgressionBonuses(chapterIndex = 0) {
  const bonuses = getMetaProgressionBonuses(chapterIndex);
  player.maxHp += bonuses.maxHp;
  player.hp = player.maxHp;
  player.bugPoints += bonuses.bugPoints;
  player.dashPower += bonuses.dashPower;
}

function getWeaponSpecializationNode(weaponId) {
  return metaProgressNodes.find((node) => node.weaponId === weaponId) ?? null;
}

function getWeaponSpecializationPreview(weapon) {
  const node = getWeaponSpecializationNode(weapon?.id);
  if (!node) {
    return null;
  }
  const level = getMetaLevel(node.id);
  const lockedText = getMetaRequirementText(node);
  return {
    node,
    level,
    lockedText,
    active: level > 0,
    text: level > 0
      ? `${node.title} Lv.${level}/${node.maxLevel} 已生效`
      : lockedText || `${node.title} 未点亮，可在档案校准中购买`,
  };
}

function applyWeaponSpecializationToWeapon(weapon) {
  const preview = getWeaponSpecializationPreview(weapon);
  const level = preview?.level ?? 0;
  if (!weapon || level <= 0) {
    return null;
  }

  if (weapon.id === "paperclip") {
    weapon.damage += level * 3;
    weapon.trait.damageMultiplier = (weapon.trait.damageMultiplier ?? 1.85) + level * 0.12;
    weapon.trait.every = Math.max(2, (weapon.trait.every ?? 4) - (level >= 3 ? 1 : 0));
    weapon.level += level * 0.18;
    return `回形针专精 Lv.${level}：伤害和精准弹已校准。`;
  }

  if (weapon.id === "keyboard") {
    weapon.cooldown = clamp(weapon.cooldown * (1 - level * 0.04), 0.12, weapon.cooldown);
    weapon.range += level * 18;
    weapon.trait.force = (weapon.trait.force ?? 18) + level * 5;
    weapon.level += level * 0.18;
    return `键盘宏专精 Lv.${level}：覆盖频率和击退已校准。`;
  }

  if (weapon.id === "correction-fluid") {
    weapon.range += level * 22;
    weapon.damage += level;
    weapon.trait.duration = (weapon.trait.duration ?? 0.85) + level * 0.14;
    weapon.trait.factor = Math.max(0.4, (weapon.trait.factor ?? 0.55) - level * 0.03);
    weapon.level += level * 0.18;
    return `修正液专精 Lv.${level}：射程和减速已校准。`;
  }

  return null;
}

function cloneForSave(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
  } catch {
    return fallback;
  }
}

function serializeBugNode(node) {
  return {
    x: node.x,
    y: node.y,
    radius: node.radius,
    interactRadius: node.interactRadius,
    pulse: node.pulse,
    animPhase: node.animPhase,
    eventId: node.event?.id,
    chapterStep: node.chapterStep,
  };
}

function restoreBugNode(node) {
  const event = node.eventId ? getEventById(node.eventId) : bugEvents[0];
  const safePoint = findNearestFreePoint(node.x ?? 160, node.y ?? 160, node.interactRadius ?? 42);
  return {
    x: safePoint.x,
    y: safePoint.y,
    radius: node.radius ?? 17,
    interactRadius: node.interactRadius ?? 54,
    pulse: node.pulse ?? random(0, Math.PI * 2),
    animPhase: node.animPhase ?? random(0, Math.PI * 2),
    event,
    chapterStep: node.chapterStep ?? chapterState?.stepIndex ?? -1,
  };
}

function loadRunSave() {
  try {
    const saved = readPlatformJson(RUN_SAVE_STORAGE_KEY, null);
    if (!saved || saved.version !== RUN_SAVE_VERSION || !saved.player || !saved.chapterState) {
      return null;
    }
    const chapterIndex = clamp(Number(saved.currentChapterIndex) || 0, 0, chapters.length - 1);
    return { ...saved, currentChapterIndex: chapterIndex };
  } catch {
    return null;
  }
}

function saveRunCheckpoint(reason = "auto") {
  if (isStoreShotMode) {
    return;
  }
  if (!player || !chapterState || !runStats || world.mode === "menu" || world.mode === "result") {
    return;
  }

  const save = {
    version: RUN_SAVE_VERSION,
    savedAt: Date.now(),
    reason,
    currentChapterIndex,
    nextUpgradeAt,
    objective: getCurrentObjectiveText(),
    player: cloneForSave(player, {}),
    chapterState: cloneForSave(chapterState, {}),
    runStats: cloneForSave(runStats, {}),
    bugNodes: bugNodes.map(serializeBugNode),
    bugPickups: cloneForSave(bugPickups, []),
    enemies: cloneForSave(enemies, []),
    cleaners: cloneForSave(cleaners, []),
    boss: cloneForSave(boss, null),
    protocolHazards: cloneForSave(protocolHazards, []),
    enemyHazards: cloneForSave(enemyHazards, []),
    world: {
      spawnTimer: world.spawnTimer,
      pulseCooldown: world.pulseCooldown,
      dashCooldown: world.dashCooldown,
      allyAssistCooldown: world.allyAssistCooldown,
      mapHazardCooldown: world.mapHazardCooldown,
      enemyLogCooldown: world.enemyLogCooldown,
    },
  };

  try {
    writePlatformJson(RUN_SAVE_STORAGE_KEY, save);
  } catch {
    // A full storage quota should never break the run itself.
  }
}

function deleteRunSave() {
  if (isStoreShotMode) {
    return;
  }
  try {
    removePlatformJson(RUN_SAVE_STORAGE_KEY);
  } catch {
    // Ignore unavailable local storage.
  }
}

function getCurrentObjectiveText() {
  if (boss && boss.hp > 0) {
    return currentChapter().boss?.objective ?? "击败本章 Boss";
  }
  const step = currentChapter().steps?.[chapterState?.stepIndex ?? -1];
  return step?.objective ?? currentChapter().initialObjective ?? "继续夜巡";
}

function restoreRunSave(save) {
  if (!save) {
    setLog("没有找到可继续的跑局存档。");
    openStartMenu();
    return;
  }

  archiveState = loadArchive();
  currentChapterIndex = save.currentChapterIndex;
  runStats = {
    ...createRunStats(),
    ...cloneForSave(save.runStats, {}),
    upgradesChosen: cloneForSave(save.runStats?.upgradesChosen, []),
    relicsChosen: cloneForSave(save.runStats?.relicsChosen, []),
    conceptsChosen: cloneForSave(save.runStats?.conceptsChosen, []),
    synergiesUnlocked: cloneForSave(save.runStats?.synergiesUnlocked, []),
    mapInteractivesActivated: cloneForSave(save.runStats?.mapInteractivesActivated, []),
    deviceGuide: normalizeDeviceGuideState(save.runStats?.deviceGuide),
    retryBoost: normalizeRetryBoost(save.runStats?.retryBoost),
    retryPlan: normalizeRetryPlan(save.runStats?.retryPlan),
    openingRush: normalizeOpeningRushState(save.runStats?.openingRush),
    openingShowcase: normalizeOpeningShowcaseState(save.runStats?.openingShowcase),
    chapterShowcase: normalizeChapterShowcaseState(save.runStats?.chapterShowcase),
    fairWarning: normalizeFairWarningState(save.runStats?.fairWarning),
    distanceTraveled: Math.max(0, Number(save.runStats?.distanceTraveled) || 0),
    tempo: normalizeCombatTempoState(save.runStats?.tempo),
  };
  runStats.activeHook = normalizeNightHookState(save.runStats?.activeHook, currentChapterIndex);
  runStats.openingSprint = normalizeOpeningSprintState(save.runStats?.openingSprint);
  runStats.starterBuild = getStarterBuildById(save.runStats?.starterBuild)?.id ?? null;
  runStats.starterIgnition = normalizeStarterIgnitionState(save.runStats?.starterIgnition, runStats.starterBuild);
  player = {
    ...playerBase,
    ...cloneForSave(save.player, {}),
    relics: cloneForSave(save.player?.relics, []),
    concepts: cloneForSave(save.player?.concepts, {}),
    unlockedSynergies: cloneForSave(save.player?.unlockedSynergies, []),
  };
  player.hp = clamp(player.hp, 1, player.maxHp);
  chapterState = {
    ...createChapterState(),
    ...cloneForSave(save.chapterState, {}),
    allies: cloneForSave(save.chapterState?.allies, []),
    echoesCollected: cloneForSave(save.chapterState?.echoesCollected, []),
    mapCachesCollected: cloneForSave(save.chapterState?.mapCachesCollected, []),
    mapInteractivesActivated: cloneForSave(save.chapterState?.mapInteractivesActivated, []),
  };
  chapterState.chapterIndex = currentChapterIndex;
  nextUpgradeAt = Math.max(2, Number(save.nextUpgradeAt) || 2);
  runPanelSignature = "";
  syncWorldToCurrentMap();
  const safePlayer = findNearestFreePoint(player.x, player.y, player.radius ?? playerBase.radius);
  player.x = safePlayer.x;
  player.y = safePlayer.y;
  bugNodes = cloneForSave(save.bugNodes, []).map(restoreBugNode);
  enemies = cloneForSave(save.enemies, []);
  cleaners = cloneForSave(save.cleaners, []);
  boss = cloneForSave(save.boss, null);
  if (boss && boss.hp <= 0) {
    boss = null;
  }
  protocolHazards = cloneForSave(save.protocolHazards, []);
  enemyHazards = cloneForSave(save.enemyHazards, []);
  bugPickups = cloneForSave(save.bugPickups, []);
  bullets = [];
  particles = [];
  activeEvent = null;
  storyState = null;
  world.mode = "playing";
  world.spawnTimer = save.world?.spawnTimer ?? 0;
  world.pulseCooldown = save.world?.pulseCooldown ?? 0;
  world.dashCooldown = save.world?.dashCooldown ?? 0;
  world.allyAssistCooldown = save.world?.allyAssistCooldown ?? 0;
  world.mapHazardCooldown = save.world?.mapHazardCooldown ?? 0;
  world.enemyLogCooldown = save.world?.enemyLogCooldown ?? 0;
  world.cameraShake = 0;
  world.saveCooldown = 6;
  centerCameraOnPlayer();
  hidePanels();

  if (!player.weapon) {
    setLog("跑局存档缺少武器信息，已回到武器选择。");
    openWeaponSelect();
    return;
  }

  if (chapterState.stepIndex < 0 && currentChapter().opening) {
    setChapterObjective(currentChapter().initialObjective ?? "继续夜巡");
    setLog(`已继续存档：${currentChapter().title}。`);
    syncHud();
    openStory(currentChapter().opening);
    saveRunCheckpoint("resume-opening");
    return;
  }

  if (!bugNodes.length && !boss && !chapterState.finished && chapterState.stepIndex >= 0) {
    resumeChapterStep();
  }

  setChapterObjective(getCurrentObjectiveText());
  setLog(`已继续存档：${currentChapter().title}。`);
  syncHud();
  saveRunCheckpoint("resume");
}

function recordChapterProgress(clearedChapterIndex) {
  const nextChapterIndex = Math.min(clearedChapterIndex + 1, chapters.length - 1);
  archiveState.bestChapter = Math.max(archiveState.bestChapter ?? 1, Math.min(clearedChapterIndex + 2, chapters.length));
  if (!archiveState.unlockedChapters.includes(nextChapterIndex)) {
    archiveState.unlockedChapters.push(nextChapterIndex);
  }
  archiveState.lastBuild = getBuildSummary();
  saveArchive();
}

function chooseReviewStarterBuild(victory) {
  if (victory) {
    return getStarterBuildById("precision-breakpoint") ?? starterBuilds[0] ?? null;
  }
  if ((runStats?.damageTaken ?? 0) >= 110 || player.hp <= Math.ceil(player.maxHp * 0.34)) {
    return getStarterBuildById("close-control") ?? starterBuilds[0] ?? null;
  }
  if ((runStats?.tempo?.bestStreak ?? 0) < combatTempoConfig.rewardEvery) {
    return getStarterBuildById("queue-barrage") ?? starterBuilds[0] ?? null;
  }
  return getStarterBuildById("precision-breakpoint") ?? starterBuilds[0] ?? null;
}

function createReviewRetryBoost(victory, build, pressureTitle = "") {
  if (victory) {
    return null;
  }

  if (build?.id === "close-control" || pressureTitle.includes("伤害") || pressureTitle.includes("回放")) {
    return normalizeRetryBoost({
      id: "shielded-second-night",
      title: "护盾起步",
      summary: "下一把开局 +10 生命 / +1 bug点数，第一处异常再额外 +1 bug点数。",
      log: "复盘助推：护盾起步生效，先补一点容错，再把第一处异常变成更厚的开局资源。",
      bonusHp: 10,
      bonusBugPoints: 1,
      openingTargetBonusBugPoints: 1,
    });
  }

  if (build?.id === "queue-barrage" || pressureTitle.includes("连段")) {
    return normalizeRetryBoost({
      id: "tempo-warm-start",
      title: "连段预热",
      summary: "下一把开局 +2 bug点数，第一处异常额外 +1 bug点数，方便更快滚起第一波补给。",
      log: "复盘助推：连段预热生效，开局资源已经垫高，先把第一波打穿。",
      bonusBugPoints: 2,
      openingTargetBonusBugPoints: 1,
    });
  }

  if (pressureTitle.includes("装置")) {
    return normalizeRetryBoost({
      id: "device-route-hint",
      title: "装置路线补给",
      summary: "下一把开局 +1 bug点数 / +6 生命，先靠地图指针吃到章节装置。",
      log: "复盘助推：装置路线补给生效，开局先稳住，再去追最近的互动标记。",
      bonusHp: 6,
      bonusBugPoints: 1,
    });
  }

  return normalizeRetryBoost({
    id: "breakpoint-retry-cache",
    title: "断点校准",
    summary: "下一把开局 +1 bug点数 / +6 生命，给推荐流派多一次试错空间。",
    log: "复盘助推：断点校准生效，上一把的复盘已经换成这次的起手资源。",
    bonusHp: 6,
    bonusBugPoints: 1,
  });
}

function createReviewRetryPlan(victory, build, retryBoost = null, pressureTitle = "") {
  const safeBuild = build ?? starterBuilds[0] ?? null;
  if (!safeBuild) {
    return null;
  }
  const weapon = getWeaponById(safeBuild.weaponId) ?? weaponDefinitions[0] ?? {};
  const boostTitle = retryBoost?.title ? `${retryBoost.title} + ` : "";
  const base = {
    starterBuildId: safeBuild.id,
    openingSurgeDelayMultiplier: victory ? 1 : 0.72,
    starterIgnitionCredit: victory ? 0 : 1,
  };

  if (victory) {
    return normalizeRetryPlan({
      ...base,
      id: "clean-victory-route",
      title: "低伤截图路线",
      promise: "保留通关档案，下一把追求低伤、未收集回声和更好商店截图。",
      firstGoal: "先处理首个异常，再把快递裂隙拉进武器特效范围内清场。",
      rewardText: "低伤目标、回声档案和首波特效截图会变成下一轮展示重点。",
      screenshotFocus: "低伤 HUD、Boss 地标和武器命中特效同时可见。",
      log: "复盘路线已带入：这把优先追低伤截图和未收集档案。",
    });
  }

  if (safeBuild.id === "close-control" || pressureTitle.includes("伤害") || pressureTitle.includes("回放")) {
    return normalizeRetryPlan({
      ...base,
      id: "control-second-night-route",
      title: "30秒止损路线",
      promise: `${boostTitle}${weapon.name ?? "修正液"}开局，先用减速把贴脸怪拆开，再吃首个异常的复盘加成。`,
      firstGoal: "处理首个异常 -> 用雾化减速清裂隙 -> 触发控场超频",
      rewardText: "开局生命、首异常加成和修正液超频会合并成容错窗口。",
      screenshotFocus: "雾化命中特效、低血安全提示和第一波裂隙清场同屏。",
      log: "复盘路线已带入：30秒止损路线生效，先处理首个异常，再用修正液控住裂隙。",
    });
  }

  if (safeBuild.id === "queue-barrage" || pressureTitle.includes("连段")) {
    return normalizeRetryPlan({
      ...base,
      id: "barrage-combo-route",
      title: "30秒连段路线",
      promise: `${boostTitle}${weapon.name ?? "键盘宏"}开局，第一波按键弹铺安全区，优先把连段补给点亮。`,
      firstGoal: "处理首个异常 -> 把裂隙怪压在屏幕外 -> 点亮连段补给",
      rewardText: "复盘 bug点数、连段奖励和键盘超频会更早叠到一起。",
      screenshotFocus: "按键弹幕、连段条和裂隙清场奖励同时入镜。",
      log: "复盘路线已带入：30秒连段路线生效，先用键盘弹幕把第一波压出去。",
    });
  }

  if (pressureTitle.includes("装置")) {
    return normalizeRetryPlan({
      ...base,
      id: "device-first-route",
      title: "30秒装置路线",
      promise: `${boostTitle}${weapon.name ?? "初始武器"}开局，先追最近互动标记，把地图装置转成战斗收益。`,
      firstGoal: "处理首个异常 -> 跟随装置箭头 -> 用装置奖励接第一波",
      rewardText: "地图装置、复盘补给和开场牵引会连成一条探索收益线。",
      screenshotFocus: "互动装置箭头、地图地标和第一波敌人同时可读。",
      log: "复盘路线已带入：30秒装置路线生效，先追最近互动标记。",
    });
  }

  return normalizeRetryPlan({
    ...base,
    id: "breakpoint-first-wave-route",
    title: "30秒断点路线",
    promise: `${boostTitle}${weapon.name ?? "回形针"}开局，先点掉最快的裂隙怪，第一波就看见断点爆发。`,
    firstGoal: "处理首个异常 -> 点杀快递裂隙 -> 拿精准弹超频",
    rewardText: "复盘补给、首波清场和回形针精准弹会形成第一把节奏。",
    screenshotFocus: "断点火花、目标罗盘和裂隙奖励同时入镜。",
    log: "复盘路线已带入：30秒断点路线生效，优先点掉最快的裂隙怪。",
  });
}

function applyRetryPlan(plan) {
  const normalized = normalizeRetryPlan(plan);
  if (!normalized || !player || !runStats || runStats.retryPlan?.applied) {
    return null;
  }

  runStats.retryPlan = {
    ...normalized,
    applied: true,
    appliedAt: Date.now(),
  };
  const surge = runStats.openingSprint?.surge;
  if (surge && normalized.openingSurgeDelayMultiplier < 1) {
    surge.delayRemaining = Math.max(0.18, (surge.delayRemaining ?? openingSurgeConfig.spawnDelay) * normalized.openingSurgeDelayMultiplier);
  }
  if (runStats.starterIgnition && normalized.starterIgnitionCredit > 0) {
    runStats.starterIgnition.surgeCredit = clamp(
      Math.trunc(Number(runStats.starterIgnition.surgeCredit) || 0) + normalized.starterIgnitionCredit,
      0,
      3,
    );
  }
  activateOpeningShowcase("retry", surge, {
    title: "推荐再来 30 秒路线",
    promise: normalized.promise,
    screenshotFocus: normalized.screenshotFocus,
    rewardText: normalized.rewardText,
    callout: normalized.title,
    x: player.x,
    y: player.y,
    radius: 204,
    retryPlan: normalized,
  });
  completeOpeningRushMilestone("retry-route");
  setLog(normalized.log);
  saveRunCheckpoint("retry-plan");
  return runStats.retryPlan;
}

function applyRetryBoost(boost) {
  const normalized = normalizeRetryBoost(boost);
  if (!normalized || !player || !runStats || runStats.retryBoost?.applied) {
    return null;
  }

  if (normalized.bonusBugPoints > 0) {
    player.bugPoints += normalized.bonusBugPoints;
  }
  if (normalized.bonusHp > 0) {
    player.hp = clamp(player.hp + normalized.bonusHp, 1, player.maxHp);
  }
  if (runStats.openingSprint && normalized.openingTargetBonusBugPoints > 0) {
    runStats.openingSprint.retryBonusBugPoints = normalized.openingTargetBonusBugPoints;
  }

  runStats.retryBoost = {
    ...normalized,
    applied: true,
    appliedAt: Date.now(),
  };
  burst(player.x, player.y, "#f1c15b", 16);
  burst(player.x, player.y, "#5de2d1", 12);
  playAudioCue("pickup");
  setLog(normalized.log);
  saveRunCheckpoint("retry-boost");
  return runStats.retryBoost;
}

function createFailureReplay(victory, pressureTitle = "") {
  if (victory || !runStats) {
    return null;
  }
  const warning = normalizeFairWarningState(runStats.fairWarning);
  const lethalHit = warning.lethalHit ?? warning.lastHit;
  const lastCue = warning.lastCue;
  if (!lethalHit && !lastCue && (runStats.damageTaken ?? 0) <= 0) {
    return null;
  }

  const source = String(lethalHit?.message || lastCue?.message || pressureTitle || "未知伤害")
    .replace(/[。.!！]+$/u, "");
  const amountText = lethalHit ? `${lethalHit.amount} 点伤害` : `${Math.round(runStats.damageTaken ?? 0)} 点累计伤害`;
  const warningText = warning.warningCount > 0
    ? `已触发 ${warning.warningCount} 次生命预警、${warning.safetyWindowCount} 次短暂无敌。`
    : "本局没有来得及触发生命预警，说明最后一段爆发需要更早拉开距离。";
  const hpText = lethalHit
    ? `生命 ${lethalHit.hpBefore} -> ${Math.max(0, lethalHit.hpAfter)}。`
    : "";
  const counter = lastCue?.hint
    ? `${lastCue.hint} 下一把按推荐路线先拿容错，再清第一波裂隙。`
    : "下一把按推荐路线先拿容错，优先留闪避处理红色危险区。";

  return normalizeFailureReplay({
    title: source.includes("红色") || source.includes("危险") ? "危险区命中回放" : "伤害回放已记录",
    summary: `最后记录：${source}，${amountText}。${hpText}${warningText}`,
    counter,
    lethalHit,
    lastCue,
    warningCount: warning.warningCount,
    safetyWindowCount: warning.safetyWindowCount,
  });
}

function createRunReview(victory) {
  const bestStreak = runStats?.tempo?.bestStreak ?? 0;
  const eventsResolved = runStats?.eventsResolved ?? 0;
  const defeats = runStats?.enemiesDefeated ?? 0;
  const openingComplete = Boolean(runStats?.openingSprint?.completed);
  const starterComplete = Boolean(runStats?.starterIgnition?.completed);
  const openingRush = getOpeningRushSnapshot(runStats?.openingRush);
  const deviceCount = runStats?.mapInteractivesActivated?.length ?? 0;
  const build = chooseReviewStarterBuild(victory);
  const weapon = getWeaponById(build?.weaponId);

  let highlightTitle = "第一条路线已接通";
  let highlightText = openingComplete
    ? "开场牵引链完整完成，玩家已经经历了目标、击破和构筑成型。"
    : `本局处理 ${eventsResolved} 个异常、击破 ${defeats} 个实体，已经留下局外收益。`;
  if (openingRush.score >= 90) {
    highlightTitle = openingRush.gradeTitle;
    highlightText = openingRush.gradeText;
  } else if (starterComplete) {
    highlightTitle = "流派已经起火";
    highlightText = "推荐流派完成启动超频，下一把可以直接围绕它拿强化。";
  } else if (openingRush.score >= 75) {
    highlightTitle = openingRush.gradeTitle;
    highlightText = openingRush.gradeText;
  } else if (deviceCount > 0) {
    highlightTitle = `装置启动 x${deviceCount}`;
    highlightText = "本局已经把地图装置转化成战斗收益，探索路线开始反哺构筑节奏。";
  } else if (bestStreak >= combatTempoConfig.rewardEvery) {
    highlightTitle = `连段 x${bestStreak}`;
    highlightText = "战斗节奏已经点亮，保持移动就能把补给滚起来。";
  }

  let pressureTitle = "先追最近信标";
  let pressureText = "下一把优先跟着右侧目标和地图指针走，别在开场走廊里被刷怪拖住。";
  if ((runStats?.damageTaken ?? 0) >= 110) {
    pressureTitle = "伤害吃得偏多";
    pressureText = "把闪避留给红色危险区和冲刺怪，先用控场流换更多容错。";
  } else if (currentChapterIndex > 0 && deviceCount <= 0) {
    pressureTitle = "装置还没吃到";
    pressureText = "第二章以后留意地图上的“互动”标记，靠近一次就能换冷却、回复或削弱窗口。";
  } else if (bestStreak < combatTempoConfig.rewardEvery) {
    pressureTitle = "连段还没滚起来";
    pressureText = `尽量把击破间隔压进 ${combatTempoConfig.window.toFixed(1)} 秒窗口，先吃到第一份连段补给。`;
  } else if (openingRush.score < 55) {
    pressureTitle = "开场没串起来";
    pressureText = "下一把 30 秒内优先完成首个异常、清掉快递裂隙，再把推荐流派超频点亮。";
  } else if (!starterComplete) {
    pressureTitle = "构筑差一步成型";
    pressureText = "按推荐流派目标打完第一波，武器会获得一次明显超频。";
  }

  const failureReplay = createFailureReplay(victory, pressureTitle);
  if (failureReplay) {
    pressureTitle = failureReplay.title;
    pressureText = `${failureReplay.summary} ${failureReplay.counter}`;
  }

  const nextTitle = victory ? "挑战低伤通关" : `推荐再来：${build?.title ?? "推荐流派"}`;
  const nextText = victory
    ? "已经通关，下一把用同一套路线追低伤、未收集回声和更清晰的截图。"
    : `${weapon?.name ?? "初始武器"}开局，前 30 秒只做三件事：首个异常、快递裂隙、流派超频。`;
  const retryBoost = createReviewRetryBoost(victory, build, pressureTitle);
  const retryPlan = createReviewRetryPlan(victory, build, retryBoost, pressureTitle);

  return {
    outcome: victory ? "victory" : "defeat",
    chapterTitle: currentChapter().title,
    highlightTitle,
    highlightText,
    pressureTitle,
    pressureText,
    nextTitle,
    nextText,
    recommendedStarterBuildId: build?.id ?? null,
    retryBoost,
    retryPlan,
    failureReplay,
    openingRush,
    at: Date.now(),
  };
}

function recordRunEnd(victory) {
  deleteRunSave();
  const shardReward = calculateRunShardReward(victory);
  archiveState.runs = (archiveState.runs ?? 0) + 1;
  archiveState.wins = (archiveState.wins ?? 0) + (victory ? 1 : 0);
  archiveState.bestChapter = Math.max(archiveState.bestChapter ?? 1, currentChapterIndex + 1);
  archiveState.totalEnemiesDefeated = (archiveState.totalEnemiesDefeated ?? 0) + (runStats?.enemiesDefeated ?? 0);
  archiveState.totalEventsResolved = (archiveState.totalEventsResolved ?? 0) + (runStats?.eventsResolved ?? 0);
  archiveState.bestTempoStreak = Math.max(archiveState.bestTempoStreak ?? 0, runStats?.tempo?.bestStreak ?? 0);
  recordOpeningRushInArchive(runStats?.openingRush);
  archiveState.lastBuild = getBuildSummary();
  archiveState.lastRunReview = createRunReview(victory);
  grantCalibrationShards(shardReward, victory ? "五章通关奖励" : `${currentChapter().title} 结算`);
  if (victory) {
    unlockLocalAchievement("ACH_FULL_CLEAR");
    if ((runStats?.damageTaken ?? 0) <= 80) {
      unlockLocalAchievement("ACH_LOW_DAMAGE_CLEAR");
    }
  }
  saveArchive();
}

function createChapterState(allies = []) {
  return {
    chapterIndex: currentChapterIndex,
    stepIndex: -1,
    resolvedInStep: 0,
    resolvedTotal: 0,
    allies: [...new Set(allies)],
    echoesCollected: [],
    mapCachesCollected: [],
    mapInteractivesActivated: [],
    bossCleared: false,
    finished: false,
  };
}

function resetGame(chapterIndex = 0) {
  startNewRun(Number.isFinite(chapterIndex) ? chapterIndex : 0);
}

function getStarterBuildById(id) {
  return starterBuilds.find((build) => build.id === id) ?? null;
}

function getStarterBuildForWeaponId(weaponId) {
  return starterBuilds.find((build) => build.weaponId === weaponId) ?? null;
}

function getWeaponById(id) {
  return weaponDefinitions.find((weapon) => weapon.id === id) ?? null;
}

function getWeaponOpeningHook(weapon) {
  if (!weapon?.id) {
    return null;
  }
  return weaponOpeningHooks[weapon.id] ?? null;
}

function applyStarterBuildForWeaponChoice(weapon) {
  if (!runStats || currentChapterIndex !== 0 || runStats.starterBuild || !weapon?.id) {
    return null;
  }
  const build = getStarterBuildForWeaponId(weapon.id);
  if (!build) {
    return null;
  }
  runStats.starterBuild = build.id;
  runStats.starterIgnition = createStarterIgnitionState(build);
  return build;
}

function createStarterIgnitionState(build) {
  if (!build?.id) {
    return null;
  }
  const ignition = build.ignition ?? {};
  return {
    id: build.id,
    startDefeats: runStats?.enemiesDefeated ?? 0,
    defeats: 0,
    targetDefeats: Math.max(1, Math.trunc(Number(ignition.targetDefeats) || 4)),
    elapsed: 0,
    timeLimit: Math.max(12, Number(ignition.timeLimit) || 40),
    completed: false,
    failed: false,
    rewardClaimed: false,
    overclockApplied: false,
    surgeCredit: 0,
    overclockText: ignition.overclockText ?? "",
  };
}

function normalizeStarterIgnitionState(savedIgnition, starterBuildId = null) {
  if (!savedIgnition || typeof savedIgnition !== "object") {
    return null;
  }
  const build = getStarterBuildById(savedIgnition.id) ?? getStarterBuildById(starterBuildId);
  if (!build) {
    return null;
  }
  const fallback = createStarterIgnitionState(build) ?? {};
  return {
    ...fallback,
    ...savedIgnition,
    id: build.id,
    startDefeats: Math.max(0, Math.trunc(Number(savedIgnition.startDefeats) || 0)),
    defeats: Math.max(0, Math.trunc(Number(savedIgnition.defeats) || 0)),
    targetDefeats: Math.max(1, Math.trunc(Number(savedIgnition.targetDefeats ?? fallback.targetDefeats) || fallback.targetDefeats || 4)),
    elapsed: Math.max(0, Number(savedIgnition.elapsed) || 0),
    timeLimit: Math.max(12, Number(savedIgnition.timeLimit ?? fallback.timeLimit) || fallback.timeLimit || 40),
    completed: Boolean(savedIgnition.completed),
    failed: Boolean(savedIgnition.failed),
    rewardClaimed: Boolean(savedIgnition.rewardClaimed),
    overclockApplied: Boolean(savedIgnition.overclockApplied),
    surgeCredit: clamp(Math.trunc(Number(savedIgnition.surgeCredit) || 0), 0, 3),
    overclockText: typeof savedIgnition.overclockText === "string" ? savedIgnition.overclockText : (fallback.overclockText ?? ""),
  };
}

function refreshStarterIgnitionProgress(ignition = runStats?.starterIgnition) {
  if (!ignition || !runStats) {
    return null;
  }
  const build = getStarterBuildById(ignition.id);
  if (!build) {
    return null;
  }
  const surgeCredit = clamp(Math.trunc(Number(ignition.surgeCredit) || 0), 0, 3);
  ignition.defeats = Math.max(0, (runStats.enemiesDefeated ?? 0) - (ignition.startDefeats ?? 0) + surgeCredit);
  return { ignition, build };
}

function getStarterIgnitionText(ignition = runStats?.starterIgnition) {
  const state = refreshStarterIgnitionProgress(ignition);
  if (!state) {
    return "";
  }
  const remaining = Math.max(0, Math.ceil((state.ignition.timeLimit ?? 0) - (state.ignition.elapsed ?? 0)));
  return `击破 ${Math.min(state.ignition.defeats, state.ignition.targetDefeats)}/${state.ignition.targetDefeats} · ${remaining}s`;
}

function applyStarterOverclock(ignition, build) {
  if (!player.weapon || !ignition || !build || ignition.overclockApplied) {
    return "";
  }
  const overclock = build.ignition?.overclock ?? [];
  for (const upgrade of overclock) {
    modifyWeapon(upgrade);
  }
  if (overclock.length > 0) {
    player.weapon.level += 0.35;
  }
  ignition.overclockApplied = overclock.length > 0;
  ignition.overclockText = build.ignition?.overclockText ?? "";
  return ignition.overclockText;
}

function completeStarterIgnition(ignition, build) {
  if (!ignition || !build || ignition.completed || ignition.failed) {
    return;
  }
  const reward = build.ignition ?? {};
  ignition.completed = true;
  ignition.rewardClaimed = true;
  player.bugPoints += Math.max(0, Math.trunc(Number(reward.rewardBugPoints) || 0));
  player.hp = clamp(player.hp + Math.max(0, Number(reward.rewardHp) || 0), 1, player.maxHp);
  const xpReward = Math.max(0, Math.trunc(Number(reward.rewardXp) || 0));
  if (xpReward > 0) {
    addExperience(xpReward);
  }
  const overclockText = applyStarterOverclock(ignition, build);
  completeOpeningRushMilestone("overclock");
  burst(player.x, player.y, "#f1c15b", 22);
  burst(player.x, player.y, "#5de2d1", 18);
  playAudioCue("upgrade-select");
  setLog(`${reward.completeLog ?? `${build.title}启动完成。`} ${overclockText ? `${overclockText} ` : ""}+${reward.rewardBugPoints ?? 0} bug点数，+${xpReward} 经验。`);
  saveRunCheckpoint("starter-ignition-complete");
}

function updateStarterIgnition(dt = 0) {
  const state = refreshStarterIgnitionProgress();
  if (!state || state.ignition.completed || state.ignition.failed) {
    return;
  }
  const { ignition, build } = state;
  ignition.elapsed = Math.max(0, (ignition.elapsed ?? 0) + Math.max(0, dt));
  if (ignition.defeats >= ignition.targetDefeats) {
    completeStarterIgnition(ignition, build);
    return;
  }
  if (ignition.elapsed > ignition.timeLimit) {
    ignition.failed = true;
  }
}

function startNewRun(chapterIndex = 0, options = {}) {
  playAudioCue("run-start");
  deleteRunSave();
  archiveState = loadArchive();
  runStats = createRunStats();
  player = { ...playerBase };
  player.relics = [];
  player.concepts = {};
  player.unlockedSynergies = [];
  currentChapterIndex = clamp(chapterIndex, 0, chapters.length - 1);
  applyMetaProgressionBonuses(currentChapterIndex);
  positionPlayerAtMapStart();
  bugNodes = [];
  enemies = [];
  particles = [];
  bullets = [];
  bugPickups = [];
  cleaners = [];
  boss = null;
  protocolHazards = [];
  enemyHazards = [];
  activeEvent = null;
  nextUpgradeAt = 2;
  runPanelSignature = "";
  chapterState = createChapterState();
  world.mode = "playing";
  world.animTime = 0;
  world.spawnTimer = 0;
  world.pulseCooldown = 0;
  world.dashCooldown = 0;
  world.allyAssistCooldown = 0;
  world.mapHazardCooldown = 0;
  world.enemyLogCooldown = 0;
  world.cameraShake = 0;
  world.saveCooldown = 6;
  hidePanels();
  storyState = null;
  runStats.openingSprint = createOpeningSprintState();
  seedOfficeBugPickups();
  setChapterObjective(currentChapter().initialObjective ?? "调查办公室异常");
  setLog(currentChapter().startLog ?? "凌晨 03:32，安渡从键盘上醒来。手机显示：外卖订单已超时 999 分钟。");
  activateNightHookForChapter(currentChapterIndex);
  evaluateRunAchievements("run_start");
  syncHud();
  const starterBuild = getStarterBuildById(options.starterBuildId);
  if (starterBuild) {
    const weapon = getWeaponById(starterBuild.weaponId) ?? weaponDefinitions[0];
    if (weapon) {
      equipWeapon(weapon);
      runStats.starterBuild = starterBuild.id;
      runStats.starterIgnition = createStarterIgnitionState(starterBuild);
      setLog(`${starterBuild.log} ${starterBuild.perkText}`);
      applyRetryBoost(options.retryBoost);
      applyRetryPlan(options.retryPlan);
      saveRunCheckpoint("starter-build");
      openStory(currentChapter().opening);
      return;
    }
  }
  applyRetryBoost(options.retryBoost);
  applyRetryPlan(options.retryPlan);
  openWeaponSelect();
}

function bootGame() {
  gameSettings = loadGameSettings();
  audioSystem = createAudioSystem();
  syncAudioSettings();
  gamepadState = createGamepadState();
  archiveState = loadArchive();
  runStats = createRunStats();
  player = { ...playerBase };
  player.relics = [];
  player.concepts = {};
  player.unlockedSynergies = [];
  currentChapterIndex = 0;
  bugNodes = [];
  enemies = [];
  particles = [];
  bullets = [];
  bugPickups = [];
  cleaners = [];
  boss = null;
  protocolHazards = [];
  enemyHazards = [];
  activeEvent = null;
  nextUpgradeAt = 2;
  runPanelSignature = "";
  chapterState = createChapterState();
  world.mode = "menu";
  world.animTime = 0;
  world.spawnTimer = 0;
  world.pulseCooldown = 0;
  world.dashCooldown = 0;
  world.allyAssistCooldown = 0;
  world.mapHazardCooldown = 0;
  world.enemyLogCooldown = 0;
  world.cameraShake = 0;
  world.saveCooldown = 6;
  positionPlayerAtMapStart();
  storyState = null;
  setChapterObjective("选择夜巡档案");
  syncHud();
  syncSystemControls();
  openStartMenu();
  if (isStoreShotMode) {
    configureStoreShotMode();
  } else {
    applyStartupFullscreenPreference();
  }
}

function createStoreArchiveState() {
  return {
    ...createArchiveFallback(),
    bestChapter: chapters.length,
    wins: 3,
    runs: 18,
    totalEnemiesDefeated: 1286,
    totalEventsResolved: 94,
    unlockedChapters: chapters.map((_, index) => index),
    lastBuild: "键盘宏飞弹 + 队列自动机 + 哈希弱点表",
    calibrationShards: 42,
    totalCalibrationEarned: 168,
    completedNightHooks: ["delivery-save-90", "metro-fast-line"],
    nightHookCompletions: 7,
    bestTempoStreak: 18,
    bestOpeningRushScore: 92,
    bestOpeningRushGrade: "S",
    bestOpeningRushAt: Date.now(),
    lastOpeningRush: normalizeOpeningRushArchive({
      score: 92,
      grade: "S",
      elapsed: 24,
      completedIds: ["anomaly", "surge", "overclock"],
      at: Date.now(),
    }),
    discoveredEchoes: getAllDiscoveryEchoes().slice(0, 7).map((echo) => echo.id),
    completedEchoChapters: chapterMaps.slice(0, 3).map((map) => map.id),
    activatedMapInteractives: getAllMapInteractives().slice(0, 3).map((device) => device.id),
    completedMapInteractiveChapters: chapterMaps.slice(1, 4).map((map) => map.id),
    lastEchoDiscovery: {
      id: "pledge-null-contract",
      label: "空值合同",
      chapterId: "promise-tower",
      chapterTitle: chapters[3]?.title ?? "第四章",
      completedChapter: false,
      shardReward: 0,
      at: Date.now(),
    },
    lastMapInteractiveDiscovery: {
      id: "pledge-branch-relay",
      label: "叶灯中继",
      chapterId: "promise-tower",
      chapterTitle: chapters[3]?.title ?? "第四章",
      completedChapter: true,
      shardReward: getMapInteractiveChapterReward(3),
      at: Date.now(),
    },
    metaUpgrades: {
      "steady-heart": 3,
      "warm-cache": 2,
      "route-shoes": 2,
      "chapter-insurance": 1,
      "paperclip-specialist": 2,
      "keyboard-specialist": 2,
      "correction-specialist": 1,
    },
  };
}

function resetStoreRun(chapterIndex = 0, options = {}) {
  archiveState = createStoreArchiveState();
  runStats = {
    ...createRunStats(),
    chaptersCleared: Math.min(chapterIndex, chapters.length - 1),
    eventsResolved: 9 + chapterIndex * 7,
    enemiesDefeated: 48 + chapterIndex * 36,
    bossesDefeated: Math.max(0, chapterIndex),
    upgradesChosen: ["数组索引器", "队列自动机", "哈希弱点表"],
    relicsChosen: ["冷掉配送单", "迟到者车票"],
    conceptsChosen: ["数组", "队列", "哈希", "时间"],
    synergiesUnlocked: ["队列共鸣", "哈希共鸣"],
    mapInteractivesActivated: ["metro-time-gate", "hash-salt-lantern"].slice(0, Math.max(0, chapterIndex)),
    deviceGuide: null,
    damageTaken: 32,
    tempo: {
      ...createCombatTempoState(),
      streak: 7,
      bestStreak: 14,
      timer: 3.1,
      rewardLevel: 1,
      rewardsClaimed: 2,
      hotFlash: 0.28,
    },
    highestLevel: 6 + chapterIndex,
    bestChapterReached: chapterIndex,
  };
  player = {
    ...playerBase,
    hp: options.hp ?? 86,
    maxHp: 132,
    level: options.level ?? 6,
    xp: options.xp ?? 11,
    xpToNext: 18,
    bugPoints: options.bugPoints ?? 9,
    backlash: options.backlash ?? 18 + chapterIndex * 5,
    fixed: options.fixed ?? 3,
    relics: ["cold-delivery-note", "late-ticket"],
    concepts: { array: 2, queue: 3, hash: 2, time: 2 },
    unlockedSynergies: ["queue-2", "hash-2"],
  };
  currentChapterIndex = clamp(chapterIndex, 0, chapters.length - 1);
  runStats.activeHook = createNightHookState(currentChapterIndex);
  chapterState = createChapterState(options.allies ?? ["qiao-you"]);
  chapterState.stepIndex = options.stepIndex ?? 2;
  chapterState.resolvedInStep = options.resolvedInStep ?? 1;
  chapterState.resolvedTotal = options.resolvedTotal ?? 3 + chapterIndex;
  nextUpgradeAt = 2;
  runPanelSignature = "";
  bugNodes = [];
  enemies = [];
  particles = [];
  bullets = [];
  bugPickups = [];
  cleaners = [];
  boss = null;
  protocolHazards = [];
  enemyHazards = [];
  activeEvent = null;
  storyState = null;
  world.mode = "playing";
  world.animTime = 4.2;
  world.spawnTimer = 99;
  world.pulseCooldown = 0;
  world.dashCooldown = 0;
  world.allyAssistCooldown = 0;
  world.mapHazardCooldown = 0;
  world.enemyLogCooldown = 0;
  world.cameraShake = 0;
  world.saveCooldown = 999;
  syncWorldToCurrentMap();
  const focus = options.focus ?? currentMap().start ?? { x: 170, y: 560 };
  player.x = clamp(focus.x, player.radius + 12, world.width - player.radius - 12);
  player.y = clamp(focus.y, 92 + player.radius, world.height - player.radius - 12);
  equipWeapon(weaponDefinitions[options.weaponIndex ?? 1] ?? weaponDefinitions[0] ?? {});
  player.weapon.projectileCount = Math.max(player.weapon.projectileCount ?? 1, options.projectileCount ?? 3);
  player.weapon.level = options.weaponLevel ?? 3.5;
  centerCameraOnPlayer();
  hidePanels();
  setChapterObjective(options.objective ?? currentChapter().steps?.[chapterState.stepIndex]?.objective ?? currentChapter().initialObjective ?? "继续夜巡");
  setLog(options.log ?? currentChapter().startLog ?? "商店截图模式：稳定复现夜巡场景。");
}

function addStoreEnemies(placements) {
  for (const placement of placements) {
    spawnEnemyNear(placement.x, placement.y, placement.type, placement.overrides ?? {});
  }
}

function addStoreBugNodes(nodes) {
  bugNodes = nodes.map((node) => createBugNode(node.x, node.y, node.eventId));
}

function addStoreBullets(target = enemies[0] ?? cleaners[0] ?? boss) {
  if (!player.weapon || !target) {
    return;
  }
  for (let index = 0; index < 3; index += 1) {
    fireWeaponAt({
      x: target.x + index * 28,
      y: target.y - index * 18,
    });
  }
}

function getChapterCombatStoreShotConfig(mode = storeShotMode) {
  return chapterCombatStoreShotConfigs[mode] ?? null;
}

function addChapterCombatStoreHazard(config, target) {
  const anchor = target ?? player;
  if (!anchor) {
    return;
  }
  const radius = config.hazardType === "scanLock" ? 108 : 82;
  enemyHazards.push({
    type: config.hazardType ?? "enemyTrail",
    x: anchor.x,
    y: anchor.y,
    radius,
    life: 3.8,
    maxLife: 4.2,
    color: config.hazardColor ?? "#72a5ff",
    armed: true,
    damage: 0,
    hitCooldown: 0,
  });
}

function stageChapterCombatStoreBoss(config) {
  startBossFight(chapters[config.chapterIndex]?.boss?.id);
  if (!boss) {
    return null;
  }

  const offset = config.bossOffset ?? { x: 320, y: 72 };
  const bossPoint = findNearestFreePoint(
    clamp(player.x + (offset.x ?? 320), 84, world.width - 84),
    clamp(player.y + (offset.y ?? 72), 118, world.height - 84),
    boss.radius ?? 34
  );
  boss.x = bossPoint.x;
  boss.y = bossPoint.y;
  resolveDeskCollision(boss);
  boss.hp = Math.max(1, boss.maxHp * (config.bossHpRatio ?? 0.62));
  boss.attackCooldown = Math.max(boss.attackCooldown ?? 0, 4);
  boss.hitFlash = Math.max(boss.hitFlash ?? 0, 0.78);
  updateBoss(0.16);
  boss.lastRoute = {
    x1: boss.x - 240,
    y1: boss.y - 76,
    x2: boss.x + 220,
    y2: boss.y + 92,
  };
  protocolHazards.push({
    type: "retransmit",
    x1: boss.x - 270,
    y1: boss.y + 132,
    x2: boss.x + 230,
    y2: boss.y + 132,
    activeTime: 1.4,
    maxActiveTime: 1.4,
    radius: 40,
    damage: 0,
  });
  return boss;
}

function configureChapterCombatStoreShotMode(mode = storeShotMode) {
  const config = getChapterCombatStoreShotConfig(mode);
  if (!config) {
    return false;
  }

  const chapterIndex = clamp(config.chapterIndex, 1, chapters.length - 1);
  const map = chapterMaps[chapterIndex] ?? chapterMaps[0];
  const device = getMapInteractives(map)[0] ?? null;
  const focusAnchor = device ?? map.start ?? { x: 170, y: 560 };
  resetStoreRun(chapterIndex, {
    focus: focusAnchor,
    weaponIndex: config.weaponIndex ?? 1,
    allies: config.allies ?? ["qiao-you"],
    objective: config.objective,
    log: config.log,
    projectileCount: config.projectileCount ?? 4,
    level: config.level ?? 8,
    xp: 0,
    bugPoints: config.bugPoints ?? 8,
    fixed: config.fixed ?? 5,
    backlash: config.backlash ?? 28 + chapterIndex * 3,
    stepIndex: 2,
  });
  runStats.chapterShowcase = null;
  activateChapterShowcase("store-shot", { hold: 28, callout: "商店截图实战镜头" });

  const liveDevice = getMapInteractives()[0] ?? null;
  if (liveDevice) {
    const devicePoint = findNearestFreePoint(liveDevice.x, liveDevice.y, player.radius);
    player.x = devicePoint.x;
    player.y = devicePoint.y;
    centerCameraOnPlayer();
    activateMapInteractive(liveDevice);
  }
  player.pendingLevelUps = 0;
  hidePanels();
  world.mode = "playing";

  const stagedBoss = stageChapterCombatStoreBoss({ ...config, chapterIndex });
  const enemyOffset = config.enemyOffset ?? { x: 142, y: -48 };
  const enemyPoint = findNearestFreePoint(
    clamp(player.x + (enemyOffset.x ?? 142), 72, world.width - 72),
    clamp(player.y + (enemyOffset.y ?? -48), 104, world.height - 72),
    28
  );
  const target = spawnEnemyNear(enemyPoint.x, enemyPoint.y, config.enemyType ?? "deadline", {
    hpMultiplier: 0.64,
    speedMultiplier: 0.68,
    mechanicDepth: 1,
  });
  addChapterCombatStoreHazard(config, target);
  if (target?.mechanic) {
    markChapterShowcase("mechanic", {
      trigger: "store-shot-enemy",
      callout: getChapterShowcaseConfig(chapterIndex)?.hook ?? "敌人机制已入镜",
      x: target.x,
      y: target.y,
    });
  }
  centerCameraOnPlayer();
  const hitTarget = target ?? enemies[0] ?? cleaners[0] ?? stagedBoss;
  if (hitTarget && player.weapon) {
    const profile = getWeaponImpactProfile(player.weapon.id, false);
    spawnWeaponImpactFeedback(hitTarget, {
      weaponId: player.weapon.id,
      charged: false,
      impactProfile: profile,
      vx: player.weapon.bulletSpeed ?? 0,
      vy: 0,
    }, 24);
  }
  updateChapterShowcase(0.35);
  syncHud();
  window.__variableCityStoreShotReady = true;
  return true;
}

function configureStoreShotMode() {
  document.documentElement.dataset.storeShot = storeShotMode;
  gameSettings = {
    ...gameSettings,
    screenShake: false,
    fullscreenOnStart: false,
    audioMuted: true,
  };
  lastInputMethod = "gamepad";
  archiveState = createStoreArchiveState();

  if (storeShotMode === "start-menu") {
    openStartMenu();
    ui.startSummary.textContent = "Steam 商店截图模式：五章主线、章节练习、成就和本地档案已经准备好。";
    setLog("商店截图：档案柜、章节练习与本地成就统计。");
    window.__variableCityStoreShotReady = true;
    return;
  }

  if (storeShotMode === "chapter-1") {
    resetStoreRun(0, {
      focus: { x: 760, y: 430 },
      weaponIndex: 0,
      objective: "调查办公室订单异常，清理可互动任务点",
      log: "办公室地图：新办公桌椅、打印机、服务器门和取餐区都成为路线与障碍。",
    });
    addStoreBugNodes([
      { eventId: "bullet-comments", x: 540, y: 190 },
      { eventId: "delivery-meat", x: 1010, y: 530 },
      { eventId: "debug-badge", x: 342, y: 520 },
    ]);
    addStoreEnemies([
      { type: "stress", x: player.x + 210, y: player.y - 110 },
      { type: "deadline", x: player.x + 310, y: player.y + 70 },
      { type: "queueSnake", x: player.x - 200, y: player.y - 90 },
    ]);
    seedOfficeBugPickups();
    addStoreBullets();
    syncHud();
    window.__variableCityStoreShotReady = true;
    return;
  }

  if (storeShotMode === "upgrade") {
    resetStoreRun(2, {
      focus: { x: 820, y: 650 },
      weaponIndex: 1,
      level: 7,
      objective: "选择变量祝福，补全数组、队列与哈希构筑",
      log: "变量祝福三选一：从武器强化、概念共鸣和局内资源之间做取舍。",
    });
    player.pendingLevelUps = 1;
    openUpgrade();
    syncHud();
    window.__variableCityStoreShotReady = true;
    return;
  }

  if (storeShotMode === "boss-1") {
    resetStoreRun(0, {
      focus: { x: 1710, y: 672 },
      weaponIndex: 1,
      objective: "Boss 战：打断错误配送协议",
      log: "Boss 机制：协议骑手进入二阶段，TCP 路线和重传包同时压场。",
      projectileCount: 4,
    });
    startBossFight("delivery-rider");
    boss.hp = boss.maxHp * 0.58;
    boss.phase = 2;
    boss.state = "handshake";
    boss.lastRoute = { x1: boss.x - 380, y1: boss.y - 82, x2: boss.x + 330, y2: boss.y + 104 };
    protocolHazards.push({
      type: "retransmit",
      x1: boss.x - 470,
      y1: boss.y + 160,
      x2: boss.x + 280,
      y2: boss.y + 160,
      activeTime: 1.6,
      radius: 46,
      damage: 16,
    });
    addStoreEnemies([
      { type: "deadline", x: boss.x - 230, y: boss.y + 120 },
      { type: "stress", x: boss.x - 340, y: boss.y - 150 },
    ]);
    addStoreBullets(boss);
    centerCameraOnPlayer();
    syncHud();
    window.__variableCityStoreShotReady = true;
    return;
  }

  if (configureChapterCombatStoreShotMode(storeShotMode)) {
    return;
  }

  if (storeShotMode === "chapter-5") {
    resetStoreRun(4, {
      focus: { x: 650, y: 430 },
      weaponIndex: 2,
      allies: ["qiao-you", "whitebox"],
      objective: "公共规则引擎核心：在扫描带之间提交反例",
      log: "第五章地图：规则扫描、申诉窗口和白箱协助形成终局压迫感。",
      backlash: 42,
      fixed: 5,
    });
    addStoreBugNodes([
      { eventId: "whitebox-appeal", x: 500, y: 384 },
      { eventId: "promise-bloat", x: 790, y: 492 },
    ]);
    addStoreEnemies([
      { type: "inspectionProbe", x: player.x + 250, y: player.y - 140 },
      { type: "cleaner", x: player.x - 220, y: player.y + 120 },
      { type: "floatError", x: player.x + 180, y: player.y + 150 },
    ]);
    enemyHazards.push({
      type: "scanLock",
      x: player.x + 140,
      y: player.y - 50,
      radius: 92,
      life: 3,
      color: "#72a5ff",
      armed: true,
    });
    addStoreBullets();
    syncHud();
    window.__variableCityStoreShotReady = true;
    return;
  }

  if (storeShotMode === "settings") {
    resetStoreRun(1, {
      focus: { x: 740, y: 420 },
      weaponIndex: 0,
      objective: "PC / Steam Deck 设置",
      log: "设置页：全屏、音频、手柄与输入提示都可在局内暂停时调整。",
    });
    gameSettings.masterVolume = 0.72;
    gameSettings.gamepadEnabled = true;
    gameSettings.showInputHints = true;
    openSettingsPanel();
    syncHud();
    window.__variableCityStoreShotReady = true;
    return;
  }

  openStartMenu();
  setLog(`未知 storeShot=${storeShotMode}，已回到档案柜。`);
  window.__variableCityStoreShotReady = true;
}

function createBugNode(x = random(90, world.width - 90), y = random(96, world.height - 86), eventId = null) {
  const event = eventId ? getEventById(eventId) : bugEvents[Math.floor(Math.random() * bugEvents.length)];
  const safePoint = findNearestFreePoint(x, y, 42);
  const stepIndex = chapterState?.stepIndex ?? -1;
  const openingFocus = currentChapterIndex === 0 && stepIndex === 0 && (runStats?.eventsResolved ?? 0) === 0;

  return {
    x: safePoint.x,
    y: safePoint.y,
    radius: 17,
    interactRadius: 54,
    pulse: random(0, Math.PI * 2),
    animPhase: random(0, Math.PI * 2),
    event,
    chapterStep: stepIndex,
    openingFocus,
  };
}

function getEventById(eventId) {
  return bugEvents.find((event) => event.id === eventId) ?? bugEvents[0];
}

function spawnEnemyNear(x, y, type = "stress", overrides = {}) {
  const definition = enemyTypes[type] ?? enemyTypes.stress ?? {};
  const speedMin = definition.speedMin ?? 72;
  const speedMax = definition.speedMax ?? speedMin;
  const scale = overrides.scale ?? 1;
  const hpMultiplier = overrides.hpMultiplier ?? 1;
  const speedMultiplier = overrides.speedMultiplier ?? 1;
  const mechanic = definition.mechanic ? JSON.parse(JSON.stringify(definition.mechanic)) : null;
  const enemy = {
    x: clamp(x + random(-40, 40), 40, world.width - 40),
    y: clamp(y + random(-40, 40), 80, world.height - 40),
    radius: (definition.radius ?? 15) * scale,
    hp: Math.ceil((definition.hp ?? 55) * hpMultiplier),
    maxHp: Math.ceil((definition.hp ?? 55) * hpMultiplier),
    speed: random(speedMin, speedMax) * speedMultiplier,
    damage: definition.damage ?? 10,
    xpValue: definition.xpValue ?? 2,
    bugValue: definition.bugValue ?? 1,
    render: definition.render ?? "emo",
    assetKey: definition.assetKey,
    spriteSize: definition.spriteSize ? definition.spriteSize * scale : undefined,
    deathColor: definition.deathColor ?? "#ef6a70",
    hitLog: definition.hitLog ?? "异常实体撞上来，报表又多了一页。",
    type,
    mechanic,
    mechanicTimer: mechanic?.initialDelay ?? random(0.8, 1.8),
    mechanicState: "idle",
    mechanicStateTimer: 0,
    mechanicDepth: overrides.mechanicDepth ?? 0,
    shieldActive: mechanic?.type === "shieldAura",
    shieldTimer: 0,
    trailTimer: random(0.1, 0.42),
    phaseAlpha: 0,
    scanPulse: 0,
    openingSurge: Boolean(overrides.openingSurge),
    openingSurgeIndex: Math.max(0, Math.trunc(Number(overrides.openingSurgeIndex) || 0)),
    openingSurgeArmTime: Math.max(0, Number(overrides.openingSurgeArmTime) || 0),
    animPhase: random(0, Math.PI * 2),
    hitFlash: 0,
    slowTimer: 0,
    slowFactor: 1,
  };
  resolveDeskCollision(enemy);
  if (definition.role === "cleaner" || type === "cleaner") {
    cleaners.push(enemy);
  } else {
    enemies.push(enemy);
  }
  return enemy;
}

function gain({ bugPoints = 0, hp = 0, backlash = 0, fixed = 0, log = "" }) {
  player.bugPoints = Math.max(0, player.bugPoints + bugPoints);
  player.hp = clamp(player.hp + hp, 0, player.maxHp);
  player.backlash = clamp(player.backlash + backlash, 0, 100);
  player.fixed += fixed;
  if (log) {
    setLog(log);
  }
}

function applyActions(actions = []) {
  for (const action of actions) {
    if (action.type === "gain") {
      gain(action);
    }

    if (action.type === "spawnEnemy") {
      spawnEnemyNear(player.x + (action.dx ?? 0), player.y + (action.dy ?? 0), action.enemyType);
    }

    if (action.type === "spendBugPoints") {
      player.bugPoints = Math.max(0, player.bugPoints - action.amount);
    }

    if (action.type === "clearEnemiesNear") {
      const radius = action.radius ?? 210;
      enemies = enemies.filter((enemy) => distance(enemy, player) > radius);
      if (action.includeCleaners) {
        cleaners = cleaners.filter((enemy) => distance(enemy, player) > radius);
      }
    }

    if (action.type === "modifyPlayer") {
      const current = player[action.stat] ?? 0;
      const next = current + (action.add ?? 0);
      player[action.stat] = clamp(next, action.min ?? -Infinity, action.max ?? Infinity);
    }

    if (action.type === "modifyWeapon") {
      modifyWeapon(action);
    }

    if (action.type === "boostWeaponTrait") {
      boostWeaponTrait(action.rarityMultiplier ?? 1);
    }

    if (action.type === "log") {
      setLog(action.message);
    }

    if (action.type === "startChapterStep") {
      startChapterStep(action.step);
    }

    if (action.type === "resumeChapter") {
      resumeChapterStep();
    }

    if (action.type === "spawnCleaner") {
      spawnEnemyNear(action.x, action.y, "cleaner");
    }

    if (action.type === "startBossFight") {
      startBossFight(action.bossId);
    }

    if (action.type === "addAlly" && !chapterState.allies.includes(action.allyId)) {
      chapterState.allies.push(action.allyId);
    }

    if (action.type === "finishChapter") {
      finishCurrentChapter();
    }
  }
}

function choiceIsDisabled(choice) {
  if (!choice.requires) {
    return false;
  }

  if (choice.requires.bugPoints && player.bugPoints < choice.requires.bugPoints) {
    return true;
  }

  return false;
}

function setLog(message) {
  ui.log.textContent = message;
}

function setChapterObjective(objective) {
  ui.chapterTitle.textContent = currentChapter().title;
  ui.objectiveText.textContent = objective;
}

function openWeaponSelect() {
  world.mode = "story";
  storyState = null;
  ui.storySpeaker.textContent = "系统弹窗";
  ui.storyTitle.textContent = "选择初始武器";
  ui.storyText.textContent = "变量城的夜间异常已经开始显形。安渡从抽屉里摸出一件工具，决定先活过这个凌晨。武器会自动锁定最近的异常实体发射子弹。";
  ui.storyProgress.textContent = "";
  ui.storyContinue.textContent = "";
  renderStoryAvatar("系统弹窗");
  ui.storyChoices.innerHTML = "";
  ui.storyPanel.classList.add("has-choices");

  for (const weapon of weaponDefinitions) {
    const button = document.createElement("button");
    button.className = "choice-button with-media weapon-choice";
    const icon = weapon.assetKey ? `<img class="choice-icon weapon-icon" src="${assetUrl(weapon.assetKey)}" alt="" />` : "";
    const specialization = getWeaponSpecializationPreview(weapon);
    const specializationLine = specialization
      ? `<span class="specialization-line ${specialization.active ? "is-active" : ""}">${specialization.text}</span>`
      : "";
    const openingHook = getWeaponOpeningHook(weapon);
    const openingHookLine = openingHook
      ? `<span class="weapon-opening-hook"><strong>${openingHook.title}</strong>${openingHook.text}<em>${openingHook.tag}</em></span>`
      : "";
    button.innerHTML = `${icon}<span class="choice-copy"><span class="choice-title">${weapon.name} · ${weapon.role}</span><span class="choice-effect">${weapon.desc}<br>${weapon.traitText}${specializationLine}${openingHookLine}</span></span>`;
    button.addEventListener("click", () => {
      equipWeapon(weapon);
      const build = applyStarterBuildForWeaponChoice(weapon);
      if (build) {
        setLog(`${build.log} ${build.perkText} 开场评级：30秒内完成首个异常、裂隙清场和武器超频可追 S。`);
      }
      saveRunCheckpoint("weapon-selected");
      ui.storyPanel.classList.add("hidden");
      openStory(currentChapter().opening);
    });
    ui.storyChoices.appendChild(button);
  }

  ui.storyPanel.classList.remove("hidden");
}

function equipWeapon(weapon) {
  player.weapon = { ...JSON.parse(JSON.stringify(weapon)), cooldownLeft: 0, level: 1, shotsFired: 0 };
  const specializationLog = applyWeaponSpecializationToWeapon(player.weapon);
  setLog(`已装备：${weapon.name}。它会自动攻击最近的异常实体。${specializationLog ? ` ${specializationLog}` : ""}`);
}

function modifyWeapon({ stat, add = 0, multiply = 1, min = -Infinity, max = Infinity }) {
  if (!player.weapon) {
    return;
  }

  const current = player.weapon[stat] ?? 0;
  const next = current * multiply + add;
  player.weapon[stat] = clamp(next, min, max);
  player.weapon.level += stat === "level" ? 0 : 0.25;
}

function boostWeaponTrait(multiplier = 1) {
  if (!player.weapon?.trait) {
    return;
  }

  const trait = player.weapon.trait;
  if (trait.type === "chargedShot") {
    trait.every = Math.max(2, trait.every - 1);
    trait.damageMultiplier += 0.25 * multiplier;
    return;
  }

  if (trait.type === "knockback") {
    trait.force += 8 * multiplier;
    return;
  }

  if (trait.type === "slowOnHit") {
    trait.duration += 0.25 * multiplier;
    trait.factor = Math.max(0.35, trait.factor - 0.05 * multiplier);
  }
}

function addExperience(amount) {
  player.xp += amount;

  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level += 1;
    player.pendingLevelUps += 1;
    player.xpToNext = Math.ceil(player.xpToNext * 1.28 + 3);
  }

  if (player.pendingLevelUps > 0 && world.mode === "playing") {
    openUpgrade();
  }
}

function seedOfficeBugPickups() {
  const map = currentMap();
  const start = map.start ?? { x: 170, y: 560 };
  const seeds = currentChapterIndex === 0
    ? [
        { x: 170, y: 510, xp: 2 },
        { x: 610, y: 126, xp: 2 },
        { x: 704, y: 360, xp: 3 },
        { x: 1160, y: 360, xp: 3 },
        { x: 430, y: 598, xp: 2 },
        { x: 1188, y: 820, xp: 3 },
        { x: 1608, y: 594, xp: 3 },
        { x: 1904, y: 732, xp: 4 },
      ]
    : [
        { x: start.x + 64, y: start.y - 42, xp: 3 },
        { x: start.x + 210, y: start.y - 120, xp: 3 },
        ...(map.spawnPoints ?? []).slice(0, 3).map((point, index) => ({ x: point.x, y: point.y, xp: 2 + index })),
      ];

  for (const seed of seeds) {
    spawnBugPickup(seed.x, seed.y, 1, seed.xp);
  }
}

function spawnBugPickup(x, y, bugValue = 1, xpValue = 2) {
  const safePoint = findNearestFreePoint(x + random(-12, 12), y + random(-12, 12), 18);
  bugPickups.push({
    x: safePoint.x,
    y: safePoint.y,
    vx: random(-20, 20),
    vy: random(-20, 20),
    radius: 8,
    pulse: random(0, Math.PI * 2),
    animPhase: random(0, Math.PI * 2),
    bugValue,
    xpValue,
  });
}

function openStory(story) {
  world.mode = "story";
  const lines = normalizeStoryLines(story);
  storyState = {
    story,
    lines,
    index: 0,
  };
  renderStoryLine();
  ui.storyPanel.classList.remove("hidden");
}

function normalizeStoryLines(story) {
  if (Array.isArray(story.lines) && story.lines.length > 0) {
    return story.lines.map((line) => ({
      speaker: line.speaker ?? story.speaker,
      title: line.title ?? story.title,
      text: line.text ?? "",
      avatar: line.avatar ?? story.avatar,
    }));
  }

  return [
    {
      speaker: story.speaker,
      title: story.title,
      text: story.text,
      avatar: story.avatar,
    },
  ];
}

function renderStoryLine() {
  if (!storyState) {
    return;
  }

  const line = storyState.lines[storyState.index];
  const isLastLine = storyState.index >= storyState.lines.length - 1;
  ui.storySpeaker.textContent = line.speaker;
  ui.storyTitle.textContent = line.title;
  ui.storyText.textContent = line.text;
  ui.storyProgress.textContent = `${storyState.index + 1}/${storyState.lines.length}`;
  ui.storyChoices.innerHTML = "";
  renderStoryAvatar(line.speaker, line.avatar);

  if (isLastLine) {
    renderStoryChoices(storyState.story.choices ?? []);
    ui.storyContinue.textContent = (storyState.story.choices ?? []).length > 0 ? "选择回应" : "";
    ui.storyPanel.classList.toggle("has-choices", (storyState.story.choices ?? []).length > 0);
    return;
  }

  ui.storyContinue.textContent = "点击继续";
  ui.storyPanel.classList.remove("has-choices");
}

function renderStoryChoices(choices) {
  for (const choice of choices) {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.innerHTML = `<span class="choice-title">${choice.title}</span><span class="choice-effect">${choice.effect}</span>`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      ui.storyPanel.classList.add("hidden");
      ui.storyPanel.classList.remove("has-choices");
      storyState = null;
      applyActions(choice.actions);
    });
    ui.storyChoices.appendChild(button);
  }
}

function advanceStory() {
  if (!storyState || storyState.index >= storyState.lines.length - 1) {
    return;
  }
  storyState.index += 1;
  renderStoryLine();
}

function renderStoryAvatar(speaker, avatarKey = null) {
  const source = storyAvatarSources[avatarKey] ?? storyAvatarSources[speaker];
  const fallbackText = (speaker || "?").replace(/[：: ].*$/, "").slice(0, 1) || "?";
  ui.storyAvatarFallback.textContent = fallbackText;
  ui.storyAvatar.onerror = () => {
    ui.storyAvatarFrame.classList.add("is-empty");
  };

  if (!source) {
    ui.storyAvatar.removeAttribute("src");
    ui.storyAvatarFrame.classList.add("is-empty");
    return;
  }

  ui.storyAvatarFrame.classList.remove("is-empty");
  ui.storyAvatar.src = encodeURI(source);
}

function startChapterStep(stepIndex) {
  const step = currentChapter().steps[stepIndex];
  if (!step) {
    finishCurrentChapter();
    return;
  }
  chapterState.stepIndex = stepIndex;
  chapterState.resolvedInStep = 0;
  bugNodes = [];
  setChapterObjective(step.objective);

  if (step.intro) {
    openStory(step.intro);
    return;
  }

  spawnChapterNodes(step);
}

function resumeChapterStep() {
  const step = currentChapter().steps[chapterState.stepIndex];
  spawnChapterNodes(step);
}

function spawnChapterNodes(step) {
  const mapTargets = currentMap().stepTargets?.[chapterState.stepIndex];
  const nodes = mapTargets ?? (step.nodes ?? [step.node]);
  bugNodes = nodes.map((node) => createBugNode(node.x, node.y, node.eventId));
  world.mode = "playing";
  const hint = currentMap().stepHints?.[chapterState.stepIndex];
  const openingHint = currentChapterIndex === 0 && chapterState.stepIndex === 0
    ? "首个异常已标记：靠近它会打开事件选择，处理后立刻推进开场目标链。"
    : "";
  if (openingHint || hint) {
    setLog(openingHint || hint);
  }
  saveRunCheckpoint("chapter-step");
}

function startBossFight(bossId = null) {
  const chapter = currentChapter();
  const bossConfig = chapter.boss ?? {};
  const mapBossSpawn = currentMap().bossSpawn ?? {};
  bugNodes = [];
  enemies = enemies.slice(0, 4);
  cleaners = [];
  protocolHazards = [];
  enemyHazards = [];
  world.enemyLogCooldown = 0;
  boss = {
    id: bossId ?? bossConfig.id ?? "delivery-rider",
    archetype: bossConfig.archetype ?? getBossArchetype(bossId ?? bossConfig.id),
    name: bossConfig.name ?? "协议骑手·周行",
    x: bossConfig.x ?? mapBossSpawn.x ?? 1034,
    y: bossConfig.y ?? mapBossSpawn.y ?? 548,
    radius: bossConfig.radius ?? 34,
    hp: bossConfig.hp ?? 1750,
    maxHp: bossConfig.hp ?? 1750,
    speed: bossConfig.speed ?? 112,
    damage: bossConfig.damage ?? 22,
    difficulty: bossConfig.difficulty ?? 1,
    phaseLogs: bossConfig.phaseLogs ?? null,
    attackLogs: bossConfig.attackLogs ?? null,
    collisionLog: bossConfig.collisionLog ?? null,
    themeColor: bossConfig.themeColor ?? "#5de2d1",
    packageColor: bossConfig.packageColor ?? "#f1c15b",
    phase: 1,
    state: "idle",
    stateTimer: 0.85,
    attackCooldown: 0.55,
    hitFlash: 0,
    slowTimer: 0,
    slowFactor: 1,
    dash: null,
    lastRoute: null,
    logTimer: 0,
    animPhase: random(0, Math.PI * 2),
  };
  chapterState.stepIndex = bossConfig.stepIndex ?? chapterState.stepIndex;
  setChapterObjective(bossConfig.objective ?? "打断错误配送协议，救回外卖小哥周行");
  setLog(bossConfig.startLog ?? "Boss 战开始：订单被误识别成网络数据包。躲开路线，打掉大件包。");
  playAudioCue("boss-start");
  if (currentChapterIndex > 0) {
    activateChapterShowcase("boss", {
      callout: "Boss 弱点窗口检查",
      x: boss.x,
      y: boss.y,
      radius: 260,
      hold: 22,
    });
  }
  world.mode = "playing";
  saveRunCheckpoint("boss-start");
}

function getBossArchetype(bossId = "delivery-rider") {
  const archetypes = {
    "delivery-rider": "delivery",
    "timetable-admin": "timetable",
    "index-vendor": "index",
    "pledge-root": "pledge",
    "public-rule-engine": "rule",
  };
  return archetypes[bossId] ?? "delivery";
}

function finishCurrentChapter() {
  chapterState.finished = true;
  runStats.chaptersCleared += 1;
  recordChapterProgress(currentChapterIndex);
  evaluateRunAchievements("chapter_cleared");
  if (currentChapterIndex >= chapters.length - 1) {
    endGame(true);
    return;
  }

  const allies = chapterState.allies;
  openChapterRelicReward(allies);
}

function beginNextChapter(allies) {
  currentChapterIndex += 1;
  bugNodes = [];
  enemies = [];
  bullets = [];
  bugPickups = [];
  cleaners = [];
  boss = null;
  protocolHazards = [];
  enemyHazards = [];
  activeEvent = null;
  chapterState = createChapterState(allies);
  world.mode = "story";
  world.spawnTimer = 0;
  world.pulseCooldown = 0;
  world.dashCooldown = 0;
  world.allyAssistCooldown = 0.6;
  world.mapHazardCooldown = 0;
  world.enemyLogCooldown = 0;
  world.cameraShake = 0.12;
  positionPlayerAtMapStart();
  player.hp = clamp(player.hp + Math.ceil(player.maxHp * 0.35), 1, player.maxHp);
  player.backlash = clamp(player.backlash - 18, 0, 100);
  seedOfficeBugPickups();
  setChapterObjective(currentChapter().initialObjective ?? "继续夜巡");
  setLog(currentChapter().startLog ?? `${currentChapter().title}开始。`);
  activateNightHookForChapter(currentChapterIndex);
  openStory(currentChapter().opening);
  saveRunCheckpoint("next-chapter");
}

function openChapterRelicReward(allies) {
  const choices = getChapterRelicChoices();
  if (choices.length === 0) {
    beginNextChapter(allies);
    return;
  }

  world.mode = "reward";
  ui.upgradeKicker.textContent = "章节信物";
  ui.upgradeTitle.textContent = `${currentChapter().title} 已稳定`;
  ui.upgradeChoices.innerHTML = "";

  for (const relic of choices) {
    const button = document.createElement("button");
    button.className = "choice-button with-media upgrade-card-choice";
    const icon = relic.iconKey ? `<img class="choice-icon ability-icon" src="${assetUrl(relic.iconKey)}" alt="" />` : "";
    button.innerHTML = `${icon}<span class="choice-copy"><span class="choice-title">${relic.title}<span class="choice-rarity">信物</span></span><span class="choice-effect">${relic.effect}</span></span>`;
    button.addEventListener("click", () => {
      applyChapterRelic(relic);
      ui.upgradePanel.classList.add("hidden");
      beginNextChapter(allies);
    });
    ui.upgradeChoices.appendChild(button);
  }

  hidePanels();
  ui.upgradePanel.classList.remove("hidden");
}

function getChapterRelicChoices() {
  const owned = new Set(player.relics ?? []);
  const available = chapterRelics.filter((relic) => !owned.has(relic.id) && (relic.minChapter ?? 0) <= currentChapterIndex);
  return available.sort(() => Math.random() - 0.5).slice(0, 3);
}

function applyChapterRelic(relic) {
  player.relics.push(relic.id);
  runStats.relicsChosen.push(relic.title);
  runStats.upgradesChosen.push(relic.title);
  registerConcepts(relic);
  applyActions(relic.actions ?? []);
  setLog(`获得章节信物：${relic.title}。`);
}

function handleChapterEventResolved(removedNode) {
  if (removedNode.chapterStep !== chapterState.stepIndex || chapterState.finished) {
    return false;
  }

  const step = currentChapter().steps[chapterState.stepIndex];
  const requiredResolved = step.requiredResolved ?? 1;
  chapterState.resolvedInStep += 1;
  chapterState.resolvedTotal += 1;

  if (chapterState.resolvedInStep >= requiredResolved && step.afterEvent) {
    openStory(step.afterEvent);
    return true;
  }

  world.mode = "playing";
  return false;
}

function hidePanels() {
  ui.startPanel?.classList.add("hidden");
  ui.storyPanel.classList.add("hidden");
  ui.storyPanel.classList.remove("has-choices");
  ui.eventPanel.classList.add("hidden");
  ui.upgradePanel.classList.add("hidden");
  ui.resultPanel.classList.add("hidden");
  ui.pausePanel?.classList.add("hidden");
  ui.settingsPanel?.classList.add("hidden");
}

function renderPausePanel() {
  if (!ui.pauseSummary) {
    return;
  }
  const chapterTitle = currentChapter().title ?? "变量城夜巡";
  const objective = getCurrentObjectiveText();
  ui.pauseSummary.textContent = `${chapterTitle} · ${objective}`;
}

function pauseGame() {
  if (["menu", "result", "paused"].includes(world.mode)) {
    return;
  }
  world.previousMode = world.mode;
  world.mode = "paused";
  renderPausePanel();
  ui.pausePanel?.classList.remove("hidden");
  saveRunCheckpoint("pause");
  setLog("夜巡暂停。当前跑局已保存。");
  playAudioCue("pause");
}

function resumeGame() {
  if (world.mode !== "paused") {
    return;
  }
  ui.pausePanel?.classList.add("hidden");
  world.mode = world.previousMode && world.previousMode !== "paused" ? world.previousMode : "playing";
  if (world.mode === "playing") {
    world.lastTime = performance.now();
  }
  setLog("继续夜巡。");
  playAudioCue("resume");
}

function togglePause() {
  if (world.mode === "paused") {
    closeSettingsPanel();
    resumeGame();
    return;
  }
  if (!["menu", "result"].includes(world.mode)) {
    pauseGame();
  }
}

function returnToStartMenuFromPause() {
  saveRunCheckpoint("pause-menu");
  closeSettingsPanel();
  ui.pausePanel?.classList.add("hidden");
  openStartMenu();
}

function openSettingsPanel() {
  if (world.mode === "playing") {
    pauseGame();
  }
  renderSettingsControls();
  ui.settingsPanel?.classList.remove("hidden");
  playAudioCue("ui-open");
}

function closeSettingsPanel() {
  const wasOpen = ui.settingsPanel && !ui.settingsPanel.classList.contains("hidden");
  ui.settingsPanel?.classList.add("hidden");
  if (wasOpen) {
    playAudioCue("ui-close");
  }
}

function renderSettingsControls() {
  if (!gameSettings) {
    return;
  }
  if (ui.shakeToggle) ui.shakeToggle.checked = Boolean(gameSettings.screenShake);
  if (ui.gamepadToggle) ui.gamepadToggle.checked = Boolean(gameSettings.gamepadEnabled);
  if (ui.inputHintToggle) ui.inputHintToggle.checked = Boolean(gameSettings.showInputHints);
  if (ui.fullscreenPrefToggle) ui.fullscreenPrefToggle.checked = Boolean(gameSettings.fullscreenOnStart);
  if (ui.audioMuteToggle) ui.audioMuteToggle.checked = Boolean(gameSettings.audioMuted);
  if (ui.masterVolumeSlider) ui.masterVolumeSlider.value = String(Math.round((gameSettings.masterVolume ?? 0.62) * 100));
  if (ui.masterVolumeValue) ui.masterVolumeValue.textContent = `${Math.round((gameSettings.masterVolume ?? 0.62) * 100)}%`;
}

async function toggleFullscreen() {
  const isFullscreen = platform.isFullscreen?.() ?? Boolean(document.fullscreenElement);
  if (isFullscreen) {
    await platform.exitFullscreen?.();
  } else {
    await platform.requestFullscreen?.(document.documentElement);
  }
  syncSystemControls();
  playAudioCue("ui-confirm");
}

function syncSystemControls() {
  const isFullscreen = platform.isFullscreen?.() ?? Boolean(document.fullscreenElement);
  if (ui.fullscreenButton) {
    ui.fullscreenButton.textContent = isFullscreen ? "窗口" : "全屏";
  }
  if (ui.inputHint) {
    ui.inputHint.textContent = gameSettings?.showInputHints === false ? "" : lastInputMethod === "gamepad" ? "手柄" : "键鼠";
    ui.inputHint.classList.toggle("hidden", gameSettings?.showInputHints === false);
  }
}

function getBuildSummary() {
  const weaponName = player?.weapon?.name ?? "未选择武器";
  const picked = runStats?.upgradesChosen ?? [];
  const relics = runStats?.relicsChosen ?? [];
  const ignition = runStats?.starterIgnition;
  if (ignition?.overclockApplied && picked.length === 0 && relics.length === 0) {
    return `${weaponName} / 启动超频`;
  }
  if (picked.length === 0 && relics.length === 0) {
    return weaponName;
  }

  const latestRelic = relics.length > 0 ? relics[relics.length - 1] : null;
  const latest = latestRelic ?? picked.slice(-2).join(" + ");
  return `${weaponName} / ${latest}`;
}

const conceptNames = {
  integer: "整数",
  float: "浮点",
  array: "数组",
  stack: "栈",
  queue: "队列",
  hash: "哈希",
  tree: "树",
  graph: "图",
  time: "时间",
  promise: "承诺",
};

const conceptSynergyRewards = {
  integer: {
    2: [{ type: "modifyWeapon", stat: "damage", add: 6 }],
    4: [{ type: "modifyWeapon", stat: "bulletSize", add: 2, max: 12 }],
  },
  float: {
    2: [{ type: "modifyPlayer", stat: "speed", add: 14 }],
    4: [{ type: "modifyWeapon", stat: "projectileCount", add: 1, max: 8 }],
  },
  array: {
    2: [{ type: "modifyWeapon", stat: "projectileCount", add: 1, max: 8 }],
    4: [{ type: "modifyWeapon", stat: "spread", add: 0.04, max: 0.5 }],
  },
  stack: {
    2: [{ type: "modifyPlayer", stat: "pulseDamage", add: 16 }],
    4: [{ type: "modifyPlayer", stat: "maxHp", add: 18 }, { type: "gain", hp: 18 }],
  },
  queue: {
    2: [{ type: "modifyWeapon", stat: "cooldown", multiply: 0.92, min: 0.08 }],
    4: [{ type: "modifyPlayer", stat: "pulseCost", add: -1, min: 1 }],
  },
  hash: {
    2: [{ type: "modifyWeapon", stat: "range", add: 75 }],
    4: [{ type: "modifyWeapon", stat: "pierce", add: 1, max: 4 }],
  },
  tree: {
    2: [{ type: "modifyPlayer", stat: "maxHp", add: 12 }, { type: "gain", hp: 12 }],
    4: [{ type: "modifyWeapon", stat: "projectileCount", add: 1, max: 8 }],
  },
  graph: {
    2: [{ type: "modifyPlayer", stat: "pulseRadius", add: 22 }],
    4: [{ type: "modifyWeapon", stat: "range", add: 90 }],
  },
  time: {
    2: [{ type: "modifyPlayer", stat: "dashPower", add: 18 }],
    4: [{ type: "gain", backlash: -18 }],
  },
  promise: {
    2: [{ type: "gain", backlash: -14 }],
    4: [{ type: "modifyPlayer", stat: "maxHp", add: 20 }, { type: "gain", hp: 20 }],
  },
};

function registerConcepts(source) {
  const concepts = source?.concepts ?? [];
  if (!concepts.length) {
    return;
  }

  for (const concept of concepts) {
    player.concepts[concept] = (player.concepts[concept] ?? 0) + 1;
    runStats.conceptsChosen.push(concept);
    unlockConceptSynergies(concept);
  }
}

function unlockConceptSynergies(concept) {
  const count = player.concepts[concept] ?? 0;
  for (const threshold of [2, 4]) {
    const key = `${concept}:${threshold}`;
    if (count < threshold || player.unlockedSynergies.includes(key)) {
      continue;
    }

    player.unlockedSynergies.push(key);
    runStats.synergiesUnlocked.push(`${conceptNames[concept] ?? concept}${threshold}`);
    applyActions(conceptSynergyRewards[concept]?.[threshold] ?? []);
    evaluateRunAchievements("synergy_unlocked");
    setLog(`${conceptNames[concept] ?? concept}共鸣 ${threshold} 层触发，构筑产生额外校准。`);
  }
}

function getResonanceSummary() {
  const entries = Object.entries(player?.concepts ?? {}).filter(([, count]) => count > 0);
  if (!entries.length) {
    return "无";
  }

  entries.sort((a, b) => b[1] - a[1]);
  return entries
    .slice(0, 2)
    .map(([concept, count]) => `${conceptNames[concept] ?? concept}${count}`)
    .join(" / ");
}

function formatSaveTime(timestamp) {
  if (!timestamp) {
    return "未知时间";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "未知时间";
  }
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function createMenuButton(title, effect, className, onClick, disabled = false) {
  const button = document.createElement("button");
  button.className = `choice-button ${className ?? ""}`.trim();
  button.disabled = disabled;
  button.innerHTML = `<span class="choice-title">${title}</span><span class="choice-effect">${effect}</span>`;
  if (onClick && !disabled) {
    button.addEventListener("click", () => {
      playAudioCue(className?.includes("danger") ? "ui-danger" : "ui-confirm");
      onClick();
    });
  }
  return button;
}

function renderMetaProgression() {
  if (!ui.metaProgression || !ui.metaSummary) {
    return;
  }

  const shards = archiveState?.calibrationShards ?? 0;
  const totalLevels = metaProgressNodes.reduce((sum, node) => sum + getMetaLevel(node.id), 0);
  const maxLevels = metaProgressNodes.reduce((sum, node) => sum + node.maxLevel, 0);
  const lastGain = archiveState?.lastRunShardGain?.amount
    ? ` · 上轮 +${archiveState.lastRunShardGain.amount}`
    : "";
  ui.metaSummary.textContent = `碎片 ${shards} · 节点 ${totalLevels}/${maxLevels}${lastGain}`;
  ui.metaProgression.innerHTML = "";

  for (const node of metaProgressNodes) {
    const level = getMetaLevel(node.id);
    const cost = getMetaNodeCost(node);
    const lockedText = getMetaRequirementText(node);
    const maxed = level >= node.maxLevel;
    const affordable = cost !== null && shards >= cost;
    const disabled = Boolean(lockedText) || maxed || !affordable;
    const status = maxed
      ? "已满级"
      : lockedText || `消耗 ${cost} 校准碎片`;
    const className = [
      "meta-node",
      node.iconKey ? "with-media" : "",
      maxed ? "is-maxed" : "",
      lockedText ? "is-locked" : "",
      metaUnlockPulseNodeId === node.id ? "is-just-unlocked" : "",
    ].filter(Boolean).join(" ");
    const button = createMenuButton("", "", className, () => buyMetaUpgrade(node.id), disabled);
    const icon = node.iconKey ? `<img class="choice-icon meta-icon" src="${assetUrl(node.iconKey)}" alt="" />` : "";
    button.innerHTML = `${icon}<span class="choice-copy"><span class="choice-title">${node.title} Lv.${level}/${node.maxLevel}</span><span class="choice-effect">${node.summary}｜${status}</span></span>`;
    button.title = node.detail;
    ui.metaProgression.appendChild(button);
  }
  metaUnlockPulseNodeId = null;
}

function renderTonightHook() {
  if (!ui.tonightHook) {
    return;
  }

  const hook = getFeaturedNightHook();
  if (!hook) {
    ui.tonightHook.classList.add("hidden");
    return;
  }

  const completed = archiveState?.completedNightHooks?.includes(hook.id);
  const chapterTitle = chapters[hook.chapterIndex]?.title ?? `第 ${hook.chapterIndex + 1} 章`;
  const reward = `奖励 +${hook.rewardShards ?? 0} 碎片 · +${hook.rewardBugPoints ?? 0} bug点数`;
  ui.tonightHook.className = `tonight-hook${completed ? " is-completed" : ""}`;
  ui.tonightHook.innerHTML = `
    <div>
      <p class="event-kicker">${hook.kicker}</p>
      <h3>${hook.title}</h3>
      <p>${hook.promise}</p>
    </div>
    <div class="hook-side">
      <span>${chapterTitle}</span>
      <strong>${completed ? "已完成，可重复挑战" : reward}</strong>
      <button class="hook-start-button" type="button">${completed ? "再刷一把" : "接受委托"}</button>
    </div>
  `;
  ui.tonightHook.querySelector(".hook-start-button")?.addEventListener("click", () => {
    playAudioCue("ui-confirm");
    startNewRun(hook.chapterIndex);
  });
}

function renderEchoArchive() {
  if (!ui.echoArchive) {
    return;
  }

  const summary = getEchoArchiveSummary();
  const cacheSummary = getMapCacheArchiveSummary();
  const interactiveSummary = getMapInteractiveArchiveSummary();
  const last = summary.last?.id
    ? `最近：${summary.last.label}${summary.last.shardReward ? ` +${summary.last.shardReward}碎片` : ""}`
    : "最近：暂无记录";
  const cacheLast = cacheSummary.last?.id
    ? `最近：${cacheSummary.last.label}${cacheSummary.last.shardReward ? ` +${cacheSummary.last.shardReward}碎片` : ""}`
    : "最近：暂无记录";
  const interactiveLast = interactiveSummary.last?.id
    ? `最近：${interactiveSummary.last.label}${interactiveSummary.last.shardReward ? ` +${interactiveSummary.last.shardReward}碎片` : ""}`
    : "最近：暂无记录";
  const chapterCards = summary.chapters.map((chapter) => {
    const unlocked = chapter.chapterIndex === 0 || archiveState?.unlockedChapters?.includes(chapter.chapterIndex);
    const labels = chapter.echoes.map((echo) => {
      if (echo.discovered) {
        return echo.label;
      }
      return unlocked ? "未发现" : "锁定";
    }).join(" / ");
    const className = [
      "echo-chapter",
      chapter.complete ? "is-complete" : "",
      unlocked ? "" : "is-locked",
    ].filter(Boolean).join(" ");
    const rewardText = chapter.rewardClaimed
      ? "奖励已归档"
      : chapter.complete
        ? `可归档 +${getEchoChapterReward(chapter.chapterIndex)}碎片`
        : `集齐 +${getEchoChapterReward(chapter.chapterIndex)}碎片`;
    return `
      <div class="${className}">
        <div class="echo-chapter-top">
          <span>${chapter.title}</span>
          <strong>${chapter.discovered}/${chapter.total}</strong>
        </div>
        <p>${labels}</p>
        <em>${rewardText}</em>
      </div>
    `;
  }).join("");
  const cacheCards = cacheSummary.chapters.map((chapter) => {
    const unlocked = chapter.chapterIndex === 0 || archiveState?.unlockedChapters?.includes(chapter.chapterIndex);
    const labels = chapter.caches.map((cache) => {
      if (cache.discovered) {
        return cache.label;
      }
      return unlocked ? "未发现" : "锁定";
    }).join(" / ");
    const className = [
      "echo-chapter",
      "is-landmark",
      chapter.complete ? "is-complete" : "",
      unlocked ? "" : "is-locked",
    ].filter(Boolean).join(" ");
    const rewardText = chapter.rewardClaimed
      ? "奖励已归档"
      : chapter.complete
        ? `可归档 +${getMapCacheChapterReward(chapter.chapterIndex)}碎片`
        : `发现 +${getMapCacheChapterReward(chapter.chapterIndex)}碎片`;
    return `
      <div class="${className}">
        <div class="echo-chapter-top">
          <span>${chapter.title}</span>
          <strong>${chapter.discovered}/${chapter.total}</strong>
        </div>
        <p>${labels || "暂无地标"}</p>
        <em>${rewardText}</em>
      </div>
    `;
  }).join("");
  const interactiveCards = interactiveSummary.chapters.map((chapter) => {
    const unlocked = chapter.chapterIndex === 0 || archiveState?.unlockedChapters?.includes(chapter.chapterIndex);
    const labels = chapter.devices.map((device) => {
      if (device.activated) {
        return device.label;
      }
      return unlocked ? "未启动" : "锁定";
    }).join(" / ");
    const className = [
      "echo-chapter",
      "is-device",
      chapter.complete ? "is-complete" : "",
      unlocked ? "" : "is-locked",
    ].filter(Boolean).join(" ");
    const rewardText = chapter.total <= 0
      ? "本章暂无装置"
      : chapter.rewardClaimed
        ? "奖励已归档"
        : chapter.complete
          ? `可归档 +${getMapInteractiveChapterReward(chapter.chapterIndex)}碎片`
          : `启动 +${getMapInteractiveChapterReward(chapter.chapterIndex)}碎片`;
    return `
      <div class="${className}">
        <div class="echo-chapter-top">
          <span>${chapter.title}</span>
          <strong>${chapter.activated}/${chapter.total}</strong>
        </div>
        <p>${labels || "暂无装置"}</p>
        <em>${rewardText}</em>
      </div>
    `;
  }).join("");

  ui.echoArchive.innerHTML = `
    <section class="echo-archive-section">
      <div class="echo-archive-head">
        <div>
          <p class="event-kicker">回声档案</p>
          <h3>城市反转线索</h3>
        </div>
        <strong>${summary.discovered}/${summary.total}</strong>
      </div>
      <div class="echo-archive-last">${last}</div>
      <div class="echo-archive-grid">${chapterCards}</div>
    </section>
    <section class="echo-archive-section">
      <div class="echo-archive-head is-landmark">
        <div>
          <p class="event-kicker">地标档案</p>
          <h3>每章可互动装置</h3>
        </div>
        <strong>${cacheSummary.discovered}/${cacheSummary.total}</strong>
      </div>
      <div class="echo-archive-last">${cacheLast}</div>
      <div class="echo-archive-grid">${cacheCards}</div>
    </section>
    <section class="echo-archive-section">
      <div class="echo-archive-head is-device">
        <div>
          <p class="event-kicker">装置档案</p>
          <h3>章节策略开关</h3>
        </div>
        <strong>${interactiveSummary.activated}/${interactiveSummary.total}</strong>
      </div>
      <div class="echo-archive-last">${interactiveLast}</div>
      <div class="echo-archive-grid">${interactiveCards}</div>
    </section>
  `;
}

function renderStarterBuilds() {
  if (!ui.starterBuilds) {
    return;
  }

  ui.starterBuilds.innerHTML = "";
  for (const build of starterBuilds) {
    const weapon = getWeaponById(build.weaponId) ?? weaponDefinitions[0] ?? {};
    const button = document.createElement("button");
    button.className = "choice-button starter-build-card with-media";
    const icon = weapon.assetKey ? `<img class="choice-icon weapon-icon" src="${assetUrl(weapon.assetKey)}" alt="" />` : "";
    const tags = build.tags.map((tag) => `<span>${tag}</span>`).join("");
    button.innerHTML = `
      ${icon}
      <span class="choice-copy">
        <span class="choice-title">${build.title} · ${weapon.name ?? "初始武器"}</span>
        <span class="choice-effect">${build.promise}</span>
        <span class="starter-build-tags">${tags}</span>
        <span class="specialization-line is-active">${build.perkText}</span>
      </span>
    `;
    button.addEventListener("click", () => {
      playAudioCue("ui-confirm");
      startNewRun(build.chapterIndex, { starterBuildId: build.id });
    });
    ui.starterBuilds.appendChild(button);
  }
}

function renderStartMenu() {
  if (!ui.startPanel) {
    return;
  }

  archiveState = isStoreShotMode ? archiveState : loadArchive();
  const runSave = isStoreShotMode ? null : loadRunSave();
  const bestChapter = Math.min(archiveState.bestChapter ?? 1, chapters.length);
  const echoSummary = getEchoArchiveSummary();
  const cacheSummary = getMapCacheArchiveSummary();
  const interactiveSummary = getMapInteractiveArchiveSummary();
  const lastReview = normalizeLastRunReview(archiveState.lastRunReview);
  const reviewBoostText = lastReview?.retryBoost ? `${lastReview.retryBoost.title}已备好。` : "";
  const reviewPlanText = lastReview?.retryPlan ? `${lastReview.retryPlan.title}已排好。` : "";
  ui.startSummary.textContent = runSave
    ? `检测到 ${formatSaveTime(runSave.savedAt)} 的跑局存档：${chapters[runSave.currentChapterIndex]?.title ?? "未知章节"}，${runSave.objective ?? "继续夜巡"}。`
    : lastReview
      ? `上轮复盘：${lastReview.highlightTitle}。下一把建议：${lastReview.nextTitle}。${reviewPlanText}${reviewBoostText}`
      : "档案已就绪。可以从第一章重新出发，也可以进入已解锁章节练习。";
  renderTonightHook();

  const stats = [
    ["最远章节", `${bestChapter}/${chapters.length}`],
    ["通关次数", `${archiveState.wins ?? 0}`],
    ["夜巡次数", `${archiveState.runs ?? 0}`],
    ["累计击破", `${archiveState.totalEnemiesDefeated ?? 0}`],
    ["校准碎片", `${archiveState.calibrationShards ?? 0}`],
    ["档案节点", `${metaProgressNodes.reduce((sum, node) => sum + getMetaLevel(node.id), 0)}/${metaProgressNodes.reduce((sum, node) => sum + node.maxLevel, 0)}`],
    ["回声档案", `${echoSummary.discovered}/${echoSummary.total}`],
    ["地标档案", `${cacheSummary.discovered}/${cacheSummary.total}`],
    ["装置档案", `${interactiveSummary.activated}/${interactiveSummary.total}`],
    ["平台", getPlatformDisplayLabel()],
    ["存档", getStorageDisplayLabel()],
    ["爆点委托", `${archiveState.nightHookCompletions ?? 0} 次`],
    ["最佳连段", `x${archiveState.bestTempoStreak ?? 0}`],
    ["最佳开场", formatOpeningRushArchiveBest(archiveState)],
    ["成就", `${readUnlockedAchievements().length}/${achievements.length}`],
  ];
  ui.startStats.innerHTML = "";
  for (const [label, value] of stats) {
    const item = document.createElement("div");
    item.className = "start-stat";
    item.innerHTML = `${label}<strong>${value}</strong>`;
    ui.startStats.appendChild(item);
  }

  renderMetaProgression();
  renderEchoArchive();
  renderStarterBuilds();

  ui.startActions.innerHTML = "";
  ui.startActions.appendChild(createMenuButton(
    "继续夜巡",
    runSave ? `${chapters[runSave.currentChapterIndex]?.title ?? "当前章节"} · ${formatSaveTime(runSave.savedAt)}` : "暂无可继续的跑局",
    "primary",
    () => restoreRunSave(loadRunSave()),
    !runSave,
  ));
  ui.startActions.appendChild(createMenuButton(
    "新开夜巡",
    "从第一章开始一轮完整五章流程",
    "",
    () => startNewRun(0),
  ));
  const clearButton = createMenuButton("清除档案", "再次点击确认：清除章节解锁和当前跑局", "danger", null);
  clearButton.addEventListener("click", () => {
    if (clearButton.dataset.confirmed === "true") {
      deleteRunSave();
      archiveState = createArchiveFallback();
      try {
        writePlatformJson(ARCHIVE_STORAGE_KEY, archiveState);
      } catch {
        // Ignore unavailable local storage.
      }
      setLog("档案已清除。变量城把柜台擦干净，等下一次夜巡。");
      renderStartMenu();
      syncHud();
      return;
    }
    clearButton.dataset.confirmed = "true";
    clearButton.querySelector(".choice-title").textContent = "确认清除";
  });
  ui.startActions.appendChild(clearButton);

  ui.chapterSelect.innerHTML = "";
  for (let index = 0; index < chapters.length; index += 1) {
    const unlocked = index === 0 || archiveState.unlockedChapters?.includes(index);
    const title = chapters[index]?.title ?? `第 ${index + 1} 章`;
    const effect = unlocked ? "从本章开局练习地图、敌人与 Boss" : "通关前一章后解锁";
    const badgeKey = chapterMaps[index]?.badgeKey;
    const className = [
      "chapter-button",
      badgeKey ? "with-media chapter-card" : "",
      unlocked ? "" : "is-locked",
    ].filter(Boolean).join(" ");
    const button = createMenuButton("", "", className, () => startNewRun(index), !unlocked);
    const icon = badgeKey ? `<img class="choice-icon chapter-badge" src="${assetUrl(badgeKey)}" alt="" />` : "";
    button.innerHTML = `${icon}<span class="choice-copy"><span class="choice-title">${title}</span><span class="choice-effect">${effect}</span></span>`;
    ui.chapterSelect.appendChild(button);
  }
}

function renderNightHookTracker() {
  if (!ui.hookTracker) {
    return;
  }

  const hook = runStats?.activeHook;
  const config = getNightHookConfigById(hook?.id);
  if (!hook || !config || world.mode === "menu") {
    ui.hookTracker.className = "hook-tracker hidden";
    ui.hookTracker.innerHTML = "";
    return;
  }

  refreshNightHookProgress(hook);
  const stateText = hook.completed
    ? `完成 · +${config.rewardShards ?? 0} 碎片`
    : hook.failed
      ? "本轮未完成"
      : getNightHookProgressText(hook, config);
  ui.hookTracker.className = [
    "hook-tracker",
    hook.completed ? "is-completed" : "",
    hook.failed ? "is-failed" : "",
  ].filter(Boolean).join(" ");
  ui.hookTracker.innerHTML = `
    <span>${config.kicker}</span>
    <strong>${config.title}</strong>
    <small>${stateText}</small>
  `;
}

function renderCombatTempoTracker() {
  if (!ui.tempoTracker) {
    return;
  }

  const tempo = runStats?.tempo;
  if (!tempo || tempo.streak <= 0 || world.mode === "menu") {
    ui.tempoTracker.className = "tempo-tracker hidden";
    ui.tempoTracker.innerHTML = "";
    ui.tempoTracker.style.removeProperty("--tempo-progress");
    return;
  }

  const progress = clamp((tempo.timer ?? 0) / combatTempoConfig.window, 0, 1);
  ui.tempoTracker.style.setProperty("--tempo-progress", `${Math.round(progress * 100)}%`);
  ui.tempoTracker.className = [
    "tempo-tracker",
    tempo.streak >= combatTempoConfig.rewardEvery ? "is-hot" : "",
    tempo.hotFlash > 0 ? "is-flashing" : "",
  ].filter(Boolean).join(" ");
  ui.tempoTracker.innerHTML = `
    <span>战斗节奏</span>
    <strong>${getCombatTempoText()}</strong>
    <small>连续击破会补给 bug点数和少量回复</small>
  `;
}

function renderStarterIgnitionTracker() {
  if (!ui.starterTracker) {
    return;
  }

  const state = refreshStarterIgnitionProgress();
  if (!state || world.mode === "menu") {
    ui.starterTracker.className = "starter-tracker hidden";
    ui.starterTracker.innerHTML = "";
    ui.starterTracker.style.removeProperty("--starter-progress");
    return;
  }

  const { ignition, build } = state;
  const progress = clamp((ignition.defeats ?? 0) / Math.max(1, ignition.targetDefeats ?? 1), 0, 1);
  const stateText = ignition.completed
    ? `启动完成 · ${ignition.overclockText || "已发放补给"}`
    : ignition.failed
      ? "启动窗口结束"
      : getStarterIgnitionText(ignition);
  ui.starterTracker.style.setProperty("--starter-progress", `${Math.round(progress * 100)}%`);
  ui.starterTracker.className = [
    "starter-tracker",
    ignition.completed ? "is-completed" : "",
    ignition.failed ? "is-failed" : "",
  ].filter(Boolean).join(" ");
  ui.starterTracker.innerHTML = `
    <span>流派启动</span>
    <strong>${build.title}</strong>
    <small>${stateText}</small>
  `;
}

function renderDeviceGuideTracker() {
  if (!ui.deviceTracker) {
    return;
  }

  const view = updateDeviceGuide(0);
  if (!view || world.mode === "menu") {
    ui.deviceTracker.className = "device-tracker hidden";
    ui.deviceTracker.innerHTML = "";
    ui.deviceTracker.style.removeProperty("--device-progress");
    return;
  }

  const { guide, target, distance: guideDistance, progress, rewardText } = view;
  const completed = Boolean(guide?.completed && guide.flash > 0);
  const distanceText = target
    ? `距 ${Math.max(0, Math.round(guideDistance))} · ${rewardText}`
    : rewardText;
  ui.deviceTracker.style.setProperty("--device-progress", `${Math.round(progress * 100)}%`);
  ui.deviceTracker.className = [
    "device-tracker",
    completed ? "is-completed" : "",
    target && guideDistance <= DEVICE_GUIDE_NEAR_RADIUS ? "is-near" : "",
  ].filter(Boolean).join(" ");
  ui.deviceTracker.innerHTML = `
    <span>${completed ? "装置已启动" : "装置扫描"}</span>
    <strong>${shortenText(guide?.targetLabel ?? target?.label ?? "互动装置", 12)}</strong>
    <small>${completed ? "已写入装置档案 · 章节奖励进度更新" : distanceText}</small>
  `;
}

function openStartMenu() {
  world.mode = "menu";
  hidePanels();
  renderStartMenu();
  ui.startPanel.classList.remove("hidden");
  setChapterObjective("选择夜巡档案");
  setLog("档案柜已打开：选择继续、重开，或进入已解锁章节练习。");
  syncHud();
}

function renderOpeningSprintTracker() {
  if (!ui.openingTracker) {
    return;
  }

  const sprint = runStats?.openingSprint;
  if (!sprint || world.mode === "menu" || currentChapterIndex !== 0) {
    ui.openingTracker.className = "opening-tracker hidden";
    ui.openingTracker.innerHTML = "";
    ui.openingTracker.style.removeProperty("--opening-progress");
    return;
  }

  const step = openingSprintSteps[Math.min(sprint.stepIndex ?? 0, openingSprintSteps.length - 1)];
  const progress = sprint.completed
    ? { value: openingSprintSteps.length, target: openingSprintSteps.length }
    : getOpeningSprintProgress(step, sprint);
  const totalProgress = sprint.completed
    ? 1
    : clamp(((sprint.completedStepIds?.length ?? 0) + (progress.value / Math.max(1, progress.target))) / openingSprintSteps.length, 0, 1);
  const retryBonusBugPoints = !sprint.completed && step?.id === openingSprintSteps[0]?.id
    ? clamp(Math.trunc(Number(sprint.retryBonusBugPoints) || 0), 0, 2)
    : 0;
  const stepRewardBugPoints = Math.max(0, Math.trunc(Number(step?.rewardBugPoints) || 0)) + retryBonusBugPoints;
  const rewardText = sprint.completed
    ? "开场目标链完成"
    : `${progress.value}/${progress.target} · 奖励 +${stepRewardBugPoints} bug点数${retryBonusBugPoints ? "（复盘加成）" : ""}`;
  const planText = runStats?.retryPlan?.applied && !sprint.completed
    ? `${runStats.retryPlan.title} · ${runStats.retryPlan.firstGoal}`
    : null;
  const showcase = runStats?.openingShowcase?.active ? runStats.openingShowcase : null;
  const surge = sprint.surge;
  const openingArmTime = surge?.spawned && !surge.completed && !surge.failed
    ? enemies.reduce((max, enemy) => enemy.openingSurge ? Math.max(max, enemy.openingSurgeArmTime ?? 0) : max, 0)
    : 0;
  const checklistReady = showcase?.checklist?.ready ? " · 镜头已就绪" : "";
  const previewCountdownText = showcase?.phase === "preview" && sprint.surge && !sprint.surge.spawned
    ? ` · 4个落点 · ${formatHookTime(sprint.surge.delayRemaining ?? 0)} 后刷新`
    : "";
  const firstStrikeWindowActive = surge?.spawned && !surge.completed && !surge.failed && openingArmTime > 0 && !surge.firstStrikeClaimed;
  const firstStrikeClaimedText = surge?.firstStrikeClaimed ? " · 先手截击已触发" : "";
  const spawnGraceText = ["spawned", "combat"].includes(showcase?.phase) && openingArmTime > 0
    ? ` · 接怪窗口 ${formatHookTime(openingArmTime)}${firstStrikeWindowActive ? " · 命中触发先手截击" : ""}`
    : "";
  const showcaseText = showcase
    ? `${showcase.callout}${previewCountdownText}${spawnGraceText}${firstStrikeClaimedText} · ${showcase.focus}${["retry", "combat"].includes(showcase.phase) ? ` · 奖励：${showcase.rewardText}` : ""}${checklistReady}`
    : null;
  const surgeText = surge?.spawned && !surge.completed && !surge.failed
    ? `${openingArmTime > 0 ? `接怪窗口 ${formatHookTime(openingArmTime)}${firstStrikeWindowActive ? " · 命中触发先手截击" : ""} · ` : ""}${surge.firstStrikeClaimed ? "先手截击已触发 · " : ""}${openingSurgeConfig.label} ${surge.defeats ?? 0}/${openingSurgeConfig.targetDefeats} · 点燃连段 ${formatHookTime(openingSurgeConfig.timeLimit - (surge.elapsed ?? 0))}`
    : surge?.completed
      ? `${openingSurgeConfig.label}已清场 · ${surge.firstStrikeClaimed ? "先手截击 · " : ""}连段与流派提速`
      : null;
  const rush = runStats?.openingRush;
  const rushText = rush
    ? `开场评级 ${rush.grade ?? "D"} ${rush.score ?? 0}/100 · ${Math.max(0, Math.ceil(openingRushConfig.windowSeconds - (rush.elapsed ?? 0)))}s`
    : null;
  const rushCoachText = getOpeningRushCoachText(rush);
  const detailText = [showcaseText ?? surgeText ?? planText ?? rewardText, rushCoachText].filter(Boolean).join(" · ");

  ui.openingTracker.style.setProperty("--opening-progress", `${Math.round(totalProgress * 100)}%`);
  ui.openingTracker.className = [
    "opening-tracker",
    sprint.completed ? "is-completed" : "",
    surge?.spawned && !surge.completed && !surge.failed ? "is-surge" : "",
    showcase ? "is-showcase" : "",
    showcase?.phase === "retry" ? "is-retry-route" : "",
    showcase?.phase === "combat" ? "is-combat-shot" : "",
    (rush?.score ?? 0) >= 75 ? "is-rush-hot" : "",
  ].filter(Boolean).join(" ");
  ui.openingTracker.innerHTML = `
    <span>${showcase?.phase === "preview" ? "裂隙预告" : showcase?.phase === "combat" ? "实战镜头" : showcase?.phase === "retry" ? "推荐再来" : showcase ? "第一波卖点" : "开场牵引"}</span>
    <strong>${showcase ? showcase.title : sprint.completed ? "第一条路线已接通" : step.title}</strong>
    <small>${[rushText, detailText].filter(Boolean).join(" · ")}</small>
  `;
}

function renderRunPanel() {
  if (!ui.chapterPips) {
    return;
  }

  const signature = `${currentChapterIndex}:${(archiveState?.unlockedChapters ?? []).join(",")}:${chapters.length}`;
  if (signature !== runPanelSignature) {
    runPanelSignature = signature;
    ui.chapterPips.innerHTML = "";
    for (let index = 0; index < chapters.length; index += 1) {
      const pip = document.createElement("span");
      pip.className = "chapter-pip";
      if (index < currentChapterIndex || archiveState?.unlockedChapters?.includes(index + 1)) {
        pip.classList.add("is-cleared");
      }
      if (index === currentChapterIndex) {
        pip.classList.add("is-current");
      }
      pip.title = chapters[index]?.title ?? `第 ${index + 1} 章`;
      ui.chapterPips.appendChild(pip);
    }
  }

  const bestChapter = Math.min(archiveState?.bestChapter ?? 1, chapters.length);
  ui.archive.textContent = `${bestChapter}/${chapters.length}`;
  ui.build.textContent = getBuildSummary();
  ui.resonance.textContent = getResonanceSummary();
  ui.defeat.textContent = runStats?.enemiesDefeated ?? 0;
  renderOpeningSprintTracker();
  renderNightHookTracker();
  renderCombatTempoTracker();
  renderStarterIgnitionTracker();
  renderDeviceGuideTracker();
}

function syncHud() {
  ui.hp.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 1;
  ui.hp.parentElement?.classList.toggle("is-low-hp", hpRatio <= fairWarningConfig.lowHpRatio && hpRatio > fairWarningConfig.criticalHpRatio);
  ui.hp.parentElement?.classList.toggle("is-critical-hp", hpRatio <= fairWarningConfig.criticalHpRatio);
  ui.level.textContent = player.level;
  ui.xp.textContent = `${player.xp}/${player.xpToNext}`;
  ui.bug.textContent = player.bugPoints;
  ui.weapon.textContent = player.weapon ? `${player.weapon.name} Lv.${Math.floor(player.weapon.level)}` : "未选择";
  ui.bug.parentElement.title = player.weapon ? `当前武器：${player.weapon.name}` : "";
  ui.backlash.textContent = `${Math.round(player.backlash)}%`;
  const totalObjectives = currentChapter().totalObjectives ?? 7;
  const bossProgress = chapterState?.bossCleared ? 1 : 0;
  ui.fixed.textContent = `${(chapterState?.resolvedTotal ?? 0) + bossProgress}/${totalObjectives}`;
  if (runStats) {
    runStats.highestLevel = Math.max(runStats.highestLevel, player.level);
    runStats.bestChapterReached = Math.max(runStats.bestChapterReached, currentChapterIndex);
  }
  renderRunPanel();
}

function update(time) {
  const dt = Math.min((time - world.lastTime) / 1000 || 0, 0.033);
  world.lastTime = time;
  world.animTime += dt;
  updateGamepadInput();

  if (world.mode === "playing") {
    updatePlaying(dt);
  }

  draw(dt);
  syncHud();
  requestAnimationFrame(update);
}

function updateGamepadInput() {
  if (!gamepadState) {
    return;
  }

  gamepadState.justPressed.clear();
  gamepadState.moveX = 0;
  gamepadState.moveY = 0;
  gamepadState.active = false;

  if (gameSettings?.gamepadEnabled === false) {
    gamepadState.buttons.clear();
    return;
  }

  const pads = platform.getGamepads?.() ?? [];
  const pad = pads.find((candidate) => candidate?.connected !== false && candidate.buttons?.length);
  if (!pad) {
    gamepadState.buttons.clear();
    syncSystemControls();
    return;
  }

  const deadzone = gameSettings?.controllerDeadzone ?? 0.24;
  const rawX = pad.axes?.[0] ?? 0;
  const rawY = pad.axes?.[1] ?? 0;
  gamepadState.moveX = Math.abs(rawX) > deadzone ? rawX : 0;
  gamepadState.moveY = Math.abs(rawY) > deadzone ? rawY : 0;
  gamepadState.name = pad.id ?? "Gamepad";

  const pressed = new Set();
  pad.buttons.forEach((button, index) => {
    if (button?.pressed || (button?.value ?? 0) > 0.52) {
      pressed.add(index);
      if (!gamepadState.buttons.has(index)) {
        gamepadState.justPressed.add(index);
      }
    }
  });
  gamepadState.buttons = pressed;
  gamepadState.active = Boolean(pressed.size || gamepadState.moveX || gamepadState.moveY);
  if (gamepadState.active) {
    lastInputMethod = "gamepad";
  }
  if (gamepadState.justPressed.has(9)) {
    togglePause();
  }
  handleGamepadUiActions();
  syncSystemControls();
}

function handleGamepadUiActions() {
  const settingsOpen = ui.settingsPanel && !ui.settingsPanel.classList.contains("hidden");
  const uiMode = world.mode !== "playing" || settingsOpen;
  if (!uiMode) {
    return;
  }

  if (gamepadState.justPressed.has(12) || gamepadState.justPressed.has(14)) {
    moveUiFocus(-1);
  }
  if (gamepadState.justPressed.has(13) || gamepadState.justPressed.has(15)) {
    moveUiFocus(1);
  }
  if (gamepadState.justPressed.has(0)) {
    const storyOpen = ui.storyPanel && !ui.storyPanel.classList.contains("hidden");
    const hasStoryChoices = ui.storyChoices?.querySelector("button:not([disabled])");
    if (storyOpen && !hasStoryChoices) {
      advanceStory();
      return;
    }
    const active = document.activeElement;
    if (active?.matches?.("button:not([disabled]), input[type='checkbox']")) {
      active.click();
    } else {
      moveUiFocus(1);
    }
  }
}

function moveUiFocus(direction) {
  const controls = Array.from(document.querySelectorAll("button:not([disabled]), input[type='checkbox']"))
    .filter((element) => element.offsetParent !== null);
  if (!controls.length) {
    return;
  }
  const currentIndex = controls.indexOf(document.activeElement);
  const nextIndex = currentIndex >= 0
    ? (currentIndex + direction + controls.length) % controls.length
    : direction > 0 ? 0 : controls.length - 1;
  controls[nextIndex]?.focus();
}

function updatePlaying(dt) {
  world.spawnTimer += dt;
  world.pulseCooldown = Math.max(0, world.pulseCooldown - dt);
  world.dashCooldown = Math.max(0, world.dashCooldown - dt);
  world.allyAssistCooldown = Math.max(0, world.allyAssistCooldown - dt);
  world.mapHazardCooldown = Math.max(0, world.mapHazardCooldown - dt);
  world.enemyLogCooldown = Math.max(0, world.enemyLogCooldown - dt);
  world.saveCooldown = Math.max(0, world.saveCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  world.cameraShake = Math.max(0, world.cameraShake - dt);

  movePlayer(dt);
  updateMapZones(dt);
  updateEnemyHazards(dt);
  updateWeapon(dt);
  updateBullets(dt);
  updateBoss(dt);
  updateProtocolHazards(dt);
  updateEnemyMechanics(dt);
  updateEnemies(dt);
  updateAllyAssist(dt);
  updateBugPickups(dt);
  checkDiscoveryEchoCollision();
  checkMapCacheCollision();
  updateDeviceGuide(dt);
  checkMapInteractiveCollision();
  updateNightHook(dt);
  updateCombatTempo(dt);
  updateStarterIgnition(dt);
  updateOpeningSprint(dt);
  updateOpeningSurge(dt);
  updateOpeningRush(dt);
  updateOpeningShowcase(dt);
  updateChapterShowcase(dt);
  if (world.mode !== "playing") {
    return;
  }
  updateParticles(dt);
  checkBugCollision();
  handleActions();
  maybeEscalateBacklash(dt);

  const bossActive = Boolean(boss && boss.hp > 0);
  const danger = currentChapter().danger ?? 1;
  const spawnEvery = (chapterState.stepIndex >= 2 ? 1.75 : 2.6) / danger;
  const maxEnemies = (chapterState.stepIndex >= 3 ? 18 : 13) + currentChapterIndex * 2;
  if (!bossActive && world.spawnTimer > spawnEvery && enemies.length < maxEnemies) {
    world.spawnTimer = 0;
    spawnEnemyWave(Math.ceil((chapterState.stepIndex >= 3 ? 3 : 2) * danger));
  }

  if (player.hp <= 0) {
    endGame(false);
  }

  if (world.mode === "playing" && world.saveCooldown <= 0) {
    saveRunCheckpoint("autosave");
    world.saveCooldown = 6;
  }
}

function getMoveInput() {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (!dx && !dy && gameSettings?.gamepadEnabled !== false && gamepadState?.active) {
    dx = gamepadState.moveX;
    dy = gamepadState.moveY;
  }

  return { dx, dy };
}

function movePlayer(dt) {
  const { dx, dy } = getMoveInput();

  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    const speedMultiplier = getMapMoveMultiplier(player, true);
    const before = { x: player.x, y: player.y };
    const next = {
      x: player.x + (dx / len) * player.speed * speedMultiplier * dt,
      y: player.y + (dy / len) * player.speed * speedMultiplier * dt,
    };
    player.x = clamp(next.x, player.radius, world.width - player.radius);
    player.y = clamp(next.y, 76, world.height - player.radius);
    resolveDeskCollision(player);
    if (runStats) {
      runStats.distanceTraveled = Math.max(0, (runStats.distanceTraveled ?? 0) + distance(before, player));
    }
  }
}

function handleActions() {
  const gamepadDash = gamepadState?.justPressed?.has(1);
  const gamepadPulse = gamepadState?.justPressed?.has(0);
  if ((keys.has(" ") || keys.has("space") || gamepadDash) && world.dashCooldown <= 0 && player.bugPoints >= 1) {
    dash();
  }

  if ((keys.has("j") || keys.has("enter") || gamepadPulse) && world.pulseCooldown <= 0 && player.bugPoints >= player.pulseCost) {
    repairPulse();
  }
}

function updateWeapon(dt) {
  const weapon = player.weapon;
  if (!weapon) {
    return;
  }

  weapon.cooldownLeft = Math.max(0, weapon.cooldownLeft - dt);
  if (weapon.cooldownLeft > 0) {
    return;
  }

  const target = findNearestHostile(weapon.range);
  if (!target) {
    return;
  }

  fireWeaponAt(target);
  weapon.cooldownLeft = weapon.cooldown;
}

function findNearestHostile(range) {
  let nearest = null;
  let nearestDistance = range;
  const hostiles = [...enemies, ...cleaners];
  if (boss && boss.hp > 0) {
    hostiles.push(boss);
  }
  for (const enemy of hostiles) {
    const currentDistance = distance(player, enemy);
    if (currentDistance < nearestDistance) {
      nearest = enemy;
      nearestDistance = currentDistance;
    }
  }
  return nearest;
}

function getWeaponImpactProfile(weaponId, charged = false) {
  const base = weaponImpactProfiles[weaponId] ?? weaponImpactProfiles.default;
  return {
    ...base,
    label: charged && base.chargedLabel ? base.chargedLabel : base.label,
    color: charged ? (base.chargedColor ?? base.color) : base.color,
    count: (base.count ?? 7) + (charged ? 5 : 0),
    charged: Boolean(charged),
  };
}

function spawnWeaponImpactParticles(x, y, profile, bullet = null) {
  const count = Math.max(4, Math.round(profile.count ?? 7));
  const pushX = (bullet?.vx ?? 0) * 0.025;
  const pushY = (bullet?.vy ?? 0) * 0.025;

  for (let index = 0; index < count; index += 1) {
    const angle = random(0, Math.PI * 2);
    const speed = random(profile.speedMin ?? 45, profile.speedMax ?? 160);
    const life = random(profile.lifeMin ?? 0.22, profile.lifeMax ?? 0.52);
    particles.push({
      type: "impact",
      impactProfile: profile.id,
      shape: profile.shape ?? "square",
      x,
      y,
      vx: Math.cos(angle) * speed + pushX,
      vy: Math.sin(angle) * speed + pushY,
      size: random(profile.sizeMin ?? 2, profile.sizeMax ?? 5),
      length: random(profile.lengthMin ?? 8, profile.lengthMax ?? 18),
      rotation: angle + random(-0.35, 0.35),
      color: profile.color,
      life,
      maxLife: life,
    });
  }

  if (profile.ring) {
    const ringLife = profile.charged ? 0.34 : 0.26;
    particles.push({
      type: "impact",
      impactProfile: profile.id,
      shape: "ring",
      x,
      y,
      vx: 0,
      vy: -4,
      size: profile.charged ? 28 : 19,
      length: 0,
      rotation: 0,
      color: profile.color,
      life: ringLife,
      maxLife: ringLife,
    });
  }
}

function spawnWeaponImpactFeedback(enemy, bullet, finalDamage) {
  const profile = bullet?.impactProfile ?? getWeaponImpactProfile(bullet?.weaponId, bullet?.charged);
  const roundedDamage = Math.max(1, Math.round(finalDamage));
  const label = profile.textPrefix ? `${profile.textPrefix} ${roundedDamage}` : `${roundedDamage}`;
  spawnWeaponImpactParticles(enemy.x, enemy.y, profile, bullet);
  markOpeningShowcaseWeaponEffect(enemy, profile);
  if (currentChapterIndex > 0) {
    markChapterShowcase("effect", {
      trigger: "weapon",
      effectLabel: profile?.label ?? player?.weapon?.name ?? "命中",
      x: enemy.x,
      y: enemy.y,
    });
  }
  spawnFloatingText(
    enemy.x + random(-10, 10),
    enemy.y - (enemy.radius ?? 18) - 12,
    label,
    profile.color,
    {
      size: profile.charged ? 16 : 14,
      life: profile.charged ? 0.72 : 0.58,
      vy: profile.charged ? -54 : -44,
    },
  );
  playAudioCue(profile.cue, { intensity: clamp(roundedDamage / 24, 0.52, 1.45) });
  world.cameraShake = Math.max(world.cameraShake, profile.shake ?? 0);
}

function fireWeaponAt(target) {
  const weapon = player.weapon;
  const count = Math.max(1, Math.round(weapon.projectileCount));
  const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
  const spread = weapon.spread ?? 0;
  weapon.shotsFired += 1;
  const trait = weapon.trait;
  const charged = trait?.type === "chargedShot" && weapon.shotsFired % trait.every === 0;
  const impactProfile = getWeaponImpactProfile(weapon.id, charged);

  for (let index = 0; index < count; index += 1) {
    const centered = index - (count - 1) / 2;
    const angle = baseAngle + centered * spread;
    bullets.push({
      x: player.x,
      y: player.y - 8,
      vx: Math.cos(angle) * weapon.bulletSpeed,
      vy: Math.sin(angle) * weapon.bulletSpeed,
      angle,
      weaponId: weapon.id,
      charged,
      impactProfile,
      radius: weapon.bulletSize + (charged ? trait.bulletSizeAdd : 0),
      damage: weapon.damage * (charged ? trait.damageMultiplier : 1),
      color: charged ? trait.color : weapon.color,
      assetKey: weapon.projectileAssetKey,
      assetWidth: (weapon.projectileWidth ?? 28) + (charged ? 8 : 0),
      assetHeight: (weapon.projectileHeight ?? 28) + (charged ? 5 : 0),
      animPhase: random(0, Math.PI * 2),
      spin: weapon.projectileAssetKey === "projectileKeycap" ? random(-7, 7) : random(-1.2, 1.2),
      life: weapon.range / weapon.bulletSpeed,
      pierce: Math.round(weapon.pierce),
      knockback: trait?.type === "knockback" ? trait.force : 0,
      slowFactor: trait?.type === "slowOnHit" ? trait.factor : 1,
      slowDuration: trait?.type === "slowOnHit" ? trait.duration : 0,
      hitTargets: new Set(),
    });
  }
  playAudioCue("weapon");
}

function spawnEnemyWave(count = 2) {
  const pool = getEnemySpawnPool();
  for (let index = 0; index < count; index += 1) {
    const side = Math.floor(random(0, 4));
    const type = pool[Math.floor(random(0, pool.length))] ?? "stress";
    const point = getMapSpawnPoint(side);
    const x = point.x;
    const y = point.y;
    spawnEnemyNear(x, y, type);
  }
}

function getMapSpawnPoint(side = 0) {
  const map = currentMap();
  const points = map.spawnPoints ?? [];
  const fallback = [
    { x: random(80, world.width - 80), y: 92 },
    { x: world.width - 64, y: random(100, world.height - 80) },
    { x: random(80, world.width - 80), y: world.height - 42 },
    { x: 64, y: random(100, world.height - 80) },
  ];
  const candidates = points.length ? points : fallback;
  const preferred = candidates[side % candidates.length] ?? fallback[side % fallback.length];

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const x = clamp(preferred.x + random(-36, 36), 44, world.width - 44);
    const y = clamp(preferred.y + random(-34, 34), 88, world.height - 44);
    if (!isPointBlockedByMap(x, y, 22)) {
      return { x, y };
    }
  }

  return { x: preferred.x, y: preferred.y };
}

function updateMapZones(dt) {
  const zones = getMapZones();
  if (!zones.length || world.mode !== "playing") {
    return;
  }

  for (const zone of zones) {
    if (!pointInRect(player.x, player.y, zone)) {
      continue;
    }

    if (zone.damage && world.mapHazardCooldown <= 0) {
      damagePlayer(zone.damage, zone.log ?? `${zone.label}正在吞掉稳定帧。`);
      world.mapHazardCooldown = zone.cooldown ?? 1.2;
    }

    if (zone.backlashPerSecond) {
      player.backlash = clamp(player.backlash + zone.backlashPerSecond * dt, 0, 100);
    }
  }
}

function getMapMoveMultiplier(entity, isPlayer = false) {
  let factor = 1;
  for (const zone of getMapZones()) {
    if (!zone.slowFactor || (!isPlayer && zone.affectsEnemies === false)) {
      continue;
    }
    if (pointInRect(entity.x, entity.y, zone)) {
      factor = Math.min(factor, zone.slowFactor);
    }
  }
  for (const hazard of enemyHazards ?? []) {
    if (!hazard.slowFactor || (!isPlayer && hazard.affectsEnemies === false)) {
      continue;
    }
    if (distance(entity, hazard) <= hazard.radius + (entity.radius ?? 0)) {
      factor = Math.min(factor, hazard.slowFactor);
    }
  }
  return factor;
}

function getEnemySpawnPool() {
  const step = chapterState?.stepIndex ?? 0;
  const pools = currentChapter().enemyPools;
  if (pools) {
    if (step >= 4 || chapterState?.finished) {
      return pools.boss ?? pools.late ?? pools.mid ?? pools.early;
    }
    if (step >= 3) {
      return pools.late ?? pools.mid ?? pools.early;
    }
    if (step >= 2) {
      return pools.mid ?? pools.early;
    }
    return pools.early ?? ["stress", "deadline"];
  }
  if (step >= 4 || chapterState?.finished) {
    return ["stress", "deadline", "floatError", "queueSnake", "promise", "stackPile", "inspectionProbe"];
  }
  if (step >= 3) {
    return ["stress", "deadline", "deadline", "floatError", "queueSnake", "promise", "stackPile"];
  }
  if (step >= 2) {
    return ["stress", "stress", "deadline", "floatError", "queueSnake"];
  }
  return ["stress", "stress", "deadline"];
}

function applyEnemyDamage(enemy, amount, source = "weapon") {
  let finalDamage = amount;
  const mechanic = enemy.mechanic;

  if (mechanic?.type === "shieldAura" && enemy.shieldActive) {
    finalDamage *= mechanic.damageMultiplier ?? 0.42;
    enemy.shieldFlash = 0.22;
    if (source === "pulse") {
      enemy.shieldActive = false;
      enemy.shieldTimer = mechanic.refresh ?? 4;
      burst(enemy.x, enemy.y, mechanic.breakColor ?? "#96e072", 18);
      setLog(mechanic.breakLog ?? "修复脉冲短暂拆掉了承诺护盾。");
    }
  }

  if (mechanic?.type === "phaseShift" && enemy.phaseAlpha > 0.45 && source === "weapon") {
    finalDamage *= mechanic.phaseDamageMultiplier ?? 0.55;
  }

  enemy.hp -= finalDamage;
  enemy.hitFlash = Math.max(enemy.hitFlash ?? 0, 0.14);
  if (finalDamage > 0) {
    claimOpeningSurgeFirstStrike(enemy, source);
  }
  if (["pulse", "ally"].includes(source)) {
    const color = source === "pulse" ? "#72a5ff" : source === "ally" ? "#96e072" : "#f1c15b";
    spawnFloatingText(enemy.x + random(-10, 10), enemy.y - enemy.radius - 12, `${Math.max(1, Math.round(finalDamage))}`, color);
  }
  return finalDamage;
}

function dash() {
  let { dx, dy } = getMoveInput();
  if (!dx && !dy) {
    dy = -1;
  }
  const len = Math.hypot(dx, dy);
  player.x = clamp(player.x + (dx / len) * player.dashPower, player.radius, world.width - player.radius);
  player.y = clamp(player.y + (dy / len) * player.dashPower, 76, world.height - player.radius);
  resolveDeskCollision(player);
  player.bugPoints -= 1;
  player.invulnerable = 0.28;
  world.dashCooldown = 0.8;
  burst(player.x, player.y, "#5de2d1", 16);
  playAudioCue("dash");
}

function repairPulse() {
  player.bugPoints -= player.pulseCost;
  player.backlash = clamp(player.backlash + 4, 0, 100);
  world.pulseCooldown = 0.55;
  world.cameraShake = 0.12;
  burst(player.x, player.y, "#72a5ff", 30);

  const allHostiles = [...enemies, ...cleaners];
  if (boss && boss.hp > 0) {
    allHostiles.push(boss);
  }
  for (const enemy of allHostiles) {
    if (distance(enemy, player) <= player.pulseRadius + enemy.radius) {
      applyEnemyDamage(enemy, player.pulseDamage, "pulse");
      enemy.hitFlash = Math.max(enemy.hitFlash ?? 0, 0.16);
    }
  }
  for (const hazard of protocolHazards) {
    if (hazard.destructible && distance(hazard, player) <= player.pulseRadius + hazard.radius) {
      hazard.hp -= player.pulseDamage;
      hazard.hitFlash = 0.16;
    }
  }
  clearDefeatedHostiles();
  clearResolvedProtocolHazards();
  checkBossDefeat();
  setLog("安渡把错误码拍成了一圈蓝色涟漪。");
  playAudioCue("pulse");
}

function updateBullets(dt) {
  for (const bullet of bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;

    if (isPointBlockedByMap(bullet.x, bullet.y, bullet.radius)) {
      bullet.life = 0;
      burst(bullet.x, bullet.y, bullet.color, 5);
      continue;
    }

    const hostiles = [...enemies, ...cleaners];
    if (boss && boss.hp > 0) {
      hostiles.push(boss);
    }
    for (const enemy of hostiles) {
      if (bullet.hitTargets.has(enemy) || distance(bullet, enemy) > bullet.radius + enemy.radius) {
        continue;
      }

      const dealt = applyEnemyDamage(enemy, bullet.damage, "weapon");
      bullet.hitTargets.add(enemy);
      spawnWeaponImpactFeedback(enemy, bullet, dealt);
      if (bullet.knockback > 0) {
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        enemy.x = clamp(enemy.x + Math.cos(angle) * bullet.knockback, enemy.radius, world.width - enemy.radius);
        enemy.y = clamp(enemy.y + Math.sin(angle) * bullet.knockback, 76, world.height - enemy.radius);
      }
      if (bullet.slowDuration > 0) {
        enemy.slowTimer = Math.max(enemy.slowTimer, bullet.slowDuration);
        enemy.slowFactor = Math.min(enemy.slowFactor, bullet.slowFactor);
      }

      if (bullet.pierce <= 0) {
        bullet.life = 0;
        break;
      }
      bullet.pierce -= 1;
    }

    if (bullet.life <= 0) {
      continue;
    }

    for (const hazard of protocolHazards) {
      if (!hazard.destructible || bullet.hitTargets.has(hazard) || distance(bullet, hazard) > bullet.radius + hazard.radius) {
        continue;
      }
      hazard.hp -= bullet.damage;
      hazard.hitFlash = 0.14;
      bullet.hitTargets.add(hazard);
      spawnWeaponImpactParticles(hazard.x, hazard.y, bullet.impactProfile ?? getWeaponImpactProfile(bullet.weaponId, bullet.charged), bullet);
      if (bullet.pierce <= 0) {
        bullet.life = 0;
        break;
      }
      bullet.pierce -= 1;
    }
  }

  clearDefeatedHostiles();
  clearResolvedProtocolHazards();
  checkBossDefeat();
  bullets = bullets.filter((bullet) => {
    return bullet.life > 0 && bullet.x > -40 && bullet.x < world.width + 40 && bullet.y > 40 && bullet.y < world.height + 40;
  });
}

function clearDefeatedHostiles() {
  const deferredSpawns = [];
  enemies = enemies.filter((enemy) => {
    if (enemy.hp > 0) {
      return true;
    }
    defeatEnemy(enemy, 14, deferredSpawns);
    return false;
  });
  cleaners = cleaners.filter((enemy) => {
    if (enemy.hp > 0) {
      return true;
    }
    defeatEnemy(enemy, 20, deferredSpawns);
    return false;
  });
  for (const spawn of deferredSpawns) {
    spawnEnemyNear(spawn.x, spawn.y, spawn.type, spawn.overrides);
  }
}

function defeatEnemy(enemy, particleCount, deferredSpawns = null) {
  runStats.enemiesDefeated += 1;
  updateNightHook(0);
  registerCombatTempoHit(enemy);
  registerOpeningSurgeDefeat(enemy);
  evaluateRunAchievements("enemy_defeated");
  burst(enemy.x, enemy.y, enemy.deathColor, particleCount);
  playAudioCue("enemy-down");
  applyEnemyDeathMechanic(enemy, deferredSpawns);
  spawnBugPickup(enemy.x, enemy.y, enemy.bugValue, enemy.xpValue);
  if (Math.random() < 0.22) {
    spawnBugPickup(enemy.x + random(-18, 18), enemy.y + random(-18, 18), 1, 1);
  }
}

function updateBoss(dt) {
  if (!boss || boss.hp <= 0) {
    return;
  }

  boss.hitFlash = Math.max(0, boss.hitFlash - dt);
  boss.logTimer = Math.max(0, boss.logTimer - dt);
  boss.slowTimer = Math.max(0, boss.slowTimer - dt);
  if (boss.slowTimer <= 0) {
    boss.slowFactor = 1;
  }

  const previousPhase = boss.phase;
  if (boss.hp <= boss.maxHp * 0.4) {
    boss.phase = 3;
  } else if (boss.hp <= boss.maxHp * 0.7) {
    boss.phase = 2;
  } else {
    boss.phase = 1;
  }

  if (boss.phase !== previousPhase) {
    const defaultPhaseLog = boss.phase === 2 ? "周行的外卖箱开始触发超时重传。" : "错误路线开始 DNS 解析，取餐区变成一张发烫的网。";
    const phaseLog = boss.phaseLogs?.[boss.phase] ?? defaultPhaseLog;
    setLog(phaseLog);
    world.cameraShake = 0.2;
    playAudioCue("boss-phase");
    boss.attackCooldown = Math.min(boss.attackCooldown, boss.phase === 3 ? 0.22 : 0.36);
    if (currentChapterIndex > 0 && boss.phase >= 2) {
      markChapterShowcase("boss", {
        trigger: "boss-phase",
        callout: `Boss 阶段 ${boss.phase} 弱点窗口`,
        x: boss.x,
        y: boss.y,
      });
    }
  }

  if (boss.state === "handshake") {
    boss.stateTimer -= dt;
    if (boss.stateTimer <= 0) {
      startBossDash();
    }
    return;
  }

  if (boss.state === "dash") {
    updateBossDash(dt);
    return;
  }

  boss.attackCooldown -= dt;
  driftBossTowardPlayer(dt);

  if (distance(boss, player) < boss.radius + player.radius) {
    damagePlayer(boss.damage, boss.collisionLog ?? "周行被错误协议拖着冲撞过来：订单必须送达。");
  }

  if (boss.attackCooldown <= 0) {
    chooseBossAttack();
  }
}

function driftBossTowardPlayer(dt) {
  const tuning = getBossTuning();
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  const desiredDistance = tuning.desiredDistance;
  const currentDistance = distance(player, boss);
  const direction = currentDistance > desiredDistance ? 1 : -0.35;
  const speed = boss.speed * tuning.speedMultiplier * boss.slowFactor;
  boss.x = clamp(boss.x + Math.cos(angle) * speed * direction * dt, boss.radius, world.width - boss.radius);
  boss.y = clamp(boss.y + Math.sin(angle) * speed * direction * dt, 86, world.height - boss.radius);
  resolveDeskCollision(boss);
}

function getBossTuning() {
  const base = bossPhaseTuning[boss?.phase ?? 1] ?? bossPhaseTuning[1];
  const difficulty = boss?.difficulty ?? 1;
  return {
    ...base,
    speedMultiplier: base.speedMultiplier * (0.92 + difficulty * 0.08),
    dashDamage: Math.ceil(base.dashDamage * difficulty),
    retransmitDamage: Math.ceil(base.retransmitDamage * difficulty),
    udpCount: Math.ceil(base.udpCount * difficulty),
    udpDamage: Math.ceil(base.udpDamage * difficulty),
    ftpHp: Math.ceil(base.ftpHp * difficulty),
    ftpBlastDamage: Math.ceil(base.ftpBlastDamage * difficulty),
    dnsCount: Math.ceil(base.dnsCount * difficulty),
    dnsDamage: Math.ceil(base.dnsDamage * difficulty),
  };
}

function chooseBossAttack() {
  const roll = Math.random();
  const archetype = boss?.archetype ?? "delivery";

  if (archetype === "timetable") {
    chooseTimetableBossAttack(roll);
    return;
  }

  if (archetype === "index") {
    chooseIndexBossAttack(roll);
    return;
  }

  if (archetype === "pledge") {
    choosePledgeBossAttack(roll);
    return;
  }

  if (archetype === "rule") {
    chooseRuleBossAttack(roll);
    return;
  }

  chooseDeliveryBossAttack(roll);
}

function chooseDeliveryBossAttack(roll) {
  if (boss.phase === 3) {
    if (roll < 0.26) {
      startFtpTransfer();
      return;
    }
    if (roll < 0.6) {
      startUdpBurst();
      return;
    }
    if (roll < 0.84) {
      startDnsError();
      return;
    }
    startTcpHandshake();
    return;
  }

  if (boss.phase === 2) {
    if (roll < 0.18) {
      startFtpTransfer();
      return;
    }
    if (roll < 0.66) {
      startUdpBurst();
      return;
    }
    startTcpHandshake();
    return;
  }

  if (roll < 0.26) {
    startUdpBurst();
    return;
  }

  startTcpHandshake();
}

function chooseTimetableBossAttack(roll) {
  if (boss.phase === 3) {
    if (roll < 0.36) {
      startTimetableBeat();
      return;
    }
    if (roll < 0.58) {
      startDnsError();
      return;
    }
    if (roll < 0.8) {
      startTcpHandshake();
      return;
    }
    startFtpTransfer();
    return;
  }

  if (boss.phase === 2) {
    if (roll < 0.34) {
      startTimetableBeat();
      return;
    }
    if (roll < 0.64) {
      startUdpBurst();
      return;
    }
    startTcpHandshake();
    return;
  }

  if (roll < 0.34) {
    startTimetableBeat();
    return;
  }
  if (roll < 0.72) {
    startTcpHandshake();
    return;
  }
  startUdpBurst();
}

function chooseIndexBossAttack(roll) {
  if (boss.phase === 3) {
    if (roll < 0.34) {
      startIndexLock();
      return;
    }
    if (roll < 0.52) {
      startFtpTransfer();
      return;
    }
    if (roll < 0.76) {
      startUdpBurst();
      return;
    }
    startTcpHandshake();
    return;
  }

  if (boss.phase === 2) {
    if (roll < 0.42) {
      startIndexLock();
      return;
    }
    if (roll < 0.64) {
      startDnsError();
      return;
    }
    if (roll < 0.84) {
      startTcpHandshake();
      return;
    }
    startUdpBurst();
    return;
  }

  if (roll < 0.4) {
    startIndexLock();
    return;
  }
  if (roll < 0.74) {
    startTcpHandshake();
    return;
  }
  startUdpBurst();
}

function choosePledgeBossAttack(roll) {
  if (boss.phase === 3) {
    if (roll < 0.36) {
      startPledgeAnchor();
      return;
    }
    if (roll < 0.58) {
      startFtpTransfer();
      return;
    }
    if (roll < 0.8) {
      startTcpHandshake();
      return;
    }
    startDnsError();
    return;
  }

  if (boss.phase === 2) {
    if (roll < 0.38) {
      startPledgeAnchor();
      return;
    }
    if (roll < 0.7) {
      startTcpHandshake();
      return;
    }
    startUdpBurst();
    return;
  }

  if (roll < 0.34) {
    startPledgeAnchor();
    return;
  }
  if (roll < 0.72) {
    startTcpHandshake();
    return;
  }
  startUdpBurst();
}

function chooseRuleBossAttack(roll) {
  if (boss.phase === 3) {
    if (roll < 0.34) {
      startRuleScan();
      return;
    }
    if (roll < 0.54) {
      startRuleAppeal();
      return;
    }
    if (roll < 0.72) {
      startDnsError();
      return;
    }
    if (roll < 0.9) {
      startTcpHandshake();
      return;
    }
    startUdpBurst();
    return;
  }

  if (boss.phase === 2) {
    if (roll < 0.32) {
      startRuleScan();
      return;
    }
    if (roll < 0.52) {
      startRuleAppeal();
      return;
    }
    if (roll < 0.78) {
      startTcpHandshake();
      return;
    }
    startFtpTransfer();
    return;
  }

  if (roll < 0.36) {
    startRuleScan();
    return;
  }
  if (roll < 0.72) {
    startTcpHandshake();
    return;
  }
  startUdpBurst();
}

function setBossAttackLog(message, cooldown = 3.2) {
  if (!message || boss.logTimer > 0) {
    return;
  }
  setLog(message);
  playAudioCue("danger");
  boss.logTimer = cooldown;
}

function startTimetableBeat() {
  const difficulty = boss?.difficulty ?? 1;
  const phase = boss?.phase ?? 1;
  const count = phase + 2;
  for (let index = 0; index < count; index += 1) {
    const angle = index === 0 ? random(0, Math.PI * 2) : (Math.PI * 2 * index) / count + random(-0.28, 0.28);
    const offset = index === 0 ? random(10, 42) : random(84, 186);
    const point = findNearestFreePoint(
      clamp(player.x + Math.cos(angle) * offset, 70, world.width - 70),
      clamp(player.y + Math.sin(angle) * offset, 98, world.height - 70),
      26
    );
    const timer = 0.88 + index * 0.13;
    protocolHazards.push({
      type: "timetableBeat",
      x: point.x,
      y: point.y,
      radius: 50 + phase * 6,
      timer,
      maxTimer: timer,
      damage: Math.ceil((12 + phase * 4) * difficulty),
      color: boss.themeColor ?? "#72a5ff",
      triggered: false,
    });
  }
  boss.attackCooldown = phase === 3 ? 0.7 : 0.92;
  setBossAttackLog("时刻表开始打拍：红圈会按第二拍落下，离开圈外就能反制。");
}

function startIndexLock() {
  const difficulty = boss?.difficulty ?? 1;
  const phase = boss?.phase ?? 1;
  const count = phase >= 3 ? 2 : 1;
  for (let index = 0; index < count; index += 1) {
    const angle = random(0, Math.PI * 2);
    const point = findNearestFreePoint(
      clamp(player.x + Math.cos(angle) * random(24, 128), 76, world.width - 76),
      clamp(player.y + Math.sin(angle) * random(24, 128), 104, world.height - 76),
      30
    );
    const timer = 1.18 + index * 0.18;
    const hp = Math.ceil((62 + phase * 30) * difficulty);
    protocolHazards.push({
      type: "indexLock",
      x: point.x,
      y: point.y,
      radius: 46 + phase * 5,
      timer,
      maxTimer: timer,
      hp,
      maxHp: hp,
      damage: Math.ceil((13 + phase * 4) * difficulty),
      destructible: true,
      hitFlash: 0,
      color: boss.themeColor ?? "#96e072",
      triggered: false,
    });
  }
  boss.attackCooldown = phase === 3 ? 0.78 : 0.98;
  setBossAttackLog("索引锁正在给你的位置建表：打掉锁芯可以让 Boss 短暂暴露。");
}

function startPledgeAnchor() {
  if (protocolHazards.some((hazard) => hazard.type === "pledgeAnchor")) {
    startTcpHandshake();
    return;
  }

  const difficulty = boss?.difficulty ?? 1;
  const phase = boss?.phase ?? 1;
  const angle = random(0, Math.PI * 2);
  const point = findNearestFreePoint(
    clamp(player.x + Math.cos(angle) * random(72, 184), 78, world.width - 78),
    clamp(player.y + Math.sin(angle) * random(72, 184), 106, world.height - 78),
    34
  );
  const hp = Math.ceil((120 + phase * 42) * difficulty);
  protocolHazards.push({
    type: "pledgeAnchor",
    x: point.x,
    y: point.y,
    radius: 54 + phase * 6,
    timer: 4.2,
    maxTimer: 4.2,
    hp,
    maxHp: hp,
    blastDamage: Math.ceil((17 + phase * 5) * difficulty),
    destructible: true,
    hitFlash: 0,
    color: boss.themeColor ?? "#96e072",
  });
  boss.attackCooldown = 1.05;
  setBossAttackLog("根承诺钉下责任锚：尽快打掉，破锚会打开 Boss 克制窗口。");
}

function startRuleScan() {
  const difficulty = boss?.difficulty ?? 1;
  const phase = boss?.phase ?? 1;
  const count = phase >= 3 ? 3 : phase >= 2 ? 2 : 1;
  for (let index = 0; index < count; index += 1) {
    const horizontal = index % 2 === 0 ? Math.random() < 0.68 : Math.random() < 0.32;
    const thickness = 84 + phase * 12;
    const timer = 0.82 + index * 0.14;
    const scan = horizontal
      ? {
          x: 0,
          y: clamp(player.y + random(-150, 150), 88, world.height - thickness - 24),
          w: world.width,
          h: thickness,
        }
      : {
          x: clamp(player.x + random(-180, 180), 32, world.width - thickness - 32),
          y: 76,
          w: thickness,
          h: world.height - 88,
        };
    protocolHazards.push({
      type: "ruleScan",
      ...scan,
      timer,
      maxTimer: timer,
      activeTime: 0.28 + phase * 0.06,
      maxActiveTime: 0.28 + phase * 0.06,
      damage: Math.ceil((14 + phase * 4) * difficulty),
      color: boss.packageColor ?? "#ef6a70",
      damaged: false,
    });
  }
  boss.attackCooldown = phase === 3 ? 0.66 : 0.86;
  setBossAttackLog("公共规则引擎开始清零扫描：红色扫描带亮起后只判定一次，横向走位能躲。");
}

function startRuleAppeal() {
  if (protocolHazards.some((hazard) => hazard.type === "ruleAppeal")) {
    startRuleScan();
    return;
  }

  const difficulty = boss?.difficulty ?? 1;
  const phase = boss?.phase ?? 1;
  const payloadPoint = currentMap().bossPayload ?? { x: boss.x, y: boss.y };
  const point = findNearestFreePoint(
    clamp((payloadPoint.x + player.x) / 2 + random(-120, 120), 78, world.width - 78),
    clamp((payloadPoint.y + player.y) / 2 + random(-90, 90), 106, world.height - 78),
    34
  );
  const hp = Math.ceil((140 + phase * 48) * difficulty);
  protocolHazards.push({
    type: "ruleAppeal",
    x: point.x,
    y: point.y,
    radius: 56 + phase * 4,
    timer: 3.7,
    maxTimer: 3.7,
    hp,
    maxHp: hp,
    blastDamage: Math.ceil((18 + phase * 5) * difficulty),
    destructible: true,
    hitFlash: 0,
    color: "#d8e0e8",
  });
  boss.attackCooldown = 0.94;
  setBossAttackLog("申诉窗口短暂开放：击碎窗口会清掉扫描带，并让最终 Boss 进入弱化。");
}

function startTcpHandshake() {
  const tuning = getBossTuning();
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  const routeLength = tuning.routeLength;
  const targetX = clamp(boss.x + Math.cos(angle) * routeLength, 52, world.width - 52);
  const targetY = clamp(boss.y + Math.sin(angle) * routeLength, 92, world.height - 52);
  boss.lastRoute = { x1: boss.x, y1: boss.y, x2: targetX, y2: targetY };
  boss.state = "handshake";
  boss.stateTimer = tuning.handshakeTime;
  boss.attackCooldown = 0.82;
  if (boss.logTimer <= 0) {
    setLog(boss.attackLogs?.handshake ?? "TCP 三次握手：路线先确认三次，第三次亮起后周行会冲刺。");
    playAudioCue("danger");
    boss.logTimer = 4;
  }
}

function startBossDash() {
  const route = boss.lastRoute;
  const tuning = getBossTuning();
  boss.state = "dash";
  boss.dash = {
    ...route,
    elapsed: 0,
    duration: tuning.dashDuration,
    damage: tuning.dashDamage,
    damaged: false,
  };
}

function updateBossDash(dt) {
  boss.dash.elapsed += dt;
  const t = clamp(boss.dash.elapsed / boss.dash.duration, 0, 1);
  boss.x = boss.dash.x1 + (boss.dash.x2 - boss.dash.x1) * t;
  boss.y = boss.dash.y1 + (boss.dash.y2 - boss.dash.y1) * t;

  if (!boss.dash.damaged && distance(boss, player) < boss.radius + player.radius + 8) {
    boss.dash.damaged = true;
    damagePlayer(boss.dash.damage, boss.attackLogs?.dashHit ?? "TCP ACK 已确认，周行沿着错误路线撞了过来。");
  }

  if (t >= 1) {
    if (boss.phase >= 2) {
      addRetransmitRoute(boss.dash);
    }
    boss.state = "idle";
    boss.dash = null;
    boss.attackCooldown = getBossTuning().postDashCooldown;
  }
}

function addRetransmitRoute(route) {
  const tuning = getBossTuning();
  protocolHazards.push({
    type: "retransmit",
    x1: route.x1,
    y1: route.y1,
    x2: route.x2,
    y2: route.y2,
    timer: tuning.retransmitTimer,
    activeTime: tuning.retransmitActiveTime,
    damage: tuning.retransmitDamage,
    damaged: false,
  });
}

function startUdpBurst() {
  const tuning = getBossTuning();
  const count = tuning.udpCount;
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + random(-0.14, 0.14);
    const speed = random(tuning.udpMinSpeed, tuning.udpMaxSpeed);
    protocolHazards.push({
      type: "package",
      x: boss.x,
      y: boss.y - 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: boss.phase === 3 ? 13 : 12,
      life: 3.1,
      damage: tuning.udpDamage,
      color: boss.packageColor ?? "#f1c15b",
    });
  }
  boss.attackCooldown = tuning.udpCooldown;
  setLog(boss.attackLogs?.burst ?? "UDP 乱送模式：外卖包被高速撒出，不确认谁收到了。");
  playAudioCue("danger");
}

function startFtpTransfer() {
  const tuning = getBossTuning();
  const existingFtp = protocolHazards.some((hazard) => hazard.type === "ftp");
  if (!existingFtp) {
    const payloadPoint = currentMap().bossPayload ?? { x: 870, y: 348 };
    protocolHazards.push({
      type: "ftp",
      x: payloadPoint.x,
      y: payloadPoint.y,
      radius: 44,
      hp: tuning.ftpHp,
      maxHp: tuning.ftpHp,
      timer: tuning.ftpTimer,
      phase: boss.phase,
      blastDamage: tuning.ftpBlastDamage,
      destructible: true,
      hitFlash: 0,
    });
    setLog(boss.attackLogs?.payload ?? "FTP 大件传输中：打爆中央的大件外卖包，别让它上传完成。");
    playAudioCue("danger");
  }
  boss.attackCooldown = boss.phase === 3 ? 0.82 : 1;
}

function startDnsError() {
  const tuning = getBossTuning();
  for (let index = 0; index < tuning.dnsCount; index += 1) {
    const nearPlayer = index < (boss.phase === 3 ? 3 : 2);
    protocolHazards.push({
      type: "dns",
      x: clamp((nearPlayer ? player.x : random(160, world.width - 140)) + random(-90, 90), 58, world.width - 58),
      y: clamp((nearPlayer ? player.y : random(120, world.height - 90)) + random(-70, 70), 98, world.height - 58),
      radius: tuning.dnsRadius,
      timer: tuning.dnsTimer + index * 0.08,
      damage: tuning.dnsDamage,
      triggered: false,
    });
  }
  boss.attackCooldown = boss.phase === 3 ? 0.66 : 0.9;
  setLog(boss.attackLogs?.marker ?? "DNS 地址解析错误：取餐点被翻译到了错误位置。");
  playAudioCue("danger");
}

function updateProtocolHazards(dt) {
  for (const hazard of protocolHazards) {
    if (hazard.type === "package") {
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      hazard.life -= dt;
      if (distance(hazard, player) < hazard.radius + player.radius) {
        hazard.life = 0;
        damagePlayer(hazard.damage, boss?.attackLogs?.packageHit ?? "UDP 外卖包砸在身上，快是快，就是不讲道理。");
      }
    }

    if (hazard.type === "retransmit") {
      hazard.timer -= dt;
      if (hazard.timer <= 0) {
        hazard.activeTime -= dt;
        if (!hazard.damaged && distancePointToSegment(player, hazard) < player.radius + 18) {
          hazard.damaged = true;
          damagePlayer(hazard.damage ?? 16, boss?.attackLogs?.retransmitHit ?? "超时重传影子沿旧路线补送了一次。");
        }
      }
    }

    if (hazard.type === "ftp") {
      hazard.timer -= dt;
      hazard.hitFlash = Math.max(0, hazard.hitFlash - dt);
      if (hazard.timer <= 0) {
        hazard.exploded = true;
        hazard.remove = true;
        world.cameraShake = 0.24;
        burst(hazard.x, hazard.y, "#f1c15b", 34);
        spawnEnemyNear(hazard.x - 64, hazard.y + 24, "deadline");
        spawnEnemyNear(hazard.x + 64, hazard.y + 24, "stress");
        if ((hazard.phase ?? 1) >= 3) {
          spawnEnemyNear(hazard.x, hazard.y - 56, "queueSnake");
        }
        if (distance(hazard, player) < 190) {
          damagePlayer(hazard.blastDamage ?? 20, boss?.attackLogs?.payloadBlast ?? "FTP 大件上传完成，整片取餐区被热汤数据炸开。");
        } else {
          setLog(boss?.attackLogs?.payloadSpawn ?? "FTP 大件上传完成，新的异常从外卖箱里爬了出来。");
        }
      }
    }

    if (hazard.type === "dns") {
      hazard.timer -= dt;
      if (hazard.timer <= 0 && !hazard.triggered) {
        hazard.triggered = true;
        hazard.remove = true;
        burst(hazard.x, hazard.y, "#72a5ff", 22);
        if (distance(hazard, player) < hazard.radius + player.radius) {
          damagePlayer(hazard.damage, boss?.attackLogs?.markerHit ?? "DNS 解析错位，外卖炸弹落在了你的坐标上。");
        }
      }
    }

    if (hazard.type === "timetableBeat") {
      hazard.timer -= dt;
      if (hazard.timer <= 0 && !hazard.triggered) {
        hazard.triggered = true;
        hazard.remove = true;
        world.cameraShake = 0.14;
        burst(hazard.x, hazard.y, hazard.color ?? "#72a5ff", 18);
        if (distance(hazard, player) < hazard.radius + player.radius) {
          damagePlayer(hazard.damage, "第二拍准点落下，你被时刻表钉在错误班次上。");
        }
      }
    }

    if (hazard.type === "indexLock") {
      hazard.timer -= dt;
      hazard.hitFlash = Math.max(0, hazard.hitFlash - dt);
      if (hazard.timer <= 0 && !hazard.triggered) {
        hazard.triggered = true;
        hazard.remove = true;
        burst(hazard.x, hazard.y, hazard.color ?? "#96e072", 20);
        if (distance(hazard, player) < hazard.radius + player.radius) {
          damagePlayer(hazard.damage, "索引锁命中，当前位置被强制写进夜市短码表。");
        }
        if ((boss?.phase ?? 1) >= 3 && enemies.length + cleaners.length < 11) {
          spawnEnemyNear(hazard.x, hazard.y, "inspectionProbe", { hpMultiplier: 0.72, speedMultiplier: 1.08 });
        }
      }
    }

    if (hazard.type === "pledgeAnchor") {
      hazard.timer -= dt;
      hazard.hitFlash = Math.max(0, hazard.hitFlash - dt);
      if (hazard.timer <= 0) {
        hazard.remove = true;
        world.cameraShake = 0.22;
        burst(hazard.x, hazard.y, hazard.color ?? "#96e072", 28);
        spawnEnemyNear(hazard.x - 36, hazard.y + 24, "promise", { hpMultiplier: 0.76 });
        if ((boss?.phase ?? 1) >= 2) {
          spawnEnemyNear(hazard.x + 42, hazard.y - 16, "stackPile", { hpMultiplier: 0.7 });
        }
        if (distance(hazard, player) < hazard.radius + player.radius + 58) {
          damagePlayer(hazard.blastDamage ?? 22, "责任锚兑现失败，未完成承诺在脚下炸开。");
        } else {
          setBossAttackLog("责任锚没有被打掉，新的承诺实体从锚点里挤了出来。", 2.6);
        }
      }
    }

    if (hazard.type === "ruleScan") {
      if (hazard.timer > 0) {
        hazard.timer -= dt;
      } else {
        hazard.activeTime -= dt;
        if (!hazard.damaged && circleOverlapsRect(player.x, player.y, player.radius, hazard)) {
          hazard.damaged = true;
          damagePlayer(hazard.damage ?? 20, "清零扫描带命中，公共规则试图把差异压成同一个值。");
        }
        if (hazard.activeTime <= 0) {
          hazard.remove = true;
        }
      }
    }

    if (hazard.type === "ruleAppeal") {
      hazard.timer -= dt;
      hazard.hitFlash = Math.max(0, hazard.hitFlash - dt);
      if (hazard.timer <= 0) {
        hazard.remove = true;
        world.cameraShake = 0.24;
        burst(hazard.x, hazard.y, "#d8e0e8", 30);
        spawnEnemyNear(hazard.x, hazard.y, "inspectionProbe", { hpMultiplier: 0.86, speedMultiplier: 1.12 });
        if (distance(hazard, player) < hazard.radius + player.radius + 76) {
          damagePlayer(hazard.blastDamage ?? 24, "申诉窗口关闭，未提交的反例被清零流程反噬。");
        } else {
          setBossAttackLog("申诉窗口关闭，新的巡检探针开始复核战场。", 2.6);
        }
      }
    }
  }

  clearResolvedProtocolHazards();
}

function clearResolvedProtocolHazards() {
  protocolHazards = protocolHazards.filter((hazard) => {
    if (hazard.type === "package") {
      return hazard.life > 0 && hazard.x > -80 && hazard.x < world.width + 80 && hazard.y > 40 && hazard.y < world.height + 80;
    }

    if (hazard.type === "retransmit") {
      return hazard.activeTime > 0;
    }

    if (hazard.type === "ftp" && hazard.hp <= 0 && !hazard.exploded) {
      burst(hazard.x, hazard.y, "#5de2d1", 32);
      spawnBugPickup(hazard.x, hazard.y, 2, 5);
      setLog(boss?.attackLogs?.payloadBreak ?? "FTP 大件包被提前打断，传输队列少了一大截。");
      return false;
    }

    if (hazard.type === "indexLock" && hazard.hp <= 0 && !hazard.triggered) {
      burst(hazard.x, hazard.y, hazard.color ?? "#96e072", 26);
      spawnBugPickup(hazard.x, hazard.y, 1, 3);
      openBossWeakWindow(1.55, 0.58, "索引锁芯被打碎，Boss 的最短路径临时失准。", hazard.color ?? "#96e072");
      return false;
    }

    if (hazard.type === "pledgeAnchor" && hazard.hp <= 0) {
      burst(hazard.x, hazard.y, hazard.color ?? "#96e072", 34);
      spawnBugPickup(hazard.x, hazard.y, 2, 4);
      openBossWeakWindow(2.25, 0.46, "责任锚被拆掉，根承诺短暂失去追责坐标。", hazard.color ?? "#96e072");
      return false;
    }

    if (hazard.type === "ruleAppeal" && hazard.hp <= 0) {
      for (const scan of protocolHazards) {
        if (scan.type === "ruleScan") {
          scan.remove = true;
        }
      }
      burst(hazard.x, hazard.y, "#d8e0e8", 36);
      spawnBugPickup(hazard.x, hazard.y, 2, 5);
      openBossWeakWindow(2.35, 0.42, "申诉窗口被击碎，扫描带失效，公共规则进入复核迟疑。", "#d8e0e8");
      return false;
    }

    return !hazard.remove;
  });
}

function openBossWeakWindow(duration, slowFactor, message, color) {
  if (!boss || boss.hp <= 0) {
    return;
  }
  boss.slowTimer = Math.max(boss.slowTimer ?? 0, duration);
  boss.slowFactor = Math.min(boss.slowFactor ?? 1, slowFactor);
  boss.attackCooldown = Math.max(boss.attackCooldown, Math.min(duration, 1.2));
  world.cameraShake = Math.max(world.cameraShake, 0.16);
  burst(boss.x, boss.y, color ?? boss.themeColor ?? "#5de2d1", 24);
  setLog(message);
}

function checkBossDefeat() {
  if (!boss || boss.hp > 0 || boss.defeated) {
    return;
  }

  boss.defeated = true;
  chapterState.bossCleared = true;
  runStats.bossesDefeated += 1;
  evaluateRunAchievements("boss_defeated");
  protocolHazards = [];
  enemyHazards = [];
  enemies = [];
  cleaners = [];
  const victoryStory = currentChapter().bossVictory;
  burst(boss.x, boss.y, boss.themeColor ?? "#5de2d1", 48);
  boss = null;
  world.cameraShake = 0.28;
  openStory(victoryStory);
}

function setEnemyMechanicLog(message) {
  if (!message || world.enemyLogCooldown > 0) {
    return;
  }
  setLog(message);
  world.enemyLogCooldown = 1.8;
}

function updateEnemyHazards(dt) {
  if (!enemyHazards?.length) {
    return;
  }

  for (const hazard of enemyHazards) {
    hazard.life -= dt;
    hazard.hitCooldown = Math.max(0, (hazard.hitCooldown ?? 0) - dt);
    if (hazard.armTime !== undefined) {
      hazard.armTime -= dt;
      hazard.armed = hazard.armTime <= 0;
    }

    const touchingPlayer = distance(player, hazard) <= player.radius + hazard.radius;
    if (!touchingPlayer) {
      continue;
    }

    if (hazard.backlashPerSecond) {
      player.backlash = clamp(player.backlash + hazard.backlashPerSecond * dt, 0, 100);
    }

    if (hazard.backlashOnHit && !hazard.backlashApplied && (hazard.armed ?? true)) {
      player.backlash = clamp(player.backlash + hazard.backlashOnHit, 0, 100);
      hazard.backlashApplied = true;
    }

    if (hazard.damage && (hazard.armed ?? true) && hazard.hitCooldown <= 0) {
      damagePlayer(hazard.damage, hazard.hitLog ?? "异常机制在脚下生效，稳定值被扣掉一截。");
      hazard.hitCooldown = hazard.cooldown ?? 0.8;
      if (hazard.once) {
        hazard.life = 0;
      }
    }
  }

  enemyHazards = enemyHazards.filter((hazard) => hazard.life > 0);
}

function updateEnemyMechanics(dt) {
  for (const enemy of [...enemies, ...cleaners]) {
    enemy.shieldFlash = Math.max(0, (enemy.shieldFlash ?? 0) - dt);
    enemy.phaseAlpha = Math.max(0, (enemy.phaseAlpha ?? 0) - dt * 1.8);
    enemy.scanPulse = Math.max(0, (enemy.scanPulse ?? 0) - dt * 1.4);

    const mechanic = enemy.mechanic;
    if (!mechanic) {
      continue;
    }

    if (mechanic.type === "dashAtPlayer") {
      updateDashMechanic(enemy, mechanic, dt);
    }

    if (mechanic.type === "leaveTrail") {
      updateTrailMechanic(enemy, mechanic, dt);
    }

    if (mechanic.type === "shieldAura") {
      updateShieldAuraMechanic(enemy, mechanic, dt);
    }

    if (mechanic.type === "phaseShift") {
      updatePhaseShiftMechanic(enemy, mechanic, dt);
    }

    if (mechanic.type === "scanLock") {
      updateScanLockMechanic(enemy, mechanic, dt);
    }
  }
}

function updateDashMechanic(enemy, mechanic, dt) {
  if (enemy.mechanicState === "dash") {
    return;
  }

  if (enemy.mechanicState === "telegraph") {
    enemy.mechanicStateTimer -= dt;
    enemy.hitFlash = Math.max(enemy.hitFlash ?? 0, 0.08);
    if (enemy.mechanicStateTimer > 0) {
      return;
    }

    const targetX = enemy.telegraphX ?? player.x;
    const targetY = enemy.telegraphY ?? player.y;
    const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
    enemy.dashVx = Math.cos(angle);
    enemy.dashVy = Math.sin(angle);
    enemy.mechanicState = "dash";
    enemy.mechanicStateTimer = mechanic.duration ?? 0.36;
    enemy.dashDamaged = false;
    return;
  }

  enemy.mechanicTimer -= dt;
  if (enemy.mechanicTimer > 0 || distance(enemy, player) > (mechanic.triggerRange ?? 560)) {
    return;
  }

  enemy.telegraphX = player.x;
  enemy.telegraphY = player.y;
  enemy.mechanicState = "telegraph";
  enemy.mechanicStateTimer = mechanic.telegraph ?? 0.42;
  setEnemyMechanicLog(mechanic.warnLog ?? "工单飞虫锁定了一条直线，半秒后会冲刺。");
}

function updateEnemySpecialMovement(enemy, dt) {
  if (enemy.mechanicState === "telegraph") {
    return true;
  }

  if (enemy.mechanicState !== "dash") {
    return false;
  }

  const mechanic = enemy.mechanic ?? {};
  const speed = mechanic.dashSpeed ?? 430;
  enemy.x = clamp(enemy.x + (enemy.dashVx ?? 0) * speed * dt, enemy.radius, world.width - enemy.radius);
  enemy.y = clamp(enemy.y + (enemy.dashVy ?? 0) * speed * dt, 76, world.height - enemy.radius);
  resolveDeskCollision(enemy);

  if (!enemy.dashDamaged && distance(enemy, player) < enemy.radius + player.radius + 4) {
    enemy.dashDamaged = true;
    damagePlayer(mechanic.dashDamage ?? enemy.damage + 5, mechanic.hitLog ?? enemy.hitLog);
  }

  enemy.mechanicStateTimer -= dt;
  if (enemy.mechanicStateTimer <= 0) {
    enemy.mechanicState = "idle";
    enemy.mechanicTimer = mechanic.cooldown ?? 2.6;
  }
  return true;
}

function updateTrailMechanic(enemy, mechanic, dt) {
  enemy.trailTimer -= dt;
  if (enemy.trailTimer > 0) {
    return;
  }

  enemyHazards.push({
    type: "enemyTrail",
    x: enemy.x,
    y: enemy.y,
    radius: mechanic.radius ?? 30,
    life: mechanic.life ?? 3.2,
    maxLife: mechanic.life ?? 3.2,
    slowFactor: mechanic.slowFactor ?? 0.64,
    backlashPerSecond: mechanic.backlashPerSecond ?? 0,
    affectsEnemies: false,
    color: mechanic.color ?? "#72a5ff",
  });
  enemy.trailTimer = mechanic.interval ?? 0.42;
}

function updateShieldAuraMechanic(enemy, mechanic, dt) {
  if (enemy.shieldActive) {
    return;
  }

  enemy.shieldTimer -= dt;
  if (enemy.shieldTimer <= 0) {
    enemy.shieldActive = true;
    enemy.shieldFlash = 0.5;
    burst(enemy.x, enemy.y, mechanic.color ?? "#96e072", 14);
    setEnemyMechanicLog(mechanic.refreshLog ?? "承诺球重新套上护盾，用修复脉冲可以拆掉它。");
  }
}

function updatePhaseShiftMechanic(enemy, mechanic, dt) {
  enemy.mechanicTimer -= dt;
  if (enemy.mechanicTimer > 0) {
    return;
  }

  const oldX = enemy.x;
  const oldY = enemy.y;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const angle = random(0, Math.PI * 2);
    const radius = random(mechanic.minDistance ?? 110, mechanic.maxDistance ?? 250);
    const candidate = {
      x: clamp(player.x + Math.cos(angle) * radius, enemy.radius + 24, world.width - enemy.radius - 24),
      y: clamp(player.y + Math.sin(angle) * radius, 90, world.height - enemy.radius - 24),
    };
    if (!isPointBlockedByMap(candidate.x, candidate.y, enemy.radius)) {
      enemy.x = candidate.x;
      enemy.y = candidate.y;
      break;
    }
  }
  resolveDeskCollision(enemy);
  enemy.phaseAlpha = mechanic.fadeTime ?? 0.72;
  burst(oldX, oldY, mechanic.color ?? "#8edcff", 9);
  burst(enemy.x, enemy.y, mechanic.color ?? "#8edcff", 9);
  setEnemyMechanicLog(mechanic.log ?? "浮点误差泡重新取整了坐标，短时间内远程伤害降低。");
  enemy.mechanicTimer = random((mechanic.interval ?? 3.2) * 0.82, (mechanic.interval ?? 3.2) * 1.18);
}

function updateScanLockMechanic(enemy, mechanic, dt) {
  enemy.mechanicTimer -= dt;
  if (enemy.mechanicTimer > 0) {
    return;
  }

  enemy.scanPulse = 1;
  enemyHazards.push({
    type: "scanLock",
    x: player.x,
    y: player.y,
    radius: mechanic.radius ?? 72,
    life: mechanic.life ?? 0.95,
    maxLife: mechanic.life ?? 0.95,
    armTime: mechanic.armTime ?? 0.34,
    damage: mechanic.damage ?? 9,
    cooldown: mechanic.cooldown ?? 1,
    once: true,
    backlashOnHit: mechanic.backlashOnHit ?? 4,
    color: mechanic.color ?? "#72a5ff",
    hitLog: mechanic.hitLog ?? "巡检探针完成点名扫描，当前位置被白箱记录。",
  });
  setEnemyMechanicLog(mechanic.warnLog ?? "巡检探针正在点名，离开蓝色扫描圈。");
  enemy.mechanicTimer = random((mechanic.interval ?? 3.4) * 0.84, (mechanic.interval ?? 3.4) * 1.18);
}

function applyEnemyDeathMechanic(enemy, deferredSpawns = null) {
  const mechanic = enemy.mechanic;
  if (!mechanic || mechanic.type !== "splitOnDeath") {
    return;
  }
  if ((enemy.mechanicDepth ?? 0) >= (mechanic.maxDepth ?? 1)) {
    return;
  }

  const count = mechanic.count ?? 2;
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + random(-0.24, 0.24);
    const childX = clamp(enemy.x + Math.cos(angle) * (mechanic.spread ?? 46), 48, world.width - 48);
    const childY = clamp(enemy.y + Math.sin(angle) * (mechanic.spread ?? 46), 86, world.height - 48);
    const spawn = {
      x: childX,
      y: childY,
      type: mechanic.enemyType ?? enemy.type,
      overrides: {
        hpMultiplier: mechanic.hpMultiplier ?? 0.45,
        speedMultiplier: mechanic.speedMultiplier ?? 1.12,
        scale: mechanic.scale ?? 0.72,
        mechanicDepth: (enemy.mechanicDepth ?? 0) + 1,
      },
    };
    if (deferredSpawns) {
      deferredSpawns.push(spawn);
    } else {
      spawnEnemyNear(spawn.x, spawn.y, spawn.type, spawn.overrides);
    }
  }
  setEnemyMechanicLog(mechanic.log ?? "异常实体被击破后分裂成更小的待办。");
}

function triggerFairWarningIfNeeded(beforeHp, amount, fallbackMessage) {
  if (!runStats || !player || player.maxHp <= 0 || player.hp <= 0) {
    return fallbackMessage;
  }

  const warning = normalizeFairWarningState(runStats.fairWarning);
  runStats.fairWarning = warning;
  const beforeRatio = beforeHp / player.maxHp;
  const afterRatio = player.hp / player.maxHp;
  const crossedCritical = beforeRatio > fairWarningConfig.criticalHpRatio
    && afterRatio <= fairWarningConfig.criticalHpRatio
    && !warning.criticalHpWarned;
  const crossedLow = beforeRatio > fairWarningConfig.lowHpRatio
    && afterRatio <= fairWarningConfig.lowHpRatio
    && !warning.lowHpWarned;

  if (!crossedCritical && !crossedLow) {
    return fallbackMessage;
  }

  const critical = crossedCritical;
  warning.lowHpWarned = true;
  warning.criticalHpWarned = warning.criticalHpWarned || critical;
  warning.warningCount += 1;
  warning.lastWarningAt = Date.now();
  const label = critical ? "临界生命" : "低生命";
  const hint = critical
    ? "临界生命：短暂无敌已触发，先横向拉开距离，找 bug点数或回复地标。"
    : "低生命警报：下一次失误可能会中断夜巡，先绕开红色危险区。";
  player.invulnerable = Math.max(player.invulnerable ?? 0, critical ? fairWarningConfig.criticalInvulnerable : fairWarningConfig.lowInvulnerable);
  warning.safetyWindowCount += 1;
  warning.lastCue = normalizeFairDamageCue({
    label,
    message: fallbackMessage,
    amount,
    hpBefore: beforeHp,
    hpAfter: player.hp,
    level: critical ? "critical" : "low",
    hint,
    invulnerable: player.invulnerable,
    at: warning.lastWarningAt,
  });
  world.cameraShake = Math.max(world.cameraShake ?? 0, critical ? 0.28 : 0.2);
  burst(player.x, player.y, critical ? "#ef6a70" : "#f1c15b", critical ? 24 : 16);
  spawnFloatingText(player.x, player.y - 48, label, critical ? "#ef6a70" : "#f1c15b", { size: critical ? 19 : 17, life: 0.9, vy: -36 });
  playAudioCue(critical ? "danger" : "damage", { intensity: Math.min(1.9, Math.max(0.9, amount / 14)) });
  return hint;
}

function recordFairDamageCue(beforeHp, amount, message, lethal = false) {
  if (!runStats || !player) {
    return null;
  }
  const warning = normalizeFairWarningState(runStats.fairWarning);
  const cue = normalizeFairDamageCue({
    label: lethal ? "最后一击" : "最近伤害",
    message,
    amount,
    hpBefore: beforeHp,
    hpAfter: player.hp,
    level: lethal ? "lethal" : "hit",
    hint: lethal ? "最后一击已记录，结算页会给出下一把反制路线。" : "",
    invulnerable: player.invulnerable ?? 0,
    at: Date.now(),
  });
  warning.lastHit = cue;
  if (lethal) {
    warning.lethalHit = cue;
  }
  runStats.fairWarning = warning;
  return cue;
}

function damagePlayer(amount, message) {
  if (player.invulnerable > 0 || world.mode !== "playing") {
    return false;
  }

  const beforeHp = player.hp;
  player.hp -= amount;
  runStats.damageTaken += amount;
  const lethal = player.hp <= 0;
  recordFairDamageCue(beforeHp, amount, message, lethal);
  player.invulnerable = 0.55;
  world.cameraShake = 0.18;
  burst(player.x, player.y, "#ef6a70", 10);
  playAudioCue("damage", { intensity: Math.min(1.8, Math.max(0.7, amount / 16)) });
  setLog(triggerFairWarningIfNeeded(beforeHp, amount, message));
  breakCombatTempo();
  updateNightHook(0);
  return true;
}

function updateEnemies(dt) {
  for (const enemy of [...enemies, ...cleaners]) {
    enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
    if (enemy.slowTimer <= 0) {
      enemy.slowFactor = 1;
    }
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.openingSurgeArmTime = Math.max(0, (enemy.openingSurgeArmTime ?? 0) - dt);

    if (enemy.openingSurge && enemy.openingSurgeArmTime > 0) {
      continue;
    }

    if (updateEnemySpecialMovement(enemy, dt)) {
      continue;
    }

    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const speed = enemy.speed * enemy.slowFactor * getMapMoveMultiplier(enemy, false);
    enemy.x += Math.cos(angle) * speed * dt;
    enemy.y += Math.sin(angle) * speed * dt;
    resolveDeskCollision(enemy);

    if (distance(enemy, player) < enemy.radius + player.radius && player.invulnerable <= 0) {
      damagePlayer(enemy.damage, enemy.hitLog);
    }
  }
}

function updateAllyAssist(dt) {
  if (chapterState.allies.includes("qiao-you") && player.backlash > 0) {
    player.backlash = clamp(player.backlash - dt * 0.45, 0, 100);
  }

  if (!chapterState.allies.includes("whitebox") || world.allyAssistCooldown > 0) {
    return;
  }

  const target = findNearestHostile(560);
  if (!target) {
    world.allyAssistCooldown = 1.2;
    return;
  }

  const damage = 34 + player.level * 2;
  applyEnemyDamage(target, damage, "ally");
  target.hitFlash = 0.2;
  target.slowTimer = Math.max(target.slowTimer ?? 0, 0.8);
  target.slowFactor = Math.min(target.slowFactor ?? 1, 0.62);
  burst(target.x, target.y, "#72a5ff", 12);
  if (!boss || target !== boss || boss.logTimer <= 0) {
    setLog("白箱协助单元提交反例扫描，最近异常被短暂降速。");
  }
  world.allyAssistCooldown = 2.8;
  clearDefeatedHostiles();
  checkBossDefeat();
}

function updateBugPickups(dt) {
  for (const pickup of bugPickups) {
    pickup.pulse += dt * 4;
    const pullDistance = distance(pickup, player);
    if (pullDistance < 230) {
      const angle = Math.atan2(player.y - pickup.y, player.x - pickup.x);
      pickup.vx += Math.cos(angle) * 520 * dt;
      pickup.vy += Math.sin(angle) * 520 * dt;
    }
    pickup.x += pickup.vx * dt;
    pickup.y += pickup.vy * dt;
    pickup.vx *= 0.92;
    pickup.vy *= 0.92;
  }

  bugPickups = bugPickups.filter((pickup) => {
    if (distance(pickup, player) > pickup.radius + player.radius + 18) {
      return true;
    }
    player.bugPoints += pickup.bugValue;
    addExperience(pickup.xpValue);
    burst(pickup.x, pickup.y, "#0f9f95", 10);
    playAudioCue("pickup");
    setLog(`拾取 bug 点：经验 +${pickup.xpValue}，bug点数 +${pickup.bugValue}。`);
    return false;
  });
}

function checkDiscoveryEchoCollision() {
  if (world.mode !== "playing" || !player) {
    return;
  }

  for (const echo of getMapEchoes()) {
    if (isDiscoveryEchoCollected(echo)) {
      continue;
    }
    const radius = echo.interactRadius ?? echo.radius ?? 72;
    if (distance(player, echo) <= radius + (player.radius ?? 0)) {
      collectDiscoveryEcho(echo);
      break;
    }
  }
}

function checkMapCacheCollision() {
  if (world.mode !== "playing" || !player) {
    return;
  }

  for (const cache of getMapCaches()) {
    if (isMapCacheCollected(cache)) {
      continue;
    }
    const radius = cache.interactRadius ?? cache.radius ?? 62;
    if (distance(player, cache) <= radius + (player.radius ?? 0)) {
      collectMapCache(cache);
      break;
    }
  }
}

function checkMapInteractiveCollision() {
  if (world.mode !== "playing" || !player) {
    return;
  }

  for (const device of getMapInteractives()) {
    if (isMapInteractiveActivated(device)) {
      continue;
    }
    const radius = device.interactRadius ?? device.radius ?? 68;
    if (distance(player, device) <= radius + (player.radius ?? 0)) {
      activateMapInteractive(device);
      break;
    }
  }
}

function collectDiscoveryEcho(echo) {
  if (!echo?.id || isDiscoveryEchoCollected(echo)) {
    return;
  }

  const collected = getCollectedEchoIds();
  collected.push(echo.id);
  const bugReward = Math.max(0, Number(echo.bugPoints) || 0);
  const xpReward = Math.max(0, Number(echo.xp) || 0);
  const healReward = Math.max(0, Number(echo.heal) || 0);

  player.bugPoints += bugReward;
  if (xpReward > 0) {
    addExperience(xpReward);
  }
  if (healReward > 0) {
    player.hp = clamp(player.hp + healReward, 1, player.maxHp);
  }
  const archiveReward = recordDiscoveryEchoInArchive(echo);

  burst(echo.x, echo.y, echo.color ?? "#5de2d1", 18);
  playAudioCue("pickup");
  const rewards = [
    bugReward > 0 ? `bug点数 +${bugReward}` : null,
    xpReward > 0 ? `经验 +${xpReward}` : null,
    healReward > 0 ? `生命 +${healReward}` : null,
    archiveReward.wasNew ? `回声档案 ${archiveReward.summary.discovered}/${archiveReward.summary.total}` : null,
    archiveReward.shardReward > 0 ? `章节集齐 +${archiveReward.shardReward} 校准碎片` : null,
  ].filter(Boolean).join("，");
  setLog(`${echo.message ?? `发现地图回声：${echo.label ?? "未命名线索"}。`}${rewards ? ` ${rewards}。` : ""}`);
  syncHud();
  saveRunCheckpoint("discovery-echo");
}

function collectMapCache(cache) {
  if (!cache?.id || isMapCacheCollected(cache)) {
    return;
  }

  const collected = getCollectedMapCacheIds();
  collected.push(cache.id);
  const bugReward = Math.max(0, Math.trunc(Number(cache.bugPoints) || 0));
  const xpReward = Math.max(0, Math.trunc(Number(cache.xp) || 0));
  const healReward = Math.max(0, Math.trunc(Number(cache.hp) || 0));
  const backlashRelief = Math.max(0, Math.trunc(Number(cache.backlash) || 0));

  player.bugPoints += bugReward;
  if (xpReward > 0) {
    addExperience(xpReward);
  }
  if (healReward > 0) {
    player.hp = clamp(player.hp + healReward, 1, player.maxHp);
  }
  if (backlashRelief > 0) {
    player.backlash = clamp(player.backlash - backlashRelief, 0, 100);
  }
  const archiveReward = recordMapCacheInArchive(cache);
  world.pulseCooldown = Math.min(world.pulseCooldown ?? 0, 0.2);
  world.dashCooldown = Math.min(world.dashCooldown ?? 0, 0.2);

  burst(cache.x, cache.y, cache.color ?? "#f1c15b", 22);
  burst(player.x, player.y, "#5de2d1", 12);
  playAudioCue("pickup");
  const rewards = [
    bugReward > 0 ? `bug点数 +${bugReward}` : null,
    xpReward > 0 ? `经验 +${xpReward}` : null,
    healReward > 0 ? `生命 +${healReward}` : null,
    backlashRelief > 0 ? `反噬 -${backlashRelief}` : null,
    archiveReward.wasNew ? `地标档案 ${archiveReward.summary.discovered}/${archiveReward.summary.total}` : null,
    archiveReward.shardReward > 0 ? `章节归档 +${archiveReward.shardReward} 校准碎片` : null,
  ].filter(Boolean).join("，");
  setLog(`${cache.message ?? `发现地标补给：${cache.label ?? "未命名装置"}。`}${rewards ? ` ${rewards}。` : ""}`);
  syncHud();
  saveRunCheckpoint("map-cache");
}

function activateMapInteractive(device) {
  if (!device?.id || isMapInteractiveActivated(device)) {
    return;
  }

  const activated = getActivatedMapInteractiveIds();
  activated.push(device.id);
  if (runStats && !runStats.mapInteractivesActivated?.includes(device.id)) {
    runStats.mapInteractivesActivated = [...(runStats.mapInteractivesActivated ?? []), device.id];
  }
  const bugReward = Math.max(0, Math.trunc(Number(device.bugPoints) || 0));
  const xpReward = Math.max(0, Math.trunc(Number(device.xp) || 0));
  const healReward = Math.max(0, Math.trunc(Number(device.hp) || 0));
  const backlashRelief = Math.max(0, Math.trunc(Number(device.backlash) || 0));
  const invulnerable = Math.max(0, Number(device.invulnerable) || 0);

  player.bugPoints += bugReward;
  if (xpReward > 0) {
    addExperience(xpReward);
  }
  if (healReward > 0) {
    player.hp = clamp(player.hp + healReward, 1, player.maxHp);
  }
  if (backlashRelief > 0) {
    player.backlash = clamp(player.backlash - backlashRelief, 0, 100);
  }
  if (invulnerable > 0) {
    player.invulnerable = Math.max(player.invulnerable ?? 0, invulnerable);
  }
  if (device.cooldownReset) {
    world.pulseCooldown = 0;
    world.dashCooldown = 0;
  }
  if (device.spawnPickups > 0) {
    for (let index = 0; index < device.spawnPickups; index += 1) {
      const angle = (Math.PI * 2 * index) / device.spawnPickups + world.animTime;
      spawnBugPickup(device.x + Math.cos(angle) * 38, device.y + Math.sin(angle) * 30, 1, 2);
    }
  }
  const weakened = applyMapInteractiveWeaken(device);
  const archiveReward = recordMapInteractiveInArchive(device);
  completeDeviceGuide(device);
  if (currentChapterIndex > 0) {
    markChapterShowcase("device", {
      trigger: "device",
      callout: `装置已入镜：${device.label ?? "互动装置"}`,
      x: device.x,
      y: device.y,
    });
  }

  burst(device.x, device.y, device.color ?? "#72a5ff", 24);
  burst(player.x, player.y, "#5de2d1", 14);
  playAudioCue("upgrade-select");
  const rewards = [
    bugReward > 0 ? `bug点数 +${bugReward}` : null,
    xpReward > 0 ? `经验 +${xpReward}` : null,
    healReward > 0 ? `生命 +${healReward}` : null,
    backlashRelief > 0 ? `反噬 -${backlashRelief}` : null,
    invulnerable > 0 ? `安全窗口 ${invulnerable.toFixed(1)}秒` : null,
    device.cooldownReset ? "闪避/脉冲冷却归零" : null,
    device.spawnPickups > 0 ? `缓存补给 x${device.spawnPickups}` : null,
    weakened > 0 ? `削弱周围实体 x${weakened}` : null,
    archiveReward.wasNew ? `装置档案 ${archiveReward.summary.activated}/${archiveReward.summary.total}` : null,
    archiveReward.shardReward > 0 ? `章节归档 +${archiveReward.shardReward} 校准碎片` : null,
  ].filter(Boolean).join("，");
  setLog(`${device.message ?? `互动地标启动：${device.label ?? "地图装置"}。`}${rewards ? ` ${rewards}。` : ""}`);
  syncHud();
  saveRunCheckpoint("map-interactive");
}

function applyMapInteractiveWeaken(device) {
  const radius = Math.max(0, Number(device.weakenRadius) || 0);
  const damage = Math.max(0, Number(device.weakenDamage) || 0);
  if (!radius || !damage) {
    return 0;
  }

  let affected = 0;
  for (const enemy of [...enemies, ...cleaners]) {
    if (distance(enemy, device) > radius) {
      continue;
    }
    enemy.hp -= damage;
    enemy.slowFactor = Math.min(enemy.slowFactor ?? 1, 0.72);
    enemy.slowTimer = Math.max(enemy.slowTimer ?? 0, 2.2);
    enemy.hitFlash = 0.18;
    affected += 1;
  }
  clearDefeatedHostiles();
  return affected;
}

function maybeEscalateBacklash(dt) {
  if (boss && boss.hp > 0) {
    return;
  }

  const cleanerCanAppear = chapterState.finished || chapterState.stepIndex >= 3;
  if (cleanerCanAppear && player.backlash >= 75 && cleaners.length === 0) {
    spawnEnemyNear(world.width - 110, 96, "cleaner");
    setLog("白箱巡检员上线，正在归档异常变量：安渡。");
  }

  if (player.backlash >= 100) {
    player.hp -= 5 * dt;
  }
}

function updateParticles(dt) {
  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
  }
  particles = particles.filter((particle) => particle.life > 0);
}

function checkBugCollision() {
  for (let index = 0; index < bugNodes.length; index += 1) {
    const node = bugNodes[index];
    if (distance(player, node) < player.radius + (node.interactRadius ?? node.radius + 24)) {
      activeEvent = {
        ...node.event,
        index,
        openingFocus: Boolean(node.openingFocus),
        chapterStep: node.chapterStep,
      };
      openEvent(activeEvent);
      break;
    }
  }
}

function getOpeningEventChoicePreview(event) {
  if (!event?.openingFocus) {
    return "";
  }
  return `<span class="opening-choice-preview"><strong>开场链推进</strong>处理后点亮 1/3 目标，掉落 +1 bug点数 / +3 经验，并引出第一波裂隙。</span>`;
}

function openEvent(event) {
  world.mode = "event";
  ui.eventKicker.textContent = event.openingFocus ? `首个异常 · ${event.kicker}` : event.kicker;
  ui.eventTitle.textContent = event.title;
  ui.eventText.textContent = event.text;
  ui.eventChoices.innerHTML = "";

  for (const choice of event.choices) {
    const button = document.createElement("button");
    button.className = ["choice-button", "event-choice", event.openingFocus ? "is-opening-choice" : ""].filter(Boolean).join(" ");
    button.disabled = choiceIsDisabled(choice);
    button.innerHTML = `<span class="choice-title">${choice.title}</span><span class="choice-effect">${choice.effect}${getOpeningEventChoicePreview(event)}</span>`;
    button.addEventListener("click", () => resolveEvent(choice));
    ui.eventChoices.appendChild(button);
  }

  ui.eventPanel.classList.remove("hidden");
  playAudioCue("ui-open");
}

function resolveEvent(choice) {
  playAudioCue("ui-confirm");
  const wasOpeningFocus = Boolean(activeEvent?.openingFocus);
  applyActions(choice.actions);
  runStats.eventsResolved += 1;
  updateNightHook(0);
  evaluateRunAchievements("event_resolved");
  const removed = bugNodes.splice(activeEvent.index, 1)[0];
  burst(removed.x, removed.y, removed.event.color, 28);
  if (wasOpeningFocus) {
    spawnFloatingText(removed.x, removed.y - 54, "开场链 +1", removed.event.color, { size: 17, life: 0.82, vy: -38 });
  }
  spawnBugPickup(removed.x, removed.y, 1, 3);
  activeEvent = null;
  ui.eventPanel.classList.add("hidden");

  const chapterAdvanced = handleChapterEventResolved(removed);
  if (chapterAdvanced) {
    return;
  }

  resumeAndSpawnBug();
}

function openUpgrade() {
  world.mode = "upgrade";
  ui.upgradeKicker.textContent = "变量祝福";
  ui.upgradeTitle.textContent = "选择一个升级方向";
  ui.upgradeChoices.innerHTML = "";
  player.pendingLevelUps = Math.max(0, player.pendingLevelUps - 1);
  const generalPool = [...upgrades].sort(() => Math.random() - 0.5).slice(0, 1);
  const weaponPool = [...weaponUpgrades].sort(() => Math.random() - 0.5).slice(0, 2);
  const pool = [...weaponPool, ...generalPool].sort(() => Math.random() - 0.5).map(rollBoon);
  playAudioCue("upgrade-open");

  for (const upgrade of pool) {
    const button = document.createElement("button");
    button.className = "choice-button with-media upgrade-card-choice";
    const icon = upgrade.iconKey ? `<img class="choice-icon ability-icon" src="${assetUrl(upgrade.iconKey)}" alt="" />` : "";
    button.innerHTML = `${icon}<span class="choice-copy"><span class="choice-title">${upgrade.title}<span class="choice-rarity">${upgrade.rarity.name}</span></span><span class="choice-effect">${upgrade.effect}</span></span>`;
    button.addEventListener("click", () => {
      playAudioCue("upgrade-select");
      applyActions(upgrade.actions);
      registerConcepts(upgrade);
      runStats.upgradesChosen.push(upgrade.title);
      ui.upgradePanel.classList.add("hidden");
      setLog(`选择了${upgrade.rarity.name}强化：${upgrade.title}。`);
      saveRunCheckpoint("upgrade");
      if (player.pendingLevelUps > 0) {
        openUpgrade();
      } else {
        resumeAndSpawnBug();
      }
    });
    ui.upgradeChoices.appendChild(button);
  }

  ui.upgradePanel.classList.remove("hidden");
}

function rollBoon(upgrade) {
  const rarity = rollRarity();
  const boon = JSON.parse(JSON.stringify(upgrade));
  boon.rarity = rarity;
  boon.actions = boon.actions.map((action) => scaleActionByRarity(action, rarity));
  return boon;
}

function rollRarity() {
  const roll = Math.random();
  if (roll > 0.9) {
    return { name: "史诗", multiplier: 1.75 };
  }
  if (roll > 0.62) {
    return { name: "稀有", multiplier: 1.35 };
  }
  return { name: "普通", multiplier: 1 };
}

function scaleActionByRarity(action, rarity) {
  const next = { ...action };
  if (next.type === "modifyWeapon") {
    if (typeof next.add === "number" && !["projectileCount", "pierce"].includes(next.stat)) {
      next.add = Math.ceil(next.add * rarity.multiplier);
    }
    if (typeof next.multiply === "number" && next.multiply < 1) {
      next.multiply = 1 - (1 - next.multiply) * rarity.multiplier;
      next.multiply = clamp(next.multiply, 0.55, 0.98);
    }
  }
  if (next.type === "gain") {
    if (next.hp > 0) next.hp = Math.ceil(next.hp * rarity.multiplier);
    if (next.bugPoints > 0) next.bugPoints = Math.ceil(next.bugPoints * rarity.multiplier);
    if (next.backlash < 0) next.backlash = Math.floor(next.backlash * rarity.multiplier);
  }
  if (next.type === "boostWeaponTrait") {
    next.rarityMultiplier = rarity.multiplier;
  }
  return next;
}

function resumeAndSpawnBug() {
  world.mode = "playing";
  if (!chapterState.finished) {
    return;
  }

  while (bugNodes.length < 3) {
    bugNodes.push(createBugNode());
  }
}

function renderResultStats(victory) {
  if (!ui.resultStats) {
    return;
  }

  const durationSeconds = Math.max(1, Math.round((Date.now() - (runStats?.startedAt ?? Date.now())) / 1000));
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const stats = [
    ["章节", `${runStats?.chaptersCleared ?? 0}/${chapters.length}`],
    ["等级", `Lv.${runStats?.highestLevel ?? player.level}`],
    ["击破", `${runStats?.enemiesDefeated ?? 0}`],
    ["异常", `${runStats?.eventsResolved ?? 0}`],
    ["升级", `${runStats?.upgradesChosen?.length ?? 0} / 信物 ${runStats?.relicsChosen?.length ?? 0}`],
    ["共鸣", `${runStats?.synergiesUnlocked?.length ?? 0} 次`],
    ["最佳连段", `x${runStats?.tempo?.bestStreak ?? 0}`],
    ["开场评级", formatOpeningRushScore(runStats?.openingRush)],
    ["耗时", `${minutes}:${String(seconds).padStart(2, "0")}`],
    ["构筑", getBuildSummary()],
    ["委托", getRunHookResultText()],
    ["校准碎片", `+${archiveState?.lastRunShardGain?.amount ?? 0} / 持有 ${archiveState?.calibrationShards ?? 0}`],
    ["档案", victory ? `通关 ${archiveState.wins} 次` : `最远 ${archiveState.bestChapter}/${chapters.length}`],
  ];

  ui.resultStats.innerHTML = "";
  for (const [label, value] of stats) {
    const item = document.createElement("div");
    item.className = "result-stat";
    item.innerHTML = `${label}<strong>${value}</strong>`;
    ui.resultStats.appendChild(item);
  }
}

function renderResultInsights(review = archiveState?.lastRunReview) {
  if (!ui.resultInsights) {
    return;
  }
  const normalized = normalizeLastRunReview(review);
  if (!normalized) {
    ui.resultInsights.innerHTML = "";
    return;
  }

  const cards = [
    ["本局亮点", normalized.highlightTitle, normalized.highlightText, ""],
    ["下次注意", normalized.pressureTitle, normalized.pressureText, ""],
  ];
  if (normalized.failureReplay) {
    cards.push([
      "失败回放",
      normalized.failureReplay.title,
      `${normalized.failureReplay.summary} 反制：${normalized.failureReplay.counter}`,
      "is-danger",
    ]);
  }
  if (normalized.openingRush?.score > 0) {
    cards.push([
      "开场评级",
      `${normalized.openingRush.grade} ${normalized.openingRush.score}/100`,
      `${normalized.openingRush.gradeText} 已写入档案最佳开场记录。`,
      normalized.openingRush.score >= 75 ? "is-boost" : "",
    ]);
  }
  cards.push(["下一把", normalized.nextTitle, normalized.nextText, "is-next"]);
  if (normalized.retryPlan) {
    cards.push([
      "下一局路线",
      normalized.retryPlan.title,
      `${normalized.retryPlan.firstGoal}。${normalized.retryPlan.rewardText} 截图焦点：${normalized.retryPlan.screenshotFocus}`,
      "is-plan",
    ]);
  }
  if (normalized.retryBoost) {
    cards.push(["重开助推", normalized.retryBoost.title, normalized.retryBoost.summary, "is-boost"]);
  }
  ui.resultInsights.innerHTML = cards.map(([kicker, title, text, className]) => `
    <div class="result-insight ${className}">
      <span>${kicker}</span>
      <strong>${title}</strong>
      <small>${text}</small>
    </div>
  `).join("");
}

function syncResultRetryButton(review = archiveState?.lastRunReview) {
  const normalized = normalizeLastRunReview(review);
  const build = getStarterBuildById(normalized?.recommendedStarterBuildId);
  resultRetryStarterBuildId = build?.id ?? null;
  resultRetryBoost = normalized?.retryBoost ?? null;
  resultRetryPlan = normalized?.retryPlan ?? null;
  if (!ui.restartButton) {
    return;
  }
  const weapon = getWeaponById(build?.weaponId);
  const planText = resultRetryPlan ? ` · ${resultRetryPlan.title}` : "";
  const boostText = resultRetryBoost ? ` · ${resultRetryBoost.title}` : "";
  ui.restartButton.innerHTML = build
    ? `<span class="choice-title">按推荐再来</span><span class="choice-effect">${build.title} · ${weapon?.name ?? "初始武器"}${planText}${boostText}</span>`
    : `<span class="choice-title">重开夜巡</span><span class="choice-effect">从第一章重新开始</span>`;
}

function endGame(victory) {
  if (world.mode === "result") {
    return;
  }
  recordRunEnd(victory);
  world.mode = "result";
  ui.resultKicker.textContent = victory ? "五章通关" : "今日重置";
  ui.resultTitle.textContent = victory ? "公共规则引擎完成校准" : `${currentChapter().title} 中断`;
  ui.resultText.textContent = victory
    ? "变量城没有变得完美，但它第一次把“差异不等于错误”写进了主规则。"
    : "bug点数散落在工位缝里，白箱巡检员把凌晨重新归档为凌晨。";
  renderResultStats(victory);
  renderResultInsights(archiveState.lastRunReview);
  syncResultRetryButton(archiveState.lastRunReview);
  ui.resultPanel.classList.remove("hidden");
  playAudioCue(victory ? "victory" : "defeat");
}

function draw(dt) {
  const shakeEnabled = gameSettings?.screenShake !== false;
  const shakeX = shakeEnabled && world.cameraShake > 0 ? random(-5, 5) : 0;
  const shakeY = shakeEnabled && world.cameraShake > 0 ? random(-5, 5) : 0;
  updateCamera();
  const camera = { x: world.cameraX, y: world.cameraY, w: world.viewWidth, h: world.viewHeight };
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(shakeX, shakeY);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawOffice();
  drawBugNodes(dt);
  drawBugPickups();
  drawProtocolHazards();
  drawEnemyHazards();
  drawBullets();
  drawEnemies();
  drawBoss();
  drawAllies();
  drawPlayer();
  drawParticles();
  ctx.restore();
  drawObjectiveCompass(camera);
  drawDeviceGuideCompass(camera);
  drawExplorationMiniMap(camera);
  drawOpeningShowcaseOverlay(camera);
  drawChapterShowcaseOverlay(camera);
  drawBossHud();
  ctx.restore();
}

function drawOffice() {
  const visual = getChapterVisual();
  const hasKeyArt = assets.sceneKeyArt?.ready;
  const map = currentMap();

  drawKeyArtBackdrop(visual);

  ctx.save();
  ctx.globalAlpha = hasKeyArt ? visual.floorVeil : 1;
  ctx.fillStyle = visual.floor;
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.restore();

  ctx.strokeStyle = visual.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x < world.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y < world.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }

  drawMapPaths(map, visual);
  drawMapZones(map, visual);
  drawChapterBackdrop(visual);
  drawMapDecorations(map, visual);
  drawMapDiscoveryLayer(map, visual);

  ctx.fillStyle = visual.wall;
  ctx.fillRect(0, 0, world.width, 68);
  ctx.fillStyle = visual.trim;
  ctx.fillRect(0, 66, world.width, 3);
  drawMapObjects(map, visual);
  drawDiscoveryEchoes(map, visual);
  drawMapCaches(map, visual);
  drawMapInteractives(map, visual);
  drawDeviceGuidePath(visual);

  if ((chapterState?.stepIndex ?? -1) >= 3 || player.fixed >= 3) {
    drawLaoLiangSprite(1080, 118, 0.88);
    drawLabel("老梁", 1062, 84, "#9a6615");
  }
}

function drawMapPaths(map, visual) {
  for (const path of map.paths ?? []) {
    if (path.kind === "corridor") {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = path.color ?? visual.accent;
      ctx.fillRect(path.x, path.y, path.w, path.h);
      ctx.globalAlpha = 0.34;
      ctx.strokeStyle = path.color ?? visual.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 12]);
      ctx.strokeRect(path.x, path.y, path.w, path.h);
      ctx.setLineDash([]);
      drawSmallText(path.label, path.x + 14, path.y + 28, "#26364d", 13);
      ctx.restore();
      continue;
    }

    if (path.kind === "route") {
      ctx.save();
      const pulse = (world.animTime * 0.55 + (path.x1 + path.y1) * 0.002) % 1;
      ctx.globalAlpha = 0.44;
      ctx.strokeStyle = path.color ?? visual.accent;
      ctx.lineWidth = 5;
      ctx.setLineDash([22, 16]);
      ctx.beginPath();
      ctx.moveTo(path.x1, path.y1);
      ctx.quadraticCurveTo((path.x1 + path.x2) / 2, Math.min(path.y1, path.y2) - 74, path.x2, path.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      const x = path.x1 + (path.x2 - path.x1) * pulse;
      const y = path.y1 + (path.y2 - path.y1) * pulse + Math.sin(pulse * Math.PI) * -42;
      fillCircle(x, y, 7, path.color ?? visual.accent);
      if (path.label) {
        drawSmallText(path.label, (path.x1 + path.x2) / 2 - 36, (path.y1 + path.y2) / 2 - 34, "#26364d", 12);
      }
      ctx.restore();
      continue;
    }

    if (path.kind === "rail") {
      drawRailLine(path.x1, path.y1, path.x2, path.y2, path.color ?? visual.accent);
      drawRailLine(path.x1, path.y1 + 40, path.x2, path.y2 + 40, "rgba(241, 193, 91, 0.55)");
      continue;
    }

    if (path.kind === "root") {
      ctx.save();
      ctx.strokeStyle = path.color ?? visual.accent;
      ctx.globalAlpha = 0.42;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(path.x1, path.y1);
      ctx.quadraticCurveTo((path.x1 + path.x2) / 2, Math.min(path.y1, path.y2) - 70, path.x2, path.y2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawMapZones(map, visual) {
  for (const zone of map.zones ?? []) {
    const pulse = 0.14 + Math.sin(world.animTime * 2.2 + zone.x * 0.01) * 0.04;
    ctx.save();
    ctx.globalAlpha = zone.type === "focus" ? 0.18 : pulse;
    ctx.fillStyle = zone.color ?? visual.accent;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.globalAlpha = zone.type === "hazard" ? 0.52 : 0.34;
    ctx.strokeStyle = zone.color ?? visual.accent;
    ctx.lineWidth = zone.type === "hazard" ? 3 : 2;
    ctx.setLineDash(zone.type === "hazard" ? [14, 10] : [8, 8]);
    ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
    ctx.setLineDash([]);
    drawSmallText(zone.label, zone.x + 12, zone.y + 24, "#26364d", 13);
    ctx.restore();
  }
}

function getMapEchoes(map = currentMap()) {
  return Array.isArray(map?.echoes) ? map.echoes : [];
}

function getMapCaches(map = currentMap()) {
  return Array.isArray(map?.caches) ? map.caches : [];
}

function getMapInteractives(map = currentMap()) {
  return Array.isArray(map?.interactives) ? map.interactives : [];
}

const DEVICE_GUIDE_SCAN_RADIUS = 1480;
const DEVICE_GUIDE_NEAR_RADIUS = 420;
const DEVICE_GUIDE_COMPLETE_FLASH = 4.2;

function getPendingMapInteractives(map = currentMap()) {
  return getMapInteractives(map).filter((device) => !isMapInteractiveActivated(device));
}

function getNearestPendingMapInteractive(map = currentMap()) {
  const pending = getPendingMapInteractives(map);
  if (!pending.length) {
    return null;
  }
  if (!player) {
    return pending[0];
  }
  return pending.reduce((nearest, device) => {
    return distance(player, device) < distance(player, nearest) ? device : nearest;
  }, pending[0]);
}

function createDeviceGuideState(device) {
  if (!device?.id) {
    return null;
  }
  return {
    chapterIndex: currentChapterIndex,
    targetId: device.id,
    targetLabel: device.label ?? "互动装置",
    elapsed: 0,
    lastDistance: null,
    bestDistance: null,
    announced: false,
    nearAnnounced: false,
    completed: false,
    completedAt: null,
    flash: 0,
  };
}

function normalizeDeviceGuideState(savedGuide) {
  if (!savedGuide || typeof savedGuide !== "object") {
    return null;
  }
  const chapterIndex = clamp(Math.trunc(Number(savedGuide.chapterIndex) || 0), 0, chapters.length - 1);
  const map = chapterMaps[chapterIndex] ?? currentMap();
  const target = getMapInteractives(map).find((device) => device.id === savedGuide.targetId);
  if (!target) {
    return null;
  }
  return {
    chapterIndex,
    targetId: target.id,
    targetLabel: target.label ?? "互动装置",
    elapsed: Math.max(0, Number(savedGuide.elapsed) || 0),
    lastDistance: Number.isFinite(Number(savedGuide.lastDistance)) ? Math.max(0, Number(savedGuide.lastDistance)) : null,
    bestDistance: Number.isFinite(Number(savedGuide.bestDistance)) ? Math.max(0, Number(savedGuide.bestDistance)) : null,
    announced: Boolean(savedGuide.announced),
    nearAnnounced: Boolean(savedGuide.nearAnnounced),
    completed: Boolean(savedGuide.completed),
    completedAt: Number(savedGuide.completedAt) || null,
    flash: Math.max(0, Number(savedGuide.flash) || 0),
  };
}

function formatDeviceGuideReward(device) {
  if (!device) {
    return "靠近启动";
  }
  const rewards = [
    Number(device.bugPoints) > 0 ? `+${Math.trunc(Number(device.bugPoints))} bug点数` : null,
    Number(device.xp) > 0 ? `+${Math.trunc(Number(device.xp))} 经验` : null,
    Number(device.hp) > 0 ? `+${Math.trunc(Number(device.hp))} 生命` : null,
    Number(device.backlash) > 0 ? `反噬 -${Math.trunc(Number(device.backlash))}` : null,
    Number(device.invulnerable) > 0 ? `${Number(device.invulnerable).toFixed(1)}秒安全窗` : null,
    device.cooldownReset ? "冷却归零" : null,
    Number(device.spawnPickups) > 0 ? `补给 x${Math.trunc(Number(device.spawnPickups))}` : null,
    Number(device.weakenDamage) > 0 ? "削弱周围实体" : null,
  ].filter(Boolean);
  return rewards.slice(0, 3).join(" · ") || "靠近启动";
}

function updateDeviceGuide(dt = 0) {
  if (!runStats || world.mode !== "playing" || !player) {
    return null;
  }

  if (runStats.deviceGuide?.completed && runStats.deviceGuide.flash > 0) {
    runStats.deviceGuide.flash = Math.max(0, runStats.deviceGuide.flash - dt);
  }

  const target = getNearestPendingMapInteractive();
  if (!target) {
    return runStats.deviceGuide?.completed && runStats.deviceGuide.flash > 0
      ? { guide: runStats.deviceGuide, target: null, distance: 0, progress: 1, rewardText: "已写入装置档案" }
      : null;
  }

  if (
    !runStats.deviceGuide
    || runStats.deviceGuide.completed
    || runStats.deviceGuide.chapterIndex !== currentChapterIndex
    || runStats.deviceGuide.targetId !== target.id
  ) {
    runStats.deviceGuide = createDeviceGuideState(target);
  }

  const guide = runStats.deviceGuide;
  const currentDistance = distance(player, target);
  guide.elapsed += Math.max(0, Number(dt) || 0);
  guide.lastDistance = currentDistance;
  guide.bestDistance = guide.bestDistance === null
    ? currentDistance
    : Math.min(guide.bestDistance, currentDistance);

  if (!guide.announced && guide.elapsed >= 0.25) {
    guide.announced = true;
    setLog(`装置扫描锁定：${target.label ?? "互动装置"}，靠近可获得 ${formatDeviceGuideReward(target)}。`);
  }

  if (!guide.nearAnnounced && currentDistance <= DEVICE_GUIDE_NEAR_RADIUS) {
    guide.nearAnnounced = true;
    setLog(`装置信号增强：${target.label ?? "互动装置"}就在附近，穿过危险区后贴近启动。`);
  }

  return {
    guide,
    target,
    distance: currentDistance,
    progress: clamp(1 - currentDistance / DEVICE_GUIDE_SCAN_RADIUS, 0, 1),
    rewardText: formatDeviceGuideReward(target),
  };
}

function completeDeviceGuide(device) {
  if (!runStats || !device?.id) {
    return;
  }
  const guide = runStats.deviceGuide?.targetId === device.id
    ? runStats.deviceGuide
    : createDeviceGuideState(device);
  if (!guide) {
    return;
  }
  guide.chapterIndex = currentChapterIndex;
  guide.targetId = device.id;
  guide.targetLabel = device.label ?? "互动装置";
  guide.lastDistance = 0;
  guide.bestDistance = 0;
  guide.announced = true;
  guide.nearAnnounced = true;
  guide.completed = true;
  guide.completedAt = Date.now();
  guide.flash = DEVICE_GUIDE_COMPLETE_FLASH;
  runStats.deviceGuide = guide;
}

function getCollectedEchoIds() {
  if (!chapterState) {
    return [];
  }
  if (!Array.isArray(chapterState.echoesCollected)) {
    chapterState.echoesCollected = [];
  }
  return chapterState.echoesCollected;
}

function isDiscoveryEchoCollected(echo) {
  return Boolean(echo?.id && getCollectedEchoIds().includes(echo.id));
}

function getCollectedMapCacheIds() {
  if (!chapterState) {
    return [];
  }
  if (!Array.isArray(chapterState.mapCachesCollected)) {
    chapterState.mapCachesCollected = [];
  }
  return chapterState.mapCachesCollected;
}

function isMapCacheCollected(cache) {
  return Boolean(cache?.id && getCollectedMapCacheIds().includes(cache.id));
}

function getActivatedMapInteractiveIds() {
  if (!chapterState) {
    return [];
  }
  if (!Array.isArray(chapterState.mapInteractivesActivated)) {
    chapterState.mapInteractivesActivated = [];
  }
  return chapterState.mapInteractivesActivated;
}

function isMapInteractiveActivated(device) {
  return Boolean(device?.id && getActivatedMapInteractiveIds().includes(device.id));
}

function getMapDiscoverySummary(map = currentMap()) {
  const taskMarkers = [];
  for (const [stepKey, targets] of Object.entries(map.stepTargets ?? {})) {
    const stepIndex = Number(stepKey);
    for (const target of targets ?? []) {
      const event = getEventById(target.eventId);
      taskMarkers.push({
        ...target,
        stepIndex,
        color: event?.color ?? target.color ?? visualColorFallback(stepIndex),
        title: event?.title ?? "异常信标",
      });
    }
  }

  return {
    taskMarkers,
    hazardSignals: (map.zones ?? []).filter((zone) => ["hazard", "backlash", "slow", "focus"].includes(zone.type)).length,
    landmarkMarkers: [map.start, map.bossSpawn].filter(Boolean).length,
    echoCount: getMapEchoes(map).length,
    uncollectedEchoCount: getMapEchoes(map).filter((echo) => !isDiscoveryEchoCollected(echo)).length,
    cacheCount: getMapCaches(map).length,
    uncollectedCacheCount: getMapCaches(map).filter((cache) => !isMapCacheCollected(cache)).length,
    interactiveCount: getMapInteractives(map).length,
    unactivatedInteractiveCount: getMapInteractives(map).filter((device) => !isMapInteractiveActivated(device)).length,
  };
}

function visualColorFallback(index = 0) {
  return ["#5de2d1", "#72a5ff", "#f1c15b", "#96e072", "#ef6a70"][Math.abs(index) % 5];
}

function getTaskMarkerState(stepIndex) {
  const currentStep = chapterState?.stepIndex ?? -1;
  if (chapterState?.finished || stepIndex < currentStep) {
    return "cleared";
  }
  if (stepIndex === currentStep) {
    return "active";
  }
  if (stepIndex === currentStep + 1 || (currentStep < 0 && stepIndex === 0)) {
    return "next";
  }
  return "locked";
}

function drawMapDiscoveryLayer(map, visual) {
  drawMapLandmarkSeal(map.start, "起点", visual.accent, "SAFE");

  for (const zone of map.zones ?? []) {
    drawZoneSignal(zone, visual);
  }

  const { taskMarkers } = getMapDiscoverySummary(map);
  for (const marker of taskMarkers) {
    drawTaskBeacon(marker, visual);
  }

  if (map.bossSpawn) {
    drawMapLandmarkSeal(map.bossSpawn, "Boss 区", "#ef6a70", "BOSS");
  }
}

function drawMapLandmarkSeal(point, label, color, code) {
  if (!point) {
    return;
  }
  const pulse = 1 + Math.sin(world.animTime * 2.4 + point.x * 0.01) * 0.08;
  ctx.save();
  ctx.globalAlpha = 0.16;
  fillCircle(point.x, point.y, 58 * pulse, color);
  ctx.globalAlpha = 0.48;
  strokeCircle(point.x, point.y, 44 * pulse, color, 3);
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  ctx.fillRect(point.x - 38, point.y - 12, 76, 24);
  ctx.strokeStyle = color;
  ctx.strokeRect(point.x - 38, point.y - 12, 76, 24);
  drawSmallText(code, point.x - 19, point.y + 5, color, 13);
  drawMarkerTag(label, point.x, point.y + 46, color);
  ctx.restore();
}

function drawDiscoveryEchoes(map, visual) {
  for (const [index, echo] of getMapEchoes(map).entries()) {
    if (isDiscoveryEchoCollected(echo)) {
      continue;
    }
    drawDiscoveryEcho(echo, visual, index);
  }
}

function drawDiscoveryEcho(echo, visual, index = 0) {
  const color = echo.color ?? visual.accent ?? visualColorFallback(index);
  const radius = echo.radius ?? 66;
  const pulse = 1 + Math.sin(world.animTime * 3.2 + index * 0.9) * 0.09;

  ctx.save();
  ctx.globalAlpha = 0.16;
  fillCircle(echo.x, echo.y, radius * pulse, color);
  ctx.globalAlpha = 0.42;
  strokeCircle(echo.x, echo.y, (radius * 0.68) * pulse, color, 3);
  ctx.globalAlpha = 0.88;
  ctx.translate(echo.x, echo.y);
  ctx.rotate(Math.PI / 4 + Math.sin(world.animTime * 1.4 + index) * 0.04);
  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.fillRect(-13, -13, 26, 26);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(-13, -13, 26, 26);
  ctx.rotate(-Math.PI / 4);
  drawSmallText("回", -8, 5, color, 15);
  ctx.restore();

  drawMarkerTag(`回声 · ${shortenText(echo.label ?? "线索", 8)}`, echo.x, echo.y + 50, color);
}

function drawMapCaches(map, visual) {
  for (const [index, cache] of getMapCaches(map).entries()) {
    if (isMapCacheCollected(cache)) {
      continue;
    }
    drawMapCache(cache, visual, index);
  }
}

function drawMapCache(cache, visual, index = 0) {
  const color = cache.color ?? visual.accent ?? visualColorFallback(index + 2);
  const radius = cache.radius ?? 50;
  const pulse = 1 + Math.sin(world.animTime * 3.8 + index * 1.4) * 0.1;

  ctx.save();
  ctx.globalAlpha = 0.15;
  fillCircle(cache.x, cache.y, radius * 1.28 * pulse, color);
  ctx.globalAlpha = 0.48;
  strokeCircle(cache.x, cache.y, radius * pulse, color, 3);
  ctx.globalAlpha = 0.86;
  ctx.translate(cache.x, cache.y);
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(24, -7);
  ctx.lineTo(24, 17);
  ctx.lineTo(0, 29);
  ctx.lineTo(-24, 17);
  ctx.lineTo(-24, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawSmallText(cache.code ?? "补", -12, 6, color, 14);
  ctx.restore();

  drawMarkerTag(`地标 · ${shortenText(cache.label ?? "补给", 8)}`, cache.x, cache.y + 52, color);
}

function drawMapInteractives(map, visual) {
  for (const [index, device] of getMapInteractives(map).entries()) {
    if (isMapInteractiveActivated(device)) {
      continue;
    }
    drawMapInteractive(device, visual, index);
  }
}

function drawMapInteractive(device, visual, index = 0) {
  const color = device.color ?? visual.accent ?? visualColorFallback(index + 3);
  const radius = device.radius ?? 54;
  const pulse = 1 + Math.sin(world.animTime * 4.1 + index * 1.2) * 0.08;

  ctx.save();
  ctx.globalAlpha = 0.14;
  fillCircle(device.x, device.y, radius * 1.45 * pulse, color);
  ctx.globalAlpha = 0.38;
  strokeCircle(device.x, device.y, radius * pulse, color, 3);
  ctx.globalAlpha = 0.9;
  ctx.translate(device.x, device.y);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.fillRect(-26, -20, 52, 40);
  ctx.strokeRect(-26, -20, 52, 40);
  ctx.beginPath();
  ctx.moveTo(-14, 16);
  ctx.lineTo(14, 16);
  ctx.lineTo(20, 27);
  ctx.lineTo(-20, 27);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawSmallText(device.code ?? "触", -14, 6, color, 14);
  ctx.restore();

  drawMarkerTag(`互动 · ${shortenText(device.label ?? "装置", 8)}`, device.x, device.y + 56, color);
}

function drawDeviceGuidePath(visual) {
  const target = getNearestPendingMapInteractive();
  if (!target || !player || world.mode !== "playing") {
    return;
  }

  const color = target.color ?? visual.accent ?? "#5de2d1";
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const length = Math.hypot(dx, dy);
  if (length < 92) {
    return;
  }

  const angle = Math.atan2(dy, dx);
  const midX = player.x + dx * 0.5;
  const midY = player.y + dy * 0.5;
  const phase = (world.animTime * 190) % 130;
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.setLineDash([26, 18]);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.quadraticCurveTo(midX, midY - 42, target.x, target.y);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let step = 120 + phase; step < length - 84; step += 130) {
    const t = clamp(step / length, 0, 1);
    const x = player.x + dx * t;
    const y = player.y + dy * t - Math.sin(t * Math.PI) * 42;
    ctx.globalAlpha = 0.72;
    drawSignalChevron(x, y, angle, color, 16);
  }

  ctx.globalAlpha = 0.84;
  strokeCircle(target.x, target.y, 76 + Math.sin(world.animTime * 5.4) * 7, color, 3);
  drawMarkerTag("扫描目标", target.x, target.y - 66, color);
  ctx.restore();
}

function drawZoneSignal(zone, visual) {
  const color = zone.color ?? visual.accent;
  const centerX = zone.x + zone.w / 2;
  const centerY = zone.y + zone.h / 2;
  const label = zone.type === "hazard"
    ? "危险"
    : zone.type === "backlash"
      ? (zone.backlashPerSecond < 0 ? "净化" : "反噬")
      : zone.type === "slow"
        ? "慢行"
        : "线索";
  const alpha = zone.type === "hazard" ? 0.92 : 0.66;

  ctx.save();
  ctx.globalAlpha = alpha;
  const corners = [
    { x: zone.x + 18, y: zone.y + 18, angle: -Math.PI / 4 },
    { x: zone.x + zone.w - 18, y: zone.y + 18, angle: Math.PI / 4 },
    { x: zone.x + zone.w - 18, y: zone.y + zone.h - 18, angle: (Math.PI * 3) / 4 },
    { x: zone.x + 18, y: zone.y + zone.h - 18, angle: (-Math.PI * 3) / 4 },
  ];
  for (const corner of corners) {
    drawSignalChevron(corner.x, corner.y, corner.angle, color, zone.type === "hazard" ? 18 : 12);
  }
  ctx.globalAlpha = zone.type === "hazard" ? 0.9 : 0.72;
  drawMarkerTag(`${label} · ${zone.label}`, centerX, centerY, color);
  ctx.restore();
}

function drawSignalChevron(x, y, angle, color, size = 14) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-size, -size * 0.55);
  ctx.lineTo(0, 0);
  ctx.lineTo(-size, size * 0.55);
  ctx.stroke();
  ctx.restore();
}

function drawTaskBeacon(marker, visual) {
  const state = getTaskMarkerState(marker.stepIndex);
  const color = state === "cleared" ? "#0f9f95" : state === "locked" ? "rgba(92, 104, 120, 0.62)" : marker.color ?? visual.accent;
  const pulse = 1 + Math.sin(world.animTime * 4.2 + marker.x * 0.01) * (state === "active" ? 0.16 : 0.08);
  const ring = state === "active" ? 42 : state === "next" ? 34 : 26;
  const status = {
    active: "当前",
    next: "下一处",
    cleared: "稳定",
    locked: "未巡",
  }[state] ?? "目标";

  ctx.save();
  ctx.globalAlpha = state === "locked" ? 0.38 : state === "cleared" ? 0.52 : 0.86;
  strokeCircle(marker.x, marker.y, ring * pulse, color, state === "active" ? 4 : 2.5);
  ctx.globalAlpha *= 0.5;
  fillCircle(marker.x, marker.y, 18, color);
  ctx.globalAlpha = state === "active" ? 0.92 : 0.72;
  drawSmallText(String(marker.stepIndex + 1), marker.x - 4, marker.y + 5, "#ffffff", 14);
  drawMarkerTag(`${status} · ${shortenText(marker.title, 9)}`, marker.x, marker.y - ring - 12, color);
  ctx.restore();
}

function shortenText(text = "", maxLength = 8) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function drawMarkerTag(text, x, y, color) {
  const safeText = String(text ?? "");
  ctx.save();
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";
  const width = Math.min(190, ctx.measureText(safeText).width + 18);
  ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
  ctx.fillRect(x - width / 2, y - 14, width, 22);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.86;
  ctx.strokeRect(x - width / 2, y - 14, width, 22);
  ctx.globalAlpha = 1;
  drawSmallText(safeText, x - width / 2 + 9, y + 2, "#26364d", 12);
  ctx.restore();
}

function drawMapObjects(map, visual) {
  const objects = [...(map.props ?? []), ...(map.obstacles ?? [])].sort((a, b) => {
    return (a.y ?? 0) + (a.h ?? 0) - ((b.y ?? 0) + (b.h ?? 0));
  });

  for (const object of objects) {
    drawMapObject(object, visual);
  }
}

function drawMapObject(object, visual) {
  if (object.kind === "desk") {
    drawDesk(object);
    return;
  }

  if (object.kind === "singleDesk") {
    if (!drawPropAsset("propSingleDesk", object.x + 4, object.y - 96, 190, 214)) {
      ctx.fillStyle = "#d8e4f0";
      ctx.fillRect(object.x, object.y + 32, 206, 50);
      ctx.fillStyle = "#0f9f95";
      ctx.globalAlpha = 0.18;
      ctx.fillRect(object.x + 10, object.y + 42, 186, 30);
      ctx.globalAlpha = 1;
    }
    drawLabel(object.label, object.x + 44, object.y + 64, "#224250");
    return;
  }

  if (object.kind === "windowRow") {
    drawWindowRow(object.x, object.y, object.count);
    return;
  }

  if (object.kind === "whiteboard") {
    drawWhiteboard(object.x, object.y, object.w, object.h);
    return;
  }

  if (object.kind === "water") {
    drawWaterCooler(object.x, object.y);
    return;
  }

  if (object.kind === "copier") {
    drawCopier(object.x, object.y);
    return;
  }

  if (object.kind === "plant") {
    drawPlant(object.x, object.y, object.scale ?? 1);
    return;
  }

  if (object.kind === "meeting") {
    drawMeetingTable(object.x, object.y);
    return;
  }

  if (object.kind === "serverDoor") {
    drawServerRoomDoor(object.x, object.y);
    return;
  }

  if (object.kind === "printer") {
    drawPrinter(object.x, object.y);
    return;
  }

  if (object.kind === "rack") {
    drawServerRack(object.x, object.y);
    return;
  }

  if (
    object.kind === "fileCabinet" ||
    object.kind === "planterBox" ||
    object.kind === "partitionWide" ||
    object.kind === "partitionLeft" ||
    object.kind === "partitionRight"
  ) {
    drawOfficeFixture(object, visual);
    return;
  }

  if (object.kind === "deliveryZone") {
    drawDeliveryPickupZone(object.x, object.y);
    return;
  }

  if (object.kind === "stationSign") {
    drawStationSign(object.x, object.y, object.label);
    return;
  }

  if (object.kind === "marketCanopy") {
    drawMarketCanopy(object.x, object.y, object.color ?? visual.accent, object.label ?? "");
    return;
  }

  if (object.kind === "stall") {
    drawMarketStall(object, visual);
    return;
  }

  if (object.kind === "gate") {
    drawGateObject(object, visual);
    return;
  }

  if (object.kind === "pillar") {
    drawPillarObject(object, visual);
    return;
  }

  if (object.kind === "kiosk" || object.kind === "train" || object.kind === "serverCluster" || object.kind === "coreBlock") {
    drawTechBlockObject(object, visual);
    return;
  }

  if (object.kind === "rootWall" || object.kind === "coreTree") {
    drawRootObject(object, visual);
    return;
  }

  if (
    object.kind === "deliveryCrates" ||
    object.kind === "routeTerminal" ||
    object.kind === "phoneBeacon" ||
    object.kind === "areaGate" ||
    object.kind === "visitorStool" ||
    object.kind === "meetingBench" ||
    object.kind === "metroBench" ||
    object.kind === "ticketMachine" ||
    object.kind === "signalLight" ||
    object.kind === "saltCrates" ||
    object.kind === "noodleCart" ||
    object.kind === "memoryReceipt" ||
    object.kind === "hashCounter" ||
    object.kind === "promiseTablet" ||
    object.kind === "awaitHourglass" ||
    object.kind === "rootLantern" ||
    object.kind === "contractMonolith" ||
    object.kind === "scanConsole" ||
    object.kind === "evidencePod" ||
    object.kind === "archiveTerminal" ||
    object.kind === "calibrationObelisk"
  ) {
    drawThemedMapProp(object, visual);
  }
}

function drawMapDecorations(map, visual) {
  for (const decoration of map.decorations ?? []) {
    drawMapDecoration(decoration, visual);
  }
}

function drawMapDecoration(decoration, visual) {
  if (decoration.kind === "parcelTape") {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = decoration.color ?? visual.accent;
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 12]);
    ctx.strokeRect(decoration.x, decoration.y, decoration.w, decoration.h);
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.18;
    for (let x = decoration.x - decoration.h; x < decoration.x + decoration.w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, decoration.y + decoration.h);
      ctx.lineTo(x + decoration.h, decoration.y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "floorCable" || decoration.kind === "contractRibbon" || decoration.kind === "coreConduit") {
    ctx.save();
    const pulse = (world.animTime * 0.9) % 1;
    ctx.strokeStyle = decoration.color ?? visual.accent;
    ctx.globalAlpha = decoration.kind === "contractRibbon" ? 0.34 : 0.42;
    ctx.lineWidth = decoration.kind === "coreConduit" ? 7 : 5;
    ctx.setLineDash(decoration.kind === "coreConduit" ? [] : [20, 14]);
    ctx.beginPath();
    ctx.moveTo(decoration.x1, decoration.y1);
    ctx.quadraticCurveTo((decoration.x1 + decoration.x2) / 2, Math.min(decoration.y1, decoration.y2) - 52, decoration.x2, decoration.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    const x = decoration.x1 + (decoration.x2 - decoration.x1) * pulse;
    const y = decoration.y1 + (decoration.y2 - decoration.y1) * pulse;
    fillCircle(x, y, decoration.kind === "coreConduit" ? 8 : 6, decoration.color ?? visual.accent);
    ctx.restore();
    return;
  }

  if (decoration.kind === "routeArrow") {
    ctx.save();
    ctx.translate(decoration.x, decoration.y);
    ctx.rotate(decoration.angle ?? 0);
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = decoration.color ?? visual.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-62, 0);
    ctx.lineTo(54, 0);
    ctx.stroke();
    ctx.fillStyle = decoration.color ?? visual.accent;
    ctx.beginPath();
    ctx.moveTo(72, 0);
    ctx.lineTo(42, -16);
    ctx.lineTo(42, 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSmallText(decoration.label, decoration.x - 56, decoration.y - 22, "#7a5b16", 12);
    return;
  }

  if (decoration.kind === "stickyCluster") {
    ctx.save();
    for (let index = 0; index < (decoration.count ?? 5); index += 1) {
      const x = decoration.x + (index % 4) * 26;
      const y = decoration.y + Math.floor(index / 4) * 20;
      ctx.fillStyle = index % 3 === 0 ? "#f1c15b" : index % 3 === 1 ? "#72a5ff" : "#96e072";
      ctx.globalAlpha = 0.46;
      ctx.fillRect(x, y, 18, 14);
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "deskGlowGrid") {
    ctx.save();
    ctx.globalAlpha = 0.16 + Math.sin(world.animTime * 1.8) * 0.03;
    ctx.strokeStyle = decoration.color ?? visual.accent;
    ctx.lineWidth = 1.5;
    for (let x = decoration.x; x <= decoration.x + decoration.w; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, decoration.y);
      ctx.lineTo(x, decoration.y + decoration.h);
      ctx.stroke();
    }
    for (let y = decoration.y; y <= decoration.y + decoration.h; y += 34) {
      ctx.beginPath();
      ctx.moveTo(decoration.x, y);
      ctx.lineTo(decoration.x + decoration.w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.22;
    fillCircle(decoration.x + decoration.w * 0.52, decoration.y + decoration.h * 0.45, 38, decoration.color ?? visual.accent);
    ctx.restore();
    return;
  }

  if (decoration.kind === "chairScuffs") {
    ctx.save();
    ctx.strokeStyle = decoration.color ?? "rgba(113, 128, 150, 0.44)";
    ctx.globalAlpha = 0.26;
    ctx.lineWidth = 2;
    for (let index = 0; index < (decoration.count ?? 6); index += 1) {
      const x = decoration.x + (index % 5) * 42;
      const y = decoration.y + Math.floor(index / 5) * 48 + Math.sin(index) * 7;
      ctx.beginPath();
      ctx.ellipse(x, y, 16 + (index % 3) * 4, 5, Math.sin(index * 1.8) * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "platformEdge") {
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = decoration.color ?? "#f1c15b";
    ctx.fillRect(decoration.x, decoration.y, decoration.w, decoration.h);
    ctx.fillStyle = "rgba(25, 28, 36, 0.38)";
    for (let x = decoration.x + 8; x < decoration.x + decoration.w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, decoration.y + decoration.h);
      ctx.lineTo(x + 18, decoration.y);
      ctx.lineTo(x + 30, decoration.y);
      ctx.lineTo(x + 12, decoration.y + decoration.h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "ticketTrail" || decoration.kind === "receiptTrail") {
    ctx.save();
    for (let index = 0; index < (decoration.count ?? 7); index += 1) {
      const x = decoration.x + index * 48;
      const y = decoration.y + Math.sin(index * 1.7) * 26;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(index) * 0.32);
      ctx.globalAlpha = 0.56;
      ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
      ctx.fillRect(-16, -9, 32, 18);
      ctx.strokeStyle = decoration.color ?? visual.accent;
      ctx.strokeRect(-16, -9, 32, 18);
      ctx.fillStyle = decoration.color ?? visual.accent;
      ctx.globalAlpha = 0.38;
      ctx.fillRect(-10, -2, 20, 3);
      ctx.restore();
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "signalPulse") {
    ctx.save();
    const pulse = 1 + Math.sin(world.animTime * 4) * 0.12;
    for (let index = 0; index < 3; index += 1) {
      ctx.globalAlpha = 0.26 - index * 0.055;
      strokeCircle(decoration.x, decoration.y, (26 + index * 22) * pulse, decoration.color ?? "#ef6a70", 3);
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "crowdGhosts") {
    ctx.save();
    for (let index = 0; index < (decoration.count ?? 9); index += 1) {
      const x = decoration.x + index * 62;
      const y = decoration.y + Math.sin(world.animTime * 1.3 + index) * 8;
      ctx.globalAlpha = 0.16 + (index % 3) * 0.03;
      fillCircle(x, y, 10, decoration.color ?? visual.accent);
      ctx.fillRect(x - 7, y + 10, 14, 26);
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "lanternString") {
    ctx.save();
    ctx.globalAlpha = 0.58;
    ctx.strokeStyle = decoration.color ?? "#f1c15b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(decoration.x1, decoration.y1);
    ctx.quadraticCurveTo((decoration.x1 + decoration.x2) / 2, decoration.y1 + 48, decoration.x2, decoration.y2);
    ctx.stroke();
    for (let index = 0; index < 13; index += 1) {
      const t = index / 12;
      const x = decoration.x1 + (decoration.x2 - decoration.x1) * t;
      const y = decoration.y1 + (decoration.y2 - decoration.y1) * t + Math.sin(t * Math.PI) * 38;
      fillCircle(x, y + 14, 11 + Math.sin(world.animTime * 3 + index) * 1.5, index % 2 ? "#f1c15b" : "#ef6a70");
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "neonPuddle" || decoration.kind === "recursionRings") {
    ctx.save();
    const radius = decoration.radius ?? 100;
    const gradient = ctx.createRadialGradient(decoration.x, decoration.y, 12, decoration.x, decoration.y, radius);
    gradient.addColorStop(0, decoration.kind === "neonPuddle" ? "rgba(150, 224, 114, 0.28)" : "rgba(150, 224, 114, 0.18)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(decoration.x, decoration.y, radius, 0, Math.PI * 2);
    ctx.fill();
    for (let index = 0; index < 3; index += 1) {
      const ring = radius * (0.34 + index * 0.22) + Math.sin(world.animTime * 2 + index) * 3;
      strokeCircle(decoration.x, decoration.y, ring, decoration.color ?? visual.accent, 2);
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "saltRain") {
    ctx.save();
    ctx.strokeStyle = decoration.color ?? visual.accent;
    ctx.globalAlpha = 0.34;
    ctx.lineWidth = 2;
    for (let index = 0; index < 18; index += 1) {
      const x = decoration.x + 16 + ((index * 37 + world.animTime * 22) % decoration.w);
      const y = decoration.y + 8 + ((index * 23) % decoration.h);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 12, y + 28);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "rootBud" || decoration.kind === "exceptionDots") {
    ctx.save();
    const count = decoration.count ?? 16;
    for (let index = 0; index < count; index += 1) {
      const x = decoration.kind === "exceptionDots"
        ? decoration.x + 20 + (index % 8) * (decoration.w / 8)
        : decoration.x + Math.cos(index * 2.1) * (34 + (index % 4) * 16);
      const y = decoration.kind === "exceptionDots"
        ? decoration.y + 18 + Math.floor(index / 8) * 48
        : decoration.y + Math.sin(index * 2.1) * (24 + (index % 3) * 18);
      const pulse = 1 + Math.sin(world.animTime * 3 + index) * 0.16;
      fillCircle(x, y, (decoration.kind === "exceptionDots" ? 5 : 7) * pulse, decoration.color ?? visual.accent);
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "awaitGlyphs") {
    ctx.save();
    ctx.globalAlpha = 0.36;
    ctx.strokeStyle = decoration.color ?? visual.accent;
    ctx.lineWidth = 2;
    for (let index = 0; index < 6; index += 1) {
      const x = decoration.x + 18 + index * 40;
      ctx.beginPath();
      ctx.moveTo(x, decoration.y + 18);
      ctx.lineTo(x + 18, decoration.y + decoration.h - 18);
      ctx.stroke();
      fillCircle(x + 22, decoration.y + 24 + Math.sin(world.animTime * 2 + index) * 18, 4, decoration.color ?? visual.accent);
    }
    drawSmallText("await await await", decoration.x + 16, decoration.y + decoration.h - 10, "#3e72d8", 11);
    ctx.restore();
    return;
  }

  if (decoration.kind === "scanGrid") {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = decoration.color ?? visual.accent;
    ctx.lineWidth = 1;
    for (let x = decoration.x; x <= decoration.x + decoration.w; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, decoration.y);
      ctx.lineTo(x, decoration.y + decoration.h);
      ctx.stroke();
    }
    for (let y = decoration.y; y <= decoration.y + decoration.h; y += 42) {
      ctx.beginPath();
      ctx.moveTo(decoration.x, y);
      ctx.lineTo(decoration.x + decoration.w, y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (decoration.kind === "evidenceLinks") {
    const nodes = [
      [232, 222], [410, 348], [640, 184], [874, 352], [1034, 226], [704, 604],
    ];
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = decoration.color ?? visual.accent;
    ctx.lineWidth = 2;
    for (let index = 0; index < nodes.length; index += 1) {
      const [x1, y1] = nodes[index];
      const [x2, y2] = nodes[(index + 2) % nodes.length];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (const [x, y] of nodes) {
      fillCircle(x, y, 6, decoration.color ?? visual.accent);
    }
    ctx.restore();
  }
}

function drawThemedMapProp(object, visual) {
  ctx.save();
  const color = object.color ?? visual.accent;

  if (object.kind === "deliveryCrates" || object.kind === "saltCrates") {
    ctx.fillStyle = object.kind === "deliveryCrates" ? "#d8b26e" : "#e8f3d8";
    ctx.fillRect(object.x, object.y + 18, object.w, object.h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let index = 0; index < 3; index += 1) {
      const x = object.x + index * (object.w / 3);
      ctx.strokeRect(x + 4, object.y + 18 + (index % 2) * 8, object.w / 3 - 8, object.h - 10);
      drawSmallText(index === 1 ? "999" : "#", x + 16, object.y + 48, "#6b4d1d", 12);
    }
    drawLabel(object.label, object.x + 12, object.y + object.h + 34, "#6b4d1d");
    ctx.restore();
    return;
  }

  if (object.kind === "routeTerminal" || object.kind === "scanConsole" || object.kind === "archiveTerminal") {
    ctx.fillStyle = "rgba(28, 38, 52, 0.88)";
    ctx.fillRect(object.x, object.y, object.w, object.h);
    ctx.fillStyle = object.kind === "scanConsole" ? "#ef6a70" : object.kind === "archiveTerminal" ? "#72a5ff" : "#5de2d1";
    ctx.globalAlpha = 0.75;
    ctx.fillRect(object.x + 10, object.y + 10, object.w - 20, object.h * 0.42);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(247, 250, 255, 0.78)";
    ctx.fillRect(object.x + 14, object.y + object.h - 22, object.w - 28, 6);
    drawLabel(object.label, object.x - 2, object.y + object.h + 18, "#224250");
    ctx.restore();
    return;
  }

  if (object.kind === "phoneBeacon") {
    ctx.translate(object.x, object.y);
    ctx.fillStyle = "#1c2634";
    ctx.fillRect(-16, -28, 32, 56);
    ctx.fillStyle = "#f7fbff";
    ctx.fillRect(-12, -22, 24, 42);
    ctx.fillStyle = "#ef6a70";
    ctx.globalAlpha = 0.78 + Math.sin(world.animTime * 5) * 0.12;
    ctx.fillRect(-8, -12, 16, 20);
    ctx.globalAlpha = 1;
    drawSmallText(object.label, -9, 4, "#ffffff", 10);
    ctx.restore();
    return;
  }

  if (object.kind === "areaGate") {
    const pulse = 0.6 + Math.sin(world.animTime * 3.6 + object.x * 0.01) * 0.16;
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = color;
    ctx.fillRect(object.x, object.y, object.w, object.h);
    ctx.globalAlpha = 0.68;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 10]);
    ctx.strokeRect(object.x, object.y, object.w, object.h);
    ctx.setLineDash([]);
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.moveTo(object.x + object.w - 44, object.y + object.h / 2);
    ctx.lineTo(object.x + object.w - 78, object.y + 18);
    ctx.lineTo(object.x + object.w - 78, object.y + object.h - 18);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    drawLabel(object.label, object.x + 18, object.y + object.h / 2 + 5, "#224250");
    ctx.restore();
    return;
  }

  if (object.kind === "visitorStool") {
    if (drawPropAsset("propOfficeChair", object.x - 8, object.y - 24, object.w ?? 58, object.h ?? 68)) {
      drawLabel(object.label, object.x - 8, object.y + (object.h ?? 46) + 18, "#224250");
      ctx.restore();
      return;
    }
  }

  if (object.kind === "meetingBench") {
    if (drawPropAsset("propMeetingBench", object.x - 14, object.y - 30, object.w ?? 164, object.h ?? 92)) {
      drawLabel(object.label, object.x + 12, object.y + (object.h ?? 78) + 16, "#224250");
      ctx.restore();
      return;
    }
  }

  if (object.kind === "metroBench") {
    ctx.fillStyle = "rgba(247, 250, 255, 0.86)";
    ctx.fillRect(object.x, object.y, object.w, object.h);
    ctx.strokeStyle = "#72a5ff";
    ctx.strokeRect(object.x, object.y, object.w, object.h);
    ctx.fillStyle = "#2f486b";
    for (let index = 0; index < 4; index += 1) {
      ctx.fillRect(object.x + 14 + index * 42, object.y + 8, 26, object.h - 16);
    }
    drawLabel(object.label, object.x + 18, object.y + object.h + 18, "#224250");
    ctx.restore();
    return;
  }

  if (object.kind === "ticketMachine" || object.kind === "signalLight") {
    ctx.fillStyle = object.kind === "ticketMachine" ? "#d9e7f6" : "#273448";
    ctx.fillRect(object.x, object.y, object.w, object.h);
    ctx.strokeStyle = color;
    ctx.strokeRect(object.x, object.y, object.w, object.h);
    const lights = object.kind === "signalLight" ? ["#ef6a70", "#f1c15b", "#96e072"] : ["#72a5ff", "#f7fbff", "#f1c15b"];
    for (let index = 0; index < lights.length; index += 1) {
      fillCircle(object.x + object.w / 2, object.y + 20 + index * 24, 8, lights[index]);
    }
    drawLabel(object.label, object.x + 4, object.y + object.h + 18, "#224250");
    ctx.restore();
    return;
  }

  if (object.kind === "noodleCart") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
    ctx.fillRect(object.x, object.y, object.w, object.h);
    ctx.fillStyle = "#d8b26e";
    ctx.fillRect(object.x, object.y, object.w, 18);
    fillCircle(object.x + 22, object.y + object.h + 4, 10, "#1c2634");
    fillCircle(object.x + object.w - 22, object.y + object.h + 4, 10, "#1c2634");
    drawSmallText("12 = 12", object.x + 20, object.y + 44, "#6b4d1d", 13);
    drawLabel(object.label, object.x + 18, object.y + object.h - 6, "#6b4d1d");
    ctx.restore();
    return;
  }

  if (object.kind === "memoryReceipt") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(object.x, object.y, object.w, object.h);
    ctx.strokeStyle = "#d8b26e";
    ctx.strokeRect(object.x, object.y, object.w, object.h);
    drawSmallText("YESTERDAY?", object.x + 8, object.y + 24, "#9a6615", 10);
    drawLabel(object.label, object.x + 4, object.y + object.h + 18, "#6b4d1d");
    ctx.restore();
    return;
  }

  if (object.kind === "hashCounter") {
    ctx.fillStyle = "rgba(28, 38, 52, 0.86)";
    ctx.fillRect(object.x, object.y, object.w, object.h);
    ctx.fillStyle = "#96e072";
    ctx.globalAlpha = 0.82;
    ctx.fillRect(object.x + 10, object.y + 12, object.w - 20, object.h - 24);
    ctx.globalAlpha = 1;
    drawSmallText(object.label, object.x + 24, object.y + 48, "#1d3b22", 20);
    ctx.restore();
    return;
  }

  if (object.kind === "promiseTablet" || object.kind === "contractMonolith") {
    ctx.fillStyle = object.kind === "promiseTablet" ? "rgba(247, 255, 244, 0.88)" : "rgba(48, 82, 54, 0.82)";
    ctx.fillRect(object.x, object.y, object.w, object.h);
    ctx.strokeStyle = "#96e072";
    ctx.lineWidth = 3;
    ctx.strokeRect(object.x, object.y, object.w, object.h);
    for (let index = 0; index < 4; index += 1) {
      ctx.fillStyle = index % 2 ? "rgba(114, 165, 255, 0.42)" : "rgba(150, 224, 114, 0.46)";
      ctx.fillRect(object.x + 14, object.y + 18 + index * 20, object.w - 28, 6);
    }
    drawLabel(object.label, object.x + 8, object.y + object.h + 18, "#315f34");
    ctx.restore();
    return;
  }

  if (object.kind === "awaitHourglass" || object.kind === "rootLantern") {
    ctx.translate(object.x + object.w / 2, object.y + object.h / 2);
    ctx.strokeStyle = object.kind === "awaitHourglass" ? "#72a5ff" : "#96e072";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, -34);
    ctx.lineTo(22, -34);
    ctx.lineTo(-18, 34);
    ctx.lineTo(18, 34);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = object.kind === "awaitHourglass" ? "rgba(114, 165, 255, 0.45)" : "rgba(150, 224, 114, 0.45)";
    fillCircle(0, Math.sin(world.animTime * 2) * 10, 12, ctx.fillStyle);
    ctx.restore();
    drawLabel(object.label, object.x + 4, object.y + object.h + 18, "#315f34");
    return;
  }

  if (object.kind === "evidencePod" || object.kind === "calibrationObelisk") {
    const cx = object.x + object.w / 2;
    const cy = object.y + object.h / 2;
    ctx.fillStyle = object.kind === "evidencePod" ? "rgba(114, 165, 255, 0.18)" : "rgba(239, 106, 112, 0.18)";
    fillCircle(cx, cy, Math.max(object.w, object.h) * 0.52, ctx.fillStyle);
    ctx.strokeStyle = object.kind === "evidencePod" ? "#72a5ff" : "#ef6a70";
    ctx.lineWidth = 3;
    strokeCircle(cx, cy, Math.max(object.w, object.h) * 0.46, ctx.strokeStyle, 3);
    ctx.fillStyle = "rgba(28, 38, 52, 0.82)";
    ctx.fillRect(cx - 14, cy - 28, 28, 56);
    drawLabel(object.label, object.x - 4, object.y + object.h + 18, "#224250");
    ctx.restore();
    return;
  }

  ctx.restore();
}

function getChapterVisual() {
  const palette = [
    {
      floor: "#f8fbff",
      grid: "rgba(58, 83, 112, 0.075)",
      wall: "#e8f1fa",
      trim: "#c8d8e8",
      accent: "#5de2d1",
      keyArtAlpha: 0.36,
      floorVeil: 0.74,
      tintA: "rgba(93, 226, 209, 0.08)",
      tintB: "rgba(241, 193, 91, 0.1)",
      label: "外卖取餐区",
    },
    {
      floor: "#f7fbff",
      grid: "rgba(62, 114, 216, 0.1)",
      wall: "#e4eefb",
      trim: "#72a5ff",
      accent: "#72a5ff",
      keyArtAlpha: 0.41,
      floorVeil: 0.72,
      tintA: "rgba(62, 114, 216, 0.12)",
      tintB: "rgba(93, 226, 209, 0.08)",
      label: "环线站台",
    },
    {
      floor: "#fbfaf4",
      grid: "rgba(120, 96, 42, 0.09)",
      wall: "#f2eadc",
      trim: "#d8b26e",
      accent: "#96e072",
      keyArtAlpha: 0.34,
      floorVeil: 0.78,
      tintA: "rgba(216, 178, 110, 0.12)",
      tintB: "rgba(150, 224, 114, 0.08)",
      label: "哈希夜市",
    },
    {
      floor: "#f8fbf6",
      grid: "rgba(65, 124, 72, 0.1)",
      wall: "#e7f2e6",
      trim: "#96e072",
      accent: "#96e072",
      keyArtAlpha: 0.33,
      floorVeil: 0.8,
      tintA: "rgba(150, 224, 114, 0.12)",
      tintB: "rgba(114, 165, 255, 0.08)",
      label: "承诺塔根层",
    },
    {
      floor: "#f9fbfd",
      grid: "rgba(36, 45, 62, 0.11)",
      wall: "#edf1f5",
      trim: "#a9b5c3",
      accent: "#ef6a70",
      keyArtAlpha: 0.45,
      floorVeil: 0.7,
      tintA: "rgba(239, 106, 112, 0.1)",
      tintB: "rgba(114, 165, 255, 0.12)",
      label: "零号核心",
    },
  ];
  return palette[currentChapterIndex] ?? palette[0];
}

function drawKeyArtBackdrop(visual) {
  const asset = assets.sceneKeyArt;
  if (!asset?.ready) {
    return;
  }

  const image = asset.image;
  const imageWidth = image.naturalWidth || image.width || world.width;
  const imageHeight = image.naturalHeight || image.height || world.height;
  const scale = Math.max(world.width / imageWidth, world.height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = (world.width - drawWidth) / 2;
  const drawY = (world.height - drawHeight) / 2;
  const scanlineOffset = (world.animTime * 18) % 48;
  const pulse = Math.sin(world.animTime * 0.85 + currentChapterIndex) * 0.035;
  const veil = ctx.createLinearGradient(0, 0, world.width, world.height);
  veil.addColorStop(0, visual.tintA);
  veil.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
  veil.addColorStop(1, visual.tintB);

  ctx.save();
  ctx.globalAlpha = clamp((visual.keyArtAlpha ?? 0.36) + pulse, 0.22, 0.52);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.globalAlpha = 1;
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = visual.accent;
  ctx.lineWidth = 1;
  for (let y = -48 + scanlineOffset; y < world.height + 48; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y - 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawChapterBackdrop(visual) {
  ctx.save();
  ctx.globalAlpha = 0.72;

  if (currentChapterIndex === 1) {
    drawRailLine(118, 456, 1148, 336, visual.accent);
    drawRailLine(88, 514, 1118, 394, "rgba(241, 193, 91, 0.7)");
    drawStationSign(768, 92, "环线 03:32");
  }

  if (currentChapterIndex === 2) {
    for (let index = 0; index < 18; index += 1) {
      const x = 86 + index * 66;
      ctx.strokeStyle = index % 2 ? "rgba(150, 224, 114, 0.24)" : "rgba(216, 178, 110, 0.26)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 82);
      ctx.lineTo(x - 34, 210);
      ctx.stroke();
    }
    drawMarketCanopy(168, 456, "#d8b26e", "摊位 12");
    drawMarketCanopy(836, 342, "#96e072", "HASH");
  }

  if (currentChapterIndex === 3) {
    ctx.strokeStyle = "rgba(150, 224, 114, 0.35)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(640, 720);
    ctx.bezierCurveTo(610, 568, 696, 442, 656, 300);
    ctx.bezierCurveTo(632, 220, 700, 154, 682, 78);
    ctx.stroke();
    drawBranch(640, 470, 430, 330);
    drawBranch(656, 344, 890, 214);
    drawBranch(642, 230, 520, 132);
    drawStationSign(824, 92, "根承诺");
  }

  if (currentChapterIndex === 4) {
    const nodes = [
      [230, 174],
      [442, 110],
      [706, 168],
      [956, 112],
      [1096, 334],
      [842, 492],
      [560, 420],
      [302, 560],
    ];
    ctx.strokeStyle = "rgba(239, 106, 112, 0.22)";
    ctx.lineWidth = 2;
    for (let index = 0; index < nodes.length; index += 1) {
      const [x1, y1] = nodes[index];
      const [x2, y2] = nodes[(index + 2) % nodes.length];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (const [x, y] of nodes) {
      fillCircle(x, y, 8, "rgba(239, 106, 112, 0.35)");
      strokeCircle(x, y, 16 + Math.sin(world.animTime * 2 + x) * 4, "rgba(114, 165, 255, 0.35)", 2);
    }
    drawStationSign(748, 92, "差异保留");
  }

  ctx.restore();
}

function drawRailLine(x1, y1, x2, y2, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.setLineDash([22, 16]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawStationSign(x, y, text) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.fillRect(x - 72, y - 20, 144, 38);
  ctx.strokeStyle = "rgba(26, 42, 68, 0.16)";
  ctx.strokeRect(x - 72, y - 20, 144, 38);
  drawSmallText(text, x - 52, y + 4, "#26364d", 14);
  ctx.restore();
}

function drawMarketCanopy(x, y, color, text) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
  ctx.fillRect(x - 82, y - 36, 164, 82);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.38;
  ctx.fillRect(x - 82, y - 36, 164, 18);
  ctx.globalAlpha = 1;
  drawSmallText(text, x - 28, y - 12, "#26364d", 12);
  ctx.restore();
}

function drawBranch(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, y1 - 58, x2, y2);
  ctx.stroke();
}

function drawDeliveryPickupZone(x, y) {
  ctx.save();
  ctx.fillStyle = "rgba(241, 193, 91, 0.16)";
  ctx.fillRect(x - 52, y - 42, 244, 104);
  ctx.strokeStyle = "rgba(201, 132, 22, 0.38)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 52, y - 42, 244, 104);

  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const px = x - 36 + col * 48;
      const py = y - 28 + row * 36;
      ctx.fillStyle = col % 2 === row % 2 ? "#fff4dc" : "#f3dcc0";
      ctx.fillRect(px, py, 38, 28);
      ctx.strokeStyle = "#d2a053";
      ctx.strokeRect(px, py, 38, 28);
      ctx.fillStyle = "#0f9f95";
      ctx.globalAlpha = 0.22 + Math.sin(performance.now() / 300 + col + row) * 0.08;
      ctx.fillRect(px + 6, py + 9, 26, 6);
      ctx.globalAlpha = 1;
    }
  }

  ctx.strokeStyle = "rgba(15, 159, 149, 0.45)";
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(x - 52, y + 72);
  ctx.lineTo(x + 198, y + 72);
  ctx.stroke();
  ctx.setLineDash([]);
  drawLabel(getChapterVisual().label, x - 8, y + 80, "#9a6615");
  ctx.restore();
}

function drawMarketStall(object, visual) {
  const color = object.color ?? visual.accent;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.fillRect(object.x, object.y, object.w, object.h);
  ctx.strokeStyle = "rgba(26, 42, 68, 0.14)";
  ctx.strokeRect(object.x, object.y, object.w, object.h);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.32;
  ctx.fillRect(object.x, object.y, object.w, 22);
  ctx.globalAlpha = 1;
  for (let index = 0; index < 4; index += 1) {
    const px = object.x + 18 + index * 42;
    ctx.fillStyle = index % 2 ? "rgba(150, 224, 114, 0.38)" : "rgba(241, 193, 91, 0.42)";
    ctx.fillRect(px, object.y + 48, 28, 22);
  }
  drawLabel(object.label, object.x + 16, object.y + object.h - 14, "#6b4d1d");
  ctx.restore();
}

function drawGateObject(object, visual) {
  ctx.save();
  ctx.fillStyle = "rgba(247, 250, 255, 0.86)";
  ctx.fillRect(object.x, object.y, object.w, object.h);
  ctx.strokeStyle = "rgba(26, 42, 68, 0.18)";
  ctx.strokeRect(object.x, object.y, object.w, object.h);
  ctx.fillStyle = visual.accent;
  ctx.globalAlpha = 0.32;
  for (let x = object.x + 14; x < object.x + object.w - 12; x += 42) {
    ctx.fillRect(x, object.y + 12, 22, object.h - 24);
  }
  ctx.globalAlpha = 1;
  drawLabel(object.label, object.x + 12, object.y + object.h - 8, "#224250");
  ctx.restore();
}

function drawPillarObject(object, visual) {
  ctx.save();
  const cx = object.x + object.w / 2;
  const cy = object.y + object.h / 2;
  fillCircle(cx, cy, Math.max(object.w, object.h) * 0.52, "rgba(255, 255, 255, 0.82)");
  strokeCircle(cx, cy, Math.max(object.w, object.h) * 0.52, "rgba(26, 42, 68, 0.15)", 2);
  strokeCircle(cx, cy, Math.max(object.w, object.h) * 0.34, visual.accent, 2);
  drawSmallText(object.label, object.x - 2, object.y + object.h + 18, "#5c6878", 11);
  ctx.restore();
}

function drawTechBlockObject(object, visual) {
  ctx.save();
  const gradient = ctx.createLinearGradient(object.x, object.y, object.x + object.w, object.y + object.h);
  gradient.addColorStop(0, "rgba(33, 48, 68, 0.9)");
  gradient.addColorStop(0.52, "rgba(247, 250, 255, 0.86)");
  gradient.addColorStop(1, "rgba(33, 48, 68, 0.84)");
  ctx.fillStyle = object.kind === "train" ? "rgba(232, 241, 250, 0.9)" : gradient;
  ctx.fillRect(object.x, object.y, object.w, object.h);
  ctx.strokeStyle = object.kind === "coreBlock" ? "rgba(239, 106, 112, 0.5)" : "rgba(26, 42, 68, 0.18)";
  ctx.lineWidth = object.kind === "coreBlock" ? 3 : 2;
  ctx.strokeRect(object.x, object.y, object.w, object.h);
  ctx.fillStyle = visual.accent;
  ctx.globalAlpha = 0.55;
  for (let index = 0; index < 5; index += 1) {
    const px = object.x + 18 + index * Math.max(34, object.w / 6);
    ctx.fillRect(px, object.y + object.h * 0.34, 28, 8);
  }
  ctx.globalAlpha = 1;
  drawLabel(object.label, object.x + 18, object.y + object.h - 12, object.kind === "coreBlock" ? "#ef6a70" : "#224250");
  ctx.restore();
}

function drawRootObject(object, visual) {
  ctx.save();
  const color = object.kind === "coreTree" ? "#96e072" : visual.accent;
  ctx.fillStyle = object.kind === "coreTree" ? "rgba(150, 224, 114, 0.26)" : "rgba(255, 255, 255, 0.72)";
  ctx.fillRect(object.x, object.y, object.w, object.h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(object.x, object.y, object.w, object.h);
  ctx.strokeStyle = "rgba(65, 124, 72, 0.38)";
  ctx.lineWidth = 4;
  for (let index = 0; index < 4; index += 1) {
    const y = object.y + 18 + index * (object.h / 4);
    ctx.beginPath();
    ctx.moveTo(object.x + 8, y);
    ctx.quadraticCurveTo(object.x + object.w / 2, y - 28, object.x + object.w - 8, y + 8);
    ctx.stroke();
  }
  drawLabel(object.label, object.x + 12, object.y + object.h - 10, "#315f34");
  ctx.restore();
}

function drawOfficeFixture(object, visual) {
  const assetKeys = {
    fileCabinet: "propFileCabinet",
    planterBox: "propPlanterBox",
    partitionWide: "propPartitionWide",
    partitionLeft: "propPartitionLeft",
    partitionRight: "propPartitionRight",
  };
  const key = assetKeys[object.kind];
  const width = object.w ?? 96;
  const height = object.h ?? 80;
  if (key && drawPropAsset(key, object.x, object.y, width, height)) {
    if (object.label) {
      drawLabel(object.label, object.x + 12, object.y + height - 8, "#224250");
    }
    return;
  }

  ctx.save();
  ctx.fillStyle = object.kind === "planterBox" ? "rgba(150, 224, 114, 0.3)" : "rgba(247, 250, 255, 0.76)";
  ctx.fillRect(object.x, object.y, width, height);
  ctx.strokeStyle = object.color ?? visual.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(object.x, object.y, width, height);
  if (object.kind === "planterBox") {
    for (let index = 0; index < 5; index += 1) {
      fillCircle(object.x + 24 + index * 34, object.y + 22 + Math.sin(index) * 6, 15, "#3bb579");
    }
  } else {
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = object.color ?? visual.accent;
    for (let x = object.x + 18; x < object.x + width - 18; x += 44) {
      ctx.fillRect(x, object.y + 14, 24, height - 28);
    }
  }
  if (object.label) {
    drawLabel(object.label, object.x + 12, object.y + height - 8, "#224250");
  }
  ctx.restore();
}

function drawDesk(desk) {
  if (desk.assetKey) {
    const width = desk.w + 42;
    const height = Math.round(width * 1.1);
    const x = desk.x - 20;
    const y = desk.y - 62;
    if (drawPropAsset(desk.assetKey, x, y, width, height)) {
      drawLabel(desk.tag, desk.x + 12, desk.y + desk.h - 10, "#5c6878");
      return;
    }
  }

  ctx.fillStyle = "#d7e1ec";
  ctx.fillRect(desk.x, desk.y, desk.w, desk.h);
  ctx.fillStyle = "#eef4fa";
  ctx.fillRect(desk.x + 8, desk.y + 8, desk.w - 16, 8);
  ctx.fillStyle = "#223044";
  ctx.fillRect(desk.x + 14, desk.y + 22, 38, 20);
  ctx.fillStyle = "#78dff1";
  ctx.fillRect(desk.x + 18, desk.y + 25, 30, 12);
  ctx.fillStyle = "#44566f";
  ctx.fillRect(desk.x + 60, desk.y + 32, 44, 6);
  ctx.fillStyle = "#f1c15b";
  ctx.fillRect(desk.x + desk.w - 32, desk.y + 25, 12, 13);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(desk.x + desk.w - 56, desk.y + 22, 18, 22);
  drawChair(desk.x + 30, desk.y + desk.h + 10);
  drawLabel(desk.tag, desk.x + 12, desk.y + desk.h - 10, "#5c6878");
}

function drawWindowRow(x, y, count) {
  if (count >= 3 && drawPropAsset("propWindowRow", x - 4, y - 9, count * 62, 50)) {
    return;
  }

  for (let index = 0; index < count; index += 1) {
    const px = x + index * 62;
    ctx.fillStyle = "#d7ecff";
    ctx.fillRect(px, y, 48, 34);
    ctx.strokeStyle = "#9fbed6";
    ctx.strokeRect(px, y, 48, 34);
    ctx.beginPath();
    ctx.moveTo(px + 24, y);
    ctx.lineTo(px + 24, y + 34);
    ctx.moveTo(px, y + 17);
    ctx.lineTo(px + 48, y + 17);
    ctx.stroke();
  }
}

function drawWhiteboard(x, y, w, h) {
  ctx.fillStyle = "#f8fbff";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#b6c7d7";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#3e72d8";
  ctx.fillRect(x + 14, y + 12, 42, 4);
  ctx.fillStyle = "#d94f5c";
  ctx.fillRect(x + 14, y + 24, 74, 4);
  ctx.fillStyle = "#0f9f95";
  ctx.fillRect(x + 100, y + 16, 46, 4);
}

function drawChair(x, y) {
  if (drawPropAsset("propDeskChair", x - 24, y - 42, 50, 80)) {
    return;
  }

  ctx.fillStyle = "#b7c4d4";
  ctx.fillRect(x - 14, y - 8, 28, 14);
  ctx.fillStyle = "#8ea1b8";
  ctx.fillRect(x - 10, y + 5, 20, 6);
}

function drawPlant(x, y, scale = 1) {
  const key = scale > 1.05 ? "propPlantLeafy" : scale < 0.9 ? "propPlantSmall" : "propPlantRound";
  const width = (scale < 0.9 ? 44 : 62) * scale;
  const height = (scale < 0.9 ? 68 : 92) * scale;
  if (drawPropAsset(key, x - width / 2, y - height * 0.5, width, height)) {
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#d18b42";
  ctx.fillRect(-12, 18, 24, 18);
  ctx.fillStyle = "#b86b32";
  ctx.fillRect(-15, 14, 30, 6);
  ctx.fillStyle = "#2f9c67";
  fillCircle(-9, 4, 12, "#2f9c67");
  fillCircle(8, 2, 14, "#3bb579");
  fillCircle(0, -10, 13, "#2f9c67");
  ctx.restore();
}

function drawCopier(x, y) {
  if (drawPropAsset("propCopier", x - 10, y - 24, 94, 108)) {
    return;
  }

  ctx.fillStyle = "#d3dce7";
  ctx.fillRect(x, y, 78, 50);
  ctx.fillStyle = "#eef4fa";
  ctx.fillRect(x + 8, y - 16, 62, 18);
  ctx.fillStyle = "#8fa2b6";
  ctx.fillRect(x + 12, y + 12, 44, 8);
  ctx.fillStyle = "#3e72d8";
  ctx.fillRect(x + 58, y + 12, 8, 8);
}

function drawWaterCooler(x, y) {
  if (drawPropAsset("propWaterCooler", x - 4, y - 14, 58, 110)) {
    return;
  }

  ctx.fillStyle = "#d7ecff";
  ctx.fillRect(x + 10, y, 28, 30);
  ctx.fillStyle = "#e8eef5";
  ctx.fillRect(x, y + 28, 48, 58);
  ctx.fillStyle = "#3e72d8";
  ctx.fillRect(x + 12, y + 45, 24, 6);
}

function drawMeetingTable(x, y) {
  if (drawPropAsset("propMeetingTable", x - 24, y - 44, 260, 132)) {
    return;
  }

  ctx.fillStyle = "#e1c398";
  ctx.fillRect(x, y, 210, 56);
  ctx.fillStyle = "#caa874";
  ctx.fillRect(x + 8, y + 8, 194, 8);
  drawChair(x + 28, y - 8);
  drawChair(x + 88, y - 8);
  drawChair(x + 148, y - 8);
  drawChair(x + 54, y + 70);
  drawChair(x + 122, y + 70);
}

function drawPrinter(x, y) {
  if (drawPropAsset("propPrinter", x - 12, y - 24, 96, 108)) {
    return;
  }

  ctx.fillStyle = "#cbd6e2";
  ctx.fillRect(x, y, 72, 38);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 12, y - 14, 46, 18);
  ctx.fillStyle = "#223044";
  ctx.fillRect(x + 14, y + 12, 44, 6);
}

function drawServerRack(x, y) {
  if (drawPropAsset("propServerRack", x - 8, y - 24, 68, 124)) {
    return;
  }

  ctx.fillStyle = "#26364d";
  ctx.fillRect(x, y, 52, 82);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "#314763" : "#203049";
    ctx.fillRect(x + 6, y + 8 + i * 14, 40, 8);
    ctx.fillStyle = i % 2 === 0 ? "#5de2d1" : "#f1c15b";
    ctx.fillRect(x + 10, y + 10 + i * 14, 5, 4);
  }
}

function drawServerRoomDoor(x, y) {
  if (drawPropAsset("propServerRoomDoor", x, y, 440, 170)) {
    drawLabel("0号服务器间", x + 164, y + 143, "#224250");
    return;
  }

  drawServerRack(x + 12, y + 36);
  drawServerRack(x + 82, y + 36);
  drawServerRack(x + 308, y + 36);
}

function drawBugNodes(dt) {
  for (const node of bugNodes) {
    node.pulse += dt * 3;
    const glow = 5 + Math.sin(node.pulse) * 3;
    const bob = Math.sin(world.animTime * 2.4 + node.animPhase) * 3;
    const spin = node.pulse * 0.22;
    const assetKey = getBugNodeAssetKey(node);
    ctx.save();
    ctx.translate(node.x, node.y + bob);
    ctx.fillStyle = node.event.color;
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, node.interactRadius ?? node.radius + 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    ctx.arc(0, 0, node.radius + 18 + glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + node.pulse * 0.25;
      const radius = i % 2 === 0 ? node.radius + glow : node.radius - 4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    if (assetKey) {
      ctx.rotate(spin);
      drawCenteredAsset(assetKey, 0, 0, 42 + glow, 42 + glow, false);
    }
    ctx.restore();

    if (node.openingFocus) {
      const labelY = node.y + bob - (node.interactRadius ?? node.radius + 28) - 22;
      ctx.save();
      ctx.globalAlpha = 0.92;
      drawMarkerTag("首个异常 · 触发开场链", node.x, labelY, node.event.color);
      ctx.globalAlpha = 0.82;
      drawSmallText("+1 bug点数 / +2 经验", node.x - 56, labelY + 24, "#26364d", 12);
      ctx.restore();
    }
  }
}

function getBugNodeAssetKey(node) {
  if (node.event?.id === "debug-badge") {
    return "breakpointBadge";
  }
  return "bugPoint";
}

function drawBugPickups() {
  for (const pickup of bugPickups) {
    const glow = 3 + Math.sin(pickup.pulse) * 2;
    const bob = Math.sin(world.animTime * 4.2 + pickup.animPhase) * 2.4;
    ctx.save();
    ctx.translate(pickup.x, pickup.y + bob);
    ctx.fillStyle = "#0f9f95";
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(0, 0, pickup.radius + 10 + glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#10b9a8";
    ctx.beginPath();
    ctx.moveTo(0, -pickup.radius - glow);
    ctx.lineTo(pickup.radius + glow, 0);
    ctx.lineTo(0, pickup.radius + glow);
    ctx.lineTo(-pickup.radius - glow, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-2, -2, 4, 4);
    ctx.rotate(pickup.pulse * 0.55);
    drawCenteredAsset("bugPoint", 0, 0, 26 + glow * 1.4, 26 + glow * 1.4);
    ctx.restore();
  }
}

function drawBullets() {
  for (const bullet of bullets) {
    const speed = Math.hypot(bullet.vx, bullet.vy) || 1;
    const ux = bullet.vx / speed;
    const uy = bullet.vy / speed;
    const drawAngle = bullet.angle + Math.sin(world.animTime * 16 + bullet.animPhase) * 0.05 + world.animTime * bullet.spin * 0.08;
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    for (let index = 3; index >= 1; index -= 1) {
      const alpha = 0.12 / index;
      const offset = index * Math.max(10, bullet.radius * 1.8);
      if (!drawRotatedAsset(bullet.assetKey, -ux * offset, -uy * offset, bullet.assetWidth, bullet.assetHeight, drawAngle, alpha, 0.86)) {
        ctx.globalAlpha = alpha;
        fillCircle(-ux * offset, -uy * offset, bullet.radius + 3, bullet.color);
        ctx.globalAlpha = 1;
      }
    }
    if (drawRotatedAsset(bullet.assetKey, 0, 0, bullet.assetWidth, bullet.assetHeight, drawAngle)) {
      ctx.restore();
      continue;
    }
    ctx.fillStyle = bullet.color;
    ctx.globalAlpha = 0.24;
    ctx.beginPath();
    ctx.arc(0, 0, bullet.radius + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillRect(-bullet.radius, -bullet.radius, bullet.radius * 2, bullet.radius * 2);
    ctx.fillStyle = "#f6f1e7";
    ctx.fillRect(-1, -bullet.radius - 2, 2, 2);
    ctx.restore();
  }
}

function drawProtocolHazards() {
  if (boss?.state === "handshake" && boss.lastRoute) {
    const pulse = 0.44 + Math.sin(performance.now() / 90) * 0.18;
    const drawn = drawRouteEffectAsset("bossTcpRoute", boss.lastRoute, 120, pulse + 0.2);
    if (!drawn) {
      drawProtocolRoute(boss.lastRoute, "#5de2d1", pulse, 5, true);
      drawProtocolRoute(offsetRoute(boss.lastRoute, 11), "#72a5ff", 0.36, 3, true);
      drawProtocolRoute(offsetRoute(boss.lastRoute, -11), "#f1c15b", 0.3, 3, true);
    }
    drawRouteSignal(boss.lastRoute, "#ffffff", 0.8);
    drawRouteSignal(boss.lastRoute, "#5de2d1", 0.46, 0.42);
  }

  for (const hazard of protocolHazards) {
    if (hazard.type === "retransmit") {
      const armed = hazard.timer <= 0;
      const drawn = drawRouteEffectAsset("bossTimeoutRoute", hazard, armed ? 116 : 96, armed ? 0.74 : 0.42);
      if (!drawn) {
        drawProtocolRoute(hazard, armed ? "#ef6a70" : "#f1c15b", armed ? 0.72 : 0.34, armed ? 8 : 4, !armed);
      }
      drawRouteSignal(hazard, armed ? "#ef6a70" : "#f1c15b", armed ? 0.78 : 0.38, hazard.x1 * 0.013);
    }

    if (hazard.type === "package") {
      drawDeliveryPackage(hazard.x, hazard.y, hazard.radius, hazard.color, Math.atan2(hazard.vy, hazard.vx));
    }

    if (hazard.type === "ftp") {
      drawFtpPackage(hazard);
    }

    if (hazard.type === "dns") {
      drawDnsMarker(hazard);
    }

    if (hazard.type === "timetableBeat") {
      drawTimetableBeat(hazard);
    }

    if (hazard.type === "indexLock") {
      drawIndexLock(hazard);
    }

    if (hazard.type === "pledgeAnchor") {
      drawPledgeAnchor(hazard);
    }

    if (hazard.type === "ruleScan") {
      drawRuleScan(hazard);
    }

    if (hazard.type === "ruleAppeal") {
      drawRuleAppeal(hazard);
    }
  }
}

function drawEnemyHazards() {
  for (const hazard of enemyHazards ?? []) {
    const progress = clamp(1 - hazard.life / (hazard.maxLife ?? (hazard.life || 1)), 0, 1);
    const armed = hazard.armed ?? hazard.armTime === undefined;
    const color = hazard.color ?? "#72a5ff";
    ctx.save();
    ctx.globalAlpha = hazard.type === "scanLock" ? 0.18 + progress * 0.16 : 0.12 + (1 - progress) * 0.2;
    fillCircle(hazard.x, hazard.y, hazard.radius, color);
    ctx.globalAlpha = hazard.type === "scanLock" ? 0.72 : 0.36;
    ctx.strokeStyle = armed ? (hazard.type === "scanLock" ? "#ef6a70" : color) : color;
    ctx.lineWidth = hazard.type === "scanLock" ? 3 : 2;
    if (!armed) {
      ctx.setLineDash([8, 8]);
    }
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius * (hazard.type === "scanLock" ? 1 + Math.sin(world.animTime * 18) * 0.035 : 1), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (hazard.type === "enemyTrail") {
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = "#f7fbff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hazard.x - hazard.radius * 0.55, hazard.y);
      ctx.lineTo(hazard.x + hazard.radius * 0.55, hazard.y);
      ctx.moveTo(hazard.x, hazard.y - hazard.radius * 0.55);
      ctx.lineTo(hazard.x, hazard.y + hazard.radius * 0.55);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawProtocolRoute(route, color, alpha, width, dashed = false) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dashed) {
    ctx.setLineDash([18, 12]);
  }
  ctx.beginPath();
  ctx.moveTo(route.x1, route.y1);
  ctx.lineTo(route.x2, route.y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = Math.min(1, alpha + 0.22);
  fillCircle(route.x2, route.y2, width + 4, color);
  ctx.restore();
}

function drawRouteSignal(route, color, alpha, offset = 0) {
  const dx = route.x2 - route.x1;
  const dy = route.y2 - route.y1;
  const length = Math.hypot(dx, dy);
  if (length <= 1) {
    return;
  }

  const t = (world.animTime * 0.82 + offset) % 1;
  const x = route.x1 + dx * t;
  const y = route.y1 + dy * t;
  ctx.save();
  ctx.globalAlpha = alpha;
  fillCircle(x, y, 5 + Math.sin(world.animTime * 12 + offset) * 1.6, color);
  ctx.globalAlpha = alpha * 0.22;
  fillCircle(x, y, 15, color);
  ctx.restore();
}

function offsetRoute(route, amount) {
  const dx = route.x2 - route.x1;
  const dy = route.y2 - route.y1;
  const length = Math.hypot(dx, dy) || 1;
  const ox = (-dy / length) * amount;
  const oy = (dx / length) * amount;
  return {
    x1: route.x1 + ox,
    y1: route.y1 + oy,
    x2: route.x2 + ox,
    y2: route.y2 + oy,
  };
}

function drawDeliveryPackage(x, y, radius, color = "#f1c15b", angle = 0) {
  const bob = Math.sin(world.animTime * 5 + x * 0.01) * 2.2;
  const scale = 1 + Math.sin(world.animTime * 7 + y * 0.01) * 0.035;
  if (drawWorldRotatedAsset("bossUdpPackage", x, y + bob, radius * 8.2 * scale, radius * 5.4 * scale, angle + Math.sin(world.animTime * 6) * 0.08, 0.95, true)) {
    return;
  }

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(Math.sin(performance.now() / 180 + x) * 0.18);
  drawPixelShadow(0, radius + 5, radius * 2.2, 8);
  rect(-radius, -radius * 0.72, radius * 2, radius * 1.44, "#f6d28a");
  rect(-radius, -radius * 0.72, radius * 2, 5, "#c98416");
  rect(-3, -radius * 0.72, 6, radius * 1.44, color);
  rect(-radius + 4, 2, radius * 0.7, 4, "#9a6615");
  ctx.restore();
}

function drawFtpPackage(hazard) {
  const flash = hazard.hitFlash > 0 ? "#ffffff" : "#f1c15b";
  const bob = Math.sin(world.animTime * 3.8 + hazard.x * 0.01) * 3;
  const pulse = 1 + Math.sin(world.animTime * 5.2 + hazard.y * 0.01) * 0.025;
  const drawY = hazard.y + bob;
  const drawn = drawCenteredAsset("bossFtpPackage", hazard.x, drawY, 142 * pulse, 142 * pulse, true);

  ctx.save();
  ctx.translate(hazard.x, drawY);
  if (!drawn) {
    drawPixelShadow(0, 40, 86, 16);
    rect(-42, -34, 84, 68, flash);
    rect(-42, -34, 84, 12, "#c98416");
    rect(-6, -34, 12, 68, "#72a5ff");
    rect(-28, -2, 56, 8, "#9a6615");
  } else if (hazard.hitFlash > 0) {
    ctx.globalAlpha = 0.3;
    fillCircle(0, -2, 58, "#ffffff");
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = "#0f9f95";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 54, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(hazard.timer / 5.4, 0, 1));
  ctx.stroke();
  ctx.fillStyle = "#26364d";
  ctx.fillRect(-42, -48, 84, 8);
  ctx.fillStyle = "#5de2d1";
  ctx.fillRect(-42, -48, 84 * clamp(hazard.hp / hazard.maxHp, 0, 1), 8);
  ctx.restore();
}

function drawDnsMarker(hazard) {
  const progress = clamp(hazard.timer / 1.9, 0, 1);
  const size = hazard.radius * (3.05 + Math.sin(world.animTime * 8 + hazard.x * 0.01) * 0.12);
  const drawn = drawWorldRotatedAsset("bossDnsMarker", hazard.x, hazard.y, size, size, Math.sin(world.animTime * 2.8) * 0.06, 0.58 + (1 - progress) * 0.32, false);
  ctx.save();
  if (drawn) {
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = progress < 0.35 ? "#ef6a70" : "#f1c15b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius * (0.76 + (1 - progress) * 0.18), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.globalAlpha = 0.18 + (1 - progress) * 0.36;
  ctx.fillStyle = "#72a5ff";
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, hazard.radius * (1.14 - progress * 0.2), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.82;
  ctx.strokeStyle = progress < 0.35 ? "#ef6a70" : "#3e72d8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hazard.x - 10, hazard.y);
  ctx.lineTo(hazard.x + 10, hazard.y);
  ctx.moveTo(hazard.x, hazard.y - 10);
  ctx.lineTo(hazard.x, hazard.y + 10);
  ctx.stroke();
  ctx.restore();
}

function drawTimetableBeat(hazard) {
  const progress = clamp(hazard.timer / (hazard.maxTimer || 1), 0, 1);
  const color = hazard.color ?? "#72a5ff";
  ctx.save();
  ctx.globalAlpha = 0.12 + (1 - progress) * 0.32;
  fillCircle(hazard.x, hazard.y, hazard.radius, color);
  ctx.globalAlpha = 0.72;
  ctx.strokeStyle = progress < 0.24 ? "#ef6a70" : color;
  ctx.lineWidth = progress < 0.24 ? 5 : 3;
  ctx.setLineDash(progress < 0.36 ? [] : [12, 8]);
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, hazard.radius * (0.72 + progress * 0.34), 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.82;
  drawSmallText("2nd", hazard.x - 12, hazard.y + 4, "#f7fbff", 11);
  ctx.restore();
}

function drawIndexLock(hazard) {
  const progress = clamp(hazard.timer / (hazard.maxTimer || 1), 0, 1);
  const color = hazard.hitFlash > 0 ? "#ffffff" : hazard.color ?? "#96e072";
  const size = hazard.radius * 1.72;
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.globalAlpha = 0.12 + (1 - progress) * 0.28;
  rect(-size / 2, -size / 2, size, size, color);
  ctx.globalAlpha = 0.84;
  ctx.strokeStyle = progress < 0.22 ? "#ef6a70" : color;
  ctx.lineWidth = 3;
  ctx.setLineDash(progress < 0.34 ? [] : [9, 7]);
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(-size / 2 - 12, 0);
  ctx.lineTo(size / 2 + 12, 0);
  ctx.moveTo(0, -size / 2 - 12);
  ctx.lineTo(0, size / 2 + 12);
  ctx.stroke();
  drawHazardHealthBar(hazard, 74, -hazard.radius - 18, color);
  ctx.restore();
}

function drawPledgeAnchor(hazard) {
  const progress = clamp(hazard.timer / (hazard.maxTimer || 1), 0, 1);
  const color = hazard.hitFlash > 0 ? "#ffffff" : hazard.color ?? "#96e072";
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.globalAlpha = 0.14 + (1 - progress) * 0.24;
  fillCircle(0, 0, hazard.radius, color);
  ctx.globalAlpha = 0.86;
  strokeCircle(0, 0, hazard.radius, progress < 0.22 ? "#ef6a70" : color, 4);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -hazard.radius * 0.7);
  ctx.lineTo(0, hazard.radius * 0.72);
  ctx.moveTo(-hazard.radius * 0.45, -hazard.radius * 0.18);
  ctx.lineTo(hazard.radius * 0.45, -hazard.radius * 0.18);
  ctx.stroke();
  drawHazardHealthBar(hazard, 82, -hazard.radius - 20, color);
  ctx.restore();
}

function drawRuleScan(hazard) {
  const warning = hazard.timer > 0;
  const progress = warning
    ? clamp(1 - hazard.timer / (hazard.maxTimer || 1), 0, 1)
    : clamp(hazard.activeTime / (hazard.maxActiveTime || 1), 0, 1);
  const color = warning ? "#d8e0e8" : hazard.color ?? "#ef6a70";
  ctx.save();
  ctx.globalAlpha = warning ? 0.08 + progress * 0.18 : 0.24 + progress * 0.22;
  rect(hazard.x, hazard.y, hazard.w, hazard.h, color);
  ctx.globalAlpha = warning ? 0.64 : 0.9;
  ctx.strokeStyle = warning ? "#d8e0e8" : "#ef6a70";
  ctx.lineWidth = warning ? 3 : 5;
  if (warning) {
    ctx.setLineDash([18, 12]);
  }
  ctx.strokeRect(hazard.x, hazard.y, hazard.w, hazard.h);
  ctx.setLineDash([]);
  ctx.restore();
}

function drawRuleAppeal(hazard) {
  const progress = clamp(hazard.timer / (hazard.maxTimer || 1), 0, 1);
  const color = hazard.hitFlash > 0 ? "#ffffff" : hazard.color ?? "#d8e0e8";
  const w = hazard.radius * 2.15;
  const h = hazard.radius * 1.48;
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.globalAlpha = 0.16 + (1 - progress) * 0.2;
  rect(-w / 2, -h / 2, w, h, color);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = progress < 0.22 ? "#ef6a70" : color;
  ctx.lineWidth = 4;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.32, -h * 0.12);
  ctx.lineTo(w * 0.32, -h * 0.12);
  ctx.moveTo(-w * 0.32, h * 0.12);
  ctx.lineTo(w * 0.24, h * 0.12);
  ctx.stroke();
  drawSmallText("APPEAL", -27, 4, "#26364d", 10);
  drawHazardHealthBar(hazard, 86, -hazard.radius - 18, color);
  ctx.restore();
}

function drawHazardHealthBar(hazard, width, yOffset, color) {
  const hpRatio = clamp((hazard.hp ?? 0) / (hazard.maxHp || 1), 0, 1);
  ctx.fillStyle = "#26364d";
  ctx.fillRect(-width / 2, yOffset, width, 7);
  ctx.fillStyle = color;
  ctx.fillRect(-width / 2, yOffset, width * hpRatio, 7);
}

function drawEnemyMechanicUnderlay(enemy) {
  if (enemy.mechanicState === "telegraph") {
    const targetX = enemy.telegraphX ?? player.x;
    const targetY = enemy.telegraphY ?? player.y;
    ctx.save();
    ctx.globalAlpha = 0.76;
    ctx.strokeStyle = "#ef6a70";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    fillCircle(targetX, targetY, 8 + Math.sin(world.animTime * 18) * 2, "#ef6a70");
    ctx.restore();
  }

  if (enemy.scanPulse > 0) {
    ctx.save();
    ctx.globalAlpha = enemy.scanPulse * 0.38;
    ctx.strokeStyle = "#72a5ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius + 52 * (1 - enemy.scanPulse), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawEnemyMechanicOverlay(enemy) {
  if (enemy.openingSurge) {
    const pulse = 0.5 + Math.sin(world.animTime * 8 + (enemy.openingSurgeIndex ?? 0)) * 0.5;
    const ring = enemy.radius + 10 + pulse * 5;
    const armTime = Math.max(0, Number(enemy.openingSurgeArmTime) || 0);
    const surge = runStats?.openingSprint?.surge;
    const firstStrikeIndex = Number.isFinite(surge?.firstStrikeEnemyIndex)
      ? Math.trunc(surge.firstStrikeEnemyIndex)
      : -1;
    const isFirstStrikeTarget = Boolean(surge?.firstStrikeClaimed)
      && firstStrikeIndex === Math.trunc(Number(enemy.openingSurgeIndex) || 0);
    ctx.save();
    ctx.globalAlpha = 0.78;
    ctx.strokeStyle = "#f1c15b";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, ring, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.2 + pulse * 0.12;
    fillCircle(enemy.x, enemy.y, enemy.radius + 18, "#f1c15b");
    if (armTime > 0) {
      const armProgress = clamp(1 - armTime / Math.max(0.1, openingSurgeConfig.spawnGrace), 0, 1);
      ctx.globalAlpha = 0.76;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * armProgress);
      ctx.stroke();
      ctx.globalAlpha = 0.22;
      fillCircle(enemy.x, enemy.y, enemy.radius + 26, "#f1c15b");
    }
    if (isFirstStrikeTarget) {
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 31 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.18;
      fillCircle(enemy.x, enemy.y, enemy.radius + 32, "#ffffff");
    }
    ctx.globalAlpha = 0.92;
    const tag = isFirstStrikeTarget
      ? "先手截击"
      : armTime > 0 && !surge?.firstStrikeClaimed
        ? "命中先手"
        : armTime > 0
          ? "接怪窗口"
          : `裂隙 ${Math.trunc(enemy.openingSurgeIndex ?? 0) + 1}`;
    drawMarkerTag(tag, enemy.x, enemy.y - enemy.radius - 28, isFirstStrikeTarget ? "#ffffff" : "#f1c15b");
    ctx.restore();
  }

  if (enemy.shieldActive || enemy.shieldFlash > 0) {
    ctx.save();
    const flash = enemy.shieldFlash ?? 0;
    ctx.globalAlpha = enemy.shieldActive ? 0.78 : flash * 0.6;
    ctx.strokeStyle = flash > 0 ? "#ffffff" : "#96e072";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius + 7 + Math.sin(world.animTime * 5 + enemy.animPhase) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha *= 0.22;
    fillCircle(enemy.x, enemy.y, enemy.radius + 12, "#96e072");
    ctx.restore();
  }

  if (enemy.phaseAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.5, enemy.phaseAlpha * 0.46);
    strokeCircle(enemy.x, enemy.y, enemy.radius + 14, "#8edcff", 2);
    strokeCircle(enemy.x, enemy.y, enemy.radius + 22, "#8edcff", 1);
    ctx.restore();
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    drawEnemyMechanicUnderlay(enemy);
    drawEnemy(enemy);
    drawEnemyMechanicOverlay(enemy);
  }
  for (const cleaner of cleaners) {
    drawEnemyMechanicUnderlay(cleaner);
    drawEnemy(cleaner);
    drawEnemyMechanicOverlay(cleaner);
    ctx.strokeStyle = "#72a5ff";
    ctx.lineWidth = 3;
    const ringPulse = Math.sin(world.animTime * 5 + cleaner.animPhase) * 4;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(cleaner.x, cleaner.y, cleaner.radius + 7 + ringPulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawBoss() {
  if (!boss || boss.hp <= 0) {
    return;
  }

  if (boss.phase === 3) {
    const auraAlpha = 0.34 + Math.sin(performance.now() / 180) * 0.08;
    drawCenteredAsset("bossOrderAura", boss.x, boss.y + 6, 216, 216, false, auraAlpha);
  }

  const assetKey = getBossPhaseAssetKey(boss.phase);
  const spriteSize = boss.phase === 3 ? 188 : boss.phase === 2 ? 170 : 152;
  const bossPulse = Math.sin(world.animTime * (boss.state === "dash" ? 12 : 3.2) + boss.animPhase);
  const bossBob = boss.state === "handshake" ? bossPulse * 5 : bossPulse * 2.5;
  const bossScale = 1 + Math.sin(world.animTime * 2.6 + boss.animPhase) * 0.025 + (boss.state === "handshake" ? 0.035 : 0);
  const bossTilt = Math.sin(world.animTime * (boss.phase + 1.8) + boss.animPhase) * (boss.phase === 3 ? 0.045 : 0.025);

  if (boss.state === "dash" && boss.dash) {
    const dx = boss.dash.x2 - boss.dash.x1;
    const dy = boss.dash.y2 - boss.dash.y1;
    const len = Math.hypot(dx, dy) || 1;
    for (let index = 3; index >= 1; index -= 1) {
      drawSpriteAsset(assetKey, boss.x - (dx / len) * index * 18, boss.y - (dy / len) * index * 18, spriteSize, spriteSize, {
        alpha: 0.09 * index,
        bob: bossBob,
        rotate: bossTilt,
        scale: bossScale - index * 0.025,
        shadow: false,
      });
    }
  }

  const drawn = drawSpriteAsset(assetKey, boss.x, boss.y, spriteSize, spriteSize, {
    bob: bossBob,
    glowAlpha: boss.phase === 3 ? 0.12 : boss.state === "handshake" ? 0.08 : 0,
    glowColor: boss.phase === 3 ? "#ef6a70" : boss.themeColor ?? "#5de2d1",
    rotate: bossTilt,
    scale: bossScale,
  });
  if (!drawn) {
    drawDeliveryRiderBoss(boss.x, boss.y, 1, boss.hitFlash > 0);
    drawBossArchetypeAura(spriteSize);
    return;
  }

  drawBossArchetypeAura(spriteSize);

  if (boss.hitFlash > 0) {
    ctx.save();
    ctx.globalAlpha = 0.32;
    fillCircle(boss.x, boss.y - spriteSize * 0.24, spriteSize * 0.36, "#ffffff");
    ctx.restore();
  }
}

function drawBossArchetypeAura(spriteSize) {
  const archetype = boss?.archetype ?? "delivery";
  if (archetype === "delivery") {
    return;
  }

  const pulse = 0.5 + Math.sin(world.animTime * 4.6 + boss.animPhase) * 0.18;
  const radius = spriteSize * 0.38;
  ctx.save();
  ctx.translate(boss.x, boss.y - spriteSize * 0.1);
  ctx.globalAlpha = 0.38 + pulse * 0.18;
  ctx.strokeStyle = boss.themeColor ?? "#5de2d1";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius + pulse * 8, 0, Math.PI * 2);
  ctx.stroke();

  if (archetype === "timetable") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(world.animTime * 2.4) * radius * 0.78, Math.sin(world.animTime * 2.4) * radius * 0.78);
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(world.animTime * 0.82) * radius * 0.55, Math.sin(world.animTime * 0.82) * radius * 0.55);
    ctx.stroke();
  } else if (archetype === "index") {
    const grid = radius * 0.58;
    for (let line = -1; line <= 1; line += 1) {
      ctx.beginPath();
      ctx.moveTo(-grid, line * grid * 0.5);
      ctx.lineTo(grid, line * grid * 0.5);
      ctx.moveTo(line * grid * 0.5, -grid);
      ctx.lineTo(line * grid * 0.5, grid);
      ctx.stroke();
    }
  } else if (archetype === "pledge") {
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.72);
    ctx.lineTo(0, radius * 0.72);
    ctx.moveTo(-radius * 0.42, -radius * 0.16);
    ctx.lineTo(radius * 0.42, -radius * 0.16);
    ctx.stroke();
  } else if (archetype === "rule") {
    ctx.strokeRect(-radius * 0.62, -radius * 0.42, radius * 1.24, radius * 0.84);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.45, -radius * 0.12);
    ctx.lineTo(radius * 0.45, -radius * 0.12);
    ctx.moveTo(-radius * 0.45, radius * 0.14);
    ctx.lineTo(radius * 0.28, radius * 0.14);
    ctx.stroke();
  }
  ctx.restore();
}

function getBossPhaseAssetKey(phase) {
  if (phase === 3) {
    return "bossDeliveryPhase3";
  }
  if (phase === 2) {
    return "bossDeliveryPhase2";
  }
  return "bossDeliveryPhase1";
}

function getObjectiveTargets() {
  if (bugNodes.length > 0) {
    return bugNodes.map((node) => ({
      x: node.x,
      y: node.y,
      color: node.event?.color ?? "#5de2d1",
      label: node.openingFocus ? "首个异常" : node.event?.title ?? "目标",
    }));
  }

  if (boss && boss.hp > 0) {
    return [{ x: boss.x, y: boss.y, color: boss.themeColor ?? "#ef6a70", label: boss.name ?? "Boss" }];
  }

  const bossSpawn = currentMap().bossSpawn;
  if ((chapterState?.stepIndex ?? -1) >= 4 && bossSpawn) {
    return [{ ...bossSpawn, color: "#f1c15b", label: "Boss 区" }];
  }

  return [];
}

function drawObjectiveCompass(camera) {
  const targets = getObjectiveTargets();
  if (!targets.length) {
    return;
  }

  const target = targets.reduce((nearest, candidate) => {
    return distance(player, candidate) < distance(player, nearest) ? candidate : nearest;
  }, targets[0]);
  const screenX = target.x - camera.x;
  const screenY = target.y - camera.y;
  const margin = 56;
  const visible = screenX > margin && screenX < world.viewWidth - margin && screenY > 86 && screenY < world.viewHeight - margin;
  const pulse = 1 + Math.sin(world.animTime * 5.2) * 0.12;

  ctx.save();
  if (visible) {
    ctx.globalAlpha = 0.78;
    ctx.strokeStyle = target.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 44 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.92;
    drawSmallText(target.label === "首个异常" ? "首个异常" : "目标", screenX - 28, screenY - 52, "#26364d", 13);
    ctx.restore();
    return;
  }

  const centerX = world.viewWidth / 2;
  const centerY = world.viewHeight / 2;
  const angle = Math.atan2(screenY - centerY, screenX - centerX);
  const x = clamp(screenX, margin, world.viewWidth - margin);
  const y = clamp(screenY, 92, world.viewHeight - margin);
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = target.color;
  ctx.beginPath();
  ctx.moveTo(24 * pulse, 0);
  ctx.lineTo(-14, -13);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-14, 13);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.22;
  fillCircle(0, 0, 34, target.color);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.9;
  drawSmallText(target.label, clamp(x - 42, 14, world.viewWidth - 150), clamp(y + 32, 110, world.viewHeight - 24), "#26364d", 12);
  ctx.restore();
}

function drawDeviceGuideCompass(camera) {
  const target = getNearestPendingMapInteractive();
  if (!target || !player || world.mode !== "playing") {
    return;
  }

  const screenX = target.x - camera.x;
  const screenY = target.y - camera.y;
  const margin = 58;
  const visible = screenX > margin && screenX < world.viewWidth - margin && screenY > 92 && screenY < world.viewHeight - margin;
  const color = target.color ?? "#5de2d1";
  const pulse = 1 + Math.sin(world.animTime * 5.8) * 0.12;

  ctx.save();
  if (visible) {
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(screenX, screenY, 58 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.92;
    drawSmallText("装置", screenX - 16, screenY - 66, "#26364d", 13);
    ctx.restore();
    return;
  }

  const centerX = world.viewWidth / 2;
  const centerY = world.viewHeight / 2;
  const angle = Math.atan2(screenY - centerY, screenX - centerX);
  const x = clamp(screenX, margin, world.viewWidth - margin);
  const y = clamp(screenY, 104, world.viewHeight - margin);
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(20 * pulse, 0);
  ctx.lineTo(-12, -11);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-12, 11);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.18;
  fillCircle(0, 0, 30, color);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.88;
  drawSmallText(`装置 · ${shortenText(target.label ?? "启动", 7)}`, clamp(x - 52, 14, world.viewWidth - 168), clamp(y + 28, 116, world.viewHeight - 24), "#26364d", 12);
  ctx.restore();
}

function drawExplorationMiniMap(camera) {
  if (world.width <= world.viewWidth && world.height <= world.viewHeight) {
    return;
  }

  const mapWidth = 184;
  const mapHeight = Math.max(92, Math.round(mapWidth * (world.height / world.width)));
  const x = world.viewWidth - mapWidth - 18;
  const y = world.viewHeight - mapHeight - 18;
  const scaleX = mapWidth / world.width;
  const scaleY = mapHeight / world.height;

  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.fillStyle = "rgba(247, 250, 255, 0.88)";
  ctx.fillRect(x, y, mapWidth, mapHeight);
  ctx.strokeStyle = "rgba(26, 42, 68, 0.22)";
  ctx.strokeRect(x, y, mapWidth, mapHeight);

  for (const zone of getMapZones()) {
    ctx.globalAlpha = zone.type === "hazard" ? 0.34 : 0.22;
    ctx.fillStyle = zone.color ?? "#5de2d1";
    ctx.fillRect(x + zone.x * scaleX, y + zone.y * scaleY, zone.w * scaleX, zone.h * scaleY);
  }

  ctx.globalAlpha = 0.58;
  ctx.strokeStyle = "#26364d";
  ctx.strokeRect(x + camera.x * scaleX, y + camera.y * scaleY, camera.w * scaleX, camera.h * scaleY);

  for (const target of getObjectiveTargets()) {
    ctx.globalAlpha = 0.92;
    fillCircle(x + target.x * scaleX, y + target.y * scaleY, 3.5, target.color ?? "#5de2d1");
  }

  for (const device of getPendingMapInteractives()) {
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = device.color ?? "#5de2d1";
    const markerX = x + device.x * scaleX;
    const markerY = y + device.y * scaleY;
    ctx.fillRect(markerX - 3.5, markerY - 3.5, 7, 7);
    ctx.globalAlpha = 0.34;
    strokeCircle(markerX, markerY, 8, device.color ?? "#5de2d1", 1.5);
  }

  ctx.globalAlpha = 1;
  fillCircle(x + player.x * scaleX, y + player.y * scaleY, 4, "#17202a");
  drawSmallText("地图", x + 8, y + 16, "#26364d", 11);
  ctx.restore();
}

function drawOpeningShowcaseOverlay(camera) {
  const showcase = runStats?.openingShowcase;
  if (!showcase?.active || world.mode !== "playing") {
    return;
  }

  const anchorX = Number.isFinite(showcase.x) ? showcase.x : player.x;
  const anchorY = Number.isFinite(showcase.y) ? showcase.y : player.y;
  const radius = Math.max(90, Number(showcase.radius) || 168);
  const screenX = anchorX - camera.x;
  const screenY = anchorY - camera.y;
  const frameX = clamp(screenX - radius * 0.72, 18, Math.max(18, world.viewWidth - radius * 1.44 - 18));
  const frameY = clamp(screenY - radius * 0.48, 110, Math.max(110, world.viewHeight - radius * 0.96 - 24));
  const frameW = Math.min(radius * 1.44, world.viewWidth - 36);
  const frameH = Math.min(radius * 0.96, world.viewHeight - 128);
  const flash = clamp(Number(showcase.flash) || 0, 0, 2.2);
  const hasChecklist = ["retry", "combat"].includes(showcase.phase);
  const checklist = createOpeningShowcaseChecklist(showcase.checklist);
  const checklistReadyCount = openingShowcaseChecklistItems.filter((item) => checklist[item.key]).length;
  const previewDelay = runStats?.openingSprint?.surge?.delayRemaining ?? openingSurgeConfig.spawnDelay;
  const progress = showcase.phase === "preview"
    ? clamp(1 - previewDelay / Math.max(0.1, openingSurgeConfig.spawnDelay), 0.08, 0.94)
    : showcase.phase === "retry"
      ? 0.34
      : showcase.phase === "combat"
        ? checklistReadyCount / openingShowcaseChecklistItems.length
      : clamp((showcase.defeats ?? 0) / Math.max(1, showcase.targetDefeats ?? openingSurgeConfig.targetDefeats), 0, 1);
  const accent = showcase.completed ? "#5de2d1" : showcase.phase === "retry" ? "#72a5ff" : showcase.phase === "combat" ? "#f1c15b" : "#f1c15b";
  const label = showcase.phase === "preview" ? "NEXT RIFT" : showcase.phase === "retry" ? "RETRY ROUTE" : showcase.phase === "combat" ? "COMBAT SHOT" : "FIRST WAVE";

  ctx.save();
  ctx.globalAlpha = 0.54 + flash * 0.08;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.setLineDash(showcase.completed ? [] : [12, 8]);
  ctx.strokeRect(frameX, frameY, frameW, frameH);
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.12 + flash * 0.05;
  ctx.fillStyle = accent;
  ctx.fillRect(frameX, frameY, frameW, frameH);
  if (showcase.phase === "preview") {
    const playerScreenX = player.x - camera.x;
    const playerScreenY = player.y - camera.y;
    const routeAngle = Math.atan2(screenY - playerScreenY, screenX - playerScreenX);
    const landingPoints = getOpeningSurgeLandingPreviewPoints({ x: anchorX, y: anchorY });
    ctx.globalAlpha = 0.66 + flash * 0.06;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 9]);
    ctx.beginPath();
    ctx.moveTo(playerScreenX, playerScreenY - 8);
    ctx.lineTo(screenX, screenY);
    ctx.stroke();
    ctx.setLineDash([]);
    [0.38, 0.58, 0.78].forEach((t) => {
      const arrowX = playerScreenX + (screenX - playerScreenX) * t;
      const arrowY = playerScreenY + (screenY - playerScreenY) * t - 4;
      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(routeAngle);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-7, -8);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-7, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    landingPoints.forEach((point) => {
      const landingX = point.x - camera.x;
      const landingY = point.y - camera.y;
      const landingPulse = 1 + Math.sin(world.animTime * 7 + point.index) * 0.12;
      ctx.globalAlpha = 0.74;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(landingX, landingY, (20 + point.index * 1.8) * landingPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.18;
      fillCircle(landingX, landingY, 18 * landingPulse, accent);
      ctx.globalAlpha = 0.96;
      drawSmallText(`落点${point.index + 1}`, landingX - 20, landingY - 26, "#26364d", 11);
    });
    ctx.globalAlpha = 0.94;
    drawSmallText(
      `下一波裂隙 ${formatHookTime(previewDelay)}`,
      clamp(screenX - 58, 18, world.viewWidth - 168),
      clamp(screenY - radius * 0.54, 112, world.viewHeight - 28),
      "#26364d",
      13,
    );
  }

  const cardW = Math.min(420, world.viewWidth - 36);
  const cardH = hasChecklist ? 136 : 92;
  const cardX = 18;
  const cardY = 92;
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "rgba(247, 250, 255, 0.92)";
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = "rgba(26, 42, 68, 0.16)";
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.fillStyle = accent;
  ctx.fillRect(cardX, cardY, Math.max(4, cardW * progress), 4);
  ctx.fillStyle = "#26364d";
  ctx.font = "800 12px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText(label, cardX + 12, cardY + 22);
  ctx.fillStyle = "#17202a";
  ctx.font = "800 16px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText(shortenText(showcase.title, 18), cardX + 12, cardY + 45);
  ctx.fillStyle = "#526174";
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText(shortenText(showcase.callout, 22), cardX + 12, cardY + 65);
  ctx.fillText(shortenText(showcase.focus, 28), cardX + 12, cardY + 82);
  if (hasChecklist) {
    ctx.fillStyle = "#26364d";
    ctx.font = "800 11px Microsoft YaHei, Segoe UI, sans-serif";
    ctx.fillText(shortenText(`奖励：${showcase.rewardText}`, 34), cardX + 12, cardY + 101);
    ctx.font = "800 10px Microsoft YaHei, Segoe UI, sans-serif";
    openingShowcaseChecklistItems.forEach((item, index) => {
      const ok = Boolean(checklist[item.key]);
      const x = cardX + 12 + (index % 2) * 188;
      const y = cardY + 121 + Math.floor(index / 2) * 13;
      ctx.fillStyle = ok ? "#0f9f95" : "#8d9aab";
      ctx.fillText(`${ok ? "✓" : "○"} ${item.label}`, x, y);
    });
  }
  ctx.restore();
}

function drawChapterShowcaseOverlay(camera) {
  const showcase = runStats?.chapterShowcase;
  if (!showcase?.active || world.mode !== "playing" || currentChapterIndex <= 0) {
    return;
  }

  const checklist = createChapterShowcaseChecklist(showcase.checklist);
  const items = [
    { key: "device", label: showcase.deviceLabel ?? "地图装置" },
    { key: "mechanic", label: showcase.mechanicLabel ?? "敌人机制" },
    { key: "boss", label: showcase.bossLabel ?? "Boss 窗口" },
    { key: "effect", label: checklist.effectLabel || "武器特效" },
  ];
  const readyCount = items.filter((item) => checklist[item.key]).length;
  const progress = readyCount / items.length;
  const visual = getChapterVisual();
  const accent = checklist.ready || showcase.completed ? "#5de2d1" : visual.accent ?? "#72a5ff";
  const anchorX = Number.isFinite(showcase.x) ? showcase.x : player.x;
  const anchorY = Number.isFinite(showcase.y) ? showcase.y : player.y;
  const radius = Math.max(110, Number(showcase.radius) || 220);
  const screenX = anchorX - camera.x;
  const screenY = anchorY - camera.y;
  const frameW = Math.min(radius * 1.36, world.viewWidth - 36);
  const frameH = Math.min(radius * 0.82, world.viewHeight - 126);
  const frameX = clamp(screenX - frameW / 2, 18, Math.max(18, world.viewWidth - frameW - 18));
  const frameY = clamp(screenY - frameH / 2, 118, Math.max(118, world.viewHeight - frameH - 24));
  const flash = clamp(Number(showcase.flash) || 0, 0, 2.2);
  const cardW = Math.min(390, world.viewWidth - 36);
  const cardH = 138;
  const cardX = Math.max(18, world.viewWidth - cardW - 18);
  const cardY = boss && boss.hp > 0 ? 150 : 92;

  ctx.save();
  ctx.globalAlpha = 0.46 + flash * 0.08;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.setLineDash(showcase.completed ? [] : [10, 7]);
  ctx.strokeRect(frameX, frameY, frameW, frameH);
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.1 + flash * 0.05;
  ctx.fillStyle = accent;
  ctx.fillRect(frameX, frameY, frameW, frameH);
  ctx.globalAlpha = 0.74;
  fillCircle(screenX, screenY, 10 + flash * 4, accent);
  strokeCircle(screenX, screenY, Math.min(radius, 132), accent, 1.4);

  ctx.globalAlpha = 0.93;
  ctx.fillStyle = "rgba(247, 250, 255, 0.94)";
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = "rgba(26, 42, 68, 0.16)";
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.fillStyle = accent;
  ctx.fillRect(cardX, cardY, Math.max(4, cardW * progress), 4);

  ctx.fillStyle = "#26364d";
  ctx.font = "800 12px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText("CHAPTER SHOT", cardX + 12, cardY + 22);
  ctx.fillStyle = "#17202a";
  ctx.font = "800 16px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText(shortenText(showcase.title, 18), cardX + 12, cardY + 45);
  ctx.fillStyle = "#526174";
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText(shortenText(showcase.callout ?? showcase.hook, 30), cardX + 12, cardY + 65);
  ctx.fillText(shortenText(showcase.hook, 38), cardX + 12, cardY + 83);

  ctx.font = "800 10px Microsoft YaHei, Segoe UI, sans-serif";
  items.forEach((item, index) => {
    const ok = Boolean(checklist[item.key]);
    const x = cardX + 12 + (index % 2) * Math.max(162, Math.floor(cardW / 2) - 8);
    const y = cardY + 108 + Math.floor(index / 2) * 17;
    ctx.fillStyle = ok ? "#0f9f95" : "#8d9aab";
    ctx.fillText(`${ok ? "✓" : "○"} ${shortenText(item.label, 13)}`, x, y);
  });

  if (checklist.ready) {
    ctx.fillStyle = "#0f9f95";
    ctx.font = "800 11px Microsoft YaHei, Segoe UI, sans-serif";
    ctx.fillText("镜头已就绪", cardX + cardW - 82, cardY + 22);
  }
  ctx.restore();
}

function drawBossHud() {
  if (!boss || boss.hp <= 0) {
    return;
  }

  const width = 420;
  const x = world.viewWidth / 2 - width / 2;
  const y = 82;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.fillRect(x - 14, y - 30, width + 28, 58);
  ctx.strokeStyle = "rgba(26, 42, 68, 0.16)";
  ctx.strokeRect(x - 14, y - 30, width + 28, 58);
  ctx.fillStyle = "#17202a";
  ctx.font = "15px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText(`${boss.name}  阶段 ${boss.phase}`, x, y - 9);
  ctx.fillStyle = "#26364d";
  ctx.fillRect(x, y + 4, width, 12);
  ctx.fillStyle = boss.phase === 3 ? "#ef6a70" : boss.phase === 2 ? "#f1c15b" : boss.themeColor ?? "#5de2d1";
  ctx.fillRect(x, y + 4, width * clamp(boss.hp / boss.maxHp, 0, 1), 12);
  ctx.restore();
}

function drawAllies() {
  const bob = Math.sin(performance.now() / 240) * 3;

  if (chapterState.allies.includes("qiao-you")) {
    const x = clamp(player.x - 42, 24, world.width - 24);
    const y = clamp(player.y + 28 + bob, 88, world.height - 24);

    if (!drawSpriteAsset("qiaoYou", x, y, 76, 76)) {
      drawQiaoYouSprite(x, y, 0.74);
    }

    drawLabel("乔柚", x - 14, y - 33, "#ffd7ea");
  }

  if (chapterState.allies.includes("whitebox")) {
    const x = clamp(player.x + 54, 24, world.width - 24);
    const y = clamp(player.y + 24 - bob, 88, world.height - 24);
    ctx.save();
    ctx.globalAlpha = 0.52;
    strokeCircle(x, y - 20, 42 + Math.sin(world.animTime * 3.2) * 4, "#72a5ff", 2);
    ctx.restore();
    if (!drawSpriteAsset("inspector", x, y, 68, 68)) {
      drawPatrolSprite(x, y, 0.66, false);
    }
    drawLabel("白箱", x - 14, y - 34, "#72a5ff");
  }
}

function drawPropAsset(key, x, y, width, height) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  ctx.drawImage(asset.image, x, y, width, height);
  return true;
}

function drawCenteredAsset(key, x, y, width, height, shadow = true, alpha = 1) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  ctx.save();
  ctx.globalAlpha *= alpha;
  if (shadow) {
    drawPixelShadow(x, y + height * 0.28, width * 0.48, 8);
  }
  ctx.drawImage(asset.image, x - width / 2, y - height / 2, width, height);
  ctx.restore();
  return true;
}

function drawWorldRotatedAsset(key, x, y, width, height, angle = 0, alpha = 1, shadow = false) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  ctx.save();
  if (shadow) {
    drawPixelShadow(x, y + height * 0.24, width * 0.42, 8);
  }
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha *= alpha;
  ctx.drawImage(asset.image, -width / 2, -height / 2, width, height);
  ctx.restore();
  return true;
}

function drawRouteEffectAsset(key, route, height, alpha = 1) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  const dx = route.x2 - route.x1;
  const dy = route.y2 - route.y1;
  const length = Math.hypot(dx, dy);
  if (length <= 1) {
    return false;
  }

  ctx.save();
  ctx.translate((route.x1 + route.x2) / 2, (route.y1 + route.y2) / 2);
  ctx.rotate(Math.atan2(dy, dx));
  ctx.globalAlpha *= alpha;
  ctx.drawImage(asset.image, -length / 2, -height / 2, length, height);
  ctx.restore();
  return true;
}

function drawRotatedAsset(key, x, y, width, height, angle = 0, alpha = 1, scale = 1) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha *= alpha;
  ctx.drawImage(asset.image, (-width * scale) / 2, (-height * scale) / 2, width * scale, height * scale);
  ctx.restore();
  return true;
}

function drawSpriteAsset(key, x, y, width, height, options = {}) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  const {
    alpha = 1,
    bob = 0,
    glowAlpha = 0,
    glowColor = "#5de2d1",
    rotate = 0,
    scale = 1,
    shadow = true,
  } = options;
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const drawX = x;
  const drawY = y + bob;

  ctx.save();
  if (shadow) {
    drawPixelShadow(drawX, drawY + drawHeight * 0.32, drawWidth * 0.54, 10);
  }
  ctx.translate(drawX, drawY);
  if (glowAlpha > 0) {
    const previousAlpha = ctx.globalAlpha;
    ctx.globalAlpha = previousAlpha * glowAlpha;
    fillCircle(0, -drawHeight * 0.24, drawWidth * 0.4, glowColor);
    ctx.globalAlpha = previousAlpha;
  }
  ctx.rotate(rotate);
  ctx.globalAlpha *= alpha;
  ctx.drawImage(asset.image, -drawWidth / 2, -drawHeight * 0.68, drawWidth, drawHeight);
  ctx.restore();
  return true;
}

function drawEnemy(enemy) {
  if (drawEnemyAsset(enemy)) {
    return;
  }

  if (enemy.render === "deadline") {
    drawDeadlineBug(enemy.x, enemy.y, 0.76, enemy.hitFlash > 0);
    return;
  }

  if (enemy.render === "patrol") {
    drawPatrolSprite(enemy.x, enemy.y, 0.82, enemy.hitFlash > 0);
    return;
  }

  drawEmoFluff(enemy.x, enemy.y, 0.78, enemy.hitFlash > 0);
}

function drawEnemyAsset(enemy) {
  if (!enemy.assetKey) {
    return false;
  }

  const size = enemy.spriteSize ?? Math.max(46, enemy.radius * 3.8);
  const phase = enemy.animPhase ?? 0;
  const hurt = enemy.hitFlash > 0 ? Math.sin(world.animTime * 46) * 0.035 : 0;
  const bob = Math.sin(world.animTime * 3.4 + phase) * (enemy.type === "queueSnake" ? 1.3 : 2.4);
  const scale = 1 + Math.sin(world.animTime * 4 + phase) * 0.035 + Math.abs(hurt);
  const rotate = Math.sin(world.animTime * 2.2 + phase) * (enemy.type === "inspectionProbe" ? 0.08 : 0.04);
  const phaseAlpha = enemy.phaseAlpha > 0 ? 0.48 + Math.sin(world.animTime * 18 + phase) * 0.08 : 1;
  const surgeGlow = enemy.openingSurge ? 0.18 + Math.sin(world.animTime * 8 + phase) * 0.05 : 0;
  const drawn = drawSpriteAsset(enemy.assetKey, enemy.x, enemy.y, size, size, {
    alpha: phaseAlpha,
    bob,
    glowAlpha: enemy.phaseAlpha > 0 ? 0.14 : Math.max(surgeGlow, enemy.slowTimer > 0 ? 0.07 : 0),
    glowColor: enemy.openingSurge ? "#f1c15b" : enemy.phaseAlpha > 0 ? "#8edcff" : "#72a5ff",
    rotate,
    scale,
  });
  if (!drawn) {
    return false;
  }

  if (enemy.hitFlash > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - size * 0.24, size * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  return true;
}

function drawPlayer() {
  ctx.save();
  if (player.invulnerable > 0) {
    ctx.globalAlpha = 0.62 + Math.sin(performance.now() / 45) * 0.25;
  }
  const isMoving = keys.has("arrowleft") || keys.has("a") || keys.has("arrowright") || keys.has("d") || keys.has("arrowup") || keys.has("w") || keys.has("arrowdown") || keys.has("s");
  const stepBob = isMoving ? Math.sin(world.animTime * 14) * 2.2 : Math.sin(world.animTime * 2.4) * 0.8;
  const stepTilt = isMoving ? Math.sin(world.animTime * 10) * 0.035 : 0;
  if (!drawSpriteAsset("andu", player.x, player.y, 78, 78, { bob: stepBob, rotate: stepTilt, scale: 1 + Math.abs(stepBob) * 0.003 })) {
    drawAnduSprite(player.x, player.y, 0.82);
  }
  ctx.restore();

  if (world.pulseCooldown > 0.38) {
    const progress = 1 - world.pulseCooldown / 0.55;
    ctx.save();
    ctx.globalAlpha = 0.58;
    drawCenteredAsset("repairPulse", player.x, player.y, player.pulseRadius * 2.15 * progress, player.pulseRadius * 2.15 * progress, false);
    ctx.restore();
    ctx.strokeStyle = "rgba(114, 165, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.pulseRadius * progress, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawAnduSprite(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPixelShadow(0, 25, 40, 10);

  rect(-15, 8, 10, 17, "#17202d");
  rect(5, 8, 10, 17, "#17202d");
  rect(-17, 23, 14, 5, "#101115");
  rect(3, 23, 14, 5, "#101115");
  rect(-19, -10, 38, 24, "#f6f1e7");
  rect(-22, -7, 8, 14, "#f6f1e7");
  rect(14, -7, 8, 14, "#f6f1e7");
  rect(-4, -10, 8, 21, "#183a65");
  rect(-2, 9, 4, 7, "#72a5ff");
  rect(-7, 2, 14, 10, "rgba(114, 165, 255, 0.22)");
  rect(-30, -4, 10, 17, "#162133");
  rect(-28, -2, 6, 10, "#78dff1");
  rect(21, -2, 10, 10, "#5de2d1");
  rect(23, 0, 6, 6, "#101115");

  rect(-15, -29, 30, 21, "#ffd2a4");
  rect(-18, -23, 5, 9, "#f2a46f");
  rect(13, -23, 5, 9, "#f2a46f");
  rect(-10, -19, 5, 5, "#11131a");
  rect(5, -19, 5, 5, "#11131a");
  rect(-2, -13, 6, 2, "#d9745d");

  rect(-17, -38, 34, 10, "#191817");
  rect(-21, -33, 12, 11, "#191817");
  rect(9, -34, 14, 12, "#191817");
  rect(-11, -44, 9, 12, "#22211f");
  rect(-3, -42, 11, 13, "#1a1918");
  rect(8, -41, 8, 12, "#2a2724");
  rect(-24, -26, 9, 9, "#201e1b");
  rect(16, -27, 8, 9, "#201e1b");
  rect(-19, -33, 4, 4, "#3a3029");
  ctx.restore();
}

function drawQiaoYouSprite(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPixelShadow(0, 25, 42, 10);

  drawBubble(-36, -24, 6, "#dcb9ff");
  drawBubble(34, -13, 4, "#ffb8d8");
  drawEmoFluff(-33, 16, 0.42, false);

  rect(-14, 10, 8, 15, "#f1c6de");
  rect(6, 10, 8, 15, "#f1c6de");
  rect(-16, 23, 12, 5, "#5c3b2f");
  rect(4, 23, 12, 5, "#5c3b2f");
  rect(-17, -8, 34, 17, "#ffe7c7");
  rect(-20, 2, 40, 12, "#cc72b2");
  rect(-13, 11, 26, 8, "#f4d2e8");
  rect(20, 0, 8, 18, "#f6f1e7");
  rect(22, 3, 5, 10, "#8f62bd");

  fillCircle(-19, -19, 13, "#8b4e21");
  fillCircle(19, -19, 13, "#8b4e21");
  rect(-31, -21, 8, 7, "#d88bdd");
  rect(23, -21, 8, 7, "#d88bdd");
  rect(-15, -31, 30, 22, "#f5b780");
  rect(-18, -32, 36, 12, "#9a5a25");
  rect(-22, -27, 9, 13, "#8b4e21");
  rect(13, -27, 9, 13, "#8b4e21");
  rect(-9, -21, 5, 6, "#11131a");
  rect(5, -21, 5, 6, "#11131a");
  rect(-3, -14, 7, 3, "#e4745c");
  rect(-3, -37, 6, 7, "#b276e2");
  ctx.restore();
}

function drawLaoLiangSprite(x, y, scale = 1) {
  if (drawSpriteAsset("laoLiang", x, y, 78 * scale, 78 * scale)) {
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPixelShadow(0, 25, 42, 10);

  rect(-13, 8, 10, 16, "#18191d");
  rect(4, 8, 10, 16, "#18191d");
  rect(-16, -9, 32, 22, "#1b1b1f");
  rect(-21, -7, 9, 16, "#1b1b1f");
  rect(13, -7, 9, 16, "#1b1b1f");
  rect(-5, -8, 10, 18, "#f1c15b");
  rect(-2, -7, 4, 16, "#7f3b12");
  drawPieCoin(-26, 3, 15);
  rect(22, 1, 9, 17, "#c97913");
  rect(24, 4, 5, 3, "#f7d06e");
  rect(24, 10, 5, 3, "#f7d06e");

  rect(-14, -30, 28, 20, "#f4c08d");
  rect(-17, -24, 5, 10, "#e29b6d");
  rect(12, -24, 5, 10, "#e29b6d");
  rect(-16, -33, 8, 12, "#151413");
  rect(8, -33, 8, 12, "#151413");
  rect(-7, -36, 14, 6, "#f5d1a5");
  strokeCircle(-7, -21, 7, "#2b1d0f", 3);
  strokeCircle(7, -21, 7, "#2b1d0f", 3);
  rect(-1, -22, 2, 2, "#2b1d0f");
  rect(-9, -13, 18, 5, "#2b1d0f");
  rect(-4, -16, 8, 3, "#3a2414");
  ctx.restore();
}

function drawDeliveryRiderBoss(x, y, scale = 1, hitFlash = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPixelShadow(0, 34, 70, 16);

  const suit = hitFlash ? "#ffffff" : "#f1c15b";
  const box = hitFlash ? "#ffffff" : "#c98416";
  rect(-22, 2, 44, 30, suit);
  rect(-28, -2, 11, 24, "#26364d");
  rect(17, -2, 11, 24, "#26364d");
  rect(-17, 28, 12, 18, "#26364d");
  rect(5, 28, 12, 18, "#26364d");
  rect(-22, 43, 16, 6, "#101115");
  rect(6, 43, 16, 6, "#101115");

  rect(26, -2, 28, 38, box);
  rect(30, 4, 20, 5, "#f6d28a");
  rect(32, 15, 16, 4, "#5de2d1");
  ctx.strokeStyle = "#5de2d1";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(35, 2);
  ctx.quadraticCurveTo(64, -16, 48, -36);
  ctx.moveTo(42, 6);
  ctx.quadraticCurveTo(70, 18, 62, 44);
  ctx.stroke();

  rect(-19, -29, 38, 24, "#f4bd8b");
  rect(-22, -38, 44, 17, "#f1c15b");
  rect(-16, -45, 32, 12, "#c98416");
  rect(-23, -25, 5, 10, "#e29b6d");
  rect(18, -25, 5, 10, "#e29b6d");
  rect(-10, -21, 6, 6, "#101115");
  rect(5, -21, 6, 6, "#101115");
  rect(-8, -11, 16, 4, "#7f3b12");

  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = boss?.phase === 3 ? "#ef6a70" : "#72a5ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -8, 48 + Math.sin(performance.now() / 160) * 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawPatrolSprite(x, y, scale = 1, hitFlash = false) {
  if (!hitFlash && drawSpriteAsset("inspector", x, y, 82 * scale, 82 * scale)) {
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPixelShadow(0, 28, 46, 12);

  const shell = hitFlash ? "#ffffff" : "#d8e0e8";
  rect(-17, -25, 34, 27, shell);
  rect(-12, -35, 24, 14, shell);
  rect(-8, -40, 5, 8, "#72a5ff");
  rect(3, -40, 5, 8, "#72a5ff");
  rect(-10, -31, 20, 7, "#101115");
  rect(-7, -29, 14, 3, "#5de2d1");
  rect(-12, -16, 24, 11, "#101115");
  drawSmallText(hitFlash ? "HIT" : "ERROR", -10, -8, hitFlash ? "#ef6a70" : "#5de2d1", 8);
  rect(-10, 1, 20, 20, "#c9d2dc");
  rect(-5, 7, 10, 8, "#f1c15b");
  rect(-27, -10, 10, 20, shell);
  rect(17, -10, 10, 20, shell);
  rect(-29, 9, 14, 7, "#93a7b8");
  rect(15, 9, 14, 7, "#93a7b8");

  ctx.strokeStyle = "#1c2634";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(18, 8);
  ctx.quadraticCurveTo(42, 15, 38, 31);
  ctx.stroke();
  rect(32, 25, 20, 9, "#a9b5c3");
  rect(47, 22, 8, 15, "#283242");
  ctx.restore();
}

function drawEmoFluff(x, y, scale = 1, hitFlash = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPixelShadow(0, 18, 33, 8);

  const body = hitFlash ? "#ffffff" : "#272838";
  fillCircle(-10, -1, 13, body);
  fillCircle(8, -2, 15, body);
  fillCircle(0, 9, 16, body);
  rect(-17, -16, 7, 8, "#1d1e2a");
  rect(9, -18, 8, 9, "#1d1e2a");
  rect(-8, -3, 5, 7, "#f6f1e7");
  rect(6, -3, 5, 7, "#f6f1e7");
  rect(-6, 9, 16, 4, "#171820");
  rect(-18, 6, 4, 10, "#4f3a6b");
  rect(16, 4, 4, 11, "#4f3a6b");
  ctx.restore();
}

function drawDeadlineBug(x, y, scale = 1, hitFlash = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPixelShadow(0, 20, 34, 8);

  const body = hitFlash ? "#ffffff" : "#ef6a70";
  rect(-17, -13, 34, 27, body);
  rect(-12, -20, 24, 9, "#f1c15b");
  rect(-21, -4, 7, 7, "#f1c15b");
  rect(14, -4, 7, 7, "#f1c15b");
  rect(-9, -7, 5, 6, "#171820");
  rect(5, -7, 5, 6, "#171820");
  rect(-7, 6, 14, 4, "#581f28");
  rect(-2, -26, 4, 10, "#72a5ff");
  strokeCircle(0, -28, 7, "#72a5ff", 2);
  ctx.restore();
}

function drawPixelShadow(x, y, width, height) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
}

function drawPieCoin(x, y, radius) {
  fillCircle(x, y, radius, "#c97913");
  fillCircle(x, y, radius - 4, "#f1c15b");
  rect(x - 5, y - 9, 10, 18, "#7f3b12");
  rect(x - 8, y - 2, 16, 4, "#7f3b12");
}

function drawBubble(x, y, radius, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSmallText(text, x, y, color, size) {
  ctx.fillStyle = color;
  ctx.font = `${size}px Microsoft YaHei, Segoe UI, sans-serif`;
  ctx.fillText(text, x, y);
}

function rect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function fillCircle(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function strokeCircle(x, y, radius, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawParticles() {
  for (const particle of particles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);
    if (particle.type === "text") {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `800 ${particle.size}px Microsoft YaHei, Segoe UI, sans-serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(38, 54, 77, 0.42)";
      ctx.strokeText(particle.text, particle.x, particle.y);
      ctx.fillStyle = particle.color;
      ctx.fillText(particle.text, particle.x, particle.y);
      ctx.restore();
      continue;
    }
    const size = particle.size * (0.45 + alpha * 0.85);
    ctx.save();
    ctx.globalAlpha = particle.shape === "mist" ? alpha * 0.68 : alpha;
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation ?? 0) + (1 - alpha) * Math.PI * 0.35);
    ctx.fillStyle = particle.color;
    if (particle.shape === "slash") {
      ctx.fillRect(-(particle.length ?? 14) / 2, -Math.max(1, size * 0.28), particle.length ?? 14, Math.max(1, size * 0.56));
    } else if (particle.shape === "keycap") {
      const width = Math.max(7, particle.length ?? size * 1.8);
      ctx.fillRect(-width / 2, -size / 2, width, size);
      ctx.globalAlpha = Math.min(1, alpha + 0.18);
      ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
      ctx.fillRect(-width / 2 + 2, -size / 2 + 1, Math.max(2, width - 4), Math.max(1, size * 0.24));
    } else if (particle.shape === "mist") {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (particle.shape === "ring") {
      const radius = particle.size * (1.15 - alpha * 0.12);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = Math.max(1.5, 3 * alpha);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillRect(-size / 2, -size / 2, size, size);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawLabel(text, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = "12px Microsoft YaHei, Segoe UI, sans-serif";
  ctx.fillText(text, x, y);
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = random(0, Math.PI * 2);
    const speed = random(40, 190);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: random(2, 5),
      color,
      life: random(0.25, 0.65),
      maxLife: 0.65,
    });
  }
}

function resolveDeskCollision(entity) {
  for (const desk of getMapObstacles()) {
    const rect = getObjectCollisionRect(desk);
    const nearestX = clamp(entity.x, rect.x, rect.x + rect.w);
    const nearestY = clamp(entity.y, rect.y, rect.y + rect.h);
    const dx = entity.x - nearestX;
    const dy = entity.y - nearestY;
    const overlap = entity.radius - Math.hypot(dx, dy);
    if (overlap > 0) {
      const angle = Math.atan2(dy || 1, dx || 1);
      entity.x += Math.cos(angle) * overlap;
      entity.y += Math.sin(angle) * overlap;
    }
  }
}

function spawnFloatingText(x, y, text, color = "#f1c15b", options = {}) {
  particles.push({
    type: "text",
    text,
    x,
    y,
    vx: options.vx ?? random(-10, 10),
    vy: options.vy ?? -48,
    size: options.size ?? 15,
    color,
    life: options.life ?? 0.62,
    maxLife: options.life ?? 0.62,
  });
}

function isPointBlockedByMap(x, y, radius = 18) {
  return getMapObstacles().some((object) => circleOverlapsRect(x, y, radius, getObjectCollisionRect(object)));
}

function getObjectCollisionRect(object) {
  if (object.collision) {
    return {
      x: object.x + (object.collision.x ?? 0),
      y: object.y + (object.collision.y ?? 0),
      w: object.collision.w ?? object.w,
      h: object.collision.h ?? object.h,
    };
  }

  if (currentChapterIndex === 0 && object.kind === "desk") {
    return {
      x: object.x - 4,
      y: object.y,
      w: object.w + 8,
      h: object.h + 86,
    };
  }

  return object;
}

function circleOverlapsRect(x, y, radius, rect) {
  const nearestX = clamp(x, rect.x, rect.x + rect.w);
  const nearestY = clamp(y, rect.y, rect.y + rect.h);
  return Math.hypot(x - nearestX, y - nearestY) < radius;
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function findNearestFreePoint(x, y, radius = 22) {
  const base = {
    x: clamp(x, radius + 10, world.width - radius - 10),
    y: clamp(y, 82 + radius, world.height - radius - 10),
  };
  if (!isPointBlockedByMap(base.x, base.y, radius)) {
    return base;
  }

  for (let ring = 1; ring <= 7; ring += 1) {
    const step = 34 * ring;
    const samples = 8 + ring * 4;
    for (let index = 0; index < samples; index += 1) {
      const angle = (Math.PI * 2 * index) / samples;
      const candidate = {
        x: clamp(base.x + Math.cos(angle) * step, radius + 10, world.width - radius - 10),
        y: clamp(base.y + Math.sin(angle) * step, 82 + radius, world.height - radius - 10),
      };
      if (!isPointBlockedByMap(candidate.x, candidate.y, radius)) {
        return candidate;
      }
    }
  }

  return base;
}

function centerCameraOnPlayer() {
  if (!player) {
    return;
  }
  world.cameraX = clamp(player.x - world.viewWidth / 2, 0, Math.max(0, world.width - world.viewWidth));
  world.cameraY = clamp(player.y - world.viewHeight / 2, 0, Math.max(0, world.height - world.viewHeight));
}

function updateCamera() {
  centerCameraOnPlayer();
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distancePointToSegment(point, segment) {
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = clamp(((point.x - segment.x1) * dx + (point.y - segment.y1) * dy) / lengthSquared, 0, 1);
  const x = segment.x1 + dx * t;
  const y = segment.y1 + dy * t;
  return Math.hypot(point.x - x, point.y - y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function installAutomationTestHooks() {
  function round(value) {
    return Number(Number(value ?? 0).toFixed(2));
  }

  function snapshot(extra = {}) {
    const map = currentMap() ?? {};
    const discovery = getMapDiscoverySummary(map);
    const echoArchive = getEchoArchiveSummary();
    const mapCacheArchive = getMapCacheArchiveSummary();
    const mapInteractiveArchive = getMapInteractiveArchiveSummary();
    return {
      ...extra,
      build: getBuildSummary(),
      chapterCount: chapters.length,
      currentChapterIndex,
      chapterTitle: currentChapter().title,
      map: {
        id: map.id ?? null,
        name: map.name ?? null,
        width: world.width,
        height: world.height,
        viewWidth: world.viewWidth,
        viewHeight: world.viewHeight,
        configuredWidth: map.width ?? null,
        configuredHeight: map.height ?? null,
        largerThanView: world.width > world.viewWidth || world.height > world.viewHeight,
        obstacleCount: (map.obstacles ?? desks).length,
        zoneCount: (map.zones ?? []).length,
        taskMarkerCount: discovery.taskMarkers.length,
        hazardSignalCount: discovery.hazardSignals,
        landmarkMarkerCount: discovery.landmarkMarkers,
        echoCount: discovery.echoCount,
        uncollectedEchoCount: discovery.uncollectedEchoCount,
        cacheCount: discovery.cacheCount,
        uncollectedCacheCount: discovery.uncollectedCacheCount,
        interactiveCount: discovery.interactiveCount,
        unactivatedInteractiveCount: discovery.unactivatedInteractiveCount,
      },
      mode: world.mode,
      objective: getCurrentObjectiveText(),
      player: {
        x: round(player?.x),
        y: round(player?.y),
        hp: round(player?.hp),
        maxHp: round(player?.maxHp),
        weapon: player?.weapon?.name ?? null,
      },
      camera: {
        x: round(world.cameraX),
        y: round(world.cameraY),
      },
      chapterState: {
        chapterIndex: chapterState?.chapterIndex ?? null,
        stepIndex: chapterState?.stepIndex ?? null,
        resolvedTotal: chapterState?.resolvedTotal ?? null,
        echoesCollected: cloneForSave(chapterState?.echoesCollected, []),
        mapCachesCollected: cloneForSave(chapterState?.mapCachesCollected, []),
        mapInteractivesActivated: cloneForSave(chapterState?.mapInteractivesActivated, []),
        bossCleared: Boolean(chapterState?.bossCleared),
        finished: Boolean(chapterState?.finished),
      },
      archive: {
        bestChapter: archiveState?.bestChapter ?? null,
        calibrationShards: archiveState?.calibrationShards ?? null,
        completedNightHooks: cloneForSave(archiveState?.completedNightHooks, []),
        nightHookCompletions: archiveState?.nightHookCompletions ?? 0,
        metaLevels: cloneForSave(archiveState?.metaUpgrades, {}),
        discoveredEchoes: echoArchive.discovered,
        totalEchoes: echoArchive.total,
        completedEchoChapters: echoArchive.completedChapters,
        discoveredMapCaches: mapCacheArchive.discovered,
        totalMapCaches: mapCacheArchive.total,
        completedMapCacheChapters: mapCacheArchive.completedChapters,
        activatedMapInteractives: mapInteractiveArchive.activated,
        totalMapInteractives: mapInteractiveArchive.total,
        completedMapInteractiveChapters: mapInteractiveArchive.completedChapters,
        bestOpeningRush: formatOpeningRushArchiveBest(archiveState),
      },
      nightHook: runStats?.activeHook ? {
        id: runStats.activeHook.id,
        completed: Boolean(runStats.activeHook.completed),
        failed: Boolean(runStats.activeHook.failed),
        progress: getNightHookProgressText(runStats.activeHook, getNightHookConfigById(runStats.activeHook.id)),
      } : null,
      combatTempo: runStats?.tempo ? {
        streak: runStats.tempo.streak,
        bestStreak: runStats.tempo.bestStreak,
        timer: round(runStats.tempo.timer),
        rewardsClaimed: runStats.tempo.rewardsClaimed,
      } : null,
      deviceGuide: runStats?.deviceGuide ? {
        chapterIndex: runStats.deviceGuide.chapterIndex,
        targetId: runStats.deviceGuide.targetId,
        targetLabel: runStats.deviceGuide.targetLabel,
        lastDistance: round(runStats.deviceGuide.lastDistance),
        bestDistance: round(runStats.deviceGuide.bestDistance),
        completed: Boolean(runStats.deviceGuide.completed),
        flash: round(runStats.deviceGuide.flash),
      } : null,
      openingSprint: runStats?.openingSprint ? {
        completed: Boolean(runStats.openingSprint.completed),
        stepIndex: runStats.openingSprint.stepIndex,
        completedStepIds: cloneForSave(runStats.openingSprint.completedStepIds, []),
        surge: cloneForSave(runStats.openingSprint.surge, null),
      } : null,
      openingRush: runStats?.openingRush ? getOpeningRushSnapshot(runStats.openingRush) : null,
      counts: {
        bugNodes: bugNodes?.length ?? 0,
        enemies: enemies?.length ?? 0,
        cleaners: cleaners?.length ?? 0,
        protocolHazards: protocolHazards?.length ?? 0,
        enemyHazards: enemyHazards?.length ?? 0,
      },
      boss: boss ? {
        id: boss.id,
        name: boss.name,
        archetype: boss.archetype,
        hp: round(boss.hp),
        maxHp: round(boss.maxHp),
        phase: boss.phase,
        x: round(boss.x),
        y: round(boss.y),
      } : null,
    };
  }

  function runMetaProgressionProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    archiveState = {
      ...createArchiveFallback(),
      bestChapter: 3,
      calibrationShards: 20,
      metaUpgrades: normalizeMetaUpgrades({
        "steady-heart": 2,
        "warm-cache": 1,
        "route-shoes": 1,
        "chapter-insurance": 1,
        "paperclip-specialist": 3,
        "keyboard-specialist": 2,
        "correction-specialist": 2,
      }),
    };
    const firstChapter = getMetaProgressionBonuses(0);
    const practiceChapter = getMetaProgressionBonuses(2);
    const paperclip = cloneForSave(weaponDefinitions.find((weapon) => weapon.id === "paperclip"), {});
    const keyboard = cloneForSave(weaponDefinitions.find((weapon) => weapon.id === "keyboard"), {});
    const correction = cloneForSave(weaponDefinitions.find((weapon) => weapon.id === "correction-fluid"), {});
    applyWeaponSpecializationToWeapon(paperclip);
    applyWeaponSpecializationToWeapon(keyboard);
    applyWeaponSpecializationToWeapon(correction);
    archiveState = previousArchive ?? loadArchive();
    return {
      ok: firstChapter.maxHp === 16
        && firstChapter.bugPoints === 1
        && firstChapter.dashPower === 12
        && practiceChapter.maxHp === 24
        && practiceChapter.bugPoints === 2
        && practiceChapter.dashPower === 12
        && paperclip.damage === 37
        && paperclip.trait.every === 3
        && keyboard.trait.force === 28
        && keyboard.cooldown < 0.46
        && correction.range === 354
        && correction.trait.factor < 0.55,
      firstChapter,
      practiceChapter,
      weaponSpecializations: {
        paperclip: { damage: paperclip.damage, chargedEvery: paperclip.trait.every },
        keyboard: { cooldown: round(keyboard.cooldown), force: keyboard.trait.force },
        correction: { range: correction.range, slowFactor: round(correction.trait.factor) },
      },
    };
  }

  function runNightHookProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    const previousMode = world.mode;
    archiveState = {
      ...createArchiveFallback(),
      calibrationShards: 0,
      completedNightHooks: [],
      nightHookCompletions: 0,
    };
    resetStoreRun(0, { stepIndex: 0 });
    archiveState = {
      ...createArchiveFallback(),
      calibrationShards: 0,
      completedNightHooks: [],
      nightHookCompletions: 0,
    };
    runStats.activeHook = createNightHookState(0);
    const hook = runStats.activeHook;
    const config = getNightHookConfigById(hook?.id);
    runStats.enemiesDefeated += config?.criteria?.defeats ?? 0;
    runStats.eventsResolved += config?.criteria?.events ?? 0;
    runStats.distanceTraveled += config?.criteria?.distance ?? 0;
    updateNightHook(0.1);
    const result = {
      ok: Boolean(runStats.activeHook?.completed)
        && archiveState.calibrationShards === (config?.rewardShards ?? 0)
        && archiveState.completedNightHooks.includes(config?.id)
        && (archiveState.nightHookCompletions ?? 0) >= 1,
      hook: cloneForSave(runStats.activeHook, null),
      archive: {
        calibrationShards: archiveState.calibrationShards,
        completedNightHooks: cloneForSave(archiveState.completedNightHooks, []),
        nightHookCompletions: archiveState.nightHookCompletions,
      },
    };
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    world.mode = previousMode;
    return result;
  }

  function runCombatTempoProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 80 });
    runStats.tempo = createCombatTempoState();
    const startBugPoints = player.bugPoints;
    const startHp = player.hp;
    const fakeEnemy = { x: player.x + 72, y: player.y, radius: 16 };
    for (let index = 0; index < combatTempoConfig.rewardEvery; index += 1) {
      registerCombatTempoHit(fakeEnemy);
    }
    const tempo = runStats.tempo;
    const result = {
      ok: Boolean(tempo)
        && tempo.streak === combatTempoConfig.rewardEvery
        && tempo.bestStreak === combatTempoConfig.rewardEvery
        && tempo.rewardsClaimed >= 1
        && player.bugPoints === startBugPoints + combatTempoConfig.bugPointReward
        && player.hp === Math.min(player.maxHp, startHp + combatTempoConfig.healReward),
      tempo: cloneForSave(tempo, null),
      player: {
        bugPoints: player.bugPoints,
        hp: round(player.hp),
      },
    };
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runEchoArchiveProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, xp: 0 });
    player.xp = 0;
    player.xpToNext = 99;
    archiveState = {
      ...createArchiveFallback(),
      calibrationShards: 0,
      discoveredEchoes: [],
      completedEchoChapters: [],
      lastEchoDiscovery: null,
    };

    const echoes = getMapEchoes();
    const samples = [];
    for (const echo of echoes) {
      samples.push(movePlayerTo(echo.x, echo.y, `echo-archive-${echo.id}`));
      checkDiscoveryEchoCollision();
      world.mode = "playing";
    }

    const summary = getEchoArchiveSummary();
    const expectedReward = getEchoChapterReward(0);
    const result = {
      ok: echoes.length > 0
        && summary.discovered === echoes.length
        && summary.completedChapters === 1
        && archiveState.completedEchoChapters.includes(currentMap().id)
        && archiveState.calibrationShards === expectedReward,
      expectedReward,
      archive: {
        calibrationShards: archiveState.calibrationShards,
        discoveredEchoes: cloneForSave(archiveState.discoveredEchoes, []),
        completedEchoChapters: cloneForSave(archiveState.completedEchoChapters, []),
        lastEchoDiscovery: cloneForSave(archiveState.lastEchoDiscovery, null),
      },
      summary,
      samples,
    };
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runOpeningSprintProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, xp: 0, hp: 80 });
    player.xp = 0;
    player.xpToNext = 99;
    runStats.openingSprint = createOpeningSprintState();
    const startBugPoints = player.bugPoints;
    const startHp = player.hp;
    const expectedBugPoints = openingSprintSteps.reduce((sum, step) => sum + (step.rewardBugPoints ?? 0), 0);

    runStats.eventsResolved += 1;
    updateOpeningSprint(0.1);
    runStats.enemiesDefeated += openingSprintSteps[1]?.target ?? 6;
    updateOpeningSprint(0.1);
    runStats.starterIgnition = { completed: true };
    updateOpeningSprint(0.1);

    const savedAfterSprint = loadRunSave();
    const result = {
      ok: Boolean(runStats.openingSprint?.completed)
        && runStats.openingSprint.completedStepIds.length === openingSprintSteps.length
        && player.bugPoints === startBugPoints + expectedBugPoints
        && player.hp >= startHp
        && savedAfterSprint?.reason === "opening-sprint-complete",
      sprint: cloneForSave(runStats.openingSprint, null),
      expectedBugPoints,
      reward: {
        bugPoints: player.bugPoints - startBugPoints,
        hp: round(player.hp - startHp),
        savedReason: savedAfterSprint?.reason ?? null,
      },
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runOpeningSurgeProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 74, xp: 0, weaponIndex: 1 });
    runStats.openingSprint = createOpeningSprintState();
    runStats.openingSprint.surge.delayRemaining = 0;
    runStats.tempo = createCombatTempoState();
    const build = getStarterBuildById("queue-barrage");
    if (build) {
      runStats.starterBuild = build.id;
      runStats.starterIgnition = createStarterIgnitionState(build);
    }
    player.xp = 0;
    player.xpToNext = 99;
    world.mode = "playing";

    const startBugPoints = player.bugPoints;
    const startHp = player.hp;
    const startXp = player.xp;
    runStats.eventsResolved += openingSprintSteps[0]?.target ?? 1;
    updateOpeningSprint(0.1);
    runStats.openingSprint.surge.delayRemaining = 0;
    updateOpeningSurge(0.8);
    syncHud();
    const spawnedShowcase = cloneForSave(runStats.openingShowcase, null);
    const spawnedTrackerText = ui.openingTracker?.textContent ?? "";
    const spawned = enemies.filter((enemy) => enemy.openingSurge);
    const spawnGraceReady = spawned.length >= openingSurgeConfig.targetDefeats
      && spawned.every((enemy) => (enemy.openingSurgeArmTime ?? 0) > 0);
    const beforeFirstStrikeBugPoints = player.bugPoints;
    const beforeFirstStrikeHp = player.hp;
    const firstStrikeTarget = spawned[0] ?? null;
    const firstStrikeClaimed = firstStrikeTarget
      ? claimOpeningSurgeFirstStrike(firstStrikeTarget, "probe")
      : false;
    syncHud();
    const firstStrikeTrackerText = ui.openingTracker?.textContent ?? "";
    const firstStrikeSnapshot = cloneForSave(runStats.openingSprint?.surge, null);
    const firstStrikeBugGain = player.bugPoints - beforeFirstStrikeBugPoints;
    const firstStrikeHpGain = player.hp - beforeFirstStrikeHp;
    for (const enemy of spawned.slice(0, openingSurgeConfig.targetDefeats)) {
      enemy.hp = 0;
    }
    clearDefeatedHostiles();
    updateOpeningSurge(0.1);
    syncHud();
    const surge = runStats.openingSprint?.surge;
    const clearedShowcase = cloneForSave(runStats.openingShowcase, null);
    const clearedTrackerText = ui.openingTracker?.textContent ?? "";
    const savedAfterSurge = loadRunSave();
    const tempoRewardClaimed = (runStats.tempo?.rewardsClaimed ?? 0) >= 1;
    const ignitionCompleted = Boolean(runStats.starterIgnition?.completed);
    const result = {
      ok: spawned.length >= openingSurgeConfig.targetDefeats
        && spawnedShowcase?.phase === "spawned"
        && spawnedShowcase?.focus?.includes("同屏")
        && spawnedTrackerText.includes("第一波卖点")
        && spawnedTrackerText.includes("接怪窗口")
        && spawnedTrackerText.includes("命中触发先手截击")
        && spawnGraceReady
        && firstStrikeClaimed
        && Boolean(firstStrikeSnapshot?.firstStrikeClaimed)
        && firstStrikeTrackerText.includes("先手截击")
        && firstStrikeBugGain >= openingSurgeConfig.firstStrikeBugPoints
        && firstStrikeHpGain >= openingSurgeConfig.firstStrikeHp
        && clearedShowcase?.phase === "cleared"
        && Boolean(clearedShowcase?.completed)
        && clearedTrackerText.includes("第一波卖点")
        && Boolean(surge?.completed)
        && (surge?.defeats ?? 0) >= openingSurgeConfig.targetDefeats
        && Boolean(surge?.tempoKickClaimed)
        && Boolean(surge?.ignitionCreditClaimed)
        && tempoRewardClaimed
        && ignitionCompleted
        && player.bugPoints >= startBugPoints + openingSurgeConfig.firstStrikeBugPoints + openingSurgeConfig.rewardBugPoints + combatTempoConfig.bugPointReward
        && player.hp >= Math.min(player.maxHp, startHp + openingSurgeConfig.firstStrikeHp + openingSurgeConfig.rewardHp)
        && player.xp >= startXp + openingSurgeConfig.rewardXp
        && savedAfterSurge?.reason === "opening-surge-complete",
      spawnedCount: spawned.length,
      spawnGraceReady,
      surge: cloneForSave(surge, null),
      openingShowcase: {
        spawned: spawnedShowcase,
        firstStrike: firstStrikeSnapshot,
        cleared: clearedShowcase,
        spawnedTrackerText,
        firstStrikeTrackerText,
        clearedTrackerText,
      },
      tempo: cloneForSave(runStats.tempo, null),
      ignition: cloneForSave(runStats.starterIgnition, null),
      reward: {
        bugPoints: player.bugPoints - startBugPoints,
        hp: round(player.hp - startHp),
        xp: player.xp - startXp,
        firstStrikeBugPoints: firstStrikeBugGain,
        firstStrikeHp: round(firstStrikeHpGain),
        savedReason: savedAfterSurge?.reason ?? null,
      },
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runOpeningGuidanceProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    startNewRun(0);
    const weaponChoiceText = ui.storyChoices?.textContent ?? "";
    const hookCoverage = weaponDefinitions
      .filter((weapon) => getWeaponOpeningHook(weapon))
      .every((weapon) => {
        const hook = getWeaponOpeningHook(weapon);
        return weaponChoiceText.includes(hook.title)
          && weaponChoiceText.includes(hook.tag);
      });
    const weaponChoiceIgnitionSamples = weaponDefinitions.map((weapon, index) => {
      resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 80, weaponIndex: index });
      runStats.starterBuild = null;
      runStats.starterIgnition = null;
      equipWeapon(weapon);
      const build = applyStarterBuildForWeaponChoice(weapon);
      return {
        weaponId: weapon.id,
        buildId: build?.id ?? null,
        starterBuild: runStats.starterBuild,
        hasIgnition: Boolean(runStats.starterIgnition),
        targetDefeats: runStats.starterIgnition?.targetDefeats ?? 0,
      };
    });
    const weaponChoiceIgnitionOk = weaponChoiceIgnitionSamples.length > 0
      && weaponChoiceIgnitionSamples.every((sample) => (
        sample.buildId
        && sample.starterBuild === sample.buildId
        && sample.hasIgnition
        && sample.targetDefeats >= openingSurgeConfig.targetDefeats
      ));

    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 80, weaponIndex: 0 });
    runStats.eventsResolved = 0;
    spawnChapterNodes(currentChapter().steps?.[0]);
    const focusNode = bugNodes.find((node) => node.openingFocus);
    const firstTarget = getObjectiveTargets()[0];
    const focusIndex = bugNodes.indexOf(focusNode);
    if (focusNode && focusIndex >= 0) {
      activeEvent = {
        ...focusNode.event,
        index: focusIndex,
        openingFocus: Boolean(focusNode.openingFocus),
        chapterStep: focusNode.chapterStep,
      };
      openEvent(activeEvent);
    }
    const eventChoiceText = ui.eventChoices?.textContent ?? "";
    const result = {
      ok: hookCoverage
        && weaponChoiceIgnitionOk
        && Boolean(focusNode)
        && firstTarget?.label === "首个异常"
        && ui.log?.textContent.includes("首个异常已标记")
        && ui.eventKicker?.textContent.includes("首个异常")
        && eventChoiceText.includes("开场链推进")
        && eventChoiceText.includes("第一波裂隙"),
      hookCoverage,
      weaponChoiceIgnitionOk,
      weaponChoiceIgnitionSamples,
      weaponChoiceText,
      eventChoiceText,
      focusNode: focusNode ? {
        eventId: focusNode.event?.id ?? null,
        chapterStep: focusNode.chapterStep,
        openingFocus: Boolean(focusNode.openingFocus),
      } : null,
      firstTarget,
      logText: ui.log?.textContent ?? "",
    };
    deleteRunSave();
    ui.storyPanel.classList.add("hidden");
    ui.eventPanel.classList.add("hidden");
    activeEvent = null;
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runOpeningRouteReadabilityProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 80, xp: 0, weaponIndex: 0 });
    runStats.eventsResolved = 0;
    runStats.openingRush = createOpeningRushState();
    runStats.openingSprint = createOpeningSprintState();
    player.xp = 0;
    player.xpToNext = 99;
    world.mode = "playing";

    runStats.eventsResolved += 1;
    updateOpeningSprint(0.1);
    updateOpeningSurge(0.12);
    syncHud();
    const previewShowcase = cloneForSave(runStats.openingShowcase, null);
    const previewTrackerText = ui.openingTracker?.textContent ?? "";
    const previewDelay = runStats.openingSprint?.surge?.delayRemaining ?? null;
    const previewLandingPoints = previewShowcase
      ? getOpeningSurgeLandingPreviewPoints({ x: previewShowcase.x, y: previewShowcase.y })
      : [];

    updateOpeningSurge(openingSurgeConfig.spawnDelay + 0.08);
    syncHud();
    const spawnedShowcase = cloneForSave(runStats.openingShowcase, null);
    const spawnedTrackerText = ui.openingTracker?.textContent ?? "";
    const spawned = enemies.filter((enemy) => enemy.openingSurge);
    const spawnGraceReady = spawned.length >= openingSurgeConfig.targetDefeats
      && spawned.every((enemy) => (enemy.openingSurgeArmTime ?? 0) > 0);

    const result = {
      ok: previewShowcase?.phase === "preview"
        && Number.isFinite(previewShowcase.x)
        && Number.isFinite(previewShowcase.y)
        && previewShowcase.callout.includes("黄框")
        && previewShowcase.callout.includes("落点")
        && previewShowcase.focus.includes("第一波")
        && previewTrackerText.includes("裂隙预告")
        && previewTrackerText.includes("黄框")
        && previewTrackerText.includes("4个落点")
        && previewTrackerText.includes("后刷新")
        && previewTrackerText.includes("追S")
        && previewTrackerText.includes("裂隙清场")
        && previewDelay !== null
        && previewDelay >= 0.8
        && previewLandingPoints.length === openingSurgeConfig.targetDefeats
        && previewLandingPoints.every((point) => point.x > 0 && point.x < world.width && point.y > 0 && point.y < world.height)
        && spawnedShowcase?.phase === "spawned"
        && spawnedTrackerText.includes("第一波卖点")
        && spawnedTrackerText.includes("接怪窗口")
        && spawnedTrackerText.includes("命中触发先手截击")
        && spawnGraceReady
        && spawned.length >= openingSurgeConfig.targetDefeats,
      previewShowcase,
      spawnedShowcase,
      previewTrackerText,
      spawnedTrackerText,
      previewDelay,
      previewLandingPoints,
      spawnGraceReady,
      spawnedCount: spawned.length,
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runOpeningRushRatingProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 80, xp: 0, weaponIndex: 0 });
    archiveState = {
      ...createArchiveFallback(),
      calibrationShards: 0,
      bestOpeningRushScore: 0,
      bestOpeningRushGrade: "D",
      lastOpeningRush: null,
    };
    runStats.openingRush = createOpeningRushState();
    runStats.openingSprint = createOpeningSprintState();
    world.mode = "playing";

    completeOpeningRushMilestone("anomaly");
    syncHud();
    const coachAfterAnomaly = ui.openingTracker?.textContent ?? "";
    updateOpeningRush(7.5);
    completeOpeningRushMilestone("surge");
    updateOpeningRush(8.4);
    completeOpeningRushMilestone("overclock");
    updateOpeningRush(4.6);
    completeOpeningRushMilestone("retry-route");
    syncHud();
    const trackerText = ui.openingTracker?.textContent ?? "";
    const rushBeforeArchive = getOpeningRushSnapshot(runStats.openingRush);
    const archived = recordOpeningRushInArchive(runStats.openingRush);
    saveArchive();
    world.mode = "menu";
    renderStartMenu();
    const startStatsText = ui.startStats?.textContent ?? "";

    const result = {
      ok: rushBeforeArchive.score === 100
        && rushBeforeArchive.grade === "S"
        && rushBeforeArchive.completedIds.length === openingRushConfig.milestones.length
        && coachAfterAnomaly.includes("追S")
        && coachAfterAnomaly.includes("裂隙清场")
        && trackerText.includes("开场评级")
        && trackerText.includes("100/100")
        && archived.score === 100
        && archived.grade === "S"
        && Math.max(archived.score, Math.trunc(Number(archiveState.bestOpeningRushScore) || 0)) >= 90
        && startStatsText.includes("最佳开场")
        && startStatsText.includes("S "),
      rush: rushBeforeArchive,
      archived,
      coachAfterAnomaly,
      trackerText,
      startStatsText,
      archive: {
        bestOpeningRushScore: archiveState.bestOpeningRushScore,
        bestOpeningRushGrade: archiveState.bestOpeningRushGrade,
        lastOpeningRush: cloneForSave(archiveState.lastOpeningRush, null),
      },
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runOpeningRushTimingProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    const cadenceProfiles = [
      { id: "60fps", dt: 1 / 60, anomalyAt: 2.8, clearAt: 9.6 },
      { id: "30fps", dt: 1 / 30, anomalyAt: 3.2, clearAt: 11.4 },
      { id: "low-fps", dt: 1 / 12, anomalyAt: 4.4, clearAt: 14.8 },
    ];
    const samples = [];

    const tickOpeningRoute = (dt) => {
      updateStarterIgnition(dt);
      updateOpeningSprint(dt);
      updateOpeningSurge(dt);
      updateOpeningRush(dt);
      updateOpeningShowcase(dt);
    };

    const advanceTo = (targetTime, dt) => {
      let guard = 0;
      while ((runStats.openingRush?.elapsed ?? 0) + 0.0001 < targetTime && guard < 900) {
        tickOpeningRoute(Math.min(dt, targetTime - (runStats.openingRush?.elapsed ?? 0)));
        guard += 1;
      }
    };

    for (const [weaponIndex, weapon] of weaponDefinitions.slice(0, 3).entries()) {
      for (const profile of cadenceProfiles) {
        resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 80, xp: 0, weaponIndex });
        archiveState = {
          ...createArchiveFallback(),
          calibrationShards: 0,
        };
        runStats.eventsResolved = 0;
        runStats.enemiesDefeated = 0;
        runStats.openingRush = createOpeningRushState();
        runStats.openingSprint = createOpeningSprintState();
        runStats.tempo = createCombatTempoState();
        runStats.starterBuild = null;
        runStats.starterIgnition = null;
        equipWeapon(weapon);
        const build = applyStarterBuildForWeaponChoice(weapon);
        player.xp = 0;
        player.xpToNext = 99;
        world.mode = "playing";

        advanceTo(profile.anomalyAt, profile.dt);
        runStats.eventsResolved += openingSprintSteps[0]?.target ?? 1;
        tickOpeningRoute(profile.dt);
        syncHud();
        const coachAfterAnomaly = ui.openingTracker?.textContent ?? "";

        advanceTo(profile.clearAt, profile.dt);
        let spawned = enemies.filter((enemy) => enemy.openingSurge);
        let spawnGuard = 0;
        while (spawned.length < openingSurgeConfig.targetDefeats && spawnGuard < 90) {
          tickOpeningRoute(profile.dt);
          spawned = enemies.filter((enemy) => enemy.openingSurge);
          spawnGuard += 1;
        }
        for (const enemy of spawned.slice(0, openingSurgeConfig.targetDefeats)) {
          enemy.hp = 0;
        }
        clearDefeatedHostiles();
        tickOpeningRoute(profile.dt);
        syncHud();

        const rush = getOpeningRushSnapshot(runStats.openingRush);
        const ignition = cloneForSave(runStats.starterIgnition, null);
        samples.push({
          ok: Boolean(build)
            && spawned.length >= openingSurgeConfig.targetDefeats
            && rush.grade === "S"
            && rush.score >= 90
            && rush.elapsed <= openingRushConfig.windowSeconds
            && Boolean(ignition?.completed)
            && coachAfterAnomaly.includes("追S")
            && coachAfterAnomaly.includes("黄框")
            && coachAfterAnomaly.includes("4个落点"),
          weaponId: weapon.id,
          buildId: build?.id ?? null,
          cadence: profile.id,
          elapsed: round(rush.elapsed),
          score: rush.score,
          grade: rush.grade,
          completedIds: cloneForSave(rush.completedIds, []),
          spawnedCount: spawned.length,
          ignition,
          coachAfterAnomaly,
        });
      }
    }

    const result = {
      ok: samples.length === weaponDefinitions.slice(0, 3).length * cadenceProfiles.length
        && samples.every((sample) => sample.ok),
      samples,
      worstElapsed: samples.reduce((max, sample) => Math.max(max, sample.elapsed ?? 0), 0),
      minScore: samples.reduce((min, sample) => Math.min(min, sample.score ?? 0), 100),
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runHitFeedbackProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 80, weaponIndex: 0 });
    particles = [];
    const samples = weaponDefinitions.slice(0, 3).map((weapon, index) => {
      const enemy = spawnEnemyNear(player.x + 120 + index * 42, player.y + index * 18, "stress", { hpMultiplier: 0.8, speedMultiplier: 0.1 });
      const target = enemies[enemies.length - 1] ?? enemy;
      const charged = weapon.id === "paperclip";
      const profile = getWeaponImpactProfile(weapon.id, charged);
      const beforeCount = particles.length;
      target.hp = 120;
      const damage = applyEnemyDamage(target, 17 + index, "weapon");
      spawnWeaponImpactFeedback(target, {
        weaponId: weapon.id,
        charged,
        impactProfile: profile,
        vx: weapon.bulletSpeed ?? 0,
        vy: 0,
      }, damage);
      const emitted = particles.slice(beforeCount);
      const textParticle = emitted.find((particle) => particle.type === "text" && String(particle.text).includes(profile.textPrefix ?? ""));
      const impactParticles = emitted.filter((particle) => particle.type === "impact" && particle.impactProfile === profile.id);
      const shapes = [...new Set(impactParticles.map((particle) => particle.shape).filter(Boolean))];
      return {
        weaponId: weapon.id,
        profile: profile.id,
        label: profile.label,
        text: textParticle?.text ?? "",
        damage: round(damage),
        hitFlash: round(target.hitFlash),
        particleCount: impactParticles.length,
        shapes,
      };
    });
    const result = {
      ok: samples.length === 3
        && samples.every((sample, index) => Math.round(sample.damage) === 17 + index)
        && samples.every((sample) => sample.hitFlash > 0)
        && samples.every((sample) => sample.text.includes(String(Math.round(sample.damage))))
        && samples.every((sample) => sample.particleCount >= 6)
        && samples.some((sample) => sample.shapes.includes("slash"))
        && samples.some((sample) => sample.shapes.includes("keycap"))
        && samples.some((sample) => sample.shapes.includes("mist")),
      samples,
      particleCount: particles.length,
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runFairWarningProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 50, weaponIndex: 0 });
    runStats.fairWarning = createFairWarningState();
    particles = [];
    world.mode = "playing";
    damagePlayer(20, "测试伤害：进入低生命。");
    syncHud();
    const afterLow = {
      hp: round(player.hp),
      log: ui.log?.textContent ?? "",
      warning: cloneForSave(runStats.fairWarning, null),
      lowClass: Boolean(ui.hp.parentElement?.classList.contains("is-low-hp")),
      criticalClass: Boolean(ui.hp.parentElement?.classList.contains("is-critical-hp")),
      invulnerable: round(player.invulnerable),
      textShown: particles.some((particle) => particle.type === "text" && String(particle.text).includes("低生命")),
    };
    player.invulnerable = 0;
    damagePlayer(16, "测试伤害：进入临界生命。");
    syncHud();
    const afterCritical = {
      hp: round(player.hp),
      log: ui.log?.textContent ?? "",
      warning: cloneForSave(runStats.fairWarning, null),
      lowClass: Boolean(ui.hp.parentElement?.classList.contains("is-low-hp")),
      criticalClass: Boolean(ui.hp.parentElement?.classList.contains("is-critical-hp")),
      invulnerable: round(player.invulnerable),
      textShown: particles.some((particle) => particle.type === "text" && String(particle.text).includes("临界生命")),
    };
    const result = {
      ok: afterLow.warning?.lowHpWarned
        && afterLow.lowClass
        && afterLow.textShown
        && afterCritical.warning?.criticalHpWarned
        && afterCritical.criticalClass
        && afterCritical.textShown
        && afterCritical.invulnerable >= fairWarningConfig.criticalInvulnerable,
      afterLow,
      afterCritical,
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runFailureReplayProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 50, level: 2, weaponIndex: 2 });
    runStats.fairWarning = createFairWarningState();
    runStats.damageTaken = 0;
    world.mode = "playing";
    damagePlayer(20, "测试伤害：进入低生命。");
    player.invulnerable = 0;
    damagePlayer(8, "测试伤害：进入临界生命。");
    player.invulnerable = 0;
    damagePlayer(40, "测试伤害：最后一击。");
    const warningBeforeReview = cloneForSave(runStats.fairWarning, null);
    recordRunEnd(false);
    const review = normalizeLastRunReview(archiveState.lastRunReview);
    renderResultInsights(review);
    syncResultRetryButton(review);
    const insightsText = ui.resultInsights?.textContent ?? "";
    const build = getStarterBuildById(resultRetryStarterBuildId);
    const boost = cloneForSave(resultRetryBoost, null);
    const plan = cloneForSave(resultRetryPlan, null);
    startNewRun(build?.chapterIndex ?? 0, { starterBuildId: build?.id, retryBoost: boost, retryPlan: plan });
    const result = {
      ok: warningBeforeReview?.lowHpWarned
        && warningBeforeReview?.criticalHpWarned
        && warningBeforeReview?.lethalHit?.level === "lethal"
        && review?.failureReplay?.title?.includes("回放")
        && review?.failureReplay?.summary?.includes("最后记录")
        && review?.failureReplay?.counter?.includes("下一把")
        && insightsText.includes("失败回放")
        && insightsText.includes("反制")
        && boost?.id === "shielded-second-night"
        && Boolean(runStats.retryBoost?.applied)
        && Boolean(runStats.retryPlan?.applied),
      warningBeforeReview,
      review,
      insightsText,
      retryBoost: boost,
      retryPlan: plan,
      appliedRetryBoost: cloneForSave(runStats.retryBoost, null),
      appliedRetryPlan: cloneForSave(runStats.retryPlan, null),
    };
    ui.resultInsights.innerHTML = "";
    resultRetryStarterBuildId = null;
    resultRetryBoost = null;
    resultRetryPlan = null;
    syncResultRetryButton(null);
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runResultReviewProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 1, bugPoints: 0, hp: 20, level: 2 });
    runStats.damageTaken = 142;
    runStats.enemiesDefeated = 18;
    runStats.eventsResolved = 2;
    runStats.tempo = {
      ...createCombatTempoState(),
      streak: 1,
      bestStreak: 2,
      timer: 0.6,
    };
    runStats.openingSprint = {
      ...createOpeningSprintState(),
      completed: false,
      active: true,
      stepIndex: 1,
      completedStepIds: ["first-anomaly"],
    };

    recordRunEnd(false);
    const review = normalizeLastRunReview(archiveState.lastRunReview);
    renderResultInsights(review);
    syncResultRetryButton(review);
    const build = getStarterBuildById(resultRetryStarterBuildId);
    const boost = cloneForSave(resultRetryBoost, null);
    const plan = cloneForSave(resultRetryPlan, null);
    const buttonText = ui.restartButton?.textContent ?? "";
    const expectedOpeningBonus = boost?.openingTargetBonusBugPoints ?? 0;
    const expectedStepBugPoints = (openingSprintSteps[0]?.rewardBugPoints ?? 0) + expectedOpeningBonus;
    startNewRun(build?.chapterIndex ?? 0, { starterBuildId: build?.id, retryBoost: boost, retryPlan: plan });
    const retryApplied = Boolean(runStats.retryBoost?.applied)
      && runStats.retryBoost.id === boost?.id
      && player.bugPoints >= (boost?.bonusBugPoints ?? 0)
      && player.hp >= playerBase.hp;
    const retryPlanApplied = Boolean(runStats.retryPlan?.applied)
      && runStats.retryPlan.id === plan?.id
      && runStats.retryPlan.starterBuildId === build?.id
      && (runStats.openingSprint?.surge?.delayRemaining ?? openingSurgeConfig.spawnDelay)
        <= openingSurgeConfig.spawnDelay * (plan?.openingSurgeDelayMultiplier ?? 1) + 0.01
      && (runStats.starterIgnition?.surgeCredit ?? 0) >= (plan?.starterIgnitionCredit ?? 0);
    const retryOpeningBonusReady = (runStats.openingSprint?.retryBonusBugPoints ?? 0) === expectedOpeningBonus;
    syncHud();
    const openingTrackerText = ui.openingTracker?.textContent ?? "";
    const retryShowcase = cloneForSave(runStats.openingShowcase, null);
    world.mode = "playing";
    const bugPointsBeforeStep = player.bugPoints;
    runStats.eventsResolved += openingSprintSteps[0]?.target ?? 1;
    updateOpeningSprint(0.1);
    const firstStepBoostClaimed = player.bugPoints >= bugPointsBeforeStep + expectedStepBugPoints;
    const result = {
      ok: Boolean(review)
        && review.outcome === "defeat"
        && review.recommendedStarterBuildId === "close-control"
        && build?.id === "close-control"
        && boost?.id === "shielded-second-night"
        && ui.resultInsights?.textContent.includes("护盾起步")
        && ui.resultInsights?.textContent.includes("下一局路线")
        && ui.resultInsights?.textContent.includes("截图焦点")
        && ui.resultInsights?.textContent.includes(plan?.title ?? "")
        && buttonText.includes("护盾起步")
        && buttonText.includes(plan?.title ?? "")
        && retryApplied
        && retryPlanApplied
        && openingTrackerText.includes(plan?.title ?? "")
        && openingTrackerText.includes("推荐再来")
        && retryShowcase?.phase === "retry"
        && retryShowcase?.title.includes("30 秒路线")
        && retryShowcase?.focus === plan?.screenshotFocus
        && retryShowcase?.rewardText === plan?.rewardText
        && retryShowcase?.callout === plan?.title
        && retryOpeningBonusReady
        && firstStepBoostClaimed,
      review,
      retryStarterBuildId: build?.id ?? null,
      retryBoost: boost,
      retryPlan: plan,
      retryApplied: cloneForSave(runStats.retryBoost, null),
      retryPlanApplied: cloneForSave(runStats.retryPlan, null),
      retryShowcase,
      openingTrackerText,
      firstStepBoostClaimed,
      insightsText: ui.resultInsights?.textContent ?? "",
    };
    ui.resultInsights.innerHTML = "";
    resultRetryStarterBuildId = null;
    resultRetryBoost = null;
    resultRetryPlan = null;
    syncResultRetryButton(null);
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runRetryCombatShowcaseProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    resetStoreRun(0, { stepIndex: 0, bugPoints: 0, hp: 74, xp: 0, weaponIndex: 2 });
    runStats.eventsResolved = 0;
    runStats.enemiesDefeated = 0;
    runStats.openingSprint = createOpeningSprintState();
    runStats.openingSprint.surge.delayRemaining = 0;
    runStats.tempo = createCombatTempoState();
    const build = getStarterBuildById("close-control") ?? starterBuilds[0] ?? null;
    const weapon = getWeaponById(build?.weaponId) ?? weaponDefinitions[2] ?? weaponDefinitions[0];
    const boost = createReviewRetryBoost(false, build, "伤害吃得偏多");
    const plan = createReviewRetryPlan(false, build, boost, "伤害吃得偏多");
    if (weapon) {
      equipWeapon(weapon);
    }
    if (build) {
      runStats.starterBuild = build.id;
      runStats.starterIgnition = createStarterIgnitionState(build);
    }
    applyRetryBoost(boost);
    applyRetryPlan(plan);
    spawnChapterNodes(currentChapter().steps?.[0]);
    world.mode = "playing";
    centerCameraOnPlayer();
    runStats.eventsResolved += openingSprintSteps[0]?.target ?? 1;
    updateOpeningSprint(0.1);
    runStats.openingSprint.surge.delayRemaining = 0;
    updateOpeningSurge(0.8);
    const combatShowcaseBeforeHit = cloneForSave(runStats.openingShowcase, null);
    const target = enemies.find((enemy) => enemy.openingSurge) ?? enemies[0] ?? null;
    if (target && player.weapon) {
      const profile = getWeaponImpactProfile(player.weapon.id, false);
      spawnWeaponImpactFeedback(target, {
        weaponId: player.weapon.id,
        charged: false,
        impactProfile: profile,
        vx: player.weapon.bulletSpeed ?? 0,
        vy: 0,
      }, 18);
    }
    updateOpeningShowcase(0.35);
    syncHud();
    const combatShowcaseAfterHit = cloneForSave(runStats.openingShowcase, null);
    const checklist = combatShowcaseAfterHit?.checklist ?? {};
    const trackerText = ui.openingTracker?.textContent ?? "";
    const result = {
      ok: combatShowcaseBeforeHit?.phase === "combat"
        && combatShowcaseBeforeHit?.title?.includes("实战镜头")
        && combatShowcaseAfterHit?.phase === "combat"
        && checklist.target
        && checklist.enemies
        && checklist.effect
        && checklist.reward
        && checklist.ready
        && (checklist.enemyCount ?? 0) >= 2
        && trackerText.includes("实战镜头")
        && trackerText.includes("奖励")
        && trackerText.includes("镜头已就绪"),
      retryPlan: plan,
      beforeHit: combatShowcaseBeforeHit,
      afterHit: combatShowcaseAfterHit,
      trackerText,
      enemyCount: enemies.filter((enemy) => enemy.openingSurge).length,
      targetCount: getObjectiveTargets().length,
      particleCount: particles.length,
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runChapterShowcaseProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    const enemyByChapter = {
      1: "deadline",
      2: "queueSnake",
      3: "promise",
      4: "inspectionProbe",
    };
    const results = [];

    for (let index = 1; index < chapters.length; index += 1) {
      const chapter = chapters[index];
      const bossSpawn = chapterMaps[index]?.bossSpawn ?? chapterMaps[index]?.start ?? player;
      enterChapter(index, {
        stepIndex: Math.max(0, Math.min(2, (chapter?.steps?.length ?? 1) - 1)),
        focus: chapterMaps[index]?.start ?? bossSpawn,
      });
      world.mode = "playing";
      runStats.chapterShowcase = null;
      activateChapterShowcase("probe", { hold: 24 });

      const device = getMapInteractives()[0] ?? null;
      let deviceSample = null;
      if (device) {
        deviceSample = movePlayerTo(device.x, device.y, `chapter-showcase-device-${index}`);
        checkMapInteractiveCollision();
      }

      const enemyType = enemyByChapter[index] ?? "deadline";
      const enemyPoint = findNearestFreePoint(
        clamp(player.x + 148, 76, world.width - 76),
        clamp(player.y + 24, 96, world.height - 76),
        28
      );
      const target = spawnEnemyNear(enemyPoint.x, enemyPoint.y, enemyType, {
        hpMultiplier: 0.5,
        speedMultiplier: 0.72,
        mechanicDepth: 1,
      });
      centerCameraOnPlayer();
      updateChapterShowcase(0.2);

      startBossFight(chapter?.boss?.id);
      if (boss) {
        boss.attackCooldown = Math.max(boss.attackCooldown, 4);
        boss.hp = boss.maxHp * 0.64;
        updateBoss(0.16);
      }

      const hitTarget = target ?? enemies[0] ?? cleaners[0] ?? boss;
      if (hitTarget && player.weapon) {
        const profile = getWeaponImpactProfile(player.weapon.id, false);
        spawnWeaponImpactFeedback(hitTarget, {
          weaponId: player.weapon.id,
          charged: false,
          impactProfile: profile,
          vx: player.weapon.bulletSpeed ?? 0,
          vy: 0,
        }, 18);
      }
      updateChapterShowcase(0.28);
      syncHud();

      const showcase = cloneForSave(runStats.chapterShowcase, null);
      const checklist = showcase?.checklist ?? {};
      results.push({
        ok: Boolean(showcase?.active)
          && showcase?.mapId === chapterMaps[index]?.id
          && checklist.device
          && checklist.mechanic
          && checklist.boss
          && checklist.effect
          && checklist.ready
          && Boolean(showcase?.completed),
        chapterIndex: index,
        title: chapter?.title ?? `Chapter ${index + 1}`,
        mapId: chapterMaps[index]?.id ?? null,
        deviceId: device?.id ?? null,
        enemyType,
        bossId: boss?.id ?? null,
        deviceSample,
        checklist,
        showcase,
      });
    }

    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return {
      ok: results.length === Math.max(0, chapters.length - 1) && results.every((result) => result.ok),
      results,
    };
  }

  function runChapterCombatStoreShotProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    const previousReady = window.__variableCityStoreShotReady;
    const results = [];

    for (const [mode, config] of Object.entries(chapterCombatStoreShotConfigs)) {
      window.__variableCityStoreShotReady = false;
      const configured = configureChapterCombatStoreShotMode(mode);
      const expectedMapId = chapterMaps[config.chapterIndex]?.id ?? null;
      const showcase = cloneForSave(runStats?.chapterShowcase, null);
      const checklist = showcase?.checklist ?? {};
      const visibleBoss = Boolean(boss && isPointInCurrentCamera(boss.x, boss.y, -60));
      const visibleEnemy = enemies.some((enemy) => enemy.type === config.enemyType && isPointInCurrentCamera(enemy.x, enemy.y, -60));
      const visibleHazard = enemyHazards.some((hazard) => hazard.type === config.hazardType && isPointInCurrentCamera(hazard.x, hazard.y, -60));
      const visibleEffect = particles.some((particle) => particle.type === "impact" && isPointInCurrentCamera(particle.x, particle.y, -60));
      results.push({
        ok: configured
          && window.__variableCityStoreShotReady === true
          && currentChapterIndex === config.chapterIndex
          && world.mode === "playing"
          && player.weapon?.id
          && boss?.phase >= 2
          && showcase?.mapId === expectedMapId
          && checklist.device
          && checklist.mechanic
          && checklist.boss
          && checklist.effect
          && checklist.ready
          && Boolean(showcase?.completed)
          && visibleBoss
          && visibleEnemy
          && visibleHazard
          && visibleEffect,
        mode,
        chapterIndex: config.chapterIndex,
        mapId: expectedMapId,
        weaponId: player.weapon?.id ?? null,
        enemyType: config.enemyType,
        bossId: boss?.id ?? null,
        bossPhase: boss?.phase ?? 0,
        visible: {
          boss: visibleBoss,
          enemy: visibleEnemy,
          hazard: visibleHazard,
          effect: visibleEffect,
        },
        checklist,
        showcase,
      });
    }

    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    window.__variableCityStoreShotReady = previousReady;
    return {
      ok: results.length === Object.keys(chapterCombatStoreShotConfigs).length && results.every((result) => result.ok),
      results,
    };
  }

  function runStarterBuildProbe() {
    const previousArchive = cloneForSave(archiveState, null);
    const build = starterBuilds[0];
    startNewRun(build?.chapterIndex ?? 0, { starterBuildId: build?.id });
    const savedBeforeIgnition = loadRunSave();
    const startBugPoints = player.bugPoints;
    const startHp = player.hp;
    const ignition = runStats.starterIgnition;
    const beforeWeapon = cloneForSave(player.weapon, {});
    world.mode = "playing";
    if (ignition) {
      runStats.enemiesDefeated += ignition.targetDefeats;
      updateStarterIgnition(0.1);
    }
    const savedAfterIgnition = loadRunSave();
    const afterWeapon = cloneForSave(player.weapon, {});
    const overclockApplied = Boolean(runStats.starterIgnition?.overclockApplied);
    const overclockChanged = [
      "damage",
      "pierce",
      "cooldown",
      "range",
      "bulletSize",
      "projectileCount",
    ].some((stat) => afterWeapon?.[stat] !== beforeWeapon?.[stat]);
    const result = {
      ok: Boolean(build)
        && player.weapon?.id === build.weaponId
        && runStats.starterBuild === build.id
        && Boolean(savedBeforeIgnition?.player?.weapon?.id === build.weaponId)
        && Boolean(runStats.starterIgnition?.completed)
        && overclockApplied
        && overclockChanged
        && player.bugPoints > startBugPoints
        && player.hp >= startHp
        && savedAfterIgnition?.reason === "starter-ignition-complete",
      buildId: build?.id ?? null,
      weaponId: player.weapon?.id ?? null,
      mode: world.mode,
      savedReason: savedBeforeIgnition?.reason ?? null,
      savedWeaponId: savedBeforeIgnition?.player?.weapon?.id ?? null,
      ignition: cloneForSave(runStats.starterIgnition, null),
      reward: {
        bugPoints: player.bugPoints - startBugPoints,
        hp: round(player.hp - startHp),
        savedReason: savedAfterIgnition?.reason ?? null,
      },
      overclock: {
        applied: overclockApplied,
        text: runStats.starterIgnition?.overclockText ?? "",
        before: {
          damage: round(beforeWeapon?.damage),
          pierce: beforeWeapon?.pierce ?? 0,
          cooldown: round(beforeWeapon?.cooldown),
          range: round(beforeWeapon?.range),
          bulletSize: round(beforeWeapon?.bulletSize),
        },
        after: {
          damage: round(afterWeapon?.damage),
          pierce: afterWeapon?.pierce ?? 0,
          cooldown: round(afterWeapon?.cooldown),
          range: round(afterWeapon?.range),
          bulletSize: round(afterWeapon?.bulletSize),
        },
      },
    };
    deleteRunSave();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function enterChapter(chapterIndex, options = {}) {
    const index = clamp(Number(chapterIndex) || 0, 0, chapters.length - 1);
    const stepCount = chapters[index]?.steps?.length ?? 0;
    const stepIndex = Number.isFinite(options.stepIndex)
      ? clamp(options.stepIndex, -1, Math.max(-1, stepCount - 1))
      : Math.max(0, Math.min(2, stepCount - 1));
    resetStoreRun(index, {
      ...options,
      stepIndex,
      focus: options.focus ?? chapterMaps[index]?.start,
      objective: options.objective ?? chapters[index]?.initialObjective,
      log: options.log ?? `自动巡检进入：${chapters[index]?.title ?? index + 1}`,
    });
    saveRunCheckpoint("route-pressure-enter");
    return snapshot({ action: "enterChapter" });
  }

  function movePlayerTo(x, y, label = "route") {
    syncWorldToCurrentMap();
    const safePoint = findNearestFreePoint(Number(x), Number(y), player?.radius ?? playerBase.radius);
    player.x = safePoint.x;
    player.y = safePoint.y;
    centerCameraOnPlayer();
    syncHud();
    return {
      label,
      requested: { x: round(x), y: round(y) },
      actual: { x: round(player.x), y: round(player.y) },
      inBounds: player.x >= player.radius && player.x <= world.width - player.radius && player.y >= 76 && player.y <= world.height - player.radius,
      blocked: isPointBlockedByMap(player.x, player.y, player.radius),
      camera: { x: round(world.cameraX), y: round(world.cameraY) },
    };
  }

  function collectRoutePoints() {
    const map = currentMap() ?? {};
    const points = [];
    const addPoint = (point, label) => {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        return;
      }
      const key = `${Math.round(point.x)}:${Math.round(point.y)}`;
      if (points.some((candidate) => candidate.key === key)) {
        return;
      }
      points.push({ key, x: point.x, y: point.y, label });
    };

    addPoint(map.start, "start");
    for (const [stepKey, targets] of Object.entries(map.stepTargets ?? {})) {
      for (const target of targets ?? []) {
        addPoint(target, `step-${stepKey}`);
      }
    }
    for (const [index, echo] of getMapEchoes(map).entries()) {
      addPoint(echo, `echo-${index}`);
    }
    for (const [index, cache] of getMapCaches(map).entries()) {
      addPoint(cache, `cache-${index}`);
    }
    for (const [index, device] of getMapInteractives(map).entries()) {
      addPoint(device, `interactive-${index}`);
    }
    addPoint(map.bossSpawn, "bossSpawn");
    for (const [index, point] of (map.spawnPoints ?? []).entries()) {
      if (index === 0 || index === (map.spawnPoints?.length ?? 0) - 1) {
        addPoint(point, `spawn-${index}`);
      }
    }
    addPoint({ x: world.width - 88, y: 112 }, "far-east-north");
    addPoint({ x: world.width - 96, y: world.height - 88 }, "far-east-south");
    return points;
  }

  function runDiscoveryEchoProbe(chapterIndex) {
    const previousArchive = cloneForSave(archiveState, null);
    const echo = getMapEchoes()[0];
    if (!echo) {
      return { ok: false, reason: "missing echo" };
    }

    const beforeBugPoints = player.bugPoints;
    const sample = movePlayerTo(echo.x, echo.y, `echo-probe-${chapterIndex}`);
    checkDiscoveryEchoCollision();
    const collected = getCollectedEchoIds().includes(echo.id);
    const bugReward = Math.max(0, Number(echo.bugPoints) || 0);
    const archiveSummary = getEchoArchiveSummary();
    archiveState = previousArchive ?? loadArchive();
    saveArchive();

    return {
      ok: collected && player.bugPoints >= beforeBugPoints + bugReward,
      echoId: echo.id,
      label: echo.label ?? null,
      sample,
      expectedBugReward: bugReward,
      beforeBugPoints,
      afterBugPoints: player.bugPoints,
      archiveSummary: {
        discovered: archiveSummary.discovered,
        total: archiveSummary.total,
        completedChapters: archiveSummary.completedChapters,
      },
      collected: cloneForSave(chapterState?.echoesCollected, []),
    };
  }

  function runMapCacheProbe(chapterIndex) {
    const previousArchive = cloneForSave(archiveState, null);
    const cache = getMapCaches()[0];
    if (!cache) {
      return { ok: false, reason: "missing cache" };
    }

    archiveState = {
      ...createArchiveFallback(),
      calibrationShards: 0,
      discoveredMapCaches: [],
      completedMapCacheChapters: [],
      lastMapCacheDiscovery: null,
    };
    const beforeBugPoints = player.bugPoints;
    const beforeHp = player.hp;
    const beforeBacklash = player.backlash;
    const sample = movePlayerTo(cache.x, cache.y, `cache-probe-${chapterIndex}`);
    checkMapCacheCollision();
    const collected = getCollectedMapCacheIds().includes(cache.id);
    const bugReward = Math.max(0, Math.trunc(Number(cache.bugPoints) || 0));
    const healReward = Math.max(0, Math.trunc(Number(cache.hp) || 0));
    const backlashReward = Math.max(0, Math.trunc(Number(cache.backlash) || 0));
    const expectedShardReward = getMapCacheChapterReward(chapterIndex);
    const archiveSummary = getMapCacheArchiveSummary();
    const archiveOk = archiveSummary.discovered === 1
      && archiveSummary.completedChapters === 1
      && archiveState.discoveredMapCaches.includes(cache.id)
      && archiveState.completedMapCacheChapters.includes(currentMap().id)
      && archiveState.calibrationShards === expectedShardReward;

    const result = {
      ok: collected
        && player.bugPoints >= beforeBugPoints + bugReward
        && player.hp >= Math.min(player.maxHp, beforeHp + healReward)
        && player.backlash <= Math.max(0, beforeBacklash - backlashReward)
        && archiveOk,
      cacheId: cache.id,
      label: cache.label ?? null,
      sample,
      expectedBugReward: bugReward,
      expectedShardReward,
      beforeBugPoints,
      afterBugPoints: player.bugPoints,
      beforeHp: round(beforeHp),
      afterHp: round(player.hp),
      beforeBacklash: round(beforeBacklash),
      afterBacklash: round(player.backlash),
      archiveSummary: {
        discovered: archiveSummary.discovered,
        total: archiveSummary.total,
        completedChapters: archiveSummary.completedChapters,
        calibrationShards: archiveState.calibrationShards,
        lastMapCacheDiscovery: cloneForSave(archiveState.lastMapCacheDiscovery, null),
      },
      collected: cloneForSave(chapterState?.mapCachesCollected, []),
    };
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function runMapInteractiveProbe(chapterIndex) {
    const previousArchive = cloneForSave(archiveState, null);
    const device = getMapInteractives()[0];
    if (!device) {
      return { ok: chapterIndex === 0, reason: "missing optional interactive" };
    }

    archiveState = {
      ...createArchiveFallback(),
      calibrationShards: 0,
      activatedMapInteractives: [],
      completedMapInteractiveChapters: [],
      lastMapInteractiveDiscovery: null,
    };
    if (device.weakenRadius) {
      spawnEnemyNear(device.x + 44, device.y + 24, "stress", { hpMultiplier: 0.45, speedMultiplier: 0.8 });
    }
    const beforeBugPoints = player.bugPoints;
    const beforeHp = player.hp;
    const beforeBacklash = player.backlash;
    const beforeInvulnerable = player.invulnerable ?? 0;
    const beforeDefeats = runStats.enemiesDefeated ?? 0;
    const beforePickups = bugPickups.length;
    world.pulseCooldown = 1.1;
    world.dashCooldown = 1.2;
    world.mode = "playing";
    runStats.deviceGuide = null;
    const guideBefore = updateDeviceGuide(0.35);
    syncHud();
    const trackerBefore = ui.deviceTracker?.textContent ?? "";
    const sample = movePlayerTo(device.x, device.y, `interactive-probe-${chapterIndex}`);
    checkMapInteractiveCollision();
    syncHud();
    const activated = getActivatedMapInteractiveIds().includes(device.id);
    const bugReward = Math.max(0, Math.trunc(Number(device.bugPoints) || 0));
    const healReward = Math.max(0, Math.trunc(Number(device.hp) || 0));
    const backlashReward = Math.max(0, Math.trunc(Number(device.backlash) || 0));
    const pickupReward = Math.max(0, Math.trunc(Number(device.spawnPickups) || 0));
    const expectedShardReward = getMapInteractiveChapterReward(chapterIndex);
    const archiveSummary = getMapInteractiveArchiveSummary();
    const savedAfterInteractive = loadRunSave();
    const guideAfter = cloneForSave(runStats.deviceGuide, null);

    const result = {
      ok: Boolean(guideBefore?.target?.id === device.id)
        && Boolean(guideBefore?.guide?.targetId === device.id)
        && trackerBefore.includes(device.label ?? "互动装置")
        && activated
        && player.bugPoints >= beforeBugPoints + bugReward
        && player.hp >= Math.min(player.maxHp, beforeHp + healReward)
        && player.backlash <= Math.max(0, beforeBacklash - backlashReward)
        && (!device.cooldownReset || (world.pulseCooldown === 0 && world.dashCooldown === 0))
        && (!device.invulnerable || (player.invulnerable ?? 0) >= Math.max(beforeInvulnerable, device.invulnerable))
        && (!pickupReward || bugPickups.length >= beforePickups + pickupReward)
        && (!device.weakenRadius || (runStats.enemiesDefeated ?? 0) > beforeDefeats || enemies.some((enemy) => enemy.slowTimer > 0))
        && archiveSummary.activated === 1
        && archiveSummary.completedChapters === 1
        && archiveState.activatedMapInteractives.includes(device.id)
        && archiveState.completedMapInteractiveChapters.includes(currentMap().id)
        && archiveState.calibrationShards === expectedShardReward
        && Boolean(guideAfter?.completed)
        && guideAfter?.targetId === device.id
        && savedAfterInteractive?.reason === "map-interactive",
      deviceId: device.id,
      label: device.label ?? null,
      deviceGuide: {
        before: {
          targetId: guideBefore?.guide?.targetId ?? null,
          distance: round(guideBefore?.distance),
          trackerText: trackerBefore,
        },
        after: guideAfter,
      },
      sample,
      expectedShardReward,
      beforeBugPoints,
      afterBugPoints: player.bugPoints,
      beforeHp: round(beforeHp),
      afterHp: round(player.hp),
      beforeBacklash: round(beforeBacklash),
      afterBacklash: round(player.backlash),
      cooldowns: {
        pulse: round(world.pulseCooldown),
        dash: round(world.dashCooldown),
      },
      invulnerable: round(player.invulnerable ?? 0),
      pickupsAdded: bugPickups.length - beforePickups,
      defeatsAdded: (runStats.enemiesDefeated ?? 0) - beforeDefeats,
      savedReason: savedAfterInteractive?.reason ?? null,
      archiveSummary: {
        activated: archiveSummary.activated,
        total: archiveSummary.total,
        completedChapters: archiveSummary.completedChapters,
        calibrationShards: archiveState.calibrationShards,
        lastMapInteractiveDiscovery: cloneForSave(archiveState.lastMapInteractiveDiscovery, null),
      },
      activated: cloneForSave(chapterState?.mapInteractivesActivated, []),
    };
    archiveState = previousArchive ?? loadArchive();
    saveArchive();
    return result;
  }

  function startBossForChapter(chapterIndex) {
    const index = clamp(Number(chapterIndex) || 0, 0, chapters.length - 1);
    const chapter = chapters[index];
    const bossSpawn = chapterMaps[index]?.bossSpawn ?? chapterMaps[index]?.start;
    enterChapter(index, {
      stepIndex: Math.max(0, (chapter?.steps?.length ?? 1) - 1),
      focus: bossSpawn,
      objective: chapter?.boss?.objective,
    });
    startBossFight(chapter?.boss?.id);
    saveRunCheckpoint("route-pressure-boss");
    return snapshot({ action: "startBossForChapter" });
  }

  function saveAndRestoreProbe() {
    const before = snapshot({ action: "beforeSaveRestore" });
    deleteRunSave();
    saveRunCheckpoint("route-pressure-save");
    const saved = loadRunSave();
    if (saved) {
      restoreRunSave(saved);
    }
    const after = snapshot({ action: "afterSaveRestore" });
    const savedSummary = saved ? {
      reason: saved.reason ?? null,
      currentChapterIndex: saved.currentChapterIndex ?? null,
      objective: saved.objective ?? null,
      hasWeapon: Boolean(saved.player?.weapon),
      bossId: saved.boss?.id ?? null,
    } : null;
    const sameChapter = before.currentChapterIndex === after.currentChapterIndex
      && before.currentChapterIndex === savedSummary?.currentChapterIndex;
    return {
      ok: Boolean(saved) && sameChapter && Boolean(after.player.weapon) && savedSummary?.reason === "route-pressure-save",
      savedAt: saved?.savedAt ?? null,
      saved: savedSummary,
      before,
      after,
    };
  }

  function runRoutePressureTest() {
    const failures = [];
    const chaptersCovered = [];
    const metaProgression = runMetaProgressionProbe();
    const nightHook = runNightHookProbe();
    const combatTempo = runCombatTempoProbe();
    const echoArchive = runEchoArchiveProbe();
    const openingSprint = runOpeningSprintProbe();
    const openingSurge = runOpeningSurgeProbe();
    const openingGuidance = runOpeningGuidanceProbe();
    const openingRouteReadability = runOpeningRouteReadabilityProbe();
    const openingRushRating = runOpeningRushRatingProbe();
    const openingRushTiming = runOpeningRushTimingProbe();
    const hitFeedback = runHitFeedbackProbe();
    const fairWarning = runFairWarningProbe();
    const failureReplay = runFailureReplayProbe();
    const resultReview = runResultReviewProbe();
    const retryCombatShowcase = runRetryCombatShowcaseProbe();
    const chapterShowcase = runChapterShowcaseProbe();
    const chapterCombatStoreShots = runChapterCombatStoreShotProbe();
    const starterBuild = runStarterBuildProbe();

    if (!metaProgression.ok) {
      failures.push("meta progression bonuses failed");
    }
    if (!nightHook.ok) {
      failures.push("night hook completion failed");
    }
    if (!combatTempo.ok) {
      failures.push("combat tempo reward failed");
    }
    if (!echoArchive.ok) {
      failures.push("echo archive progression failed");
    }
    if (!openingSprint.ok) {
      failures.push("opening sprint guidance failed");
    }
    if (!openingSurge.ok) {
      failures.push("opening surge first wave failed");
    }
    if (!openingGuidance.ok) {
      failures.push("opening weapon and anomaly guidance failed");
    }
    if (!openingRouteReadability.ok) {
      failures.push("opening route readability failed");
    }
    if (!openingRushRating.ok) {
      failures.push("opening rush rating failed");
    }
    if (!openingRushTiming.ok) {
      failures.push("opening rush timing failed");
    }
    if (!hitFeedback.ok) {
      failures.push("weapon hit feedback failed");
    }
    if (!fairWarning.ok) {
      failures.push("fair low-health warning failed");
    }
    if (!failureReplay.ok) {
      failures.push("failure replay loop failed");
    }
    if (!resultReview.ok) {
      failures.push("result review recommendation failed");
    }
    if (!retryCombatShowcase.ok) {
      failures.push("retry combat showcase failed");
    }
    if (!chapterShowcase.ok) {
      failures.push("chapter combat showcase failed");
    }
    if (!chapterCombatStoreShots.ok) {
      failures.push("chapter combat storeShot routes failed");
    }
    if (!starterBuild.ok) {
      failures.push("starter build quick start failed");
    }

    for (let index = 0; index < chapters.length; index += 1) {
      const entry = enterChapter(index);
      const echoProbe = runDiscoveryEchoProbe(index);
      const cacheProbe = runMapCacheProbe(index);
      const interactiveProbe = runMapInteractiveProbe(index);
      const routeSamples = collectRoutePoints().map((point) => movePlayerTo(point.x, point.y, point.label));
      const badRoute = routeSamples.filter((sample) => !sample.inBounds || sample.blocked);
      const bossSnapshot = startBossForChapter(index);
      const saveRestore = saveAndRestoreProbe();

      if (entry.currentChapterIndex !== index) {
        failures.push(`Chapter ${index + 1} entered as ${entry.currentChapterIndex + 1}`);
      }
      if (!entry.map.largerThanView) {
        failures.push(`Chapter ${index + 1} map is not larger than the viewport`);
      }
      if (routeSamples.length < 3) {
        failures.push(`Chapter ${index + 1} has too few route samples`);
      }
      if (entry.map.taskMarkerCount < 4) {
        failures.push(`Chapter ${index + 1} has too few discovery task markers`);
      }
      if (entry.map.hazardSignalCount < 2) {
        failures.push(`Chapter ${index + 1} has too few zone warning markers`);
      }
      if (entry.map.landmarkMarkerCount < 2) {
        failures.push(`Chapter ${index + 1} is missing start or boss landmark markers`);
      }
      if (entry.map.echoCount < 2) {
        failures.push(`Chapter ${index + 1} has too few discovery echoes`);
      }
      if (entry.map.cacheCount < 1) {
        failures.push(`Chapter ${index + 1} is missing landmark cache`);
      }
      if (index > 0 && entry.map.interactiveCount < 1) {
        failures.push(`Chapter ${index + 1} is missing interactive map device`);
      }
      if (!echoProbe.ok) {
        failures.push(`Chapter ${index + 1} discovery echo probe failed`);
      }
      if (!cacheProbe.ok) {
        failures.push(`Chapter ${index + 1} landmark cache probe failed`);
      }
      if (index > 0 && !interactiveProbe.ok) {
        failures.push(`Chapter ${index + 1} interactive map device probe failed`);
      }
      if (badRoute.length > 0) {
        failures.push(`Chapter ${index + 1} has blocked route sample: ${badRoute[0].label}`);
      }
      if (!bossSnapshot.boss?.id || bossSnapshot.mode !== "playing") {
        failures.push(`Chapter ${index + 1} boss did not start`);
      }
      if (!saveRestore.ok) {
        failures.push(`Chapter ${index + 1} save/restore failed`);
      }

      chaptersCovered.push({
        index,
        title: chapters[index]?.title ?? `Chapter ${index + 1}`,
        map: entry.map,
        echoProbe,
        cacheProbe,
        interactiveProbe,
        routeSamples,
        boss: bossSnapshot.boss,
        saveRestoreOk: saveRestore.ok,
        saveRestore,
        restoredObjective: saveRestore.after.objective,
      });
    }

    return {
      ok: failures.length === 0,
      checkedAt: new Date().toISOString(),
      chapterCount: chapters.length,
      failures,
      metaProgression,
      nightHook,
      combatTempo,
      echoArchive,
      openingSprint,
      openingSurge,
      openingGuidance,
      openingRouteReadability,
      openingRushRating,
      openingRushTiming,
      hitFeedback,
      fairWarning,
      failureReplay,
      resultReview,
      retryCombatShowcase,
      chapterShowcase,
      chapterCombatStoreShots,
      starterBuild,
      chapters: chaptersCovered,
      finalSnapshot: snapshot({ action: "routePressureComplete" }),
    };
  }

  window.__variableCityTestHooks = {
    snapshot,
    enterChapter,
    movePlayerTo,
    startBossForChapter,
    saveAndRestoreProbe,
    runMetaProgressionProbe,
    runNightHookProbe,
    runCombatTempoProbe,
    runEchoArchiveProbe,
    runOpeningSprintProbe,
    runOpeningSurgeProbe,
    runOpeningGuidanceProbe,
    runOpeningRouteReadabilityProbe,
    runOpeningRushRatingProbe,
    runOpeningRushTimingProbe,
    runHitFeedbackProbe,
    runFairWarningProbe,
    runFailureReplayProbe,
    runMapInteractiveProbe,
    runResultReviewProbe,
    runRetryCombatShowcaseProbe,
    runChapterShowcaseProbe,
    runChapterCombatStoreShotProbe,
    runStarterBuildProbe,
    runRoutePressureTest,
  };
}

if (isAutomationMode) {
  installAutomationTestHooks();
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  lastInputMethod = "keyboard";
  unlockAudioContext();
  if (key === "escape") {
    event.preventDefault();
    if (!ui.settingsPanel?.classList.contains("hidden")) {
      closeSettingsPanel();
    } else {
      togglePause();
    }
    syncSystemControls();
    return;
  }
  if (key === "p") {
    event.preventDefault();
    togglePause();
    return;
  }
  if (key === "f") {
    event.preventDefault();
    toggleFullscreen();
    return;
  }
  keys.add(key);
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

window.addEventListener("beforeunload", () => {
  saveRunCheckpoint("beforeunload");
});

document.addEventListener("pointerdown", unlockAudioContext);
document.addEventListener("fullscreenchange", syncSystemControls);
ui.pauseButton?.addEventListener("click", togglePause);
ui.settingsButton?.addEventListener("click", openSettingsPanel);
ui.fullscreenButton?.addEventListener("click", toggleFullscreen);
ui.resumeButton?.addEventListener("click", resumeGame);
ui.pauseSettingsButton?.addEventListener("click", openSettingsPanel);
ui.returnMenuButton?.addEventListener("click", returnToStartMenuFromPause);
ui.settingsFullscreenButton?.addEventListener("click", toggleFullscreen);
ui.settingsCloseButton?.addEventListener("click", closeSettingsPanel);
ui.shakeToggle?.addEventListener("change", () => {
  gameSettings.screenShake = ui.shakeToggle.checked;
  saveGameSettings();
});
ui.gamepadToggle?.addEventListener("change", () => {
  gameSettings.gamepadEnabled = ui.gamepadToggle.checked;
  saveGameSettings();
});
ui.inputHintToggle?.addEventListener("change", () => {
  gameSettings.showInputHints = ui.inputHintToggle.checked;
  saveGameSettings();
});
ui.fullscreenPrefToggle?.addEventListener("change", () => {
  gameSettings.fullscreenOnStart = ui.fullscreenPrefToggle.checked;
  saveGameSettings();
});
ui.audioMuteToggle?.addEventListener("change", () => {
  gameSettings.audioMuted = ui.audioMuteToggle.checked;
  saveGameSettings();
  if (!gameSettings.audioMuted) {
    playAudioCue("ui-confirm");
  }
});
ui.masterVolumeSlider?.addEventListener("input", () => {
  gameSettings.masterVolume = clamp(Number(ui.masterVolumeSlider.value) / 100, 0, 1);
  saveGameSettings();
});
ui.masterVolumeSlider?.addEventListener("change", () => {
  playAudioCue("ui-confirm");
});
ui.audioTestButton?.addEventListener("click", () => {
  unlockAudioContext();
  playAudioCue("pulse");
});

ui.restartButton.addEventListener("click", () => {
  const build = getStarterBuildById(resultRetryStarterBuildId);
  if (build) {
    startNewRun(build.chapterIndex, { starterBuildId: build.id, retryBoost: resultRetryBoost, retryPlan: resultRetryPlan });
    return;
  }
  startNewRun(0, { retryBoost: resultRetryBoost, retryPlan: resultRetryPlan });
});
ui.storyPanel.addEventListener("click", (event) => {
  if (event.target.closest("button")) {
    return;
  }
  advanceStory();
});

bootGame();
requestAnimationFrame(update);

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
  upgradePanel: document.querySelector("#upgradePanel"),
  upgradeChoices: document.querySelector("#upgradeChoices"),
  resultPanel: document.querySelector("#resultPanel"),
  resultKicker: document.querySelector("#resultKicker"),
  resultTitle: document.querySelector("#resultTitle"),
  resultText: document.querySelector("#resultText"),
  restartButton: document.querySelector("#restartButton"),
};

const keys = new Set();
const world = {
  width: 1280,
  height: 720,
  mode: "playing",
  lastTime: 0,
  spawnTimer: 0,
  pulseCooldown: 0,
  dashCooldown: 0,
  cameraShake: 0,
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

let player;
let bugNodes;
let enemies;
let particles;
let bullets;
let bugPickups;
let cleaners;
let boss;
let protocolHazards;
let activeEvent = null;
let nextUpgradeAt = 2;
let chapterState;
let storyState = null;

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

const gameData = window.GameData ?? { eventDeck: [], upgrades: [] };
const bugEvents = gameData.eventDeck;
const upgrades = gameData.upgrades;
const chapterOne = gameData.chapterOne;
const weaponDefinitions = gameData.weapons ?? [];
const weaponUpgrades = gameData.weaponUpgrades ?? [];
const enemyTypes = gameData.enemyTypes ?? {};
const assetSources = {
  andu: "src/assets/characters/andu-sprite.png",
  qiaoYou: "src/assets/characters/qiao-you-sprite.png",
  laoLiang: "src/assets/characters/lao-liang-sprite.png",
  inspector: "src/assets/characters/whitebox-inspector-sprite.png",
  weaponPaperclip: "src/assets/weapons/paperclip-slingshot.png",
  weaponKeyboard: "src/assets/weapons/keyboard-macro-missile.png",
  weaponCorrectionFluid: "src/assets/weapons/correction-fluid-sprayer.png",
  projectilePaperclip: "src/assets/projectiles/paperclip-projectile.png",
  projectileKeycap: "src/assets/projectiles/keycap-projectile.png",
  projectileCorrectionMist: "src/assets/projectiles/correction-fluid-mist.png",
  repairPulse: "src/assets/effects/repair-pulse-ring.png",
  enemyStressFluff: "src/assets/enemies/stress-fluff.png",
  enemyWorkOrderBug: "src/assets/enemies/work-order-bug.png",
  enemyInspectionProbe: "src/assets/enemies/inspection-probe.png",
  enemyPromiseBall: "src/assets/enemies/promise-ball.png",
  enemyQueueSnake: "src/assets/enemies/queue-snake.png",
  enemyStackPile: "src/assets/enemies/stack-pile-monster.png",
  enemyFloatErrorBubble: "src/assets/enemies/floating-point-error-bubble.png",
  bugPoint: "src/assets/items/bug-point.png",
  breakpointBadge: "src/assets/items/breakpoint-badge.png",
  variableBlessingCard: "src/assets/ui/variable-blessing-card.png",
  abilityIntegerPrecision: "src/assets/abilities/integer-precision.png",
  abilityFloatingPointError: "src/assets/abilities/floating-point-error.png",
  abilityArrayBarrage: "src/assets/abilities/array-barrage.png",
  abilityQueueProcessing: "src/assets/abilities/queue-processing.png",
  abilityStackRebound: "src/assets/abilities/stack-rebound.png",
  abilityHashLock: "src/assets/abilities/hash-lock.png",
  propWorkstationA: "src/assets/props/workstation-a.png",
  propWorkstationB: "src/assets/props/workstation-b.png",
  propWorkstationC: "src/assets/props/workstation-c.png",
  propWorkstationD: "src/assets/props/workstation-d.png",
  propWorkstationE: "src/assets/props/workstation-e.png",
  propWorkstationF: "src/assets/props/workstation-f.png",
  propSingleDesk: "src/assets/props/single-desk.png",
  propDeskChair: "src/assets/props/desk-chair.png",
  propOfficeChair: "src/assets/props/office-chair.png",
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
  propMeetingTable: "src/assets/props/meeting-table.png",
};
const storyAvatarSources = {
  安渡: "src/assets/characters/andu-avatar.png",
  乔柚: "src/assets/characters/qiao-you-avatar.png",
  老梁: "src/assets/characters/lao-liang-avatar.png",
  白箱巡检员: "src/assets/characters/whitebox-inspector-avatar.png",
  周行: "src/assets/bosses/delivery-rider-boss-portrait.png",
  andu: "src/assets/characters/andu-avatar.png",
  qiaoYou: "src/assets/characters/qiao-you-avatar.png",
  laoLiang: "src/assets/characters/lao-liang-avatar.png",
  inspector: "src/assets/characters/whitebox-inspector-avatar.png",
  deliveryRider: "src/assets/bosses/delivery-rider-boss-portrait.png",
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

function resetGame() {
  player = { ...playerBase };
  bugNodes = [];
  enemies = [];
  particles = [];
  bullets = [];
  bugPickups = [];
  cleaners = [];
  boss = null;
  protocolHazards = [];
  activeEvent = null;
  nextUpgradeAt = 2;
  chapterState = {
    stepIndex: -1,
    resolvedInStep: 0,
    resolvedTotal: 0,
    allies: [],
    bossCleared: false,
    finished: false,
  };
  world.mode = "playing";
  world.spawnTimer = 0;
  world.pulseCooldown = 0;
  world.dashCooldown = 0;
  world.cameraShake = 0;
  hidePanels();
  storyState = null;
  seedOfficeBugPickups();
  setChapterObjective("调查办公室异常");
  setLog("凌晨 03:32，安渡从键盘上醒来。手机显示：外卖订单已超时 999 分钟。");
  syncHud();
  openWeaponSelect();
}

function createBugNode(x = random(90, world.width - 90), y = random(96, world.height - 86), eventId = null) {
  const event = eventId ? getEventById(eventId) : bugEvents[Math.floor(Math.random() * bugEvents.length)];

  return {
    x,
    y,
    radius: 17,
    pulse: random(0, Math.PI * 2),
    event,
    chapterStep: chapterState?.stepIndex ?? -1,
  };
}

function getEventById(eventId) {
  return bugEvents.find((event) => event.id === eventId) ?? bugEvents[0];
}

function spawnEnemyNear(x, y, type = "stress") {
  const definition = enemyTypes[type] ?? enemyTypes.stress ?? {};
  const speedMin = definition.speedMin ?? 72;
  const speedMax = definition.speedMax ?? speedMin;
  const enemy = {
    x: clamp(x + random(-40, 40), 40, world.width - 40),
    y: clamp(y + random(-40, 40), 80, world.height - 40),
    radius: definition.radius ?? 15,
    hp: definition.hp ?? 55,
    speed: random(speedMin, speedMax),
    damage: definition.damage ?? 10,
    xpValue: definition.xpValue ?? 2,
    bugValue: definition.bugValue ?? 1,
    render: definition.render ?? "emo",
    assetKey: definition.assetKey,
    spriteSize: definition.spriteSize,
    deathColor: definition.deathColor ?? "#ef6a70",
    hitLog: definition.hitLog ?? "异常实体撞上来，报表又多了一页。",
    type,
    hitFlash: 0,
    slowTimer: 0,
    slowFactor: 1,
  };
  if (definition.role === "cleaner" || type === "cleaner") {
    cleaners.push(enemy);
  } else {
    enemies.push(enemy);
  }
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
      chapterState.finished = true;
      endGame(true);
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
  ui.chapterTitle.textContent = chapterOne.title;
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
    button.innerHTML = `${icon}<span class="choice-copy"><span class="choice-title">${weapon.name} · ${weapon.role}</span><span class="choice-effect">${weapon.desc}<br>${weapon.traitText}</span></span>`;
    button.addEventListener("click", () => {
      equipWeapon(weapon);
      ui.storyPanel.classList.add("hidden");
      openStory(chapterOne.opening);
    });
    ui.storyChoices.appendChild(button);
  }

  ui.storyPanel.classList.remove("hidden");
}

function equipWeapon(weapon) {
  player.weapon = { ...JSON.parse(JSON.stringify(weapon)), cooldownLeft: 0, level: 1, shotsFired: 0 };
  setLog(`已装备：${weapon.name}。它会自动攻击最近的异常实体。`);
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
  const seeds = [
    { x: 170, y: 510, xp: 2 },
    { x: 610, y: 126, xp: 2 },
    { x: 704, y: 360, xp: 3 },
    { x: 1160, y: 360, xp: 3 },
    { x: 430, y: 598, xp: 2 },
  ];

  for (const seed of seeds) {
    spawnBugPickup(seed.x, seed.y, 1, seed.xp);
  }
}

function spawnBugPickup(x, y, bugValue = 1, xpValue = 2) {
  bugPickups.push({
    x: x + random(-12, 12),
    y: y + random(-12, 12),
    vx: random(-20, 20),
    vy: random(-20, 20),
    radius: 8,
    pulse: random(0, Math.PI * 2),
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
  const step = chapterOne.steps[stepIndex];
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
  const step = chapterOne.steps[chapterState.stepIndex];
  spawnChapterNodes(step);
}

function spawnChapterNodes(step) {
  const nodes = step.nodes ?? [step.node];
  bugNodes = nodes.map((node) => createBugNode(node.x, node.y, node.eventId));
  world.mode = "playing";
}

function startBossFight() {
  bugNodes = [];
  enemies = enemies.slice(0, 4);
  cleaners = [];
  protocolHazards = [];
  boss = {
    id: "delivery-rider",
    name: "协议骑手·周行",
    x: 1034,
    y: 548,
    radius: 34,
    hp: 1250,
    maxHp: 1250,
    speed: 98,
    damage: 18,
    phase: 1,
    state: "idle",
    stateTimer: 0.85,
    attackCooldown: 0.8,
    hitFlash: 0,
    slowTimer: 0,
    slowFactor: 1,
    dash: null,
    lastRoute: null,
    logTimer: 0,
  };
  chapterState.stepIndex = 4;
  setChapterObjective("打断错误配送协议，救回外卖小哥周行");
  setLog("Boss 战开始：订单被误识别成网络数据包。躲开路线，打掉大件包。");
  world.mode = "playing";
}

function handleChapterEventResolved(removedNode) {
  if (removedNode.chapterStep !== chapterState.stepIndex || chapterState.finished) {
    return false;
  }

  const step = chapterOne.steps[chapterState.stepIndex];
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
  ui.storyPanel.classList.add("hidden");
  ui.storyPanel.classList.remove("has-choices");
  ui.eventPanel.classList.add("hidden");
  ui.upgradePanel.classList.add("hidden");
  ui.resultPanel.classList.add("hidden");
}

function syncHud() {
  ui.hp.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  ui.level.textContent = player.level;
  ui.xp.textContent = `${player.xp}/${player.xpToNext}`;
  ui.bug.textContent = player.bugPoints;
  ui.weapon.textContent = player.weapon ? `${player.weapon.name} Lv.${Math.floor(player.weapon.level)}` : "未选择";
  ui.bug.parentElement.title = player.weapon ? `当前武器：${player.weapon.name}` : "";
  ui.backlash.textContent = `${Math.round(player.backlash)}%`;
  const totalObjectives = chapterOne.totalObjectives ?? 7;
  const bossProgress = chapterState?.bossCleared ? 1 : 0;
  ui.fixed.textContent = `${(chapterState?.resolvedTotal ?? 0) + bossProgress}/${totalObjectives}`;
}

function update(time) {
  const dt = Math.min((time - world.lastTime) / 1000 || 0, 0.033);
  world.lastTime = time;

  if (world.mode === "playing") {
    updatePlaying(dt);
  }

  draw(dt);
  syncHud();
  requestAnimationFrame(update);
}

function updatePlaying(dt) {
  world.spawnTimer += dt;
  world.pulseCooldown = Math.max(0, world.pulseCooldown - dt);
  world.dashCooldown = Math.max(0, world.dashCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  world.cameraShake = Math.max(0, world.cameraShake - dt);

  movePlayer(dt);
  updateWeapon(dt);
  updateBullets(dt);
  updateBoss(dt);
  updateProtocolHazards(dt);
  updateEnemies(dt);
  updateBugPickups(dt);
  if (world.mode !== "playing") {
    return;
  }
  updateParticles(dt);
  checkBugCollision();
  handleActions();
  maybeEscalateBacklash(dt);

  const bossActive = Boolean(boss && boss.hp > 0);
  const spawnEvery = chapterState.stepIndex >= 2 ? 1.75 : 2.6;
  const maxEnemies = chapterState.stepIndex >= 3 ? 18 : 13;
  if (!bossActive && world.spawnTimer > spawnEvery && enemies.length < maxEnemies) {
    world.spawnTimer = 0;
    spawnEnemyWave(chapterState.stepIndex >= 3 ? 3 : 2);
  }

  if (player.hp <= 0) {
    endGame(false);
  }
}

function movePlayer(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    const next = {
      x: player.x + (dx / len) * player.speed * dt,
      y: player.y + (dy / len) * player.speed * dt,
    };
    player.x = clamp(next.x, player.radius, world.width - player.radius);
    player.y = clamp(next.y, 76, world.height - player.radius);
    resolveDeskCollision(player);
  }
}

function handleActions() {
  if ((keys.has(" ") || keys.has("space")) && world.dashCooldown <= 0 && player.bugPoints >= 1) {
    dash();
  }

  if ((keys.has("j") || keys.has("enter")) && world.pulseCooldown <= 0 && player.bugPoints >= player.pulseCost) {
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

function fireWeaponAt(target) {
  const weapon = player.weapon;
  const count = Math.max(1, Math.round(weapon.projectileCount));
  const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
  const spread = weapon.spread ?? 0;
  weapon.shotsFired += 1;
  const trait = weapon.trait;
  const charged = trait?.type === "chargedShot" && weapon.shotsFired % trait.every === 0;

  for (let index = 0; index < count; index += 1) {
    const centered = index - (count - 1) / 2;
    const angle = baseAngle + centered * spread;
    bullets.push({
      x: player.x,
      y: player.y - 8,
      vx: Math.cos(angle) * weapon.bulletSpeed,
      vy: Math.sin(angle) * weapon.bulletSpeed,
      angle,
      radius: weapon.bulletSize + (charged ? trait.bulletSizeAdd : 0),
      damage: weapon.damage * (charged ? trait.damageMultiplier : 1),
      color: charged ? trait.color : weapon.color,
      assetKey: weapon.projectileAssetKey,
      assetWidth: (weapon.projectileWidth ?? 28) + (charged ? 8 : 0),
      assetHeight: (weapon.projectileHeight ?? 28) + (charged ? 5 : 0),
      life: weapon.range / weapon.bulletSpeed,
      pierce: Math.round(weapon.pierce),
      knockback: trait?.type === "knockback" ? trait.force : 0,
      slowFactor: trait?.type === "slowOnHit" ? trait.factor : 1,
      slowDuration: trait?.type === "slowOnHit" ? trait.duration : 0,
      hitTargets: new Set(),
    });
  }
}

function spawnEnemyWave(count = 2) {
  const pool = getEnemySpawnPool();
  for (let index = 0; index < count; index += 1) {
    const side = Math.floor(random(0, 4));
    const type = pool[Math.floor(random(0, pool.length))] ?? "stress";
    let x = random(80, world.width - 80);
    let y = random(100, world.height - 80);
    if (side === 0) y = 92;
    if (side === 1) x = world.width - 64;
    if (side === 2) y = world.height - 42;
    if (side === 3) x = 64;
    spawnEnemyNear(x, y, type);
  }
}

function getEnemySpawnPool() {
  const step = chapterState?.stepIndex ?? 0;
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

function dash() {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;
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
      enemy.hp -= player.pulseDamage;
      enemy.hitFlash = 0.16;
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
}

function updateBullets(dt) {
  for (const bullet of bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;

    const hostiles = [...enemies, ...cleaners];
    if (boss && boss.hp > 0) {
      hostiles.push(boss);
    }
    for (const enemy of hostiles) {
      if (bullet.hitTargets.has(enemy) || distance(bullet, enemy) > bullet.radius + enemy.radius) {
        continue;
      }

      enemy.hp -= bullet.damage;
      enemy.hitFlash = 0.14;
      bullet.hitTargets.add(enemy);
      burst(enemy.x, enemy.y, bullet.color, 7);
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
      burst(hazard.x, hazard.y, bullet.color, 7);
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
  enemies = enemies.filter((enemy) => {
    if (enemy.hp > 0) {
      return true;
    }
    defeatEnemy(enemy, 14);
    return false;
  });
  cleaners = cleaners.filter((enemy) => {
    if (enemy.hp > 0) {
      return true;
    }
    defeatEnemy(enemy, 20);
    return false;
  });
}

function defeatEnemy(enemy, particleCount) {
  burst(enemy.x, enemy.y, enemy.deathColor, particleCount);
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
  if (boss.hp <= boss.maxHp * 0.35) {
    boss.phase = 3;
  } else if (boss.hp <= boss.maxHp * 0.65) {
    boss.phase = 2;
  } else {
    boss.phase = 1;
  }

  if (boss.phase !== previousPhase) {
    const phaseLog = boss.phase === 2 ? "周行的外卖箱开始触发超时重传。" : "错误路线开始 DNS 解析，取餐区变成一张发烫的网。";
    setLog(phaseLog);
    world.cameraShake = 0.2;
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
    damagePlayer(boss.damage, "周行被错误协议拖着冲撞过来：订单必须送达。");
  }

  if (boss.attackCooldown <= 0) {
    chooseBossAttack();
  }
}

function driftBossTowardPlayer(dt) {
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  const desiredDistance = 250;
  const currentDistance = distance(player, boss);
  const direction = currentDistance > desiredDistance ? 1 : -0.35;
  const speed = boss.speed * boss.slowFactor;
  boss.x = clamp(boss.x + Math.cos(angle) * speed * direction * dt, boss.radius, world.width - boss.radius);
  boss.y = clamp(boss.y + Math.sin(angle) * speed * direction * dt, 86, world.height - boss.radius);
  resolveDeskCollision(boss);
}

function chooseBossAttack() {
  const roll = Math.random();

  if (boss.phase === 3 && roll < 0.34) {
    startFtpTransfer();
    return;
  }

  if (boss.phase >= 2 && roll < 0.62) {
    startUdpBurst();
    return;
  }

  if (boss.phase === 3 && roll < 0.84) {
    startDnsError();
    return;
  }

  startTcpHandshake();
}

function startTcpHandshake() {
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  const routeLength = boss.phase >= 2 ? 680 : 580;
  const targetX = clamp(boss.x + Math.cos(angle) * routeLength, 52, world.width - 52);
  const targetY = clamp(boss.y + Math.sin(angle) * routeLength, 92, world.height - 52);
  boss.lastRoute = { x1: boss.x, y1: boss.y, x2: targetX, y2: targetY };
  boss.state = "handshake";
  boss.stateTimer = 1.25;
  boss.attackCooldown = 1.05;
  if (boss.logTimer <= 0) {
    setLog("TCP 三次握手：路线先确认三次，第三次亮起后周行会冲刺。");
    boss.logTimer = 4;
  }
}

function startBossDash() {
  const route = boss.lastRoute;
  boss.state = "dash";
  boss.dash = {
    ...route,
    elapsed: 0,
    duration: boss.phase >= 2 ? 0.36 : 0.44,
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
    damagePlayer(18 + boss.phase * 4, "TCP ACK 已确认，周行沿着错误路线撞了过来。");
  }

  if (t >= 1) {
    if (boss.phase >= 2) {
      addRetransmitRoute(boss.dash);
    }
    boss.state = "idle";
    boss.dash = null;
    boss.attackCooldown = boss.phase === 3 ? 0.55 : 0.88;
  }
}

function addRetransmitRoute(route) {
  protocolHazards.push({
    type: "retransmit",
    x1: route.x1,
    y1: route.y1,
    x2: route.x2,
    y2: route.y2,
    timer: 1.35,
    activeTime: 0.34,
    damaged: false,
  });
}

function startUdpBurst() {
  const count = boss.phase === 3 ? 16 : 11;
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + random(-0.14, 0.14);
    const speed = random(175, boss.phase === 3 ? 300 : 250);
    protocolHazards.push({
      type: "package",
      x: boss.x,
      y: boss.y - 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 12,
      life: 3.1,
      damage: boss.phase === 3 ? 12 : 10,
      color: "#f1c15b",
    });
  }
  boss.attackCooldown = boss.phase === 3 ? 0.9 : 1.2;
  setLog("UDP 乱送模式：外卖包被高速撒出，不确认谁收到了。");
}

function startFtpTransfer() {
  const existingFtp = protocolHazards.some((hazard) => hazard.type === "ftp");
  if (!existingFtp) {
    protocolHazards.push({
      type: "ftp",
      x: 870,
      y: 348,
      radius: 44,
      hp: 230,
      maxHp: 230,
      timer: 4.8,
      destructible: true,
      hitFlash: 0,
    });
    setLog("FTP 大件传输中：打爆中央的大件外卖包，别让它上传完成。");
  }
  boss.attackCooldown = 1.2;
}

function startDnsError() {
  for (let index = 0; index < 5; index += 1) {
    const nearPlayer = index < 2;
    protocolHazards.push({
      type: "dns",
      x: clamp((nearPlayer ? player.x : random(160, world.width - 140)) + random(-90, 90), 58, world.width - 58),
      y: clamp((nearPlayer ? player.y : random(120, world.height - 90)) + random(-70, 70), 98, world.height - 58),
      radius: 44,
      timer: 1.35 + index * 0.1,
      damage: 15,
      triggered: false,
    });
  }
  boss.attackCooldown = 1.0;
  setLog("DNS 地址解析错误：取餐点被翻译到了错误位置。");
}

function updateProtocolHazards(dt) {
  for (const hazard of protocolHazards) {
    if (hazard.type === "package") {
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      hazard.life -= dt;
      if (distance(hazard, player) < hazard.radius + player.radius) {
        hazard.life = 0;
        damagePlayer(hazard.damage, "UDP 外卖包砸在身上，快是快，就是不讲道理。");
      }
    }

    if (hazard.type === "retransmit") {
      hazard.timer -= dt;
      if (hazard.timer <= 0) {
        hazard.activeTime -= dt;
        if (!hazard.damaged && distancePointToSegment(player, hazard) < player.radius + 18) {
          hazard.damaged = true;
          damagePlayer(16, "超时重传影子沿旧路线补送了一次。");
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
        if (distance(hazard, player) < 190) {
          damagePlayer(20, "FTP 大件上传完成，整片取餐区被热汤数据炸开。");
        } else {
          setLog("FTP 大件上传完成，新的异常从外卖箱里爬了出来。");
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
          damagePlayer(hazard.damage, "DNS 解析错位，外卖炸弹落在了你的坐标上。");
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
      setLog("FTP 大件包被提前打断，传输队列少了一大截。");
      return false;
    }

    return !hazard.remove;
  });
}

function checkBossDefeat() {
  if (!boss || boss.hp > 0 || boss.defeated) {
    return;
  }

  boss.defeated = true;
  chapterState.bossCleared = true;
  protocolHazards = [];
  enemies = [];
  cleaners = [];
  burst(boss.x, boss.y, "#5de2d1", 48);
  boss = null;
  world.cameraShake = 0.28;
  openStory(chapterOne.bossVictory);
}

function damagePlayer(amount, message) {
  if (player.invulnerable > 0 || world.mode !== "playing") {
    return false;
  }

  player.hp -= amount;
  player.invulnerable = 0.55;
  world.cameraShake = 0.18;
  burst(player.x, player.y, "#ef6a70", 10);
  setLog(message);
  return true;
}

function updateEnemies(dt) {
  for (const enemy of [...enemies, ...cleaners]) {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
    if (enemy.slowTimer <= 0) {
      enemy.slowFactor = 1;
    }
    const speed = enemy.speed * enemy.slowFactor;
    enemy.x += Math.cos(angle) * speed * dt;
    enemy.y += Math.sin(angle) * speed * dt;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    resolveDeskCollision(enemy);

    if (distance(enemy, player) < enemy.radius + player.radius && player.invulnerable <= 0) {
      damagePlayer(enemy.damage, enemy.hitLog);
    }
  }
}

function updateBugPickups(dt) {
  for (const pickup of bugPickups) {
    pickup.pulse += dt * 4;
    const pullDistance = distance(pickup, player);
    if (pullDistance < 130) {
      const angle = Math.atan2(player.y - pickup.y, player.x - pickup.x);
      pickup.vx += Math.cos(angle) * 360 * dt;
      pickup.vy += Math.sin(angle) * 360 * dt;
    }
    pickup.x += pickup.vx * dt;
    pickup.y += pickup.vy * dt;
    pickup.vx *= 0.92;
    pickup.vy *= 0.92;
  }

  bugPickups = bugPickups.filter((pickup) => {
    if (distance(pickup, player) > pickup.radius + player.radius + 4) {
      return true;
    }
    player.bugPoints += pickup.bugValue;
    addExperience(pickup.xpValue);
    burst(pickup.x, pickup.y, "#0f9f95", 10);
    setLog(`拾取 bug 点：经验 +${pickup.xpValue}，bug点数 +${pickup.bugValue}。`);
    return false;
  });
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
    if (distance(player, node) < player.radius + node.radius + 10) {
      activeEvent = { ...node.event, index };
      openEvent(activeEvent);
      break;
    }
  }
}

function openEvent(event) {
  world.mode = "event";
  ui.eventKicker.textContent = event.kicker;
  ui.eventTitle.textContent = event.title;
  ui.eventText.textContent = event.text;
  ui.eventChoices.innerHTML = "";

  for (const choice of event.choices) {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.disabled = choiceIsDisabled(choice);
    button.innerHTML = `<span class="choice-title">${choice.title}</span><span class="choice-effect">${choice.effect}</span>`;
    button.addEventListener("click", () => resolveEvent(choice));
    ui.eventChoices.appendChild(button);
  }

  ui.eventPanel.classList.remove("hidden");
}

function resolveEvent(choice) {
  applyActions(choice.actions);
  const removed = bugNodes.splice(activeEvent.index, 1)[0];
  burst(removed.x, removed.y, removed.event.color, 28);
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
  ui.upgradeChoices.innerHTML = "";
  player.pendingLevelUps = Math.max(0, player.pendingLevelUps - 1);
  const generalPool = [...upgrades].sort(() => Math.random() - 0.5).slice(0, 1);
  const weaponPool = [...weaponUpgrades].sort(() => Math.random() - 0.5).slice(0, 2);
  const pool = [...weaponPool, ...generalPool].sort(() => Math.random() - 0.5).map(rollBoon);

  for (const upgrade of pool) {
    const button = document.createElement("button");
    button.className = "choice-button with-media upgrade-card-choice";
    const icon = upgrade.iconKey ? `<img class="choice-icon ability-icon" src="${assetUrl(upgrade.iconKey)}" alt="" />` : "";
    button.innerHTML = `${icon}<span class="choice-copy"><span class="choice-title">${upgrade.title}<span class="choice-rarity">${upgrade.rarity.name}</span></span><span class="choice-effect">${upgrade.effect}</span></span>`;
    button.addEventListener("click", () => {
      applyActions(upgrade.actions);
      ui.upgradePanel.classList.add("hidden");
      setLog(`选择了${upgrade.rarity.name}强化：${upgrade.title}。`);
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

function endGame(victory) {
  world.mode = "result";
  ui.resultKicker.textContent = victory ? "今日存活" : "今日重置";
  ui.resultTitle.textContent = victory ? "第一个异常夜班被你扛过去了" : "安渡被移出当前巡检版本";
  ui.resultText.textContent = victory
    ? "公共规则引擎没有恢复正常，但它承认你暂时有资格继续上班。"
    : "bug点数散落在工位缝里，白箱巡检员把凌晨重新归档为凌晨。";
  ui.resultPanel.classList.remove("hidden");
}

function draw(dt) {
  const shakeX = world.cameraShake > 0 ? random(-5, 5) : 0;
  const shakeY = world.cameraShake > 0 ? random(-5, 5) : 0;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(shakeX, shakeY);
  drawOffice();
  drawBugNodes(dt);
  drawBugPickups();
  drawProtocolHazards();
  drawBullets();
  drawEnemies();
  drawBoss();
  drawAllies();
  drawPlayer();
  drawParticles();
  drawBossHud();
  ctx.restore();
}

function drawOffice() {
  ctx.fillStyle = "#f8fbff";
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = "rgba(58, 83, 112, 0.075)";
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

  ctx.fillStyle = "#e8f1fa";
  ctx.fillRect(0, 0, world.width, 68);
  ctx.fillStyle = "#c8d8e8";
  ctx.fillRect(0, 66, world.width, 3);
  drawWindowRow(32, 14, 4);
  drawWindowRow(788, 14, 3);
  drawWhiteboard(386, 14, 170, 38);
  drawWaterCooler(628, 94);
  drawCopier(1116, 96);
  drawPlant(52, 96, 1);
  drawPlant(1196, 602, 1.1);
  drawPlant(650, 622, 0.85);

  for (const desk of desks) {
    drawDesk(desk);
  }

  drawMeetingTable(750, 262);
  drawServerRoomDoor(738, 388);
  drawPrinter(1034, 526);
  drawDeliveryPickupZone(940, 558);

  if ((chapterState?.stepIndex ?? -1) >= 3 || player.fixed >= 3) {
    drawLaoLiangSprite(1080, 118, 0.88);
    drawLabel("老梁", 1062, 84, "#9a6615");
  }

  if (!drawPropAsset("propSingleDesk", 34, 586, 210, 124)) {
    ctx.fillStyle = "#d8e4f0";
    ctx.fillRect(34, 618, 206, 50);
    ctx.fillStyle = "#0f9f95";
    ctx.globalAlpha = 0.18;
    ctx.fillRect(44, 628, 186, 30);
    ctx.globalAlpha = 1;
  }
  drawLabel("安渡工位", 78, 650, "#224250");
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
  drawLabel("外卖取餐区", x - 8, y + 80, "#9a6615");
  ctx.restore();
}

function drawDesk(desk) {
  if (desk.assetKey) {
    const width = desk.w + 42;
    const height = desk.h + 82;
    const x = desk.x - 20;
    const y = desk.y - 22;
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
    const assetKey = getBugNodeAssetKey(node);
    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.fillStyle = node.event.color;
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
      drawCenteredAsset(assetKey, 0, 0, 42 + glow, 42 + glow);
    }
    ctx.restore();
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
    ctx.save();
    ctx.translate(pickup.x, pickup.y);
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
    drawCenteredAsset("bugPoint", 0, 0, 26 + glow * 1.4, 26 + glow * 1.4);
    ctx.restore();
  }
}

function drawBullets() {
  for (const bullet of bullets) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    if (drawRotatedAsset(bullet.assetKey, 0, 0, bullet.assetWidth, bullet.assetHeight, bullet.angle)) {
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
    drawProtocolRoute(boss.lastRoute, "#5de2d1", pulse, 5, true);
    drawProtocolRoute(offsetRoute(boss.lastRoute, 11), "#72a5ff", 0.36, 3, true);
    drawProtocolRoute(offsetRoute(boss.lastRoute, -11), "#f1c15b", 0.3, 3, true);
  }

  for (const hazard of protocolHazards) {
    if (hazard.type === "retransmit") {
      const armed = hazard.timer <= 0;
      drawProtocolRoute(hazard, armed ? "#ef6a70" : "#f1c15b", armed ? 0.72 : 0.34, armed ? 8 : 4, !armed);
    }

    if (hazard.type === "package") {
      drawDeliveryPackage(hazard.x, hazard.y, hazard.radius, hazard.color);
    }

    if (hazard.type === "ftp") {
      drawFtpPackage(hazard);
    }

    if (hazard.type === "dns") {
      drawDnsMarker(hazard);
    }
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

function drawDeliveryPackage(x, y, radius, color = "#f1c15b") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(performance.now() / 180 + x) * 0.18);
  drawPixelShadow(0, radius + 5, radius * 2.2, 8);
  rect(-radius, -radius * 0.72, radius * 2, radius * 1.44, "#f6d28a");
  rect(-radius, -radius * 0.72, radius * 2, 5, "#c98416");
  rect(-3, -radius * 0.72, 6, radius * 1.44, color);
  rect(-radius + 4, 2, radius * 0.7, 4, "#9a6615");
  ctx.restore();
}

function drawFtpPackage(hazard) {
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  const flash = hazard.hitFlash > 0 ? "#ffffff" : "#f1c15b";
  drawPixelShadow(0, 40, 86, 16);
  rect(-42, -34, 84, 68, flash);
  rect(-42, -34, 84, 12, "#c98416");
  rect(-6, -34, 12, 68, "#72a5ff");
  rect(-28, -2, 56, 8, "#9a6615");
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
  ctx.save();
  const progress = clamp(hazard.timer / 1.9, 0, 1);
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

function drawEnemies() {
  for (const enemy of enemies) {
    drawEnemy(enemy);
  }
  for (const cleaner of cleaners) {
    drawEnemy(cleaner);
    ctx.strokeStyle = "#72a5ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cleaner.x, cleaner.y, cleaner.radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawBoss() {
  if (!boss || boss.hp <= 0) {
    return;
  }

  drawDeliveryRiderBoss(boss.x, boss.y, 1, boss.hitFlash > 0);
}

function drawBossHud() {
  if (!boss || boss.hp <= 0) {
    return;
  }

  const width = 420;
  const x = world.width / 2 - width / 2;
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
  ctx.fillStyle = boss.phase === 3 ? "#ef6a70" : boss.phase === 2 ? "#f1c15b" : "#5de2d1";
  ctx.fillRect(x, y + 4, width * clamp(boss.hp / boss.maxHp, 0, 1), 12);
  ctx.restore();
}

function drawAllies() {
  if (!chapterState.allies.includes("qiao-you")) {
    return;
  }

  const bob = Math.sin(performance.now() / 240) * 3;
  const x = clamp(player.x - 42, 24, world.width - 24);
  const y = clamp(player.y + 28 + bob, 88, world.height - 24);

  if (!drawSpriteAsset("qiaoYou", x, y, 76, 76)) {
    drawQiaoYouSprite(x, y, 0.74);
  }

  drawLabel("乔柚", x - 14, y - 33, "#ffd7ea");
}

function drawPropAsset(key, x, y, width, height) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  ctx.drawImage(asset.image, x, y, width, height);
  return true;
}

function drawCenteredAsset(key, x, y, width, height, shadow = true) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  ctx.save();
  if (shadow) {
    drawPixelShadow(x, y + height * 0.28, width * 0.48, 8);
  }
  ctx.drawImage(asset.image, x - width / 2, y - height / 2, width, height);
  ctx.restore();
  return true;
}

function drawRotatedAsset(key, x, y, width, height, angle = 0) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  ctx.save();
  ctx.rotate(angle);
  ctx.drawImage(asset.image, x - width / 2, y - height / 2, width, height);
  ctx.restore();
  return true;
}

function drawSpriteAsset(key, x, y, width, height) {
  const asset = assets[key];
  if (!asset?.ready) {
    return false;
  }

  ctx.save();
  drawPixelShadow(x, y + height * 0.32, width * 0.54, 10);
  ctx.drawImage(asset.image, x - width / 2, y - height * 0.68, width, height);
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
  const drawn = drawSpriteAsset(enemy.assetKey, enemy.x, enemy.y, size, size);
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
  if (!drawSpriteAsset("andu", player.x, player.y, 78, 78)) {
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
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
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
  for (const desk of desks) {
    const nearestX = clamp(entity.x, desk.x, desk.x + desk.w);
    const nearestY = clamp(entity.y, desk.y, desk.y + desk.h);
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

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

ui.restartButton.addEventListener("click", resetGame);
ui.storyPanel.addEventListener("click", (event) => {
  if (event.target.closest("button")) {
    return;
  }
  advanceStory();
});

resetGame();
requestAnimationFrame(update);

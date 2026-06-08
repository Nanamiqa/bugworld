const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const ui = {
  hp: document.querySelector("#hpValue"),
  bug: document.querySelector("#bugValue"),
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
let cleaners;
let activeEvent = null;
let nextUpgradeAt = 2;
let chapterState;

const desks = [
  { x: 84, y: 104, w: 136, h: 54, tag: "Q3报表" },
  { x: 278, y: 104, w: 136, h: 54, tag: "需求池" },
  { x: 472, y: 104, w: 136, h: 54, tag: "灰度" },
  { x: 84, y: 236, w: 136, h: 54, tag: "咖啡" },
  { x: 278, y: 236, w: 136, h: 54, tag: "工单" },
  { x: 472, y: 236, w: 136, h: 54, tag: "弹幕" },
  { x: 742, y: 132, w: 210, h: 74, tag: "会议室" },
  { x: 1006, y: 132, w: 152, h: 74, tag: "老板室" },
  { x: 742, y: 420, w: 416, h: 78, tag: "0号服务器间" },
];

const gameData = window.GameData ?? { eventDeck: [], upgrades: [] };
const bugEvents = gameData.eventDeck;
const upgrades = gameData.upgrades;
const chapterOne = gameData.chapterOne;
const weaponDefinitions = [
  {
    id: "paperclip",
    name: "回形针弹弓",
    desc: "单发高速，适合点掉追击中的异常。",
    color: "#5de2d1",
    damage: 28,
    cooldown: 0.34,
    bulletSpeed: 620,
    range: 560,
    projectileCount: 1,
    spread: 0,
    bulletSize: 4,
    pierce: 0,
  },
  {
    id: "keyboard",
    name: "键盘宏飞弹",
    desc: "一次打出三枚按键弹，覆盖面更稳。",
    color: "#72a5ff",
    damage: 18,
    cooldown: 0.46,
    bulletSpeed: 520,
    range: 480,
    projectileCount: 3,
    spread: 0.22,
    bulletSize: 4,
    pierce: 0,
  },
  {
    id: "correction-fluid",
    name: "修正液喷枪",
    desc: "近距离高频净化，压住贴脸的小怪。",
    color: "#f7b4d8",
    damage: 12,
    cooldown: 0.16,
    bulletSpeed: 430,
    range: 310,
    projectileCount: 2,
    spread: 0.18,
    bulletSize: 5,
    pierce: 0,
  },
];
const weaponUpgrades = [
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
];

function resetGame() {
  player = { ...playerBase };
  bugNodes = [];
  enemies = [];
  particles = [];
  bullets = [];
  cleaners = [];
  activeEvent = null;
  nextUpgradeAt = 2;
  chapterState = {
    stepIndex: -1,
    resolvedInStep: 0,
    resolvedTotal: 0,
    allies: [],
    finished: false,
  };
  world.mode = "playing";
  world.spawnTimer = 0;
  world.pulseCooldown = 0;
  world.dashCooldown = 0;
  world.cameraShake = 0;
  hidePanels();
  setChapterObjective("调查办公室异常");
  setLog("凌晨 03:32，安渡从键盘上醒来。先从抽屉里摸一件趁手工具。");
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
  const enemy = {
    x: clamp(x + random(-40, 40), 40, world.width - 40),
    y: clamp(y + random(-40, 40), 80, world.height - 40),
    radius: type === "cleaner" ? 24 : 15,
    hp: type === "cleaner" ? 130 : 55,
    speed: type === "cleaner" ? 112 : random(72, 98),
    type,
    hitFlash: 0,
  };
  if (type === "cleaner") {
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
  ui.storySpeaker.textContent = "系统弹窗";
  ui.storyTitle.textContent = "选择初始武器";
  ui.storyText.textContent = "变量城的夜间异常已经开始显形。安渡从抽屉里摸出一件工具，决定先活过这个凌晨。武器会自动锁定最近的异常实体发射子弹。";
  ui.storyChoices.innerHTML = "";

  for (const weapon of weaponDefinitions) {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.innerHTML = `<span class="choice-title">${weapon.name}</span><span class="choice-effect">${weapon.desc}</span>`;
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
  player.weapon = { ...weapon, cooldownLeft: 0, level: 1 };
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

function openStory(story) {
  world.mode = "story";
  ui.storySpeaker.textContent = story.speaker;
  ui.storyTitle.textContent = story.title;
  ui.storyText.textContent = story.text;
  ui.storyChoices.innerHTML = "";

  for (const choice of story.choices) {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.innerHTML = `<span class="choice-title">${choice.title}</span><span class="choice-effect">${choice.effect}</span>`;
    button.addEventListener("click", () => {
      ui.storyPanel.classList.add("hidden");
      applyActions(choice.actions);
    });
    ui.storyChoices.appendChild(button);
  }

  ui.storyPanel.classList.remove("hidden");
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
  ui.eventPanel.classList.add("hidden");
  ui.upgradePanel.classList.add("hidden");
  ui.resultPanel.classList.add("hidden");
}

function syncHud() {
  ui.hp.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  ui.bug.textContent = player.bugPoints;
  ui.bug.parentElement.title = player.weapon ? `当前武器：${player.weapon.name}` : "";
  ui.backlash.textContent = `${Math.round(player.backlash)}%`;
  ui.fixed.textContent = `${chapterState?.resolvedTotal ?? 0}/7`;
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
  updateEnemies(dt);
  updateParticles(dt);
  checkBugCollision();
  handleActions();
  maybeEscalateBacklash(dt);

  if (world.spawnTimer > 6.8 && enemies.length < 6) {
    world.spawnTimer = 0;
    spawnEnemyNear(random(80, world.width - 80), random(100, world.height - 80));
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
  for (const enemy of [...enemies, ...cleaners]) {
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

  for (let index = 0; index < count; index += 1) {
    const centered = index - (count - 1) / 2;
    const angle = baseAngle + centered * spread;
    bullets.push({
      x: player.x,
      y: player.y - 8,
      vx: Math.cos(angle) * weapon.bulletSpeed,
      vy: Math.sin(angle) * weapon.bulletSpeed,
      radius: weapon.bulletSize,
      damage: weapon.damage,
      color: weapon.color,
      life: weapon.range / weapon.bulletSpeed,
      pierce: Math.round(weapon.pierce),
      hitTargets: new Set(),
    });
  }
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
  for (const enemy of allHostiles) {
    if (distance(enemy, player) <= player.pulseRadius + enemy.radius) {
      enemy.hp -= player.pulseDamage;
      enemy.hitFlash = 0.16;
    }
  }
  enemies = enemies.filter((enemy) => enemy.hp > 0);
  cleaners = cleaners.filter((enemy) => enemy.hp > 0);
  setLog("安渡把错误码拍成了一圈蓝色涟漪。");
}

function updateBullets(dt) {
  for (const bullet of bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;

    const hostiles = [...enemies, ...cleaners];
    for (const enemy of hostiles) {
      if (bullet.hitTargets.has(enemy) || distance(bullet, enemy) > bullet.radius + enemy.radius) {
        continue;
      }

      enemy.hp -= bullet.damage;
      enemy.hitFlash = 0.14;
      bullet.hitTargets.add(enemy);
      burst(enemy.x, enemy.y, bullet.color, 7);

      if (bullet.pierce <= 0) {
        bullet.life = 0;
        break;
      }
      bullet.pierce -= 1;
    }
  }

  enemies = enemies.filter((enemy) => {
    if (enemy.hp > 0) {
      return true;
    }
    burst(enemy.x, enemy.y, "#ef6a70", 14);
    return false;
  });
  cleaners = cleaners.filter((enemy) => {
    if (enemy.hp > 0) {
      return true;
    }
    burst(enemy.x, enemy.y, "#72a5ff", 20);
    return false;
  });
  bullets = bullets.filter((bullet) => {
    return bullet.life > 0 && bullet.x > -40 && bullet.x < world.width + 40 && bullet.y > 40 && bullet.y < world.height + 40;
  });
}

function updateEnemies(dt) {
  for (const enemy of [...enemies, ...cleaners]) {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    resolveDeskCollision(enemy);

    if (distance(enemy, player) < enemy.radius + player.radius && player.invulnerable <= 0) {
      const damage = enemy.type === "cleaner" ? 24 : 10;
      player.hp -= damage;
      player.invulnerable = 0.55;
      world.cameraShake = 0.18;
      burst(player.x, player.y, "#ef6a70", 10);
      setLog(enemy.type === "cleaner" ? "白箱巡检员擦掉了你的一段状态。" : "压力实体撞上来，报表又多了一页。");
    }
  }
}

function maybeEscalateBacklash(dt) {
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
  activeEvent = null;
  ui.eventPanel.classList.add("hidden");

  const chapterAdvanced = handleChapterEventResolved(removed);
  if (chapterAdvanced) {
    return;
  }

  if (player.fixed >= nextUpgradeAt) {
    openUpgrade();
    nextUpgradeAt += 2;
  } else {
    resumeAndSpawnBug();
  }
}

function openUpgrade() {
  world.mode = "upgrade";
  ui.upgradeChoices.innerHTML = "";
  const generalPool = [...upgrades].sort(() => Math.random() - 0.5).slice(0, 2);
  const weaponPool = [...weaponUpgrades].sort(() => Math.random() - 0.5).slice(0, 1);
  const pool = [...weaponPool, ...generalPool].sort(() => Math.random() - 0.5);

  for (const upgrade of pool) {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.innerHTML = `<span class="choice-title">${upgrade.title}</span><span class="choice-effect">${upgrade.effect}</span>`;
    button.addEventListener("click", () => {
      applyActions(upgrade.actions);
      ui.upgradePanel.classList.add("hidden");
      resumeAndSpawnBug();
    });
    ui.upgradeChoices.appendChild(button);
  }

  ui.upgradePanel.classList.remove("hidden");
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
  drawBullets();
  drawEnemies();
  drawAllies();
  drawPlayer();
  drawParticles();
  ctx.restore();
}

function drawOffice() {
  ctx.fillStyle = "#181a20";
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = "rgba(255,255,255,0.055)";
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

  ctx.fillStyle = "#222934";
  ctx.fillRect(0, 0, world.width, 68);
  ctx.fillStyle = "#2f3642";
  ctx.fillRect(32, 24, 170, 18);
  ctx.fillRect(240, 24, 110, 18);
  ctx.fillRect(386, 24, 138, 18);
  ctx.fillStyle = "#3d434f";
  ctx.fillRect(1120, 16, 118, 30);

  for (const desk of desks) {
    drawDesk(desk);
  }

  if ((chapterState?.stepIndex ?? -1) >= 3 || player.fixed >= 3) {
    drawLaoLiangSprite(1080, 118, 0.88);
    drawLabel("老梁", 1062, 84, "#f1c15b");
  }

  ctx.fillStyle = "#26333a";
  ctx.fillRect(34, 618, 206, 50);
  ctx.fillStyle = "#5de2d1";
  ctx.globalAlpha = 0.18;
  ctx.fillRect(44, 628, 186, 30);
  ctx.globalAlpha = 1;
  drawLabel("安渡工位", 78, 650, "#dbe8e6");
}

function drawDesk(desk) {
  ctx.fillStyle = "#2c3038";
  ctx.fillRect(desk.x, desk.y, desk.w, desk.h);
  ctx.fillStyle = "#3a414c";
  ctx.fillRect(desk.x + 8, desk.y + 8, desk.w - 16, 8);
  ctx.fillStyle = "#20242c";
  ctx.fillRect(desk.x + 14, desk.y + 24, 34, 16);
  ctx.fillRect(desk.x + desk.w - 50, desk.y + 24, 34, 16);
  drawLabel(desk.tag, desk.x + 12, desk.y + desk.h - 10, "#9aa5b1");
}

function drawBugNodes(dt) {
  for (const node of bugNodes) {
    node.pulse += dt * 3;
    const glow = 5 + Math.sin(node.pulse) * 3;
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
    ctx.restore();
  }
}

function drawBullets() {
  for (const bullet of bullets) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
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

function drawEnemies() {
  for (const enemy of enemies) {
    drawEnemy(enemy);
  }
  for (const cleaner of cleaners) {
  drawPatrolSprite(cleaner.x, cleaner.y, 0.82, cleaner.hitFlash > 0);
    ctx.strokeStyle = "#72a5ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cleaner.x, cleaner.y, cleaner.radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawAllies() {
  if (!chapterState.allies.includes("qiao-you")) {
    return;
  }

  const bob = Math.sin(performance.now() / 240) * 3;
  const x = clamp(player.x - 42, 24, world.width - 24);
  const y = clamp(player.y + 28 + bob, 88, world.height - 24);

  drawQiaoYouSprite(x, y, 0.74);

  drawLabel("乔柚", x - 14, y - 33, "#ffd7ea");
}

function drawEnemy(enemy) {
  if (enemy.type === "deadline") {
    drawDeadlineBug(enemy.x, enemy.y, 0.76, enemy.hitFlash > 0);
    return;
  }

  drawEmoFluff(enemy.x, enemy.y, 0.78, enemy.hitFlash > 0);
}

function drawPlayer() {
  ctx.save();
  if (player.invulnerable > 0) {
    ctx.globalAlpha = 0.62 + Math.sin(performance.now() / 45) * 0.25;
  }
  drawAnduSprite(player.x, player.y, 0.82);
  ctx.restore();

  if (world.pulseCooldown > 0.38) {
    ctx.strokeStyle = "rgba(114, 165, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.pulseRadius * (1 - world.pulseCooldown / 0.55), 0, Math.PI * 2);
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

function drawPatrolSprite(x, y, scale = 1, hitFlash = false) {
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

resetGame();
requestAnimationFrame(update);

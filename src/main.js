const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

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
  { x: 742, y: 420, w: 416, h: 78, tag: "归零机房" },
];

const gameData = window.GameData ?? { eventDeck: [], upgrades: [] };
const bugEvents = gameData.eventDeck;
const upgrades = gameData.upgrades;
const chapterOne = gameData.chapterOne;

function resetGame() {
  player = { ...playerBase };
  bugNodes = [];
  enemies = [];
  particles = [];
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
  setLog("凌晨 03:32，林野从键盘上醒来。");
  syncHud();
  openStory(chapterOne.opening);
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
  setLog("林野把错误码拍成了一圈蓝色涟漪。");
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
      setLog(enemy.type === "cleaner" ? "程序清洁工擦掉了你的一段状态。" : "压力实体撞上来，报表又多了一页。");
    }
  }
}

function maybeEscalateBacklash(dt) {
  const cleanerCanAppear = chapterState.finished || chapterState.stepIndex >= 3;
  if (cleanerCanAppear && player.backlash >= 75 && cleaners.length === 0) {
    spawnEnemyNear(world.width - 110, 96, "cleaner");
    setLog("程序清洁工上线，正在清理异常变量：林野。");
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
  const pool = [...upgrades].sort(() => Math.random() - 0.5).slice(0, 3);

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
  ui.resultKicker.textContent = victory ? "今日存活" : "今日归零";
  ui.resultTitle.textContent = victory ? "第一个异常日被你扛过去了" : "林野被清理出当前版本";
  ui.resultText.textContent = victory
    ? "世界程序没有恢复正常，但它承认你暂时有资格继续上班。"
    : "bug点数散落在工位缝里，清洁工把凌晨重新擦回了凌晨。";
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

  ctx.fillStyle = "#26333a";
  ctx.fillRect(34, 618, 206, 50);
  ctx.fillStyle = "#5de2d1";
  ctx.globalAlpha = 0.18;
  ctx.fillRect(44, 628, 186, 30);
  ctx.globalAlpha = 1;
  drawLabel("林野工位", 78, 650, "#dbe8e6");
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

function drawEnemies() {
  for (const enemy of enemies) {
    drawEnemy(enemy, "#ef6a70", "#581f28");
  }
  for (const cleaner of cleaners) {
    drawEnemy(cleaner, "#f6f1e7", "#283242");
    ctx.strokeStyle = "#72a5ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cleaner.x, cleaner.y, cleaner.radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawAllies() {
  if (!chapterState.allies.includes("chen-yuyuan")) {
    return;
  }

  const bob = Math.sin(performance.now() / 240) * 3;
  const x = clamp(player.x - 42, 24, world.width - 24);
  const y = clamp(player.y + 28 + bob, 88, world.height - 24);

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#f7b4d8";
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b2431";
  ctx.fillRect(-8, -5, 16, 10);
  ctx.strokeStyle = "rgba(247, 180, 216, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawLabel("陈芋圆", x - 19, y - 24, "#ffd7ea");
}

function drawEnemy(enemy, fill, core) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : fill;
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = core;
  ctx.fillRect(-enemy.radius * 0.45, -enemy.radius * 0.25, enemy.radius * 0.9, enemy.radius * 0.5);
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.invulnerable > 0) {
    ctx.globalAlpha = 0.62 + Math.sin(performance.now() / 45) * 0.25;
  }

  ctx.fillStyle = "#5de2d1";
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#101115";
  ctx.fillRect(-9, -6, 18, 12);
  ctx.fillStyle = "#f1c15b";
  ctx.fillRect(-3, -23, 6, 12);
  ctx.restore();

  if (world.pulseCooldown > 0.38) {
    ctx.strokeStyle = "rgba(114, 165, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.pulseRadius * (1 - world.pulseCooldown / 0.55), 0, Math.PI * 2);
    ctx.stroke();
  }
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


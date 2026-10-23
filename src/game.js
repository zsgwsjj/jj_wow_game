/* =========================================================
   艾泽拉斯：裂隙远征 — 核心状态 / 流程 / 角色成长
   ========================================================= */
(function () {
  'use strict';

  const D = window.GameData;
  const R = window.RIFT = {};
  R.W = 640;
  R.H = 360;
  R.D = D;
  R.balance = D.BALANCE;

  // ---------- 工具 ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const len = (x, y) => Math.hypot(x, y);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angleDiff = (a, b) => {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const formatTime = (sec) => {
    sec = Math.max(0, Math.floor(sec));
    return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  };
  R.clamp = clamp; R.lerp = lerp; R.len = len; R.dist = dist; R.angleDiff = angleDiff;
  R.rand = rand; R.pick = pick; R.formatTime = formatTime;

  R.safeGet = (k, fallback) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  };
  R.safeSet = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ }
  };

  // ---------- 元素 ----------
  const $ = (id) => document.getElementById(id);
  R.UI = {
    shell: $('game-shell'),
    canvas: $('game'),
    hud: $('hud'),
    title: $('title-screen'),
    startBtn: $('start-btn'),
    startBtnText: $('start-btn-text'),
    classCards: Array.from(document.querySelectorAll('.class-card')),
    hudPortrait: $('hud-portrait'),
    hudCrest: $('hud-crest'),
    hudTitle: $('hud-title'),
    hudClassName: $('hud-class-name'),
    hudRole: $('hud-role'),
    hudLevel: $('hud-level'),
    hpFill: $('hp-fill'), hpText: $('hp-text'),
    resourceFill: $('resource-fill'), resourceText: $('resource-text'),
    resourceBar: document.querySelector('.resource-bar'),
    xpFill: $('xp-fill'), xpText: $('xp-text'),
    shieldBadge: $('shield-badge'), shieldValue: $('shield-value'),
    buffRow: $('buff-row'),
    dungeonIndex: $('dungeon-index'), dungeonName: $('dungeon-name'),
    dungeonPanel: $('dungeon-panel'),
    objective: $('objective'), wavePips: $('wave-pips'),
    kills: $('kills'), chests: $('chests'),
    musicBtn: $('music-btn'), pauseBtn: $('pause-btn'),
    autoAttackBtn: $('auto-attack-btn'),
    bossPanel: $('boss-panel'), bossName: $('boss-name'), bossSubtitle: $('boss-subtitle'),
    bossPortrait: $('boss-portrait'),
    bossFill: $('boss-fill'), bossCast: $('boss-cast'), bossCastFill: $('boss-cast-fill'), bossCastText: $('boss-cast-text'),
    bossCastIcon: $('boss-cast-icon'),
    minimap: $('minimap'),
    waveAnnounce: $('wave-announce'),
    toastLayer: $('toast-layer'),
    abilityBar: $('ability-bar'), basicSlot: $('basic-slot'), abilitySlots: $('ability-slots'),
    passiveBar: $('passive-bar'), passiveRow: $('passive-row'), passiveLabel: $('passive-label'),
    hint: document.querySelector('.hint-bar'),
    stageBanner: $('stage-banner'),
    stageBannerIndex: $('stage-banner-index'),
    stageBannerName: $('stage-banner-name'),
    stageBannerSub: $('stage-banner-sub'),
    stageBannerObjective: $('stage-banner-objective'),
    stageBossPortrait: $('stage-boss-portrait'),
    cardScreen: $('card-screen'),
    choiceCards: $('choice-cards'),
    choiceEmblem: $('choice-emblem'),
    choiceKicker: $('choice-kicker'),
    choiceSubtitle: $('choice-subtitle'),
    choiceFooterLabel: $('choice-footer-label'),
    cardTitle: $('card-title'),
    activeCount: $('active-count'),
    pauseScreen: $('pause-screen'),
    pauseBuild: $('pause-build'),
    endScreen: $('end-screen'),
    endClassCrest: $('end-class-crest'),
    endKicker: $('end-kicker'), endTitle: $('end-title'), endSubtitle: $('end-subtitle'),
    endStats: $('end-stats'), endRecord: $('end-record'), endSigil: $('end-sigil'),
    retryBtn: $('retry-btn'), endTitleBtn: $('end-title-btn'),
    tooltip: $('tooltip'),
    damageFlash: $('damage-flash'),
    touchHint: $('touch-hint')
  };
  R.ctx = R.UI.canvas.getContext('2d');
  R.ctx.imageSmoothingEnabled = false;
  R.minimapCtx = R.UI.minimap.getContext('2d');
  R.minimapCtx.imageSmoothingEnabled = false;

  // ---------- 输入 ----------
  R.input = {
    keys: new Set(),
    mouse: { x: R.W / 2, y: R.H / 2, worldX: 0, worldY: 0, down: false },
    justPressed: new Set(),
    autoAttack: true
  };
  R.selectedClass = null;
  R.record = R.safeGet('riftRecord', { bestStage: 0, bestLevel: 0, clears: 0, runs: 0 });

  // ---------- 游戏状态 ----------
  R.game = {
    mode: 'title',
    classId: null,
    cls: null,
    player: null,
    stageIndex: 0,
    dungeon: null,
    worldW: 1120,
    worldH: 680,
    arenaCanvas: null,
    torches: [],
    braziers: [],
    props: [],
    enemies: [],
    projectiles: [],
    particles: [],
    texts: [],
    effects: [],
    orbs: [],
    chests: [],
    portals: [],
    pendingSpawns: [],
    phase: 'intro',
    wave: 0,
    waveTotal: D.WAVE_TOTAL,
    introTimer: 0,
    nextTimer: 0,
    boss: null,
    bossDefeated: false,
    bossChest: null,
    camera: { x: 0, y: 0 },
    shake: 0,
    hitstop: 0,
    stats: { kills: 0, chests: 0, damage: 0, startedAt: 0 },
    runTime: 0,
    choices: [],
    activeChest: null,
    choiceContext: null,
    levelChoices: [],
    time: 0,
    visualTime: 0,
    hintTimer: 0,
    footstepTimer: 0,
    titleEntered: true
  };

  R.recordRun = function () {
    const g = R.game;
    const rec = R.record;
    rec.runs = (rec.runs || 0) + 1;
    let changed = false;
    if (g.stageIndex + 1 > (rec.bestStage || 0)) { rec.bestStage = g.stageIndex + 1; changed = true; }
    if (g.player && g.player.level > (rec.bestLevel || 0)) { rec.bestLevel = g.player.level; changed = true; }
    if (g.mode === 'victory') { rec.clears = (rec.clears || 0) + 1; changed = true; }
    if (changed) R.safeSet('riftRecord', rec);
  };

  // ---------- 初始化 ----------
  R.initCore = function () {
    if (window.GameAssets) GameAssets.preload();
    // 职业头像 / 技能图标 / 职业徽记
    for (const id of Object.keys(D.CLASSES)) {
      const img = document.getElementById('portrait-' + id);
      if (img) img.src = Art.makePortrait(id, 128);
      const sk = document.getElementById('skill-' + id);
      if (sk) {
        const cls = D.CLASSES[id];
        const skill = D.SKILLS[id][cls.startingAbility];
        sk.src = Art.makeIcon(skill.icon, D.RARITY[skill.rarity].color);
        sk.onerror = () => { sk.style.display = 'none'; };
      }
      const crest = document.getElementById('crest-' + id);
      if (crest && window.GameAssets) {
        crest.src = GameAssets.classCrest(id) || '';
        crest.onerror = () => { crest.style.display = 'none'; };
      }
      const titleCrest = document.getElementById('title-crest-' + id);
      if (titleCrest && window.GameAssets) {
        titleCrest.src = GameAssets.classCrest(id) || '';
        titleCrest.onerror = () => { titleCrest.style.display = 'none'; };
      }
    }
    document.querySelectorAll('.class-stats i').forEach((el) => {
      const v = parseInt(el.dataset.value || '3', 10);
      el.style.setProperty('--pct', (v * 20) + '%');
    });
    R.updateMusicButton();
    R.updateAutoAttackUI();
    if (window.Achievements) Achievements.init();
    if (R.UI.touchHint && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      R.UI.touchHint.classList.remove('hidden');
    }

    // 选职业
    R.UI.classCards.forEach((card) => {
      card.addEventListener('click', () => {
        R.selectClass(card.dataset.class);
        AudioEngine.unlock();
        AudioEngine.sfx('click');
      });
    });
    R.UI.startBtn.addEventListener('click', () => {
      if (R.selectedClass) R.startRun(R.selectedClass);
    });

    // 暂停 / 结算 / 声音
    R.UI.pauseBtn.addEventListener('click', () => R.togglePause());
    R.UI.musicBtn.addEventListener('click', () => {
      AudioEngine.unlock();
      const muted = AudioEngine.toggleMuted();
      if (!muted) AudioEngine.sfx('click');
      R.updateMusicButton();
    });
    if (R.UI.autoAttackBtn) R.UI.autoAttackBtn.addEventListener('click', () => R.toggleAutoAttack());
    $('resume-btn').addEventListener('click', () => R.resumeGame());
    $('restart-btn').addEventListener('click', () => {
      const c = R.game.classId || R.selectedClass || 'warrior';
      R.startRun(c);
    });
    $('quit-btn').addEventListener('click', () => R.returnToTitle());
    R.UI.retryBtn.addEventListener('click', () => {
      const c = R.game.classId || R.selectedClass || 'warrior';
      R.startRun(c);
    });
    R.UI.endTitleBtn.addEventListener('click', () => R.returnToTitle());

    // 输入
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', (e) => R.input.keys.delete(e.code));
    window.addEventListener('blur', () => {
      R.input.keys.clear();
      R.input.mouse.down = false;
      if (R.game.mode === 'playing') R.togglePause();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && R.game.mode === 'playing') R.togglePause();
    });

    const canvas = R.UI.canvas;
    canvas.addEventListener('pointermove', updatePointer, { passive: true });
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      updatePointer(e);
      R.input.mouse.down = true;
      AudioEngine.unlock();
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    });
    window.addEventListener('pointerup', (e) => {
      if (e.button === 0) R.input.mouse.down = false;
    });
    canvas.addEventListener('pointerleave', () => { R.input.mouse.down = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // 自动进入（调试 / 截图）
    const params = new URLSearchParams(location.search);
    const auto = params.get('autostart') || params.get('class');
    if (auto && D.CLASSES[auto]) {
      R.selectClass(auto);
      setTimeout(() => R.startRun(auto), 200);
    }
  };

  function updatePointer(e) {
    const rect = R.UI.canvas.getBoundingClientRect();
    R.input.mouse.x = clamp((e.clientX - rect.left) / rect.width * R.W, 0, R.W);
    R.input.mouse.y = clamp((e.clientY - rect.top) / rect.height * R.H, 0, R.H);
    R.syncMouseWorld();
  }

  R.syncMouseWorld = function () {
    const m = R.input.mouse;
    const cam = R.game.camera;
    m.worldX = m.x + cam.x;
    m.worldY = m.y + cam.y;
  };

  function onKeyDown(e) {
    const code = e.code;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyT', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Escape'].includes(code)) {
      if (!e.repeat) e.preventDefault();
    }
    if (window.Achievements && Achievements.isOpen()) {
      if (code === 'Escape') Achievements.close();
      return;
    }
    R.input.keys.add(code);

    if (code === 'KeyT') {
      R.toggleAutoAttack();
      return;
    }

    if (code === 'Escape') {
      if (R.game.mode === 'playing') R.togglePause();
      else if (R.game.mode === 'paused') R.resumeGame();
      return;
    }
    if (R.game.mode === 'title') {
      if (code === 'Enter' && R.selectedClass) R.startRun(R.selectedClass);
      return;
    }
    if (R.game.mode === 'cards') {
      let idx = -1;
      if (code === 'Digit1' || code === 'Numpad1') idx = 0;
      if (code === 'Digit2' || code === 'Numpad2') idx = 1;
      if (code === 'Digit3' || code === 'Numpad3') idx = 2;
      if (idx >= 0) R.chooseCard(idx);
      return;
    }
    if (R.game.mode === 'dead' || R.game.mode === 'victory') {
      if (code === 'Enter') {
        const c = R.game.classId || R.selectedClass || 'warrior';
        R.startRun(c);
      }
      return;
    }
    if (R.game.mode !== 'playing') return;
    if (e.repeat) return;

    let slot = -1;
    if (code === 'Digit1' || code === 'Numpad1') slot = 0;
    if (code === 'Digit2' || code === 'Numpad2') slot = 1;
    if (code === 'Digit3' || code === 'Numpad3') slot = 2;
    if (code === 'Digit4' || code === 'Numpad4') slot = 3;
    if (slot >= 0) { R.useAbility(slot); return; }
  }

  R.updateMusicButton = function () {
    const btn = R.UI.musicBtn;
    if (!btn) return;
    btn.classList.toggle('muted', AudioEngine.muted);
    btn.querySelector('.sound-on').textContent = AudioEngine.muted ? '×' : '♪';
    btn.title = AudioEngine.muted ? '开启声音' : '关闭声音';
  };

  R.updateAutoAttackUI = function () {
    const btn = R.UI.autoAttackBtn;
    if (!btn) return;
    const on = !!R.input.autoAttack;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on ? '自动攻击：开 (T)' : '自动攻击：关 (T)';
  };

  R.toggleAutoAttack = function () {
    R.input.autoAttack = !R.input.autoAttack;
    R.updateAutoAttackUI();
    if (R.game.mode === 'playing' || R.game.mode === 'paused') {
      R.toast('自动攻击 · ' + (R.input.autoAttack ? '开启' : '关闭'), R.input.autoAttack ? 'good' : '');
    }
    return R.input.autoAttack;
  };

  R.selectClass = function (id) {
    if (!D.CLASSES[id]) return;
    R.selectedClass = id;
    R.UI.classCards.forEach((c) => c.classList.toggle('selected', c.dataset.class === id));
    R.UI.startBtn.disabled = false;
    if (R.UI.startBtnText) R.UI.startBtnText.textContent = D.CLASSES[id].name + ' · 准备出发';
  };

  // ---------- 角色 ----------
  R.createPlayer = function (classId) {
    const cls = D.CLASSES[classId];
    const p = {
      classId,
      cls,
      x: 0, y: 0, z: 0,
      radius: 9,
      aim: 0,
      moving: false,
      level: 1,
      xp: 0,
      xpNext: D.BALANCE.xpCurve(1),
      hp: 1,
      maxHp: 1,
      resource: null,
      maxResource: 100,
      resourceRegen: 0,
      dr: 0,
      speedBase: cls.speed,
      speedMult: 1,
      dmgMult: 1,
      cdrMult: 1,
      shieldBonus: 1,
      shieldDurBonus: 0,
      abilities: [cls.startingAbility],
      passives: {},
      runes: {},
      cooldowns: {},
      attackCd: 0,
      attackAnim: 0,
      attackSpeed: 1,
      baseAttackSpeed: 1,
      iframes: 0,
      shield: 0,
      shieldTimer: 0,
      healMult: 1,
      renewTime: 0,
      renewHeal: 0,
      renewTick: 0,
      buffs: { shieldBlock: 0, iceBarrier: 0, bloodlust: 0, bloodlustStacks: 0, secondWind: 0, focusedWill: 0 },
      channel: null,
      dash: null,
      leap: null,
      pulses: null,
      slow: 0,
      stun: 0,
      spin: 0,
      lastHurt: 99,
      lastAttack: 0,
      footTimer: 0
    };
    p.resource = cls.startResource;
    R.recalcStats(p, true);
    p.hp = p.maxHp;
    p.resource = cls.startResource;
    return p;
  };

  R.recalcStats = function (p, full) {
    if (!p) return;
    const cls = p.cls;
    const oldMax = p.maxHp || 1;
    const oldHp = p.hp == null ? oldMax : p.hp;
    const oldMaxRes = p.maxResource || 100;
    const oldRes = p.resource == null ? oldMaxRes : p.resource;
    const pass = p.passives || {};
    const rank = (id) => pass[id] || 0;
    const lv = p.level;
    let maxHp = cls.baseHp + (lv - 1) * cls.hpPerLevel;
    let dmgMult = 1 + (lv - 1) * D.BALANCE.levelDamage;
    let dr = cls.armor;
    let speedMult = 1;
    let maxResource = cls.baseResource;
    let resourceRegen = cls.resourceRegen;
    let cdrMult = 1;
    let shieldBonus = 1;
    let shieldDurBonus = 0;
    let healMult = 1;
    let renewDurBonus = 0;
    let basicDmgMult = 1;
    let basicSizeMult = 1;
    let basicSpeedMult = 1;
    let basicSplit = 0;

    // 战士
    if (p.classId === 'warrior') {
      maxHp *= 1 + rank('ironHide') * .12;
      dr += rank('thickSkin') * .05;
    }
    // 法师
    if (p.classId === 'mage') {
      maxResource *= 1 + rank('arcaneIntellect') * .15;
      resourceRegen += rank('arcaneIntellect') * 1.2;
      cdrMult *= Math.max(.55, 1 - rank('temporalFlux') * .08);
      shieldBonus *= 1 + rank('barrierMastery') * .25;
      shieldDurBonus += rank('barrierMastery');
      // 法师普攻成长：更大、更快、更多分裂
      basicDmgMult += rank('fireballMastery') * .22;
      basicSizeMult += rank('fireballMastery') * .18;
      basicSpeedMult += rank('rapidCasting') * .16;
      basicSplit = rank('splitFire');
    }
    // 牧师
    if (p.classId === 'priest') {
      maxResource *= 1 + rank('spiritTap') * .08;
      resourceRegen += rank('spiritTap') * 1.5;
      dmgMult *= 1 + rank('innerFire') * .07;
      healMult *= 1 + rank('renewedFaith') * .15;
      renewDurBonus += rank('renewedFaith');
    }
    // 通用
    maxHp += rank('vitality') * 12;
    dmgMult += rank('sharpened') * .06;
    speedMult *= 1 + rank('swiftness') * .05;

    p.maxHp = Math.round(maxHp);
    p.maxResource = Math.round(maxResource);
    p.resourceRegen = resourceRegen;
    p.dmgMult = dmgMult;
    p.dr = Math.min(.65, dr);
    p.speedMult = speedMult;
    p.cdrMult = cdrMult;
    p.shieldBonus = shieldBonus;
    p.shieldDurBonus = shieldDurBonus;
    p.healMult = healMult;
    p.renewDurBonus = renewDurBonus;
    p.basicDmgMult = basicDmgMult;
    p.basicSizeMult = basicSizeMult;
    p.basicSpeedMult = basicSpeedMult;
    p.basicSplit = basicSplit;
    if (full) {
      p.hp = p.maxHp;
      p.resource = p.maxResource;
    } else {
      if (p.maxHp > oldMax) p.hp = oldHp + (p.maxHp - oldMax);
      else p.hp = oldHp * (p.maxHp / oldMax);
      p.hp = clamp(p.hp, 1, p.maxHp);
      if (p.maxResource > oldMaxRes) p.resource = oldRes + (p.maxResource - oldMaxRes);
      else p.resource = oldRes * (p.maxResource / oldMaxRes);
      p.resource = clamp(p.resource, 0, p.maxResource);
    }
  };

  R.xpNeeded = function (level) {
    return D.BALANCE.xpCurve(level);
  };

  R.gainXp = function (amount) {
    const g = R.game;
    const p = g.player;
    if (!p) return;
    const gained = [];
    p.xp += amount;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level += 1;
      gained.push(p.level);
      p.xpNext = R.xpNeeded(p.level);
      R.recalcStats(p);
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .16);
      p.resource = Math.min(p.maxResource, p.resource + p.maxResource * .35);
      p.iframes = Math.max(p.iframes, .4);
      R.levelUpEffect(p);
      R.toast('等级提升 · Lv.' + p.level + ' · 选择一项奖励', 'good', 'achievement');
      R.floatText(p.x, p.y - 35, 'LEVEL UP', '#ffe09a', 10, 1.5);
      AudioEngine.sfx('level');
    }
    if (gained.length) {
      g.levelChoices.push(...gained);
      if (g.mode === 'playing') R.startNextLevelChoice();
      if (window.Achievements) Achievements.recordLevel(p.level);
    }
    R.updateHUD();
  };

  R.levelUpEffect = function (p) {
    const g = R.game;
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = R.rand(20, 90);
      R.addParticle(p.x, p.y - 8, Math.cos(a) * sp, Math.sin(a) * sp, R.rand(.5, 1.2), R.pick(['#ffe2a0', '#d9b26c', '#fff6d8']), R.rand(1, 3), 0, .94, true);
    }
    R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 6, maxR: 52, timer: .7, duration: .7, color: '#ffe0a0', width: 2 });
    g.shake = Math.max(g.shake, 3);
  };

  // ---------- 技能抽取 ----------
  R.rollChoices = function () {
    const p = R.game.player;
    const classId = p.classId;
    const all = D.SKILLS[classId];
    const activeFull = p.abilities.length >= D.BALANCE.maxActives;
    const actives = Object.values(all).filter((s) => s.type === 'active' && !p.abilities.includes(s.id) && !activeFull);
    const passives = Object.values(all).filter((s) => s.type === 'passive' && (p.passives[s.id] || 0) < s.maxRank);
    const runes = Object.values(all).filter((s) => s.type === 'rune' && !(p.runes && p.runes[s.id]));
    const generics = Object.values(D.GENERIC_SKILLS);
    const pool = [];
    actives.forEach((s) => pool.push({ skill: s, weight: activeFull ? 0 : 2.1, generic: false }));
    passives.forEach((s) => pool.push({ skill: s, weight: 1.45, generic: false }));
    runes.forEach((s) => pool.push({ skill: s, weight: 1.55, generic: false, rune: true }));
    generics.forEach((s) => pool.push({ skill: s, weight: .55, generic: true }));

    const picked = [];
    const used = new Set();
    const draw = (onlyActives) => {
      let candidates = pool.filter((x) => !used.has(x.skill.id) && (!onlyActives || x.skill.type === 'active'));
      if (!candidates.length) candidates = pool.filter((x) => !used.has(x.skill.id));
      if (!candidates.length) return null;
      const total = candidates.reduce((sum, x) => sum + x.weight, 0);
      let roll = Math.random() * total;
      let chosen = candidates[candidates.length - 1];
      for (const c of candidates) {
        roll -= c.weight;
        if (roll <= 0) { chosen = c; break; }
      }
      used.add(chosen.skill.id);
      picked.push(chosen);
      return chosen;
    };

    // 如果有主动技能，至少较大概率提供一个
    if (actives.length && Math.random() < .78) draw(true);
    while (picked.length < 3) {
      if (!draw(false)) break;
    }
    // 兜底：通用技能可重复
    let guard = 0;
    while (picked.length < 3 && guard++ < 30) {
      const s = R.pick(generics);
      picked.push({ skill: s, weight: 0, generic: true });
    }
    // 每次三选一最多出现两个主动技能，保证至少一个被动选项
    let activePicks = picked.filter((x) => x.skill.type === 'active');
    if (activePicks.length > 2) {
      const passivePool = [
        ...passives.filter((s) => !used.has(s.id)).map((s) => ({ skill: s, generic: false })),
        ...generics.map((s) => ({ skill: s, generic: true }))
      ];
      for (let i = 2; i < activePicks.length; i++) {
        const idx = picked.indexOf(activePicks[i]);
        const replacement = passivePool.length ? R.pick(passivePool) : { skill: R.pick(generics), generic: true };
        picked[idx] = replacement;
        used.add(replacement.skill.id);
      }
    }
    return picked.map((x) => {
      const s = x.skill;
      const rank = s.type === 'passive' ? (p.passives[s.id] || 0) + 1 : s.type === 'rune' ? 1 : null;
      return { skill: s, generic: !!x.generic, rank };
    });
  };

  R.startChoice = function (context) {
    const g = R.game;
    if (!g.player) return;
    if (g.mode !== 'playing' && g.mode !== 'cards') return;
    const ctx = context || { source: 'chest' };
    g.choiceContext = ctx;
    g.activeChest = ctx.chest || null;
    g.choices = R.rollChoices();
    g.mode = 'cards';
    AudioEngine.setDucked(true);
    const popup = document.getElementById('achievement-popup');
    if (popup) popup.classList.remove('show');
    if (R.hideTooltip) R.hideTooltip();
    R.renderChoices(g.choices);
  };

  R.startNextLevelChoice = function (force) {
    const g = R.game;
    if (!g.levelChoices.length) return false;
    if (!force && g.mode !== 'playing') return false;
    const level = g.levelChoices.shift();
    R.startChoice({ source: 'levelup', level });
    return true;
  };

  R.openChest = function (chest) {
    const g = R.game;
    if (!chest || chest.opened || g.mode !== 'playing') return;
    chest.opened = true;
    g.stats.chests++;
    AudioEngine.sfx('chest');
    R.addEffect({ type: 'ring', x: chest.x, y: chest.y, r: 5, maxR: 48, timer: .7, duration: .7, color: chest.kind === 'boss' ? '#d9a6ff' : '#ffd57a', width: 2 });
    R.spawnBurst(chest.x, chest.y - 10, 22, chest.kind === 'boss' ? '#c77dff' : '#ffcf6b', 2);
    R.startChoice({ source: 'chest', chest });
    if (window.Achievements) Achievements.recordChest(chest.kind);
  };

  R.chooseCard = function (index) {
    const g = R.game;
    if (g.mode !== 'cards') return;
    const choice = g.choices[index];
    if (!choice) return;
    const p = g.player;
    const s = choice.skill;
    const context = g.choiceContext || { source: g.activeChest ? 'chest' : 'levelup' };
    if (s.type === 'active') {
      if (p.abilities.length >= D.BALANCE.maxActives) {
        R.toast('主动技能栏已满', 'warn');
        return;
      }
      p.abilities.push(s.id);
      p.cooldowns[s.id] = 0;
      R.toast('获得主动技能 · ' + s.name, s.rarity === 'epic' ? 'epic' : 'good', s.icon);
    } else if (s.type === 'rune') {
      p.runes = p.runes || {};
      p.runes[s.id] = 1;
      p._passiveSig = '';
      R.toast('获得联动符文 · ' + s.name, 'epic', s.icon);
    } else {
      p.passives[s.id] = (p.passives[s.id] || 0) + 1;
      R.recalcStats(p);
      if (s.id === 'vitality') p.hp = Math.min(p.maxHp, p.hp + 12);
      R.toast('获得被动天赋 · ' + s.name + (choice.rank ? ' ' + toRoman(choice.rank) : ''), s.rarity === 'epic' ? 'epic' : 'good', s.icon);
    }
    AudioEngine.sfx('select');

    const isLevel = context.source === 'levelup';
    const chest = context.chest || g.activeChest || null;
    g.activeChest = null;
    g.choices = [];
    g.choiceContext = null;
    R.rebuildAbilityBar();
    R.updateHUD();
    if (window.Achievements) Achievements.recordChoice(s, p.abilities.length);

    if (isLevel && g.levelChoices.length) {
      // 连续升级：不关闭卡牌界面，直接展示下一级的三选一
      g.mode = 'cards';
      AudioEngine.setDucked(true);
      R.startNextLevelChoice(true);
      return;
    }

    R.UI.cardScreen.classList.add('hidden');
    R.UI.cardScreen.classList.remove('levelup');
    AudioEngine.setDucked(false);
    g.mode = 'playing';
    if (chest) {
      const idx = g.chests.indexOf(chest);
      if (idx >= 0) g.chests.splice(idx, 1);
      if (chest.kind === 'boss') {
        R.spawnPortal(chest.x, chest.y);
        g.phase = 'portal';
        R.updateObjective('进入传送门');
        R.announce('通道已开启');
        AudioEngine.sfx('portal');
      }
    }
    if (g.levelChoices.length) R.startNextLevelChoice();
  };

  function toRoman(n) {
    return ['', 'I', 'II', 'III', 'IV', 'V'][Math.min(5, Math.max(1, n))];
  }
  R.toRoman = toRoman;

  // ---------- 流程 ----------
  R.startRun = function (classId) {
    if (!D.CLASSES[classId]) classId = R.selectedClass || 'warrior';
    AudioEngine.unlock();
    AudioEngine.setMood(0);
    AudioEngine.startMusic();
    AudioEngine.setDucked(false);
    const g = R.game;
    g.mode = 'playing';
    g.classId = classId;
    g.cls = D.CLASSES[classId];
    g.player = R.createPlayer(classId);
    g.stats = { kills: 0, chests: 0, damage: 0, startedAt: performance.now() };
    g.runTime = 0;
    g.choices = [];
    g.activeChest = null;
    g.choiceContext = null;
    g.levelChoices = [];
    g.hintTimer = 16;
    g.phase = 'intro';
    g.boss = null;
    g.bossDefeated = false;
    g.bossChest = null;
    g.runFlags = { bossHit: false };
    R.UI.title.classList.add('hidden');
    R.UI.pauseScreen.classList.add('hidden');
    R.UI.cardScreen.classList.add('hidden');
    R.UI.cardScreen.classList.remove('levelup');
    R.UI.endScreen.classList.add('hidden');
    R.UI.hud.classList.remove('hidden');
    R.UI.hint.classList.remove('fade');
    R.UI.hudPortrait.src = Art.makePortrait(classId, 128);
    if (R.UI.hudCrest && window.GameAssets) {
      R.UI.hudCrest.src = GameAssets.classCrest(classId) || '';
      R.UI.hudCrest.style.display = R.UI.hudCrest.src ? 'block' : 'none';
    }
    if (R.UI.endClassCrest && window.GameAssets) {
      R.UI.endClassCrest.src = GameAssets.classCrest(classId) || '';
    }
    R.UI.hudClassName.textContent = g.cls.name;
    R.UI.hudRole.textContent = g.cls.role;
    R.UI.resourceBar.classList.toggle('mana', classId === 'mage' || classId === 'priest');
    R.UI.bossPanel.classList.add('hidden');
    R.UI.endScreen.classList.remove('victory');
    R.rebuildAbilityBar();
    R.startDungeon(0, true);
    R.updateHUD();
    if (window.Achievements) {
      Achievements.beginRun(classId);
      Achievements.refreshChrome();
    }
    setTimeout(() => R.toast('提示：触碰宝箱自动开启；走入传送门自动进入下一副本', '', 'chest'), 3400);
  };

  R.startDungeon = function (index, initial) {
    const g = R.game;
    const dungeon = D.DUNGEONS[index];
    if (!dungeon) return;
    g.stageIndex = index;
    g.dungeon = dungeon;
    if (window.Achievements) Achievements.recordStage(index + 1);
    g.worldW = 1120;
    g.worldH = 680;
    // 预渲染场景
    const c = document.createElement('canvas');
    c.width = g.worldW;
    c.height = g.worldH;
    const cctx = c.getContext('2d');
    cctx.imageSmoothingEnabled = false;
    const meta = Art.paintArena(cctx, g.worldW, g.worldH, dungeon.theme, 1013 + index * 137);
    g.arenaCanvas = c;
    g.torches = meta.torches;
    g.braziers = [
      { x: g.worldW * .25, y: g.worldH * .28, seed: 1.7 + index },
      { x: g.worldW * .75, y: g.worldH * .28, seed: 4.3 + index },
      { x: g.worldW * .25, y: g.worldH * .73, seed: 7.9 + index },
      { x: g.worldW * .75, y: g.worldH * .73, seed: 11.2 + index }
    ];
    g.props = R.makeProps(dungeon, index);
    g.enemies = [];
    g.projectiles = [];
    g.particles = [];
    g.texts = [];
    g.effects = [];
    g.orbs = [];
    g.chests = [];
    g.portals = [];
    g.pendingSpawns = [];
    g.boss = null;
    g.bossDefeated = false;
    g.bossChest = null;
    if (R.UI.toastLayer) R.UI.toastLayer.innerHTML = '';
    g.phase = 'intro';
    g.wave = 0;
    g.introTimer = 2.7;
    g.nextTimer = 0;
    g.shake = 0;
    g.hitstop = 0;
    g.footstepTimer = 0;
    const p = g.player;
    p.x = g.worldW / 2;
    p.y = g.worldH / 2 + 110;
    p.z = 0;
    p.shield = 0;
    p.shieldTimer = 0;
    p.channel = null;
    p.dash = null;
    p.leap = null;
    p.pulses = null;
    p.slow = 0;
    p.stun = 0;
    p.iframes = .5;
    p.aim = -Math.PI / 2;
    p.cooldowns = {};
    p.buffs = { shieldBlock: 0, iceBarrier: 0, bloodlust: 0, bloodlustStacks: 0, secondWind: 0 };
    if (!initial) {
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .25);
      p.resource = Math.min(p.maxResource, p.resource + p.maxResource * .5);
    }
    g.camera.x = clamp(p.x - R.W / 2, 0, g.worldW - R.W);
    g.camera.y = clamp(p.y - R.H / 2, 0, g.worldH - R.H);
    R.game.mode = 'playing';
    R.UI.hud.classList.remove('hidden');
    R.UI.bossPanel.classList.add('hidden');
    R.UI.cardScreen.classList.add('hidden');
    R.UI.pauseScreen.classList.add('hidden');
    R.UI.endScreen.classList.add('hidden');
    R.UI.abilityBar.classList.remove('hidden');
    if (R.hideTooltip) R.hideTooltip();
    R.UI.wavePips.innerHTML = '';
    for (let i = 0; i < g.waveTotal; i++) {
      const pip = document.createElement('i');
      pip.dataset.wave = String(i + 1);
      R.UI.wavePips.appendChild(pip);
    }
    const bossPip = document.createElement('i');
    bossPip.dataset.boss = 'true';
    bossPip.style.transform = 'rotate(45deg)';
    R.UI.wavePips.appendChild(bossPip);
    R.UI.dungeonIndex.textContent = '副本 ' + (index + 1) + ' / ' + D.DUNGEONS.length;
    R.UI.dungeonName.textContent = dungeon.name;
    if (R.UI.dungeonPanel) R.UI.dungeonPanel.classList.remove('boss-active');
    R.updateWavePips();
    R.updateObjective('准备战斗');
    R.updateHUD();
    R.showStageBanner(dungeon);
    AudioEngine.setMood(index);
    if (!initial) R.toast('进入副本 · ' + dungeon.name, 'good');
  };

  R.makeProps = function (dungeon, index) {
    const sets = {
      mine: ['barrel', 'crate', 'bones', 'crate', 'barrel', 'anvil', 'pillar', 'rubble'],
      cave: ['mushroom', 'stalagmite', 'bones', 'mushroom', 'stalagmite', 'pillar', 'rubble'],
      keep: ['gravestone', 'candle', 'bones', 'gravestone', 'candle', 'banner', 'pillar', 'rubble'],
      forge: ['anvil', 'weaponrack', 'bones', 'barrel', 'anvil', 'pillar', 'rubble'],
      ice: ['crystal', 'bones', 'crystal', 'banner', 'crystal', 'pillar', 'rubble']
    };
    const meta = {
      barrel: { solid: true, breakable: true, hp: 24, r: 9, xp: 8 },
      crate: { solid: true, breakable: true, hp: 34, r: 10, xp: 11 },
      anvil: { solid: true, r: 13 },
      pillar: { solid: true, r: 16 },
      rubble: { solid: true, r: 13 },
      stalagmite: { solid: true, r: 9 },
      gravestone: { solid: true, r: 9 },
      weaponrack: { solid: true, r: 10 },
      crystal: { solid: true, r: 10 },
      mushroom: { r: 0 },
      bones: { r: 0 },
      candle: { r: 0 },
      banner: { r: 0 }
    };
    const types = sets[dungeon.theme.name] || sets.mine;
    const props = [];
    const random = Art.rnd(9001 + index * 373);
    const count = 18;
    for (let i = 0; i < count; i++) {
      let x, y, type, m, tries = 0;
      do {
        x = 70 + random() * (R.game.worldW - 140);
        y = 80 + random() * (R.game.worldH - 160);
        type = types[Math.floor(random() * types.length)];
        m = meta[type] || {};
        tries++;
      } while (tries < 30 && (
        Math.hypot(x - R.game.worldW / 2, y - (R.game.worldH / 2 + 110)) < 165 ||
        Math.hypot(x - R.game.worldW / 2, y - R.game.worldH / 2) < 84 ||
        props.some((p) => Math.hypot(x - p.x, y - p.y) < (m.r || 8) + (p.r || 8) + 18)
      ));
      const scale = .85 + random() * .42;
      props.push({
        type, x, y, scale,
        solid: !!m.solid,
        breakable: !!m.breakable,
        r: (m.r || 0) * scale,
        hp: m.hp ? Math.round(m.hp * scale) : 0,
        maxHp: m.hp ? Math.round(m.hp * scale) : 0,
        xp: m.xp || 0,
        seed: Math.floor(random() * 99999),
        color: dungeon.theme.accent
      });
    }
    return props.sort((a, b) => a.y - b.y);
  };

  R.spawnPortal = function (x, y) {
    const g = R.game;
    const p = g.player;
    // 传送门不要压在宝箱/玩家脚下：在附近找一个没有障碍物的落点。
    const offsets = [
      [0, -78], [78, 0], [-78, 0], [0, 78],
      [58, -58], [-58, -58], [58, 58], [-58, 58]
    ];
    let sx = x;
    let sy = y;
    for (const [ox, oy] of offsets) {
      const tx = Math.max(56, Math.min(g.worldW - 56, x + ox));
      const ty = Math.max(70, Math.min(g.worldH - 56, y + oy));
      if (R.propAt(tx, ty, 12)) continue;
      sx = tx;
      sy = ty;
      if (!p || Math.hypot(sx - p.x, sy - p.y) >= 48) break;
    }
    g.portals.push({ x: sx, y: sy, timer: 0, seed: Math.random() * 10, armed: false });
  };

  R.enterPortal = function () {
    const g = R.game;
    if (g.stageIndex >= D.DUNGEONS.length - 1) {
      R.endRun(true);
    } else {
      R.startDungeon(g.stageIndex + 1, false);
      R.toast('深入裂隙 · 生命恢复 25%', 'good');
    }
  };

  R.togglePause = function () {
    const g = R.game;
    if (g.mode === 'playing') {
      g.mode = 'paused';
      R.UI.pauseScreen.classList.remove('hidden');
      AudioEngine.setDucked(true);
      R.input.mouse.down = false;
      if (R.hideTooltip) R.hideTooltip();
      if (R.renderBuildPanel) R.renderBuildPanel();
    } else if (g.mode === 'paused') {
      R.resumeGame();
    }
  };

  R.resumeGame = function () {
    const g = R.game;
    if (g.mode !== 'paused') return;
    g.mode = 'playing';
    R.UI.pauseScreen.classList.add('hidden');
    AudioEngine.setDucked(false);
  };

  R.returnToTitle = function () {
    const g = R.game;
    g.mode = 'title';
    g.player = null;
    g.enemies = [];
    g.projectiles = [];
    g.effects = [];
    g.particles = [];
    g.orbs = [];
    g.chests = [];
    g.portals = [];
    g.boss = null;
    g.choices = [];
    g.activeChest = null;
    g.choiceContext = null;
    g.levelChoices = [];
    AudioEngine.stopMusic();
    AudioEngine.setDucked(false);
    R.UI.hud.classList.add('hidden');
    R.UI.pauseScreen.classList.add('hidden');
    R.UI.cardScreen.classList.add('hidden');
    R.UI.endScreen.classList.add('hidden');
    R.UI.stageBanner.classList.remove('show');
    R.UI.title.classList.remove('hidden');
    R.UI.tooltip.classList.add('hidden');
    R.input.mouse.down = false;
  };

  R.endRun = function (victory) {
    const g = R.game;
    if (g.mode === 'dead' || g.mode === 'victory') return;
    g.mode = victory ? 'victory' : 'dead';
    g.runTime = (performance.now() - g.stats.startedAt) / 1000;
    g.stats.startedAt = 0;
    if (window.Achievements) {
      Achievements.recordRunEnd(victory, g.classId, g.stageIndex + 1, g.player ? g.player.level : 1);
      Achievements.refreshChrome();
    }
    R.UI.cardScreen.classList.add('hidden');
    R.UI.cardScreen.classList.remove('levelup');
    g.choiceContext = null;
    g.levelChoices = [];
    R.UI.pauseScreen.classList.add('hidden');
    R.input.mouse.down = false;
    R.UI.endScreen.classList.toggle('victory', victory);
    R.UI.endKicker.textContent = victory ? 'EXPEDITION COMPLETE' : 'EXPEDITION ENDED';
    R.UI.endTitle.textContent = victory ? '裂隙已平' : '你倒下了';
    R.UI.endSubtitle.textContent = victory
      ? '五个副本的精英首领都已倒下。艾泽拉斯的裂隙暂时归于寂静。'
      : '你倒在了' + (g.dungeon ? g.dungeon.name : '副本') + '，但传说会记住每一个挑战者。';
    R.UI.endSigil.textContent = victory ? '✦' : '◆';
    R.UI.retryBtn.textContent = victory ? '再来一次' : '再次远征';
    const stats = [
      ['到达副本', (g.stageIndex + 1) + ' / ' + D.DUNGEONS.length],
      ['英雄等级', 'Lv.' + (g.player ? g.player.level : 1)],
      ['击杀', String(g.stats.kills)],
      ['宝箱', String(g.stats.chests)],
      ['造成伤害', Math.round(g.stats.damage).toLocaleString('en-US')],
      ['远征用时', R.formatTime(g.runTime)]
    ];
    R.UI.endStats.innerHTML = stats.map((s) => '<div class="end-stat"><span>' + s[0] + '</span><b>' + s[1] + '</b></div>').join('');
    R.recordRun();
    const rec = R.record;
    R.UI.endRecord.textContent = '最佳纪录 · 深入第 ' + (rec.bestStage || 0) + ' 副本 · Lv.' + (rec.bestLevel || 1) + (rec.clears ? ' · 通关 ' + rec.clears + ' 次' : '') +
      (window.Achievements ? ' · 成就点 ' + Achievements.getSummary().points : '');
    R.UI.endScreen.classList.remove('hidden');
    if (R.hideTooltip) R.hideTooltip();
    AudioEngine.setDucked(true);
    AudioEngine.sfx(victory ? 'victory' : 'death');
    R.updateHUD();
  };

  R.useAbility = function (slot) {
    if (R.castAbilitySlot) R.castAbilitySlot(slot);
  };

  R.floatText = function (x, y, text, color, size, life) {
    R.game.texts.push({
      x, y, text, color: color || '#fff', size: size || 7,
      life: life || .8, maxLife: life || .8,
      vx: R.rand(-8, 8), vy: R.rand(-26, -15)
    });
  };

  R.toast = function (text, kind, icon) {
    const layer = R.UI.toastLayer;
    if (!layer) return;
    while (layer.children.length >= 4) layer.removeChild(layer.firstChild);
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    if (icon) {
      const img = document.createElement('img');
      img.src = Art.makeIcon(icon, kind === 'epic' ? '#c77dff' : '#d9b26c');
      img.alt = '';
      img.onerror = () => { img.style.display = 'none'; };
      el.appendChild(img);
    }
    const span = document.createElement('span');
    span.textContent = text;
    el.appendChild(span);
    layer.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 2800);
  };

  R.announce = function (text, boss) {
    const el = R.UI.waveAnnounce;
    if (!el) return;
    el.textContent = text;
    el.classList.remove('show', 'boss');
    void el.offsetWidth;
    if (boss) el.classList.add('boss');
    el.classList.add('show');
  };

  R.showStageBanner = function (dungeon) {
    const el = R.UI.stageBanner;
    R.UI.stageBannerIndex.textContent = '副本 ' + String(dungeon.index).padStart(2, '0');
    R.UI.stageBannerName.textContent = dungeon.name;
    R.UI.stageBannerSub.textContent = dungeon.subtitle;
    R.UI.stageBannerObjective.textContent = '精英首领 · ' + dungeon.boss.name;
    if (R.UI.stageBossPortrait && window.GameAssets) {
      R.UI.stageBossPortrait.src = GameAssets.bossPortrait(dungeon.boss.sprite) || '';
      R.UI.stageBossPortrait.style.visibility = R.UI.stageBossPortrait.src ? 'visible' : 'hidden';
    }
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(R._bannerTimer);
    R._bannerTimer = setTimeout(() => el.classList.remove('show'), 3300);
  };

  R.updateObjective = function (text) {
    if (R.UI.objective) R.UI.objective.textContent = text;
  };

  R.takeDamageFlash = function () {
    const el = R.UI.damageFlash;
    el.classList.remove('hit');
    void el.offsetWidth;
    el.classList.add('hit');
    clearTimeout(R._flashTimer);
    R._flashTimer = setTimeout(() => el.classList.remove('hit'), 110);
  };

  R.respawnAtStart = function () {
    // 预留：保留给重试流程
    if (R.game.classId) R.startRun(R.game.classId);
  };

  // 供控制台 / 自动化测试
  window.__RIFT__ = {
    game: R.game,
    selectClass: R.selectClass,
    startRun: R.startRun,
    startDungeon: R.startDungeon,
    endRun: R.endRun,
    openChest: R.openChest,
    enterPortal: R.enterPortal,
    rollChoices: R.rollChoices
  };

  function startApp() {
    if (R._inited) return;
    R._inited = true;
    R.initCore();
    if (R.boot) R.boot();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp, { once: true });
  } else {
    setTimeout(startApp, 0);
  }
})();

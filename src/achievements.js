/* =========================================================
   艾泽拉斯：裂隙远征 — 战团成就系统
   持久化于 localStorage，并驱动标题 / 暂停中的成就殿堂
   ========================================================= */
(function () {
  'use strict';

  const KEY = 'riftAchievements_v1';
  const CATEGORIES = {
    all: '全部',
    expedition: '远征',
    boss: '首领',
    collection: '收集',
    challenge: '挑战',
    class: '职业'
  };
  const TITLE_STEPS = [
    { points: 0, name: '新兵' },
    { points: 40, name: '远征者' },
    { points: 100, name: '副本老兵' },
    { points: 180, name: '裂隙行者' },
    { points: 280, name: '艾泽拉斯传奇' }
  ];

  const countTrue = (map) => Object.values(map || {}).filter(Boolean).length;

  const DEFS = [
    {
      id: 'first_run', category: 'expedition', points: 5, name: '踏上远征',
      desc: '开始你的第一次远征。', icon: 'charge', target: 1,
      value: (s) => s.runs
    },
    {
      id: 'first_death', category: 'expedition', points: 5, name: '虽败犹荣',
      desc: '第一次倒在副本中。失败也是远征的一部分。', icon: 'skull', target: 1,
      value: (s) => s.deaths
    },
    {
      id: 'runs_10', category: 'expedition', points: 15, name: '艾泽拉斯常客',
      desc: '累计开始 10 次远征。', icon: 'boot', target: 10,
      value: (s) => s.runs
    },
    {
      id: 'first_boss', category: 'boss', points: 10, name: '精英终结者',
      desc: '击败第一位精英首领。', icon: 'skull', target: 1,
      value: (s) => s.bossKills
    },
    {
      id: 'boss_kills_10', category: 'boss', points: 20, name: '精英猎手',
      desc: '累计击败 10 位精英首领。', icon: 'execute', target: 10,
      value: (s) => s.bossKills
    },
    {
      id: 'lichking', category: 'boss', points: 25, name: '王座落幕',
      desc: '击败冰冠堡垒的巫妖王。', image: 'assets/bosses/lichking.jpg', target: 1,
      value: (s) => (s.bossesDefeated && s.bossesDefeated.lichking ? 1 : 0)
    },
    {
      id: 'all_bosses', category: 'boss', points: 30, name: '通缉令全清',
      desc: '击败全部 5 位精英首领。', icon: 'victory', target: 5,
      value: (s) => countTrue(s.bossesDefeated)
    },
    {
      id: 'first_chest', category: 'collection', points: 5, name: '第一桶金',
      desc: '开启第一个宝箱。', icon: 'chest', target: 1,
      value: (s) => s.chests
    },
    {
      id: 'chests_20', category: 'collection', points: 20, name: '宝藏猎人',
      desc: '累计开启 20 个宝箱。', icon: 'chest', target: 20,
      value: (s) => s.chests
    },
    {
      id: 'first_choice', category: 'collection', points: 5, name: '命运抉择',
      desc: '第一次从三选一中选取技能。', icon: 'arcane', target: 1,
      value: (s) => s.choices
    },
    {
      id: 'choices_30', category: 'collection', points: 20, name: '构筑大师',
      desc: '累计做出 30 次技能选择。', icon: 'intellect', target: 30,
      value: (s) => s.choices
    },
    {
      id: 'epic_choice', category: 'collection', points: 10, name: '史诗抉择',
      desc: '选择一张史诗品质的技能卡。', icon: 'bladestorm', target: 1,
      value: (s) => s.epicChoices
    },
    {
      id: 'kills_100', category: 'challenge', points: 20, name: '百人斩',
      desc: '累计击败 100 个敌人。', icon: 'bleed', target: 100,
      value: (s) => s.kills
    },
    {
      id: 'level_6', category: 'challenge', points: 15, name: '身经百战',
      desc: '单局达到 6 级。', icon: 'heart', target: 6,
      value: (s) => s.highestLevel
    },
    {
      id: 'reach_icecrown', category: 'expedition', points: 10, name: '深入冰冠',
      desc: '抵达冰冠堡垒。', icon: 'frost', target: 5,
      value: (s) => s.highestStage
    },
    {
      id: 'no_hit_boss', category: 'challenge', points: 25, name: '完美猎杀',
      desc: '不损失生命值击败任意精英首领。', icon: 'shield', target: 1,
      value: (s) => s.noHitBosses
    },
    {
      id: 'full_actives', category: 'challenge', points: 15, name: '技能满编',
      desc: '单局同时拥有 4 个主动技能。', icon: 'whirlwind', target: 1,
      value: (s) => s.fullActives
    },
    {
      id: 'warrior_clear', category: 'class', points: 20, name: '战士的荣耀',
      desc: '使用战士完成五副本远征。', image: 'assets/classes/warrior.jpg', target: 1,
      value: (s) => (s.classesCleared && s.classesCleared.warrior ? 1 : 0)
    },
    {
      id: 'mage_clear', category: 'class', points: 20, name: '法师的荣耀',
      desc: '使用法师完成五副本远征。', image: 'assets/classes/mage.jpg', target: 1,
      value: (s) => (s.classesCleared && s.classesCleared.mage ? 1 : 0)
    },
    {
      id: 'priest_clear', category: 'class', points: 20, name: '牧师的荣耀',
      desc: '使用牧师完成五副本远征。', image: 'assets/classes/priest.jpg', target: 1,
      value: (s) => (s.classesCleared && s.classesCleared.priest ? 1 : 0)
    },
    {
      id: 'all_classes', category: 'class', points: 40, name: '三职大师',
      desc: '使用战士、法师与牧师各通关一次。', icon: 'victory', target: 3,
      value: (s) => countTrue(s.classesCleared)
    },
    {
      id: 'first_victory', category: 'expedition', points: 25, name: '裂隙征服者',
      desc: '首次完成五副本远征。', icon: 'victory', target: 1,
      value: (s) => s.victories
    },
    {
      id: 'lichking_nohit', category: 'challenge', points: 50, name: '霜之哀伤的沉默',
      desc: '无伤击败巫妖王。', image: 'assets/bosses/lichking.jpg', target: 1, secret: true,
      value: (s) => s.noHitLichKing
    }
  ];

  function defaultStats() {
    return {
      runs: 0, victories: 0, deaths: 0,
      kills: 0, bossKills: 0,
      chests: 0, bossChests: 0, normalChests: 0,
      choices: 0, epicChoices: 0,
      highestStage: 0, highestLevel: 1,
      noHitBosses: 0, noHitLichKing: 0, fullActives: 0,
      classesCleared: { warrior: false, mage: false, priest: false },
      bossesDefeated: { vancleef: false, mutanus: false, arugal: false, thaurissan: false, lichking: false }
    };
  }

  function defaultProfile() {
    return { version: 1, stats: defaultStats(), unlocked: {}, createdAt: Date.now() };
  }

  function normalize(raw) {
    const base = defaultProfile();
    if (!raw || typeof raw !== 'object') return base;
    base.createdAt = raw.createdAt || base.createdAt;
    const s = raw.stats || {};
    base.stats = Object.assign(base.stats, s);
    base.stats.classesCleared = Object.assign({ warrior: false, mage: false, priest: false }, s.classesCleared || {});
    base.stats.bossesDefeated = Object.assign(
      { vancleef: false, mutanus: false, arugal: false, thaurissan: false, lichking: false },
      s.bossesDefeated || {}
    );
    base.unlocked = Object.assign({}, raw.unlocked || {});
    return base;
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(KEY);
      return normalize(raw ? JSON.parse(raw) : null);
    } catch (e) {
      return defaultProfile();
    }
  }

  const Achievements = {
    KEY,
    CATEGORIES,
    DEFS,
    profile: loadProfile(),
    filter: 'all',
    openState: false,
    _inited: false,
    _queue: [],
    _showing: false,
    _deferTimer: null,

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.profile)); } catch (e) { /* ignore */ }
    },

    getPoints() {
      let pts = 0;
      for (const d of DEFS) if (this.profile.unlocked[d.id]) pts += d.points;
      return pts;
    },

    getUnlockedCount() {
      return DEFS.filter((d) => !!this.profile.unlocked[d.id]).length;
    },

    getTitle() {
      const pts = this.getPoints();
      let title = TITLE_STEPS[0].name;
      for (const step of TITLE_STEPS) if (pts >= step.points) title = step.name;
      return title;
    },

    getSummary() {
      return {
        points: this.getPoints(),
        unlocked: this.getUnlockedCount(),
        total: DEFS.length,
        title: this.getTitle()
      };
    },

    iconFor(def, muted) {
      if (def.image) return def.image;
      if (window.GameAssets && GameAssets.icon(def.icon)) return GameAssets.icon(def.icon);
      if (window.Art) return Art.makeIcon(def.icon || 'victory', muted ? '#6f644f' : '#d9b26c');
      return '';
    },

    current(def) {
      try { return Number(def.value(this.profile.stats)) || 0; } catch (e) { return 0; }
    },

    evaluate() {
      const unlockedNow = [];
      let changed = false;
      for (const def of DEFS) {
        if (this.profile.unlocked[def.id]) continue;
        if (this.current(def) >= def.target) {
          this.profile.unlocked[def.id] = Date.now();
          unlockedNow.push(def);
          changed = true;
        }
      }
      if (changed) {
        this.save();
        this.refreshChrome();
        if (this.openState) this.render();
        for (const def of unlockedNow) this.queueUnlock(def);
      }
      return unlockedNow;
    },

    touch() {
      this.evaluate();
    },

    beginRun() {
      this.profile.stats.runs += 1;
      this.save();
      this.touch();
    },

    recordKill(isBoss) {
      this.profile.stats.kills += 1;
      this.touch();
    },

    recordBossKill(id, noHit) {
      this.profile.stats.bossKills += 1;
      if (id && this.profile.stats.bossesDefeated[id] !== undefined) {
        this.profile.stats.bossesDefeated[id] = true;
      }
      if (noHit) {
        this.profile.stats.noHitBosses += 1;
        if (id === 'lichking') this.profile.stats.noHitLichKing = 1;
      }
      this.touch();
    },

    recordChest(kind) {
      this.profile.stats.chests += 1;
      if (kind === 'boss') this.profile.stats.bossChests += 1;
      else this.profile.stats.normalChests += 1;
      this.touch();
    },

    recordChoice(skill, activeCount) {
      this.profile.stats.choices += 1;
      if (skill && skill.rarity === 'epic') this.profile.stats.epicChoices += 1;
      if (activeCount >= 4) this.profile.stats.fullActives = 1;
      this.touch();
    },

    recordLevel(level) {
      if (level > this.profile.stats.highestLevel) this.profile.stats.highestLevel = level;
      this.touch();
    },

    recordStage(stage) {
      if (stage > this.profile.stats.highestStage) this.profile.stats.highestStage = stage;
      this.touch();
    },

    recordRunEnd(victory, classId, stage, level) {
      if (victory) {
        this.profile.stats.victories += 1;
        if (classId && this.profile.stats.classesCleared[classId] !== undefined) {
          this.profile.stats.classesCleared[classId] = true;
        }
      } else {
        this.profile.stats.deaths += 1;
      }
      if (stage > this.profile.stats.highestStage) this.profile.stats.highestStage = stage;
      if (level > this.profile.stats.highestLevel) this.profile.stats.highestLevel = level;
      this.save();
      this.touch();
    },

    refreshChrome() {
      const summary = this.getSummary();
      const titleCount = document.getElementById('title-ach-count');
      if (titleCount) titleCount.textContent = summary.points;
      const pauseCount = document.getElementById('pause-ach-count');
      if (pauseCount) pauseCount.textContent = summary.points;
      const hudTitle = document.getElementById('hud-title');
      if (hudTitle) hudTitle.textContent = summary.title;
      const titleBtn = document.getElementById('title-achievements-btn');
      if (titleBtn) titleBtn.title = '成就点 ' + summary.points + ' · 已解锁 ' + summary.unlocked + '/' + summary.total;
    },

    init() {
      if (this._inited) return;
      this._inited = true;
      this.save();
      this.refreshChrome();
      const openBtns = ['title-achievements-btn', 'pause-achievements-btn', 'end-achievements-btn'];
      for (const id of openBtns) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => this.open());
      }
      const close = document.getElementById('ach-close-btn');
      if (close) close.addEventListener('click', () => this.close());
      const screen = document.getElementById('achievement-screen');
      if (screen) {
        screen.addEventListener('click', (e) => { if (e.target === screen) this.close(); });
      }
      const filters = document.getElementById('ach-filters');
      if (filters) {
        filters.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-cat]');
          if (!btn) return;
          this.filter = btn.dataset.cat;
          this.renderFilters();
          this.renderGrid();
          AudioEngine.sfx('click');
        });
      }
      this.renderFilters();
    },

    open() {
      const screen = document.getElementById('achievement-screen');
      if (!screen) return;
      this.openState = true;
      this.render();
      screen.classList.remove('hidden');
      const shell = document.querySelector('.game-shell');
      if (shell) shell.classList.add('achievements-open');
      if (window.RIFT && RIFT.hideTooltip) RIFT.hideTooltip();
      AudioEngine.sfx('click');
    },

    close() {
      const screen = document.getElementById('achievement-screen');
      if (screen) screen.classList.add('hidden');
      const shell = document.querySelector('.game-shell');
      if (shell) shell.classList.remove('achievements-open');
      this.openState = false;
      AudioEngine.sfx('click');
      this.refreshChrome();
    },

    isOpen() { return this.openState; },

    renderSummary() {
      const s = this.getSummary();
      const points = document.getElementById('ach-points');
      if (points) points.textContent = String(s.points);
      const count = document.getElementById('ach-count');
      if (count) count.textContent = s.unlocked + ' / ' + s.total;
      const title = document.getElementById('ach-title');
      if (title) title.textContent = s.title;
      const bar = document.getElementById('ach-progress-fill');
      if (bar) bar.style.width = (s.unlocked / s.total * 100) + '%';
    },

    renderFilters() {
      const el = document.getElementById('ach-filters');
      if (!el) return;
      el.innerHTML = Object.keys(CATEGORIES).map((cat) => {
        const list = cat === 'all' ? DEFS : DEFS.filter((d) => d.category === cat);
        const unlocked = list.filter((d) => this.profile.unlocked[d.id]).length;
        return '<button type="button" class="ach-filter' + (this.filter === cat ? ' active' : '') + '" data-cat="' + cat + '">' +
          CATEGORIES[cat] + '<span>' + unlocked + '/' + list.length + '</span></button>';
      }).join('');
    },

    renderGrid() {
      const el = document.getElementById('ach-grid');
      if (!el) return;
      const list = (this.filter === 'all' ? DEFS : DEFS.filter((d) => d.category === this.filter)).slice();
      list.sort((a, b) => {
        const ua = this.profile.unlocked[a.id] ? 1 : 0;
        const ub = this.profile.unlocked[b.id] ? 1 : 0;
        if (ua !== ub) return ub - ua;
        return DEFS.indexOf(a) - DEFS.indexOf(b);
      });
      el.innerHTML = list.map((def) => {
        const unlocked = !!this.profile.unlocked[def.id];
        const secretLocked = def.secret && !unlocked;
        const value = Math.min(this.current(def), def.target);
        const pct = Math.max(0, Math.min(100, value / def.target * 100));
        const name = secretLocked ? '隐藏成就' : def.name;
        const desc = secretLocked ? '达成隐藏条件后揭晓。' : def.desc;
        const img = secretLocked ? this.iconFor({ icon: 'achievement' }, true) : this.iconFor(def, !unlocked);
        const points = secretLocked ? '???' : def.points;
        return '<article class="ach-card ' + (unlocked ? 'unlocked' : 'locked') + (def.secret ? ' secret' : '') + '">' +
          '<div class="ach-card-icon"><img src="' + img + '" alt="" onerror="this.style.visibility=\'hidden\'"><span class="ach-card-points">' + points + '</span>' +
            (unlocked ? '<span class="ach-card-check">✓</span>' : '') +
          '</div>' +
          '<div class="ach-card-body">' +
            '<div class="ach-card-head"><span class="ach-cat">' + CATEGORIES[def.category] + '</span>' +
              '<span class="ach-status">' + (unlocked ? '已解锁' : '未解锁') + '</span></div>' +
            '<h3>' + name + '</h3>' +
            '<p>' + desc + '</p>' +
            (unlocked ? '' : (secretLocked ? '<span class="ach-progress-text">隐藏条件</span>' : '<div class="ach-bar"><i style="width:' + pct + '%"></i></div><span class="ach-progress-text">' + value + ' / ' + def.target + '</span>')) +
          '</div>' +
        '</article>';
      }).join('');
    },

    render() {
      this.renderSummary();
      this.renderFilters();
      this.renderGrid();
    },

    queueUnlock(def) {
      this._queue.push(def);
      this.refreshChrome();
      if (!this._showing) this.showNextUnlock();
    },

    showNextUnlock() {
      if (!this._queue.length) {
        this._showing = false;
        return;
      }
      const mode = window.RIFT && RIFT.game ? RIFT.game.mode : null;
      if (mode === 'cards') {
        // 三选一期间不遮挡卡牌，等玩家做出选择后再展示
        this._showing = true;
        clearTimeout(this._deferTimer);
        this._deferTimer = setTimeout(() => this.showNextUnlock(), 450);
        return;
      }
      this._showing = true;
      const def = this._queue.shift();
      const popup = document.getElementById('achievement-popup');
      if (!popup) {
        this._showing = false;
        return;
      }
      const img = document.getElementById('ach-popup-icon');
      const name = document.getElementById('ach-popup-name');
      const pts = document.getElementById('ach-popup-points');
      img.src = this.iconFor(def, false);
      img.style.visibility = 'visible';
      name.textContent = def.name;
      pts.textContent = '+' + def.points + ' 成就点';
      popup.classList.remove('show');
      void popup.offsetWidth;
      popup.classList.add('show');
      AudioEngine.sfx('achievement');
      setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => {
          this._showing = false;
          this.showNextUnlock();
        }, 320);
      }, 2700);
    }
  };

  window.Achievements = Achievements;
})();

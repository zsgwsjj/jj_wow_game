/* =========================================================
   艾泽拉斯：裂隙远征 — 渲染 / HUD / 三选一界面
   ========================================================= */
(function () {
  'use strict';

  const R = window.RIFT;
  const D = R.D;
  const ctx = R.ctx;
  const clamp = R.clamp;
  const TAU = Math.PI * 2;
  const UI = R.UI;

  const COLOR = {
    physical: '#ffe9c2',
    fire: '#ffb15b',
    frost: '#a9ecff',
    arcane: '#dcb9ff',
    poison: '#b6ff83',
    shadow: '#c59bff',
    holy: '#ffe7a3'
  };

  /* =========================================================
     BOOT / LOOP
     ========================================================= */
  R.boot = function () {
    if (R._booted) return;
    R._booted = true;
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(.033, Math.max(0, (now - last) / 1000));
      last = now;
      R.game.visualTime += dt;
      if (R.game.mode === 'playing') {
        R.update(dt);
      } else {
        R.game.shake = Math.max(0, R.game.shake - dt * 20);
      }
      render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* =========================================================
     MAIN RENDER
     ========================================================= */
  function render() {
    const g = R.game;
    if (g.mode === 'title') {
      renderTitle();
      return;
    }
    renderWorld();
  }

  function renderTitle() {
    const g = R.game;
    Art.drawTitleScene(ctx, R.W, R.H, g.visualTime);
    // 漂浮余烬
    for (let i = 0; i < 14; i++) {
      const x = (i * 83 + g.visualTime * (5 + i % 4)) % R.W;
      const y = R.H - ((i * 41 + g.visualTime * (10 + i % 5)) % R.H);
      ctx.globalAlpha = .18 + (i % 5) * .035;
      Art.px(ctx, x, y, 1 + (i % 2), 1 + (i % 2), i % 3 === 0 ? '#ffd47a' : '#a98b58');
    }
    ctx.globalAlpha = 1;
  }

  function renderWorld() {
    const g = R.game;
    const p = g.player;
    if (!p || !g.arenaCanvas) return;
    ctx.save();
    ctx.clearRect(0, 0, R.W, R.H);
    const shakeX = g.shake > .2 ? R.rand(-g.shake, g.shake) * .55 : 0;
    const shakeY = g.shake > .2 ? R.rand(-g.shake, g.shake) * .55 : 0;
    ctx.translate(-Math.round(g.camera.x + shakeX), -Math.round(g.camera.y + shakeY));

    // 地板
    ctx.drawImage(g.arenaCanvas, 0, 0);
    drawPlayerLight(g, p);
    drawBraziers(g);
    drawAmbient(g);
    drawTorches(g);
    drawSpawnMarkers(g);
    drawGroundEffects(g);
    drawDrawables(g, p);
    drawAirEffects(g);
    drawProjectiles(g);
    drawOrbs(g);
    drawParticles(g);
    drawWeatherFront(g);
    drawTexts(g);
    drawAimReticle(p);
    ctx.restore();

    drawScreenGrade(g);
    drawLowHp(g);
    drawMinimap(g);
  }

  function drawScreenGrade(g) {
    const kind = g.dungeon.theme && g.dungeon.theme.name;
    if (!kind) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    let grad;
    if (kind === 'ice') {
      grad = ctx.createLinearGradient(0, 0, 0, R.H);
      grad.addColorStop(0, 'rgba(120,210,255,.07)');
      grad.addColorStop(.5, 'rgba(80,150,220,0)');
      grad.addColorStop(1, 'rgba(40,100,180,.04)');
    } else if (kind === 'forge') {
      grad = ctx.createLinearGradient(0, R.H, 0, 0);
      grad.addColorStop(0, 'rgba(255,82,22,.09)');
      grad.addColorStop(.55, 'rgba(255,80,20,0)');
    } else if (kind === 'cave') {
      grad = ctx.createLinearGradient(0, 0, 0, R.H);
      grad.addColorStop(0, 'rgba(74,194,130,.06)');
      grad.addColorStop(.5, 'rgba(46,130,90,0)');
      grad.addColorStop(1, 'rgba(20,80,55,.05)');
    } else if (kind === 'keep') {
      grad = ctx.createLinearGradient(0, 0, 0, R.H);
      grad.addColorStop(0, 'rgba(88,112,210,.07)');
      grad.addColorStop(.6, 'rgba(70,70,160,0)');
      grad.addColorStop(1, 'rgba(30,25,80,.06)');
    } else {
      grad = ctx.createLinearGradient(0, R.H, 0, 0);
      grad.addColorStop(0, 'rgba(190,110,35,.06)');
      grad.addColorStop(.6, 'rgba(140,80,30,0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, R.W, R.H);
    ctx.restore();
  }

  function drawPlayerLight(g, p) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const color = p.classId === 'warrior' ? 'rgba(255,198,116,' : p.classId === 'priest' ? 'rgba(255,229,166,' : 'rgba(120,208,255,';
    const grad = ctx.createRadialGradient(p.x, p.y - 8, 8, p.x, p.y - 8, 185);
    grad.addColorStop(0, color + '.10)');
    grad.addColorStop(.45, color + '.045)');
    grad.addColorStop(1, color + '0)');
    ctx.fillStyle = grad;
    ctx.fillRect(p.x - 190, p.y - 200, 380, 380);
    ctx.restore();
  }

  function drawBraziers(g) {
    for (const b of g.braziers) Art.drawBrazier(ctx, b, g.visualTime, g.dungeon.theme);
  }


  function drawAmbient(g) {
    const t = g.visualTime;
    const theme = g.dungeon.theme;
    const kind = theme.name;
    const W = g.worldW, H = g.worldH;
    ctx.save();
    if (kind === 'ice') {
      // 冰冠堡垒：细雪与高空寒光
      for (let i = 0; i < 64; i++) {
        const x = (i * 97 + Math.sin(t * .35 + i) * 26 + W) % W;
        const y = (i * 61 + t * (10 + i % 5)) % H;
        ctx.globalAlpha = .26 + (i % 5) * .045;
        Art.px(ctx, x, y, i % 7 === 0 ? 3 : 2, i % 7 === 0 ? 2 : 1, i % 3 === 0 ? '#e9fbff' : theme.dust);
      }
      ctx.globalAlpha = .055;
      ctx.fillStyle = '#8ddcff';
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(127,220,255,.28)');
      grad.addColorStop(.55, 'rgba(127,220,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (kind === 'forge') {
      // 黑石深渊：上升的火星与热浪
      for (let i = 0; i < 46; i++) {
        const x = (i * 131 + Math.sin(t * .55 + i * 1.7) * 18 + W) % W;
        const y = H - ((i * 47 + t * (8 + i % 6)) % (H - 40));
        ctx.globalAlpha = .16 + (i % 5) * .035;
        const c = i % 4 === 0 ? '#ffd27a' : (i % 3 === 0 ? '#ff7b39' : theme.dust);
        if (i % 4 === 0) Art.glow(ctx, x, y, 7, 'rgba(255,145,50,.35)', .24);
        Art.px(ctx, x, y, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1, c);
      }
    } else if (kind === 'cave') {
      // 哀嚎洞穴：漂浮的孢子与毒雾微光
      for (let i = 0; i < 52; i++) {
        const x = (i * 113 + Math.sin(t * .32 + i) * 30 + W) % W;
        const y = H - ((i * 67 + t * (3 + i % 4)) % (H - 50));
        const a = .12 + (i % 5) * .03;
        ctx.globalAlpha = a;
        if (i % 5 === 0) Art.glow(ctx, x, y, 9, 'rgba(113,255,176,.3)', .25);
        Art.px(ctx, x, y, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, i % 3 === 0 ? '#b8ffd5' : theme.dust);
      }
      // 贴地毒雾
      for (let i = 0; i < 5; i++) {
        ctx.globalAlpha = .035;
        ctx.fillStyle = theme.glow;
        ctx.beginPath();
        ctx.ellipse((i * 223 + t * 7) % W, H * .55 + i * 14, 110, 18, 0, 0, TAU);
        ctx.fill();
      }
    } else if (kind === 'keep') {
      // 影牙城堡：幽蓝浮尘与雾带
      for (let i = 0; i < 44; i++) {
        const x = (i * 157 + Math.sin(t * .28 + i * 1.3) * 22 + W) % W;
        const y = 70 + ((i * 83 + t * (2 + i % 3)) % (H - 120));
        ctx.globalAlpha = .11 + (i % 5) * .03;
        if (i % 6 === 0) Art.glow(ctx, x, y, 8, 'rgba(153,178,255,.25)', .2);
        Art.px(ctx, x, y, 1, 1, i % 4 === 0 ? '#d7e2ff' : theme.dust);
      }
      for (let i = 0; i < 5; i++) {
        ctx.globalAlpha = .03;
        ctx.fillStyle = '#9fb4ff';
        ctx.beginPath();
        ctx.ellipse((i * 257 + t * 5) % W, H * .35 + i * 16, 130, 20, 0, 0, TAU);
        ctx.fill();
      }
    } else {
      // 死亡矿井：矿尘与偶尔滴落的水光
      for (let i = 0; i < 48; i++) {
        const x = (i * 149 + t * (3 + i % 4) + W) % W;
        const y = 40 + ((i * 73 + t * (2 + i % 3)) % (H - 80));
        ctx.globalAlpha = .08 + (i % 6) * .022;
        Art.px(ctx, x, y, 1, 1, i % 7 === 0 ? '#ffe1a3' : theme.dust);
      }
      for (let i = 0; i < 3; i++) {
        const x = (i * 337 + t * 2) % W;
        const y = 140 + ((i * 79 + t * 7) % (H - 180));
        ctx.globalAlpha = .18;
        Art.px(ctx, x, y, 1, 4, '#a9d6dd');
      }
    }
    ctx.restore();
  }

  function drawWeatherFront(g) {
    const t = g.visualTime;
    const theme = g.dungeon.theme;
    const kind = theme.name;
    const W = g.worldW, H = g.worldH;
    ctx.save();
    if (kind === 'ice' || kind === 'forge') {
      const count = kind === 'ice' ? 28 : 16;
      for (let i = 0; i < count; i++) {
        const x = (i * 211 + Math.sin(t * .5 + i) * 34 + W) % W;
        const y = kind === 'ice'
          ? (i * 113 + t * (16 + i % 6)) % H
          : H - ((i * 71 + t * (12 + i % 5)) % (H - 20));
        const c = kind === 'ice' ? '#e8fbff' : (i % 2 ? '#ffd27a' : '#ff8a3c');
        ctx.globalAlpha = kind === 'ice' ? .3 + (i % 4) * .07 : .22 + (i % 4) * .06;
        if (kind === 'forge' && i % 3 === 0) Art.glow(ctx, x, y, 10, 'rgba(255,110,40,.35)', .3);
        Art.px(ctx, x, y, kind === 'ice' ? (i % 5 === 0 ? 2 : 1) : (i % 4 === 0 ? 2 : 1), kind === 'ice' ? 1 : (i % 4 === 0 ? 2 : 1), c);
      }
    } else if (kind === 'cave' || kind === 'keep' || kind === 'mine') {
      // 前景雾带，制造景深
      const color = kind === 'cave' ? '#75e0aa' : kind === 'keep' ? '#a5b8ff' : '#d9ad72';
      for (let i = 0; i < 4; i++) {
        const x = ((i * 291 + t * (kind === 'keep' ? 4 : 6)) % (W + 260)) - 130;
        const y = H * .58 + i * 24 + Math.sin(t * .5 + i) * 6;
        ctx.globalAlpha = .028;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 180, 24, 0, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawTorches(g) {
    for (const t of g.torches) Art.drawTorch(ctx, t, g.visualTime, g.dungeon.theme);
  }

  function drawSpawnMarkers(g) {
    const t = g.visualTime;
    for (const s of g.pendingSpawns) {
      const progress = 1 - Math.max(0, s.timer) / Math.max(.01, s.maxTimer);
      const radius = 16 + progress * 14;
      ctx.save();
      ctx.globalAlpha = .26 + progress * .25;
      ctx.strokeStyle = g.dungeon.theme.danger;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, radius, radius * .4, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = .22;
      ctx.fillStyle = g.dungeon.theme.danger;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, radius * .8, radius * .32, 0, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        const a = t * .7 + i * TAU / 4;
        Art.px(ctx, s.x + Math.cos(a) * radius - 1, s.y + Math.sin(a) * radius * .4, 2, 2, '#ffd59a');
      }
      ctx.globalAlpha = .8;
      Art.px(ctx, s.x - 1, s.y - radius * .4, 2, 2, '#ffe3ac');
      ctx.restore();
    }
  }


  function drawGroundEffects(g) {
    for (const e of g.effects) {
      if (e.type === 'telegraph') drawTelegraph(e, g);
      else if (e.type === 'rune') drawGroundRune(e, g);
    }
  }

  function drawGroundRune(e, g) {
    const k = Math.max(0, e.timer / e.duration);
    const p = 1 - k;
    const r = e.r || 36;
    const x = e.x, y = e.y + 2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .12 * k;
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * .45, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = .58 * k;
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, r * (.88 + p * .12), r * .4, 0, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = .26 * k;
    ctx.beginPath();
    ctx.ellipse(x, y, r * .62, r * .28, 0, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = .7 * k;
    for (let i = 0; i < 12; i++) {
      const a = g.visualTime * .45 + i * TAU / 12;
      const px = x + Math.cos(a) * r * .78;
      const py = y + Math.sin(a) * r * .34;
      Art.px(ctx, px - 1, py - 1, 2, 2, e.color);
    }
    for (let i = 0; i < 6; i++) {
      const a = -g.visualTime * .3 + i * TAU / 6;
      Art.px(ctx, x + Math.cos(a) * r * .45 - 1, y + Math.sin(a) * r * .2 - 1, 2, 2, '#fff2c4');
    }
    ctx.restore();
  }

  function drawTelegraph(e, g) {
    const progress = clamp(1 - e.timer / e.duration, 0, 1);
    const x = e.x, y = e.y, r = e.radius;
    ctx.save();
    // 危险区
    ctx.globalAlpha = .10 + progress * .14;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, e.color);
    grad.addColorStop(1, 'rgba(120,20,12,.25)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * .42, 0, 0, TAU);
    ctx.fill();
    // 外圈
    ctx.globalAlpha = .62;
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * .42, 0, 0, TAU);
    ctx.stroke();
    // 进度圈
    ctx.globalAlpha = .85;
    ctx.strokeStyle = '#ffe3ac';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, r * .92, r * .386, 0, -Math.PI / 2, -Math.PI / 2 + TAU * progress);
    ctx.stroke();
    // 符文刻度
    ctx.globalAlpha = .45;
    for (let i = 0; i < 8; i++) {
      const a = g.visualTime * .5 + i * TAU / 8;
      const rx = x + Math.cos(a) * r * .88;
      const ry = y + Math.sin(a) * r * .37;
      Art.px(ctx, rx - 1, ry - 1, 2, 2, e.color);
    }
    // 即将落下的火雨
    if (e.meteor) {
      ctx.globalAlpha = .7;
      const fall = (g.visualTime * 1.6) % 1;
      const mx = x + 34 * (1 - fall);
      const my = y - 90 * (1 - fall) - 20;
      Art.px(ctx, mx, my, 3, 3, '#ffd784');
      Art.px(ctx, mx - 3, my - 3, 1, 1, '#ff8b3e');
    }
    ctx.restore();
  }

  function drawDrawables(g, p) {
    const list = [];
    for (const prop of g.props) list.push({ y: prop.y, kind: 'prop', obj: prop });
    for (const chest of g.chests) list.push({ y: chest.y, kind: 'chest', obj: chest });
    for (const portal of g.portals) list.push({ y: portal.y, kind: 'portal', obj: portal });
    for (const e of g.enemies) {
      if (!e.dead) list.push({ y: e.y, kind: 'enemy', obj: e });
    }
    list.push({ y: p.y, kind: 'player', obj: p });
    list.sort((a, b) => a.y - b.y);

    for (const item of list) {
      if (item.kind === 'prop') {
        Art.drawProp(ctx, item.obj);
      } else if (item.kind === 'chest') {
        drawChestHighlight(item.obj, p, g);
        Art.drawChest(ctx, item.obj, g.visualTime);
      } else if (item.kind === 'portal') {
        Art.drawPortal(ctx, item.obj, g.visualTime);
      } else if (item.kind === 'enemy') {
        const e = item.obj;
        if (e.isBoss) Art.drawBoss(ctx, e);
        else Art.drawEnemy(ctx, e);
        if (!e.isBoss) drawEnemyHealth(e);
        else drawBossCastRing(e, g);
      } else if (item.kind === 'player') {
        drawPlayerHalo(p);
        Art.drawPlayer(ctx, p);
      }
    }
  }

  function drawPlayerHalo(p) {
    const color = p.classId === 'warrior' ? '#d8b06a' : p.classId === 'priest' ? '#ffe2a0' : '#74d9ff';
    ctx.save();
    if (p.classId === 'priest') {
      ctx.globalAlpha = .07 + Math.sin(R.game.visualTime * 2) * .02;
      ctx.fillStyle = '#f1dfae';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 19, 8, 0, 0, TAU); ctx.fill();
    }
    if (p.classId === 'mage') {
      ctx.globalAlpha = .07 + Math.sin(R.game.visualTime * 2) * .02;
      ctx.fillStyle = '#69ccf0';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 18, 8, 0, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = .38;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, 15, 5.5, 0, 0, TAU); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = i * TAU / 4 + R.game.visualTime * .5;
      Art.px(ctx, p.x + Math.cos(a) * 17, p.y + 1 + Math.sin(a) * 6, 2, 1, color);
    }
    ctx.restore();
  }

  function drawChestHighlight(chest, p, g) {
    if (chest.opened) return;
    const d = Math.hypot(chest.x - p.x, chest.y - p.y);
    if (d > 90) return;
    ctx.save();
    const pulse = .35 + Math.sin(g.visualTime * 3) * .15;
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = chest.kind === 'boss' ? '#d8a6ff' : '#ffd47a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(chest.x, chest.y + 1, 22 + Math.sin(g.visualTime * 2) * 3, 8, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawEnemyHealth(e) {
    const damaged = e.hp < e.maxHp - .1;
    if (!damaged && e.windup <= 0 && e.frozen <= 0 && e.stun <= 0) return;
    const w = 20;
    const x = e.x - w / 2;
    const y = e.y - 31 * e.scale - 7;
    ctx.save();
    ctx.globalAlpha = .82;
    Art.px(ctx, x - 1, y - 1, w + 2, 4, '#08090c');
    ctx.globalAlpha = 1;
    Art.px(ctx, x, y, w, 2, '#27140f');
    Art.px(ctx, x, y, w * clamp(e.hp / e.maxHp, 0, 1), 2, e.hp / e.maxHp > .4 ? '#bb3b32' : '#e45a46');
    if (e.windup > 0) {
      const k = 1 - e.windup / (e.windupMax || .5);
      Art.px(ctx, x, y - 3, w, 1, '#3b2a16');
      Art.px(ctx, x, y - 3, w * clamp(k, 0, 1), 1, '#ffd06a');
      Art.px(ctx, e.x - 1, y - 8, 2, 4, '#ffcf73');
      Art.px(ctx, e.x - 1, y - 3, 2, 1, '#ffcf73');
    }
    if (e.frozen > 0) Art.px(ctx, x, y - 3, w, 1, '#9beaff');
    ctx.restore();
  }

  function drawBossCastRing(b, g) {
    if (!b.cast) return;
    const k = 1 - b.cast.timer / b.cast.duration;
    const radius = 34 + k * 10;
    ctx.save();
    ctx.globalAlpha = .35 + Math.sin(g.visualTime * 9) * .1;
    ctx.strokeStyle = b.cast.type === 'ring' ? '#ff8a5e' : '#ffd37a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + 2, radius, radius * .38, 0, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = .18 + k * .2;
    ctx.fillStyle = '#ffcf78';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + 2, radius * .8, radius * .3, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }


  function drawAirEffects(g) {
    for (const e of g.effects) {
      if (e.type === 'ring') {
        const k = Math.max(0, e.timer / e.duration);
        const p = 1 - k;
        const r = Math.max(1, e.r);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = k * .16;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = k * .9;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = e.width || 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = k * .38;
        ctx.lineWidth = (e.width || 2) * .55;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r * .82, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = k * .75;
        for (let i = 0; i < 10; i++) {
          const a = i * TAU / 10 + p * 1.1;
          Art.px(ctx, e.x + Math.cos(a) * r * .92, e.y + Math.sin(a) * r * .92, 2, 1, e.color);
        }
        ctx.restore();
      } else if (e.type === 'impact') {
        const k = Math.max(0, e.timer / e.duration);
        const p = 1 - k;
        const r = (e.size || 10) * (1 + p * 1.7);
        const seed = e.seed || 0;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = k * .75;
        for (let i = 0; i < 8; i++) {
          const a = seed + i * TAU / 8;
          const len = r * (.55 + (i % 3) * .2);
          ctx.strokeStyle = i % 2 ? '#fff7dc' : e.color;
          ctx.lineWidth = i % 2 ? 1 : 2;
          ctx.beginPath();
          ctx.moveTo(e.x + Math.cos(a) * r * .2, e.y + Math.sin(a) * r * .2);
          ctx.lineTo(e.x + Math.cos(a) * len, e.y + Math.sin(a) * len);
          ctx.stroke();
          Art.px(ctx, e.x + Math.cos(a) * len - 1, e.y + Math.sin(a) * len - 1, 2, 2, '#fff4cf');
        }
        ctx.globalAlpha = k * .22;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r * .7, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (e.type === 'slash') {
        const k = Math.max(0, e.timer / e.duration);
        const p = 1 - k;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        // 宽光带
        ctx.globalAlpha = k * .24;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = (e.width || 10) * (.5 + p);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * (.8 + p * .06), e.angle - e.arc * .5, e.angle + e.arc * .5);
        ctx.stroke();
        // 白色刃光
        ctx.globalAlpha = k * .82;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2 + k * 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * .88, e.angle - e.arc * .46, e.angle + e.arc * .46);
        ctx.stroke();
        ctx.globalAlpha = k * .9;
        ctx.strokeStyle = '#fff7dd';
        ctx.lineWidth = 1.2 + k * 1.6;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, e.angle - e.arc * .4, e.angle + e.arc * .4);
        ctx.stroke();
        // 刃口火星
        ctx.globalAlpha = k * .75;
        for (let i = 0; i < 7; i++) {
          const a = e.angle - e.arc * .42 + (i / 6) * e.arc * .84;
          const rr = e.radius * (.9 + (i % 2) * .08);
          Art.px(ctx, e.x + Math.cos(a) * rr - 1, e.y + Math.sin(a) * rr - 1, 2, 2, i % 2 ? '#fff1c7' : e.color);
        }
        ctx.restore();
      } else if (e.type === 'line') {
        const k = Math.max(0, e.timer / e.duration);
        const dx = e.x2 - e.x1, dy = e.y2 - e.y1;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.globalAlpha = k * .24;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = (e.width || 6) * 3;
        ctx.beginPath(); ctx.moveTo(e.x1, e.y1); ctx.lineTo(e.x2, e.y2); ctx.stroke();
        ctx.globalAlpha = k * .8;
        ctx.lineWidth = e.width || 6;
        ctx.beginPath(); ctx.moveTo(e.x1, e.y1); ctx.lineTo(e.x2, e.y2); ctx.stroke();
        ctx.globalAlpha = k * .95;
        ctx.strokeStyle = '#fff7dc';
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(e.x1, e.y1); ctx.lineTo(e.x2, e.y2); ctx.stroke();
        // 沿线能量刻度
        ctx.globalAlpha = k * .8;
        for (let i = 1; i < 6; i++) {
          const t = i / 6 + Math.sin(g.visualTime * 5 + i) * .03;
          const px = e.x1 + dx * t + nx * (i % 2 ? 3 : -3);
          const py = e.y1 + dy * t + ny * (i % 2 ? 3 : -3);
          Art.px(ctx, px - 1, py - 1, 2, 2, '#fff2c0');
        }
        ctx.restore();
      }
    }
  }

  function drawProjectiles(g) {
    for (const p of g.projectiles) {
      Art.drawProjectile(ctx, p);
    }
  }

  function drawOrbs(g) {
    const t = g.visualTime;
    for (const o of g.orbs) {
      const bob = Math.sin(t * 5 + o.seed) * 2;
      ctx.save();
      Art.glow(ctx, o.x, o.y + bob, 9, 'rgba(255,214,120,.5)', .35);
      Art.poly(ctx, [[o.x, o.y - 5 + bob], [o.x + 4, o.y + bob], [o.x, o.y + 5 + bob], [o.x - 4, o.y + bob]], '#ffd66e');
      Art.px(ctx, o.x - 1, o.y - 2 + bob, 2, 2, '#fff3c2');
      ctx.restore();
    }
  }

  function drawParticles(g) {
    for (const p of g.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = Math.min(1, a * 1.6);
      if (p.glow) {
        ctx.globalAlpha = Math.min(1, a * .3);
        Art.px(ctx, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2, p.color);
        ctx.globalAlpha = Math.min(1, a * 1.4);
      }
      Art.px(ctx, p.x, p.y, p.size, p.size, p.color);
    }
    ctx.globalAlpha = 1;
  }

  function drawTexts(g) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of g.texts) {
      const a = Math.min(1, t.life / t.maxLife * 1.8);
      ctx.globalAlpha = a;
      ctx.font = 'bold ' + Math.round(t.size) + 'px "SFMono-Regular", "Courier New", monospace';
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = 'rgba(4,5,8,.9)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }

  function drawAimReticle(p) {
    const g = R.game;
    if (g.mode !== 'playing') return;
    const m = R.input.mouse;
    const x = m.worldX, y = m.worldY;
    const color = p.classId === 'warrior' ? '#e2bc77' : p.classId === 'priest' ? '#ffe7a3' : '#8fe8ff';
    const pulse = 1 + Math.sin(g.visualTime * 6) * .08;
    ctx.save();
    ctx.globalAlpha = .65;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    const r = 7 * pulse;
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const x1 = x + Math.cos(a) * (r + 2), y1 = y + Math.sin(a) * (r + 2);
      const x2 = x + Math.cos(a) * (r + 7), y2 = y + Math.sin(a) * (r + 7);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.globalAlpha = .9;
    Art.px(ctx, x - 1, y - 1, 2, 2, color);
    ctx.restore();
  }

  function drawLowHp(g) {
    const p = g.player;
    if (!p || g.mode === 'title') return;
    const ratio = p.hp / p.maxHp;
    if (ratio > .32) return;
    const a = (.32 - ratio) / .32;
    ctx.save();
    ctx.globalAlpha = .12 + a * .2 + Math.sin(g.visualTime * 5) * .03;
    const grad = ctx.createRadialGradient(R.W / 2, R.H / 2, R.H * .25, R.W / 2, R.H / 2, R.W * .7);
    grad.addColorStop(0, 'rgba(120,8,8,0)');
    grad.addColorStop(1, 'rgba(150,14,10,.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, R.W, R.H);
    ctx.restore();
  }

  /* =========================================================
     MINIMAP
     ========================================================= */
  function drawMinimap(g) {
    const c = R.minimapCtx;
    const S = 132;
    c.clearRect(0, 0, S, S);
    c.fillStyle = '#06080b';
    c.fillRect(0, 0, S, S);
    if (!g.dungeon) return;
    const pad = 9;
    const scale = Math.min((S - pad * 2) / g.worldW, (S - pad * 2) / g.worldH);
    const ox = (S - g.worldW * scale) / 2;
    const oy = (S - g.worldH * scale) / 2;
    // 场地
    c.fillStyle = g.dungeon.theme.floor[0];
    c.globalAlpha = .75;
    c.fillRect(ox, oy, g.worldW * scale, g.worldH * scale);
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(0,0,0,.18)';
    for (let i = 1; i < 6; i++) {
      c.fillRect(ox + g.worldW * scale * i / 6, oy, 1, g.worldH * scale);
      c.fillRect(ox, oy + g.worldH * scale * i / 6, g.worldW * scale, 1);
    }
    c.strokeStyle = g.dungeon.theme.accent + '88';
    c.lineWidth = 1;
    c.strokeRect(ox + .5, oy + .5, g.worldW * scale - 1, g.worldH * scale - 1);
    c.strokeStyle = 'rgba(0,0,0,.7)';
    c.strokeRect(ox + 2.5, oy + 2.5, g.worldW * scale - 5, g.worldH * scale - 5);
    // 中央符文标记
    c.strokeStyle = g.dungeon.theme.accent + '44';
    c.beginPath();
    c.arc(ox + g.worldW * scale / 2, oy + g.worldH * scale / 2, 8, 0, TAU);
    c.stroke();
    // 小怪
    for (const e of g.enemies) {
      if (e.dead) continue;
      if (e.isBoss) continue;
      c.fillStyle = e.frozen > 0 ? '#8fe8ff' : '#ff6b5a';
      c.fillRect(ox + e.x * scale - 1, oy + e.y * scale - 1, 2, 2);
      c.globalAlpha = .25;
      c.fillRect(ox + e.x * scale - 2.5, oy + e.y * scale - 2.5, 5, 5);
      c.globalAlpha = 1;
    }
    // 首领
    if (g.boss && !g.boss.dead) {
      c.fillStyle = '#ffcc63';
      const bx = ox + g.boss.x * scale, by = oy + g.boss.y * scale;
      c.fillRect(bx - 2, by - 2, 4, 4);
      c.strokeStyle = 'rgba(255,204,99,.5)';
      c.beginPath(); c.arc(bx, by, 5 + Math.sin(g.visualTime * 4) * 1.5, 0, TAU); c.stroke();
    }
    // 宝箱
    for (const chest of g.chests) {
      if (chest.opened) continue;
      c.fillStyle = chest.kind === 'boss' ? '#d8a6ff' : '#ffd47a';
      c.fillRect(ox + chest.x * scale - 1.5, oy + chest.y * scale - 1.5, 3, 3);
    }
    // 传送门
    for (const portal of g.portals) {
      c.strokeStyle = '#8fe8ff';
      c.lineWidth = 1;
      c.beginPath(); c.arc(ox + portal.x * scale, oy + portal.y * scale, 3, 0, TAU); c.stroke();
    }
    // 玩家
    const px = ox + g.player.x * scale, py = oy + g.player.y * scale;
    c.fillStyle = '#fff4d4';
    c.fillRect(px - 1.5, py - 1.5, 3, 3);
    c.strokeStyle = 'rgba(255,244,212,.4)';
    c.beginPath(); c.arc(px, py, 4.5 + Math.sin(g.visualTime * 3) * 1, 0, TAU); c.stroke();
    // 视野
    c.strokeStyle = 'rgba(216,178,108,.18)';
    c.strokeRect(ox + g.camera.x * scale, oy + g.camera.y * scale, R.W * scale, R.H * scale);
    // 装饰边框
    c.strokeStyle = 'rgba(135,107,60,.35)';
    c.strokeRect(4.5, 4.5, S - 9, S - 9);
  }

  /* =========================================================
     HUD
     ========================================================= */
  R.updateHUD = function () {
    const g = R.game;
    const p = g.player;
    if (!p) return;
    const hpPct = clamp(p.hp / p.maxHp, 0, 1) * 100;
    const resPct = clamp(p.resource / p.maxResource, 0, 1) * 100;
    UI.hpFill.style.width = hpPct + '%';
    UI.hpText.textContent = Math.ceil(p.hp) + ' / ' + p.maxHp;
    UI.resourceFill.style.width = resPct + '%';
    UI.resourceText.textContent = Math.floor(p.resource) + ' / ' + p.maxResource;
    UI.xpFill.style.width = clamp(p.xp / p.xpNext, 0, 1) * 100 + '%';
    UI.xpText.textContent = Math.floor(p.xp) + ' / ' + p.xpNext;
    UI.hudLevel.textContent = String(p.level);
    UI.kills.textContent = String(g.stats.kills);
    UI.chests.textContent = String(g.stats.chests);
    UI.shieldBadge.classList.add('hidden');
    R.updateBuffRow(p);
    R.updatePassiveRow(p);
    R.updateAbilityHUD();
  };

  R.rebuildAbilityBar = function () {
    const g = R.game;
    const p = g.player;
    if (!p) return;
    const basic = p.cls.basic;
    const basicIcon = Art.makeIcon(basic.icon, p.cls.color);
    UI.basicSlot.innerHTML =
      '<div class="ability-slot basic-ability" data-basic="1">' +
        '<img src="' + basicIcon + '" alt="' + basic.name + '">' +
        '<span class="slot-key">LMB</span>' +
      '</div>' +
      '<span class="basic-label">' + basic.name + '</span>';
    const basicEl = UI.basicSlot.querySelector('.ability-slot');
    if (basicEl) {
      basicEl.addEventListener('mouseenter', () => R.showTooltip(basicEl, {
        type: 'basic', name: basic.name, icon: basic.icon,
        desc: basic.desc, cost: 0, cooldown: basic.cooldown
      }));
      basicEl.addEventListener('mouseleave', () => R.hideTooltip());
    }
    UI.abilitySlots.innerHTML = '';
    R.slotEls = [];
    for (let i = 0; i < D.BALANCE.maxActives; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ability-slot empty';
      btn.dataset.slot = String(i);
      btn.innerHTML =
        '<img alt="" style="display:none">' +
        '<span class="slot-key">' + (i + 1) + '</span>' +
        '<span class="cd-mask"></span>' +
        '<span class="cd-text"></span>';
      btn.addEventListener('click', () => {
        if (R.game.mode === 'playing') R.useAbility(i);
      });
      btn.addEventListener('mouseenter', () => {
        const pp = R.game.player;
        if (!pp) return;
        const id = pp.abilities[i];
        if (!id) { R.hideTooltip(); return; }
        const skill = D.getSkill(pp.classId, id);
        if (skill) R.showTooltip(btn, skill);
      });
      btn.addEventListener('mouseleave', () => R.hideTooltip());
      UI.abilitySlots.appendChild(btn);
      R.slotEls.push(btn);
    }
    R.updateAbilityHUD();
  };

  R.updateAbilityHUD = function () {
    const g = R.game;
    const p = g.player;
    if (!p || !R.slotEls) return;
    for (let i = 0; i < R.slotEls.length; i++) {
      const btn = R.slotEls[i];
      const id = p.abilities[i];
      const img = btn.querySelector('img');
      const mask = btn.querySelector('.cd-mask');
      const cdText = btn.querySelector('.cd-text');
      if (!id) {
        btn.classList.add('empty');
        btn.classList.remove('cooling', 'poor');
        img.style.display = 'none';
        img.removeAttribute('src');
        btn.dataset.skillId = '';
        mask.style.height = '0%';
        cdText.textContent = '';
        continue;
      }
      const skill = D.getSkill(p.classId, id);
      if (!skill) continue;
      btn.classList.remove('empty');
      if (btn.dataset.skillId !== id) {
        btn.dataset.skillId = id;
        img.src = Art.makeIcon(skill.icon, D.RARITY[skill.rarity].color);
        img.style.display = 'block';
      }
      const cd = p.cooldowns[id] || 0;
      const max = skill.cooldown * (p.cdrMult || 1);
      if (cd > .05) {
        btn.classList.add('cooling');
        mask.style.height = Math.min(100, cd / max * 100) + '%';
        cdText.textContent = cd >= 1 ? String(Math.ceil(cd)) : cd.toFixed(1);
      } else {
        btn.classList.remove('cooling');
        mask.style.height = '0%';
        cdText.textContent = '';
      }
      const poor = p.resource < (skill.cost || 0);
      btn.classList.toggle('poor', poor && cd <= .05);
    }
  };

  R.flashSlot = function (i) {
    const btn = R.slotEls && R.slotEls[i];
    if (!btn) return;
    btn.classList.remove('flash');
    void btn.offsetWidth;
    btn.classList.add('flash');
    setTimeout(() => btn.classList.remove('flash'), 300);
  };

  R.updateWavePips = function () {
    const g = R.game;
    if (!UI.wavePips) return;
    Array.from(UI.wavePips.children).forEach((el) => {
      el.classList.remove('done', 'active');
      if (el.dataset.boss) {
        if (g.bossDefeated || g.phase === 'loot' || g.phase === 'portal') el.classList.add('done');
        else if (g.phase === 'boss') el.classList.add('active');
        else if (g.phase === 'between' && g.nextIsBoss) el.classList.add('active');
      } else {
        const n = Number(el.dataset.wave);
        if (g.phase === 'boss' || g.phase === 'loot' || g.phase === 'portal' || g.wave > n) el.classList.add('done');
        else if ((g.phase === 'intro' && n === 1) || (g.wave === n && g.phase === 'waves')) el.classList.add('active');
      }
    });
  };


  R.renderBuildPanel = function () {
    const el = UI.pauseBuild;
    const g = R.game;
    const p = g.player;
    if (!el) return;
    if (!p) { el.innerHTML = ''; return; }
    const activeIcons = [];
    for (let i = 0; i < D.BALANCE.maxActives; i++) {
      const id = p.abilities[i];
      if (!id) {
        activeIcons.push('<span class="build-icon empty"></span>');
        continue;
      }
      const s = D.getSkill(p.classId, id);
      if (!s) { activeIcons.push('<span class="build-icon empty"></span>'); continue; }
      activeIcons.push(
        '<span class="build-icon" title="' + s.name + '">' +
          '<img src="' + Art.makeIcon(s.icon, D.RARITY[s.rarity].color) + '" alt="' + s.name + '" onerror="this.style.display=\'none\'">' +
        '</span>'
      );
    }
    const passiveIcons = [];
    const passives = Object.keys(p.passives || {}).filter((id) => (p.passives[id] || 0) > 0);
    const runes = Object.keys(p.runes || {});
    const addPassiveIcon = (id, rank, isRune) => {
      const s = D.getSkill(p.classId, id);
      if (!s) return;
      passiveIcons.push(
        '<span class="build-icon ' + (isRune ? 'rune' : 'passive') + '" title="' + s.name + (rank > 1 ? ' ' + R.toRoman(rank) : '') + '">' +
          '<img src="' + Art.makeIcon(s.icon, D.RARITY[s.rarity].color) + '" alt="' + s.name + '" onerror="this.style.display=\'none\'">' +
          (isRune ? '<span class="build-rank rune-mark">◆</span>' : (rank > 1 ? '<span class="build-rank">' + R.toRoman(rank) + '</span>' : '')) +
        '</span>'
      );
    };
    for (const id of passives.slice(0, 8)) addPassiveIcon(id, p.passives[id] || 0, false);
    for (const id of runes) addPassiveIcon(id, 1, true);
    if (!passiveIcons.length) {
      for (let i = 0; i < 4; i++) passiveIcons.push('<span class="build-icon passive empty"></span>');
    }
    el.innerHTML =
      '<div class="build-heading">本次构筑 · ' + p.cls.name + '<span>主动 <b>' + p.abilities.length + '/4</b> · 被动 <b>' + passives.length + '</b> · 符文 <b>' + runes.length + '</b></span></div>' +
      '<div class="build-sections">' +
        '<div class="build-row"><span class="build-row-label">主动</span><div class="build-icons">' + activeIcons.join('') + '</div></div>' +
        '<div class="build-row"><span class="build-row-label">被动</span><div class="build-icons">' + passiveIcons.join('') + '</div></div>' +
      '</div>';
  };


  R.updatePassiveRow = function (p) {
    const el = UI.passiveRow;
    if (!el || !p) return;
    const passives = Object.keys(p.passives || {}).filter((id) => (p.passives[id] || 0) > 0);
    const runes = Object.keys(p.runes || {});
    const sig = passives.map((id) => id + ':' + p.passives[id]).join(',') + '|' + runes.join(',');
    if (p._passiveSig === sig) return;
    p._passiveSig = sig;
    if (UI.passiveLabel) UI.passiveLabel.textContent = '被动 ' + (passives.length + runes.length);
    const items = [];
    const addChip = (id, rank, isRune) => {
      const s = D.getSkill(p.classId, id);
      if (!s) return;
      const icon = Art.makeIcon(s.icon, D.RARITY[s.rarity] ? D.RARITY[s.rarity].color : '#c9a25e');
      const label = s.name + (rank > 1 ? ' ' + R.toRoman(rank) : '') + ' · ' + (s.tag || (isRune ? '联动符文' : '被动'));
      items.push(
        '<span class="passive-chip' + (isRune ? ' rune' : '') + '" data-skill="' + id + '" title="' + label + '">' +
          '<img src="' + icon + '" alt="' + s.name + '" onerror="this.style.display=\'none\'">' +
          (isRune ? '<span class="passive-rank rune-mark">◆</span>' : (rank > 1 ? '<span class="passive-rank">' + R.toRoman(rank) + '</span>' : '')) +
        '</span>'
      );
    };
    for (const id of passives) addChip(id, p.passives[id] || 1, false);
    for (const id of runes) addChip(id, 1, true);
    if (!items.length) {
      el.innerHTML = '<span class="passive-empty">尚未获得被动</span>';
      return;
    }
    const overflow = Math.max(0, items.length - 9);
    el.innerHTML = items.slice(0, 9).join('') + (overflow ? '<span class="passive-more">+' + overflow + '</span>' : '');
    el.querySelectorAll('.passive-chip[data-skill]').forEach((chip) => {
      const skill = D.getSkill(p.classId, chip.getAttribute('data-skill'));
      if (!skill) return;
      chip.addEventListener('mouseenter', () => R.showTooltip(chip, skill));
      chip.addEventListener('mouseleave', () => R.hideTooltip());
    });
  };

  R.updateBuffRow = function (p) {
    const row = UI.buffRow;
    if (!row) return;
    const items = [];
    if (p.shield > 0) {
      items.push({
        cls: 'shield',
        icon: p.classId === 'warrior' ? 'shield' : p.classId === 'priest' ? 'pwshield' : 'icebarrier',
        time: Math.max(0, p.shieldTimer),
        value: Math.ceil(p.shield),
        stack: Math.ceil(p.shield),
        label: '护盾 ' + Math.ceil(p.shield)
      });
    }
    if (p.renewTime > 0) {
      items.push({
        cls: 'renew',
        icon: 'renew',
        time: p.renewTime,
        label: '恢复 · 每秒 ' + (p.renewHeal * (p.healMult || 1)).toFixed(1)
      });
    }
    if (p.buffs && p.buffs.focusedWill > 0) {
      items.push({
        cls: 'focus',
        icon: 'innerfire',
        time: p.buffs.focusedWill,
        label: '专注意志 · 减伤'
      });
    }
    if (p.buffs && p.buffs.bloodlust > 0) {
      items.push({
        cls: 'rage',
        icon: 'bloodlust',
        time: p.buffs.bloodlust,
        stack: p.buffs.bloodlustStacks,
        label: '嗜血 ' + p.buffs.bloodlustStacks + ' 层'
      });
    }
    const sig = items.map((it) => it.cls + it.time.toFixed(1) + (it.value || '') + (it.stack || '')).join('|');
    if (row.dataset.sig === sig) return;
    row.dataset.sig = sig;
    row.innerHTML = items.map((it) =>
      '<span class="buff-chip ' + it.cls + '" title="' + it.label + '">' +
        '<img src="' + Art.makeIcon(it.icon, '#d9b26c') + '" alt="" onerror="this.style.display=\'none\'">' +
        (it.stack > 1 ? '<b class="buff-stack">' + it.stack + '</b>' : '') +
        '<span class="buff-time">' + Math.ceil(it.time) + '</span>' +
      '</span>'
    ).join('');
  };

  /* =========================================================
     TOOLTIP
     ========================================================= */
  R.showTooltip = function (anchor, skill) {
    const g = R.game;
    const p = g.player;
    if (!p) return;
    const rarity = D.RARITY[skill.rarity || 'rare'] || D.RARITY.rare;
    const typeLabel = skill.type === 'passive' ? '被动天赋' : skill.type === 'rune' ? '联动符文' : skill.type === 'basic' ? '普通攻击' : '主动技能';
    const desc = typeof skill.desc === 'function' ? skill.desc(p.level) : skill.desc;
    const tagText = skill.type === 'passive' && skill.tag ? skill.tag.replace(/^被动\s*·\s*/, '') : skill.tag;
    const meta = [];
    if (skill.cost) meta.push('<span>消耗 <b>' + skill.cost + '</b> ' + p.cls.resourceName + '</span>');
    if (skill.cooldown) meta.push('<span>冷却 <b>' + (skill.cooldown * (p.cdrMult || 1)).toFixed(1) + 's</b></span>');
    const iconSrc = Art.makeIcon(skill.icon, rarity.color);
    UI.tooltip.innerHTML =
      '<div class="tooltip-head">' +
        '<img src="' + iconSrc + '" alt="">' +
        '<div>' +
          '<div class="tooltip-name" style="color:' + rarity.color + '">' + skill.name + '</div>' +
          '<div class="tooltip-type">' + typeLabel + (tagText ? ' · ' + tagText : '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tooltip-desc">' + desc + '</div>' +
      (meta.length ? '<div class="tooltip-meta">' + meta.join('') + '</div>' : '') +
      (skill.flavor ? '<div class="tooltip-flavor">' + skill.flavor + '</div>' : '');
    UI.tooltip.classList.remove('hidden');
    const shellRect = UI.shell.getBoundingClientRect();
    const rect = anchor.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - shellRect.left;
    const top = rect.top - shellRect.top - 8;
    const widthPct = 17.5 * shellRect.width / 100;
    left = clamp(left, widthPct / 2 + 8, shellRect.width - widthPct / 2 - 8);
    UI.tooltip.style.left = left + 'px';
    UI.tooltip.style.top = top + 'px';
  };

  R.hideTooltip = function () {
    if (UI.tooltip) UI.tooltip.classList.add('hidden');
  };

  /* =========================================================
     CHOICE CARDS
     ========================================================= */
  R.renderChoices = function (choices) {
    const g = R.game;
    const p = g.player;
    UI.choiceCards.innerHTML = '';

    const ctx = g.choiceContext;
    const isLevel = !!(ctx && ctx.source === 'levelup');
    UI.cardScreen.classList.toggle('levelup', isLevel);
    if (UI.choiceEmblem) UI.choiceEmblem.src = isLevel ? 'assets/icons/achievement.jpg' : 'assets/icons/chest.jpg';
    if (UI.choiceKicker) UI.choiceKicker.textContent = isLevel ? '等级提升 · 三选一' : '战利品';
    const pendingLevels = (g.levelChoices || []).length;
    if (UI.choiceSubtitle) UI.choiceSubtitle.textContent = isLevel
      ? ('Lv.' + (ctx.level || p.level) + ' · 从技能、天赋或联动符文中选择一项，立即生效。' + (pendingLevels ? ' 还有 ' + pendingLevels + ' 次升级待选择。' : ''))
      : '从三件战利品中挑选一件。主动技能进入技能栏，被动天赋与联动符文立即生效。';
    if (UI.choiceFooterLabel) UI.choiceFooterLabel.textContent = isLevel ? '升级奖励 · 三选一' : '主动技能';
    choices.forEach((choice, i) => {
      const s = choice.skill;
      const rarity = D.RARITY[s.rarity] || D.RARITY.rare;
      const rank = choice.rank;
      const desc = (s.type === 'passive' || s.type === 'rune') ? s.desc(rank || 1) : s.desc(p.level);
      const typeLabel = s.type === 'passive' ? '被动天赋' : s.type === 'rune' ? '联动符文' : '主动技能';
      const rankText = s.type === 'rune' ? '' : (rank ? ' · ' + R.toRoman(rank) : '');
      const tagText = s.type === 'passive' && s.tag ? s.tag.replace(/^被动\s*·\s*/, '') : (s.tag || '');
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'choice-card' + (s.type === 'rune' ? ' rune' : '');
      card.style.setProperty('--rarity', rarity.color);
      card.style.setProperty('--delay', (i * .08) + 's');
      const iconSrc = Art.makeIcon(s.icon, rarity.color);
      let metaHtml = '';
      if (s.type === 'active') {
        const chips = [];
        if (s.cost) chips.push('<span class="meta-chip hot">◈ <b>' + s.cost + '</b> ' + p.cls.resourceName + '</span>');
        if (s.cooldown) chips.push('<span class="meta-chip cool">◷ <b>' + (s.cooldown * (p.cdrMult || 1)).toFixed(1) + 's</b></span>');
        if (chips.length) metaHtml = '<div class="card-meta">' + chips.join('') + '</div>';
      } else if (s.type === 'rune') {
        metaHtml = '<div class="card-meta"><span class="meta-chip rune">唯一 · 联动</span></div>';
      } else if (s.maxRank <= 3) {
        const pips = [];
        for (let r = 1; r <= s.maxRank; r++) pips.push('<i class="' + (r <= rank ? 'on' : '') + '"></i>');
        metaHtml = '<div class="rank-row">' + pips.join('') + '</div>';
      } else {
        metaHtml = '<div class="card-meta"><span class="meta-chip">可重复强化</span></div>';
      }
      card.innerHTML =
        '<div class="card-watermark" style="background-image:url(\'' + iconSrc + '\')"></div>' +
        '<span class="card-rarity" style="color:' + rarity.color + '">' + rarity.label + '</span>' +
        '<div class="card-icon-wrap"><img class="card-icon" src="' + iconSrc + '" alt="" onerror="this.style.display=\'none\'"></div>' +
        '<div class="card-name">' + s.name + '</div>' +
        '<div class="card-type" style="color:' + rarity.color + '">' + typeLabel + rankText + '</div>' +
        '<div class="card-tag">' + tagText + '</div>' +
        '<p class="card-desc">' + desc + '</p>' +
        metaHtml +
        '<p class="card-flavor">' + (s.flavor || '') + '</p>' +
        '<span class="card-pick">选 择</span>';
      card.addEventListener('click', () => R.chooseCard(i));
      card.addEventListener('mouseenter', () => AudioEngine.sfx('click'));
      UI.choiceCards.appendChild(card);
    });
    const full = p.abilities.length >= D.BALANCE.maxActives;
    UI.activeCount.textContent = p.abilities.length + ' / ' + D.BALANCE.maxActives + (full ? '（已满）' : '');
    UI.cardScreen.classList.remove('hidden');
    R.hideTooltip();
  };

  /* =========================================================
     EXPORT / BOOT
     ========================================================= */
  window.__RIFT_RENDER__ = {
    render
  };
})();

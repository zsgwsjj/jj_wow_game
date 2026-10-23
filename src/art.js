/* =========================================================
   艾泽拉斯：裂隙远征 — 程序化像素美术
   ========================================================= */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const C = {
    outline: '#0a0a0d',
    ink: '#101015',
    skin: '#c9956b',
    skinLight: '#e2b184',
    skinDark: '#8d5e3e',
    steel: '#8c96a5',
    steelLight: '#cdd6df',
    steelDark: '#4f5865',
    gold: '#d4a752',
    goldLight: '#f4d993',
    goldDark: '#82612b',
    leather: '#6b4728',
    leatherLight: '#95683c',
    wood: '#5b3b22',
    bone: '#d8cfb6',
    red: '#9a2f2b',
    redLight: '#d14f41',
    blue: '#2c4f89',
    blueLight: '#5e8ad1',
    purple: '#5b397d',
    purpleLight: '#a06dd0'
  };

  const rnd = (seed) => {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(0, Math.round(w)), Math.max(0, Math.round(h)));
  }

  function poly(ctx, pts, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  function line(ctx, x1, y1, x2, y2, w, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineCap = 'square';
    ctx.beginPath();
    ctx.moveTo(Math.round(x1) + .5, Math.round(y1) + .5);
    ctx.lineTo(Math.round(x2) + .5, Math.round(y2) + .5);
    ctx.stroke();
  }

  function shadow(ctx, x, y, w, h, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha == null ? .34 : alpha;
    px(ctx, x - w * .5, y - h * .25, w, h * .55, '#000');
    px(ctx, x - w * .34, y + h * .3, w * .68, h * .28, '#000');
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function glow(ctx, x, y, radius, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(.45, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = alpha == null ? .32 : alpha;
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  }

  function pixelOrb(ctx, x, y, r, color, core) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(Math.round(x), Math.round(y), r, 0, TAU);
    ctx.fill();
    if (core) {
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(Math.round(x) - 1, Math.round(y) - 1, Math.max(1, r * .48), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  /* =========================================================
     ICONS
     ========================================================= */
  const iconCache = {};
  function iconSymbol(ctx, icon) {
    ctx.save();
    ctx.translate(16, 16);
    switch (icon) {
      case 'cleave': {
        ctx.rotate(-.65);
        px(ctx, -10, -1, 7, 3, '#50351b');
        px(ctx, -4, -2, 3, 5, C.gold);
        px(ctx, -1, -2, 12, 4, C.steelLight);
        px(ctx, -1, -2, 12, 1, '#fff');
        poly(ctx, [[11, -2], [15, 0], [11, 2]], '#fff');
        ctx.restore();
        line(ctx, -10, 10, 7, -8, 1.5, 'rgba(255,235,190,.7)');
        line(ctx, -13, 6, 3, -10, 1, 'rgba(255,235,190,.35)');
        return;
      }
      case 'fireball': {
        glow(ctx, 2, 2, 13, 'rgba(255,94,24,.45)', .8);
        poly(ctx, [[-13, 9], [-6, 5], [-4, 6], [-11, 12]], '#e4491e');
        poly(ctx, [[-10, 5], [-3, 2], [0, 4], [-7, 8]], '#ff8a2b');
        pixelOrb(ctx, 4, -1, 7, '#c72c10', '#ffb52c');
        pixelOrb(ctx, 2, -3, 3.5, '#ffdd66', '#fff8cf');
        px(ctx, 8, -8, 2, 2, '#ffd86b');
        px(ctx, 11, -5, 1, 1, '#ffedac');
        return;
      }
      case 'charge': {
        poly(ctx, [[-13, -8], [-4, 0], [-13, 8], [-9, 0]], '#e8c074');
        poly(ctx, [[-6, -9], [3, 0], [-6, 9], [-2, 0]], '#d9a752');
        poly(ctx, [[2, -11], [14, 0], [2, 11], [6, 0]], '#f4dfaa');
        px(ctx, -2, -1, 4, 2, '#4a3517');
        return;
      }
      case 'whirlwind': {
        ctx.strokeStyle = '#e7eef4'; ctx.lineWidth = 2.4; ctx.lineCap = 'square';
        for (let i = 0; i < 3; i++) {
          ctx.save(); ctx.rotate(i * TAU / 3);
          ctx.beginPath(); ctx.arc(0, 0, 9, -.4, 1.2); ctx.stroke();
          ctx.restore();
        }
        px(ctx, -2, -2, 4, 4, C.gold);
        px(ctx, -1, -1, 2, 2, '#fff1c1');
        return;
      }
      case 'shield': {
        poly(ctx, [[-10, -11], [10, -11], [9, 1], [0, 11], [-9, 1]], '#23334a');
        poly(ctx, [[-8, -9], [8, -9], [7, 0], [0, 8], [-7, 0]], C.steel);
        poly(ctx, [[-7, -8], [7, -8], [6, -1], [0, 6], [-6, -1]], '#788ba0');
        px(ctx, -1, -8, 2, 13, C.goldLight);
        px(ctx, -6, -3, 12, 2, C.goldLight);
        px(ctx, -7, -9, 3, 1, '#fff');
        return;
      }
      case 'execute': {
        ctx.rotate(.5);
        px(ctx, -12, -1, 16, 3, '#593a1c');
        px(ctx, 3, -6, 7, 12, '#aeb7c2');
        poly(ctx, [[8, -9], [14, -6], [14, 6], [8, 9]], '#dbe4eb');
        px(ctx, 4, -5, 2, 10, C.steelDark);
        ctx.restore();
        ctx.save(); ctx.translate(0, 4);
        poly(ctx, [[-5, -4], [5, -4], [4, 4], [1, 8], [-1, 8], [-4, 4]], '#e7dfc9');
        px(ctx, -3, -1, 2, 2, '#28120e'); px(ctx, 2, -1, 2, 2, '#28120e');
        px(ctx, -1, 3, 2, 2, '#28120e');
        ctx.restore();
        return;
      }
      case 'leap': {
        ctx.strokeStyle = '#d8b169'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 5, 11, Math.PI, 0); ctx.stroke();
        poly(ctx, [[-9, -8], [0, -15], [9, -8], [3, -8], [3, 1], [-3, 1], [-3, -8]], '#e3c27e');
        px(ctx, -6, 8, 12, 3, '#8d6c36');
        return;
      }
      case 'bladestorm': {
        for (let i = 0; i < 4; i++) {
          ctx.save(); ctx.rotate(i * TAU / 4 + .3);
          poly(ctx, [[0, -13], [3, -5], [0, -8], [-3, -5]], '#e8edf2');
          ctx.restore();
        }
        ctx.strokeStyle = '#d9b163'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 8, .3, 2.6); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 8, 3.4, 5.7); ctx.stroke();
        px(ctx, -2, -2, 4, 4, '#f5d99b');
        return;
      }
      case 'heart': {
        poly(ctx, [[0, 11], [-11, 0], [-11, -6], [-6, -11], [0, -6], [6, -11], [11, -6], [11, 0]], '#a8262f');
        poly(ctx, [[0, 7], [-8, -1], [-8, -5], [-4, -8], [0, -4], [4, -8], [8, -5], [8, -1]], '#e14b45');
        px(ctx, -5, -5, 3, 2, '#ff9d86');
        return;
      }
      case 'bleed': {
        poly(ctx, [[0, -11], [6, -1], [5, 5], [0, 9], [-5, 5], [-6, -1]], '#b51f2e');
        poly(ctx, [[-8, -10], [-4, -4], [-5, 1], [-9, 1], [-11, -4]], '#861a26');
        poly(ctx, [[9, -6], [12, 0], [10, 4], [7, 2], [6, -2]], '#e24745');
        px(ctx, -1, -3, 2, 4, '#ff9c8d');
        return;
      }
      case 'wind': {
        ctx.strokeStyle = '#cfe8ef'; ctx.lineWidth = 2; ctx.lineCap = 'square';
        ctx.beginPath(); ctx.arc(0, 0, 9, -.4, 3.8); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 4, 1.1, 4.4); ctx.stroke();
        line(ctx, -11, 7, 4, 7, 1, 'rgba(207,232,239,.55)');
        return;
      }
      case 'bloodlust': {
        poly(ctx, [[-7, -8], [-3, -12], [0, -8], [4, -12], [8, -7], [8, 1], [4, 8], [0, 11], [-4, 8], [-8, 1]], '#d8cdb4');
        px(ctx, -5, -3, 3, 3, '#b11e26');
        px(ctx, 2, -3, 3, 3, '#b11e26');
        px(ctx, -2, 4, 4, 2, '#6d5d47');
        poly(ctx, [[8, 7], [12, 12], [8, 14], [5, 11]], '#a71d28');
        return;
      }
      case 'armor': {
        poly(ctx, [[-10, -11], [-3, -8], [3, -8], [10, -11], [11, 6], [6, 11], [0, 13], [-6, 11], [-11, 6]], '#38444f');
        poly(ctx, [[-8, -8], [-2, -5], [2, -5], [8, -8], [8, 5], [4, 8], [0, 10], [-4, 8], [-8, 5]], '#7c8b99');
        px(ctx, 0, -5, 2, 12, '#c9d4dc');
        px(ctx, -7, -9, 5, 2, '#d8dee3');
        px(ctx, 3, -9, 5, 2, '#d8dee3');
        return;
      }
      case 'victory': {
        ctx.strokeStyle = '#e1bc6d'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 1, 9, 2.2, 4.1); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 1, 9, 5.3, 7.2); ctx.stroke();
        poly(ctx, [[-2, -12], [0, -6], [2, -12], [4, -3], [0, 10], [-4, -3]], '#f3d889');
        px(ctx, -1, -3, 2, 8, '#b48a3d');
        return;
      }
      case 'frost': case 'iceshard': {
        ctx.strokeStyle = '#c9f6ff'; ctx.lineWidth = 2; ctx.lineCap = 'square';
        for (let i = 0; i < 3; i++) {
          ctx.save(); ctx.rotate(i * Math.PI / 3);
          line(ctx, 0, -12, 0, 12, 1.5, '#8fe5ff');
          line(ctx, 0, -9, -4, -12, 1, '#e0fbff');
          line(ctx, 0, -9, 4, -12, 1, '#e0fbff');
          px(ctx, -1, -13, 2, 2, '#fff');
          ctx.restore();
        }
        pixelOrb(ctx, 0, 0, 2.4, '#5dc8f2', '#fff');
        return;
      }
      case 'blink': {
        ctx.strokeStyle = '#b783ec'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 9, .4, 5.4); ctx.stroke();
        ctx.strokeStyle = '#e0c8ff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, 5, 2.2, 6); ctx.stroke();
        pixelOrb(ctx, 0, 0, 2.5, '#9b61da', '#f4e4ff');
        px(ctx, 9, -11, 2, 2, '#fff');
        px(ctx, -12, 7, 1, 1, '#d8b8ff');
        return;
      }
      case 'arcane': {
        for (let i = 0; i < 8; i++) {
          ctx.save(); ctx.rotate(i * TAU / 8);
          poly(ctx, [[0, -13], [2, -4], [-2, -4]], i % 2 ? '#b56fe8' : '#e2bbff');
          ctx.restore();
        }
        pixelOrb(ctx, 0, 0, 5, '#7e43bc', '#f5dcff');
        return;
      }
      case 'icebarrier': {
        poly(ctx, [[-9, -11], [-3, -8], [3, -8], [9, -11], [9, 1], [4, 7], [0, 10], [-4, 7], [-9, 1]], '#205c78');
        poly(ctx, [[-7, -9], [-2, -7], [2, -7], [7, -9], [7, 0], [3, 5], [0, 7], [-3, 5], [-7, 0]], '#5ec5e6');
        poly(ctx, [[0, -7], [4, 0], [0, 7], [-4, 0]], '#d9f8ff');
        px(ctx, -6, -8, 2, 3, '#fff');
        return;
      }
      case 'flamestrike': {
        poly(ctx, [[0, -14], [4, -5], [8, -2], [6, 6], [0, 10], [-6, 6], [-8, -2], [-3, -5]], '#d63b1f');
        poly(ctx, [[0, -6], [4, 0], [2, 5], [0, 8], [-3, 4], [-4, 0]], '#ffab2f');
        px(ctx, -1, 1, 3, 5, '#fff2a4');
        line(ctx, -11, 9, 11, 9, 2, '#e0b35c');
        line(ctx, -8, 12, 8, 12, 1, 'rgba(224,179,92,.5)');
        return;
      }
      case 'pyroblast': {
        glow(ctx, 0, 0, 14, 'rgba(255,84,24,.5)', .8);
        pixelOrb(ctx, 1, 0, 8, '#b91f0d', '#ff8b27');
        pixelOrb(ctx, -1, -2, 4, '#ffc83d', '#fff6b0');
        poly(ctx, [[-10, 4], [-15, 9], [-7, 7], [-4, 5]], '#e34d18');
        ctx.strokeStyle = '#ffd36c'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(1, 0, 11, -1.7, .5); ctx.stroke();
        return;
      }
      case 'intellect': {
        poly(ctx, [[-11, -7], [0, -10], [11, -7], [11, 8], [0, 10], [-11, 8]], '#342445');
        poly(ctx, [[-9, -5], [0, -4], [0, 8], [-9, 6]], '#7c5aa2');
        poly(ctx, [[9, -5], [0, -4], [0, 8], [9, 6]], '#a57cc8');
        px(ctx, -1, -2, 2, 9, '#d9c3ef');
        px(ctx, -7, -2, 4, 1, '#e7d9f5');
        px(ctx, 3, -1, 4, 1, '#e7d9f5');
        px(ctx, 0, -13, 2, 2, '#cdb4ff');
        return;
      }
      case 'ignite': {
        poly(ctx, [[0, -13], [5, -4], [9, 1], [6, 8], [0, 11], [-6, 7], [-8, 1], [-3, -5]], '#d6381f');
        poly(ctx, [[0, -5], [4, 1], [2, 6], [0, 8], [-3, 4], [-4, 0]], '#ffb62c');
        px(ctx, -1, 1, 2, 4, '#fff6bd');
        px(ctx, 8, -10, 2, 2, '#ffb02e'); px(ctx, -10, 5, 1, 1, '#ff8148');
        return;
      }
      case 'time': {
        poly(ctx, [[-7, -11], [7, -11], [7, -8], [-7, -8]], '#d4a752');
        poly(ctx, [[-7, 11], [7, 11], [7, 8], [-7, 8]], '#d4a752');
        poly(ctx, [[-5, -8], [5, -8], [1, 0], [5, 8], [-5, 8], [-1, 0]], '#4c709e');
        poly(ctx, [[-3, 5], [3, 5], [0, 1]], '#c6e9ff');
        px(ctx, -1, -11, 2, 22, '#8a6a38');
        return;
      }
      case 'barrier': {
        poly(ctx, [[0, -13], [10, -7], [9, 2], [0, 12], [-9, 2], [-10, -7]], '#283d51');
        poly(ctx, [[0, -10], [7, -6], [6, 1], [0, 9], [-6, 1], [-7, -6]], '#4e8ba8');
        ctx.strokeStyle = '#bdf0ff'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.stroke();
        px(ctx, -1, -6, 2, 12, '#c9f5ff');
        return;
      }
      case 'mana': {
        poly(ctx, [[0, -13], [6, -2], [6, 4], [0, 10], [-6, 4], [-6, -2]], '#2363bc');
        poly(ctx, [[0, -9], [4, -1], [4, 3], [0, 7], [-4, 3], [-4, -1]], '#5cc9ff');
        px(ctx, -2, -1, 2, 4, '#eefcff');
        px(ctx, 9, -8, 2, 2, '#a7eaff');
        return;
      }
      case 'sharp': {
        ctx.rotate(-.6);
        px(ctx, -12, -2, 12, 4, '#826336');
        px(ctx, 0, -4, 3, 8, '#b78a44');
        px(ctx, 3, -3, 12, 6, '#c3ced9');
        px(ctx, 3, -3, 12, 2, '#fff');
        ctx.restore();
        px(ctx, -12, 10, 9, 3, '#5c6570');
        px(ctx, -10, 8, 5, 2, '#9aa4ae');
        return;
      }
      case 'boot': {
        poly(ctx, [[-7, -12], [3, -12], [3, 0], [11, 3], [11, 9], [-8, 9], [-8, 3]], '#86613b');
        poly(ctx, [[-5, -10], [1, -10], [1, 1], [8, 4], [8, 7], [-6, 7], [-6, 2]], '#c2955b');
        line(ctx, -14, -6, -9, -6, 1, '#d5c9ad');
        line(ctx, -14, -1, -10, -1, 1, '#a99d84');
        line(ctx, -13, 4, -10, 4, 1, '#7f7564');
        return;
      }
      case 'dodge': {
        poly(ctx, [[-6, -11], [6, -11], [6, 8], [0, 12], [-6, 8]], '#3c5063');
        px(ctx, -1, -8, 2, 14, '#b9eaff');
        return;
      }
      default: {
        poly(ctx, [[0, -13], [12, 0], [0, 13], [-12, 0]], '#b18a4a');
        poly(ctx, [[0, -7], [6, 0], [0, 7], [-6, 0]], '#f3d999');
        return;
      }
    }
  }

  function makeIcon(icon, color) {
    const key = icon + '|' + (color || '');
    if (iconCache[key]) return iconCache[key];
    // 优先使用本地化的魔兽世界官方技能图标，失败时回退到程序化像素图标
    if (window.GameAssets) {
      const asset = GameAssets.icon(icon);
      if (asset) {
        iconCache[key] = asset;
        return asset;
      }
    }
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const col = color || '#d9b26c';
    px(ctx, 0, 0, 32, 32, '#080a0e');
    for (let y = 0; y < 32; y += 2) {
      ctx.globalAlpha = (1 - y / 40) * .3;
      px(ctx, 1, y, 30, 2, col);
    }
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(16, 14, 1, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,.09)');
    g.addColorStop(.6, col + '22');
    g.addColorStop(1, '#06070a');
    ctx.fillStyle = g; ctx.fillRect(1, 1, 30, 30);
    ctx.strokeStyle = col + 'aa'; ctx.lineWidth = 1;
    ctx.strokeRect(.5, .5, 31, 31);
    ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeRect(2.5, 2.5, 27, 27);
    px(ctx, 3, 3, 3, 1, 'rgba(255,255,255,.25)');
    px(ctx, 3, 4, 1, 3, 'rgba(255,255,255,.15)');
    iconSymbol(ctx, icon);
    const out = c.toDataURL();
    iconCache[key] = out;
    return out;
  }

  /* =========================================================
     PORTRAIT
     ========================================================= */
  const portraitCache = {};
  function makePortrait(classId, size) {
    const pxSize = size || 128;
    const key = classId + '|' + pxSize;
    if (portraitCache[key]) return portraitCache[key];
    const c = document.createElement('canvas');
    c.width = pxSize; c.height = pxSize;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const cls = GameData.CLASSES[classId];
    const bg = ctx.createRadialGradient(pxSize * .5, pxSize * .35, 2, pxSize * .5, pxSize * .5, pxSize * .7);
    bg.addColorStop(0, classId === 'warrior' ? '#4a3520' : classId === 'priest' ? '#4a4028' : '#183a53');
    bg.addColorStop(.55, classId === 'warrior' ? '#1a120a' : classId === 'priest' ? '#1b180f' : '#0b1824');
    bg.addColorStop(1, '#05060a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, pxSize, pxSize);
    ctx.save();
    ctx.globalAlpha = .16;
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = cls.color;
      ctx.fillRect((i * 31 + 9) % pxSize, (i * 47 + 13) % pxSize, 2, 2);
    }
    ctx.restore();
    ctx.save();
    ctx.translate(pxSize * .5, pxSize * .9);
    const s = pxSize / 96 * 2.15;
    ctx.scale(s, s);
    if (classId === 'warrior') drawWarriorBody(ctx, 0, 0, 0, 1, 0, 1);
    else if (classId === 'priest') drawPriestBody(ctx, 0, 0, 0, 1, 0, 1);
    else drawMageBody(ctx, 0, 0, 0, 1, 0, 1);
    ctx.restore();
    const shade = ctx.createLinearGradient(0, pxSize * .45, 0, pxSize);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,.78)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, pxSize, pxSize);
    ctx.strokeStyle = '#0a0907'; ctx.lineWidth = Math.max(2, pxSize / 42); ctx.strokeRect(1, 1, pxSize - 2, pxSize - 2);
    ctx.strokeStyle = cls.color + '99'; ctx.lineWidth = 1; ctx.strokeRect(pxSize / 32, pxSize / 32, pxSize - pxSize / 16, pxSize - pxSize / 16);
    const out = c.toDataURL();
    portraitCache[key] = out;
    return out;
  }

  /* =========================================================
     PLAYER
     ========================================================= */
  function drawWarriorBody(ctx, x, y, aim, face, move, attackAnim) {
    const step = move ? Math.sin(performance.now() / 72) * 1.5 : 0;
    const bob = move ? (Math.abs(Math.sin(performance.now() / 72)) > .5 ? 0 : 1) : 0;
    shadow(ctx, 0, 1, 17, 7, .35);
    // legs
    px(ctx, -6, -10 + (step > 0 ? 0 : 1), 4, 9 + (step > 0 ? 0 : 1), '#2f2b2e');
    px(ctx, -6, -3 + (step > 0 ? 0 : 1), 4, 3, '#17171b');
    px(ctx, 2, -10 + (step < 0 ? 0 : 1), 4, 9 + (step < 0 ? 0 : 1), '#3b3536');
    px(ctx, 2, -3 + (step < 0 ? 0 : 1), 4, 3, '#17171b');
    // cloak
    poly(ctx, [[-8, -24 + bob], [8, -24 + bob], [10, -10 + bob], [6, -7 + bob], [3, -11 + bob], [0, -8 + bob], [-4, -11 + bob], [-10, -8 + bob]], '#4e1717');
    poly(ctx, [[-6, -23 + bob], [6, -23 + bob], [7, -12 + bob], [0, -9 + bob], [-8, -12 + bob]], '#70201d');
    // body outline
    px(ctx, -8, -24 + bob, 16, 15, C.outline);
    px(ctx, -7, -23 + bob, 14, 13, '#5c636d');
    px(ctx, -6, -22 + bob, 12, 6, '#858e9a');
    px(ctx, -5, -22 + bob, 10, 2, '#b4bdc6');
    // tabard
    px(ctx, -4, -18 + bob, 8, 10, '#7f2424');
    px(ctx, -3, -17 + bob, 6, 8, '#a9322d');
    poly(ctx, [[0, -16 + bob], [3, -13 + bob], [0, -9 + bob], [-3, -13 + bob]], '#d6ab5f');
    px(ctx, -6, -12 + bob, 12, 2, '#2c2117');
    px(ctx, -2, -12 + bob, 4, 2, '#d0a75d');
    // arms
    px(ctx, -10, -21 + bob, 3, 10, '#474b52');
    px(ctx, -10, -13 + bob, 3, 3, C.skinDark);
    px(ctx, 7, -21 + bob, 3, 9, '#626973');
    px(ctx, 7, -13 + bob, 3, 3, C.skin);
    // pauldrons
    px(ctx, -12, -24 + bob, 6, 6, C.outline);
    px(ctx, -11, -23 + bob, 4, 4, '#9ba4ae');
    px(ctx, -11, -23 + bob, 4, 1, '#d8dfe5');
    px(ctx, -12, -19 + bob, 6, 1, '#c49a51');
    px(ctx, 6, -24 + bob, 6, 6, C.outline);
    px(ctx, 7, -23 + bob, 4, 4, '#9ba4ae');
    px(ctx, 7, -23 + bob, 4, 1, '#d8dfe5');
    px(ctx, 6, -19 + bob, 6, 1, '#c49a51');
    // head
    px(ctx, -5, -32 + bob, 10, 9, C.outline);
    px(ctx, -4, -31 + bob, 8, 8, C.skin);
    px(ctx, -4, -29 + bob, 8, 5, C.skinLight);
    px(ctx, -4, -30 + bob, 2, 2, '#3a2a1c');
    px(ctx, 2, -30 + bob, 2, 2, '#3a2a1c');
    px(ctx, -1, -27 + bob, 2, 1, C.skinDark);
    px(ctx, -4, -33 + bob, 8, 4, C.outline);
    px(ctx, -4, -33 + bob, 8, 3, '#717b88');
    px(ctx, -4, -31 + bob, 8, 1, '#aeb7c1');
    px(ctx, -1, -35 + bob, 2, 3, '#8e2525');
    px(ctx, 0, -36 + bob, 1, 2, '#c44a3d');
    px(ctx, -4, -34 + bob, 2, 2, '#3f4854');
    px(ctx, 2, -34 + bob, 2, 2, '#3f4854');
    // sword
    const localAim = Math.atan2(Math.sin(aim), Math.cos(aim) * face);
    ctx.save();
    ctx.translate(9, -16 + bob);
    ctx.rotate(localAim + attackAnim * -.25);
    px(ctx, -2, -2, 6, 4, C.outline);
    px(ctx, 0, -1, 4, 2, '#6d4727');
    px(ctx, 3, -4, 2, 8, '#d0a254');
    px(ctx, 5, -2, 17, 4, C.outline);
    px(ctx, 5, -1, 17, 3, '#b8c2cc');
    px(ctx, 5, -1, 16, 1, '#f1f5f9');
    poly(ctx, [[22, -1], [27, 0], [22, 2]], '#eef4f8');
    px(ctx, 9, -1, 2, 1, '#7e8995');
    ctx.restore();
  }

  function drawMageBody(ctx, x, y, aim, face, move, attackAnim) {
    const step = move ? Math.sin(performance.now() / 78) * 1.5 : 0;
    const bob = move ? (Math.abs(Math.sin(performance.now() / 78)) > .5 ? 0 : 1) : Math.sin(performance.now() / 500) * .5;
    shadow(ctx, 0, 1, 16, 6, .32);
    // feet
    px(ctx, -5, -4 + (step > 0 ? 0 : 1), 3, 4, '#191b24');
    px(ctx, 2, -4 + (step < 0 ? 0 : 1), 3, 4, '#232631');
    // robe outline
    poly(ctx, [[-6, -23 + bob], [6, -23 + bob], [10, -3 + bob], [7, 1 + bob], [-7, 1 + bob], [-10, -3 + bob]], C.outline);
    poly(ctx, [[-5, -22 + bob], [5, -22 + bob], [8, -4 + bob], [4, 0 + bob], [-4, 0 + bob], [-8, -4 + bob]], '#28345c');
    poly(ctx, [[-4, -21 + bob], [4, -21 + bob], [6, -5 + bob], [0, -1 + bob], [-6, -5 + bob]], '#3b518c');
    poly(ctx, [[-1, -21 + bob], [1, -21 + bob], [3, -3 + bob], [0, 1 + bob], [-3, -3 + bob]], '#4d68aa');
    px(ctx, -8, -8 + bob, 16, 2, '#b58c47');
    poly(ctx, [[0, -18 + bob], [3, -14 + bob], [0, -9 + bob], [-3, -14 + bob]], '#d9b164');
    // arms
    px(ctx, -8, -20 + bob, 3, 9, '#2b375f');
    px(ctx, -8, -12 + bob, 3, 3, C.skin);
    px(ctx, 5, -20 + bob, 3, 9, '#33406b');
    px(ctx, 6, -12 + bob, 3, 3, C.skinLight);
    // hood/shoulders
    poly(ctx, [[-8, -24 + bob], [0, -27 + bob], [8, -24 + bob], [7, -20 + bob], [-7, -20 + bob]], '#1c2547');
    poly(ctx, [[-7, -24 + bob], [0, -26 + bob], [7, -24 + bob], [5, -21 + bob], [-5, -21 + bob]], '#2d3e72');
    // head
    px(ctx, -4, -32 + bob, 8, 8, C.outline);
    px(ctx, -3, -31 + bob, 6, 7, C.skin);
    px(ctx, -3, -31 + bob, 6, 2, '#e5b588');
    px(ctx, -3, -28 + bob, 2, 2, '#4ee1ff');
    px(ctx, 1, -28 + bob, 2, 2, '#4ee1ff');
    px(ctx, -1, -26 + bob, 2, 1, C.skinDark);
    // hood
    poly(ctx, [[-5, -34 + bob], [0, -36 + bob], [5, -34 + bob], [4, -29 + bob], [3, -32 + bob], [0, -33 + bob], [-3, -32 + bob], [-4, -29 + bob]], '#151c36');
    px(ctx, -4, -33 + bob, 3, 1, '#5b6ca8');
    px(ctx, 2, -33 + bob, 3, 1, '#5b6ca8');
    // staff
    const localAim = Math.atan2(Math.sin(aim), Math.cos(aim) * face);
    ctx.save();
    ctx.translate(8, -17 + bob);
    ctx.rotate(localAim + attackAnim * -.13);
    px(ctx, -1, -2, 20, 3, C.outline);
    px(ctx, 0, -1, 19, 2, '#6b4a28');
    px(ctx, 4, -1, 4, 1, '#a87b3d');
    const orbX = 20;
    glow(ctx, orbX, 0, 9, 'rgba(93,207,255,.75)', .6);
    pixelOrb(ctx, orbX, 0, 3.5, '#4fb9e8', '#d8fbff');
    ctx.restore();
    // floating rune
    if (Math.sin(performance.now() / 500) > .5) {
      px(ctx, -10, -31 + bob, 1, 1, '#7ce8ff');
    }
  }


  function drawPriestBody(ctx, x, y, aim, face, move, attackAnim) {
    const step = move ? Math.sin(performance.now() / 82) * 1.4 : 0;
    const bob = move ? (Math.abs(Math.sin(performance.now() / 82)) > .5 ? 0 : 1) : Math.sin(performance.now() / 560) * .6;
    shadow(ctx, 0, 1, 16, 6, .32);
    // feet
    px(ctx, -5, -4 + (step > 0 ? 0 : 1), 3, 4, '#17140f');
    px(ctx, 2, -4 + (step < 0 ? 0 : 1), 3, 4, '#242019');
    // long ivory robe
    poly(ctx, [[-6, -23 + bob], [6, -23 + bob], [10, -3 + bob], [7, 1 + bob], [-7, 1 + bob], [-10, -3 + bob]], C.outline);
    poly(ctx, [[-5, -22 + bob], [5, -22 + bob], [8, -4 + bob], [4, 0 + bob], [-4, 0 + bob], [-8, -4 + bob]], '#d8ceb5');
    poly(ctx, [[-4, -21 + bob], [4, -21 + bob], [6, -5 + bob], [0, -1 + bob], [-6, -5 + bob]], '#eee5cf');
    poly(ctx, [[-1, -21 + bob], [1, -21 + bob], [3, -3 + bob], [0, 1 + bob], [-3, -3 + bob]], '#f7efd8');
    px(ctx, -8, -8 + bob, 16, 2, '#b58c47');
    // gold stole
    px(ctx, -2, -21 + bob, 4, 15, '#b58c47');
    px(ctx, -1, -20 + bob, 2, 13, '#e0bd72');
    poly(ctx, [[0, -18 + bob], [3, -14 + bob], [0, -9 + bob], [-3, -14 + bob]], '#f3d58d');
    // arms
    px(ctx, -8, -20 + bob, 3, 9, '#c7bda5');
    px(ctx, -8, -12 + bob, 3, 3, C.skin);
    px(ctx, 5, -20 + bob, 3, 9, '#ddd3bb');
    px(ctx, 6, -12 + bob, 3, 3, C.skinLight);
    // shoulder cowl
    poly(ctx, [[-8, -24 + bob], [0, -27 + bob], [8, -24 + bob], [7, -20 + bob], [-7, -20 + bob]], '#3a3223');
    poly(ctx, [[-7, -24 + bob], [0, -26 + bob], [7, -24 + bob], [5, -21 + bob], [-5, -21 + bob]], '#d8c58f');
    // head
    px(ctx, -4, -32 + bob, 8, 8, C.outline);
    px(ctx, -3, -31 + bob, 6, 7, C.skin);
    px(ctx, -3, -31 + bob, 6, 2, '#e5b588');
    px(ctx, -3, -28 + bob, 2, 2, '#7a5a26');
    px(ctx, 1, -28 + bob, 2, 2, '#7a5a26');
    px(ctx, -1, -26 + bob, 2, 1, C.skinDark);
    // hood / veil
    poly(ctx, [[-5, -34 + bob], [0, -36 + bob], [5, -34 + bob], [4, -29 + bob], [3, -32 + bob], [0, -33 + bob], [-3, -32 + bob], [-4, -29 + bob]], '#e9e0ca');
    px(ctx, -4, -33 + bob, 3, 1, '#fff3d2');
    px(ctx, 2, -33 + bob, 3, 1, '#fff3d2');
    // halo
    ctx.save();
    const haloPulse = .7 + Math.sin(performance.now() / 300) * .15;
    ctx.globalAlpha = .75;
    ctx.strokeStyle = '#ffe9a3';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, -38 + bob, 7, 2.5, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = haloPulse * .28;
    ctx.fillStyle = '#fff4c6';
    ctx.beginPath(); ctx.ellipse(0, -38 + bob, 9, 4, 0, 0, TAU); ctx.fill();
    ctx.restore();
    // staff
    const localAim = Math.atan2(Math.sin(aim), Math.cos(aim) * face);
    ctx.save();
    ctx.translate(8, -17 + bob);
    ctx.rotate(localAim + attackAnim * -.12);
    px(ctx, -1, -2, 20, 3, C.outline);
    px(ctx, 0, -1, 19, 2, '#6b4a28');
    px(ctx, 4, -1, 4, 1, '#a87b3d');
    const orbX = 20;
    glow(ctx, orbX, 0, 9, 'rgba(255,220,132,.7)', .6);
    pixelOrb(ctx, orbX, 0, 3.5, '#d4a84e', '#fff4c6');
    ctx.restore();
    // floating spark
    if (Math.sin(performance.now() / 460) > .3) {
      px(ctx, -10, -30 + bob, 1, 1, '#ffe7a3');
      px(ctx, 9, -22 + bob, 1, 1, '#fff4c6');
    }
  }

  function drawPlayer(ctx, p) {
    const x = Math.round(p.x), y = Math.round(p.y - (p.z || 0));
    const face = Math.cos(p.aim) >= 0 ? 1 : -1;
    const move = p.moving;
    const attackAnim = p.attackAnim > 0 ? Math.sin((1 - p.attackAnim) * Math.PI) : 0;
    ctx.save();
    ctx.translate(x, y);
    if (p.dashTrail) ctx.globalAlpha = .94;
    if (face === -1) ctx.scale(-1, 1);
    if (p.classId === 'warrior') drawWarriorBody(ctx, 0, 0, p.aim, face, move, attackAnim);
    else if (p.classId === 'priest') drawPriestBody(ctx, 0, 0, p.aim, face, move, attackAnim);
    else drawMageBody(ctx, 0, 0, p.aim, face, move, attackAnim);
    ctx.restore();
    // shield dome
    if (p.shield > 0) {
      ctx.save();
      ctx.globalAlpha = .35 + Math.sin(performance.now() / 180) * .06;
      const shieldTint = p.classId === 'warrior' ? '#e4c37c' : p.classId === 'priest' ? '#ffe4a0' : '#9be8ff';
      ctx.strokeStyle = shieldTint;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y - 15, 18, 22, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = .08;
      ctx.fillStyle = p.classId === 'warrior' ? '#f0d28b' : p.classId === 'priest' ? '#ffe9b5' : '#8ce9ff';
      ctx.fill();
      ctx.restore();
    }
    if (p.slow > 0) {
      ctx.save();
      ctx.globalAlpha = .5;
      px(ctx, x - 12, y - 4, 3, 2, '#8fe5ff');
      px(ctx, x + 8, y - 12, 2, 3, '#8fe5ff');
      px(ctx, x - 9, y - 22, 2, 2, '#bff4ff');
      ctx.restore();
    }
    if (p.invuln > 0) {
      ctx.save();
      ctx.globalAlpha = .25 + Math.sin(performance.now() / 60) * .1;
      ctx.strokeStyle = '#c3a8ff';
      ctx.beginPath(); ctx.arc(x, y - 15, 17, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }

  /* =========================================================
     ENEMIES
     ========================================================= */
  function baseWalk() {
    const t = performance.now();
    return { step: Math.sin(t / 100) * 1.5, bob: Math.abs(Math.sin(t / 100)) > .6 ? 1 : 0 };
  }

  function drawPirate(ctx) {
    const w = baseWalk();
    shadow(ctx, 0, 1, 15, 6, .32);
    px(ctx, -5, -9 + w.step * .3, 3, 8, '#26232a');
    px(ctx, 2, -9 - w.step * .3, 3, 8, '#312d32');
    px(ctx, -6, -3 + w.step * .3, 4, 3, '#141317');
    px(ctx, 1, -3 - w.step * .3, 4, 3, '#141317');
    poly(ctx, [[-7, -21], [7, -21], [8, -9], [0, -6], [-8, -9]], '#5b2021');
    px(ctx, -6, -20, 12, 9, '#812c2b');
    px(ctx, -6, -17, 12, 2, '#d8c7a0');
    px(ctx, -6, -12, 12, 2, '#d8c7a0');
    px(ctx, -7, -21, 3, 9, '#712423');
    px(ctx, 4, -21, 3, 9, '#712423');
    px(ctx, -7, -22, 14, 2, '#39201a');
    // arms
    px(ctx, -9, -19, 3, 8, '#8d312f');
    px(ctx, 6, -19, 3, 8, '#8d312f');
    px(ctx, 7, -12, 3, 3, C.skinDark);
    // head
    px(ctx, -4, -29, 8, 8, C.outline);
    px(ctx, -3, -28, 6, 7, C.skin);
    px(ctx, -3, -26, 2, 2, '#231915');
    px(ctx, 1, -26, 2, 2, '#231915');
    px(ctx, -1, -24, 3, 1, '#503425');
    px(ctx, -4, -30, 8, 3, '#8c2d28');
    poly(ctx, [[-5, -30], [0, -33], [5, -30], [3, -29], [0, -30], [-3, -29]], '#5e1e1c');
    px(ctx, 2, -26, 2, 1, '#17120f');
    // bandana tail
    px(ctx, -7, -28, 3, 2, '#a93931');
    // cutlass
    ctx.save(); ctx.translate(8, -13); ctx.rotate(-.5);
    px(ctx, 0, -1, 3, 2, '#5f3b20');
    px(ctx, 2, -2, 3, 1, '#bc924b');
    px(ctx, 4, -2, 10, 2, '#c9d4dd');
    poly(ctx, [[14, -2], [17, 0], [14, 2]], '#eef4f8');
    ctx.restore();
  }

  function drawMiner(ctx) {
    const w = baseWalk();
    shadow(ctx, 0, 1, 15, 6, .32);
    px(ctx, -5, -9 + w.step * .3, 3, 8, '#3a3025');
    px(ctx, 2, -9 - w.step * .3, 3, 8, '#46392b');
    px(ctx, -6, -3, 4, 3, '#221b15');
    px(ctx, 1, -3, 4, 3, '#221b15');
    px(ctx, -6, -21, 12, 12, '#4b3a28');
    px(ctx, -5, -20, 10, 5, '#6d5438');
    px(ctx, -5, -15, 10, 2, '#312517');
    px(ctx, -6, -11, 12, 2, '#2a2117');
    px(ctx, -8, -19, 3, 8, '#5b452f');
    px(ctx, 5, -19, 3, 8, '#5b452f');
    px(ctx, -4, -30, 8, 9, C.outline);
    px(ctx, -3, -29, 6, 8, C.skinDark);
    px(ctx, -3, -26, 2, 2, '#1c1510');
    px(ctx, 1, -26, 2, 2, '#1c1510');
    px(ctx, -2, -23, 5, 2, '#3b291c');
    // helmet with candle
    px(ctx, -5, -33, 10, 4, '#6d5b3c');
    px(ctx, -5, -30, 10, 2, '#8e764c');
    px(ctx, -1, -35, 2, 2, '#d8c58d');
    px(ctx, 0, -36, 1, 1, '#ffcf66');
    // pick
    ctx.save(); ctx.translate(8, -15); ctx.rotate(.4 + w.step * .02);
    px(ctx, 0, 0, 2, 14, '#6d4a2c');
    px(ctx, -2, -1, 12, 2, '#9aa4af');
    poly(ctx, [[8, -3], [12, 0], [8, 3]], '#c4ced7');
    ctx.restore();
  }

  function drawRaptor(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 110) * 1;
    shadow(ctx, 0, 1, 20, 7, .3);
    // tail
    poly(ctx, [[-13, -9 + bob], [-6, -13 + bob], [-4, -10 + bob], [-9, -6 + bob]], '#3b6e3a');
    // legs
    px(ctx, -7, -7, 3, 7, '#284d2b');
    px(ctx, 4, -7, 3, 7, '#315d32');
    px(ctx, -9, -1, 5, 2, '#26391d');
    px(ctx, 3, -1, 5, 2, '#26391d');
    // body
    poly(ctx, [[-9, -17 + bob], [6, -19 + bob], [11, -12 + bob], [5, -7 + bob], [-8, -8 + bob]], '#3f7c3e');
    poly(ctx, [[-6, -16 + bob], [4, -17 + bob], [7, -12 + bob], [2, -9 + bob], [-6, -10 + bob]], '#5c9c4b');
    px(ctx, -4, -15 + bob, 7, 2, '#82b45c');
    // stripes
    px(ctx, -3, -13 + bob, 6, 1, '#2d5d2f');
    px(ctx, -4, -11 + bob, 3, 1, '#2d5d2f');
    // head
    poly(ctx, [[5, -18 + bob], [12, -21 + bob], [17, -17 + bob], [14, -13 + bob], [6, -13 + bob]], '#3f7c3e');
    px(ctx, 9, -19 + bob, 6, 4, '#5c9c4b');
    px(ctx, 12, -18 + bob, 2, 2, '#f0d75a');
    px(ctx, 16, -17 + bob, 2, 1, '#24391b');
    px(ctx, 14, -14 + bob, 3, 1, '#e0dcc4');
    px(ctx, 8, -22 + bob, 2, 2, '#315d32');
    // claws
    px(ctx, 13, -12 + bob, 2, 2, '#d7d2b9');
  }

  function drawDruid(ctx) {
    const w = baseWalk();
    shadow(ctx, 0, 1, 15, 6, .3);
    px(ctx, -5, -7, 3, 7, '#292f27');
    px(ctx, 2, -7, 3, 7, '#323a2e');
    poly(ctx, [[-7, -23], [7, -23], [9, -4], [0, 0], [-9, -4]], '#314f37');
    poly(ctx, [[-5, -22], [5, -22], [7, -6], [0, -2], [-7, -6]], '#456d46');
    px(ctx, -7, -10, 14, 2, '#8a743f');
    px(ctx, -1, -20, 2, 12, '#6a8c51');
    px(ctx, -8, -20, 3, 8, '#3a5b3b');
    px(ctx, 5, -20, 3, 8, '#3a5b3b');
    // antlers
    line(ctx, -4, -30, -8, -36, 1.5, '#b09a6b');
    line(ctx, -8, -36, -10, -34, 1, '#b09a6b');
    line(ctx, -8, -36, -8, -38, 1, '#b09a6b');
    line(ctx, 4, -30, 8, -36, 1.5, '#b09a6b');
    line(ctx, 8, -36, 10, -34, 1, '#b09a6b');
    // head
    px(ctx, -4, -31, 8, 8, C.outline);
    px(ctx, -3, -30, 6, 7, C.skinDark);
    px(ctx, -3, -27, 2, 2, '#8fe37b');
    px(ctx, 1, -27, 2, 2, '#8fe37b');
    px(ctx, -4, -32, 8, 3, '#2b4030');
    // staff with green orb
    ctx.save(); ctx.translate(8, -16); ctx.rotate(-.12);
    px(ctx, 0, -1, 18, 2, '#4c3a25');
    glow(ctx, 18, 0, 8, 'rgba(96,224,124,.7)', .55);
    pixelOrb(ctx, 18, 0, 3, '#3b9e55', '#c7ffce');
    ctx.restore();
  }

  function drawWorgen(ctx) {
    const w = baseWalk();
    shadow(ctx, 0, 1, 17, 6, .34);
    px(ctx, -5, -8 + w.step * .4, 3, 8, '#3a3940');
    px(ctx, 2, -8 - w.step * .4, 3, 8, '#4a4952');
    px(ctx, -7, -3, 4, 3, '#1c1c22');
    px(ctx, 1, -3, 4, 3, '#1c1c22');
    // mane
    poly(ctx, [[-9, -24], [0, -28], [9, -24], [10, -13], [5, -8], [-5, -8], [-10, -13]], '#3e3d46');
    poly(ctx, [[-6, -22], [6, -22], [8, -11], [0, -7], [-8, -11]], '#66646f');
    // arms/claws
    px(ctx, -11, -21, 4, 12, '#55535e');
    poly(ctx, [[-13, -10], [-8, -10], [-9, -5], [-12, -4], [-14, -7]], '#77747e');
    px(ctx, 8, -21, 4, 11, '#5a5864');
    poly(ctx, [[8, -11], [13, -10], [14, -6], [11, -4], [8, -7]], '#88858f');
    // head
    px(ctx, -5, -32, 10, 9, C.outline);
    poly(ctx, [[-4, -31], [4, -31], [6, -27], [3, -23], [-3, -23], [-6, -27]], '#77737d');
    poly(ctx, [[-3, -29], [3, -29], [5, -27], [1, -24], [-3, -25]], '#8e8a93');
    px(ctx, -3, -29, 2, 2, '#f5c84e');
    px(ctx, 1, -29, 2, 2, '#f5c84e');
    px(ctx, -1, -25, 4, 1, '#2a2527');
    poly(ctx, [[-5, -33], [-3, -38], [0, -33]], '#4c4954');
    poly(ctx, [[0, -33], [3, -38], [5, -32]], '#4c4954');
    px(ctx, 0, -27, 2, 2, '#d7cfc2');
  }

  function drawGhost(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 300) * 2;
    ctx.save();
    ctx.globalAlpha = .8;
    glow(ctx, 0, -13, 18, 'rgba(91,159,220,.35)', .38);
    poly(ctx, [[-7, -26 + bob], [7, -26 + bob], [9, -10 + bob], [6, -4 + bob], [3, -8 + bob], [0, -3 + bob], [-3, -8 + bob], [-6, -4 + bob], [-9, -10 + bob]], '#24496b');
    poly(ctx, [[-5, -24 + bob], [5, -24 + bob], [6, -11 + bob], [0, -6 + bob], [-6, -11 + bob]], '#427699');
    // arms
    px(ctx, -9, -20 + bob, 3, 8, '#5790b5');
    px(ctx, 6, -20 + bob, 3, 8, '#5790b5');
    // head
    px(ctx, -5, -33 + bob, 10, 8, '#0e1c2b');
    px(ctx, -4, -32 + bob, 8, 7, '#7fc1dd');
    px(ctx, -3, -30 + bob, 2, 2, '#0c2333');
    px(ctx, 1, -30 + bob, 2, 2, '#0c2333');
    px(ctx, -1, -27 + bob, 2, 2, '#355c75');
    px(ctx, -4, -35 + bob, 8, 2, '#a7e5f7');
    ctx.restore();
  }

  function drawDarkiron(ctx) {
    const w = baseWalk();
    shadow(ctx, 0, 1, 18, 7, .38);
    px(ctx, -6, -8, 4, 8, '#2e302f');
    px(ctx, 2, -8, 4, 8, '#3b3d3b');
    px(ctx, -8, -3, 5, 3, '#171817');
    px(ctx, 2, -3, 5, 3, '#171817');
    px(ctx, -8, -22, 16, 14, '#2b2d2c');
    px(ctx, -7, -21, 14, 12, '#555a58');
    px(ctx, -7, -19, 14, 2, '#7d837f');
    px(ctx, -7, -13, 14, 2, '#9a6b3c');
    px(ctx, -2, -21, 4, 9, '#a52f26');
    // pauldrons
    px(ctx, -12, -22, 5, 5, '#222523');
    px(ctx, -12, -22, 4, 4, '#6c706d');
    px(ctx, 7, -22, 5, 5, '#222523');
    px(ctx, 8, -22, 4, 4, '#6c706d');
    // arms
    px(ctx, -11, -18, 4, 9, '#484b48');
    px(ctx, 8, -18, 4, 9, '#484b48');
    // head
    px(ctx, -5, -31, 10, 9, C.outline);
    px(ctx, -4, -30, 8, 8, '#8e6450');
    px(ctx, -4, -27, 2, 2, '#1c1714');
    px(ctx, 2, -27, 2, 2, '#1c1714');
    // beard
    poly(ctx, [[-5, -25], [5, -25], [7, -18], [4, -14], [1, -19], [-2, -14], [-6, -19]], '#c0542e');
    px(ctx, -3, -24, 6, 1, '#e88546');
    // horned helm
    poly(ctx, [[-6, -34], [6, -34], [5, -30], [-5, -30]], '#4d504c');
    poly(ctx, [[-5, -35], [-8, -39], [-4, -37]], '#8f8b74');
    poly(ctx, [[5, -35], [8, -39], [4, -37]], '#8f8b74');
    px(ctx, -1, -33, 2, 2, '#d3a34d');
    // hammer
    ctx.save(); ctx.translate(10, -13); ctx.rotate(.2);
    px(ctx, 0, -2, 2, 17, '#5d4127');
    px(ctx, -3, 12, 8, 5, '#3c3e3c');
    px(ctx, -2, 13, 6, 3, '#767976');
    ctx.restore();
  }

  function drawShaman(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 220) * 1;
    shadow(ctx, 0, 1, 15, 6, .3);
    poly(ctx, [[-7, -23 + bob], [7, -23 + bob], [9, -3], [0, 1], [-9, -3]], '#3d2622');
    poly(ctx, [[-5, -22 + bob], [5, -22 + bob], [7, -5], [0, -1], [-7, -5]], '#6b3930');
    px(ctx, -8, -9, 16, 2, '#c08d43');
    px(ctx, -8, -20, 3, 9, '#572d28');
    px(ctx, 5, -20, 3, 9, '#572d28');
    // mask/head
    px(ctx, -5, -31 + bob, 10, 9, C.outline);
    px(ctx, -4, -30 + bob, 8, 8, '#b67a4e');
    px(ctx, -3, -27 + bob, 2, 2, '#ffb347');
    px(ctx, 1, -27 + bob, 2, 2, '#ffb347');
    px(ctx, -2, -24 + bob, 4, 1, '#5b2c23');
    poly(ctx, [[-6, -33 + bob], [0, -37 + bob], [6, -33 + bob], [4, -31 + bob], [-4, -31 + bob]], '#34201d');
    // flame staff
    ctx.save(); ctx.translate(8, -17); ctx.rotate(-.2);
    px(ctx, 0, -1, 19, 2, '#4f3624');
    glow(ctx, 20, -2, 10, 'rgba(255,103,32,.8)', .6);
    poly(ctx, [[18, -8], [22, -4], [20, 2], [16, 2], [15, -4]], '#d43e1c');
    poly(ctx, [[18, -5], [20, -2], [18, 1], [17, -2]], '#ffbd3e');
    ctx.restore();
  }

  function drawGhoul(ctx) {
    const w = baseWalk();
    shadow(ctx, 0, 1, 16, 6, .32);
    px(ctx, -6, -8 + w.step * .3, 3, 8, '#55606a');
    px(ctx, 2, -8 - w.step * .3, 3, 8, '#626d77');
    px(ctx, -7, -3, 4, 3, '#2d353c');
    px(ctx, 2, -3, 4, 3, '#2d353c');
    // hunched body
    poly(ctx, [[-8, -22], [5, -24], [9, -13], [4, -8], [-8, -10]], '#5c6570');
    poly(ctx, [[-6, -21], [4, -22], [6, -14], [2, -10], [-6, -12]], '#7d8790');
    // ribs
    px(ctx, -4, -19, 8, 1, '#b9c1c4');
    px(ctx, -4, -16, 7, 1, '#9aa5aa');
    px(ctx, -3, -13, 6, 1, '#879399');
    // arms long
    px(ctx, -11, -21, 3, 13, '#646e78');
    px(ctx, -13, -10, 5, 3, '#8d969c');
    px(ctx, 8, -20, 3, 13, '#6c7680');
    px(ctx, 8, -8, 5, 3, '#9ba4aa');
    // head
    px(ctx, -5, -31, 10, 9, C.outline);
    px(ctx, -4, -30, 8, 8, '#98a39f');
    px(ctx, -3, -28, 2, 2, '#a6ff6a');
    px(ctx, 2, -28, 2, 2, '#a6ff6a');
    px(ctx, -2, -25, 5, 2, '#313a36');
    px(ctx, -4, -33, 8, 2, '#58605c');
    px(ctx, -5, -30, 1, 4, '#58605c');
    ctx.strokeStyle = '#b6bdb6'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-8, -24); ctx.lineTo(-12, -18); ctx.stroke();
  }

  function drawValkyr(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 260) * 2;
    ctx.save();
    ctx.globalAlpha = .9;
    glow(ctx, 0, -18, 22, 'rgba(83,205,255,.3)', .4);
    shadow(ctx, 0, 1, 15, 5, .25);
    // wings
    poly(ctx, [[-5, -24 + bob], [-18, -32 + bob], [-14, -20 + bob], [-20, -17 + bob], [-7, -12 + bob]], '#4a9ec4');
    poly(ctx, [[5, -24 + bob], [18, -32 + bob], [14, -20 + bob], [20, -17 + bob], [7, -12 + bob]], '#6ec3dd');
    line(ctx, -7, -23 + bob, -16, -28 + bob, 1, '#b5efff');
    line(ctx, 7, -23 + bob, 16, -28 + bob, 1, '#b5efff');
    // robe
    poly(ctx, [[-5, -24 + bob], [5, -24 + bob], [8, -7 + bob], [4, -3 + bob], [0, -6 + bob], [-4, -3 + bob], [-8, -7 + bob]], '#2d5d83');
    poly(ctx, [[-4, -22 + bob], [4, -22 + bob], [5, -8 + bob], [0, -5 + bob], [-5, -8 + bob]], '#4c8cb0');
    px(ctx, -6, -10 + bob, 12, 2, '#c5a45c');
    // head
    px(ctx, -4, -32 + bob, 8, 8, '#152c3b');
    px(ctx, -3, -31 + bob, 6, 7, '#8ec7da');
    px(ctx, -3, -29 + bob, 2, 2, '#efffff');
    px(ctx, 1, -29 + bob, 2, 2, '#efffff');
    poly(ctx, [[-5, -33 + bob], [0, -38 + bob], [5, -33 + bob], [3, -31 + bob], [-3, -31 + bob]], '#c7a55c');
    // spear
    ctx.save(); ctx.translate(8, -17); ctx.rotate(-.35);
    px(ctx, 0, -1, 20, 2, '#8f7345');
    poly(ctx, [[19, -4], [26, 0], [19, 4]], '#c8f4ff');
    ctx.restore();
    ctx.restore();
  }

  const NORMAL_DRAW = {
    pirate: drawPirate, miner: drawMiner, raptor: drawRaptor, druid: drawDruid,
    worgen: drawWorgen, ghost: drawGhost, darkiron: drawDarkiron, shaman: drawShaman,
    ghoul: drawGhoul, valkyr: drawValkyr
  };

  function drawEnemy(ctx, e) {
    const fn = NORMAL_DRAW[e.sprite] || drawPirate;
    const x = Math.round(e.x), y = Math.round(e.y);
    const face = Math.cos(e.aim || 0) >= 0 ? 1 : -1;
    // 稀有/精英与速度型敌人的辨识色
    if (e.aura || e.elite) {
      ctx.save();
      ctx.globalAlpha = e.elite ? .3 : .18;
      ctx.fillStyle = e.elite ? '#ffd36a' : e.aura;
      ctx.beginPath();
      ctx.ellipse(x, y - 2, e.radius * 1.9, e.radius * .8, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = e.elite ? .8 : .35;
      ctx.strokeStyle = e.elite ? '#ffe3a3' : e.aura;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y - 1, e.radius * 1.55, e.radius * .62, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    if (e.elite) {
      ctx.save();
      px(ctx, x - 4, y - 45, 2, 2, '#ffe3a3');
      px(ctx, x, y - 48, 2, 3, '#ffd36a');
      px(ctx, x + 4, y - 45, 2, 2, '#ffe3a3');
      ctx.restore();
    }
    if (e.fuse > 0) {
      ctx.save();
      ctx.globalAlpha = .45 + Math.sin(performance.now() / 55) * .2;
      ctx.strokeStyle = '#ff5b3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y - 12, 18 + (1 - e.fuse) * 8, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(face * (e.scale || 1), e.scale || 1);
    fn(ctx);
    ctx.restore();
    if (e.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(.6, e.hitFlash * 8);
      ctx.fillStyle = '#fff3df';
      ctx.beginPath(); ctx.arc(x, y - 12, 10, 0, TAU); ctx.fill();
      ctx.restore();
    }
    if (e.stun > 0 || e.frozen > 0) {
      ctx.save();
      ctx.globalAlpha = .65;
      ctx.strokeStyle = e.frozen > 0 ? '#a8f3ff' : '#ffd76b';
      for (let i = 0; i < 3; i++) {
        const a = performance.now() / 280 + i * TAU / 3;
        px(ctx, x + Math.cos(a) * 9 - 1, y - 30 + Math.sin(a) * 2, 2, 2, e.frozen > 0 ? '#d6fbff' : '#ffe9a8');
      }
      if (e.frozen > 0) {
        poly(ctx, [[x - 12, y - 3], [x - 8, y - 12], [x - 4, y - 3]], 'rgba(150,235,255,.35)');
        poly(ctx, [[x + 5, y - 2], [x + 10, y - 13], [x + 13, y - 2]], 'rgba(150,235,255,.3)');
      }
      ctx.restore();
    }
    if (e.burn > 0) {
      ctx.save();
      ctx.globalAlpha = .7;
      for (let i = 0; i < 2; i++) {
        const yy = y - 10 - ((performance.now() / 8 + i * 13) % 18);
        px(ctx, x + (i ? 5 : -6), yy, 2, 3, i ? '#ffb23e' : '#e85a21');
      }
      ctx.restore();
    }
    if (e.bleed > 0) {
      ctx.save();
      ctx.globalAlpha = .55;
      px(ctx, x - 5, y - 2, 1, 2, '#c62834');
      px(ctx, x + 4, y - 1, 1, 1, '#a51e2a');
      ctx.restore();
    }
  }

  /* =========================================================
     BOSSES
     ========================================================= */
  function drawVancleef(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 260) > 0 ? 1 : 0;
    shadow(ctx, 0, 2, 25, 9, .42);
    // coat back
    poly(ctx, [[-11, -28 + bob], [11, -28 + bob], [14, -6], [8, -2], [3, -8], [-3, -2], [-9, -8], [-14, -6]], '#4b1819');
    // legs
    px(ctx, -7, -10, 5, 10, '#2d2a33');
    px(ctx, 3, -10, 5, 10, '#39343c');
    px(ctx, -10, -2, 7, 3, '#161419');
    px(ctx, 3, -2, 7, 3, '#161419');
    // torso
    px(ctx, -10, -30 + bob, 20, 21, C.outline);
    px(ctx, -9, -29 + bob, 18, 19, '#702323');
    px(ctx, -9, -27 + bob, 18, 5, '#96302c');
    px(ctx, -9, -17 + bob, 18, 3, '#c0954b');
    px(ctx, -2, -29 + bob, 4, 19, '#d2ad63');
    // shirt
    px(ctx, -5, -29 + bob, 10, 9, '#d3c4a6');
    px(ctx, -5, -21 + bob, 10, 3, '#4d2c22');
    // arms
    px(ctx, -14, -27 + bob, 5, 15, '#7b2625');
    px(ctx, 9, -27 + bob, 5, 15, '#7b2625');
    px(ctx, -15, -13 + bob, 5, 5, C.skinDark);
    px(ctx, 10, -13 + bob, 5, 5, C.skin);
    // pauldrons
    px(ctx, -16, -30 + bob, 7, 6, '#2d2021');
    px(ctx, -15, -30 + bob, 5, 4, '#a47b3e');
    px(ctx, 9, -30 + bob, 7, 6, '#2d2021');
    px(ctx, 10, -30 + bob, 5, 4, '#a47b3e');
    // head
    px(ctx, -6, -41 + bob, 12, 12, C.outline);
    px(ctx, -5, -40 + bob, 10, 10, C.skin);
    px(ctx, -5, -38 + bob, 10, 5, C.skinLight);
    px(ctx, -4, -37 + bob, 2, 2, '#241a14');
    px(ctx, 2, -37 + bob, 2, 2, '#241a14');
    px(ctx, -1, -34 + bob, 4, 1, '#6d4932');
    // bandana / tricorn
    px(ctx, -7, -43 + bob, 14, 3, '#7d2425');
    poly(ctx, [[-11, -42 + bob], [0, -49 + bob], [11, -42 + bob], [7, -40 + bob], [0, -44 + bob], [-7, -40 + bob]], '#2a1c1e');
    px(ctx, 4, -41 + bob, 2, 1, '#d0a44e');
    // dual swords
    for (let s = -1; s <= 1; s += 2) {
      ctx.save();
      ctx.translate(s * 12, -14 + bob);
      ctx.rotate(s * .55 - .12);
      px(ctx, -1, -2, 6, 3, '#5d3a1c');
      px(ctx, 4, -4, 3, 6, '#d2a34f');
      px(ctx, 6, -2, 18, 3, '#c8d2da');
      px(ctx, 6, -2, 17, 1, '#f5f8fa');
      poly(ctx, [[23, -2], [29, 0], [23, 2]], '#f0f5f8');
      ctx.restore();
    }
  }

  function drawMutanus(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 210) * 2;
    shadow(ctx, 0, 2, 30, 10, .42);
    // tail/fins
    poly(ctx, [[-12, -8], [-30, -3], [-38, 4], [-28, 2], [-20, 8], [-10, 2]], '#2c5e52');
    // body
    poly(ctx, [[-16, -30 + bob], [16, -30 + bob], [24, -14 + bob], [18, 2], [0, 7], [-18, 2], [-24, -14 + bob]], '#396f61');
    poly(ctx, [[-13, -28 + bob], [13, -28 + bob], [19, -14 + bob], [14, -1], [0, 3], [-14, -1], [-19, -14 + bob]], '#4e8b76');
    // belly
    poly(ctx, [[-9, -17 + bob], [9, -17 + bob], [12, -4], [0, 1], [-12, -4]], '#8fae83');
    px(ctx, -9, -12 + bob, 18, 1, '#6f9270');
    px(ctx, -7, -8 + bob, 14, 1, '#6f9270');
    // fins
    poly(ctx, [[-17, -24 + bob], [-28, -30 + bob], [-24, -18 + bob], [-30, -12 + bob], [-16, -10 + bob]], '#285b51');
    poly(ctx, [[17, -24 + bob], [28, -30 + bob], [24, -18 + bob], [30, -12 + bob], [16, -10 + bob]], '#285b51');
    line(ctx, -20, -20 + bob, -27, -25 + bob, 1, '#68b49b');
    line(ctx, 20, -20 + bob, 27, -25 + bob, 1, '#68b49b');
    // arms
    px(ctx, -24, -19 + bob, 6, 13, '#3d7868');
    px(ctx, 18, -19 + bob, 6, 13, '#3d7868');
    px(ctx, -26, -8 + bob, 7, 4, '#79b49a');
    px(ctx, 19, -8 + bob, 7, 4, '#79b49a');
    // head/face
    poly(ctx, [[-14, -37 + bob], [14, -37 + bob], [19, -27 + bob], [10, -20 + bob], [-10, -20 + bob], [-19, -27 + bob]], '#2f6659');
    poly(ctx, [[-11, -35 + bob], [11, -35 + bob], [15, -28 + bob], [8, -23 + bob], [-8, -23 + bob], [-15, -28 + bob]], '#5c9c86');
    // eyes
    px(ctx, -10, -33 + bob, 5, 3, '#ffdf6b');
    px(ctx, 5, -33 + bob, 5, 3, '#ffdf6b');
    px(ctx, -8, -32 + bob, 2, 2, '#10150f');
    px(ctx, 7, -32 + bob, 2, 2, '#10150f');
    // mouth
    px(ctx, -9, -26 + bob, 18, 2, '#2d1c20');
    px(ctx, -6, -25 + bob, 3, 2, '#e6ddbd');
    px(ctx, 3, -25 + bob, 3, 2, '#e6ddbd');
    // crest
    poly(ctx, [[-3, -37 + bob], [0, -46 + bob], [3, -37 + bob]], '#9e3f47');
    poly(ctx, [[0, -38 + bob], [8, -44 + bob], [7, -36 + bob]], '#c65757');
    // staff with bubbles
    ctx.save(); ctx.translate(24, -16); ctx.rotate(.12);
    px(ctx, 0, -1, 20, 3, '#5d4b2d');
    glow(ctx, 20, 0, 12, 'rgba(122,231,140,.55)', .5);
    pixelOrb(ctx, 20, 0, 4, '#4fa95f', '#d6ffbc');
    ctx.restore();
  }

  function drawArugal(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 300) * 2;
    shadow(ctx, 0, 2, 26, 9, .42);
    // cloak
    poly(ctx, [[-16, -34 + bob], [16, -34 + bob], [23, -3], [10, -9], [0, 2], [-10, -9], [-23, -3]], '#1a1730');
    poly(ctx, [[-12, -33 + bob], [12, -33 + bob], [17, -7], [6, -12], [0, -2], [-6, -12], [-17, -7]], '#2c2750');
    px(ctx, -2, -33 + bob, 4, 26, '#4e417a');
    // shoulders / wolf pelt
    poly(ctx, [[-14, -34 + bob], [-4, -38 + bob], [0, -33 + bob], [4, -38 + bob], [14, -34 + bob], [11, -26 + bob], [-11, -26 + bob]], '#2a243c');
    poly(ctx, [[-15, -33 + bob], [-22, -39 + bob], [-17, -29 + bob], [-22, -27 + bob], [-13, -26 + bob]], '#6a5d7e');
    poly(ctx, [[15, -33 + bob], [22, -39 + bob], [17, -29 + bob], [22, -27 + bob], [13, -26 + bob]], '#6a5d7e');
    // head
    px(ctx, -7, -45 + bob, 14, 13, C.outline);
    px(ctx, -6, -44 + bob, 12, 11, '#8e8ba4');
    px(ctx, -6, -41 + bob, 12, 5, '#aca8bf');
    px(ctx, -5, -40 + bob, 2, 2, '#71eaff');
    px(ctx, 3, -40 + bob, 2, 2, '#71eaff');
    px(ctx, -2, -37 + bob, 4, 1, '#4c425a');
    // hood
    poly(ctx, [[-9, -46 + bob], [0, -53 + bob], [9, -46 + bob], [7, -40 + bob], [3, -46 + bob], [0, -43 + bob], [-3, -46 + bob], [-7, -40 + bob]], '#19162a');
    px(ctx, -5, -46 + bob, 3, 1, '#796aa4');
    px(ctx, 2, -46 + bob, 3, 1, '#796aa4');
    // staff
    ctx.save(); ctx.translate(13, -25 + bob); ctx.rotate(-.12);
    px(ctx, 0, -1, 28, 4, '#3e2c1d');
    px(ctx, 4, -1, 20, 2, '#6b4e2e');
    glow(ctx, 28, 0, 14, 'rgba(173,111,255,.7)', .55);
    pixelOrb(ctx, 28, 0, 6, '#5e3596', '#e2c2ff');
    pixelOrb(ctx, 27, -1, 2.5, '#d6b3ff', '#fff');
    ctx.restore();
    // floating runes
    ctx.save(); ctx.globalAlpha = .45;
    px(ctx, -23, -18 + bob, 2, 2, '#b18cff');
    px(ctx, 20, -20 + bob, 1, 1, '#b18cff');
    ctx.restore();
  }

  function drawThaurissan(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 240) > 0 ? 1 : 0;
    shadow(ctx, 0, 2, 30, 10, .46);
    // legs
    px(ctx, -11, -12, 8, 12, '#2f2b29');
    px(ctx, 4, -12, 8, 12, '#3c3733');
    px(ctx, -14, -2, 10, 3, '#1b1817');
    px(ctx, 4, -2, 10, 3, '#1b1817');
    // body
    px(ctx, -17, -36 + bob, 34, 26, C.outline);
    px(ctx, -15, -34 + bob, 30, 23, '#4b4540');
    px(ctx, -13, -32 + bob, 26, 10, '#71675d');
    px(ctx, -13, -24 + bob, 26, 3, '#b17a38');
    px(ctx, -5, -34 + bob, 10, 23, '#8f2e25');
    px(ctx, -5, -34 + bob, 10, 2, '#ca5b34');
    // arms
    px(ctx, -21, -31 + bob, 7, 18, '#5c5249');
    px(ctx, 14, -31 + bob, 7, 18, '#5c5249');
    px(ctx, -23, -14 + bob, 7, 5, '#8e6450');
    px(ctx, 16, -14 + bob, 7, 5, '#8e6450');
    // pauldrons with spikes
    px(ctx, -24, -37 + bob, 10, 8, '#2d2926');
    px(ctx, -22, -36 + bob, 7, 5, '#82776b');
    poly(ctx, [[-23, -38 + bob], [-27, -44 + bob], [-19, -39 + bob]], '#b5aa91');
    px(ctx, 14, -37 + bob, 10, 8, '#2d2926');
    px(ctx, 16, -36 + bob, 7, 5, '#82776b');
    poly(ctx, [[23, -38 + bob], [27, -44 + bob], [19, -39 + bob]], '#b5aa91');
    // head
    px(ctx, -8, -48 + bob, 16, 14, C.outline);
    px(ctx, -7, -47 + bob, 14, 12, '#8e6450');
    px(ctx, -7, -44 + bob, 14, 6, '#a87a5f');
    px(ctx, -5, -43 + bob, 3, 2, '#2e1b12');
    px(ctx, 2, -43 + bob, 3, 2, '#2e1b12');
    // beard
    poly(ctx, [[-8, -39 + bob], [8, -39 + bob], [11, -28 + bob], [5, -21 + bob], [0, -30 + bob], [-5, -21 + bob], [-11, -28 + bob]], '#c04b24');
    poly(ctx, [[-6, -37 + bob], [6, -37 + bob], [7, -30 + bob], [0, -25 + bob], [-7, -30 + bob]], '#e77a31');
    px(ctx, -4, -34 + bob, 8, 2, '#ffc056');
    // crown
    poly(ctx, [[-9, -50 + bob], [-7, -56 + bob], [-4, -51 + bob], [0, -58 + bob], [4, -51 + bob], [7, -56 + bob], [9, -50 + bob]], '#d3a64b');
    px(ctx, -8, -50 + bob, 16, 3, '#8f6a2d');
    px(ctx, -1, -56 + bob, 2, 2, '#ffdf8b');
    // hammer
    ctx.save(); ctx.translate(20, -20 + bob); ctx.rotate(-.25);
    px(ctx, 0, -2, 3, 32, '#5b4028');
    px(ctx, -8, 27, 20, 10, '#34322f');
    px(ctx, -6, 28, 16, 6, '#77736c');
    px(ctx, -6, 28, 16, 2, '#b0aa9d');
    ctx.restore();
    // flame flecks
    ctx.save(); ctx.globalAlpha = .6;
    px(ctx, 10, -44 + bob, 2, 2, '#ffb43e');
    px(ctx, -14, -38 + bob, 1, 1, '#ff6b2e');
    ctx.restore();
  }

  function drawLichking(ctx) {
    const t = performance.now();
    const bob = Math.sin(t / 320) * 1;
    // aura
    glow(ctx, 0, -26, 40, 'rgba(87,193,255,.18)', .5);
    shadow(ctx, 0, 2, 32, 10, .5);
    // cape
    poly(ctx, [[-16, -40 + bob], [16, -40 + bob], [23, -4], [13, -11], [6, -2], [0, -8], [-6, -2], [-13, -11], [-23, -4]], '#15151f');
    poly(ctx, [[-12, -40 + bob], [12, -40 + bob], [17, -8], [8, -14], [0, -7], [-8, -14], [-17, -8]], '#232438');
    // legs
    px(ctx, -10, -13, 7, 13, '#252631');
    px(ctx, 4, -13, 7, 13, '#2e2f3c');
    px(ctx, -13, -2, 9, 3, '#111119');
    px(ctx, 4, -2, 9, 3, '#111119');
    // armor body
    px(ctx, -15, -39 + bob, 30, 27, C.outline);
    px(ctx, -13, -37 + bob, 26, 24, '#333746');
    px(ctx, -11, -35 + bob, 22, 9, '#586076');
    px(ctx, -11, -25 + bob, 22, 2, '#8aa6bf');
    px(ctx, -4, -37 + bob, 8, 23, '#1e202c');
    px(ctx, -4, -37 + bob, 8, 3, '#8cc7e5');
    // pauldrons
    poly(ctx, [[-16, -38 + bob], [-26, -44 + bob], [-28, -34 + bob], [-22, -27 + bob], [-13, -30 + bob]], '#2b2e3d');
    poly(ctx, [[-16, -38 + bob], [-23, -40 + bob], [-24, -33 + bob], [-19, -29 + bob], [-13, -32 + bob]], '#59667c');
    poly(ctx, [[16, -38 + bob], [26, -44 + bob], [28, -34 + bob], [22, -27 + bob], [13, -30 + bob]], '#2b2e3d');
    poly(ctx, [[16, -38 + bob], [23, -40 + bob], [24, -33 + bob], [19, -29 + bob], [13, -32 + bob]], '#59667c');
    poly(ctx, [[-24, -40 + bob], [-30, -48 + bob], [-19, -42 + bob]], '#a6c8d8');
    poly(ctx, [[24, -40 + bob], [30, -48 + bob], [19, -42 + bob]], '#a6c8d8');
    // arms
    px(ctx, -23, -31 + bob, 6, 16, '#454b5e');
    px(ctx, 17, -31 + bob, 6, 16, '#50576c');
    // head/helm
    px(ctx, -8, -51 + bob, 16, 14, C.outline);
    px(ctx, -7, -50 + bob, 14, 12, '#667084');
    px(ctx, -6, -49 + bob, 12, 4, '#8996a9');
    px(ctx, -5, -45 + bob, 10, 7, '#1d2330');
    px(ctx, -4, -45 + bob, 3, 2, '#7ce6ff');
    px(ctx, 2, -45 + bob, 3, 2, '#7ce6ff');
    // helm horns
    poly(ctx, [[-8, -52 + bob], [-16, -58 + bob], [-14, -49 + bob], [-7, -48 + bob]], '#8fa4b5');
    poly(ctx, [[8, -52 + bob], [16, -58 + bob], [14, -49 + bob], [7, -48 + bob]], '#8fa4b5');
    poly(ctx, [[-2, -53 + bob], [0, -60 + bob], [2, -53 + bob]], '#a8bdcb');
    // frostmourne
    ctx.save(); ctx.translate(22, -24 + bob); ctx.rotate(-.28);
    px(ctx, 0, -2, 4, 12, '#3d2e22');
    px(ctx, -3, 9, 10, 3, '#bdd7e2');
    px(ctx, -2, 11, 8, 2, '#6d8796');
    px(ctx, 1, 12, 2, 25, '#b9e5f2');
    px(ctx, 1, 12, 1, 24, '#f2ffff');
    poly(ctx, [[1, 38], [5, 38], [3, 43]], '#eafcff');
    // runes
    px(ctx, 2, 18, 1, 2, '#68d9ff');
    px(ctx, 2, 24, 1, 2, '#68d9ff');
    ctx.restore();
    // ice shards floating
    ctx.save(); ctx.globalAlpha = .7;
    px(ctx, -20, -25 + bob, 2, 2, '#b6eeff');
    px(ctx, 18, -34 + bob, 1, 1, '#ddfaff');
    ctx.restore();
  }

  const BOSS_DRAW = {
    vancleef: drawVancleef, mutanus: drawMutanus, arugal: drawArugal,
    thaurissan: drawThaurissan, lichking: drawLichking
  };

  function drawBoss(ctx, b) {
    const fn = BOSS_DRAW[b.sprite] || drawVancleef;
    const x = Math.round(b.x), y = Math.round(b.y);
    const face = Math.cos(b.aim || 0) >= 0 ? 1 : -1;
    // elite aura ring
    ctx.save();
    ctx.globalAlpha = .35 + Math.sin(performance.now() / 260) * .08;
    ctx.strokeStyle = '#d8ad61';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y + 1, 27, 8, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = .09;
    ctx.fillStyle = '#ffd270';
    ctx.beginPath(); ctx.ellipse(x, y + 1, 30, 10, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(face * (b.scale || 2), b.scale || 2);
    fn(ctx);
    ctx.restore();
    if (b.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(.45, b.hitFlash * 4);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y - 25, 24, 0, TAU); ctx.fill();
      ctx.restore();
    }
    if (b.stun > 0) {
      ctx.save();
      ctx.globalAlpha = .8;
      for (let i = 0; i < 4; i++) {
        const a = performance.now() / 300 + i * TAU / 4;
        px(ctx, x + Math.cos(a) * 16 - 1, y - 55 + Math.sin(a) * 3, 2, 2, '#ffd76b');
      }
      ctx.restore();
    }
  }

  /* =========================================================
     ENVIRONMENT
     ========================================================= */
  function paintArena(ctx, w, h, theme, seed) {
    const random = rnd(seed || 7);
    const wall = 26;
    // 16px 错缝石砖地板：低对比度、1px 斜切高光，减少“棋盘格”感
    px(ctx, 0, 0, w, h, theme.floor[0]);
    const tile = 16;
    const rows = Math.ceil(h / tile) + 1;
    const cols = Math.ceil(w / tile) + 2;
    for (let ry = 0; ry < rows; ry++) {
      const y = ry * tile;
      const offset = (ry % 2) * 8;
      for (let cx = -1; cx < cols; cx++) {
        const x = cx * tile + offset;
        const c = random() < .8 ? theme.floor[0] : theme.floor[1 + Math.floor(random() * (theme.floor.length - 1))];
        ctx.globalAlpha = .46 + random() * .15;
        px(ctx, x + 1, y + 1, tile - 2, tile - 2, c);
        ctx.globalAlpha = 1;
        // 顶/左 1px 磨光高光，底/右 1px 阴影
        ctx.globalAlpha = .055;
        px(ctx, x + 1, y + 1, tile - 2, 1, '#fff7df');
        px(ctx, x + 1, y + 1, 1, tile - 2, '#fff7df');
        ctx.globalAlpha = .18;
        px(ctx, x + 1, y + tile - 2, tile - 2, 1, theme.grout);
        px(ctx, x + tile - 2, y + 1, 1, tile - 2, theme.grout);
        ctx.globalAlpha = 1;
        if (random() < .2) {
          px(ctx, x + 3 + random() * 9, y + 4 + random() * 8, 1, 1, theme.grout);
        }
        if (random() < .12) {
          const sx = x + 4 + random() * 7;
          line(ctx, sx, y + 4 + random() * 6, sx + 2 + random() * 3, y + 7 + random() * 3, 1, theme.grout);
        }
      }
    }
    // subtle aisle
    const aisleW = 92;
    ctx.globalAlpha = .1;
    ctx.fillStyle = theme.accent;
    ctx.fillRect(w / 2 - aisleW / 2, wall, aisleW, h - wall * 2);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 16; i++) {
      const x = 40 + random() * (w - 80);
      const y = 40 + random() * (h - 80);
      if (random() < .5) {
        ctx.globalAlpha = .18;
        px(ctx, x, y, 3 + random() * 12, 2, theme.grout);
        ctx.globalAlpha = 1;
      }
    }
    // walls
    const drawBrick = (x, y, bw, bh, base, top) => {
      px(ctx, x, y, bw, bh, base);
      px(ctx, x + 1, y + 1, bw - 2, 2, top);
      px(ctx, x + 1, y + bh - 2, bw - 2, 1, 'rgba(0,0,0,.3)');
    };
    px(ctx, 0, 0, w, wall, theme.wallDark);
    px(ctx, 0, 0, w, 5, 'rgba(0,0,0,.55)');
    for (let x = 0; x < w; x += 34) {
      drawBrick(x, 6, 30, 20, theme.wallSide, theme.wallTop);
    }
    px(ctx, 0, wall - 3, w, 3, theme.grout);
    px(ctx, 0, wall, w, 1, 'rgba(255,220,160,.08)');
    // bottom wall
    px(ctx, 0, h - wall, w, wall, theme.wallDark);
    for (let x = 0; x < w; x += 34) {
      drawBrick(x, h - wall, 30, 19, theme.wallSide, theme.wallTop);
    }
    px(ctx, 0, h - wall - 2, w, 2, 'rgba(0,0,0,.4)');
    // side walls
    px(ctx, 0, wall, wall, h - wall * 2, theme.wallDark);
    px(ctx, w - wall, wall, wall, h - wall * 2, theme.wallDark);
    for (let y = wall; y < h - wall; y += 32) {
      drawBrick(0, y, 24, 28, theme.wallSide, theme.wallTop);
      drawBrick(w - 26, y, 24, 28, theme.wallSide, theme.wallTop);
    }
    // corner pillars
    for (const cp of [[0, 0], [w - 34, 0], [0, h - 34], [w - 34, h - 34]]) {
      px(ctx, cp[0], cp[1], 34, 34, theme.wallDark);
      px(ctx, cp[0] + 3, cp[1] + 3, 28, 28, theme.wallSide);
      px(ctx, cp[0] + 8, cp[1] + 8, 20, 20, theme.wallTop);
      px(ctx, cp[0] + 12, cp[1] + 12, 12, 12, theme.wallDark);
      px(ctx, cp[0] + 15, cp[1] + 15, 6, 6, theme.accent);
    }
    // edge shadow
    const edge = ctx.createLinearGradient(0, wall, 0, wall + 24);
    edge.addColorStop(0, 'rgba(0,0,0,.42)');
    edge.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = edge; ctx.fillRect(wall, wall, w - wall * 2, 24);
    // 中央符文圆环
    const cx = w / 2, cy = h / 2;
    ctx.save();
    ctx.globalAlpha = .16;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 92, 0, TAU); ctx.stroke();
    ctx.globalAlpha = .1;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 72, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 112, 0, TAU); ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = i * TAU / 12;
      ctx.globalAlpha = .12;
      line(ctx, cx + Math.cos(a) * 74, cy + Math.sin(a) * 74, cx + Math.cos(a) * 109, cy + Math.sin(a) * 109, 1, theme.accent);
      ctx.globalAlpha = .22;
      px(ctx, cx + Math.cos(a) * 92 - 1, cy + Math.sin(a) * 92 - 1, 2, 2, theme.accent);
    }
    ctx.globalAlpha = .11;
    poly(ctx, [[cx, cy - 34], [cx + 30, cy], [cx, cy + 34], [cx - 30, cy]], theme.accent);
    ctx.restore();
    // 随机地面痕迹
    for (let i = 0; i < 46; i++) {
      const x = wall + 18 + random() * (w - wall * 2 - 36);
      const y = wall + 18 + random() * (h - wall * 2 - 36);
      const roll = random();
      if (roll < .3) {
        ctx.globalAlpha = .2;
        line(ctx, x, y, x + (random() - .5) * 30, y + (random() - .5) * 20, 1, theme.grout);
        ctx.globalAlpha = 1;
      } else if (roll < .58) {
        ctx.globalAlpha = .18;
        px(ctx, x, y, 2 + random() * 5, 1 + random() * 2, theme.grout);
        px(ctx, x + 2, y - 1, 1 + random() * 3, 1, 'rgba(255,255,255,.06)');
        ctx.globalAlpha = 1;
      } else if (roll < .76) {
        ctx.globalAlpha = .08;
        ctx.fillStyle = theme.accent;
        ctx.beginPath(); ctx.ellipse(x, y, 5 + random() * 16, 2 + random() * 6, 0, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (roll < .88) {
        ctx.globalAlpha = .3;
        px(ctx, x, y, 1, 3, theme.dust);
        px(ctx, x + 2, y + 1, 1, 2, theme.dust);
        ctx.globalAlpha = 1;
      }
    }
    // 通道两侧的磨损边线
    ctx.save();
    ctx.globalAlpha = .15;
    for (let y = wall + 30; y < h - wall - 20; y += 26) {
      px(ctx, cx - aisleW / 2 - 4, y, 3, 12, theme.accent);
      px(ctx, cx + aisleW / 2 + 1, y, 3, 12, theme.accent);
    }
    ctx.restore();
    return {
      torches: makeTorches(w, h, wall)
    };
  }

  function makeTorches(w, h, wall) {
    const out = [];
    for (let x = 120; x < w - 90; x += 210) {
      out.push({ x, y: wall + 2, side: 'top', seed: x });
    }
    for (let x = 150; x < w - 100; x += 260) {
      out.push({ x, y: h - wall - 4, side: 'bottom', seed: x + 5 });
    }
    for (let y = 110; y < h - 90; y += 190) {
      out.push({ x: wall - 2, y, side: 'left', seed: y });
      out.push({ x: w - wall + 2, y, side: 'right', seed: y + 7 });
    }
    return out;
  }

  function drawTorch(ctx, torch, t, theme) {
    const flicker = Math.sin(t * 11 + torch.seed) * .5 + Math.sin(t * 23 + torch.seed * 2) * .25;
    const side = torch.side;
    const x = torch.x, y = torch.y;
    glow(ctx, x, y - 10, 38 + flicker * 4, 'rgba(255,154,54,.3)', .32);
    ctx.save();
    if (side === 'top') {
      px(ctx, x - 2, y - 2, 4, 9, '#4f3721');
      px(ctx, x - 4, y + 5, 8, 2, '#261c12');
      poly(ctx, [[x - 4, y - 3], [x - 2, y - 15 - flicker * 2], [x, y - 9], [x + 2, y - 18], [x + 4, y - 7], [x + 5, y - 2], [x + 2, y + 2], [x - 2, y + 2]], '#e96822');
      poly(ctx, [[x - 2, y - 2], [x - 1, y - 10 - flicker], [x + 1, y - 6], [x + 2, y - 11], [x + 3, y - 3], [x + 1, y + 1], [x - 1, y + 1]], '#ffd05c');
      px(ctx, x - 1, y - 4, 2, 3, '#fff4bd');
    } else if (side === 'bottom') {
      px(ctx, x - 2, y - 7, 4, 9, '#4f3721');
      px(ctx, x - 4, y - 8, 8, 2, '#261c12');
      poly(ctx, [[x - 4, y - 7], [x - 2, y - 19 - flicker * 2], [x, y - 13], [x + 2, y - 22], [x + 4, y - 11], [x + 5, y - 6], [x + 2, y - 2], [x - 2, y - 2]], '#e96822');
      poly(ctx, [[x - 2, y - 6], [x - 1, y - 14 - flicker], [x + 1, y - 10], [x + 2, y - 15], [x + 3, y - 7], [x + 1, y - 3], [x - 1, y - 3]], '#ffd05c');
    } else {
      const dir = side === 'left' ? 1 : -1;
      px(ctx, x - 2, y - 2, 4, 8, '#4f3721');
      px(ctx, x + (dir > 0 ? -1 : -3), y + 5, 6, 2, '#261c12');
      poly(ctx, [[x, y - 4], [x + dir * 7, y - 12 - flicker * 2], [x + dir * 3, y - 7], [x + dir * 8, y - 8], [x + dir * 9, y + 1], [x + dir * 3, y + 4], [x - dir, y + 1]], '#e96822');
      poly(ctx, [[x + dir, y - 3], [x + dir * 5, y - 9 - flicker], [x + dir * 3, y - 4], [x + dir * 6, y - 4], [x + dir * 5, y + 1], [x + dir, y + 2]], '#ffd05c');
    }
    ctx.restore();
  }

  function drawBrazier(ctx, brazier, t, theme) {
    const flicker = Math.sin(t * 10 + brazier.seed) * .5 + Math.sin(t * 21 + brazier.seed * 2) * .25;
    const x = brazier.x, y = brazier.y;
    glow(ctx, x, y - 22, 62 + flicker * 6, 'rgba(255,152,48,.3)', .4);
    ctx.save();
    shadow(ctx, x, y, 18, 6, .32);
    // tripod
    line(ctx, x - 7, y, x - 3, y - 9, 1.5, '#2c2118');
    line(ctx, x + 7, y, x + 3, y - 9, 1.5, '#2c2118');
    line(ctx, x, y + 2, x, y - 9, 1.5, '#3c2c1c');
    // bowl
    poly(ctx, [[x - 9, y - 14], [x + 9, y - 14], [x + 6, y - 7], [x - 6, y - 7]], '#33251a');
    px(ctx, x - 8, y - 13, 16, 2, '#72502e');
    px(ctx, x - 5, y - 10, 10, 2, '#1b120c');
    // coals
    px(ctx, x - 4, y - 13, 3, 1, '#ff8a2e');
    px(ctx, x + 2, y - 13, 3, 1, '#ffb43e');
    // flame
    poly(ctx, [[x - 5, y - 14], [x - 3, y - 28 - flicker * 2], [x, y - 20], [x + 2, y - 32], [x + 5, y - 18], [x + 6, y - 13], [x + 2, y - 10], [x - 3, y - 10]], '#e8641f');
    poly(ctx, [[x - 2, y - 14], [x, y - 24 - flicker], [x + 2, y - 18], [x + 3, y - 25], [x + 4, y - 15], [x + 1, y - 11], [x - 1, y - 11]], '#ffcf5e');
    px(ctx, x - 1, y - 14, 2, 3, '#fff0a8');
    // sparks
    ctx.globalAlpha = .7;
    px(ctx, x + Math.sin(t * 3 + brazier.seed) * 9, y - 30 - (t * 12 % 18), 1, 2, '#ffd47a');
    px(ctx, x + Math.cos(t * 2 + brazier.seed) * 7, y - 22 - (t * 8 % 12), 1, 1, '#ff9d45');
    ctx.restore();
  }

  function drawProp(ctx, prop) {
    const x = prop.x, y = prop.y, s = prop.scale || 1;
    const random = rnd(prop.seed || 1);
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(s, s);
    if (prop.broken) {
      shadow(ctx, 0, 0, 14, 5, .22);
      px(ctx, -9, -3, 8, 3, '#4a2f1b');
      px(ctx, 1, -2, 7, 2, '#5d3a20');
      px(ctx, -4, -5, 3, 2, '#2b1b0e');
      px(ctx, 4, -4, 2, 1, '#8a5d33');
      ctx.restore();
      return;
    }
    switch (prop.type) {
      case 'barrel':
        shadow(ctx, 0, 0, 15, 5, .3);
        px(ctx, -7, -16, 14, 16, '#2b1c10');
        px(ctx, -6, -15, 12, 14, '#6b4728');
        px(ctx, -6, -13, 12, 2, '#8d643a');
        px(ctx, -6, -7, 12, 2, '#8d643a');
        px(ctx, -6, -2, 12, 1, '#3f2a18');
        px(ctx, -2, -15, 1, 14, '#4a2f1b');
        break;
      case 'crate':
        shadow(ctx, 0, 0, 18, 6, .3);
        px(ctx, -9, -16, 18, 16, '#2b1b0e');
        px(ctx, -8, -15, 16, 14, '#6a4628');
        px(ctx, -8, -15, 16, 2, '#9a6b3c');
        px(ctx, -8, -3, 16, 2, '#8a5d33');
        line(ctx, -6, -13, 6, -3, 1, '#3b2514');
        line(ctx, -6, -3, 6, -13, 1, '#3b2514');
        break;
      case 'mushroom':
        shadow(ctx, 0, 0, 14, 5, .25);
        px(ctx, -2, -10, 4, 10, '#c7bd9b');
        poly(ctx, [[-9, -10], [-4, -18], [4, -18], [9, -10], [5, -7], [-5, -7]], '#4e8f78');
        px(ctx, -6, -10, 12, 2, '#7fc7a1');
        px(ctx, -3, -15, 2, 2, '#b1ffd4');
        px(ctx, 4, -13, 1, 1, '#b1ffd4');
        if (random() < .5) {
          glow(ctx, 0, -12, 14, 'rgba(91,255,170,.25)', .4);
        }
        break;
      case 'stalagmite':
        shadow(ctx, 0, 0, 16, 5, .3);
        poly(ctx, [[-8, 0], [-4, -17], [0, -24], [4, -13], [8, 0]], '#3e5b4d');
        poly(ctx, [[-4, 0], [-1, -15], [1, -18], [3, -9], [5, 0]], '#5d7f6c');
        px(ctx, 0, -18, 1, 5, '#82a58e');
        break;
      case 'gravestone':
        shadow(ctx, 0, 0, 17, 5, .3);
        px(ctx, -8, -18, 16, 18, '#2e3040');
        poly(ctx, [[-8, -18], [0, -23], [8, -18]], '#3f4358');
        px(ctx, -6, -17, 12, 14, '#555a72');
        px(ctx, -1, -15, 2, 9, '#2f3242');
        px(ctx, -4, -12, 8, 2, '#2f3242');
        px(ctx, -7, -4, 14, 2, '#292b39');
        break;
      case 'candle':
        shadow(ctx, 0, 0, 12, 4, .25);
        px(ctx, -1, -8, 3, 8, '#d7c79f');
        glow(ctx, 0, -10, 12, 'rgba(255,184,74,.35)', .5);
        px(ctx, -1, -11, 2, 3, '#ffd66d');
        px(ctx, 4, -4, 2, 4, '#c9b98f');
        px(ctx, 4, -6, 1, 2, '#ffd66d');
        px(ctx, -5, -3, 2, 3, '#bfae88');
        break;
      case 'anvil':
        shadow(ctx, 0, 0, 18, 6, .35);
        px(ctx, -7, -9, 14, 7, '#30302e');
        px(ctx, -9, -9, 18, 3, '#575752');
        poly(ctx, [[-9, -9], [-13, -6], [-8, -6]], '#43433f');
        px(ctx, -5, -2, 10, 2, '#242422');
        break;
      case 'weaponrack':
        shadow(ctx, 0, 0, 18, 6, .3);
        px(ctx, -9, -3, 18, 3, '#4d3320');
        px(ctx, -8, -24, 2, 22, '#5f4027');
        px(ctx, 6, -24, 2, 22, '#5f4027');
        line(ctx, -6, -20, 4, -4, 2, '#aeb8c2');
        line(ctx, 5, -20, -3, -5, 2, '#8d98a3');
        px(ctx, -7, -21, 4, 2, '#c9a45b');
        px(ctx, 4, -21, 4, 2, '#c9a45b');
        break;
      case 'crystal':
        shadow(ctx, 0, 0, 16, 5, .25);
        glow(ctx, 0, -14, 26, 'rgba(110,220,255,.3)', .42);
        poly(ctx, [[-7, 0], [-4, -17], [0, -25], [3, -14], [8, 0]], '#2e6382');
        poly(ctx, [[-4, 0], [-2, -14], [0, -19], [2, -11], [4, 0]], '#65c4e8');
        poly(ctx, [[-2, 0], [0, -12], [1, -14], [2, -6], [2, 0]], '#c9f5ff');
        px(ctx, 6, -12, 2, 6, '#4d9fc2');
        break;
      case 'pillar':
        shadow(ctx, 0, 0, 26, 8, .34);
        px(ctx, -13, -5, 26, 5, '#242421');
        px(ctx, -11, -9, 22, 5, '#4a4a44');
        px(ctx, -8, -38, 16, 30, '#353531');
        px(ctx, -6, -37, 12, 28, '#5b5b53');
        px(ctx, -6, -37, 12, 2, '#85857a');
        px(ctx, -10, -40, 20, 4, '#3e3e39');
        px(ctx, -8, -42, 16, 3, '#6b6b61');
        line(ctx, -4, -33, 4, -18, 1, '#2a2a26');
        line(ctx, 5, -28, 1, -14, 1, '#2a2a26');
        px(ctx, -2, -22, 2, 2, '#7d6f4d');
        break;
      case 'rubble':
        shadow(ctx, 0, 0, 27, 8, .3);
        poly(ctx, [[-13, -2], [-8, -12], [-2, -8], [2, -3]], '#3c3b37');
        poly(ctx, [[-4, 0], [0, -14], [7, -10], [10, -1]], '#4e4d47');
        poly(ctx, [[4, 0], [8, -8], [14, -5], [15, 0]], '#34332f');
        px(ctx, -5, -8, 4, 2, '#6f6c5e');
        px(ctx, 3, -7, 3, 2, '#777264');
        px(ctx, -10, -3, 3, 2, '#272622');
        break;
      case 'bones':
        shadow(ctx, 0, 0, 17, 5, .25);
        line(ctx, -8, -3, 7, -6, 2, '#b9b29d');
        line(ctx, -4, -7, 3, -2, 2, '#d1cab5');
        poly(ctx, [[-9, -11], [-5, -9], [-6, -7], [-10, -8]], '#cbc4ae');
        px(ctx, 0, -10, 3, 2, '#adab98');
        px(ctx, 5, -8, 2, 2, '#9b9b88');
        break;
      case 'banner':
        shadow(ctx, 0, 0, 12, 4, .25);
        px(ctx, -1, -30, 2, 30, '#3f2c1b');
        px(ctx, -7, -29, 14, 2, '#9a773f');
        poly(ctx, [[0, -28], [12, -25], [11, -9], [0, -12]], prop.color || '#7d2424');
        poly(ctx, [[3, -24], [9, -22], [9, -14], [3, -16]], '#d3b26e');
        break;
      default:
        shadow(ctx, 0, 0, 14, 5, .25);
        px(ctx, -6, -8, 12, 8, '#3e352b');
        break;
    }
    if (prop.breakable && !prop.broken && prop.hp < prop.maxHp) {
      ctx.globalAlpha = .9;
      px(ctx, -11, -44, 22, 3, '#1b130d');
      px(ctx, -10, -43, 20 * Math.max(0, prop.hp / prop.maxHp), 1, '#d8663e');
    }
    ctx.restore();
  }

  /* =========================================================
     CHEST / PORTAL / PROJECTILES
     ========================================================= */
  function drawChest(ctx, chest, t) {
    const boss = chest.kind === 'boss';
    const s = boss ? 1.3 : 1;
    const float = Math.sin(t * 2.4 + chest.seed) * 1.5;
    ctx.save();
    ctx.translate(Math.round(chest.x), Math.round(chest.y));
    ctx.scale(s, s);
    shadow(ctx, 0, 0, 20, 6, .35);
    glow(ctx, 0, -10, boss ? 38 : 28, boss ? 'rgba(196,124,255,.36)' : 'rgba(255,196,86,.3)', .55);
    // beam
    ctx.save();
    ctx.globalAlpha = .13;
    const bg = ctx.createLinearGradient(0, -60, 0, 0);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, boss ? 'rgba(199,125,255,.9)' : 'rgba(255,210,110,.9)');
    ctx.fillStyle = bg;
    poly(ctx, [[-7, -58], [7, -58], [13, 0], [-13, 0]], boss ? '#c77dff' : '#ffd36e');
    ctx.restore();
    // chest body
    px(ctx, -11, -13 + float, 22, 13, '#2b190b');
    px(ctx, -10, -12 + float, 20, 11, '#7d4f22');
    px(ctx, -9, -11 + float, 18, 3, '#ad7434');
    px(ctx, -9, -5 + float, 18, 1, '#d0a254');
    px(ctx, -11, -19 + float, 22, 8, '#2b190b');
    poly(ctx, [[-11, -19 + float], [-7, -24 + float], [7, -24 + float], [11, -19 + float], [11, -13 + float], [-11, -13 + float]], '#8b5a28');
    poly(ctx, [[-9, -19 + float], [-6, -22 + float], [6, -22 + float], [9, -19 + float], [9, -15 + float], [-9, -15 + float]], '#b37b36');
    px(ctx, -8, -19 + float, 16, 2, '#e0b162');
    px(ctx, -2, -14 + float, 4, 7, '#e2b45d');
    px(ctx, -1, -12 + float, 2, 3, '#3b2b15');
    // boss crest
    if (boss) {
      poly(ctx, [[0, -27 + float], [3, -24 + float], [0, -20 + float], [-3, -24 + float]], '#f0c7ff');
      px(ctx, -12, -9 + float, 24, 1, '#a96ed0');
    }
    // sparkles
    ctx.globalAlpha = .75;
    for (let i = 0; i < (boss ? 6 : 4); i++) {
      const a = t * 1.8 + i * 1.7 + chest.seed;
      const r = (boss ? 21 : 16) + Math.sin(t * 2 + i) * 4;
      px(ctx, Math.cos(a) * r, -11 + Math.sin(a * 1.3) * 9 + float, 2, 2, boss ? '#e0b0ff' : '#ffe1a0');
    }
    ctx.restore();
  }

  function drawPortal(ctx, portal, t) {
    const x = portal.x, y = portal.y;
    ctx.save();
    glow(ctx, x, y - 20, 55, 'rgba(112,211,255,.22)', .55);
    // floor ring
    ctx.save();
    ctx.globalAlpha = .6;
    ctx.strokeStyle = '#73d9ff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, 26 + Math.sin(t * 2) * 2, 9, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = .2;
    ctx.fillStyle = '#5ac8ff';
    ctx.beginPath(); ctx.ellipse(x, y, 22, 7, 0, 0, TAU); ctx.fill();
    ctx.restore();
    // vertical rift
    ctx.save();
    ctx.globalAlpha = .85;
    const w = 16 + Math.sin(t * 1.7) * 3;
    const grad = ctx.createLinearGradient(x, y - 60, x, y);
    grad.addColorStop(0, 'rgba(197,245,255,0)');
    grad.addColorStop(.45, 'rgba(110,223,255,.65)');
    grad.addColorStop(1, 'rgba(63,143,232,.15)');
    ctx.fillStyle = grad;
    poly(ctx, [[x - w * .4, y - 5], [x - w * .8, y - 30], [x - w * .2, y - 58], [x + w * .4, y - 42], [x + w * .7, y - 12]], 'rgba(100,210,255,.5)');
    ctx.restore();
    // swirls
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.globalAlpha = .55 - i * .12;
      ctx.strokeStyle = i === 0 ? '#d5f8ff' : '#74d7ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(x, y - 22 + i * 4, 13 + i * 5, 22 + i * 4, .3, t * 1.3 + i, t * 1.3 + i + 3.2);
      ctx.stroke();
      ctx.restore();
    }
    // motes
    for (let i = 0; i < 8; i++) {
      const a = t * 2 + i;
      const yy = y - 8 - ((t * 18 + i * 9) % 48);
      px(ctx, x + Math.sin(a) * 18, yy, 2, 2, '#d0f7ff');
    }
    // label beam
    ctx.globalAlpha = .5;
    px(ctx, x - 14, y - 3, 28, 1, '#8fe5ff');
    ctx.restore();
  }


  function drawProjectile(ctx, p) {
    const x = p.x, y = p.y;
    const t = performance.now() / 1000;
    const a = Math.atan2(p.vy, p.vx);
    const speed = Math.hypot(p.vx, p.vy) || 1;
    const after = 8 + (p.kind === 'pyroblast' ? 8 : 0);
    ctx.save();
    ctx.globalAlpha = .28;
    px(ctx, x - p.vx / speed * after, y - p.vy / speed * after, p.r * 1.4, p.r * 1.4, p.color || '#ffcf79');
    ctx.restore();

    if (p.kind === 'fireball' || p.kind === 'pyroblast') {
      glow(ctx, x, y, p.r * 4.6, p.kind === 'pyroblast' ? 'rgba(255,104,32,.62)' : 'rgba(255,150,50,.46)', .55);
      pixelOrb(ctx, x, y, p.r, '#c22d12', '#ffb32a');
      pixelOrb(ctx, x - 1, y - 1, p.r * .48, '#ffd764', '#fff8c9');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .7;
      const len = p.kind === 'pyroblast' ? 14 : 8;
      px(ctx, x - Math.cos(a) * len - 2, y - Math.sin(a) * len - 1, 4, 3, '#e9541e');
      px(ctx, x - Math.cos(a) * (len + 5), y - Math.sin(a) * (len + 5), 3, 2, '#9e2a15');
      for (let i = 0; i < 3; i++) {
        const s = Math.sin(t * 14 + i * 2.1);
        px(ctx, x + Math.cos(a + 1.4 + i * .9) * (p.r + 3 + s * 2), y + Math.sin(a + 1.4 + i * .9) * (p.r + 3 + s * 2), 1, 1, '#ffd56c');
      }
      ctx.restore();
    } else if (p.kind === 'frost' || p.kind === 'ice') {
      glow(ctx, x, y, p.r * 4.2, 'rgba(105,215,255,.4)', .5);
      poly(ctx, [[x, y - p.r * 1.7], [x + p.r, y], [x, y + p.r * 1.7], [x - p.r, y]], '#8ce7ff');
      poly(ctx, [[x, y - p.r * 1.2], [x + p.r * .5, y], [x, y + p.r * 1.2], [x - p.r * .5, y]], '#d9fbff');
      px(ctx, x - 1, y - 2, 2, 4, '#ffffff');
      ctx.save();
      ctx.globalAlpha = .55;
      ctx.strokeStyle = '#b7f1ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x - Math.cos(a) * 8, y - Math.sin(a) * 8, p.r + 3, a - .5, a + .5);
      ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 3; i++) {
        px(ctx, x + Math.cos(a + 2 + i) * (p.r + 5), y + Math.sin(a + 2 + i) * (p.r + 5), 1, 1, '#e6ffff');
      }
    } else if (p.kind === 'holyfire' || p.kind === 'smite' || p.kind === 'penance') {
      const isPenance = p.kind === 'penance';
      const isSmite = p.kind === 'smite';
      glow(ctx, x, y, p.r * 4.8, 'rgba(255,220,120,.55)', .52);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .9;
      if (isPenance) {
        ctx.translate(x, y);
        ctx.rotate(a);
        poly(ctx, [[-p.r * 2.4, 0], [0, -p.r * .75], [p.r * 1.6, 0], [0, p.r * .75]], '#fff2bd');
        poly(ctx, [[-p.r * 1.2, 0], [0, -p.r * .3], [p.r * 1.2, 0], [0, p.r * .3]], '#ffffff');
      } else {
        pixelOrb(ctx, x, y, p.r + (isSmite ? 1 : 0), '#c58e2e', '#fff6cf');
        for (let i = 0; i < 4; i++) {
          const ang = a + i * TAU / 4 + t * 1.4;
          px(ctx, x + Math.cos(ang) * (p.r + 4), y + Math.sin(ang) * (p.r + 4), 2, 1, '#fff3c7');
        }
      }
      ctx.restore();
    } else if (p.kind === 'shadow' || p.kind === 'poison') {
      const poison = p.kind === 'poison';
      glow(ctx, x, y, p.r * 4.2, poison ? 'rgba(124,231,87,.35)' : 'rgba(166,103,255,.38)', .48);
      pixelOrb(ctx, x, y, p.r, poison ? '#427b35' : '#4e2f78', poison ? '#c4ff7a' : '#dbb7ff');
      ctx.save();
      ctx.globalAlpha = .55;
      for (let i = 0; i < 3; i++) {
        const ang = t * 2.2 + i * TAU / 3;
        px(ctx, x + Math.cos(ang) * (p.r + 4), y + Math.sin(ang) * (p.r + 4), 2, 2, poison ? '#b6ff83' : '#c59bff');
      }
      ctx.restore();
    } else if (p.kind === 'dynamite') {
      px(ctx, x - 3, y - 4, 6, 8, '#9a3b2a');
      px(ctx, x - 3, y - 4, 6, 2, '#cc6b45');
      px(ctx, x, y - 7, 1, 3, '#d9cba5');
      const spark = Math.sin(t * 20) > 0 ? '#fff4b8' : '#ff9a3e';
      px(ctx, x, y - 9, 2, 2, spark);
      glow(ctx, x, y - 9, 8, 'rgba(255,180,62,.5)', .4);
    } else {
      glow(ctx, x, y, p.r * 4, p.color || 'rgba(255,207,121,.35)', .45);
      pixelOrb(ctx, x, y, p.r, p.color || '#ffcf79', '#fff');
      ctx.save();
      ctx.globalAlpha = .6;
      for (let i = 0; i < 3; i++) {
        const ang = t * 1.8 + i * TAU / 3;
        px(ctx, x + Math.cos(ang) * (p.r + 4), y + Math.sin(ang) * (p.r + 4), 1, 1, '#fff2c4');
      }
      ctx.restore();
    }
  }

  /* =========================================================
     TITLE BACKDROP
     ========================================================= */
  function drawTitleScene(ctx, w, h, t) {
    const random = rnd(731);
    // 深色石墙
    px(ctx, 0, 0, w, h, '#0a0908');
    for (let y = 0; y < 286; y += 14) {
      const off = ((y / 14) | 0) % 2 ? 18 : 0;
      for (let x = -32 + off; x < w + 32; x += 36) {
        const shades = ['#1a1619', '#211c1e', '#282123', '#1d181b'];
        const c = shades[Math.floor(random() * shades.length)];
        px(ctx, x + 1, y + 1, 34, 12, c);
        px(ctx, x + 1, y + 1, 34, 1, 'rgba(255,232,190,.035)');
        px(ctx, x + 1, y + 11, 34, 1, 'rgba(0,0,0,.35)');
        if (random() < .16) {
          px(ctx, x + 5 + random() * 24, y + 4 + random() * 5, 1, 1, '#3e352c');
        }
      }
    }
    // 左右石柱
    const pillar = (x) => {
      px(ctx, x, 0, 48, 306, '#0b0908');
      for (let y = 0; y < 306; y += 20) {
        px(ctx, x + 2, y + 1, 44, 18, '#221d1b');
        px(ctx, x + 2, y + 1, 44, 2, '#342b25');
        px(ctx, x + 2, y + 18, 44, 1, '#100d0b');
        if ((y / 20) % 2 === 0) {
          px(ctx, x + 10, y + 5, 28, 1, '#3e332a');
          px(ctx, x + 10, y + 11, 28, 1, '#2b231d');
        }
      }
      px(ctx, x + 1, 0, 2, 306, '#4b3826');
      px(ctx, x + 45, 0, 2, 306, '#0a0705');
      px(ctx, x - 4, 306, 56, 9, '#1a1410');
      px(ctx, x - 2, 306, 52, 2, '#60452b');
    };
    pillar(75);
    pillar(517);
    // 尖拱门
    const archOuter = [[160,310],[160,132],[225,72],[320,35],[415,72],[480,132],[480,310]];
    const archInner = [[188,310],[188,140],[245,87],[320,57],[395,87],[452,140],[452,310]];
    poly(ctx, archOuter, '#0b0908');
    poly(ctx, [[166,310],[166,130],[228,74],[320,40],[412,74],[474,130],[474,310]], '#3d3125');
    poly(ctx, [[172,310],[172,131],[232,78],[320,47],[408,78],[468,131],[468,310]], '#654b32');
    // 金色内缘
    const archLine = (pts, color, width) => {
      for (let i = 0; i < pts.length - 1; i++) line(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], width, color);
    };
    archLine(archOuter, '#15100c', 2);
    archLine([[170,310],[170,132],[230,76],[320,43],[410,76],[470,132],[470,310]], '#c28d43', 2);
    glow(ctx, 320, 90, 185, 'rgba(90,190,255,.16)', .7);
    glow(ctx, 320, 44, 60, 'rgba(238,194,105,.2)', .5);
    archLine(archInner, '#b98a43', 2);
    // 门洞虚空
    poly(ctx, archInner, '#06060a');
    poly(ctx, [[194,310],[194,140],[248,90],[320,62],[392,90],[446,140],[446,310]], '#090812');
    // 门楣宝石
    poly(ctx, [[320,38],[330,50],[320,62],[310,50]], '#171009');
    poly(ctx, [[320,42],[326,50],[320,58],[314,50]], '#e3b85f');
    px(ctx, 318, 48, 5, 1, '#fff0b0');
    // 裂隙之光
    const cx = 320;
    glow(ctx, cx, 190, 135, 'rgba(84,188,255,.18)', .85);
    glow(ctx, cx, 175, 56, 'rgba(178,238,255,.12)', .7);
    const rift = [];
    for (let i = 0; i < 16; i++) {
      const y = 68 + i * 15;
      const width = 8 + Math.sin(i * 1.7 + t * .7) * 5 + (i > 10 ? 6 : 0);
      rift.push([cx - width, y]);
    }
    for (let i = 15; i >= 0; i--) {
      const y = 68 + i * 15;
      const width = 8 + Math.sin(i * 2.1 + t * .6) * 5 + (i > 10 ? 6 : 0);
      rift.push([cx + width, y]);
    }
    ctx.save();
    const riftGrad = ctx.createLinearGradient(0, 60, 0, 300);
    riftGrad.addColorStop(0, 'rgba(185,246,255,0)');
    riftGrad.addColorStop(.25, 'rgba(105,222,255,.7)');
    riftGrad.addColorStop(.7, 'rgba(64,137,220,.55)');
    riftGrad.addColorStop(1, 'rgba(20,40,80,0)');
    ctx.fillStyle = riftGrad;
    ctx.beginPath();
    rift.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = .5;
    for (let i = 0; i < 5; i++) {
      const y = 85 + ((t * 24 + i * 38) % 190);
      px(ctx, cx + Math.sin(t * 1.3 + i) * 26, y, i % 2 ? 2 : 1, i % 3 ? 2 : 4, '#d8fbff');
    }
    ctx.restore();
    // 侧墙纹章旗帜
    const banner = (x, y, w2, h2, color, trim, emblem) => {
      px(ctx, x - 4, y - 8, w2 + 8, 3, '#3a2815');
      px(ctx, x - 2, y - 5, w2 + 4, 2, '#a77b3b');
      poly(ctx, [[x, y], [x + w2, y], [x + w2 - 2, y + h2 - 14], [x + w2 * .72, y + h2], [x + w2 * .5, y + h2 - 12], [x + w2 * .25, y + h2], [x + 2, y + h2 - 14]], color);
      line(ctx, x + 3, y + 3, x + 3, y + h2 - 14, 1, trim);
      line(ctx, x + w2 - 3, y + 3, x + w2 - 3, y + h2 - 14, 1, trim);
      poly(ctx, [[x + w2 * .5, y + 18], [x + w2 * .5 + 11, y + 34], [x + w2 * .5, y + 52], [x + w2 * .5 - 11, y + 34]], 'rgba(8,7,8,.55)');
      poly(ctx, [[x + w2 * .5, y + 22], [x + w2 * .5 + 7, y + 34], [x + w2 * .5, y + 47], [x + w2 * .5 - 7, y + 34]], emblem);
      px(ctx, x + 8, y + 8, 2, h2 - 28, 'rgba(255,220,160,.12)');
    };
    banner(18, 40, 48, 218, '#4b191d', '#a98243', '#a33439');
    banner(574, 40, 48, 218, '#17243d', '#a98243', '#4266a8');
    // 火盆 / 壁灯
    const torchL = { x: 120, y: 162, side: 'left', seed: 5 };
    const torchR = { x: 520, y: 162, side: 'right', seed: 9 };
    drawTorch(ctx, torchL, t, { glow: '#ffb347' });
    drawTorch(ctx, torchR, t, { glow: '#ffb347' });
    // 台阶与地面
    px(ctx, 0, 300, w, 60, '#0b0908');
    for (let i = 0; i < 3; i++) {
      const yy = 300 + i * 9;
      px(ctx, 180 + i * 10, yy, 260 - i * 20, 9, i === 0 ? '#3a2c20' : '#261d17');
      px(ctx, 180 + i * 10, yy, 260 - i * 20, 1, '#65482c');
      px(ctx, 180 + i * 10, yy + 8, 260 - i * 20, 1, '#0b0705');
    }
    for (let x = 0; x < w; x += 32) {
      px(ctx, x + 1, 330, 30, 29, x % 64 === 0 ? '#201915' : '#191410');
    }
    // 地面金色符文
    ctx.save();
    ctx.globalAlpha = .2;
    ctx.strokeStyle = '#d8a95b';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(320, 334, 102, 18, 0, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8;
      px(ctx, 320 + Math.cos(a) * 92, 334 + Math.sin(a) * 16, 2, 2, '#ecc878');
    }
    ctx.restore();
    // 石像鬼雕饰
    const gargoyle = (x, flip) => {
      ctx.save(); ctx.translate(x, 286); ctx.scale(flip, 1);
      px(ctx, -8, 4, 16, 7, '#171311');
      px(ctx, -6, 0, 12, 5, '#2b231d');
      poly(ctx, [[-4, 0], [-13, -10], [-9, 2]], '#1a1513');
      poly(ctx, [[4, 0], [13, -10], [9, 2]], '#231c17');
      px(ctx, -4, -8, 8, 8, '#2f2720');
      px(ctx, -3, -7, 2, 2, '#d9a653');
      px(ctx, 1, -7, 2, 2, '#d9a653');
      px(ctx, -2, -3, 4, 1, '#100c0a');
      ctx.restore();
    };
    gargoyle(155, 1);
    gargoyle(485, -1);
    // 雾与余烬
    ctx.save();
    ctx.globalAlpha = .045;
    ctx.fillStyle = '#8ab9d8';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse((i * 173 + t * 7) % w, 240 + i * 15, 150, 18, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    for (let i = 0; i < 42; i++) {
      const x = (i * 97 + t * (4 + i % 4)) % w;
      const y = 40 + ((i * 53 + t * (2 + i % 3)) % 290);
      ctx.globalAlpha = .12 + (i % 4) * .05;
      px(ctx, x, y, 1, 1, i % 5 === 0 ? '#cdebff' : '#e2bf7c');
    }
    ctx.globalAlpha = 1;
    // 暗角
    const vg = ctx.createRadialGradient(w / 2, 175, 80, w / 2, 175, 360);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(.72, 'rgba(0,0,0,.18)');
    vg.addColorStop(1, 'rgba(0,0,0,.72)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  /* =========================================================
     EXPORT
     ========================================================= */
  window.Art = {
    makeIcon,
    makePortrait,
    drawPlayer,
    drawEnemy,
    drawBoss,
    drawChest,
    drawPortal,
    drawProjectile,
    drawTorch,
    drawBrazier,
    drawProp,
    paintArena,
    drawTitleScene,
    makeTorches,
    px,
    poly,
    glow,
    rnd
  };
})();

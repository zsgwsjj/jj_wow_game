/* =========================================================
   艾泽拉斯：裂隙远征 — 战斗、AI、技能、掉落
   ========================================================= */
(function () {
  'use strict';

  const R = window.RIFT;
  const D = R.D;
  const clamp = R.clamp;
  const len = R.len;
  const dist = R.dist;
  const rand = R.rand;
  const pick = R.pick;
  const angleDiff = R.angleDiff;

  const G = () => R.game;
  const P = () => R.game.player;

  const COLOR = {
    physical: '#fff0d1',
    fire: '#ffb15b',
    frost: '#a9ecff',
    arcane: '#dcb9ff',
    bleed: '#ff7d76',
    poison: '#b6ff83',
    shadow: '#c59bff',
    holy: '#ffe7a3',
    heal: '#8cffb0'
  };

  function skillOf(p, id) {
    return D.getSkill(p.classId, id);
  }

  function cdOf(p, skill) {
    return skill.cooldown * (p.cdrMult || 1);
  }

  function aimAtMouse(p) {
    const m = R.input.mouse;
    return Math.atan2(m.worldY - (p.y - 10), m.worldX - p.x);
  }

  function inBounds(x, y, padX, padY) {
    const g = G();
    const pxx = padX == null ? 36 : padX;
    const pyy = padY == null ? 42 : padY;
    return x > pxx && x < g.worldW - pxx && y > pyy && y < g.worldH - pyy;
  }

  /* =========================================================
     PUBLIC UPDATE
     ========================================================= */
  R.update = function (dt) {
    const g = G();
    if (g.mode !== 'playing') {
      g.shake = Math.max(0, g.shake - dt * 24);
      return;
    }
    if (g.hitstop > 0) {
      g.hitstop -= dt;
      g.shake = Math.max(0, g.shake - dt * 16);
      return;
    }
    g.runTime += dt;
    g.time += dt;
    g.shake = Math.max(0, g.shake - dt * 22);
    if (g.hintTimer > 0) {
      g.hintTimer -= dt;
      if (g.hintTimer <= 0) R.UI.hint.classList.add('fade');
    }
    // 升级奖励：即使经验在非 playing 状态结算，也在这里补触发
    if (g.levelChoices.length && !g.choiceContext) {
      if (R.startNextLevelChoice()) return;
    }
    R.syncMouseWorld();

    updatePlayer(dt);
    if (g.mode !== 'playing') return;
    updateEnemies(dt);
    if (g.mode !== 'playing') return;
    updateProjectiles(dt);
    updateEffects(dt);
    updateOrbs(dt);
    if (g.mode !== 'playing') return;
    updateSpawnQueue(dt);
    updatePhase(dt);
    updateParticles(dt);
    updateTexts(dt);
    updateCamera(dt);
    R.syncMouseWorld();
    updatePortal();
    R.updateHUD();
    if (R.updateBossUI) R.updateBossUI();
  };

  function updateCamera(dt) {
    const g = G();
    const p = g.player;
    if (!p) return;
    const cam = g.camera;
    const m = R.input.mouse;
    const leadX = (m.x - R.W / 2) * .08;
    const leadY = (m.y - R.H / 2) * .06;
    let focusX = p.x;
    let focusY = p.y - 14;
    if (g.boss && !g.boss.dead) {
      const dx = g.boss.x - p.x, dy = g.boss.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 300) {
        focusX += dx * .27;
        focusY += dy * .22 - 18;
      }
      focusY -= 32;
    }
    const tx = clamp(focusX + leadX - R.W / 2, 0, Math.max(0, g.worldW - R.W));
    const ty = clamp(focusY + leadY - R.H / 2, 0, Math.max(0, g.worldH - R.H));
    const k = 1 - Math.pow(.0009, dt);
    cam.x = R.lerp(cam.x, tx, k);
    cam.y = R.lerp(cam.y, ty, k);
  }

  /* =========================================================
     PLAYER
     ========================================================= */
  function updatePlayer(dt) {
    const g = G();
    const p = g.player;
    if (!p) return;
    p.aim = aimAtMouse(p);
    p.attackCd = Math.max(0, p.attackCd - dt);
    p.attackAnim = Math.max(0, p.attackAnim - dt * 7);
    p.iframes = Math.max(0, p.iframes - dt);
    p.slow = Math.max(0, p.slow - dt);
    p.stun = Math.max(0, p.stun - dt);
    p.lastHurt += dt;
    p.resource = Math.min(p.maxResource, p.resource + p.resourceRegen * dt);
    p.speedMult = 1;
    if (p.passives.swiftness) p.speedMult *= 1 + p.passives.swiftness * .05;

    // 冷却
    for (const id in p.cooldowns) {
      if (p.cooldowns[id] > 0) p.cooldowns[id] = Math.max(0, p.cooldowns[id] - dt);
    }
    // 护盾
    if (p.shieldTimer > 0) {
      p.shieldTimer -= dt;
      if (p.shieldTimer <= 0) { p.shield = 0; p.shieldTimer = 0; }
    }
    // buff 计时
    for (const k of ['shieldBlock', 'iceBarrier']) {
      if (p.buffs[k] > 0) {
        p.buffs[k] = Math.max(0, p.buffs[k] - dt);
      }
    }
    if (p.buffs.bloodlust > 0) {
      p.buffs.bloodlust = Math.max(0, p.buffs.bloodlust - dt);
      if (p.buffs.bloodlust <= 0) p.buffs.bloodlustStacks = 0;
    }
    // 嗜血攻速
    const bl = p.passives.bloodlust || 0;
    p.attackSpeed = (1 + p.buffs.bloodlustStacks * bl * .1) * (p.basicSpeedMult || 1);
    // 第二次呼吸
    const sw = p.passives.secondWind || 0;
    if (sw && p.lastHurt > 3 && p.hp < p.maxHp) {
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * (.008 + sw * .008) * dt);
    }
    // 恢复 / 专注意志
    if (p.buffs.focusedWill > 0) p.buffs.focusedWill = Math.max(0, p.buffs.focusedWill - dt);
    if (p.renewTime > 0) {
      p.renewTime = Math.max(0, p.renewTime - dt);
      p.renewTick -= dt;
      if (p.renewTick <= 0) {
        p.renewTick += 1;
        R.healPlayer(p.renewHeal * p.healMult, '#ffe7a3');
        if (p.runes && p.runes.benediction) {
          p.cooldowns.holyFire = Math.max(0, (p.cooldowns.holyFire || 0) - .5);
        }
      }
    }

    // 位移与引导
    if (p.leap) {
      updateLeap(p, dt);
    } else if (p.dash) {
      updateDash(p, dt);
    } else {
      if (p.channel) updateChannel(p, dt);
      if (p.stun <= 0 && (!p.channel || p.channel.mobile)) {
        let mx = 0, my = 0;
        if (R.input.keys.has('KeyA')) mx -= 1;
        if (R.input.keys.has('KeyD')) mx += 1;
        if (R.input.keys.has('KeyW')) my -= 1;
        if (R.input.keys.has('KeyS')) my += 1;
        if (mx || my) {
          const l = Math.hypot(mx, my);
          mx /= l; my /= l;
          const speed = p.speedBase * p.speedMult * (p.slow > 0 ? .55 : 1) * (p.channel ? .78 : 1);
          p.x += mx * speed * dt;
          p.y += my * speed * dt;
          p.moving = true;
          p.footTimer -= dt;
          if (p.footTimer <= 0) {
            p.footTimer = .16;
            const theme = g.dungeon.theme;
            R.addParticle(p.x + rand(-4, 4), p.y + rand(-1, 1), rand(-5, 5), rand(-8, -2), rand(.2, .4), theme.dust, 1, 0, .9);
          }
        } else {
          p.moving = false;
        }
      } else {
        p.moving = false;
      }
    }
    // 攻击：按住左键 = 手动瞄准；松开 = 自动攻击最近目标
    if (p.attackCd <= 0 && !p.channel && !p.leap && !p.dash && p.stun <= 0 && g.mode === 'playing') {
      if (R.input.mouse.down) {
        performBasic();
      } else if (R.input.autoAttack) {
        const target = findAutoTarget(p);
        if (target) {
          p.aim = Math.atan2(target.y - 10 - (p.y - 12), target.x - p.x);
          performBasic();
        }
      }
    }
    // 障碍物碰撞；跃起时可越过矮障碍
    if (!p.leap || p.z < 6) R.resolvePropCollisions(p, 8);
    // 限制在墙内
    p.x = clamp(p.x, 36, g.worldW - 36);
    p.y = clamp(p.y, 44, g.worldH - 34);
    // 法术脉冲
    if (p.pulses) {
      p.pulses.timer -= dt;
      if (p.pulses.timer <= 0 && p.pulses.left > 0) {
        p.pulses.left--;
        p.pulses.timer = p.pulses.interval;
        const radius = 62;
        const dmg = (18 + p.level * 2.5) * p.dmgMult;
        const hits = aoeEnemies(p.x, p.y, radius, dmg, {
          type: 'arcane', color: COLOR.arcane, spell: true, restoreMana: true, knockback: 6
        });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 8, maxR: radius + 8, timer: .32, duration: .32, color: '#b877ff', width: 2 });
        R.addParticle(p.x, p.y - 10, 0, 0, .3, '#d5a7ff', 5, 0, .9, true);
        if (hits) g.shake = Math.max(g.shake, 2);
        AudioEngine.sfx('arcane');
        if (p.pulses.left <= 0) p.pulses = null;
      }
    }
    // 武器轨迹 / 动作
    if (p.channel) {
      p.spin += dt * 18;
    } else {
      p.spin *= .9;
    }
    p.z = Math.max(0, p.z - dt * 60);
  }

  function updateLeap(p, dt) {
    const g = G();
    const l = p.leap;
    l.t += dt / l.duration;
    const t = Math.min(1, l.t);
    p.x = R.lerp(l.sx, l.tx, t);
    p.y = R.lerp(l.sy, l.ty, t);
    p.z = Math.sin(t * Math.PI) * 26;
    p.iframes = Math.max(p.iframes, .05);
    if (Math.random() < .6) {
      R.addParticle(p.x + rand(-5, 5), p.y - p.z + rand(-2, 2), rand(-6, 6), rand(2, 10), .25, '#c9a25c', 1, 0, .9);
    }
    if (t >= 1) {
      p.leap = null;
      p.z = 0;
      const radius = 58;
      const dmg = (24 + p.level * 3) * p.dmgMult;
      const hits = aoeEnemies(p.x, p.y, radius, dmg, {
        type: 'physical', color: COLOR.physical, knockback: 12, slow: .4, slowTime: 2
      });
      R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 6, maxR: 70, timer: .4, duration: .4, color: '#f0c477', width: 3 });
      R.spawnBurst(p.x, p.y, 18, '#d8b271', 2.4);
      g.shake = Math.max(g.shake, hits ? 7 : 4);
      if (hits) AudioEngine.sfx('hitBig');
    }
  }

  function updateDash(p, dt) {
    const g = G();
    const d = p.dash;
    d.timer -= dt;
    p.x += d.vx * dt;
    p.y += d.vy * dt;
    p.iframes = Math.max(p.iframes, .1);
    if (Math.random() < .9) {
      R.addParticle(p.x - d.vx * .02 + rand(-3, 3), p.y - 10 + rand(-6, 6), rand(-10, 10), rand(-12, 12), .3, '#e2bb70', 2, 0, .9, true);
    }
    for (const e of g.enemies) {
      if (e.dead || d.hit.has(e.id)) continue;
      if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + 26) {
        d.hit.add(e.id);
        R.damageEnemy(e, d.damage, { type: 'physical', color: COLOR.physical, stun: .8, knockback: 14, big: true });
        R.spawnBurst(e.x, e.y - 10, 10, '#ffe0a0', 2);
      }
    }
    if (d.timer <= 0) {
      p.dash = null;
      const hits = g.enemies.filter((e) => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 44);
      if (hits.length) {
        g.shake = Math.max(g.shake, 5);
        AudioEngine.sfx('hitBig');
      }
    }
  }

  function updateChannel(p, dt) {
    const g = G();
    const c = p.channel;
    c.time -= dt;
    c.tick -= dt;
    if (c.tick <= 0) {
      c.tick = c.interval;
      if (c.type === 'whirlwind') {
        const dmg = (11 + p.level * 2.2) * p.dmgMult;
        const hits = aoeEnemies(p.x, p.y, 56, dmg, {
          type: 'physical', color: COLOR.physical, bloodstorm: true,
          bleed: p.passives.deepWounds ? (2 + p.passives.deepWounds * 2.5) : 0
        });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 10, maxR: 60, timer: .24, duration: .24, color: '#e8c27a', width: 2 });
        R.addEffect({ type: 'slash', x: p.x, y: p.y - 10, angle: (p.spin || 0) + Math.PI * .25, radius: 54, arc: 1.5, timer: .2, duration: .2, color: '#e8c27a', width: 7 });
        R.addEffect({ type: 'slash', x: p.x, y: p.y - 10, angle: (p.spin || 0) + Math.PI * 1.25, radius: 54, arc: 1.5, timer: .2, duration: .2, color: '#ffe2a6', width: 5 });
        if (hits) g.shake = Math.max(g.shake, 2);
      } else if (c.type === 'bladestorm') {
        p.slow = 0;
        const dmg = (14 + p.level * 2.6) * p.dmgMult;
        const hits = aoeEnemies(p.x, p.y, 68, dmg, {
          type: 'physical', color: COLOR.physical, bloodstorm: true,
          bleed: p.passives.deepWounds ? (2 + p.passives.deepWounds * 2.5) : 0, knockback: 3
        });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 12, maxR: 74, timer: .25, duration: .25, color: '#ffcf7a', width: 3 });
        R.addEffect({ type: 'slash', x: p.x, y: p.y - 10, angle: (p.spin || 0) + Math.PI * .2, radius: 68, arc: 1.9, timer: .24, duration: .24, color: '#ffcf7a', width: 9 });
        R.addEffect({ type: 'slash', x: p.x, y: p.y - 10, angle: (p.spin || 0) + Math.PI * 1.2, radius: 68, arc: 1.9, timer: .24, duration: .24, color: '#fff0c4', width: 7 });
        if (Math.random() < .7) {
          const a = p.spin + rand(0, Math.PI * 2);
          R.addParticle(p.x + Math.cos(a) * 28, p.y - 12 + Math.sin(a) * 12, Math.cos(a) * 20, Math.sin(a) * 20, .32, '#ffe3a0', 2, 0, .9, true);
        }
        if (hits) g.shake = Math.max(g.shake, 2.5);
      }
    }
    if (Math.random() < .35) {
      const a = p.spin + Math.random() * Math.PI * 2;
      R.addParticle(p.x + Math.cos(a) * 24, p.y - 12 + Math.sin(a) * 8, Math.cos(a) * 10, Math.sin(a) * 10 - 4, .25, '#e8c17a', 1, 0, .9, true);
    }
    if (c.time <= 0) {
      p.channel = null;
      if (c.type === 'bladestorm') p.buffs.bladestormEnd = .1;
    }
  }

  R.hasLineOfSight = function (x1, y1, x2, y2) {
    const d = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(3, Math.min(16, Math.ceil(d / 28)));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (R.propAt(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 2)) return false;
    }
    return true;
  };

  function findAutoTarget(p) {
    const g = G();
    const range = p.classId === 'warrior' ? (p.cls.basic.range + 18) : 330;
    let best = null;
    let bestD = Infinity;
    for (const e of g.enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d <= range + e.radius && d < bestD) {
        if (p.classId !== 'warrior' && !R.hasLineOfSight(p.x, p.y - 10, e.x, e.y - 8)) continue;
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  function performBasic() {
    const g = G();
    const p = g.player;
    const cls = p.cls;
    if (p.classId === 'warrior') {
      const cd = cls.basic.cooldown / (p.attackSpeed || 1);
      p.attackCd = cd;
      p.attackAnim = 1;
      const dmg = cls.basic.damage * p.dmgMult;
      const range = cls.basic.range;
      const arc = cls.basic.arc;
      let hits = 0;
      for (const e of g.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d <= range + e.radius) {
          const a = Math.atan2(e.y - p.y, e.x - p.x);
          if (Math.abs(angleDiff(a, p.aim)) <= arc / 2) {
            const dw = p.passives.deepWounds || 0;
            R.damageEnemy(e, dmg, {
              type: 'physical', color: COLOR.physical,
              bleed: dw ? (2 + dw * 2.5) : 0, big: false
            });
            hits++;
          }
        }
      }
      for (const prop of g.props || []) {
        if (!prop.breakable || prop.broken) continue;
        const d = Math.hypot(prop.x - p.x, prop.y - p.y);
        if (d <= range + prop.r) {
          const a = Math.atan2(prop.y - p.y, prop.x - p.x);
          if (Math.abs(angleDiff(a, p.aim)) <= arc / 2) R.damageProp(prop, dmg, { color: '#d8b08a' });
        }
      }
      R.addEffect({
        type: 'slash', x: p.x, y: p.y - 10, angle: p.aim, radius: range + 8,
        arc: arc, timer: .18, duration: .18, color: '#f3d69a'
      });
      if (hits) {
        p.resource = Math.min(p.maxResource, p.resource + 5 + hits * 2.5);
        g.hitstop = Math.max(g.hitstop, .022);
        g.shake = Math.max(g.shake, 1.4);
        AudioEngine.sfx('slash');
      } else {
        AudioEngine.sfx('slash');
      }
    } else if (p.classId === 'priest') {
      const cd = cls.basic.cooldown / (p.attackSpeed || 1);
      p.attackCd = cd;
      p.attackAnim = 1;
      const dmg = cls.basic.damage * p.dmgMult;
      spawnPlayerProjectile(p.x, p.y - 12, p.aim, {
        kind: 'smite', speed: 310, radius: 4, damage: dmg,
        type: 'holy', color: COLOR.holy, life: 2.1, restoreMana: true
      });
      p.resource = Math.min(p.maxResource, p.resource + 5 + (p.passives.spiritTap || 0) * 1.5);
      R.addParticle(p.x + Math.cos(p.aim) * 13, p.y - 12 + Math.sin(p.aim) * 13, Math.cos(p.aim) * 15, Math.sin(p.aim) * 15, .2, '#ffe7a3', 2, 0, .9, true);
      AudioEngine.sfx('cast');
    } else {
      const cd = cls.basic.cooldown / (p.attackSpeed || 1);
      p.attackCd = cd;
      p.attackAnim = 1;
      const dmg = cls.basic.damage * p.dmgMult * (p.basicDmgMult || 1);
      const radius = 4 * (p.basicSizeMult || 1);
      const burn = p.passives.ignite ? (2 + p.passives.ignite * 2.2) : 0;
      spawnPlayerProjectile(p.x, p.y - 12, p.aim, {
        kind: 'fireball', speed: 300, radius, damage: dmg,
        type: 'fire', color: COLOR.fire, life: 2.1, restoreMana: true,
        burn
      });
      const extra = p.basicSplit || 0;
      for (let i = 1; i <= extra; i++) {
        const side = i % 2 ? 1 : -1;
        const offset = side * Math.ceil(i / 2) * .13;
        spawnPlayerProjectile(p.x, p.y - 12, p.aim + offset, {
          kind: 'fireball', speed: 300, radius: Math.max(3, radius * .78), damage: dmg * .62,
          type: 'fire', color: COLOR.fire, life: 2.0, restoreMana: true,
          burn
        });
      }
      R.addParticle(p.x + Math.cos(p.aim) * 13, p.y - 12 + Math.sin(p.aim) * 13, Math.cos(p.aim) * 15, Math.sin(p.aim) * 15, .2, '#ffd27b', 2, 0, .9, true);
      AudioEngine.sfx('fireball');
    }
  }

  function spawnPlayerProjectile(x, y, angle, opts) {
    const g = G();
    const speed = opts.speed || 280;
    g.projectiles.push({
      friendly: true, x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: opts.radius || 4,
      damage: opts.damage || 10,
      kind: opts.kind || 'fireball',
      type: opts.type || 'fire',
      color: opts.color || '#ffb15b',
      life: opts.life || 2,
      explosion: opts.explosion || 0,
      burn: opts.burn || 0,
      slow: opts.slow || 0,
      slowTime: opts.slowTime || 0,
      restoreMana: !!opts.restoreMana,
      healOnHit: opts.healOnHit || 0,
      trail: 0,
      angle
    });
  }

  /* =========================================================
     ENEMIES
     ========================================================= */
  function updateEnemies(dt) {
    const g = G();
    const p = g.player;
    for (const e of g.enemies) {
      if (e.dead) continue;
      if (e.isBoss) { updateBoss(e, dt); continue; }
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      updateDots(e, dt);
      if (e.dead) continue;
      e.attackCd = Math.max(0, e.attackCd - dt);
      e.slowTime = Math.max(0, e.slowTime - dt);
      if (e.slowTime <= 0) e.slowPct = 0;

      if (e.frozen > 0) {
        e.frozen -= dt;
        e.windup = 0;
        continue;
      }
      if (e.stun > 0) {
        e.stun -= dt;
        e.windup = 0;
        continue;
      }
      if (e.windup > 0) {
        e.windup -= dt;
        if (e.windup <= 0) {
          finishEnemyWindup(e);
        }
        continue;
      }
      if (e.dash) {
        updateEnemyDash(e, dt);
        continue;
      }

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      e.aim = Math.atan2(dy, dx);
      const spellSlow = e.slowTime > 0 ? (1 - e.slowPct) : 1;
      const speed = e.speed * spellSlow;
      const mob = g.dungeon.mobs[e.typeKey];
      if (!mob) continue;

      // 高速怪留下轻微拖影，强化速度差
      if (speed > 88) {
        e.trailTimer = (e.trailTimer || 0) - dt;
        if (e.trailTimer <= 0) {
          e.trailTimer = .08;
          R.addParticle(e.x - Math.cos(e.aim) * 8, e.y - 10 + rand(-4, 4), rand(-6, 6), rand(-4, 4), .18, e.aura || '#d8c7a4', 1, 0, .8, true);
        }
      }

      if (mob.ai === 'bomber') {
        if (e.fuse > 0) {
          e.fuse -= dt;
          e.hitFlash = Math.max(e.hitFlash, .05);
          if (e.fuse <= 0) {
            explodeBomber(e);
            R.killEnemy(e, { noBomb: true });
          }
          continue;
        }
        if (e.attackCd <= 0 && d < 56) {
          e.fuse = .58;
          e.attackCd = 99;
          e.windup = 0;
          R.addEffect({ type: 'ring', x: e.x, y: e.y, r: 5, maxR: 34, timer: .32, duration: .32, color: '#ff5b3a', width: 2 });
          AudioEngine.sfx('cast');
          continue;
        }
        if (d > 18 + e.radius) moveEnemy(e, (dx / d) * speed, (dy / d) * speed, dt);
        continue;
      }
      if (mob.ai === 'swarm') {
        if (e.attackCd <= 0 && d < 28 + e.radius) {
          e.windup = .2;
          e.windupMax = .2;
          e.attackCd = .85;
          continue;
        }
        if (d > 14 + e.radius) {
          const jitter = Math.sin(g.time * 7 + e.id) * .28;
          const a = Math.atan2(dy, dx) + jitter;
          moveEnemy(e, Math.cos(a) * speed, Math.sin(a) * speed, dt);
        }
        continue;
      }
      if (mob.ai === 'brute') {
        if (e.attackCd <= 0 && d < 44 + e.radius) {
          e.windup = .78;
          e.windupMax = .78;
          e.attackCd = 2.2;
          continue;
        }
        if (d > 30 + e.radius) moveEnemy(e, (dx / d) * speed, (dy / d) * speed, dt);
        continue;
      }

      if (mob.ai === 'ranged') {
        if (e.attackCd <= 0 && d < 270) {
          e.windup = .58;
          e.windupMax = .58;
          e.attackCd = 2.1;
          e.aim = Math.atan2(dy, dx);
          continue;
        }
        let mx = 0, my = 0;
        if (d < 100) { mx = -dx / d; my = -dy / d; }
        else if (d > 165) { mx = dx / d; my = dy / d; }
        else {
          const s = Math.sin(g.time * 1.4 + e.id) > 0 ? 1 : -1;
          mx = (-dy / d) * .55 * s;
          my = (dx / d) * .55 * s;
        }
        moveEnemy(e, mx * speed, my * speed, dt);
      } else if (mob.ai === 'charger') {
        if (e.attackCd <= 0 && d > 55 && d < 210) {
          e.windup = .55;
          e.windupMax = .55;
          e.chargeAim = Math.atan2(dy, dx);
          e.attackCd = 3.4;
          continue;
        }
        if (d > 26) moveEnemy(e, (dx / d) * speed, (dy / d) * speed, dt);
        else if (e.attackCd <= 0) {
          e.windup = .38; e.windupMax = .38; e.attackCd = 1.5;
        }
      } else {
        if (e.attackCd <= 0 && d < 30 + e.radius) {
          e.windup = .42;
          e.windupMax = .42;
          e.attackCd = 1.35;
          continue;
        }
        if (d > 23 + e.radius) moveEnemy(e, (dx / d) * speed, (dy / d) * speed, dt);
      }
    }

    // 障碍物碰撞：先推出静态物，再做单位分离
    for (const e of g.enemies) {
      if (!e.dead) R.resolvePropCollisions(e, e.radius * .92);
    }
    // 分离
    separateEnemies();
    for (const e of g.enemies) {
      if (!e.dead) R.resolvePropCollisions(e, e.radius * .92);
    }

    // 移除死亡
    for (let i = g.enemies.length - 1; i >= 0; i--) {
      if (g.enemies[i].dead) g.enemies.splice(i, 1);
    }
  }

  function finishEnemyWindup(e) {
    const g = G();
    const p = g.player;
    const mob = g.dungeon.mobs[e.typeKey];
    if (!mob) return;
    const d = Math.hypot(p.x - e.x, p.y - e.y);
    if (mob.ai === 'ranged') {
      const angle = Math.atan2(p.y - 10 - (e.y - 12), p.x - e.x);
      const kind = mob.projectile || 'shadow';
      spawnEnemyProjectile(e.x, e.y - 12, angle, {
        kind, damage: e.damage, speed: 155 + (g.stageIndex * 5),
        radius: 4
      });
      AudioEngine.sfx(kind === 'fire' ? 'fireball' : kind === 'frost' ? 'frost' : 'cast');
    } else if (mob.ai === 'charger') {
      const a = e.chargeAim == null ? Math.atan2(p.y - e.y, p.x - e.x) : e.chargeAim;
      e.dash = {
        vx: Math.cos(a) * 360, vy: Math.sin(a) * 360,
        timer: .3, damage: e.damage, hit: false
      };
      AudioEngine.sfx('slash');
    } else if (mob.ai === 'brute') {
      if (d < 76 + e.radius) {
        R.damagePlayer(e.damage * 1.15, e.name);
        g.shake = Math.max(g.shake, 7);
        R.addEffect({ type: 'slash', x: e.x, y: e.y - 12, angle: e.aim, radius: 68, arc: 1.6, timer: .2, duration: .2, color: '#ff9b6a' });
        R.spawnBurst(e.x, e.y - 8, 14, '#d8b08a', 2);
      }
      AudioEngine.sfx('hitBig');
    } else if (mob.ai === 'swarm') {
      if (d < 38 + e.radius) R.damagePlayer(e.damage, e.name);
      R.addEffect({ type: 'slash', x: e.x, y: e.y - 9, angle: e.aim, radius: 26, arc: 1.4, timer: .12, duration: .12, color: '#ffd3a0' });
    } else {
      if (d < 48 + e.radius) {
        R.damagePlayer(e.damage, e.name);
      }
      R.addEffect({ type: 'slash', x: e.x, y: e.y - 9, angle: e.aim, radius: 30, arc: 1.2, timer: .15, duration: .15, color: '#ffb28f' });
    }
  }

  function updateEnemyDash(e, dt) {
    const g = G();
    e.dash.timer -= dt;
    e.x += e.dash.vx * dt;
    e.y += e.dash.vy * dt;
    e.hitFlash = Math.max(e.hitFlash, .05);
    R.addParticle(e.x, e.y - 10, rand(-8, 8), rand(-8, 8), .22, '#d9cbb0', 1, 0, .9);
    if (!e.dash.hit && Math.hypot(e.x - g.player.x, e.y - g.player.y) < 26) {
      e.dash.hit = true;
      R.damagePlayer(e.dash.damage, e.name);
    }
    if (e.dash.timer <= 0) {
      e.dash = null;
      e.windup = 0;
    }
  }

  R.propBlocks = function (prop) {
    return !!(prop && prop.solid && !prop.broken && prop.r > 0);
  };

  R.propAt = function (x, y, radius) {
    const g = G();
    if (!g.props) return null;
    for (const prop of g.props) {
      if (!R.propBlocks(prop)) continue;
      if (Math.hypot(x - prop.x, y - prop.y) < prop.r + (radius || 0)) return prop;
    }
    for (const b of g.braziers || []) {
      if (Math.hypot(x - b.x, y - b.y) < 13 + (radius || 0)) return b;
    }
    return null;
  };

  R.resolvePropCollisions = function (obj, radius) {
    const g = G();
    if (!g.props || !obj) return;
    const rr = radius || 8;
    // 多轮推出，避免被两个相邻障碍物来回挤压
    for (let pass = 0; pass < 4; pass++) {
      let moved = false;
      for (const prop of g.props) {
        if (!R.propBlocks(prop)) continue;
        let dx = obj.x - prop.x;
        let dy = obj.y - prop.y;
        let d = Math.hypot(dx, dy);
        const min = rr + prop.r;
        if (d < min) {
          if (d < .01) { dx = 1; dy = 0; d = 1; }
          const push = min - d;
          obj.x += dx / d * push;
          obj.y += dy / d * push;
          moved = true;
        }
      }
      for (const b of g.braziers || []) {
        let dx = obj.x - b.x;
        let dy = obj.y - b.y;
        let d = Math.hypot(dx, dy);
        const min = rr + 13;
        if (d < min) {
          if (d < .01) { dx = 1; dy = 0; d = 1; }
          const push = min - d;
          obj.x += dx / d * push;
          obj.y += dy / d * push;
          moved = true;
        }
      }
      if (!moved) break;
    }
    obj.x = clamp(obj.x, 40, g.worldW - 40);
    obj.y = clamp(obj.y, 50, g.worldH - 36);
  };

  function moveEnemy(e, vx, vy, dt) {
    e.x += vx * dt;
    e.y += vy * dt;
    e.x = clamp(e.x, 40, G().worldW - 40);
    e.y = clamp(e.y, 50, G().worldH - 36);
  }

  function separateEnemies() {
    const g = G();
    const list = g.enemies;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (a.dead) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (b.dead) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || .01;
        const min = a.radius * .85 + b.radius * .85;
        if (d < min) {
          const push = (min - d) * .5;
          const nx = dx / d, ny = dy / d;
          if (!a.isBoss) { a.x -= nx * push; a.y -= ny * push; }
          if (!b.isBoss) { b.x += nx * push; b.y += ny * push; }
        }
      }
    }
  }

  function updateDots(e, dt) {
    if (e.burnTime > 0) {
      e.burnTime -= dt;
      e.dotTick -= dt;
      if (e.dotTick <= 0) {
        e.dotTick = .5;
        R.damageEnemy(e, e.burnDps * .5, { dot: true, type: 'fire', color: COLOR.fire, silent: true });
      }
      if (e.burnTime <= 0) e.burnDps = 0;
    }
    if (e.bleedTime > 0) {
      e.bleedTime -= dt;
      e.bleedTick = (e.bleedTick || .5) - dt;
      if (e.bleedTick <= 0) {
        e.bleedTick = .5;
        R.damageEnemy(e, e.bleedDps * .5, { dot: true, type: 'physical', color: COLOR.bleed, silent: true });
      }
      if (e.bleedTime <= 0) e.bleedDps = 0;
    }
  }

  /* =========================================================
     BOSS
     ========================================================= */
  function updateBoss(b, dt) {
    const g = G();
    const p = g.player;
    b.hitFlash = Math.max(0, b.hitFlash - dt);
    updateDots(b, dt);
    if (b.dead) return;
    b.slowTime = Math.max(0, b.slowTime - dt);
    if (b.slowTime <= 0) b.slowPct = 0;
    const slow = b.slowTime > 0 ? (1 - b.slowPct * .45) : 1;
    b.aim = Math.atan2(p.y - b.y, p.x - b.x);

    if (b.cast) {
      b.cast.timer -= dt;
      if (b.cast.timer <= 0) finishBossCast(b);
      return;
    }
    if (b.dash) {
      b.dash.timer -= dt;
      b.x += b.dash.vx * dt;
      b.y += b.dash.vy * dt;
      R.addParticle(b.x + rand(-12, 12), b.y - 20 + rand(-10, 10), rand(-8, 8), rand(-8, 8), .35, '#e4c17e', 2, 0, .9);
      if (!b.dash.hit && Math.hypot(b.x - p.x, b.y - p.y) < b.radius + 18) {
        b.dash.hit = true;
        R.damagePlayer(b.dash.damage, b.name);
      }
      if (b.dash.timer <= 0) b.dash = null;
      return;
    }

    // 狂暴
    if (!b.phase2 && b.hp <= b.maxHp * .66) {
      b.phase2 = true;
      b.enraged = true;
      b.damage *= 1.15;
      b.specialCd = Math.min(b.specialCd, 1.4);
      R.toast(b.name + ' 进入狂暴状态！', 'warn');
      R.announce('首领狂暴', true);
      R.addEffect({ type: 'ring', x: b.x, y: b.y, r: 10, maxR: 100, timer: .7, duration: .7, color: '#ff6b4a', width: 3 });
      g.shake = Math.max(g.shake, 8);
      AudioEngine.sfx('boss');
      R.updateBossUI();
    }
    if (!b.phase3 && b.hp <= b.maxHp * .33) {
      b.phase3 = true;
      b.damage *= 1.18;
      b.specialCd = Math.min(b.specialCd, 1.0);
      R.toast(b.name + ' 的怒火燃烧到极限！', 'warn');
      R.announce('首领狂怒', true);
      R.addEffect({ type: 'ring', x: b.x, y: b.y, r: 10, maxR: 120, timer: .8, duration: .8, color: '#ff3b2f', width: 4 });
      g.shake = Math.max(g.shake, 11);
      AudioEngine.sfx('boss');
    }

    b.specialCd -= dt;
    b.attackCd = Math.max(0, b.attackCd - dt);
    const d = Math.hypot(p.x - b.x, p.y - b.y);
    const speed = b.speed * slow;

    if (b.windup > 0) {
      b.windup -= dt;
      if (b.windup <= 0) {
        if (d < 52 + b.radius * .5) {
          R.damagePlayer(b.damage, b.name);
          R.addEffect({ type: 'slash', x: b.x, y: b.y - 24, angle: b.aim, radius: 58, arc: 1.5, timer: .2, duration: .2, color: '#ff9f78' });
        }
        b.attackCd = b.enraged ? .9 : 1.25;
        b.windup = 0;
      }
      return;
    }

    if (b.specialCd <= 0 && d < 430) {
      startBossCast(b);
      return;
    }

    if (d < 40 + b.radius) {
      if (b.attackCd <= 0) {
        b.windup = .42;
        b.attackCd = 1.2;
      }
      return;
    }
    b.x += (p.x - b.x) / d * speed * dt;
    b.y += (p.y - b.y) / d * speed * dt;
    b.x = clamp(b.x, 48, g.worldW - 48);
    b.y = clamp(b.y, 58, g.worldH - 42);
  }

  function startBossCast(b) {
    const g = G();
    const avail = b.specials.filter((s) => s !== b.lastSpecial);
    const type = pick(avail.length ? avail : b.specials);
    b.lastSpecial = type;
    const dur = type === 'ring' ? .95 : type === 'summon' ? 1.05 : type === 'charge' ? .8 : .95;
    b.cast = {
      type,
      name: b.specialNames[type] || '未知技能',
      timer: dur,
      duration: dur,
      x: g.player.x,
      y: g.player.y
    };
    b.specialCd = Math.max(2.4, 5.2 + Math.random() * 1.4 - g.stageIndex * .2);
    AudioEngine.sfx('cast');
    R.updateBossUI();
    if (type === 'slam') {
      const tx = b.cast.x, ty = b.cast.y;
      const radius = 62 + g.stageIndex * 2;
      R.addEffect({
        type: 'telegraph', x: tx, y: ty, radius: 56 + g.stageIndex * 2,
        timer: dur, duration: dur, color: '#ff5b3c',
        onDone: () => {
          if (b.dead || g.mode !== 'playing') return;
          R.addEffect({ type: 'ring', x: tx, y: ty, r: 8, maxR: radius + 8, timer: .4, duration: .4, color: '#ff7a4a', width: 4 });
          R.spawnBurst(tx, ty, 20, '#ffb06b', 2.8);
          R.shakeScreen(9);
          if (Math.hypot(g.player.x - tx, g.player.y - ty) < radius + 8) {
            R.damagePlayer(b.damage * 1.45, b.name + ' · ' + b.specialNames.slam);
          }
          AudioEngine.sfx('hitBig');
        }
      });
    }
  }

  function finishBossCast(b) {
    const g = G();
    const cast = b.cast;
    b.cast = null;
    R.updateBossUI();
    if (!cast || b.dead) return;
    if (cast.type === 'ring') {
      const count = 12 + Math.min(8, g.stageIndex * 2);
      const kind = g.dungeon.theme.name === 'cave' ? 'poison' : g.dungeon.theme.name === 'keep' ? 'shadow' : g.dungeon.theme.name === 'ice' ? 'frost' : 'fire';
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * .1;
        spawnEnemyProjectile(b.x, b.y - 24, a, {
          kind, damage: b.damage * .85, speed: 130 + g.stageIndex * 6, radius: 5
        });
      }
      R.addEffect({ type: 'ring', x: b.x, y: b.y, r: 12, maxR: 120, timer: .5, duration: .5, color: '#ff9e6b', width: 3 });
      AudioEngine.sfx('fire');
      R.shakeScreen(5);
    } else if (cast.type === 'summon') {
      const keys = Object.keys(g.dungeon.mobs);
      for (let i = 0; i < 2; i++) {
        const a = Math.random() * Math.PI * 2;
        const sx = clamp(b.x + Math.cos(a) * 54, 60, g.worldW - 60);
        const sy = clamp(b.y + Math.sin(a) * 40, 66, g.worldH - 60);
        R.spawnEnemy(pick(keys), sx, sy, { hpMult: .9, silent: true, summon: true });
        R.spawnBurst(sx, sy, 14, '#c77dff', 2);
      }
      R.toast(b.name + ' 召唤了援军', 'warn');
      AudioEngine.sfx('portal');
    } else if (cast.type === 'charge') {
      const a = Math.atan2(g.player.y - b.y, g.player.x - b.x);
      b.dash = {
        vx: Math.cos(a) * 380, vy: Math.sin(a) * 380,
        timer: .38, damage: b.damage * 1.3, hit: false
      };
      b.aim = a;
      R.addEffect({ type: 'ring', x: b.x, y: b.y, r: 8, maxR: 55, timer: .35, duration: .35, color: '#ffb07a', width: 2 });
      AudioEngine.sfx('slash');
    }
  }

  /* =========================================================
     SPAWNING / PHASES
     ========================================================= */
  R.spawnEnemy = function (typeKey, x, y, opts) {
    opts = opts || {};
    const g = G();
    const mob = g.dungeon.mobs[typeKey];
    if (!mob) return null;
    const stage = g.stageIndex;
    const hpMult = opts.hpMult || 1;
    const e = {
      id: ++R._enemyId,
      typeKey,
      name: mob.name,
      sprite: mob.sprite,
      ai: mob.ai,
      elite: !!mob.elite,
      aura: mob.aura || '',
      fuse: 0,
      trailTimer: 0,
      x, y,
      radius: mob.radius || 10,
      scale: (mob.scale || 1) * (opts.scaleMult || 1),
      maxHp: Math.round(mob.hp * (1 + stage * D.BALANCE.mobHpPerStage) * hpMult),
      hp: 0,
      damage: mob.dmg * (1 + stage * D.BALANCE.mobDamagePerStage),
      speed: mob.speed,
      xp: Math.round(mob.xp * (1 + stage * .16)),
      aim: 0,
      attackCd: rand(.2, .8),
      windup: 0,
      windupMax: 0,
      hitFlash: 0,
      stun: 0,
      frozen: 0,
      slowPct: 0,
      slowTime: 0,
      burnTime: 0,
      burnDps: 0,
      bleedTime: 0,
      bleedDps: 0,
      dotTick: .5,
      bleedTick: .5,
      dash: null,
      dead: false,
      isBoss: false,
      summon: !!opts.summon
    };
    e.hp = e.maxHp;
    g.enemies.push(e);
    if (!opts.silent) {
      R.spawnBurst(x, y - 10, 9, g.dungeon.theme.accent, 1.6);
      R.addEffect({ type: 'ring', x, y, r: 3, maxR: 24, timer: .3, duration: .3, color: g.dungeon.theme.accent, width: 1.5 });
    }
    return e;
  };
  R._enemyId = 0;

  R.spawnWave = function (wave) {
    const g = G();
    const p = g.player;
    g.phase = 'waves';
    g.wave = wave;
    R.updateWavePips();
    R.updateObjective('消灭第 ' + wave + ' 波小怪');
    R.announce('第 ' + wave + ' 波');
    AudioEngine.sfx('cast');
    const stage = g.stageIndex;
    // 怪潮：更高数量 + 明确的角色分工
    let count = 8 + wave * 3 + Math.floor(stage * .7);
    if (wave === 2) count += 1;
    if (wave === 3) count += 2;
    const keys = Object.keys(g.dungeon.mobs);
    const byAi = (ai) => keys.filter((k) => !g.dungeon.mobs[k].elite && (g.dungeon.mobs[k].ai || 'melee') === ai);
    const meleeKeys = byAi('melee');
    const swarmKeys = byAi('swarm');
    const bruteKeys = byAi('brute');
    const chargerKeys = byAi('charger');
    const rangedKeys = byAi('ranged');
    const bomberKeys = byAi('bomber');
    const eliteKeys = keys.filter((k) => g.dungeon.mobs[k].elite);
    const list = [];
    for (let i = 0; i < count; i++) {
      let key;
      if (i === 0 && meleeKeys.length) key = pick(meleeKeys);
      else if (i === 1 && swarmKeys.length) key = pick(swarmKeys);
      else if (i === 2 && wave === 1 && bruteKeys.length) key = pick(bruteKeys);
      else if (i === count - 1 && rangedKeys.length && wave >= 2) key = pick(rangedKeys);
      else if (wave === 1) {
        const opening = [...meleeKeys, ...swarmKeys, ...chargerKeys];
        key = pick(opening.length ? opening : keys);
      }
      else {
        const pool = [];
        if (meleeKeys.length) pool.push(...meleeKeys);
        if (swarmKeys.length) pool.push(...swarmKeys, ...swarmKeys);
        if (rangedKeys.length) pool.push(...rangedKeys);
        if (bomberKeys.length) pool.push(...bomberKeys);
        if (wave >= 2 && bruteKeys.length) pool.push(...bruteKeys, ...bruteKeys);
        if (wave >= 3 && eliteKeys.length) pool.push(...eliteKeys);
        key = pick(pool);
      }
      list.push(key);
    }
    // 额外怪群：更多高速小怪 + 一个重型单位
    if (wave >= 2 && swarmKeys.length) list.push(pick(swarmKeys));
    if (wave === 3 && bruteKeys.length) list.push(pick(bruteKeys));
    if (wave === 3 && eliteKeys.length) list[Math.floor(list.length * .6)] = pick(eliteKeys);
    if (wave >= 2 && bomberKeys.length && !list.some((k) => g.dungeon.mobs[k].ai === 'bomber')) {
      list[list.length - 2] = pick(bomberKeys);
    }
    // 控制单一怪种占比，避免第三波变成十个蛮兵
    const safeFiller = [...meleeKeys, ...swarmKeys, ...rangedKeys, ...chargerKeys];
    const aiOf = (k) => (g.dungeon.mobs[k].ai || 'melee');
    let brutes = list.filter((k) => aiOf(k) === 'brute').length;
    let elites = list.filter((k) => g.dungeon.mobs[k].elite).length;
    let bombers = list.filter((k) => aiOf(k) === 'bomber').length;
    for (let i = 0; i < list.length; i++) {
      const m = g.dungeon.mobs[list[i]];
      if (m.elite && elites > 1) { list[i] = pick(safeFiller); elites--; }
      else if (aiOf(list[i]) === 'brute' && brutes > 4) { list[i] = pick(safeFiller); brutes--; }
      else if (aiOf(list[i]) === 'bomber' && bombers > 2) { list[i] = pick(safeFiller); bombers--; }
    }
    // 以玩家为中心、略偏横向的环形刷怪：让怪潮真正出现在镜头里
    for (let i = 0; i < list.length; i++) {
      let x = p.x, y = p.y;
      for (let t = 0; t < 8; t++) {
        const angle = (i / list.length) * Math.PI * 2 + rand(-.2, .2) + wave * .35 + t * .42;
        const dist = rand(125, 235);
        x = clamp(p.x + Math.cos(angle) * dist * 1.18, 70, g.worldW - 70);
        y = clamp(p.y + Math.sin(angle) * dist * .72, 70, g.worldH - 70);
        if (!R.propAt(x, y, 22)) break;
      }
      g.pendingSpawns.push({
        x, y, typeKey: list[i], timer: .18 + i * .2 + rand(0, .12),
        maxTimer: .18 + i * .2 + rand(0, .12), seed: Math.random() * 10
      });
    }
    R.updateHUD();
  };

  R.spawnBoss = function () {
    const g = G();
    const p = g.player;
    const data = g.dungeon.boss;
    const stage = g.stageIndex;
    let x = clamp(p.x + rand(-76, 76), 120, g.worldW - 120);
    let y = p.y - 108;
    if (y < 120) y = p.y + 128;
    y = clamp(y, 128, g.worldH - 110);
    const bossSpot = { x, y };
    R.resolvePropCollisions(bossSpot, data.radius * .85);
    x = bossSpot.x; y = bossSpot.y;
    const b = {
      id: ++R._enemyId,
      isBoss: true,
      name: data.name,
      title: data.title,
      sprite: data.sprite,
      x, y,
      radius: data.radius,
      scale: data.scale,
      maxHp: Math.round(data.hp * (1 + stage * D.BALANCE.bossHpPerStage)),
      hp: 0,
      damage: data.dmg * (1 + stage * D.BALANCE.bossDamagePerStage),
      speed: data.speed,
      xp: data.xp,
      aim: Math.PI / 2,
      attackCd: 1.1,
      windup: 0,
      windupMax: 0,
      hitFlash: 0,
      slowPct: 0,
      slowTime: 0,
      burnTime: 0,
      burnDps: 0,
      bleedTime: 0,
      bleedDps: 0,
      dotTick: .5,
      bleedTick: .5,
      stun: 0,
      frozen: 0,
      dash: null,
      cast: null,
      specialCd: 2.7,
      specials: data.specials,
      specialNames: data.specialNames,
      lastSpecial: null,
      phase2: false,
      phase3: false,
      enraged: false,
      dead: false
    };
    b.hp = b.maxHp;
    g.enemies.push(b);
    g.boss = b;
    g.phase = 'boss';
    g.runFlags = g.runFlags || {};
    g.runFlags.bossHit = false;
    g.bossDefeated = false;
    R.UI.bossName.textContent = data.name;
    R.UI.bossSubtitle.textContent = data.title;
    if (R.UI.bossPortrait && window.GameAssets) {
      const portrait = GameAssets.bossPortrait(data.sprite);
      R.UI.bossPortrait.src = portrait || '';
      R.UI.bossPortrait.style.visibility = portrait ? 'visible' : 'hidden';
      R.UI.bossPortrait.onerror = () => { R.UI.bossPortrait.style.visibility = 'hidden'; };
    }
    R.UI.bossPanel.classList.remove('hidden', 'enraged');
    if (R.UI.dungeonPanel) R.UI.dungeonPanel.classList.add('boss-active');
    R.UI.bossFill.style.width = '100%';
    R.UI.bossCast.classList.add('hidden');
    R.updateWavePips();
    R.updateObjective('击败精英首领 · ' + data.name);
    R.announce('精英首领', true);
    R.spawnBurst(x, y - 26, 46, g.dungeon.theme.accent, 4);
    R.spawnBurst(x, y - 26, 24, '#f0c477', 2);
    R.addEffect({ type: 'ring', x, y, r: 12, maxR: 140, timer: .8, duration: .8, color: g.dungeon.theme.accent, width: 4 });
    g.shake = 13;
    g.hitstop = .1;
    AudioEngine.sfx('boss');
    const quoteStage = g.stageIndex;
    setTimeout(() => {
      if (G().stageIndex === quoteStage && (G().mode === 'playing' || G().mode === 'paused')) R.toast(data.quote, 'epic');
    }, 900);
    R.updateHUD();
  };

  function updateSpawnQueue(dt) {
    const g = G();
    for (let i = g.pendingSpawns.length - 1; i >= 0; i--) {
      const s = g.pendingSpawns[i];
      s.timer -= dt;
      if (s.timer <= 0) {
        R.spawnEnemy(s.typeKey, s.x, s.y, {});
        g.pendingSpawns.splice(i, 1);
      }
    }
  }

  function updatePhase(dt) {
    const g = G();
    if (g.phase === 'intro') {
      g.introTimer -= dt;
      if (g.introTimer <= 0) {
        R.spawnWave(1);
      }
      return;
    }
    if (g.phase === 'waves') {
      if (g.pendingSpawns.length === 0 && g.enemies.length === 0) {
        g.phase = 'between';
        g.nextTimer = 2.4;
        g.nextIsBoss = g.wave >= g.waveTotal;
        const p = g.player;
        p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .04);
        R.toast(g.nextIsBoss ? '小怪已清除 · 首领即将降临' : '第 ' + g.wave + ' 波清除', g.nextIsBoss ? 'warn' : 'good');
        R.updateObjective(g.nextIsBoss ? '精英首领即将降临' : '准备下一波');
        R.updateWavePips();
        R.updateHUD();
      } else {
        const remaining = g.enemies.filter((e) => !e.dead).length + g.pendingSpawns.length;
        const text = '消灭第 ' + g.wave + ' 波小怪 · 剩余 ' + remaining;
        if (R.UI.objective.textContent !== text) R.updateObjective(text);
      }
      return;
    }
    if (g.phase === 'between') {
      g.nextTimer -= dt;
      if (g.nextTimer <= 0) {
        if (g.nextIsBoss) R.spawnBoss();
        else R.spawnWave(g.wave + 1);
      }
      return;
    }
    if (g.phase === 'boss') {
      if (g.boss && !g.boss.dead) {
        R.updateBossUI();
      }
    }
  }

  /* =========================================================
     COMBAT / DAMAGE
     ========================================================= */
  R.damageEnemy = function (e, amount, opts) {
    opts = opts || {};
    if (!e || e.dead) return 0;
    const g = G();
    const p = g.player;
    let adjusted = amount;
    let shatter = false, steam = false, bloodstorm = false;
    if (!opts.dot && p && p.lowHpDamageMult > 1 && p.hp / p.maxHp < .3) {
      adjusted *= p.lowHpDamageMult;
    }
    if (!opts.dot && p) {
      const runes = p.runes || {};
      // 基础联动：火破冰、冰爆燃、流血目标吃旋风
      if (opts.type === 'fire' && e.frozen > 0) {
        adjusted *= runes.shatter ? 1.5 : 1.15;
        e.frozen = 0;
        shatter = true;
      } else if (opts.type === 'frost' && e.burnTime > 0) {
        adjusted *= runes.steam ? 1.35 : 1.12;
        e.burnTime = Math.max(e.burnTime, 3);
        steam = true;
      }
      if (opts.bloodstorm && e.bleedTime > 0) {
        adjusted *= runes.bloodstorm ? 1.3 : 1.12;
        e.bleedTime = Math.max(e.bleedTime, 4);
        bloodstorm = true;
        if (runes.bloodstorm) p.resource = Math.min(p.maxResource, p.resource + 2);
      }
      if (opts.type === 'holy' && p.classId === 'priest' && runes.benediction && p.renewTime > 0) {
        adjusted *= 1.12;
      }
    }
    const dmg = Math.max(1, Math.round(adjusted));
    e.hp -= dmg;
    g.stats.damage += dmg;
    if (p && p.lifesteal && !opts.dot) {
      R.healPlayer(dmg * p.lifesteal, '#ff9b8a', { quiet: true });
    }
    if (!opts.dot) e.hitFlash = .12;
    if (shatter) {
      R.floatText(e.x, e.y - 42, '碎冰!', '#b7f1ff', 8, .8);
      R.spawnBurst(e.x, e.y - 12, 12, '#b7f1ff', 2.2);
    }
    if (steam) {
      R.floatText(e.x, e.y - 42, '蒸汽!', '#ffd7a0', 7.5, .8);
      R.spawnBurst(e.x, e.y - 12, 10, '#ffcf9a', 2);
    }
    if (bloodstorm) {
      R.floatText(e.x, e.y - 40, '血风暴', '#ff8b7a', 6.5, .7);
      R.spawnBurst(e.x, e.y - 12, 7, '#ff7d76', 1.8);
    }
    if (!opts.silent) {
      const col = opts.color || COLOR.physical;
      const size = e.isBoss ? 8 : (opts.big ? 8 : 6.5);
      R.floatText(e.x + rand(-6, 6), e.y - (e.isBoss ? 64 : e.scale * 20 + 8), String(dmg), col, size, .72);
      if (!opts.dot) {
        for (let i = 0; i < (opts.big ? 9 : 4); i++) {
          const a = rand(-2.8, -.3);
          const sp = rand(18, 65);
          R.addParticle(e.x + rand(-5, 5), e.y - 10 + rand(-6, 6), Math.cos(a) * sp, Math.sin(a) * sp, rand(.18, .42), opts.type === 'fire' ? '#ffb15b' : opts.type === 'frost' ? '#b7f1ff' : opts.type === 'arcane' ? '#d8b1ff' : opts.type === 'holy' ? '#ffe7a3' : '#d8b08a', rand(1, 2), 120, .9);
        }
      }
    }
    if (!opts.dot && !opts.silent) {
      R.addEffect({
        type: 'impact', x: e.x, y: e.y - (e.isBoss ? 34 : 12),
        size: e.isBoss ? 18 : (opts.big ? 13 : 7),
        color: opts.color || COLOR.physical,
        timer: e.isBoss ? .3 : .2, duration: e.isBoss ? .3 : .2,
        seed: (e.id || 0) * .7
      });
    }
    if (opts.stun && !e.isBoss) e.stun = Math.max(e.stun, opts.stun);
    if (opts.slow) {
      e.slowPct = Math.max(e.slowPct, opts.slow);
      e.slowTime = Math.max(e.slowTime, opts.slowTime || 2);
    }
    if (opts.bleed) {
      e.bleedDps = Math.max(e.bleedDps, opts.bleed);
      e.bleedTime = Math.max(e.bleedTime, 4);
      e.bleedTick = Math.min(e.bleedTick || .5, .35);
    }
    if (opts.burn) {
      e.burnDps = Math.max(e.burnDps, opts.burn);
      e.burnTime = Math.max(e.burnTime, opts.burnTime || 3);
    }
    // 牧师被动：救赎（神圣伤害转化为治疗）
    if (p && p.classId === 'priest' && opts.type === 'holy' && !opts.dot && p.passives.atonement) {
      R.healPlayer(dmg * (.08 + p.passives.atonement * .04) * (p.atonementMult || 1), '#ffe7a3', { quiet: true });
    }
    // 法师被动：点燃 / 寒冰碎片
    if (p && p.classId === 'mage') {
      if (opts.type === 'fire' && p.passives.ignite && !opts.dot) {
        e.burnDps = Math.max(e.burnDps, 2 + p.passives.ignite * 2.2);
        e.burnTime = Math.max(e.burnTime, 3);
      }
      if (opts.type === 'frost' && p.passives.iceShards) {
        e.slowPct = Math.max(e.slowPct, .15 + p.passives.iceShards * .1);
        e.slowTime = Math.max(e.slowTime, 2.5);
      }
      if (opts.spell && opts.restoreMana && p.passives.manaSurge) {
        p.resource = Math.min(p.maxResource, p.resource + p.passives.manaSurge * 1.5);
      }
    }
    if (opts.knockback && !e.isBoss && !opts.dot) {
      const a = Math.atan2(e.y - g.player.y, e.x - g.player.x);
      e.x += Math.cos(a) * opts.knockback;
      e.y += Math.sin(a) * opts.knockback;
    }
    if (e.hp <= 0) {
      R.killEnemy(e, opts);
    }
    return dmg;
  };

  R.damageProp = function (prop, amount, opts) {
    if (!prop || !prop.breakable || prop.broken || amount <= 0) return;
    prop.hp -= amount;
    prop.hitFlash = .18;
    const color = opts && opts.color ? opts.color : '#d8b08a';
    R.spawnBurst(prop.x, prop.y - 10, prop.hp <= 0 ? 18 : 6, color, prop.hp <= 0 ? 2.2 : 1.2);
    if (prop.hp > 0) {
      AudioEngine.sfx('hit');
      return;
    }
    prop.broken = true;
    prop.hp = 0;
    R.addEffect({ type: 'impact', x: prop.x, y: prop.y - 10, size: 13, color, timer: .28, duration: .28 });
    R.addEffect({ type: 'ring', x: prop.x, y: prop.y, r: 4, maxR: 30, timer: .3, duration: .3, color: '#c9a25c', width: 2 });
    R.spawnBurst(prop.x, prop.y - 8, 12, '#6b4728', 2);
    if (prop.xp) R.spawnXpOrbs(prop.x, prop.y, prop.xp, 2);
    AudioEngine.sfx('hitBig');
  };

  function aoeEnemies(x, y, radius, damage, opts) {
    opts = opts || {};
    const player = G().player;
    const radiusMult = player ? (player.aoeMult || 1) : 1;
    const damageMult = player ? (player.aoeDamageMult || 1) : 1;
    const rr = radius * radiusMult;
    let hits = 0;
    for (const e of G().enemies.slice()) {
      if (e.dead) continue;
      if (Math.hypot(e.x - x, e.y - y) <= rr + e.radius) {
        R.damageEnemy(e, damage * damageMult, opts);
        hits++;
      }
    }
    for (const prop of G().props || []) {
      if (prop.breakable && !prop.broken && Math.hypot(prop.x - x, prop.y - y) <= rr + prop.r) {
        R.damageProp(prop, damage * damageMult, opts);
      }
    }
    return hits;
  }
  R.aoeEnemies = aoeEnemies;

  function explodeBomber(e) {
    const g = G();
    const p = g.player;
    const radius = 66;
    R.addEffect({ type: 'ring', x: e.x, y: e.y, r: 6, maxR: radius + 12, timer: .4, duration: .4, color: '#ff5b3a', width: 3 });
    R.spawnBurst(e.x, e.y - 10, 24, '#ff7a45', 2.8);
    R.spawnBurst(e.x, e.y - 10, 10, '#ffd08a', 2);
    g.shake = Math.max(g.shake, 7);
    AudioEngine.sfx('fire');
    if (p && Math.hypot(p.x - e.x, p.y - e.y) < radius) {
      R.damagePlayer(e.damage * 1.35, e.name + ' · 自爆');
    }
  }

  R.killEnemy = function (e, opts) {
    opts = opts || {};
    if (!e || e.dead) return;
    const g = G();
    e.dead = true;
    e.hp = 0;
    if (e.ai === 'bomber' && !opts.noBomb) explodeBomber(e);
    g.stats.kills++;
    if (window.Achievements) Achievements.recordKill(e.isBoss);
    const theme = g.dungeon.theme;

    if (e.isBoss) {
      if (window.Achievements) {
        const noHit = !(g.runFlags && g.runFlags.bossHit);
        Achievements.recordBossKill(e.sprite, noHit);
      }
      g.boss = null;
      g.bossDefeated = true;
      g.phase = 'loot';
      if (R.UI.dungeonPanel) R.UI.dungeonPanel.classList.remove('boss-active');
      R.UI.bossPanel.classList.add('hidden');
      R.UI.bossCast.classList.add('hidden');
      R.updateObjective('开启首领宝箱');
      R.updateWavePips();
      R.announce('首领已击败', true);
      R.spawnXpOrbs(e.x, e.y, e.xp, 9);
      R.dropChest(e.x, e.y, 'boss');
      // 清空残余小怪
      for (const add of g.enemies.slice()) {
        if (!add.dead && !add.isBoss) {
          add.dead = true;
          g.stats.kills++;
          if (window.Achievements) Achievements.recordKill(false);
          R.spawnXpOrbs(add.x, add.y, add.xp, 2);
          R.spawnBurst(add.x, add.y - 10, 10, theme.danger, 2);
        }
      }
      R.spawnBurst(e.x, e.y - 28, 60, '#f0c477', 5);
      R.spawnBurst(e.x, e.y - 28, 30, '#ffecb8', 3);
      R.addEffect({ type: 'ring', x: e.x, y: e.y, r: 12, maxR: 160, timer: 1.1, duration: 1.1, color: '#ffd37a', width: 5 });
      g.shake = 16;
      g.hitstop = .18;
      if (g.player) {
        g.player.hp = Math.min(g.player.maxHp, g.player.hp + g.player.maxHp * .12);
        g.player.resource = Math.min(g.player.maxResource, g.player.resource + g.player.maxResource * .35);
      }
      AudioEngine.sfx('hitBig');
      setTimeout(() => {
        if (G().mode === 'playing' || G().mode === 'cards') {
          R.toast('首领宝箱已掉落 · 触碰自动开启', 'epic', 'chest');
        }
      }, 600);
      R.updateHUD();
      return;
    }

    // 普通小怪
    const p = g.player;
    if (p) {
      if (p.classId === 'warrior') {
        if (p.passives.bloodlust) {
          p.buffs.bloodlust = 5;
          p.buffs.bloodlustStacks = Math.min(3, p.buffs.bloodlustStacks + 1);
        }
        if (p.passives.victoryRush) {
          p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .03 * p.passives.victoryRush);
        }
      }
    }
    R.spawnXpOrbs(e.x, e.y, e.xp, 2);
    R.spawnBurst(e.x, e.y - 10, 12, theme.danger, 2.2);
    R.spawnBurst(e.x, e.y - 10, 5, theme.dust, 1.4);
    if (!opts.noChest && !opts.summon && Math.random() < D.BALANCE.chestChance) {
      R.dropChest(e.x, e.y, 'normal');
    }
    R.floatText(e.x, e.y - 26, '击杀', '#d8c795', 5.5, .6);
  };

  R.spawnXpOrbs = function (x, y, total, count) {
    const g = G();
    count = count || 2;
    const each = total / count;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rand(18, 65);
      g.orbs.push({
        x, y: y - 10,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 16,
        value: each,
        life: 0,
        seed: Math.random() * 10,
        r: 3.5
      });
    }
  };

  R.dropChest = function (x, y, kind) {
    const g = G();
    const chest = {
      x: clamp(x, 70, g.worldW - 70),
      y: clamp(y, 80, g.worldH - 60),
      kind: kind || 'normal',
      seed: Math.random() * 10,
      opened: false
    };
    R.resolvePropCollisions(chest, 13);
    g.chests.push(chest);
    R.addEffect({ type: 'ring', x: chest.x, y: chest.y, r: 4, maxR: kind === 'boss' ? 90 : 48, timer: .7, duration: .7, color: kind === 'boss' ? '#c77dff' : '#ffd47a', width: 2 });
    R.spawnBurst(chest.x, chest.y - 8, kind === 'boss' ? 28 : 13, kind === 'boss' ? '#c77dff' : '#ffd47a', 2.4);
    AudioEngine.sfx('chest');
    if (kind !== 'boss') R.toast('发现宝箱 · 触碰自动开启', 'good', 'chest');
    return chest;
  };

  R.healPlayer = function (amount, color, opts) {
    opts = opts || {};
    const p = P();
    if (!p || !p.hp || p.hp <= 0) return 0;
    const before = p.hp;
    const raw = Math.max(0, amount);
    const missing = Math.max(0, p.maxHp - p.hp);
    const healed = Math.min(missing, raw);
    p.hp += healed;
    if (p.overhealShield && raw > healed) {
      const shieldGain = Math.min(p.maxHp * .15, (raw - healed) * .5);
      if (shieldGain > 0) {
        p.shield = Math.min(p.maxHp * .15, (p.shield || 0) + shieldGain);
        p.shieldTimer = Math.max(p.shieldTimer || 0, 4);
      }
    }
    if (healed <= 0) {
      if (p.overhealShield) R.updateHUD();
      return 0;
    }
    if (!opts.quiet) {
      R.floatText(p.x + rand(-4, 4), p.y - 35, '+' + Math.round(healed), color || '#8cffb0', 6.5, .75);
      R.spawnBurst(p.x, p.y - 12, 5, color || '#8cffb0', 1.2);
      AudioEngine.sfx('heal');
    }
    R.updateHUD();
    return healed;
  };

  R.damagePlayer = function (amount, source) {
    const g = G();
    const p = g.player;
    if (!p || g.mode !== 'playing' || p.iframes > 0) return;
    let dmg = amount * (1 - p.dr) * (p.damageTakenMult || 1);
    if (p.buffs.shieldBlock > 0) dmg *= .75;
    if (p.buffs.iceBarrier > 0) dmg *= .9;
    if (p.passives.focusedWill && p.buffs.focusedWill > 0) dmg *= Math.max(.5, 1 - p.passives.focusedWill * .06);
    dmg = Math.max(1, dmg);
    let remaining = dmg;
    if (p.shield > 0) {
      const shieldTint = p.classId === 'priest' ? '#ffe7a3' : p.classId === 'warrior' ? '#e4c37c' : '#8fe5ff';
      const absorbed = Math.min(p.shield, remaining);
      p.shield -= absorbed;
      remaining -= absorbed;
      R.floatText(p.x, p.y - 36, '-' + Math.round(absorbed), shieldTint, 6.5, .7);
      R.spawnBurst(p.x, p.y - 14, 6, shieldTint, 1.4);
      if (p.shield <= 0) { p.shield = 0; p.shieldTimer = 0; }
    }
    if (remaining > 0) {
      p.hp -= remaining;
      p.lastHurt = 0;
      if (g.phase === 'boss' && g.runFlags) g.runFlags.bossHit = true;
      R.floatText(p.x + rand(-4, 4), p.y - 34, '-' + Math.round(remaining), '#ff7f70', 7, .7);
      R.spawnBurst(p.x, p.y - 14, 8, '#b53a32', 1.8);
      R.takeDamageFlash();
      AudioEngine.sfx('hurt');
      if (p.passives.focusedWill) p.buffs.focusedWill = 4;
    }
    p.iframes = .45;
    g.shake = Math.max(g.shake, remaining > 0 ? 5 : 2.5);
    if (p.hp <= 0) {
      p.hp = 0;
      playerDeath();
    }
    R.updateHUD();
  };

  function playerDeath() {
    const g = G();
    const p = g.player;
    if (g.mode !== 'playing') return;
    R.spawnBurst(p.x, p.y - 14, 42, '#b53a32', 3.4);
    R.spawnBurst(p.x, p.y - 14, 18, '#e6c087', 2);
    R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 4, maxR: 80, timer: .8, duration: .8, color: '#b53a32', width: 3 });
    g.shake = 14;
    AudioEngine.sfx('death');
    R.endRun(false);
  }

  /* =========================================================
     ABILITIES
     ========================================================= */
  R.castAbilitySlot = function (slot) {
    const g = G();
    const p = g.player;
    if (!p || g.mode !== 'playing') return;
    const id = p.abilities[slot];
    if (!id) return;
    const skill = skillOf(p, id);
    if (!skill) return;
    const now = performance.now();
    if ((p.cooldowns[id] || 0) > 0) {
      if (!R._lastDenied || now - R._lastDenied > 600) {
        R._lastDenied = now;
        AudioEngine.sfx('denied');
        R.flashSlot(slot);
      }
      return;
    }
    if (p.stun > 0 || p.channel || p.leap || p.dash) {
      if (!R._lastDenied || now - R._lastDenied > 600) {
        R._lastDenied = now;
        R.toast('现在无法施放', 'warn');
        AudioEngine.sfx('denied');
        R.flashSlot(slot);
      }
      return;
    }
    const cost = Math.ceil((skill.cost || 0) * (p.costMult || 1));
    if (p.resource < cost) {
      if (!R._lastDenied || now - R._lastDenied > 600) {
        R._lastDenied = now;
        R.toast(p.cls.resourceName + '不足', 'warn');
        AudioEngine.sfx('denied');
        R.flashSlot(slot);
      }
      return;
    }
    p.resource -= cost;
    p.cooldowns[id] = cdOf(p, skill);
    p.attackAnim = Math.max(p.attackAnim, .3);
    castAbility(id, p, skill);
    R.updateHUD();
    R.updateAbilityHUD();
  };

  function castAbility(id, p, skill) {
    const g = G();
    const aim = aimAtMouse(p);
    p.aim = aim;
    switch (id) {
      case 'holyFire': {
        spawnPlayerProjectile(p.x, p.y - 12, aim, {
          kind: 'holyfire', speed: 255, radius: 5,
          damage: (30 + p.level * 4.5) * p.dmgMult,
          type: 'holy', color: COLOR.holy, life: 2.2, restoreMana: true,
          burn: 2.5 + p.level * .12, burnTime: 3
        });
        R.addEffect({ type: 'ring', x: p.x, y: p.y - 12, r: 4, maxR: 24, timer: .22, duration: .22, color: '#ffe7a3', width: 1 });
        R.spawnBurst(p.x + Math.cos(aim) * 14, p.y - 12 + Math.sin(aim) * 14, 8, '#ffe7a3', 1.6);
        AudioEngine.sfx('fireball');
        break;
      }
      case 'powerWordShield': {
        const amount = Math.round(p.maxHp * (.26 + p.level * .01) * p.shieldBonus);
        p.shield = Math.min(p.maxHp * 1.2, p.shield + amount);
        p.shieldTimer = 5 + p.shieldDurBonus;
        R.floatText(p.x, p.y - 35, '护盾 +' + amount, '#ffe7a3', 7, .9);
        R.addEffect({ type: 'rune', x: p.x, y: p.y, r: 32, color: '#ffe7a3', timer: .55, duration: .55 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 6, maxR: 52, timer: .5, duration: .5, color: '#ffe7a3', width: 3 });
        R.spawnBurst(p.x, p.y - 14, 16, '#ffe7a3', 1.8);
        AudioEngine.sfx('shield');
        break;
      }
      case 'renew': {
        p.renewTime = 8 + (p.renewDurBonus || 0);
        p.renewHeal = 4 + p.level * .8;
        p.renewTick = 1;
        R.floatText(p.x, p.y - 35, '恢复', '#8cffb0', 6.5, .8);
        R.addEffect({ type: 'rune', x: p.x, y: p.y, r: 24, color: '#8cffb0', timer: .5, duration: .5 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 5, maxR: 34, timer: .4, duration: .4, color: '#8cffb0', width: 2 });
        AudioEngine.sfx('heal');
        break;
      }
      case 'holyNova': {
        const radius = 78;
        const dmg = (24 + p.level * 3) * p.dmgMult;
        const hits = aoeEnemies(p.x, p.y, radius, dmg, {
          type: 'holy', color: COLOR.holy, spell: true, restoreMana: true, big: true
        });
        let heal = (10 + p.level * 1.5) * (p.healMult || 1);
        if (p.renewTime > 0) heal *= 1.5;
        if (p.runes && p.runes.sanctified && p.renewTime > 0) {
          heal *= 1.35;
          p.renewTime += 2;
        }
        R.healPlayer(heal, '#8cffb0');
        R.addEffect({ type: 'rune', x: p.x, y: p.y, r: radius, color: '#ffe7a3', timer: .55, duration: .55 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 8, maxR: radius + 10, timer: .4, duration: .4, color: '#ffe7a3', width: 3 });
        R.spawnBurst(p.x, p.y - 12, 24, '#ffe7a3', 2.5);
        if (hits) g.shake = Math.max(g.shake, 3);
        AudioEngine.sfx('cast');
        break;
      }
      case 'flashHeal': {
        const amount = p.maxHp * (.30 + p.level * .022) * (p.healMult || 1);
        R.healPlayer(amount, '#8cffb0');
        R.addEffect({ type: 'rune', x: p.x, y: p.y, r: 24, color: '#8cffb0', timer: .42, duration: .42 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 5, maxR: 40, timer: .35, duration: .35, color: '#8cffb0', width: 2 });
        AudioEngine.sfx('heal');
        break;
      }
      case 'penance': {
        const fan = [-.12, 0, .12];
        const boltDamage = (15 + p.level * 1.8) * p.dmgMult;
        const boltHeal = (5 + p.level * .5) * (p.healMult || 1);
        for (const offset of fan) {
          spawnPlayerProjectile(p.x, p.y - 12, aim + offset, {
            kind: 'penance', speed: 390, radius: 4,
            damage: boltDamage, type: 'holy', color: COLOR.holy,
            life: 1.5, restoreMana: true, healOnHit: boltHeal
          });
        }
        p.attackAnim = 1;
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 4, maxR: 30, timer: .24, duration: .24, color: '#ffe7a3', width: 2 });
        R.spawnBurst(p.x + Math.cos(aim) * 13, p.y - 12 + Math.sin(aim) * 13, 10, '#ffe7a3', 1.8);
        AudioEngine.sfx('cast');
        break;
      }
      case 'charge': {
        const range = 145;
        const m = R.input.mouse;
        let tx = m.worldX, ty = m.worldY;
        const d = Math.hypot(tx - p.x, ty - p.y) || 1;
        const dist = Math.min(range, d);
        const a = Math.atan2(ty - p.y, tx - p.x);
        p.dash = {
          vx: Math.cos(a) * (dist / .22),
          vy: Math.sin(a) * (dist / .22),
          timer: .22,
          damage: (26 + p.level * 3.5) * p.dmgMult,
          hit: new Set()
        };
        p.iframes = .25;
        p.aim = a;
        p.attackAnim = 1;
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 4, maxR: 36, timer: .3, duration: .3, color: '#d8b26b', width: 2 });
        R.spawnBurst(p.x, p.y - 12, 10, '#e3c185', 1.8);
        AudioEngine.sfx('slash');
        break;
      }
      case 'whirlwind': {
        p.channel = { type: 'whirlwind', time: .9, tick: 0, interval: .18, mobile: true };
        p.spin = 0;
        AudioEngine.sfx('slash');
        break;
      }
      case 'shieldBlock': {
        const amount = Math.round(p.maxHp * (.32 + p.level * .01));
        p.shield = Math.min(p.maxHp * 1.2, p.shield + amount);
        p.shieldTimer = 4 + p.shieldDurBonus;
        p.buffs.shieldBlock = 4 + p.shieldDurBonus;
        R.floatText(p.x, p.y - 35, '护盾 +' + amount, '#ffe09a', 7, .9);
        R.addEffect({ type: 'rune', x: p.x, y: p.y, r: 34, color: '#ffd47a', timer: .55, duration: .55 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 6, maxR: 48, timer: .45, duration: .45, color: '#ffd47a', width: 3 });
        R.spawnBurst(p.x, p.y - 14, 14, '#ffd47a', 1.8);
        AudioEngine.sfx('shield');
        break;
      }
      case 'execute': {
        const dmgBase = (38 + p.level * 5) * p.dmgMult;
        let hitAny = false, killAny = false;
        for (const e of g.enemies.slice()) {
          if (e.dead) continue;
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          const a = Math.atan2(e.y - p.y, e.x - p.x);
          if (d < 78 + e.radius && Math.abs(R.angleDiff(a, aim)) < 1.3) {
            const low = e.hp / e.maxHp < .3;
            const bleedy = e.bleedTime > 0;
            const marked = low || (p.runes && p.runes.executioner && bleedy);
            R.damageEnemy(e, marked ? dmgBase * 2 : dmgBase, {
              type: 'physical', color: '#ffd27b', big: true, knockback: 8
            });
            if (marked && !low) R.floatText(e.x, e.y - 38, '处刑!', '#ffb07a', 7, .7);
            hitAny = true;
            if (e.dead) killAny = true;
          }
        }
        R.addEffect({ type: 'slash', x: p.x, y: p.y - 10, angle: aim, radius: 88, arc: 2.3, timer: .28, duration: .28, color: '#ffd47a' });
        R.spawnBurst(p.x + Math.cos(aim) * 34, p.y - 10 + Math.sin(aim) * 34, hitAny ? 18 : 8, '#ffda8f', 2.6);
        g.shake = Math.max(g.shake, hitAny ? 7 : 3);
        g.hitstop = Math.max(g.hitstop, hitAny ? .05 : 0);
        if (killAny) {
          p.cooldowns.execute = 0;
          if (p.runes && p.runes.executioner) {
            p.cooldowns.charge = 0;
            p.resource = Math.min(p.maxResource, p.resource + 15);
            R.floatText(p.x, p.y - 40, '怒气 +15', '#ffb07a', 7, .8);
          }
        }
        AudioEngine.sfx(hitAny ? 'hitBig' : 'slash');
        break;
      }
      case 'heroicLeap': {
        const m = R.input.mouse;
        let tx = m.worldX, ty = m.worldY;
        const d = Math.hypot(tx - p.x, ty - p.y) || 1;
        const maxD = 135;
        if (d > maxD) {
          tx = p.x + (tx - p.x) / d * maxD;
          ty = p.y + (ty - p.y) / d * maxD;
        }
        tx = clamp(tx, 48, g.worldW - 48);
        ty = clamp(ty, 54, g.worldH - 44);
        p.leap = { sx: p.x, sy: p.y, tx, ty, t: 0, duration: .42 };
        p.iframes = .5;
        AudioEngine.sfx('cast');
        break;
      }
      case 'bladestorm': {
        p.channel = { type: 'bladestorm', time: 2.0, tick: 0, interval: .2, mobile: true };
        p.slow = 0;
        AudioEngine.sfx('slash');
        break;
      }
      case 'frostNova': {
        const radius = 74;
        const dmg = (13 + p.level * 2.5) * p.dmgMult;
        let hits = 0;
        for (const e of g.enemies.slice()) {
          if (e.dead) continue;
          if (Math.hypot(e.x - p.x, e.y - p.y) < radius + e.radius) {
            R.damageEnemy(e, dmg, { type: 'frost', color: COLOR.frost, spell: true, restoreMana: true, slow: .35, slowTime: 2.5 });
            if (!e.isBoss) e.frozen = Math.max(e.frozen, 1.6);
            hits++;
          }
        }
        R.addEffect({ type: 'rune', x: p.x, y: p.y, r: radius, color: '#9deaff', timer: .55, duration: .55 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 8, maxR: radius + 12, timer: .45, duration: .45, color: '#9deaff', width: 3 });
        for (let i = 0; i < 22; i++) {
          const a = Math.random() * Math.PI * 2;
          R.addParticle(p.x, p.y - 10, Math.cos(a) * rand(30, 100), Math.sin(a) * rand(15, 70), rand(.35, .7), '#b9f4ff', rand(1, 3), 20, .92, true);
        }
        g.shake = Math.max(g.shake, hits ? 3 : 1.5);
        AudioEngine.sfx('frost');
        break;
      }
      case 'blink': {
        const m = R.input.mouse;
        let tx = m.worldX, ty = m.worldY;
        const d = Math.hypot(tx - p.x, ty - p.y) || 1;
        const maxD = 110;
        if (d > maxD) {
          tx = p.x + (tx - p.x) / d * maxD;
          ty = p.y + (ty - p.y) / d * maxD;
        }
        tx = clamp(tx, 40, g.worldW - 40);
        ty = clamp(ty, 48, g.worldH - 38);
        R.spawnBurst(p.x, p.y - 12, 18, '#c59bff', 2);
        const ox = p.x, oy = p.y;
        p.x = tx;
        p.y = ty;
        p.iframes = Math.max(p.iframes, .35);
        R.spawnBurst(p.x, p.y - 12, 18, '#b783ec', 2);
        R.addEffect({ type: 'line', x1: ox, y1: oy - 12, x2: tx, y2: ty - 12, color: '#c59bff', width: 4, timer: .26, duration: .26 });
        R.addEffect({ type: 'rune', x: tx, y: ty, r: 26, color: '#c59bff', timer: .38, duration: .38 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 4, maxR: 34, timer: .3, duration: .3, color: '#c59bff', width: 2 });
        AudioEngine.sfx('blink');
        break;
      }
      case 'arcaneExplosion': {
        p.pulses = { left: 3, timer: 0, interval: .16 };
        R.addEffect({ type: 'rune', x: p.x, y: p.y, r: 58, color: '#c59bff', timer: .5, duration: .5 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 10, maxR: 60, timer: .25, duration: .25, color: '#b877ff', width: 2 });
        AudioEngine.sfx('arcane');
        break;
      }
      case 'iceBarrier': {
        const amount = Math.round((45 + p.level * 6) * p.shieldBonus);
        p.shield = Math.min(p.maxHp * 1.2, p.shield + amount);
        p.shieldTimer = 5 + p.shieldDurBonus;
        p.buffs.iceBarrier = 5 + p.shieldDurBonus;
        R.floatText(p.x, p.y - 35, '护盾 +' + amount, '#a9ecff', 7, .9);
        R.addEffect({ type: 'rune', x: p.x, y: p.y, r: 32, color: '#8fe5ff', timer: .55, duration: .55 });
        R.addEffect({ type: 'ring', x: p.x, y: p.y, r: 6, maxR: 46, timer: .5, duration: .5, color: '#8fe5ff', width: 3 });
        for (let i = 0; i < 16; i++) {
          const a = Math.random() * Math.PI * 2;
          R.addParticle(p.x, p.y - 12, Math.cos(a) * rand(15, 55), Math.sin(a) * rand(15, 55), rand(.3, .6), '#b5f1ff', 2, 20, .92, true);
        }
        AudioEngine.sfx('shield');
        break;
      }
      case 'flamestrike': {
        const m = R.input.mouse;
        let tx = clamp(m.worldX, 50, g.worldW - 50);
        let ty = clamp(m.worldY, 56, g.worldH - 44);
        const radius = 52;
        R.addEffect({ type: 'rune', x: tx, y: ty, r: radius, color: '#ff9a4a', timer: .8, duration: .8 });
        R.addEffect({
          type: 'telegraph', x: tx, y: ty, radius, timer: .8, duration: .8, color: '#ff6a32', meteor: true,
          onDone: () => {
            if (g.mode !== 'playing') return;
            const dmg = (42 + p.level * 5) * p.dmgMult;
            const hits = aoeEnemies(tx, ty, radius + 8, dmg, {
              type: 'fire', color: COLOR.fire, spell: true, restoreMana: true,
              burn: 2 + (p.passives.ignite || 0) * 2.2, burnTime: 3
            });
            R.addEffect({ type: 'ring', x: tx, y: ty, r: 10, maxR: radius + 25, timer: .5, duration: .5, color: '#ff9a4a', width: 4 });
            R.spawnBurst(tx, ty, 30, '#ff9a3e', 3.4);
            R.spawnBurst(tx, ty, 12, '#ffe39a', 2);
            g.shake = Math.max(g.shake, hits ? 8 : 4);
            AudioEngine.sfx('fire');
          }
        });
        AudioEngine.sfx('cast');
        break;
      }
      case 'pyroblast': {
        spawnPlayerProjectile(p.x, p.y - 12, aim, {
          kind: 'pyroblast', speed: 190, radius: 6,
          damage: (50 + p.level * 6) * p.dmgMult,
          type: 'fire', color: '#ff8a3a', life: 2.4,
          explosion: 42, burn: 4 + (p.passives.ignite || 0) * 2.2
        });
        R.spawnBurst(p.x + Math.cos(aim) * 16, p.y - 12 + Math.sin(aim) * 16, 12, '#ffb15b', 1.6);
        AudioEngine.sfx('fire');
        break;
      }
      default:
        break;
    }
  }

  /* =========================================================
     PROJECTILES
     ========================================================= */
  function spawnEnemyProjectile(x, y, angle, opts) {
    const g = G();
    g.projectiles.push({
      friendly: false,
      x, y,
      vx: Math.cos(angle) * (opts.speed || 155),
      vy: Math.sin(angle) * (opts.speed || 155),
      r: opts.radius || 4,
      damage: opts.damage || 8,
      kind: opts.kind || 'shadow',
      type: opts.kind === 'fire' ? 'fire' : opts.kind === 'frost' ? 'frost' : opts.kind === 'poison' ? 'poison' : 'shadow',
      color: opts.color || '#c59bff',
      life: 3.5,
      trail: 0
    });
    return g.projectiles[g.projectiles.length - 1];
  }
  R.spawnEnemyProjectile = spawnEnemyProjectile;

  function updateProjectiles(dt) {
    const g = G();
    const p = g.player;
    for (let i = g.projectiles.length - 1; i >= 0; i--) {
      const pr = g.projectiles[i];
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;
      pr.trail -= dt;
      if (pr.trail <= 0) {
        pr.trail = .05;
        R.addParticle(pr.x, pr.y, -pr.vx * .04 + rand(-5, 5), -pr.vy * .04 + rand(-5, 5), .22, pr.kind === 'pyroblast' ? '#ffb15b' : pr.kind === 'fireball' ? '#ffb15b' : pr.kind === 'frost' ? '#9deaff' : pr.kind === 'poison' ? '#b6ff83' : pr.kind === 'smite' || pr.kind === 'penance' || pr.kind === 'holyfire' ? '#ffe7a3' : '#c59bff', pr.kind === 'pyroblast' ? 2 : 1, 0, .9, true);
      }
      let remove = pr.life <= 0;
      if (pr.x < 30 || pr.x > g.worldW - 30 || pr.y < 38 || pr.y > g.worldH - 30) remove = true;

      // 实心地图物体会挡住弹道；可破坏物体会被玩家弹道打碎
      if (!remove) {
        const prop = R.propAt(pr.x, pr.y, pr.r);
        if (prop) {
          if (pr.friendly && prop.breakable) {
            R.damageProp(prop, pr.damage, { type: pr.type, color: pr.type === 'fire' ? COLOR.fire : pr.type === 'frost' ? COLOR.frost : pr.type === 'holy' ? COLOR.holy : COLOR.arcane });
          }
          R.addEffect({ type: 'impact', x: pr.x, y: pr.y, size: 8, color: pr.friendly ? '#ffd27b' : '#b58bff', timer: .18, duration: .18 });
          R.spawnBurst(pr.x, pr.y, 6, '#d8c7a4', 1.3);
          remove = true;
        }
      }

      if (!remove && pr.friendly) {
        for (const e of g.enemies) {
          if (e.dead) continue;
          if (Math.hypot(e.x - pr.x, e.y - pr.y) < e.radius + pr.r + 2) {
            if (pr.explosion) {
              const hits = aoeEnemies(pr.x, pr.y, pr.explosion, pr.damage, {
                type: 'fire', color: COLOR.fire, spell: true, restoreMana: true,
                burn: pr.burn, burnTime: 3, big: true
              });
              R.addEffect({ type: 'ring', x: pr.x, y: pr.y, r: 8, maxR: pr.explosion + 18, timer: .38, duration: .38, color: '#ff9a4a', width: 3 });
              R.spawnBurst(pr.x, pr.y, 24, '#ff9a3e', 3);
              g.shake = Math.max(g.shake, 7);
              AudioEngine.sfx('fire');
            } else {
              R.damageEnemy(e, pr.damage, {
                type: pr.type, color: pr.type === 'fire' ? COLOR.fire : pr.type === 'frost' ? COLOR.frost : pr.type === 'holy' ? COLOR.holy : COLOR.arcane,
                spell: true, restoreMana: pr.restoreMana, burn: pr.burn, burnTime: 3
              });
              if (pr.healOnHit) R.healPlayer(pr.healOnHit, '#8cffb0', { quiet: true });
              R.spawnBurst(pr.x, pr.y, 7, pr.type === 'fire' ? '#ffb15b' : pr.type === 'holy' ? '#ffe7a3' : '#b9f4ff', 1.6);
              AudioEngine.sfx('hit');
            }
            remove = true;
            break;
          }
        }
      } else if (!remove && !pr.friendly) {
        if (Math.hypot(p.x - pr.x, p.y - 10 - pr.y) < 12 + pr.r) {
          R.damagePlayer(pr.damage, '远程攻击');
          R.spawnBurst(pr.x, pr.y, 6, pr.color, 1.3);
          remove = true;
        }
      }
      if (remove) g.projectiles.splice(i, 1);
    }
  }

  /* =========================================================
     EFFECTS / PARTICLES / ORBS
     ========================================================= */
  R.addEffect = function (e) {
    const g = G();
    if (!g.effects) g.effects = [];
    if (g.effects.length > 80) {
      // 保护带 onDone 的地面预警，避免特效过多时吞掉伤害
      const idx = g.effects.findIndex((x) => x.type !== 'telegraph');
      if (idx < 0) return;
      g.effects.splice(idx, 1);
    }
    g.effects.push(e);
  };
  R.addParticle = function (x, y, vx, vy, life, color, size, gravity, drag, glow) {
    const g = G();
    if (g.particles.length > 520) g.particles.shift();
    g.particles.push({
      x, y, vx, vy, life, maxLife: life, color, size: size || 1,
      gravity: gravity || 0, drag: drag || .92, glow: !!glow
    });
  };
  R.spawnBurst = function (x, y, count, color, power) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rand(15, 75) * (power || 1);
      R.addParticle(x, y, Math.cos(a) * sp, Math.sin(a) * sp - rand(5, 25) * (power || 1) * .4, rand(.25, .75), color, rand(1, 2.5), 130, .9, Math.random() < .35);
    }
  };

  function updateEffects(dt) {
    const g = G();
    for (let i = g.effects.length - 1; i >= 0; i--) {
      const e = g.effects[i];
      e.timer -= dt;
      if (e.type === 'ring') {
        e.r = R.lerp(e.r, e.maxR, Math.min(1, dt * 10));
      }
      if (e.timer <= 0) {
        if (e.onDone) {
          try { e.onDone(); } catch (err) { console.error(err); }
        }
        g.effects.splice(i, 1);
      }
    }
  }

  function updateParticles(dt) {
    const g = G();
    for (let i = g.particles.length - 1; i >= 0; i--) {
      const p = g.particles[i];
      p.life -= dt;
      if (p.life <= 0) { g.particles.splice(i, 1); continue; }
      p.vy += p.gravity * dt;
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  function updateTexts(dt) {
    const g = G();
    for (let i = g.texts.length - 1; i >= 0; i--) {
      const t = g.texts[i];
      t.life -= dt;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vy += 24 * dt;
      if (t.life <= 0) g.texts.splice(i, 1);
    }
  }

  function updateOrbs(dt) {
    const g = G();
    const p = g.player;
    for (let i = g.orbs.length - 1; i >= 0; i--) {
      const o = g.orbs[i];
      o.life += dt;
      const dx = p.x - o.x;
      const dy = p.y - 12 - o.y;
      const d = Math.hypot(dx, dy) || 1;
      const magnet = o.life > 10 ? 260 : 95;
      if (d < magnet) {
        const pull = (1 - d / magnet) * 380 + 40;
        o.vx += (dx / d) * pull * dt;
        o.vy += (dy / d) * pull * dt;
      }
      o.vx *= Math.pow(.985, dt * 60);
      o.vy *= Math.pow(.985, dt * 60);
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      if (d < 15 || o.life > 22) {
        R.gainXp(o.value);
        R.addParticle(p.x + rand(-5, 5), p.y - 12 + rand(-5, 5), rand(-5, 5), rand(-20, -8), .35, '#ffe2a0', 1.5, 0, .9, true);
        g.orbs.splice(i, 1);
      }
    }
  }

  R.shakeScreen = function (n) {
    G().shake = Math.max(G().shake, n);
  };

  function updatePortal() {
    const g = G();
    const p = g.player;
    if (!p) return;
    // 宝箱：触碰自动开启
    for (const c of g.chests) {
      if (c.opened) continue;
      if (Math.hypot(c.x - p.x, c.y - p.y) < 30) {
        R.openChest(c);
        return;
      }
    }
    // 传送门：离开出生点后，走入范围自动进入
    for (const portal of g.portals) {
      const d = Math.hypot(portal.x - p.x, portal.y - p.y);
      if (!portal.armed) {
        if (d > 50) portal.armed = true;
        continue;
      }
      if (d < 34) {
        AudioEngine.sfx('portal');
        R.enterPortal();
        return;
      }
    }
  }

  R.updateBossUI = function () {
    const g = G();
    const b = g.boss;
    if (!b || b.dead) {
      if (R.UI.bossPanel) R.UI.bossPanel.classList.add('hidden');
      return;
    }
    R.UI.bossPanel.classList.remove('hidden');
    R.UI.bossPanel.classList.toggle('enraged', !!b.enraged);
    R.UI.bossFill.style.width = Math.max(0, (b.hp / b.maxHp) * 100) + '%';
    if (b.cast) {
      R.UI.bossCast.classList.remove('hidden');
      R.UI.bossCastFill.style.width = Math.max(0, (1 - b.cast.timer / b.cast.duration) * 100) + '%';
      R.UI.bossCastText.textContent = '施放：' + b.cast.name;
      if (R.UI.bossCastIcon) {
        let icon = 'execute';
        if (b.cast.type === 'ring') icon = b.sprite === 'lichking' ? 'frost' : b.sprite === 'mutanus' ? 'mana' : b.sprite === 'arugal' ? 'arcane' : 'flamestrike';
        else if (b.cast.type === 'summon') icon = 'summon';
        else if (b.cast.type === 'charge') icon = 'charge';
        R.UI.bossCastIcon.src = Art.makeIcon(icon, '#d9b26c');
        R.UI.bossCastIcon.style.display = 'block';
      }
    } else {
      R.UI.bossCast.classList.add('hidden');
      R.UI.bossCastFill.style.width = '0%';
      if (R.UI.bossCastIcon) R.UI.bossCastIcon.style.display = 'none';
    }
  };
})();

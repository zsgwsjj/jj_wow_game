/* =========================================================
   艾泽拉斯：裂隙远征 — 游戏数据
   魔兽世界同人像素肉鸽 · 无外部依赖
   ========================================================= */
(function () {
  'use strict';

  const CLASSES = {
    warrior: {
      id: 'warrior',
      name: '战士',
      en: 'WARRIOR',
      color: '#c79c6e',
      glow: '#ffd39b',
      role: '重甲近战 · 怒气',
      tagline: '以钢铁与怒吼撕开敌阵。',
      description: '高生命、高减伤，贴身劈砍积攒怒气。适合喜欢正面压制、在怪堆里旋转到底的玩家。',
      baseHp: 195,
      hpPerLevel: 12,
      baseResource: 100,
      resourceName: '怒气',
      resourceColor: '#d64b3c',
      resourceRegen: 3.2,
      startResource: 35,
      armor: 0.10,
      speed: 78,
      startingAbility: 'charge',
      basic: {
        name: '劈砍',
        icon: 'cleave',
        desc: '挥动巨刃，对前方扇形范围内的敌人造成伤害并积攒怒气。',
        damage: 17,
        cooldown: 0.55,
        range: 48,
        arc: 2.25
      },
      stats: [
        { label: '生存', value: 5 },
        { label: '爆发', value: 4 },
        { label: '机动', value: 2 }
      ]
    },
    mage: {
      id: 'mage',
      name: '法师',
      en: 'MAGE',
      color: '#69ccf0',
      glow: '#b8f2ff',
      role: '远程爆发 · 法力',
      tagline: '用冰与火改写战局。',
      description: '生命较低但机动灵活，远程火球持续输出。依靠冻结、闪现和护盾在刀尖上跳舞。',
      baseHp: 122,
      hpPerLevel: 6,
      baseResource: 100,
      resourceName: '法力',
      resourceColor: '#3f8fe8',
      resourceRegen: 7.0,
      startResource: 100,
      armor: 0,
      speed: 86,
      startingAbility: 'frostNova',
      basic: {
        name: '火球术',
        icon: 'fireball',
        desc: '向鼠标方向发射一枚火球，命中敌人后造成火焰伤害。',
        damage: 14,
        cooldown: 0.5,
        speed: 270
      },
      stats: [
        { label: '生存', value: 2 },
        { label: '爆发', value: 5 },
        { label: '机动', value: 4 }
      ]
    },
    priest: {
      id: 'priest',
      name: '牧师',
      en: 'PRIEST',
      color: '#f1dfae',
      glow: '#fff3c4',
      role: '神圣治疗 · 法力',
      tagline: '以圣光维系生命，以惩戒净化黑暗。',
      description: '生命与护甲都不高，但拥有持续治疗、护盾与远程神圣伤害。用恢复和救赎把每一次受伤变成反击。',
      baseHp: 132,
      hpPerLevel: 7,
      baseResource: 120,
      resourceName: '法力',
      resourceColor: '#7fc4ff',
      resourceRegen: 8.0,
      startResource: 100,
      armor: 0.04,
      speed: 84,
      startingAbility: 'holyFire',
      basic: {
        name: '惩击',
        icon: 'holybolt',
        desc: '发射一道圣光，对命中的敌人造成神圣伤害。',
        damage: 14,
        cooldown: 0.62,
        speed: 300
      },
      stats: [
        { label: '生存', value: 3 },
        { label: '爆发', value: 3 },
        { label: '机动', value: 4 }
      ]
    }
  };

  const SKILLS = {
    warrior: {
      charge: {
        id: 'charge', type: 'active', name: '冲锋', icon: 'charge', rarity: 'rare',
        tag: '位移 · 控制', cost: 15, cooldown: 7,
        desc: (lv) => '朝鼠标方向猛冲，对路径上的敌人造成 ' + Math.round(26 + lv * 3.5) + ' 点伤害并眩晕 0.8 秒。',
        flavor: '“为了部落！”'
      },
      whirlwind: {
        id: 'whirlwind', type: 'active', name: '旋风斩', icon: 'whirlwind', rarity: 'epic',
        tag: '范围 · 持续', cost: 25, cooldown: 6.5,
        desc: (lv) => '旋转 0.9 秒，每 0.18 秒对周围敌人造成 ' + Math.round(11 + lv * 2.2) + ' 点伤害；旋转期间可以移动。',
        flavor: '钢铁的风暴，没有死角。'
      },
      shieldBlock: {
        id: 'shieldBlock', type: 'active', name: '盾牌格挡', icon: 'shield', rarity: 'rare',
        tag: '防御 · 护盾', cost: 20, cooldown: 13,
        desc: (lv) => '获得相当于最大生命 ' + (32 + lv) + '% 的护盾，持续 4 秒，期间减少 25% 受到的伤害。',
        flavor: '最好的进攻，是让敌人先撞上盾牌。'
      },
      execute: {
        id: 'execute', type: 'active', name: '致死打击', icon: 'execute', rarity: 'epic',
        tag: '斩杀 · 爆发', cost: 30, cooldown: 8,
        desc: (lv) => '对前方敌人造成 ' + Math.round(38 + lv * 5) + ' 点伤害。目标生命低于 30% 时伤害翻倍；击杀会重置冷却。',
        flavor: '最后一下，总是最安静的。'
      },
      heroicLeap: {
        id: 'heroicLeap', type: 'active', name: '英勇飞跃', icon: 'leap', rarity: 'rare',
        tag: '位移 · 范围', cost: 15, cooldown: 11,
        desc: (lv) => '跃向鼠标位置，落地造成 ' + Math.round(24 + lv * 3) + ' 点范围伤害，并使敌人减速 40%，持续 2 秒。',
        flavor: '战士从不走楼梯。'
      },
      bladestorm: {
        id: 'bladestorm', type: 'active', name: '剑刃风暴', icon: 'bladestorm', rarity: 'epic',
        tag: '范围 · 免疫', cost: 45, cooldown: 18,
        desc: (lv) => '化身剑刃风暴 2 秒，每 0.2 秒对周围敌人造成 ' + Math.round(14 + lv * 2.6) + ' 点伤害，期间免疫减速且可以移动。',
        flavor: '当世界安静下来，只剩刀刃在唱歌。'
      },
      ironHide: {
        id: 'ironHide', type: 'passive', name: '钢铁意志', icon: 'heart', rarity: 'rare', maxRank: 3,
        tag: '被动 · 生存',
        desc: (rank) => '最大生命值 +' + (rank * 12) + '%。',
        flavor: '伤痛只是铠甲上的另一道纹路。'
      },
      deepWounds: {
        id: 'deepWounds', type: 'passive', name: '重伤', icon: 'bleed', rarity: 'rare', maxRank: 3,
        tag: '被动 · 流血',
        desc: (rank) => '劈砍会使敌人流血，每秒造成 ' + (2 + rank * 2.5).toFixed(1) + ' 点伤害，持续 4 秒。',
        flavor: '伤口不会立刻要命，但会一直记得你。'
      },
      secondWind: {
        id: 'secondWind', type: 'passive', name: '第二次呼吸', icon: 'wind', rarity: 'rare', maxRank: 3,
        tag: '被动 · 回复',
        desc: (rank) => '3 秒未受到伤害后，每秒回复 ' + (0.8 + rank * 0.8).toFixed(1) + '% 最大生命值。',
        flavor: '还有一口气，就还能再战。'
      },
      bloodlust: {
        id: 'bloodlust', type: 'passive', name: '嗜血', icon: 'bloodlust', rarity: 'epic', maxRank: 3,
        tag: '被动 · 急速',
        desc: (rank) => '击杀敌人获得嗜血，攻击速度 +' + (rank * 10) + '%，持续 5 秒，最多叠加 3 层。',
        flavor: '鲜血是最好的燃料。'
      },
      thickSkin: {
        id: 'thickSkin', type: 'passive', name: '铜墙铁壁', icon: 'armor', rarity: 'rare', maxRank: 3,
        tag: '被动 · 减伤',
        desc: (rank) => '受到的伤害降低 ' + (rank * 5) + '%。',
        flavor: '让他们砍。砍得动算我输。'
      },
      victoryRush: {
        id: 'victoryRush', type: 'passive', name: '胜利在望', icon: 'victory', rarity: 'rare', maxRank: 3,
        tag: '被动 · 击杀回复',
        desc: (rank) => '击杀敌人时回复 ' + (rank * 3) + '% 最大生命值。',
        flavor: '赢家才有资格喘口气。'
      },
      bloodstorm: {
        id: 'bloodstorm', type: 'rune', name: '血风暴', icon: 'whirlwind', rarity: 'epic', maxRank: 1,
        tag: '流血',
        desc: () => '旋风斩与剑刃风暴命中流血目标时，伤害 +30%，刷新流血并回复 2 点怒气。',
        flavor: '让伤口在风里裂得更深。'
      },
      executioner: {
        id: 'executioner', type: 'rune', name: '处刑者', icon: 'execute', rarity: 'epic', maxRank: 1,
        tag: '斩杀',
        desc: () => '致死打击对流血目标视为低血量目标；击杀后重置冲锋冷却并回复 15 点怒气。',
        flavor: '血已经流了，剩下的只是收尾。'
      }
    },

    mage: {
      frostNova: {
        id: 'frostNova', type: 'active', name: '冰霜新星', icon: 'frost', rarity: 'rare',
        tag: '范围 · 冻结', cost: 20, cooldown: 9,
        desc: (lv) => '冻结周围敌人 1.6 秒，并造成 ' + Math.round(13 + lv * 2.5) + ' 点冰霜伤害。',
        flavor: '时间在零度以下会变得很慢。'
      },
      blink: {
        id: 'blink', type: 'active', name: '闪现', icon: 'blink', rarity: 'rare',
        tag: '位移 · 无敌', cost: 15, cooldown: 6,
        desc: () => '朝鼠标方向瞬移 110 距离，并获得 0.35 秒无敌。留下奥术残影。',
        flavor: '法师的撤退，也是一种艺术。'
      },
      arcaneExplosion: {
        id: 'arcaneExplosion', type: 'active', name: '魔爆术', icon: 'arcane', rarity: 'epic',
        tag: '范围 · 连爆', cost: 30, cooldown: 5,
        desc: (lv) => '连续释放 3 次奥术脉冲，每次对周围敌人造成 ' + Math.round(18 + lv * 2.5) + ' 点伤害。',
        flavor: '奥术从不讲究礼貌。'
      },
      iceBarrier: {
        id: 'iceBarrier', type: 'active', name: '寒冰护体', icon: 'icebarrier', rarity: 'rare',
        tag: '防御 · 护盾', cost: 25, cooldown: 12,
        desc: (lv) => '获得 ' + Math.round(45 + lv * 6) + ' 点护盾，持续 5 秒。护盾存在时，受到的伤害降低 10%。',
        flavor: '冰不会替你战斗，但会替你挨打。'
      },
      flamestrike: {
        id: 'flamestrike', type: 'active', name: '烈焰风暴', icon: 'flamestrike', rarity: 'epic',
        tag: '范围 · 延迟', cost: 40, cooldown: 10,
        desc: (lv) => '在鼠标位置降下火雨，0.8 秒后造成 ' + Math.round(42 + lv * 5) + ' 点范围伤害，并点燃敌人 3 秒。',
        flavor: '别站在火里。真的。'
      },
      pyroblast: {
        id: 'pyroblast', type: 'active', name: '炎爆术', icon: 'pyroblast', rarity: 'epic',
        tag: '爆发 · 爆炸', cost: 45, cooldown: 12,
        desc: (lv) => '发射一颗巨型火球，命中造成 ' + Math.round(50 + lv * 6) + ' 点伤害，并引爆周围敌人。',
        flavor: '有些问题，一发炎爆就能解决。'
      },
      arcaneIntellect: {
        id: 'arcaneIntellect', type: 'passive', name: '奥术智慧', icon: 'intellect', rarity: 'rare', maxRank: 3,
        tag: '被动 · 法力',
        desc: (rank) => '最大法力值 +' + (rank * 15) + '%，法力回复速度 +' + (rank * 1.2).toFixed(1) + '/秒。',
        flavor: '知识就是力量。法力也是。'
      },
      ignite: {
        id: 'ignite', type: 'passive', name: '点燃', icon: 'ignite', rarity: 'rare', maxRank: 3,
        tag: '被动 · 灼烧',
        desc: (rank) => '火焰法术会使敌人燃烧，每秒造成 ' + (2 + rank * 2.2).toFixed(1) + ' 点伤害，持续 3 秒。',
        flavor: '火球术只是打招呼的方式。'
      },
      iceShards: {
        id: 'iceShards', type: 'passive', name: '寒冰碎片', icon: 'iceshard', rarity: 'rare', maxRank: 3,
        tag: '被动 · 减速',
        desc: (rank) => '冰霜法术会使敌人减速 ' + (15 + rank * 10) + '%，持续 2.5 秒。',
        flavor: '冷到骨头里，就跑不快了。'
      },
      temporalFlux: {
        id: 'temporalFlux', type: 'passive', name: '时间加速', icon: 'time', rarity: 'epic', maxRank: 3,
        tag: '被动 · 冷却',
        desc: (rank) => '所有技能冷却时间缩短 ' + (rank * 8) + '%。',
        flavor: '迟到是凡人的烦恼。'
      },
      barrierMastery: {
        id: 'barrierMastery', type: 'passive', name: '屏障精通', icon: 'barrier', rarity: 'rare', maxRank: 3,
        tag: '被动 · 护盾',
        desc: (rank) => '护盾效果提高 ' + (rank * 25) + '%，持续时间延长 ' + rank + ' 秒。',
        flavor: '让冰再厚一点。再厚一点。'
      },
      manaSurge: {
        id: 'manaSurge', type: 'passive', name: '法力涌动', icon: 'mana', rarity: 'rare', maxRank: 3,
        tag: '被动 · 回蓝',
        desc: (rank) => '法术每命中一个敌人，回复 ' + (rank * 1.5).toFixed(1) + ' 点法力。',
        flavor: '奥术会回馈那些懂得索取的人。'
      },
      fireballMastery: {
        id: 'fireballMastery', type: 'passive', name: '火球精通', icon: 'fireball', rarity: 'rare', maxRank: 3,
        tag: '被动 · 普攻',
        desc: (rank) => '火球术伤害 +' + (rank * 22) + '%，火球体积 +' + (rank * 18) + '%。',
        flavor: '更大的火球，解决更多的问题。'
      },
      rapidCasting: {
        id: 'rapidCasting', type: 'passive', name: '急速咏唱', icon: 'time', rarity: 'rare', maxRank: 3,
        tag: '被动 · 普攻',
        desc: (rank) => '火球术攻击速度 +' + (rank * 16) + '%。',
        flavor: '咒语还没落地，下一发已经在手上。'
      },
      splitFire: {
        id: 'splitFire', type: 'passive', name: '分裂火球', icon: 'arcane', rarity: 'epic', maxRank: 2,
        tag: '被动 · 普攻',
        desc: (rank) => '火球术额外发射 ' + rank + ' 枚分裂火球，每枚造成 62% 伤害。',
        flavor: '一颗火球是问候，三颗就是回答。'
      },
      shatter: {
        id: 'shatter', type: 'rune', name: '碎冰', icon: 'iceshard', rarity: 'epic', maxRank: 1,
        tag: '冰火',
        desc: () => '火焰伤害击中被冻结的敌人时，碎冰造成 +50% 伤害并解除冻结。',
        flavor: '冰与火之间，没有中间地带。'
      },
      steam: {
        id: 'steam', type: 'rune', name: '元素回响', icon: 'ignite', rarity: 'epic', maxRank: 1,
        tag: '冰火',
        desc: () => '冰霜伤害命中燃烧目标时触发蒸汽爆炸，伤害 +35% 并刷新燃烧。',
        flavor: '一场爆炸，往往从温差开始。'
      }
    },
    priest: {
      holyFire: {
        id: 'holyFire', type: 'active', name: '神圣之火', icon: 'holyfire', rarity: 'epic',
        tag: '神圣 · 灼烧', cost: 25, cooldown: 7.5,
        desc: (lv) => '发射圣光火球，造成 ' + Math.round(30 + lv * 4.5) + ' 点神圣伤害，并灼烧 3 秒。',
        flavor: '圣光也会燃烧。'
      },
      powerWordShield: {
        id: 'powerWordShield', type: 'active', name: '真言术：盾', icon: 'pwshield', rarity: 'rare',
        tag: '神圣 · 护盾', cost: 22, cooldown: 11,
        desc: (lv) => '获得相当于最大生命 ' + (26 + lv) + '% 的护盾，持续 5 秒。',
        flavor: '一句真言，足以挡下刀锋。'
      },
      renew: {
        id: 'renew', type: 'active', name: '恢复', icon: 'renew', rarity: 'rare',
        tag: '神圣 · 持续治疗', cost: 18, cooldown: 9,
        desc: (lv) => '在 8 秒内每秒回复 ' + (4 + lv * .8).toFixed(1) + ' 点生命；治疗量受信仰恢复加成。',
        flavor: '伤口会在光里慢慢合拢。'
      },
      holyNova: {
        id: 'holyNova', type: 'active', name: '神圣新星', icon: 'holynova', rarity: 'epic',
        tag: '范围 · 治疗', cost: 35, cooldown: 9,
        desc: (lv) => '对周围敌人造成 ' + Math.round(24 + lv * 3) + ' 点神圣伤害，并回复 ' + Math.round(10 + lv * 1.5) + ' 点生命；恢复期间治疗量 +50%。',
        flavor: '圣光从不只照亮一个方向。'
      },
      flashHeal: {
        id: 'flashHeal', type: 'active', name: '快速治疗', icon: 'flashheal', rarity: 'rare',
        tag: '治疗 · 爆发', cost: 28, cooldown: 8,
        desc: (lv) => '立即回复 ' + Math.round(30 + lv * 2.2) + '% 最大生命值。',
        flavor: '有时候，慢一步就来不及了。'
      },
      penance: {
        id: 'penance', type: 'active', name: '苦修', icon: 'penance', rarity: 'epic',
        tag: '爆发 · 神圣', cost: 35, cooldown: 9,
        desc: (lv) => '向鼠标方向射出三道扇形圣光，每道造成 ' + Math.round(15 + lv * 1.8) + ' 点神圣伤害并回复 ' + Math.round(5 + lv * .5) + ' 点生命；施放不减速，可以边走边打。',
        flavor: '赎罪不是终点，是下一道光。'
      },
      atonement: {
        id: 'atonement', type: 'passive', name: '救赎', icon: 'absolution', rarity: 'rare', maxRank: 3,
        tag: '被动 · 救赎',
        desc: (rank) => '神圣伤害的 ' + (8 + rank * 4) + '% 转化为自身治疗。',
        flavor: '你造成的每一道光，也会照回自己。'
      },
      spiritTap: {
        id: 'spiritTap', type: 'passive', name: '精神指引', icon: 'spirit', rarity: 'rare', maxRank: 3,
        tag: '被动 · 法力',
        desc: (rank) => '法力回复速度 +' + (rank * 1.5).toFixed(1) + '/秒，最大法力 +' + (rank * 8) + '%。',
        flavor: '静下来，光会告诉你方向。'
      },
      innerFire: {
        id: 'innerFire', type: 'passive', name: '心灵之火', icon: 'innerfire', rarity: 'rare', maxRank: 3,
        tag: '被动 · 神圣',
        desc: (rank) => '神圣伤害 +' + (rank * 7) + '%。',
        flavor: '信念越坚定，光越炽热。'
      },
      renewedFaith: {
        id: 'renewedFaith', type: 'passive', name: '信仰恢复', icon: 'renew', rarity: 'rare', maxRank: 3,
        tag: '被动 · 治疗',
        desc: (rank) => '所有治疗量 +' + (rank * 15) + '%，恢复持续时间 +' + rank + ' 秒。',
        flavor: '光会记得每一个没有放弃的人。'
      },
      focusedWill: {
        id: 'focusedWill', type: 'passive', name: '专注意志', icon: 'heal', rarity: 'rare', maxRank: 3,
        tag: '被动 · 减伤',
        desc: (rank) => '受到伤害后 4 秒内减伤 ' + (rank * 6) + '%。',
        flavor: '疼痛让人清醒，也让人专注。'
      },
      benediction: {
        id: 'benediction', type: 'rune', name: '祝福', icon: 'heal', rarity: 'epic', maxRank: 1,
        tag: '恢复 · 神圣',
        desc: () => '恢复每跳使神圣之火冷却 -0.5 秒；恢复期间神圣伤害 +12%。',
        flavor: '每一次愈合，都在为下一次燃烧倒数。'
      },
      sanctified: {
        id: 'sanctified', type: 'rune', name: '圣化', icon: 'holynova', rarity: 'epic', maxRank: 1,
        tag: '恢复 · 神圣',
        desc: () => '神圣新星对带有恢复的目标额外治疗 35%，并延长恢复 2 秒。',
        flavor: '把光留在伤口上，也留在战场上。'
      }
    }
  };

  const GENERIC_SKILLS = {
    vitality: {
      id: 'vitality', type: 'passive', name: '冒险者的坚韧', icon: 'heart', rarity: 'common', maxRank: 99,
      tag: '被动 · 通用',
      desc: () => '最大生命值 +12，并立即回复 12 点生命值。',
      flavor: '活着，才有下一件战利品。'
    },
    sharpened: {
      id: 'sharpened', type: 'passive', name: '磨砺', icon: 'sharp', rarity: 'common', maxRank: 99,
      tag: '被动 · 通用',
      desc: () => '造成的所有伤害 +6%。',
      flavor: '钝刀也能磨快。'
    },
    swiftness: {
      id: 'swiftness', type: 'passive', name: '迅捷', icon: 'boot', rarity: 'common', maxRank: 99,
      tag: '被动 · 通用',
      desc: () => '移动速度 +5%。',
      flavor: '打不过，至少跑得过。'
    }
  };

  const DUNGEONS = [
    {
      id: 'deadmines',
      index: 1,
      name: '死亡矿井',
      en: 'THE DEADMINES',
      subtitle: '迪菲亚兄弟会的秘密据点',
      intro: '潮湿的矿道深处，火药味和贪婪一同发酵。迪菲亚兄弟会正在策划下一场叛乱。',
      objective: '击败埃德温·范克里夫',
      theme: {
        name: 'mine',
        floor: ['#3b2d21', '#463528', '#32261d', '#4c3a2b'],
        grout: '#1c130d',
        wallTop: '#6d4e32', wallSide: '#4a3323', wallDark: '#281a11',
        accent: '#e6a644', glow: '#ffb347', fog: 'rgba(24, 14, 7, 0.34)',
        dust: '#d7b47a', danger: '#e8583f'
      },
      mobs: {
        pirate: { name: '迪菲亚劫掠者', sprite: 'pirate', ai: 'melee', hp: 54, dmg: 9, speed: 57, radius: 10, xp: 14, scale: 1.05 },
        miner: { name: '迪菲亚矿工', sprite: 'miner', ai: 'ranged', hp: 42, dmg: 8, speed: 45, radius: 9, xp: 15, scale: 1, projectile: 'dynamite' },
        cutthroat: { name: '迪菲亚刺客', sprite: 'pirate', ai: 'swarm', hp: 30, dmg: 7, speed: 108, radius: 7, xp: 8, scale: .76, aura: '#ff7b5b' },
        foreman: { name: '迪菲亚工头', sprite: 'miner', ai: 'brute', hp: 150, dmg: 18, speed: 35, radius: 13, xp: 32, scale: 1.32, aura: '#ffb15b' },
        powder: { name: '火药矿工', sprite: 'miner', ai: 'bomber', hp: 38, dmg: 24, speed: 82, radius: 8, xp: 12, scale: .88, aura: '#ff5b3a' },
        captain: { name: '迪菲亚头目', sprite: 'pirate', ai: 'charger', hp: 190, dmg: 16, speed: 78, radius: 11, xp: 45, scale: 1.2, elite: true, aura: '#ffd36a' }
      },
      boss: {
        name: '埃德温·范克里夫', title: '迪菲亚兄弟会首领', sprite: 'vancleef',
        hp: 790, dmg: 19, speed: 61, radius: 23, xp: 110, scale: 1.72,
        specials: ['slam', 'summon', 'charge'],
        specialNames: { slam: '剑刃突袭', summon: '呼叫兄弟', charge: '致命冲锋' },
        quote: '“兄弟们，让这些入侵者见识一下迪菲亚的怒火！”',
        phaseLine: '“你们以为这就结束了？”'
      }
    },
    {
      id: 'wailing',
      index: 2,
      name: '哀嚎洞穴',
      en: 'THE WAILING CAVERNS',
      subtitle: '毒雾笼罩的失落巢穴',
      intro: '洞穴在低语。毒雾缠绕着潮湿的岩壁，鱼人先知穆托斯从漫长的沉睡中醒来。',
      objective: '击败唤醒者穆托斯',
      theme: {
        name: 'cave',
        floor: ['#263c33', '#2e4a3d', '#1f332a', '#375544'],
        grout: '#12221b',
        wallTop: '#456c53', wallSide: '#2d4b3a', wallDark: '#182b21',
        accent: '#69d39a', glow: '#71ffc0', fog: 'rgba(7, 25, 18, 0.38)',
        dust: '#8de0b2', danger: '#b7e54f'
      },
      mobs: {
        raptor: { name: '洞穴迅猛龙', sprite: 'raptor', ai: 'charger', hp: 50, dmg: 10, speed: 70, radius: 10, xp: 15, scale: 1 },
        druid: { name: '堕落德鲁伊', sprite: 'druid', ai: 'ranged', hp: 46, dmg: 9, speed: 46, radius: 10, xp: 16, scale: 1.02, projectile: 'poison' },
        caveStalker: { name: '洞穴潜伏者', sprite: 'raptor', ai: 'melee', hp: 48, dmg: 9, speed: 60, radius: 10, xp: 14, scale: .96, aura: '#8de0b2' },
        spawnling: { name: '孢子幼体', sprite: 'druid', ai: 'swarm', hp: 28, dmg: 7, speed: 100, radius: 7, xp: 9, scale: .7, aura: '#b7e54f' },
        murlocBrute: { name: '鱼人暴徒', sprite: 'raptor', ai: 'brute', hp: 155, dmg: 18, speed: 34, radius: 13, xp: 33, scale: 1.3, aura: '#71ffc0' },
        toxicBomber: { name: '毒囊行者', sprite: 'druid', ai: 'bomber', hp: 40, dmg: 25, speed: 80, radius: 8, xp: 13, scale: .9, aura: '#b7e54f' },
        raptorAlpha: { name: '洞穴暴龙', sprite: 'raptor', ai: 'charger', hp: 210, dmg: 18, speed: 84, radius: 12, xp: 46, scale: 1.28, elite: true, aura: '#ffdd7a' }
      },
      boss: {
        name: '唤醒者穆托斯', title: '哀嚎洞穴的古老先知', sprite: 'mutanus',
        hp: 980, dmg: 21, speed: 52, radius: 26, xp: 130, scale: 1.85,
        specials: ['ring', 'slam', 'summon'],
        specialNames: { ring: '毒液喷发', slam: '深海重击', summon: '唤醒鱼人' },
        quote: '“咕噜……沉睡的洞穴，不容打扰！”',
        phaseLine: '“潮水……会吞没你们！”'
      }
    },
    {
      id: 'shadowfang',
      index: 3,
      name: '影牙城堡',
      en: 'SHADOWFANG KEEP',
      subtitle: '被诅咒的月光堡垒',
      intro: '月光照不进这座城堡。狼人的嚎叫和亡者的低语，在阿鲁高的暗影魔法中交织。',
      objective: '击败大法师阿鲁高',
      theme: {
        name: 'keep',
        floor: ['#292e44', '#353b57', '#202435', '#404866'],
        grout: '#12141f',
        wallTop: '#5a6085', wallSide: '#3c425f', wallDark: '#202334',
        accent: '#93a9e8', glow: '#b8c7ff', fog: 'rgba(9, 11, 24, 0.42)',
        dust: '#b5c3ff', danger: '#8f7dff'
      },
      mobs: {
        worgen: { name: '影牙狼人', sprite: 'worgen', ai: 'charger', hp: 62, dmg: 11, speed: 68, radius: 10, xp: 17, scale: 1.05 },
        ghost: { name: '城堡怨灵', sprite: 'ghost', ai: 'ranged', hp: 48, dmg: 10, speed: 44, radius: 9, xp: 18, scale: 1, projectile: 'shadow' },
        castleGuard: { name: '城堡守卫', sprite: 'worgen', ai: 'melee', hp: 70, dmg: 12, speed: 55, radius: 10, xp: 19, scale: 1.05, aura: '#93a9e8' },
        shadowHound: { name: '影牙猎犬', sprite: 'worgen', ai: 'swarm', hp: 34, dmg: 8, speed: 112, radius: 8, xp: 10, scale: .78, aura: '#93a9e8' },
        shadowBomber: { name: '暗影爆裂者', sprite: 'ghost', ai: 'bomber', hp: 40, dmg: 24, speed: 82, radius: 8, xp: 14, scale: .9, aura: '#8f7dff' },
        amalgam: { name: '怨灵聚合体', sprite: 'ghost', ai: 'brute', hp: 170, dmg: 19, speed: 33, radius: 13, xp: 35, scale: 1.35, aura: '#8f7dff' },
        banshee: { name: '哀嚎女妖', sprite: 'ghost', ai: 'ranged', hp: 55, dmg: 11, speed: 50, radius: 9, xp: 18, scale: .95, projectile: 'shadow', aura: '#b8c7ff' },
        cursedKnight: { name: '被诅咒的骑士', sprite: 'worgen', ai: 'charger', hp: 220, dmg: 19, speed: 76, radius: 12, xp: 48, scale: 1.22, elite: true, aura: '#b8c7ff' }
      },
      boss: {
        name: '大法师阿鲁高', title: '影牙城堡的诅咒之源', sprite: 'arugal',
        hp: 1180, dmg: 23, speed: 54, radius: 23, xp: 150, scale: 1.8,
        specials: ['ring', 'summon', 'slam'],
        specialNames: { ring: '暗影箭雨', summon: '召唤狼人', slam: '虚空冲击' },
        quote: '“月光之下，没有无辜者。”',
        phaseLine: '“让诅咒，再次蔓延！”'
      }
    },
    {
      id: 'blackrock',
      index: 4,
      name: '黑石深渊',
      en: 'BLACKROCK DEPTHS',
      subtitle: '熔火与铁锤的地底王国',
      intro: '黑铁矮人的熔炉从未熄灭。滚烫的岩浆在铁链下翻涌，索瑞森皇帝的锤声越来越近。',
      objective: '击败达格兰·索瑞森',
      theme: {
        name: 'forge',
        floor: ['#3b241e', '#472a22', '#2b1915', '#543128'],
        grout: '#170c09',
        wallTop: '#744131', wallSide: '#502b23', wallDark: '#29140f',
        accent: '#ff7b39', glow: '#ff5b2a', fog: 'rgba(25, 8, 5, 0.4)',
        dust: '#ffb079', danger: '#ff4d32'
      },
      mobs: {
        darkiron: { name: '黑铁守卫', sprite: 'darkiron', ai: 'melee', hp: 72, dmg: 12, speed: 54, radius: 10, xp: 19, scale: 1.08 },
        shaman: { name: '黑铁火祭司', sprite: 'shaman', ai: 'ranged', hp: 54, dmg: 11, speed: 44, radius: 10, xp: 20, scale: 1.02, projectile: 'fire' },
        imp: { name: '黑铁小鬼', sprite: 'shaman', ai: 'swarm', hp: 30, dmg: 8, speed: 110, radius: 7, xp: 10, scale: .7, aura: '#ff7b39' },
        golem: { name: '熔火傀儡', sprite: 'darkiron', ai: 'brute', hp: 230, dmg: 22, speed: 29, radius: 15, xp: 42, scale: 1.45, aura: '#ff5b2a' },
        fireBomber: { name: '火药投手', sprite: 'shaman', ai: 'bomber', hp: 45, dmg: 28, speed: 78, radius: 8, xp: 15, scale: .9, aura: '#ff4d32' },
        darkCaptain: { name: '黑铁队长', sprite: 'darkiron', ai: 'charger', hp: 260, dmg: 21, speed: 74, radius: 12, xp: 52, scale: 1.25, elite: true, aura: '#ffd36a' }
      },
      boss: {
        name: '达格兰·索瑞森', title: '黑铁矮人皇帝', sprite: 'thaurissan',
        hp: 1420, dmg: 26, speed: 55, radius: 26, xp: 170, scale: 1.9,
        specials: ['slam', 'ring', 'summon'],
        specialNames: { slam: '熔岩重锤', ring: '火焰新星', summon: '黑铁援军' },
        quote: '“黑石的烈焰，将熔尽你们的骨头！”',
        phaseLine: '“燃烧吧！整座深渊都在燃烧！”'
      }
    },
    {
      id: 'icecrown',
      index: 5,
      name: '冰冠堡垒',
      en: 'ICECROWN CITADEL',
      subtitle: '王座之上的最终寒冬',
      intro: '风暴在尖塔间呜咽。霜之哀伤的低鸣穿过冰封的王座，巫妖王正在等待最后一位挑战者。',
      objective: '击败巫妖王',
      theme: {
        name: 'ice',
        floor: ['#23374d', '#2c4563', '#1b2c40', '#385677'],
        grout: '#0e1b28',
        wallTop: '#4f789c', wallSide: '#33526e', wallDark: '#172b3d',
        accent: '#8ddcff', glow: '#6fe6ff', fog: 'rgba(5, 15, 28, 0.44)',
        dust: '#bcefff', danger: '#6fd9ff'
      },
      mobs: {
        ghoul: { name: '冰冠食尸鬼', sprite: 'ghoul', ai: 'melee', hp: 82, dmg: 13, speed: 58, radius: 10, xp: 22, scale: 1.08 },
        valkyr: { name: '瓦格里缚魂者', sprite: 'valkyr', ai: 'ranged', hp: 60, dmg: 12, speed: 48, radius: 10, xp: 23, scale: 1.03, projectile: 'frost' },
        geist: { name: '冰冠游魂', sprite: 'ghoul', ai: 'swarm', hp: 38, dmg: 9, speed: 115, radius: 8, xp: 11, scale: .78, aura: '#bcefff' },
        abomination: { name: '冰冠憎恶', sprite: 'ghoul', ai: 'brute', hp: 260, dmg: 24, speed: 28, radius: 15, xp: 45, scale: 1.48, aura: '#6fe6ff' },
        frostBomber: { name: '霜爆侍从', sprite: 'valkyr', ai: 'bomber', hp: 48, dmg: 30, speed: 80, radius: 8, xp: 16, scale: .9, aura: '#6fd9ff' },
        deathKnight: { name: '死亡骑士', sprite: 'ghoul', ai: 'charger', hp: 300, dmg: 23, speed: 72, radius: 12, xp: 58, scale: 1.28, elite: true, aura: '#bcefff' }
      },
      boss: {
        name: '巫妖王', title: '冰冠堡垒之主', sprite: 'lichking',
        hp: 1720, dmg: 29, speed: 53, radius: 27, xp: 220, scale: 1.92,
        specials: ['ring', 'slam', 'summon', 'charge'],
        specialNames: { ring: '寒冰之环', slam: '霜之哀伤', summon: '亡者归来', charge: '死亡冲锋' },
        quote: '“霜之哀伤……已经等不及了。”',
        phaseLine: '“凡人，你的挣扎毫无意义。”'
      }
    }
  ];

  const WAVE_TOTAL = 3;

  const BALANCE = {
    xpCurve: (level) => Math.round(38 + Math.pow(level, 2.05) * 18),
    levelHp: 0.08,
    levelDamage: 0.085,
    mobHpPerStage: 0.24,
    mobDamagePerStage: 0.17,
    bossHpPerStage: 0.23,
    bossDamagePerStage: 0.14,
    chestChance: 0.025,
    bossChestChance: 1,
    maxActives: 4
  };

  const RARITY = {
    common: { label: '普通', color: '#aebbc4' },
    rare: { label: '稀有', color: '#5ab0ff' },
    epic: { label: '史诗', color: '#c77dff' }
  };

  window.GameData = {
    CLASSES, SKILLS, GENERIC_SKILLS, DUNGEONS, RARITY, BALANCE, WAVE_TOTAL,
    getSkill(classId, id) {
      return (SKILLS[classId] && SKILLS[classId][id]) || GENERIC_SKILLS[id] || null;
    }
  };
})();

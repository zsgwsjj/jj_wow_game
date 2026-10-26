/* =========================================================
   艾泽拉斯：裂隙远征 — 游戏数据
   魔兽世界同人像素肉鸽 · 无外部依赖
   ========================================================= */
(function () {
  'use strict';

  const CLASSES = {
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
      resourceRegen: 8.5,
      startResource: 100,
      armor: 0,
      speed: 92,
      startingAbility: 'frostNova',
      fixedSkills: ['frostNova', 'blink', 'flamestrike', 'iceBarrier'],
      basic: {
        name: '火球术',
        icon: 'fireball',
        desc: '向鼠标方向发射一枚火球，命中敌人后造成火焰伤害。',
        damage: 16,
        cooldown: 0.42,
        speed: 310
      },
      stats: [
        { label: '生存', value: 2 },
        { label: '爆发', value: 5 },
        { label: '机动', value: 4 }
      ]
    },
  };

  const SKILLS = {
    mage: {
      frostNova: {
        id: 'frostNova', type: 'active', name: '冰霜新星', icon: 'frost', rarity: 'rare',
        tag: '范围 · 冻结', cost: 18, cooldown: 7,
        desc: (lv) => '冻结周围敌人 1.6 秒，并造成 ' + Math.round(13 + lv * 2.5) + ' 点冰霜伤害。',
        flavor: '时间在零度以下会变得很慢。'
      },
      blink: {
        id: 'blink', type: 'active', name: '闪现', icon: 'blink', rarity: 'rare',
        tag: '位移 · 无敌', cost: 12, cooldown: 5,
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
        tag: '防御 · 护盾', cost: 22, cooldown: 10,
        desc: (lv) => '获得 ' + Math.round(45 + lv * 6) + ' 点护盾，持续 5 秒。护盾存在时，受到的伤害降低 10%。',
        flavor: '冰不会替你战斗，但会替你挨打。'
      },
      flamestrike: {
        id: 'flamestrike', type: 'active', name: '烈焰风暴', icon: 'flamestrike', rarity: 'epic',
        tag: '范围 · 延迟', cost: 35, cooldown: 8,
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
  };

  const SKILL_UPGRADES = {
    frostNova: {
      a: {
        name: '寒冰脉冲', icon: 'frost', tag: '冰霜新星 · 范围',
        flavor: '把寒意压缩成一次更远的爆发。',
        tiers: [
          '半径 +22%，伤害 +20%。',
          '对已冻结目标伤害 +35%，并刷新冻结。'
        ]
      },
      b: {
        name: '深寒', icon: 'frost', tag: '冰霜新星 · 控制',
        flavor: '冷到连时间都不愿意流动。',
        tiers: [
          '冻结时间 +0.6 秒，减速 +15%。',
          '每命中一个敌人，冰霜新星冷却 -1.2 秒（最多 3 个）。'
        ]
      }
    },
    blink: {
      a: {
        name: '远行', icon: 'blink', tag: '闪现 · 距离',
        flavor: '再远一点，就够不到你了。',
        tiers: [
          '闪现距离 +30%。',
          '闪现后 1.5 秒内移动速度 +25%。'
        ]
      },
      b: {
        name: '迅影', icon: 'blink', tag: '闪现 · 节奏',
        flavor: '快到来不及留下影子。',
        tiers: [
          '冷却 -25%。',
          '闪现回复 15 点法力。'
        ]
      }
    },
    flamestrike: {
      a: {
        name: '灼热大地', icon: 'flamestrike', tag: '烈焰风暴 · 燃烧',
        flavor: '火雨之后，大地还在燃烧。',
        tiers: [
          '半径 +18%，燃烧时间 +2 秒。',
          '燃烧伤害 +50%。'
        ]
      },
      b: {
        name: '集中轰击', icon: 'flamestrike', tag: '烈焰风暴 · 爆发',
        flavor: '把整片火雨收束成一个落点。',
        tiers: [
          '半径 -10%，伤害 +35%。',
          '冷却 -20%。'
        ]
      }
    },
    iceBarrier: {
      a: {
        name: '坚冰', icon: 'icebarrier', tag: '寒冰护体 · 护盾',
        flavor: '冰不是挡住伤害，是让伤害变得迟钝。',
        tiers: [
          '护盾量 +30%。',
          '护盾存在时额外减伤 8%。'
        ]
      },
      b: {
        name: '持久', icon: 'icebarrier', tag: '寒冰护体 · 持续',
        flavor: '让这层冰，留得再久一点。',
        tiers: [
          '持续时间 +2 秒。',
          '护盾存在时移动速度 +10%。'
        ]
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

  const BOSS_RELICS = [
    {
      id: 'bloodPact', type: 'relic', name: '鲜血契约', icon: 'heart', rarity: 'relic',
      tag: '首领遗物 · 伤害', flavor: '以血为墨，写下更锋利的名字。',
      desc: () => '伤害 +25%，最大生命 -15%；造成直接伤害时回复 3% 生命。'
    },
    {
      id: 'ironBulwark', type: 'relic', name: '不屈壁垒', icon: 'shield', rarity: 'relic',
      tag: '首领遗物 · 生存', flavor: '城墙会倒，守墙的人不会。',
      desc: () => '最大生命 +20%，减伤 +8%，移动速度 -8%。'
    },
    {
      id: 'stormEye', type: 'relic', name: '风暴之眼', icon: 'wind', rarity: 'relic',
      tag: '首领遗物 · 范围', flavor: '风暴的中心，反而最安静。',
      desc: () => '范围技能半径 +25%，范围伤害 +10%。'
    },
    {
      id: 'arcaneOverload', type: 'relic', name: '奥术过载', icon: 'arcane', rarity: 'relic',
      tag: '首领遗物 · 法术', flavor: '把安全阈值拨到红线之外。',
      desc: () => '伤害 +18%，技能冷却 -10%，技能消耗 +15%。'
    },
    {
      id: 'fateDie', type: 'relic', name: '命运之骰', icon: 'time', rarity: 'relic',
      tag: '首领遗物 · 选择', flavor: '骰子落地前，命运仍有第二种写法。',
      desc: () => '立即获得 1 次三选一刷新机会。'
    }
  ];

  const CURSES = [
    {
      id: 'reckless', type: 'curse', name: '狂徒', icon: 'bloodlust', rarity: 'curse',
      tag: '诅咒 · 速度', flavor: '疼痛只是提醒你，还活着。',
      desc: () => '攻击速度 +35%，最大生命 -25%。'
    },
    {
      id: 'glassCannon', type: 'curse', name: '玻璃大炮', icon: 'sharp', rarity: 'curse',
      tag: '诅咒 · 伤害', flavor: '打出最重的一拳，也别让人碰到你。',
      desc: () => '伤害 +45%，受到的伤害 +25%。'
    },
    {
      id: 'manaBurn', type: 'curse', name: '法力灼烧', icon: 'mana', rarity: 'curse',
      tag: '诅咒 · 法术', flavor: '法力在血管里沸腾，烧出更亮的火花。',
      desc: () => '伤害 +30%，技能消耗 +20%。'
    },
    {
      id: 'desperate', type: 'curse', name: '孤注一掷', icon: 'execute', rarity: 'curse',
      tag: '诅咒 · 低血量', flavor: '退路越窄，刀锋越利。',
      desc: () => '生命低于 30% 时伤害 +50%，治疗 -30%。'
    }
  ];

  const BALANCE = {
    xpCurve: (level) => Math.round(38 + Math.pow(level, 2.05) * 18),
    levelHp: 0.08,
    levelDamage: 0.085,
    mobHpPerStage: 0.24,
    mobDamagePerStage: 0.17,
    bossHpPerStage: 0.23,
    bossDamagePerStage: 0.14,
    chestChance: 0.035,
    bossChestChance: 1,
    maxActives: 4
  };

  const RARITY = {
    common: { label: '普通', color: '#aebbc4' },
    rare: { label: '稀有', color: '#5ab0ff' },
    epic: { label: '史诗', color: '#c77dff' },
    relic: { label: '首领遗物', color: '#e5b96e' },
    curse: { label: '诅咒交易', color: '#e2645b' }
  };

  window.GameData = {
    CLASSES, SKILLS, GENERIC_SKILLS, SKILL_UPGRADES, DUNGEONS, RARITY, BALANCE, WAVE_TOTAL, BOSS_RELICS, CURSES,
    getSkill(classId, id) {
      return (SKILLS[classId] && SKILLS[classId][id]) || GENERIC_SKILLS[id] || null;
    }
  };
})();

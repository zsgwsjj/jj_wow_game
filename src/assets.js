/* =========================================================
   艾泽拉斯：裂隙远征 — 本地化图标资源
   技能 / 职业 / 首领图标来源：Wowhead 图标库（Blizzard 官方图标资源）
   仅用于非商业同人演示。
   ========================================================= */
(function () {
  'use strict';

  const icons = {
    cleave: 'assets/icons/cleave.jpg',
    charge: 'assets/icons/charge.jpg',
    whirlwind: 'assets/icons/whirlwind.jpg',
    shield: 'assets/icons/shield.jpg',
    execute: 'assets/icons/execute.jpg',
    leap: 'assets/icons/leap.jpg',
    bladestorm: 'assets/icons/bladestorm.jpg',
    heart: 'assets/icons/heart.jpg',
    bleed: 'assets/icons/bleed.jpg',
    wind: 'assets/icons/wind.jpg',
    bloodlust: 'assets/icons/bloodlust.jpg',
    armor: 'assets/icons/armor.jpg',
    victory: 'assets/icons/victory.jpg',
    frost: 'assets/icons/frost.jpg',
    blink: 'assets/icons/blink.jpg',
    arcane: 'assets/icons/arcane.jpg',
    icebarrier: 'assets/icons/icebarrier.jpg',
    flamestrike: 'assets/icons/flamestrike.jpg',
    pyroblast: 'assets/icons/pyroblast.jpg',
    fireball: 'assets/icons/fireball.jpg',
    intellect: 'assets/icons/intellect.jpg',
    ignite: 'assets/icons/ignite.jpg',
    iceshard: 'assets/icons/iceshard.jpg',
    time: 'assets/icons/time.jpg',
    barrier: 'assets/icons/barrier.jpg',
    mana: 'assets/icons/mana.jpg',
    sharp: 'assets/icons/sharp.jpg',
    boot: 'assets/icons/boot.jpg',
    summon: 'assets/icons/summon.jpg',
    chest: 'assets/icons/chest.jpg',
    skull: 'assets/icons/skull.jpg',
    achievement: 'assets/icons/achievement.jpg',
    holybolt: 'assets/icons/holybolt.jpg',
    holyfire: 'assets/icons/holyfire.jpg',
    pwshield: 'assets/icons/pwshield.jpg',
    renew: 'assets/icons/renew.jpg',
    holynova: 'assets/icons/holynova.jpg',
    flashheal: 'assets/icons/flashheal.jpg',
    penance: 'assets/icons/penance.jpg',
    spirit: 'assets/icons/spirit.jpg',
    innerfire: 'assets/icons/innerfire.jpg',
    heal: 'assets/icons/heal.jpg',
    absolution: 'assets/icons/absolution.jpg'
  };

  const classes = {
    mage: 'assets/classes/mage.jpg'
  };

  const bosses = {
    vancleef: 'assets/bosses/vancleef.jpg',
    mutanus: 'assets/bosses/mutanus.jpg',
    arugal: 'assets/bosses/arugal.jpg',
    thaurissan: 'assets/bosses/thaurissan.jpg',
    lichking: 'assets/bosses/lichking.jpg'
  };

  const loaded = new Set();
  function preload() {
    const all = [].concat(Object.values(icons), Object.values(classes), Object.values(bosses));
    for (const src of all) {
      if (loaded.has(src)) continue;
      loaded.add(src);
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    }
  }

  window.GameAssets = {
    icons,
    classes,
    bosses,
    preload,
    icon(name) { return icons[name] || null; },
    classCrest(id) { return classes[id] || null; },
    bossPortrait(sprite) { return bosses[sprite] || null; }
  };
})();

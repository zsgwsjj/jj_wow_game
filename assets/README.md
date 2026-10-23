# 图标资源说明

本目录中的技能、职业与首领图标来自 **Wowhead 图标库**（`wow.zamimg.com/images/wow/icons/large/`），其原始图标资源版权归 **Blizzard Entertainment** 所有。

本项目为非商业性质的魔兽世界同人作品，图标仅用于游戏界面演示与学习用途，不包含任何付费或商业分发。游戏场景、角色、特效、像素 UI 纹理与音效均由本项目代码生成。

## 映射

### 技能 / 天赋

| 游戏图标键 | 文件 | 原始图标 |
| --- | --- | --- |
| cleave | `icons/cleave.jpg` | ability_warrior_cleave |
| charge | `icons/charge.jpg` | ability_warrior_charge |
| whirlwind | `icons/whirlwind.jpg` | ability_whirlwind |
| shield | `icons/shield.jpg` | ability_defend |
| execute | `icons/execute.jpg` | inv_sword_48 |
| leap | `icons/leap.jpg` | ability_heroicleap |
| bladestorm | `icons/bladestorm.jpg` | ability_warrior_bladestorm |
| heart | `icons/heart.jpg` | ability_warrior_shieldwall |
| bleed | `icons/bleed.jpg` | ability_warrior_bloodbath |
| wind | `icons/wind.jpg` | ability_hunter_harass |
| bloodlust | `icons/bloodlust.jpg` | spell_nature_bloodlust |
| armor | `icons/armor.jpg` | ability_warrior_shieldmastery |
| victory | `icons/victory.jpg` | ability_warrior_devastate |
| frost | `icons/frost.jpg` | spell_frost_frostnova |
| blink | `icons/blink.jpg` | spell_arcane_blink |
| arcane | `icons/arcane.jpg` | spell_nature_wispsplode |
| icebarrier | `icons/icebarrier.jpg` | spell_ice_lament |
| flamestrike | `icons/flamestrike.jpg` | spell_fire_selfdestruct |
| pyroblast | `icons/pyroblast.jpg` | spell_fire_fireball02 |
| fireball | `icons/fireball.jpg` | spell_fire_flamebolt |
| intellect | `icons/intellect.jpg` | spell_holy_magicalsentry |
| ignite | `icons/ignite.jpg` | spell_fire_incinerate |
| iceshard | `icons/iceshard.jpg` | spell_frost_iceshard |
| time | `icons/time.jpg` | ability_mage_timewarp |
| barrier | `icons/barrier.jpg` | spell_frost_frostarmor |
| mana | `icons/mana.jpg` | spell_nature_purge |
| sharp | `icons/sharp.jpg` | inv_sword_04 |
| boot | `icons/boot.jpg` | ability_rogue_sprint |
| summon | `icons/summon.jpg` | spell_shadow_summonimp |
| chest | `icons/chest.jpg` | inv_box_02 |
| skull | `icons/skull.jpg` | spell_shadow_skull |
| achievement | `icons/achievement.jpg` | achievement_general |
| holybolt | `icons/holybolt.jpg` | spell_holy_holybolt |
| holyfire | `icons/holyfire.jpg` | spell_holy_searinglight |
| pwshield | `icons/pwshield.jpg` | spell_holy_powerwordshield |
| renew | `icons/renew.jpg` | spell_holy_renew |
| holynova | `icons/holynova.jpg` | spell_holy_holynova |
| flashheal | `icons/flashheal.jpg` | spell_holy_flashheal |
| penance | `icons/penance.jpg` | spell_holy_penance |
| spirit | `icons/spirit.jpg` | spell_holy_spiritualguidence |
| innerfire | `icons/innerfire.jpg` | spell_holy_innerfire |
| heal | `icons/heal.jpg` | spell_holy_heal |
| absolution | `icons/absolution.jpg` | spell_holy_absolution |

### 职业 / 首领

| 文件 | 原始图标 |
| --- | --- |
| `classes/warrior.jpg` | classicon_warrior |
| `classes/mage.jpg` | classicon_mage |
| `classes/priest.jpg` | classicon_priest |
| `bosses/vancleef.jpg` | achievement_boss_edwinvancleef |
| `bosses/mutanus.jpg` | achievement_boss_mutanus_the_devourer |
| `bosses/arugal.jpg` | achievement_boss_archmagearugal |
| `bosses/thaurissan.jpg` | achievement_boss_emperordagranthaurissan |
| `bosses/lichking.jpg` | achievement_boss_lichking |

## 像素字体

- 文件：`fonts/fusion-pixel-zh_hans.woff2`
- 字体：**Fusion Pixel Font** / 缝合像素字体
- 项目：<https://github.com/TakWolf/fusion-pixel-font>
- 授权：SIL Open Font License 1.1，授权文本见 `fonts/OFL.txt`

## UI 纹理

`ui/` 中的石革金 9-slice 边框、按钮、技能槽、卡牌框、狮鹫端饰、小地图圆环等，由 `tools/generate_ui_assets.py` 使用 Pillow 生成，不依赖外部图片素材。

全局厚框 `panel_heavy.png`、`slot_heavy.png`、`button_heavy_gold.png`、`button_heavy_stone.png` 由 `tools/generate_heavy_frames.py` 生成暗石 / 铁灰 / 旧铜材质；小地图圆环 `minimap_ring.png` 由同一流程重绘为暗铁环 + 旧铜铆钉。

成就界面的暗石外框、卡牌框、分隔线、石纹与战团徽记由 `tools/generate_achievement_assets.py` 生成，使用局部旧金角饰替代整圈金色直线。

厚边框版本的 `panel_heavy.png`、`button_heavy_gold.png`、`button_heavy_stone.png`、`slot_heavy.png` 由 `tools/generate_heavy_frames.py` 生成。它们按 1:1 像素尺寸绘制，主框为 12px 石铁主体、黄铜压条、窄金内嵌线与铆钉角板；`heavy-frames.css` 以固定 px 边框宽度渲染，避免再次被缩放成 1px 金线。

> 如果本作品未来用于商业用途，需要替换为拥有相应授权的图标资源，并继续遵守字体 OFL 授权。

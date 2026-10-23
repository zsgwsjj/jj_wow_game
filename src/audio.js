/* =========================================================
   艾泽拉斯：裂隙远征 — WebAudio 程序化音效
   ========================================================= */
(function () {
  'use strict';

  const AudioEngine = {
    ctx: null,
    master: null,
    sfxGain: null,
    musicGain: null,
    muted: false,
    musicTimer: null,
    step: 0,
    mood: 0,
    active: false,
    noiseBuffer: null,
    musicVolume: .14,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : .65;
        this.master.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = .9;
        this.sfxGain.connect(this.master);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.musicVolume;
        this.musicGain.connect(this.master);
        this.noiseBuffer = this.makeNoise();
      } catch (e) {
        this.ctx = null;
      }
    },

    makeNoise() {
      const len = this.ctx.sampleRate * 1.2;
      const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      return buffer;
    },

    unlock() {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    setMuted(muted) {
      this.muted = muted;
      if (this.master) {
        const t = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(t);
        this.master.gain.linearRampToValueAtTime(muted ? 0 : .65, t + .05);
      }
    },

    toggleMuted() {
      this.setMuted(!this.muted);
      return this.muted;
    },

    tone(freq, dur, type, vol, slideTo, when) {
      if (!this.ctx || this.muted) return;
      const t = (when == null ? this.ctx.currentTime : when);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(Math.max(20, freq), t);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol || .08, t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + dur + .02);
    },

    noise(dur, vol, freq, q, when) {
      if (!this.ctx || this.muted) return;
      const t = (when == null ? this.ctx.currentTime : when);
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq || 1200;
      filter.Q.value = q || .8;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol || .06, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);
      src.start(t);
      src.stop(t + dur + .02);
    },

    sfx(name) {
      if (!this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      switch (name) {
        case 'click':
          this.tone(520, .05, 'square', .025, 680);
          break;
        case 'select':
          this.tone(440, .08, 'triangle', .04, 880);
          this.tone(660, .1, 'sine', .025, 990, now + .05);
          break;
        case 'slash':
          this.noise(.12, .05, 2100, .6);
          this.tone(180, .07, 'sawtooth', .03, 90);
          break;
        case 'hit':
          this.noise(.08, .06, 800, .7);
          this.tone(120, .09, 'square', .035, 60);
          break;
        case 'hitBig':
          this.noise(.2, .1, 500, .4);
          this.tone(90, .24, 'sawtooth', .06, 40);
          this.tone(180, .16, 'square', .035, 70);
          break;
        case 'fireball':
          this.tone(680, .26, 'sine', .04, 190);
          this.noise(.22, .035, 1300, .8);
          break;
        case 'fire':
          this.noise(.5, .06, 900, .4);
          this.tone(160, .4, 'sawtooth', .035, 80);
          break;
        case 'frost':
          this.tone(1560, .2, 'sine', .035, 620);
          this.tone(2100, .28, 'sine', .02, 940, now + .04);
          this.noise(.25, .025, 4200, 1.2);
          break;
        case 'arcane':
          this.tone(380, .25, 'triangle', .045, 980);
          this.tone(760, .3, 'sine', .025, 1320, now + .07);
          break;
        case 'blink':
          this.tone(1200, .12, 'sine', .035, 280);
          this.tone(300, .2, 'triangle', .025, 900, now + .06);
          this.noise(.12, .02, 2800, 1.4);
          break;
        case 'shield':
          this.tone(180, .3, 'sine', .05, 240);
          this.tone(360, .4, 'triangle', .025, 420);
          break;
        case 'heal':
          this.tone(520, .25, 'sine', .03, 780);
          this.tone(780, .35, 'sine', .02, 1040, now + .08);
          break;
        case 'level':
          [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .3, 'triangle', .045, f, now + i * .09));
          this.noise(.3, .02, 5000, .9, now + .25);
          break;
        case 'chest':
          [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, .42, 'triangle', .04, f, now + i * .075));
          this.noise(.3, .03, 6000, .8, now + .3);
          break;
        case 'portal':
          this.tone(220, .7, 'sine', .035, 880);
          this.tone(440, .8, 'triangle', .02, 1320, now + .1);
          this.noise(.6, .025, 2500, 1.5);
          break;
        case 'boss':
          this.tone(72, .9, 'sawtooth', .08, 48);
          this.tone(110, .8, 'square', .035, 72, now + .06);
          this.noise(.5, .05, 240, .4);
          break;
        case 'hurt':
          this.tone(140, .14, 'sawtooth', .05, 80);
          this.noise(.12, .05, 550, .8);
          break;
        case 'death':
          [392, 330, 262, 196, 147].forEach((f, i) => this.tone(f, .5, 'triangle', .04, f * .92, now + i * .12));
          break;
        case 'victory':
          [392, 523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, .55, 'triangle', .045, f, now + i * .12));
          break;
        case 'denied':
          this.tone(150, .12, 'square', .035, 110);
          this.tone(120, .14, 'square', .03, 90, now + .08);
          break;
        case 'cast':
          this.tone(300, .18, 'triangle', .03, 620);
          break;
        case 'achievement':
          [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .4, 'triangle', .04, f, now + i * .08));
          this.tone(1568, .55, 'sine', .018, 1568, now + .28);
          this.noise(.35, .018, 5200, .9, now + .2);
          break;
        default:
          this.tone(440, .06, 'square', .02, 520);
      }
    },

    startMusic() {
      this.init();
      if (!this.ctx || this.musicTimer) return;
      this.active = true;
      this.step = 0;
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(.0001, this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, this.ctx.currentTime + 1.2);
      const tick = () => {
        if (!this.active || !this.ctx) return;
        if (!this.muted) this.playMusicStep();
        this.step++;
      };
      this.musicTimer = setInterval(tick, 430);
      tick();
    },

    playMusicStep() {
      const t = this.ctx.currentTime;
      const scales = [
        [110, 130.81, 146.83, 164.81, 196, 220],
        [98, 116.54, 130.81, 146.83, 174.61, 196],
        [82.41, 98, 110, 123.47, 146.83, 164.81],
        [73.42, 87.31, 98, 116.54, 130.81, 146.83],
        [65.41, 77.78, 87.31, 98, 116.54, 130.81]
      ];
      const scale = scales[this.mood % scales.length];
      const s = this.step;
      const bass = scale[0] / 2;
      if (s % 8 === 0) {
        this.musicNote(bass, 1.7, 'sine', .035, t);
        this.musicNote(bass * 2, 1.4, 'triangle', .012, t + .08);
      }
      if (s % 2 === 0) {
        const idx = (s * 3 + (s % 5)) % scale.length;
        const oct = (s % 8 === 4) ? 4 : 2;
        this.musicNote(scale[idx] * oct, .55, 'triangle', .011, t);
      }
      if (s % 8 === 5) {
        this.musicNote(scale[4] * 4, .8, 'sine', .007, t + .1);
      }
    },

    musicNote(freq, dur, type, vol, when) {
      if (!this.ctx || this.muted) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(vol, when + .08);
      g.gain.exponentialRampToValueAtTime(.0001, when + dur);
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start(when);
      osc.stop(when + dur + .03);
    },

    setMood(i) {
      this.mood = Math.max(0, i | 0);
    },

    stopMusic() {
      this.active = false;
      if (this.musicTimer) clearInterval(this.musicTimer);
      this.musicTimer = null;
      if (this.ctx && this.musicGain) {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(.0001, this.ctx.currentTime + .2);
      }
    },

    setDucked(ducked) {
      if (!this.ctx || !this.musicGain) return;
      const target = ducked ? .04 : this.musicVolume;
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + .2);
    }
  };

  window.AudioEngine = AudioEngine;
})();

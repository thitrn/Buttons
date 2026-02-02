(() => {
  let audioCtx = null;

  const BPM = 110;
  const beat = 60 / BPM;   
  const step = beat / 4;   
  const bar = beat * 4;


  const SCHEDULE_AHEAD = 0.15;
  const TICK_MS = 50;

  const state = {
    blossom: { on: false, nextTime: 0, timer: null },
    bubble: { on: false, nextTime: 0, timer: null },
    buttercup: { on: false, nextTime: 0, timer: null },
  };

  function ctx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function ensureRunning() {
    const c = ctx();
    if (c.state !== "running") c.resume();
    return c;
  }


  function beep({ t, freq, type = "sine", dur = 0.12, gain = 0.10 }) {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();

    o.type = type;
    o.frequency.setValueAtTime(freq, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  function kick({ t, gain = 0.22 }) {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();

    o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.10);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.22);
  }

  function hat({ t, gain = 0.06 }) {
    const c = ctx();
    const bufferSize = Math.floor(c.sampleRate * 0.04);
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const src = c.createBufferSource();
    src.buffer = buffer;

    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    src.connect(hp).connect(g).connect(c.destination);
    src.start(t);
    src.stop(t + 0.05);
  }


  function scheduleBlossomBar(barStart) {

    beep({ t: barStart + step * 0,  freq: 784, type: "triangle", dur: 0.11, gain: 0.10 });
    beep({ t: barStart + step * 6,  freq: 880, type: "triangle", dur: 0.11, gain: 0.085 });
    beep({ t: barStart + step * 8,  freq: 988, type: "triangle", dur: 0.11, gain: 0.095 });
    beep({ t: barStart + step * 14, freq: 880, type: "triangle", dur: 0.10, gain: 0.08 });
  }


  function scheduleBubbleBar(barStart) {

    beep({ t: barStart + step * 2,  freq: 1318, type: "sine", dur: 0.07, gain: 0.05 });
    beep({ t: barStart + step * 4,  freq: 1046, type: "sine", dur: 0.07, gain: 0.045 });
    beep({ t: barStart + step * 10, freq: 1318, type: "sine", dur: 0.07, gain: 0.05 });
    beep({ t: barStart + step * 12, freq: 1046, type: "sine", dur: 0.07, gain: 0.045 });
  }


  function scheduleButtercupBar(barStart) {

    kick({ t: barStart + step * 0, gain: 0.20 });
    kick({ t: barStart + step * 8, gain: 0.20 });

    for (let i = 1; i < 16; i += 2) {
      hat({ t: barStart + step * i, gain: 0.05 });
    }
  }

  function startLayer(key, scheduleBarFn) {
    const c = ensureRunning();
    const layer = state[key];

    if (layer.on) return;
    layer.on = true;

    const t = c.currentTime;
    const aligned = Math.ceil(t / bar) * bar;
    layer.nextTime = aligned;

    layer.timer = setInterval(() => {
      const now = c.currentTime;
      while (layer.nextTime < now + SCHEDULE_AHEAD) {
        scheduleBarFn(layer.nextTime);
        layer.nextTime += bar; 
      }
    }, TICK_MS);

    console.log(`▶️ ${key} layer ON`);
  }

  function stopLayer(key) {
    const layer = state[key];
    if (!layer.on) return;

    layer.on = false;
    if (layer.timer) clearInterval(layer.timer);
    layer.timer = null;

    console.log(`⏹️ ${key} layer OFF`);
  }

  function toggleLayer(key) {
    ensureRunning();

    if (state[key].on) {
      stopLayer(key);
    } else {
      if (key === "blossom") startLayer("blossom", scheduleBlossomBar);
      if (key === "bubble") startLayer("bubble", scheduleBubbleBar);
      if (key === "buttercup") startLayer("buttercup", scheduleButtercupBar);
    }

    const allOn = state.blossom.on && state.bubble.on && state.buttercup.on;
    if (allOn) console.log("🎵 FULL SONG (all 3 layers)!");
  }

  function pick(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function hookButtons() {
    const book = document.querySelector("coloring-book");
    if (!book || !book.shadowRoot) return false;
    const root = book.shadowRoot;

    const blossomBtn = pick(root, ["#btn-blossom", ".blossom-bow", ".thi-bow", "[data-btn='blossom']"]);
    const bubbleBtn  = pick(root, ["#btn-bubbles", ".bubble-button", ".bubbles-button", "[data-btn='bubble']"]);
    const butterBtn  = pick(root, ["#btn-buttercup", ".buttercup-wrap", ".sunflower-button", ".sunflower", "[data-btn='buttercup']"]);

    if (!blossomBtn || !bubbleBtn || !butterBtn) return false;

    console.log("✅ Audio hooked to buttons");

    blossomBtn.addEventListener("click", () => toggleLayer("blossom"));
    bubbleBtn.addEventListener("click", () => toggleLayer("bubble"));
    butterBtn.addEventListener("click", () => toggleLayer("buttercup"));

    return true;
  }

  let tries = 0;
  const retry = setInterval(() => {
    tries++;
    if (hookButtons()) clearInterval(retry);
    if (tries > 80) {
      clearInterval(retry);
      console.warn("❌ Could not hook buttons (selectors didn't match).");
    }
  }, 100);
})();

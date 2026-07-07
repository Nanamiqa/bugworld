(function () {
  const cueThrottleMs = {
    weapon: 90,
    "weapon-hit-paperclip": 42,
    "weapon-hit-keyboard": 55,
    "weapon-hit-correction": 48,
    pickup: 75,
    "enemy-down": 110,
    damage: 220,
    danger: 450,
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createVariableCityAudio({ getSettings } = {}) {
    let context = null;
    let masterGain = null;
    const lastPlayedAt = new Map();

    function currentSettings() {
      try {
        return getSettings?.() ?? {};
      } catch {
        return {};
      }
    }

    function outputGain() {
      const settings = currentSettings();
      if (settings.audioMuted) {
        return 0;
      }
      return clamp(Number(settings.masterVolume ?? 0.62), 0, 1) * 0.32;
    }

    function ensureContext() {
      if (context) {
        return context;
      }
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      context = new AudioContextCtor();
      masterGain = context.createGain();
      masterGain.gain.value = outputGain();
      masterGain.connect(context.destination);
      return context;
    }

    function unlock() {
      const audioContext = ensureContext();
      if (audioContext?.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
    }

    function syncSettings() {
      if (!masterGain) {
        return;
      }
      const now = context.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(outputGain(), now, 0.025);
    }

    function allowCue(name) {
      const throttle = cueThrottleMs[name] ?? 0;
      if (!throttle) {
        return true;
      }
      const now = performance.now();
      const last = lastPlayedAt.get(name) ?? 0;
      if (now - last < throttle) {
        return false;
      }
      lastPlayedAt.set(name, now);
      return true;
    }

    function tone(frequency, start, duration, gain = 0.3, type = "sine", endFrequency = null) {
      const audioContext = ensureContext();
      if (!audioContext || !masterGain) {
        return;
      }
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      if (endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
      }
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), start + Math.min(0.028, duration * 0.35));
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(envelope);
      envelope.connect(masterGain);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    }

    function noise(start, duration, gain = 0.2, filterFrequency = 1200) {
      const audioContext = ensureContext();
      if (!audioContext || !masterGain) {
        return;
      }
      const sampleCount = Math.max(1, Math.floor(audioContext.sampleRate * duration));
      const buffer = audioContext.createBuffer(1, sampleCount, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < sampleCount; index += 1) {
        data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
      }
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const envelope = audioContext.createGain();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = filterFrequency;
      filter.Q.value = 1.8;
      envelope.gain.setValueAtTime(gain, start);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(envelope);
      envelope.connect(masterGain);
      source.start(start);
      source.stop(start + duration);
    }

    function playCue(name, options = {}) {
      if (currentSettings().audioMuted || !allowCue(name)) {
        return;
      }
      const audioContext = ensureContext();
      if (!audioContext) {
        return;
      }
      unlock();
      syncSettings();
      const now = audioContext.currentTime + 0.012;
      const intensity = clamp(Number(options.intensity ?? 1), 0.35, 1.8);

      switch (name) {
        case "ui-open":
          tone(420, now, 0.065, 0.22, "triangle", 640);
          tone(720, now + 0.052, 0.075, 0.16, "sine");
          break;
        case "ui-close":
          tone(520, now, 0.06, 0.16, "triangle", 320);
          break;
        case "ui-confirm":
          tone(560, now, 0.052, 0.14, "triangle");
          tone(820, now + 0.052, 0.075, 0.18, "sine");
          break;
        case "ui-danger":
          tone(210, now, 0.11, 0.22, "sawtooth", 160);
          noise(now, 0.09, 0.1, 420);
          break;
        case "pause":
          tone(390, now, 0.09, 0.2, "triangle", 260);
          tone(260, now + 0.08, 0.12, 0.14, "sine");
          break;
        case "resume":
          tone(270, now, 0.07, 0.14, "triangle", 410);
          tone(540, now + 0.055, 0.09, 0.16, "sine");
          break;
        case "run-start":
          tone(220, now, 0.12, 0.12, "sine");
          tone(440, now + 0.08, 0.12, 0.15, "triangle");
          tone(660, now + 0.16, 0.16, 0.14, "sine");
          break;
        case "weapon":
          tone(880, now, 0.035, 0.09, "square", 1180);
          break;
        case "weapon-hit-paperclip":
          tone(1320, now, 0.026, 0.08 * intensity, "square", 1780);
          tone(660, now + 0.014, 0.04, 0.05 * intensity, "triangle", 520);
          noise(now, 0.026, 0.025 * intensity, 3600);
          break;
        case "weapon-hit-keyboard":
          noise(now, 0.038, 0.055 * intensity, 1900);
          tone(420, now, 0.035, 0.055 * intensity, "square", 360);
          tone(720, now + 0.026, 0.032, 0.04 * intensity, "triangle");
          break;
        case "weapon-hit-correction":
          noise(now, 0.07, 0.045 * intensity, 860);
          tone(300, now, 0.075, 0.05 * intensity, "sine", 210);
          tone(520, now + 0.032, 0.065, 0.032 * intensity, "triangle", 390);
          break;
        case "dash":
          noise(now, 0.13, 0.14 * intensity, 2200);
          tone(360, now, 0.12, 0.12, "sawtooth", 760);
          break;
        case "pulse":
          tone(180, now, 0.18, 0.24, "sine", 92);
          tone(560, now + 0.02, 0.16, 0.16, "triangle", 920);
          tone(1120, now + 0.07, 0.12, 0.1, "sine");
          break;
        case "damage":
          noise(now, 0.16, 0.18 * intensity, 360);
          tone(180, now, 0.16, 0.24, "sawtooth", 90);
          break;
        case "pickup":
          tone(660, now, 0.045, 0.1, "triangle");
          tone(990, now + 0.038, 0.055, 0.11, "sine");
          break;
        case "enemy-down":
          tone(380, now, 0.06, 0.11, "triangle", 260);
          noise(now, 0.08, 0.05, 900);
          break;
        case "upgrade-open":
          tone(330, now, 0.1, 0.12, "triangle");
          tone(660, now + 0.07, 0.11, 0.14, "sine");
          break;
        case "upgrade-select":
          tone(520, now, 0.075, 0.14, "triangle");
          tone(780, now + 0.055, 0.09, 0.13, "sine");
          tone(1040, now + 0.115, 0.12, 0.12, "sine");
          break;
        case "danger":
          tone(260, now, 0.13, 0.2, "square", 220);
          tone(260, now + 0.18, 0.12, 0.16, "square", 220);
          break;
        case "boss-start":
          tone(110, now, 0.32, 0.2, "sawtooth", 74);
          tone(330, now + 0.12, 0.22, 0.14, "triangle");
          noise(now + 0.04, 0.26, 0.08, 720);
          break;
        case "boss-phase":
          tone(130, now, 0.16, 0.2, "sawtooth", 96);
          tone(520, now + 0.08, 0.15, 0.16, "square", 390);
          noise(now, 0.18, 0.08, 560);
          break;
        case "victory":
          [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
            tone(frequency, now + index * 0.09, 0.16, 0.13, "triangle");
          });
          break;
        case "defeat":
          tone(220, now, 0.2, 0.2, "sine", 146);
          tone(146, now + 0.16, 0.32, 0.16, "triangle", 98);
          break;
        default:
          tone(520, now, 0.06, 0.11, "triangle");
          break;
      }
    }

    return {
      playCue,
      syncSettings,
      unlock,
      getState: () => ({
        available: Boolean(window.AudioContext || window.webkitAudioContext),
        active: Boolean(context),
        muted: Boolean(currentSettings().audioMuted),
        volume: clamp(Number(currentSettings().masterVolume ?? 0.62), 0, 1),
      }),
    };
  }

  window.createVariableCityAudio = createVariableCityAudio;
})();

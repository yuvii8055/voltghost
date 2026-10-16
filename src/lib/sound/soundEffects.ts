// Web Audio API procedural sound synthesizer (100% self-contained, no external MP3/WAV files)

class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playClick(pitch: number = 800) {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  playIslandExpand() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  playAlert(severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const ctx = this.getContext();
    if (!ctx) return;
    const freq = severity === 'critical' ? 920 : severity === 'high' ? 740 : 520;
    
    [0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + offset + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.08);
    });
  }

  playGhostBusted() {
    const ctx = this.getContext();
    if (!ctx) return;
    // Ascending celebratory arpeggio: C5, E5, G5, B5, C6
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
    });
  }

  playConfetti() {
    const ctx = this.getContext();
    if (!ctx) return;
    const freqs = [880, 1108.73, 1318.51, 1760];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.3);
    });
  }

  playSiren(durationSec: number = 3) {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    
    // Oscillate between 600Hz and 1200Hz
    const now = ctx.currentTime;
    for (let t = 0; t < durationSec; t += 0.5) {
      osc.frequency.linearRampToValueAtTime(1100, now + t + 0.25);
      osc.frequency.linearRampToValueAtTime(600, now + t + 0.5);
    }

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.01, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec);
  }
}

export const sound = new SoundSystem();

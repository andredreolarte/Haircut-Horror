import { Level } from '../types';

class AudioController {
  private ctx: AudioContext | null = null;
  private ambienceNodes: AudioNode[] = [];
  private ambienceGain: GainNode | null = null;
  private drawSource: AudioBufferSourceNode | null = null;
  private drawGain: GainNode | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (e) {
      console.error("Web Audio API not supported");
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playAmbience(level: Level) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    
    this.stopAmbience();

    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.connect(this.ctx.destination);
    
    const now = this.ctx.currentTime;

    if (level === Level.LEVEL_1) {
      // Gentle Salon Hums (C Major Pad)
      this.ambienceGain.gain.setValueAtTime(0.05, now);
      const freqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      freqs.forEach(f => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.start();
        osc.connect(this.ambienceGain!);
        this.ambienceNodes.push(osc);
      });
    } else if (level === Level.LEVEL_2) {
      // Unsettling Drone (Low Dissonance)
      this.ambienceGain.gain.setValueAtTime(0.08, now);
      const freqs = [55.00, 58.00]; // Low A1 and slightly detuned A#1
      freqs.forEach(f => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = f;
        osc.start();
        osc.connect(this.ambienceGain!);
        this.ambienceNodes.push(osc);
      });
    } else if (level === Level.LEVEL_3) {
      // Horror Soundscape (High pitch + Low Rumble + Noise)
      this.ambienceGain.gain.setValueAtTime(0.1, now);
      
      // Low rumble
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 40;
      osc1.start();
      osc1.connect(this.ambienceGain);
      this.ambienceNodes.push(osc1);

      // High pitch anxiety
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 8000;
      osc2.start();
      osc2.connect(this.ambienceGain);
      this.ambienceNodes.push(osc2);
      
      // LFO on the high pitch
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.5;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 1000;
      lfo.connect(lfoGain);
      lfoGain.connect(osc2.frequency);
      lfo.start();
      this.ambienceNodes.push(lfo);
      this.ambienceNodes.push(lfoGain); // Keep ref to disconnect
    }
  }

  stopAmbience() {
    this.ambienceNodes.forEach(node => {
      try {
        if (node instanceof OscillatorNode) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.ambienceNodes = [];
    if (this.ambienceGain) {
      this.ambienceGain.disconnect();
      this.ambienceGain = null;
    }
  }

  startDrawing(isEraser: boolean) {
    if (!this.ctx) return;
    this.resume();

    if (this.drawSource) return; // Already playing

    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // White noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.drawSource = this.ctx.createBufferSource();
    this.drawSource.buffer = buffer;
    this.drawSource.loop = true;

    this.drawGain = this.ctx.createGain();
    // Eraser is harsher/louder (cutting), Brush is softer
    this.drawGain.gain.value = isEraser ? 0.15 : 0.05; 

    // Filter to shape the sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = isEraser ? 'highpass' : 'lowpass';
    filter.frequency.value = isEraser ? 1000 : 400;

    this.drawSource.connect(filter);
    filter.connect(this.drawGain);
    this.drawGain.connect(this.ctx.destination);
    
    this.drawSource.start();
  }

  stopDrawing() {
    if (this.drawSource) {
      try { this.drawSource.stop(); } catch(e){}
      this.drawSource.disconnect();
      this.drawSource = null;
    }
    if (this.drawGain) {
      this.drawGain.disconnect();
      this.drawGain = null;
    }
  }

  playClick() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    this.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}

export const SoundManager = new AudioController();

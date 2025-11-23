
// A simple synthesizer for generating game SFX without external assets
class AudioService {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    constructor() {
        // Initialize on first user interaction usually, but we setup class here
    }

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Default volume
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // --- GENERIC TONE GENERATORS ---

    private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 1) {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    private playNoise(duration: number) {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }

    // --- GAMEPLAY SFX ---

    public playAttack(isHeavy: boolean = false) {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        // Pitch drop for impact effect
        osc.frequency.setValueAtTime(isHeavy ? 300 : 600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);

        // Add a bit of noise for "crunch"
        if (isHeavy) this.playNoise(0.4);
    }

    public playDefense() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Pitch rise for "Shield Up" effect
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.2);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }

    public playBuff() {
        this.playTone(880, 'triangle', 0.5, 0.2);
        setTimeout(() => this.playTone(1100, 'triangle', 0.5, 0.2), 100);
    }

    // --- HERO SPECIFIC SFX ---

    public playKaylaShot() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square'; // 8-bit laser feel
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    public playLinaCharm() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        
        // Vibrato effect
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 10; // 10Hz wobble
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 50; 
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.0);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.0);
        lfo.stop(this.ctx.currentTime + 1.0);
    }

    public playEllaScan() {
         this.playTone(1200, 'sine', 0.1, 0.1);
         setTimeout(() => this.playTone(1800, 'sine', 0.1, 0.1), 100);
         setTimeout(() => this.playTone(2400, 'sine', 0.2, 0.1), 200);
    }
}

export const audioService = new AudioService();

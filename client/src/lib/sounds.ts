// Simple sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.03) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Success sound (positive feedback) - very light
  playSuccess() {
    this.playTone(523.25, 0.08, 'sine', 0.03); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.03), 80); // E5
  }

  // Error sound (negative feedback)
  playError() {
    this.playTone(200, 0.1, 'sawtooth');
    setTimeout(() => this.playTone(150, 0.2, 'sawtooth'), 100);
  }

  // Click sound (button press) - very light
  playClick() {
    this.playTone(800, 0.03, 'square', 0.02);
  }

  // Notification sound (new message, player joined)
  playNotification() {
    this.playTone(440, 0.1); // A4
    setTimeout(() => this.playTone(554.37, 0.15), 100); // C#5
  }

  // Countdown tick sound
  playTick() {
    this.playTone(1000, 0.05, 'square', 0.08);
  }

  // Game start sound
  playGameStart() {
    this.playTone(261.63, 0.1); // C4
    setTimeout(() => this.playTone(329.63, 0.1), 100); // E4
    setTimeout(() => this.playTone(392.00, 0.1), 200); // G4
    setTimeout(() => this.playTone(523.25, 0.3), 300); // C5
  }

  // Victory sound
  playVictory() {
    const notes = [523.25, 587.33, 659.25, 783.99];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15), i * 100);
    });
  }

  // Reveal sound (dramatic)
  playReveal() {
    this.playTone(220, 0.3, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(440, 0.5, 'sine', 0.2), 300);
  }

  // Night phase sound (mysterious, very light)
  playNight() {
    this.playTone(150, 0.2, 'sine', 0.02);
    setTimeout(() => this.playTone(200, 0.3, 'sine', 0.02), 200);
  }

  // Day phase sound (bright, very light)
  playDay() {
    this.playTone(400, 0.15, 'sine', 0.02);
    setTimeout(() => this.playTone(500, 0.2, 'sine', 0.02), 150);
  }

  // Kill sound (subtle, dark)
  playKill() {
    this.playTone(180, 0.1, 'sawtooth', 0.03);
  }

  // Protect sound (gentle, light)
  playProtect() {
    this.playTone(350, 0.12, 'sine', 0.02);
    setTimeout(() => this.playTone(440, 0.15, 'sine', 0.02), 120);
  }

  // Investigate sound (mysterious, very light)
  playInvestigate() {
    this.playTone(300, 0.1, 'sine', 0.02);
    setTimeout(() => this.playTone(400, 0.12, 'sine', 0.02), 100);
  }

  // Vote sound (subtle)
  playVote() {
    this.playTone(450, 0.08, 'square', 0.02);
  }

  // Death sound (sad, very light)
  playDeath() {
    this.playTone(200, 0.2, 'sine', 0.03);
    setTimeout(() => this.playTone(150, 0.3, 'sine', 0.03), 200);
  }
}

export const soundManager = new SoundManager();


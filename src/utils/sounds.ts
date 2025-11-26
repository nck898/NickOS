// Simple click sound effects using Web Audio API

class SoundManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context on first interaction (browser requires user gesture)
    if (typeof window !== 'undefined') {
      this.audioContext = null;
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Simple click sound
  private playSimpleClick(freq: number, volume: number = 0.15, duration: number = 0.05) {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.001);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  }

  // Gentle click sound
  playClick() {
    this.playSimpleClick(800, 0.12, 0.06);
  }

  // Playful boop sound
  playBoop() {
    this.playSimpleClick(600, 0.13, 0.07);
  }

  // Harp sound (just a simple click)
  playHarp() {
    this.playSimpleClick(700, 0.14, 0.08);
  }

  // Window open sound
  playWindowOpen() {
    this.playSimpleClick(650, 0.13, 0.07);
  }

  // Window close sound
  playWindowClose() {
    this.playSimpleClick(550, 0.12, 0.06);
  }

  // Menu interaction sound
  playMenuClick() {
    this.playSimpleClick(750, 0.11, 0.05);
  }

  // Hover sound - very subtle
  playHover() {
    this.playSimpleClick(900, 0.08, 0.04);
  }
}

// Export singleton instance
export const soundManager = new SoundManager();


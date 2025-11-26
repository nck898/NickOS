import { useState, useRef, useEffect } from 'react';
import Window from './Window';
import './FLStudioApp.css';

interface FLStudioAppProps {
  onClose: () => void;
}

type BeatType = 'lofi' | 'jazz' | 'hiphop' | 'drill';

interface Sound {
  name: string;
  type: string;
  melodic: boolean; // Can play different notes
}

// Musical notes: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_FREQUENCIES: Record<string, number> = {};
// Generate frequencies for C2 to C6 (5 octaves)
for (let octave = 2; octave <= 6; octave++) {
  NOTES.forEach((note, index) => {
    const freq = 16.35 * Math.pow(2, (octave - 1) + index / 12);
    NOTE_FREQUENCIES[`${note}${octave}`] = freq;
  });
}

const soundPacks: Record<BeatType, Sound[]> = {
  lofi: [
    { name: 'Kick', type: 'lofi_kick', melodic: false },
    { name: 'Snare', type: 'lofi_snare', melodic: false },
    { name: 'HiHat', type: 'lofi_hihat', melodic: false },
    { name: 'Rhodes', type: 'lofi_rhodes', melodic: true },
    { name: 'Bass', type: 'lofi_bass', melodic: true },
    { name: 'Pad', type: 'lofi_pad', melodic: true },
    { name: 'Vox', type: 'lofi_vox', melodic: false },
  ],
  jazz: [
    { name: 'Kick', type: 'jazz_kick', melodic: false },
    { name: 'Snare', type: 'jazz_snare', melodic: false },
    { name: 'Ride', type: 'jazz_ride', melodic: false },
    { name: 'Piano', type: 'jazz_piano', melodic: true },
    { name: 'Upright', type: 'jazz_upright', melodic: true },
    { name: 'Sax', type: 'jazz_sax', melodic: true },
    { name: 'Trumpet', type: 'jazz_trumpet', melodic: true },
  ],
  hiphop: [
    { name: 'Kick', type: 'hiphop_kick', melodic: false },
    { name: 'Snare', type: 'hiphop_snare', melodic: false },
    { name: 'HiHat', type: 'hiphop_hihat', melodic: false },
    { name: '808', type: 'hiphop_808', melodic: true },
    { name: 'Pad', type: 'hiphop_pad', melodic: true },
    { name: 'Chop', type: 'hiphop_chop', melodic: true },
    { name: 'Stab', type: 'hiphop_stab', melodic: true },
  ],
  drill: [
    { name: 'Kick', type: 'drill_kick', melodic: false },
    { name: 'Snare', type: 'drill_snare', melodic: false },
    { name: 'HiHat', type: 'drill_hihat', melodic: false },
    { name: '808', type: 'drill_808', melodic: true },
    { name: 'Synth', type: 'drill_synth', melodic: true },
    { name: 'Perc', type: 'drill_perc', melodic: false },
    { name: 'FX', type: 'drill_fx', melodic: false },
  ],
};

type CellData = {
  active: boolean;
  note?: number; // MIDI note number (0-127), default to C4 (60) for melodic instruments
};

const FLStudioApp = ({ onClose }: FLStudioAppProps) => {
  const [beatType, setBeatType] = useState<BeatType>('lofi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [grid, setGrid] = useState<CellData[][]>(() => 
    Array(soundPacks.lofi.length).fill(null).map(() => 
      Array(16).fill(null).map(() => ({ active: false, note: 60 }))
    )
  );
  const [bpm, setBpm] = useState(120);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ row: number; col: number } | null>(null);
  const dragValueRef = useRef<boolean | null>(null);
  const gridRef = useRef<CellData[][]>(grid);

  const sounds = soundPacks[beatType];

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Keep gridRef in sync with grid state
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    // Reset grid when beat type changes
    const newGrid = Array(sounds.length).fill(null).map(() => 
      Array(16).fill(null).map(() => ({ active: false, note: 60 }))
    );
    setGrid(newGrid);
    gridRef.current = newGrid;
  }, [beatType, sounds.length]);

  // Convert MIDI note to frequency
  const midiToFreq = (midiNote: number): number => {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  };

  const generateSound = (soundType: string, note: number = 60): AudioBufferSourceNode => {
    if (!audioContextRef.current) throw new Error('AudioContext not initialized');
    
    const ctx = audioContextRef.current;
    const sampleRate = ctx.sampleRate;
    const freq = midiToFreq(note);
    
    // Determine duration based on sound type
    let duration = 0.3;
    if (soundType.includes('hihat') || soundType.includes('ride') || soundType.includes('vox') || soundType.includes('perc') || soundType.includes('fx')) {
      duration = 0.15;
    } else if (soundType.includes('snare')) {
      duration = 0.25;
    } else if (soundType.includes('pad') || soundType.includes('sax') || soundType.includes('trumpet')) {
      duration = 0.8;
    } else if (soundType.includes('kick') || soundType.includes('808') || soundType.includes('bass') || soundType.includes('upright')) {
      duration = 0.4;
    } else {
      duration = 0.5;
    }
    
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Lo-Fi Sounds
    if (soundType === 'lofi_kick') {
      // Soft, warm kick with slight saturation
      const kickFreq = 60;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 6);
        const osc1 = Math.sin(2 * Math.PI * kickFreq * t * (1 - t * 0.3));
        const osc2 = Math.sin(2 * Math.PI * kickFreq * 0.5 * t);
        const saturation = Math.tanh((osc1 * 0.6 + osc2 * 0.4) * 1.2);
        data[i] = saturation * envelope;
      }
    } else if (soundType === 'lofi_snare') {
      // Soft, filtered snare with tape compression feel
      const fundamental = 180;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 12);
        const tone = Math.sin(2 * Math.PI * fundamental * t) * Math.exp(-t * 15);
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 20);
        const filtered = (tone * 0.3 + noise * 0.7) * envelope;
        // Soft compression
        data[i] = Math.tanh(filtered * 0.8) * 0.7;
      }
    } else if (soundType === 'lofi_hihat') {
      // Filtered, warm hi-hat
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 25);
        let sample = 0;
        for (let h = 1; h <= 6; h++) {
          const freq = 6000 + h * 1500;
          const amp = Math.pow(0.6, h) * 0.4;
          sample += Math.sin(2 * Math.PI * freq * t) * amp;
        }
        const noise = (Math.random() * 2 - 1) * 0.25;
        data[i] = (sample + noise) * envelope * 0.6;
      }
    } else if (soundType === 'lofi_rhodes') {
      // Rhodes electric piano - warm, bell-like
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(1, t * 5) * Math.exp(-t * 1.2);
        let sample = 0;
        // Rhodes has specific harmonic content
        for (let h = 1; h <= 6; h++) {
          const amp = h === 1 ? 1 : Math.pow(0.55, h - 1) * 0.5;
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        // Add slight detune for warmth
        sample += Math.sin(2 * Math.PI * freq * 1.01 * t) * 0.1;
        data[i] = sample * envelope * 0.35;
      }
    } else if (soundType === 'lofi_bass') {
      // Warm, subby bass
      const bassFreq = freq * 0.5; // One octave down
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 3);
        const osc1 = Math.sin(2 * Math.PI * bassFreq * t);
        const osc2 = Math.sin(2 * Math.PI * bassFreq * 2 * t) * 0.3;
        data[i] = (osc1 + osc2) * envelope * 0.7;
      }
    } else if (soundType === 'lofi_pad') {
      // Warm, pad with slow attack
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const attack = Math.min(1, t * 2);
        const envelope = attack * Math.exp(-t * 0.8);
        let sample = 0;
        for (let h = 1; h <= 4; h++) {
          const amp = Math.pow(0.7, h - 1) * 0.4;
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        data[i] = sample * envelope * 0.3;
      }
    } else if (soundType === 'lofi_vox') {
      // Vocal chop/sample feel
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 20);
        let sample = 0;
        for (let h = 1; h <= 8; h++) {
          const amp = Math.pow(0.65, h - 1) * 0.3;
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        const noise = (Math.random() * 2 - 1) * 0.1;
        data[i] = (sample + noise) * envelope * 0.4;
      }
    }
    
    // Jazz Sounds
    else if (soundType === 'jazz_kick') {
      // Acoustic kick - natural, round
      const kickFreq = 80;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 7);
        const osc1 = Math.sin(2 * Math.PI * kickFreq * t * (1 - t * 0.4));
        const osc2 = Math.sin(2 * Math.PI * kickFreq * 0.5 * t);
        data[i] = (osc1 * 0.65 + osc2 * 0.35) * envelope;
      }
    } else if (soundType === 'jazz_snare') {
      // Brush snare - softer, more texture
      const fundamental = 200;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 10);
        const tone = Math.sin(2 * Math.PI * fundamental * t) * Math.exp(-t * 12);
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 18);
        data[i] = (tone * 0.5 + noise * 0.5) * envelope * 0.6;
      }
    } else if (soundType === 'jazz_ride') {
      // Ride cymbal - bright but controlled
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 8);
        let sample = 0;
        for (let h = 1; h <= 10; h++) {
          const freq = 5000 + h * 1000;
          const amp = Math.pow(0.55, h) * 0.3;
          sample += Math.sin(2 * Math.PI * freq * t) * amp;
        }
        const noise = (Math.random() * 2 - 1) * 0.2;
        data[i] = (sample + noise) * envelope * 0.5;
      }
    } else if (soundType === 'jazz_piano') {
      // Jazz piano - bright, percussive
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(1, t * 20) * Math.exp(-t * 2.5);
        let sample = 0;
        for (let h = 1; h <= 5; h++) {
          const amp = Math.pow(0.65, h - 1);
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        data[i] = sample * envelope * 0.4;
      }
    } else if (soundType === 'jazz_upright') {
      // Upright bass - plucky, natural
      const bassFreq = freq * 0.5;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(1, t * 15) * Math.exp(-t * 2);
        let sample = 0;
        for (let h = 1; h <= 3; h++) {
          const amp = Math.pow(0.7, h - 1);
          sample += Math.sin(2 * Math.PI * bassFreq * h * t) * amp;
        }
        data[i] = sample * envelope * 0.6;
      }
    } else if (soundType === 'jazz_sax') {
      // Saxophone - warm, expressive
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const attack = Math.min(1, t * 8);
        const envelope = attack * Math.exp(-t * 1.2);
        let sample = 0;
        for (let h = 1; h <= 6; h++) {
          const amp = h === 1 ? 1 : Math.pow(0.5, h - 1) * 0.45;
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        data[i] = sample * envelope * 0.3;
      }
    } else if (soundType === 'jazz_trumpet') {
      // Trumpet - bright, brassy
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const attack = Math.min(1, t * 12);
        const envelope = attack * Math.exp(-t * 1.5);
        let sample = 0;
        for (let h = 1; h <= 8; h++) {
          const amp = h <= 3 ? Math.pow(0.6, h - 1) : Math.pow(0.4, h - 3) * 0.3;
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        data[i] = sample * envelope * 0.28;
      }
    }
    
    // Hip-Hop Sounds (Nujabes/J Dilla inspired)
    else if (soundType === 'hiphop_kick') {
      // Punchy, compressed kick
      const kickFreq = 70;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 9);
        const osc1 = Math.sin(2 * Math.PI * kickFreq * t * (1 - t * 0.5));
        const osc2 = Math.sin(2 * Math.PI * kickFreq * 0.5 * t);
        const raw = (osc1 * 0.7 + osc2 * 0.3);
        // Compression/saturation
        data[i] = Math.tanh(raw * 1.3) * envelope;
      }
    } else if (soundType === 'hiphop_snare') {
      // Crisp, snappy snare
      const fundamental = 200;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 18);
        const tone = Math.sin(2 * Math.PI * fundamental * t) * Math.exp(-t * 22);
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 28);
        const raw = (tone * 0.35 + noise * 0.65);
        data[i] = Math.tanh(raw * 1.1) * envelope;
      }
    } else if (soundType === 'hiphop_hihat') {
      // Tight, crisp hi-hat
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 35);
        let sample = 0;
        for (let h = 1; h <= 8; h++) {
          const freq = 8000 + h * 2000;
          const amp = Math.pow(0.5, h) * 0.5;
          sample += Math.sin(2 * Math.PI * freq * t) * amp;
        }
        const noise = (Math.random() * 2 - 1) * 0.35;
        data[i] = (sample + noise) * envelope * 0.7;
      }
    } else if (soundType === 'hiphop_808') {
      // Deep, subby 808 with pitch slide
      const baseFreq = freq * 0.5;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const slide = 1 + t * 0.3; // Pitch slide up
        const envelope = Math.exp(-t * 4);
        const osc1 = Math.sin(2 * Math.PI * baseFreq * slide * t);
        const osc2 = Math.sin(2 * Math.PI * baseFreq * slide * 2 * t) * 0.4;
        data[i] = (osc1 + osc2) * envelope * 0.8;
      }
    } else if (soundType === 'hiphop_pad') {
      // Warm, jazzy pad (Nujabes style)
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const attack = Math.min(1, t * 1.5);
        const envelope = attack * Math.exp(-t * 0.6);
        let sample = 0;
        for (let h = 1; h <= 5; h++) {
          const amp = Math.pow(0.75, h - 1) * 0.35;
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        // Add slight detune for warmth
        sample += Math.sin(2 * Math.PI * freq * 1.005 * t) * 0.15;
        data[i] = sample * envelope * 0.25;
      }
    } else if (soundType === 'hiphop_chop') {
      // Chopped sample feel - quick attack
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(1, t * 30) * Math.exp(-t * 8);
        let sample = 0;
        for (let h = 1; h <= 6; h++) {
          const amp = Math.pow(0.7, h - 1) * 0.4;
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        data[i] = sample * envelope * 0.4;
      }
    } else if (soundType === 'hiphop_stab') {
      // Stab - quick, punchy
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(1, t * 25) * Math.exp(-t * 12);
        let sample = 0;
        for (let h = 1; h <= 4; h++) {
          const amp = Math.pow(0.65, h - 1);
          sample += Math.sin(2 * Math.PI * freq * h * t) * amp;
        }
        data[i] = sample * envelope * 0.5;
      }
    }
    
    // Drill Sounds
    else if (soundType === 'drill_kick') {
      // Hard, aggressive kick
      const kickFreq = 65;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 10);
        const osc1 = Math.sin(2 * Math.PI * kickFreq * t * (1 - t * 0.6));
        const osc2 = Math.sin(2 * Math.PI * kickFreq * 0.5 * t);
        const raw = (osc1 * 0.75 + osc2 * 0.25);
        data[i] = Math.tanh(raw * 1.5) * envelope;
      }
    } else if (soundType === 'drill_snare') {
      // Hard, clap-like snare
      const fundamental = 220;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 20);
        const tone = Math.sin(2 * Math.PI * fundamental * t) * Math.exp(-t * 25);
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 30);
        const raw = (tone * 0.3 + noise * 0.7);
        data[i] = Math.tanh(raw * 1.2) * envelope;
      }
    } else if (soundType === 'drill_hihat') {
      // Fast, rolling hi-hat
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 40);
        let sample = 0;
        for (let h = 1; h <= 6; h++) {
          const freq = 9000 + h * 2500;
          const amp = Math.pow(0.5, h) * 0.6;
          sample += Math.sin(2 * Math.PI * freq * t) * amp;
        }
        const noise = (Math.random() * 2 - 1) * 0.4;
        data[i] = (sample + noise) * envelope * 0.8;
      }
    } else if (soundType === 'drill_808') {
      // Deep, distorted 808
      const baseFreq = freq * 0.5;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const slide = 1 + t * 0.4;
        const envelope = Math.exp(-t * 3.5);
        const osc1 = Math.sin(2 * Math.PI * baseFreq * slide * t);
        const osc2 = Math.sin(2 * Math.PI * baseFreq * slide * 2 * t) * 0.5;
        const raw = (osc1 + osc2);
        data[i] = Math.tanh(raw * 1.4) * envelope * 0.9;
      }
    } else if (soundType === 'drill_synth') {
      // Dark, aggressive synth
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(1, t * 8) * Math.exp(-t * 2);
        const sawtooth = 2 * ((t * freq) % 1) - 1;
        const square = sawtooth > 0 ? 1 : -1;
        const raw = (sawtooth * 0.7 + square * 0.3);
        data[i] = Math.tanh(raw * 1.1) * envelope * 0.35;
      }
    } else if (soundType === 'drill_perc') {
      // Sharp percussion
      const percFreq = 1200;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 45);
        const noise = (Math.random() * 2 - 1);
        const tone = Math.sin(2 * Math.PI * percFreq * t);
        data[i] = (tone * 0.4 + noise * 0.6) * envelope * 0.7;
      }
    } else if (soundType === 'drill_fx') {
      // FX - riser/sweep
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const sweepFreq = 200 + t * 3000;
        const envelope = Math.exp(-t * 2);
        const noise = (Math.random() * 2 - 1);
        const tone = Math.sin(2 * Math.PI * sweepFreq * t);
        data[i] = (tone * 0.5 + noise * 0.5) * envelope * 0.4;
      }
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  };

  const playSound = (row: number, col?: number) => {
    if (!audioContextRef.current) return;
    
    const soundType = sounds[row]?.type;
    if (!soundType) return;
    
    // Get note from cell if provided, otherwise use default
    let note = 60; // Default C4
    if (col !== undefined && grid[row] && grid[row][col]) {
      note = grid[row][col].note || 60;
    }
    
    try {
      const source = generateSound(soundType, note);
      const gainNode = audioContextRef.current.createGain();
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Volume adjustments based on sound type - increased volumes for better sound
      let baseVolume = 0.4;
      if (soundType.includes('kick') || soundType.includes('808') || soundType.includes('bass') || soundType.includes('upright')) {
        baseVolume = 0.85;
      } else if (soundType.includes('snare')) {
        baseVolume = 0.65;
      } else if (soundType.includes('hihat') || soundType.includes('ride')) {
        baseVolume = 0.5;
      } else if (soundType.includes('pad') || soundType.includes('rhodes')) {
        baseVolume = 0.45;
      } else if (soundType.includes('piano') || soundType.includes('sax') || soundType.includes('trumpet')) {
        baseVolume = 0.5;
      }
      
      gainNode.gain.value = baseVolume;
      
      source.start(audioContextRef.current.currentTime);
      source.stop(audioContextRef.current.currentTime + 1);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleCellMouseDown = (row: number, col: number) => {
    isDraggingRef.current = true;
    dragStartRef.current = { row, col };
    dragValueRef.current = !grid[row][col].active;
    
    // Toggle the initial cell
    const newGrid = grid.map((r, i) => 
      i === row ? r.map((c, j) => {
        if (j === col) {
          return { active: !c.active, note: c.note || 60 };
        }
        return c;
      }) : r
    );
    setGrid(newGrid);
    gridRef.current = newGrid;
    playSound(row, col);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isDraggingRef.current && dragStartRef.current && dragValueRef.current !== null) {
      const newGrid = grid.map((r, i) => 
        r.map((c, j) => {
          // Check if this cell is in the drag rectangle
          const minRow = Math.min(dragStartRef.current!.row, row);
          const maxRow = Math.max(dragStartRef.current!.row, row);
          const minCol = Math.min(dragStartRef.current!.col, col);
          const maxCol = Math.max(dragStartRef.current!.col, col);
          
          if (i >= minRow && i <= maxRow && j >= minCol && j <= maxCol) {
            return { active: dragValueRef.current as boolean, note: c.note || 60 };
          }
          return c;
        })
      );
      setGrid(newGrid);
      gridRef.current = newGrid;
    }
  };

  const handleCellMouseUp = () => {
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;
    dragStartRef.current = null;
    dragValueRef.current = null;
    return wasDragging;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleCellMouseUp();
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const toggleCell = (row: number, col: number, wasDragging?: boolean) => {
    // Only toggle if this wasn't part of a drag operation
    if (!wasDragging && !isDraggingRef.current) {
      const newGrid = grid.map((r, i) => 
        i === row ? r.map((c, j) => {
          if (j === col) {
            return { active: !c.active, note: c.note || 60 };
          }
          return c;
        }) : r
      );
      setGrid(newGrid);
      playSound(row, col);
    }
  };

  const updateCellNote = (row: number, col: number, note: number) => {
    const newGrid = grid.map((r, i) => 
      i === row ? r.map((c, j) => {
        if (j === col) {
          return { active: true, note }; // Keep active when changing note
        }
        return c;
      }) : r
    );
    setGrid(newGrid);
    gridRef.current = newGrid;
    // Play preview of the new note
    playSound(row, col);
  };

  const playBeat = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      setIsPlaying(true);
      setCurrentStep(0);
      const stepDuration = (60 / bpm / 4) * 1000; // 16th notes
      
      // Play first step immediately
      const currentGrid = gridRef.current;
      currentGrid.forEach((row, rowIndex) => {
        if (row[0]?.active) {
          playSound(rowIndex, 0);
        }
      });
      
      intervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % 16;
          
          // Use the latest grid from ref to be responsive to changes
          const currentGrid = gridRef.current;
          currentGrid.forEach((row, rowIndex) => {
            if (row[nextStep]?.active) {
              playSound(rowIndex, nextStep);
            }
          });
          
          return nextStep;
        });
      }, stepDuration);
    }
  };

  const clearGrid = () => {
    const newGrid = Array(sounds.length).fill(null).map(() => 
      Array(16).fill(null).map(() => ({ active: false, note: 60 }))
    );
    setGrid(newGrid);
    gridRef.current = newGrid;
  };

  return (
    <Window title="FL Studio" icon="🎵" onClose={onClose} initialWidth={1000} initialHeight={800}>
      <div className="flstudio-app">
        <div className="flstudio-header">
          <div className="beat-type-selector">
            <label>Beat Type:</label>
            {(['lofi', 'jazz', 'hiphop', 'drill'] as BeatType[]).map((type) => (
              <button
                key={type}
                className={`beat-type-btn ${beatType === type ? 'active' : ''}`}
                onClick={() => setBeatType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="flstudio-controls">
            <button className="fl-button play-btn" onClick={playBeat}>
              {isPlaying ? '⏸ Stop' : '▶ Play'}
            </button>
            <button className="fl-button" onClick={clearGrid}>Clear</button>
            <div className="bpm-control">
              <label>BPM:</label>
              <input
                type="number"
                min="60"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="bpm-input"
              />
            </div>
          </div>
        </div>
        <div className="flstudio-sequencer">
          <div className="sound-labels">
            {sounds.map((sound, index) => (
              <div key={index} className="sound-label">
                {sound.name}
                {sound.melodic && <span className="melodic-indicator">🎹</span>}
              </div>
            ))}
          </div>
          <div className="sequencer-grid">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="sequencer-row">
                {row.map((cell, colIndex) => {
                  const sound = sounds[rowIndex];
                  const isMelodic = sound?.melodic;
                  const noteName = isMelodic && cell.active ? 
                    `${NOTES[cell.note! % 12]}${Math.floor(cell.note! / 12) - 1}` : '';
                  
                  return (
                    <div key={colIndex} className="cell-wrapper">
                      <button
                        className={`sequencer-cell ${cell.active ? 'active' : ''} ${
                          currentStep === colIndex && isPlaying ? 'playing' : ''
                        } ${isMelodic ? 'melodic' : ''}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCellMouseDown(rowIndex, colIndex);
                        }}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                        onMouseUp={() => {
                          const wasDragging = handleCellMouseUp();
                          if (!wasDragging) {
                            toggleCell(rowIndex, colIndex, false);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (isMelodic) {
                            // Activate cell if not active
                            if (!cell.active) {
                              const newGrid = grid.map((r, i) => 
                                i === rowIndex ? r.map((c, j) => {
                                  if (j === colIndex) {
                                    return { active: true, note: c.note || 60 };
                                  }
                                  return c;
                                }) : r
                              );
                              setGrid(newGrid);
                              gridRef.current = newGrid;
                            }
                            setEditingCell({ row: rowIndex, col: colIndex });
                          }
                        }}
                      >
                        {isMelodic && cell.active && (
                          <span className="note-indicator">{noteName}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {editingCell && (
          <div className="note-selector-overlay" onClick={() => setEditingCell(null)}>
            <div className="note-selector" onClick={(e) => e.stopPropagation()}>
              <h3>Select Note</h3>
              <div className="note-buttons">
                {Array.from({ length: 25 }, (_, i) => {
                  const note = 48 + i; // C3 to C5
                  const noteName = `${NOTES[note % 12]}${Math.floor(note / 12) - 1}`;
                  return (
                    <button
                      key={note}
                      className={`note-btn ${grid[editingCell.row][editingCell.col].note === note ? 'selected' : ''}`}
                      onClick={() => {
                        updateCellNote(editingCell.row, editingCell.col, note);
                        playSound(editingCell.row, editingCell.col);
                      }}
                    >
                      {noteName}
                    </button>
                  );
                })}
              </div>
              <button className="fl-button" onClick={() => setEditingCell(null)}>Close</button>
            </div>
          </div>
        )}
        <div className="flstudio-info">
          <p>Click or drag cells to add sounds. Right-click melodic instruments to change notes. Each row is a different sound, columns are time steps.</p>
        </div>
      </div>
    </Window>
  );
};

export default FLStudioApp;


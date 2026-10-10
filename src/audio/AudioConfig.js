/**
 * @file AudioConfig.js
 * Centralized audio configurations for Batman: Gotham Nights.
 * Easily customize volumes, track tempos, pitch frequencies, and sound properties here.
 */

export const AUDIO_CONFIG = {
  // Global volume settings (0.0 to 1.0)
  VOLUMES: {
    MASTER: 0.85,
    BGM: 0.35,
    SFX: 0.55,
  },

  // Background music tempos (BPM)
  TEMPOS: {
    ROOFTOPS: 116, // Main Batman Gotham theme
    BOSS: 138,     // High-intensity boss combat theme
    MENU: 98,      // Atmospheric brooding menu theme
  },

  // Sound effect parameters
  SFX: {
    BATARANG_THROW: {
      startFreq: 620,
      endFreq: 180,
      duration: 0.11,
      volume: 0.28,
    },
    BATMAN_HIT: {
      startFreq: 180,
      endFreq: 45,
      duration: 0.18,
      volume: 0.38,
    },
    ENEMY_HIT: {
      startFreq: 140,
      endFreq: 50,
      duration: 0.15,
      volume: 0.3,
    },
    ENEMY_KILL: {
      startFreq: 320,
      endFreq: 70,
      duration: 0.26,
      volume: 0.32,
    },
    JOKER_LAUGH: {
      notes: [440, 523.25, 415.3, 587.33], // Maniacal arpeggio
      noteDuration: 0.06,
      noteInterval: 0.07,
      volume: 0.22,
    },
    TEETH_CHATTER: {
      clicks: 4,
      baseFreq: 900,
      volume: 0.18,
    },
    SCARECROW_GAS: {
      filterFreq: 1400,
      duration: 0.35,
      volume: 0.26,
    },
    FEAR_DRONE: {
      startFreq: 95,
      peakFreq: 260,
      endFreq: 75,
      duration: 0.6,
      volume: 0.35,
    },
    GAS_BOMB: {
      startFreq: 160,
      endFreq: 35,
      duration: 0.3,
      volume: 0.32,
    },
    PENGUIN_UMBRELLA: {
      startFreq: 1200,
      endFreq: 220,
      duration: 0.16,
      volume: 0.3,
    },
    GUNSHOT: {
      startFreq: 450,
      endFreq: 60,
      duration: 0.14,
      volume: 0.35,
    },
    COIN_PING: {
      freq1: 2489, // High D#7 chime
      freq2: 2793, // High F7 chime
      duration: 0.35,
      volume: 0.25,
    },
  },
};

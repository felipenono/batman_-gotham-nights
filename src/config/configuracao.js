// Este arquivo cuida de reunir as configurações compartilhadas do jogo.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
// ===== TELAS, BAT-SINAL E PONTUAÇÃO =====
// Caminhos públicos são relativos à raiz do site. Os identificadores das cenas permanecem estáveis.
export const LOBBY = {
  textosMenu: {
    marcaAcessivel: "Batman: Noites de Gotham",
    selo: "DC",
    marcaLinha1: "GOTHAM",
    marcaLinha2: "KNIGHTS",
    genero: "AÇÃO & SOBREVIVÊNCIA",
    edicao: "EDIÇÃO NOTURNA",
    chamada: "QUANDO A CIDADE DORME",
    titulo: "BATMAN",
    subtitulo: "NOITES DOS VILÕES",
    descricao: "A noite pertence aos que não têm medo.",
    menu: "Menu principal",
    navegar: "NAVEGAR",
    selecionar: "SELECIONAR",
    cidade: "GOTHAM CITY",
    horario: "00:07 AM",
    rodape: "A CIDADE PRECISA DE VOCÊ.",
    volume: "Volume"
  },
  menuLabels: {
    mute: "Silenciar áudio",
    unmute: "Ativar áudio",
    muted: "SOM DESLIGADO",
    music: "TRILHA SONORA"
  },
  // Pontuação: tipos usam a propriedade estável scoreType das entidades.
  scoring: {
    mob: 100,
    boss: 500,
    mobTypes: {},
    bossTypes: {},
    timeBonuses: [
      {
        seconds: 90,
        points: 1000
      },
      {
        seconds: 180,
        points: 500
      },
      {
        seconds: 300,
        points: 250
      },
      {
        seconds: Infinity,
        points: 100
      }
    ],
    storageKey: "gotham-nights.best-score.v1",
    countDuration: 1400,
    pulseDuration: 300,
    pulseScale: 0.1,
    colors: {
      panel: "#091422e6",
      text: "#e6e9ed",
      accent: "#e9c46a",
      muted: "#91a3b7"
    },
    font: "Impact, \"Arial Narrow\", sans-serif",
    labels: {
      score: "PONTOS",
      time: "TEMPO DA FASE",
      mobs: "MOBS DERROTADOS",
      bosses: "CHEFÕES DERROTADOS",
      bonus: "BÔNUS DE TEMPO",
      previousBonus: "BÔNUS DAS FASES ANTERIORES",
      record: "NOVO RECORDE!",
      paused: "JOGO PAUSADO",
      resume: "CONTINUAR",
      pauseHint: "ESC / P · PAUSAR",
      resumeHint: "ESC / P · CONTINUAR"
    }
  },
  assets: {
    logo: "assets/images/logo.png",
    music: "assets/audio/lobby_theme.mp3",
    click: "assets/audio/menu_click.mp3"
  },
  base: {
    width: 1920,
    height: 1080
  },
  colors: {
    sky: "#080e19",
    horizon: "#263c50",
    far: "#1b2b3a",
    middle: "#111f2d",
    near: "#080f19",
    window: "#c6ac69",
    accent: "#e9c46a",
    text: "#e6e9ed"
  },
  audio: {
    volume: 0.45,
    effects: 0.65,
    fadeIn: 1800,
    fadeOut: 800
  },
  motion: {
    transition: 900,
    pulse: 4800,
    fog: 22000,
    parallax: 22,
    gamepadRepeat: 220,
    stickThreshold: 0.55
  },
  // Bat-Sinal inteiramente 2D. Posições relativas; dimensões na resolução base.
  batSignal: {
    moon: {
      x: 0.75,
      y: 0.21,
      radius: 82,
      craterOpacity: 0.09,
      narrowX: 0.8,
      narrowY: 0.12,
      narrowScale: 0.72
    },
    symbolScale: 0.83,
    logoBackground: "auto",
    maskContrast: 12,
    maskMaxSize: 512,
    fadeIn: 2400,
    intensity: 0.8,
    glowIntensity: 0.65,
    haloRadius: 2.6,
    beamWidth: 1.9,
    beamOpacity: 0.28,
    beamEdgeSoftness: 1.7,
    sourceWidth: 7,
    sourceX: 0.84,
    flickerSpeed: 0.34,
    flickerAmount: 0.035,
    dustCount: 22,
    dustSpeed: 0.018,
    dustOpacity: 0.22,
    mistOpacity: 0.1,
    mistSpeed: 0.025,
    rimIntensity: 0.24,
    rimDistance: 190,
    textureSize: 256,
    colors: {
      moon: "#cdd1b6",
      crater: "#788c94",
      beam: "#fff1bd",
      halo: "#dfebcf",
      dust: "#fff3cc",
      rim: "#e5d9aa",
      fixture: "#182331",
      fixtureEdge: "#71818b",
      symbol: "#000000"
    },
    // Mesmo recorte geométrico do placeholder da logo; só usado se o asset falhar.
    placeholder: [
      [0, 0],
      [0.35, 0.3],
      [0.42, 0],
      [0.5, 0.24],
      [0.58, 0],
      [0.65, 0.3],
      [1, 0],
      [0.8, 0.65],
      [0.5, 1],
      [0.2, 0.65]
    ]
  },
  targetScene: "GameScene",
  // Uma cena recebe o resultado e os dados; esta seção controla suas variações.
  endScreens: {
    transition: 850,
    titleEntrance: 1100,
    inputDelay: 450,
    demo: {
      score: 14800,
      bestScore: 22500,
      elapsedSeconds: 754,
      levelIndex: 1
    },
    features: {
      twoPlayers: false,
      skinPreview: false,
      nextLevel: false
    },
    nextScene: "NextLevelScene",
    assets: { skinPlaceholder: "" },
    labels: {
      report: "RELATÓRIO DE PATRULHA",
      city: "GOTHAM CITY",
      score: "PONTUAÇÃO FINAL",
      bestScore: "MELHOR PONTUAÇÃO",
      time: "TEMPO DE JOGO",
      demo: "DADOS ILUSTRATIVOS",
      navigation: "NAVEGAR",
      select: "SELECIONAR",
      back: "VOLTAR AO MENU",
      soon: "EM BREVE",
      nextReady: "CONTINUE A MISSÃO",
      medals: "MEDALHAS",
      players: "RESULTADO DA EQUIPE",
      player: "JOGADOR",
      skin: "TRAJE EQUIPADO",
      skinPlaceholder: "SELEÇÃO DE SKIN EM BREVE",
      music: "TRILHA SONORA",
      muted: "SOM DESLIGADO",
      mute: "Silenciar áudio",
      unmute: "Ativar áudio",
      volume: "Volume",
      logo: "Símbolo do Batman"
    },
    colors: {
      text: "#e6e9ed",
      muted: "#91a3b7",
      panel: "#091422c9",
      border: "#8598ad38",
      fog: "#98b1c9",
      rain: "#b9d3ee35",
      sparkle: "#f9d783",
      placeholder: "#66768b"
    },
    screens: {
      defeat: {
        title: "VOCÊ FOI DERROTADO",
        eyebrow: "A NOITE AINDA NÃO TERMINOU",
        description: "Até os maiores heróis precisam se levantar outra vez.",
        footer: "GOTHAM AINDA PRECISA DE VOCÊ.",
        accent: "#d9b967",
        glow: "#9b253940",
        audio: {
          music: "assets/audio/defeat.mp3",
          fallbackTrack: "defeat",
          tempo: 58,
          notes: [
            146.83,
            130.81,
            116.54,
            110
          ],
          fadeIn: 1700,
          fadeOut: 700,
          gain: 0.75,
          cue: "gameover"
        },
        background: {
          colors: {
            sky: "#040913",
            horizon: "#182c40",
            far: "#112131",
            middle: "#0b1726",
            near: "#060e19"
          },
          weather: {
            rainCount: 85,
            fogOpacity: 0.2,
            fogStart: 0.2
          },
          signal: {
            intensity: 0.065,
            glowIntensity: 0.16,
            flickerAmount: 0.28,
            flickerSpeed: 0.24,
            dustCount: 5,
            colors: {
              moon: "#516679",
              halo: "#8299b6"
            }
          }
        },
        particles: {
          count: 0,
          speed: 0.015,
          opacity: 0.25
        },
        buttons: [{
          id: "retry",
          label: "TENTAR NOVAMENTE",
          detail: "RETOME SUA MISSÃO",
          scene: "RetryScene",
          enabled: true
        }, {
          id: "menu",
          label: "VOLTAR AO MENU",
          detail: "RETORNAR AO LOBBY",
          scene: "MenuScene",
          enabled: true
        }]
      },
      victory: {
        title: "GOTHAM ESTÁ SALVA",
        eyebrow: "MISSÃO CUMPRIDA",
        description: "A escuridão recua. A esperança permanece.",
        footer: "O SÍMBOLO DE GOTHAM CONTINUA ACESO.",
        accent: "#e9c46a",
        glow: "#e9c46a55",
        audio: {
          music: "assets/audio/victory.mp3",
          fallbackTrack: "victory",
          tempo: 86,
          notes: [
            146.83,
            196,
            220,
            293.66
          ],
          fadeIn: 1800,
          fadeOut: 700,
          gain: 0.85,
          cue: "victory"
        },
        background: {
          colors: {
            sky: "#101c2c",
            horizon: "#53687a",
            far: "#2e4356",
            middle: "#1a2e40",
            near: "#0a1827"
          },
          weather: {
            rainCount: 0,
            fogOpacity: 0.025,
            fogStart: 0.12,
            fogDissipate: 5500
          },
          signal: {
            intensity: 0.95,
            glowIntensity: 0.95,
            beamOpacity: 0.34,
            flickerAmount: 0.02
          }
        },
        particles: {
          count: 28,
          speed: 0.015,
          opacity: 0.25
        },
        buttons: [
          {
            id: "replay",
            label: "JOGAR NOVAMENTE",
            detail: "UMA NOVA PATRULHA",
            scene: "GameScene",
            enabled: true
          },
          {
            id: "menu",
            label: "VOLTAR AO MENU",
            detail: "RETORNAR AO LOBBY",
            scene: "MenuScene",
            enabled: true
          },
          {
            id: "next",
            label: "PRÓXIMA FASE",
            detail: "EM BREVE",
            scene: "NextLevelScene",
            enabled: false
          }
        ]
      }
    }
  },
  buttons: [
    {
      id: "start",
      label: "INICIAR",
      detail: "ENTRE NA ESCURIDÃO",
      enabled: true,
      scene: "GameScene"
    },
    {
      id: "skins",
      label: "TROCAR SKIN",
      detail: "EM BREVE",
      enabled: false,
      scene: "SkinScene"
    },
    {
      id: "coop",
      label: "2 JOGADORES",
      detail: "EM BREVE",
      enabled: false,
      scene: "CoopScene"
    }
  ]
};
// Recebe um caminho público e inclui a pasta-base usada na publicação.
export function assetURL(caminho) {
  return `${import.meta.env?.BASE_URL ?? "/"}${caminho}`;
}
// ===== PARTIDA, FASES E CONTROLES =====
export const GAME = {
  DEBUG: false,
  WIDTH: 900,
  RENDER_WIDTH: 1920,
  RENDER_HEIGHT: 1080,
  JUMP_BUFFER_FRAMES: 6,
  COYOTE_FRAMES: 6,
  HEIGHT: 500,
  GRAVITY: 0.6,
  SPAWN_INTERVAL: 300,
  LIVES: 5,
  BATMAN_HP_PER_LIFE: 3,
  RESPAWN_INTANGIBLE_FRAMES: 60,
  DEATH_ANIMATION_FRAMES: 30
};
export const PROJECTILE = {
  BATARANG_SPEED: 10,
  BATARANG_DAMAGE: 10,
  BATARANG_COOLDOWN: 30,
  BATARANG_MAX_ACTIVE: 5,
  BULLET_SPEED: 8,
  TEETH_SPEED: 6,
  SMOKE_SPEED: 1.5,
  COIN_SPEED: 7,
  UMBRELLA_SPEED: 8,
  UMBRELLA_TURN_RATE: 0.035,
  UMBRELLA_TRACKING_FRAMES: 60,
  PENGUIN_BOMB_SPEED: 5,
  PENGUIN_BOMB_FUSE: 120,
  PENGUIN_BOMB_RADIUS: 46,
  PENGUIN_BOMB_BLAST_FRAMES: 24,
  GAS_BOMB_SPEED: 6
};
export const LEVELS = {
  LEVEL_1: {
    id: 1,
    name: "TELHADOS DE GOTHAM",
    subtitle: "Anoitecer em Gotham",
    commonEnemy: "Joker",
    enemyRoster: ["Joker", "ScarecrowAcolyte"],
    boss: "Scarecrow",
    bosses: ["Joker", "Scarecrow"],
    killThreshold: 10,
    background: "Level1Background"
  },
  LEVEL_2: {
    id: 2,
    name: "SALÃO ICEBERG",
    subtitle: "O clube de apostas de Cobblepot",
    commonEnemy: "Penguin",
    enemyRoster: ["Penguin", "HarleyThug"],
    boss: "HarleyQuinn",
    killThreshold: 15,
    background: "Level2Background"
  },
  LEVEL_3: {
    id: 3,
    name: "ASILO ARKHAM",
    subtitle: "Contenção de segurança máxima",
    commonEnemy: "Penguin",
    boss: "TwoFace",
    killThreshold: 10,
    enemyRoster: ["TwoFaceEnforcer", "PenguinElite"],
    background: "Level3Background"
  }
};
export const KEYS = {
  LEFT: [
    "ArrowLeft",
    "a",
    "A"
  ],
  RIGHT: [
    "ArrowRight",
    "d",
    "D"
  ],
  JUMP: [
    "ArrowUp",
    "w",
    "W",
    " "
  ],
  SHOOT: [
    "x",
    "X",
    "z",
    "Z",
    "c",
    "C",
    "v",
    "V",
    "j",
    "J",
    "k",
    "K",
    "f",
    "F",
    "q",
    "Q",
    "e",
    "E",
    "Control",
    "Shift"
  ],
  START: [" ", "Enter"]
};
export const LIGHTING = { INTENSITY: 0.45 };
export const LOGO_GOLD = "#695525";
// ===== ÁUDIO =====
export const AUDIO_CONFIG = {
  // Volumes entre 0 (silêncio) e 1 (máximo).
  VOLUMES: {
    MASTER: 0.85,
    BGM: 0.35,
    SFX: 0.55
  },
  // Andamento das músicas em batidas por minuto.
  TEMPOS: {
    ROOFTOPS: 116,
    BOSS: 138,
    MENU: 98
  },
  SFX: {
    BATARANG_THROW: {
      startFreq: 620,
      endFreq: 180,
      duration: 0.11,
      volume: 0.28
    },
    BATMAN_HIT: {
      startFreq: 180,
      endFreq: 45,
      duration: 0.18,
      volume: 0.38
    },
    ENEMY_HIT: {
      startFreq: 140,
      endFreq: 50,
      duration: 0.15,
      volume: 0.3
    },
    ENEMY_KILL: {
      startFreq: 320,
      endFreq: 70,
      duration: 0.26,
      volume: 0.32
    },
    JOKER_LAUGH: {
      notes: [
        440,
        523.25,
        415.3,
        587.33
      ],
      noteDuration: 0.06,
      noteInterval: 0.07,
      volume: 0.22
    },
    TEETH_CHATTER: {
      clicks: 4,
      baseFreq: 900,
      volume: 0.18
    },
    SCARECROW_GAS: {
      filterFreq: 1400,
      duration: 0.35,
      volume: 0.26
    },
    FEAR_DRONE: {
      startFreq: 95,
      peakFreq: 260,
      endFreq: 75,
      duration: 0.6,
      volume: 0.35
    },
    GAS_BOMB: {
      startFreq: 160,
      endFreq: 35,
      duration: 0.3,
      volume: 0.32
    },
    PENGUIN_UMBRELLA: {
      startFreq: 1200,
      endFreq: 220,
      duration: 0.16,
      volume: 0.3
    },
    GUNSHOT: {
      startFreq: 450,
      endFreq: 60,
      duration: 0.14,
      volume: 0.35
    },
    COIN_PING: {
      freq1: 2489,
      freq2: 2793,
      duration: 0.35,
      volume: 0.25
    }
  }
};
// ===== MAPAS DAS FASES =====
export const MUNDO = {
  "largura": 1100,
  "altura": 500,
  "alturaChao": 60,
  "inicio": {
    "x": 80,
    "y": 340
  },
  "plataformas": {
    "1": [
      {
        "x": 0,
        "y": 440,
        "w": 1100,
        "h": 60,
        "theme": "rooftop",
        "oneWay": false
      },
      {
        "x": 140,
        "y": 340,
        "w": 130,
        "h": 24,
        "theme": "ac_unit",
        "oneWay": true
      },
      {
        "x": 380,
        "y": 260,
        "w": 220,
        "h": 26,
        "theme": "rooftop",
        "oneWay": true
      },
      {
        "x": 720,
        "y": 330,
        "w": 160,
        "h": 22,
        "theme": "pipe",
        "oneWay": true
      },
      {
        "x": 500,
        "y": 160,
        "w": 140,
        "h": 18,
        "theme": "pipe",
        "oneWay": true
      }
    ],
    "2": [
      {
        "x": 0,
        "y": 440,
        "w": 1100,
        "h": 60,
        "theme": "casino",
        "oneWay": false
      },
      {
        "x": 120,
        "y": 330,
        "w": 170,
        "h": 22,
        "theme": "casino",
        "oneWay": true
      },
      {
        "x": 390,
        "y": 240,
        "w": 240,
        "h": 24,
        "theme": "casino",
        "oneWay": true
      },
      {
        "x": 740,
        "y": 320,
        "w": 180,
        "h": 22,
        "theme": "casino",
        "oneWay": true
      },
      {
        "x": 440,
        "y": 150,
        "w": 150,
        "h": 18,
        "theme": "casino",
        "oneWay": true
      }
    ],
    "3": [
      {
        "x": 0,
        "y": 440,
        "w": 1100,
        "h": 60,
        "theme": "asylum",
        "oneWay": false
      },
      {
        "x": 110,
        "y": 340,
        "w": 160,
        "h": 22,
        "theme": "asylum",
        "oneWay": true
      },
      {
        "x": 370,
        "y": 250,
        "w": 250,
        "h": 24,
        "theme": "asylum",
        "oneWay": true
      },
      {
        "x": 730,
        "y": 330,
        "w": 170,
        "h": 22,
        "theme": "asylum",
        "oneWay": true
      },
      {
        "x": 420,
        "y": 160,
        "w": 160,
        "h": 20,
        "theme": "asylum",
        "oneWay": true
      }
    ]
  }
};
// ===== PARTITURAS E ANIMAÇÕES =====
export const PARTITURAS = {
  baixoTelhados: [
    73.42,
    73.42,
    73.42,
    73.42,
    73.42,
    73.42,
    73.42,
    73.42,
    58.27,
    58.27,
    58.27,
    58.27,
    65.41,
    65.41,
    69.3,
    73.42
  ],
  acordesMenu: [
    146.83,
    116.54,
    130.81,
    138.59
  ]
};
export const ANIMACAO = {
  tamanho: 256,
  ancoraX: 128,
  ancoraY: 160,
  resolucao: 2,
  limiteCache: 64,
  quadros: {
    idle: 8,
    walk: 12,
    jump: 4,
    attack: 6,
    hurt: 4,
    death: 10
  }
};
// ===== CORES, FONTES E TEXTOS DO DESENHO 2D =====
// Cada grupo corresponde ao arquivo que o utiliza. A ordem segue as camadas de desenho.
export const APARENCIA = {
  "Game": { "preenchimento1": "#03060c" },
  "Platform": {
    "gradiente1": "#334155",
    "gradiente2": "#1e293b",
    "gradiente3": "#0f172a",
    "preenchimento4": "#64748b",
    "preenchimento6": "#475569",
    "preenchimento9": "#94a3b8",
    "gradiente11": "#cbd5e1",
    "gradiente15": "#451a03",
    "gradiente16": "#78350f",
    "gradiente17": "#291003",
    "preenchimento18": "#fbbf24",
    "preenchimento19": "#fef08a",
    "gradiente20": "#27272a",
    "gradiente21": "#18181b",
    "gradiente22": "#09090b",
    "preenchimento23": "#713f12",
    "contorno24": "#3f3f46",
    "preenchimento25": "#a1a1aa"
  },
  "GothamBackdrop": {
    "gradiente1": "#8fa9bc",
    "gradiente2": "#c0d7e414",
    "preenchimento3": "#d2926c80",
    "gradiente4": "#b6b78d24",
    "gradiente5": "#c6b98c45",
    "gradiente6": "#04080d22",
    "gradiente7": "#02050be8"
  },
  "BossManager": {
    "preenchimento1": "rgba(0, 0, 0, 0.45)",
    "contorno2": "#eab308",
    "fonte1": "900 28px \"Arial Black\", Impact, sans-serif",
    "preenchimento3": "#fef08a",
    "brilho4": "#dc2626"
  },
  "CombatSystem": {
    "gradiente1": "#fbbf24",
    "gradiente2": "#f59e0b",
    "gradiente3": "#ef4444",
    "gradiente5": "#ffffff",
    "gradiente6": "#7c3aed",
    "gradiente7": "#facc15"
  },
  "HUD": {
    "preenchimento1": "rgba(5, 10, 20, 0.82)",
    "fonte1": "900 11px \"Arial Black\", sans-serif",
    "preenchimento2": "#94a3b8",
    "texto1": "VIDAS",
    "preenchimento3": "#64748b",
    "texto2": "SAÚDE",
    "gradiente4": "#22c55e",
    "gradiente5": "#1e293b",
    "gradiente6": "#86efac",
    "gradiente7": "#334155",
    "gradiente8": "#fbbf24",
    "fonte2": "700 12px monospace",
    "preenchimento10": "#cbd5e1",
    "fonte3": "900 16px \"Arial Black\", sans-serif",
    "preenchimento11": "#fef08a",
    "brilho12": "#ca8a04",
    "fonte5": "800 12px \"Courier New\", monospace",
    "gradiente14": "#4ade80",
    "gradiente15": "#f59e0b",
    "fonte6": "900 15px \"Arial Black\", Impact, sans-serif",
    "preenchimento16": "#ef4444",
    "brilho17": "#dc2626",
    "preenchimento18": "#0f172a",
    "contorno19": "#eab308",
    "gradiente21": "#ea580c",
    "fonte7": "800 11px monospace",
    "preenchimento23": "#ffffff",
    "fonte8": "900 14px \"Arial Black\", sans-serif",
    "brilho25": "#16a34a",
    "texto3": "⚠ GÁS DO MEDO: CONTROLES INVERTIDOS! ⚠",
    "fonte9": "700 11px monospace"
  },
  "LevelManager": {
    "preenchimento1": "#090d16",
    "contorno2": "#eab308",
    "contorno3": "#854d0e",
    "fonte1": "700 16px \"Courier New\", monospace",
    "preenchimento4": "#94a3b8",
    "texto1": "FASE CONCLUÍDA — PRÓXIMA MISSÃO",
    "fonte2": "900 28px \"Arial Black\", Impact, sans-serif",
    "preenchimento5": "#fef08a",
    "brilho6": "#ca8a04",
    "fonte3": "600 18px \"Trebuchet MS\", sans-serif",
    "preenchimento7": "#cbd5e1"
  },
  "Spawner": { "gradiente1": "#38bdf8" },
  "batSymbols": {
    "gradiente1": "#d8b344",
    "gradiente2": "#475569",
    "gradiente3": "#fbbf24",
    "gradiente4": "#334155",
    "gradiente5": "#fef3c7",
    "gradiente7": "#1e293b",
    "gradiente8": "#0f172a"
  },
  "SpriteAnimator": {
    "preenchimento1": "#0f172a",
    "preenchimento2": "#ef4444",
    "preenchimento3": "#facc15",
    "preenchimento4": "#171717",
    "fonte1": "bold 8px sans-serif"
  },
  "Level1Background": {
    "gradiente1": "#020617",
    "gradiente2": "#0b132b",
    "gradiente3": "#1c2541",
    "brilho4": "rgba(250, 204, 21, 0.75)",
    "gradiente5": "#ffffff",
    "gradiente6": "#fef9c3",
    "gradiente7": "#fef08a",
    "gradiente8": "#facc15",
    "gradiente9": "#eab308",
    "gradiente10": "rgba(202, 138, 4, 0.2)",
    "contorno11": "rgba(255, 255, 255, 0.9)",
    "preenchimento12": "#060a12",
    "preenchimento13": "#090d16",
    "preenchimento14": "rgba(254, 240, 138, 0.45)",
    "preenchimento16": "#111827",
    "contorno17": "rgba(147, 197, 253, 0.4)",
    "preenchimento18": "#0b0f19",
    "preenchimento19": "#161f30",
    "preenchimento20": "#0d1525",
    "gradiente21": "rgba(255, 255, 255, 0.85)",
    "gradiente22": "rgba(254, 240, 138, 0.55)",
    "gradiente23": "rgba(250, 204, 21, 0.25)",
    "gradiente24": "rgba(253, 224, 71, 0.35)",
    "gradiente25": "rgba(254, 249, 195, 0.5)",
    "brilho26": "rgba(254, 240, 138, 0.3)",
    "preenchimento27": "#0f172a",
    "preenchimento28": "#1e293b",
    "preenchimento29": "#334155"
  },
  "Level2Background": {
    "gradiente1": "#180d2b",
    "gradiente2": "#090514",
    "gradiente3": "#000000",
    "contorno4": "#ca8a04",
    "gradiente5": "rgba(168, 85, 247, 0.15)",
    "gradiente6": "rgba(168, 85, 247, 0)",
    "gradiente7": "#1e112a",
    "gradiente8": "#3b0764",
    "gradiente9": "#0f051d",
    "contorno10": "#581c87",
    "contorno11": "#a855f7",
    "preenchimento12": "#831843",
    "contorno13": "#facc15",
    "brilho14": "#38bdf8",
    "contorno15": "#0284c7",
    "fonte1": "900 24px \"Arial Black\", sans-serif",
    "preenchimento16": "#bae6fd",
    "texto1": "SALÃO ICEBERG",
    "contorno18": "#f472b6",
    "brilho19": "#ec4899",
    "preenchimento21": "#fef08a",
    "brilho22": "#fbbf24",
    "preenchimento23": "#ffffff"
  },
  "Level3Background": {
    "gradiente1": "rgba(34, 197, 94, 0)",
    "gradiente2": "rgba(22, 101, 52, 0.45)",
    "gradiente3": "rgba(20, 83, 45, 0.4)",
    "preenchimento4": "rgba(12, 35, 25, 0.12)",
    "gradiente5": "rgba(134, 239, 172, 0)",
    "gradiente6": "#09090b",
    "gradiente7": "#18181b",
    "gradiente8": "#052e16",
    "contorno9": "#27272a",
    "preenchimento10": "#050508",
    "gradiente11": "#ef4444",
    "gradiente12": "#eab308",
    "contorno13": "#52525b",
    "preenchimento15": "#1c1917",
    "preenchimento16": "#292524",
    "preenchimento17": "#dc2626",
    "brilho19": "#86efac",
    "gradiente20": "#3f3f46"
  },
  "batman": {
    "preenchimento1": "#11161d",
    "contorno2": "#1d2430",
    "preenchimento3": "#21262d",
    "preenchimento4": "#0d1117",
    "preenchimento5": "#161b22",
    "preenchimento6": "#2d333b",
    "preenchimento9": "#1f242c",
    "gradiente10": "#4b5563",
    "gradiente11": "#374151",
    "contorno12": "#1e232a",
    "preenchimento14": "#d97706",
    "preenchimento15": "#fbbf24",
    "preenchimento16": "#78350f",
    "preenchimento17": "#b45309",
    "preenchimento19": "#111827",
    "preenchimento20": "#0f172a",
    "preenchimento28": "#f5d0b0",
    "contorno29": "#92400e",
    "preenchimento30": "#f8fafc",
    "brilho31": "#38bdf8",
    "preenchimento32": "rgba(255, 255, 255, 0.7)",
    "contorno33": "rgba(74, 222, 128, 0.8)"
  },
  "harley_quinn": {
    "preenchimento1": "#dc2626",
    "preenchimento2": "#0f172a",
    "preenchimento3": "#ffffff",
    "preenchimento11": "#f8fafc",
    "preenchimento13": "#475569",
    "preenchimento14": "#facc15",
    "preenchimento15": "#78350f",
    "preenchimento16": "#92400e",
    "contorno17": "#f59e0b",
    "preenchimento20": "#38bdf8",
    "preenchimento26": "#fde047",
    "preenchimento27": "rgba(255, 255, 255, 0.75)"
  },
  "joker": {
    "preenchimento1": "#581c87",
    "preenchimento2": "#0f172a",
    "preenchimento3": "#6b21a8",
    "preenchimento5": "#f59e0b",
    "preenchimento6": "#10b981",
    "preenchimento7": "#dc2626",
    "preenchimento8": "#facc15",
    "preenchimento10": "#f8fafc",
    "preenchimento13": "#22c55e",
    "preenchimento14": "#a855f7",
    "preenchimento15": "#fef08a",
    "preenchimento18": "#ffffff",
    "preenchimento20": "rgba(255, 255, 255, 0.75)",
    "preenchimento22": "#ef4444",
    "contorno23": "#f87171"
  },
  "penguin": {
    "preenchimento1": "#7e228c",
    "preenchimento2": "#10131b",
    "preenchimento3": "#1e1b4b",
    "preenchimento4": "#0f172a",
    "preenchimento5": "#f8fafc",
    "preenchimento6": "#f59e0b",
    "preenchimento7": "#dc2626",
    "preenchimento8": "#fed7aa",
    "preenchimento9": "#fdba74",
    "contorno11": "#facc15",
    "preenchimento12": "rgba(186, 230, 253, 0.55)",
    "preenchimento14": "#1e293b",
    "preenchimento15": "#f87171",
    "preenchimento18": "#f1f5f9",
    "contorno19": "#38bdf8",
    "preenchimento20": "#f43f5e",
    "preenchimento22": "rgba(255, 255, 255, 0.75)",
    "preenchimento24": "#ef4444"
  },
  "scarecrow": {
    "preenchimento1": "#78350f",
    "preenchimento2": "#92400e",
    "contorno3": "#451a03",
    "preenchimento4": "#1c1917",
    "contorno5": "#d97706",
    "preenchimento6": "#854d0e",
    "preenchimento7": "#fde047",
    "preenchimento8": "#94a3b8",
    "preenchimento10": "#a16207",
    "preenchimento12": "#fef08a",
    "preenchimento13": "#713f12",
    "preenchimento15": "rgba(255, 255, 255, 0.75)"
  },
  "two_face": {
    "preenchimento1": "#f8fafc",
    "preenchimento2": "#e2e8f0",
    "preenchimento3": "#18181b",
    "preenchimento4": "#09090b",
    "preenchimento5": "#ffffff",
    "preenchimento7": "#f1f5f9",
    "preenchimento8": "#2563eb",
    "preenchimento9": "#b91c1c",
    "preenchimento12": "#64748b",
    "preenchimento13": "#facc15",
    "preenchimento15": "#fbcfe8",
    "preenchimento16": "#168d85",
    "preenchimento17": "#5c2b16",
    "preenchimento21": "#ef4444",
    "contorno23": "#9d174d",
    "contorno25": "#4c0519",
    "brilho26": "#fbbf24",
    "gradiente28": "#1e293b",
    "fonte1": "bold 8px monospace",
    "preenchimento30": "rgba(255, 255, 255, 0.75)"
  },
  "Bullet": {
    "gradiente1": "rgba(239, 68, 68, 0)",
    "gradiente2": "rgba(249, 115, 22, 0.6)",
    "gradiente3": "rgba(251, 191, 36, 1)",
    "brilho4": "#f59e0b",
    "preenchimento5": "#fef08a",
    "preenchimento6": "#ffffff"
  },
  "Coin": {
    "brilho1": "#cbd5e1",
    "gradiente2": "#475569",
    "gradiente3": "#e2e8f0",
    "gradiente4": "#1e293b",
    "gradiente5": "#94a3b8",
    "contorno6": "#ef4444",
    "preenchimento7": "#64748b"
  },
  "FearSmoke": {
    "brilho1": "#84cc16",
    "preenchimento2": "rgba(163, 230, 53, 0.35)",
    "preenchimento3": "rgba(101, 163, 13, 0.75)",
    "preenchimento4": "rgba(54, 83, 20, 0.85)",
    "preenchimento5": "#fef08a"
  },
  "GasBomb": {
    "brilho1": "#65a30d",
    "preenchimento2": "#78350f",
    "contorno3": "#d97706",
    "contorno4": "#451a03",
    "preenchimento5": "#f97316"
  },
  "JokerTeeth": {
    "preenchimento1": "#facc15",
    "preenchimento2": "#dc2626",
    "preenchimento3": "#ffffff",
    "preenchimento4": "#b91c1c",
    "preenchimento6": "#22c55e"
  },
  "Mallet": {
    "preenchimento1": "#92400e",
    "preenchimento2": "#991b1b",
    "preenchimento3": "#e2e8f0"
  },
  "PenguinBomb": {
    "preenchimento1": "#f97316",
    "preenchimento2": "#fde68a",
    "preenchimento3": "#f59e0b",
    "preenchimento4": "#111827",
    "contorno5": "#64748b",
    "preenchimento6": "#e2e8f0",
    "preenchimento7": "#f8fafc",
    "preenchimento9": "#be123c",
    "gradiente10": "#f43f5e",
    "gradiente11": "#fbbf24"
  },
  "UmbrellaBurst": {
    "brilho1": "#c084fc",
    "preenchimento2": "#9333ea",
    "preenchimento3": "#f472b6",
    "preenchimento4": "#ffffff",
    "contorno5": "#e879f9"
  },
  "HarleyThug": { "gradiente1": "#f43f5e" },
  "ScarecrowAcolyte": { "gradiente1": "#84cc16" },
  "TwoFaceEnforcer": { "gradiente1": "#38bdf8" }
};

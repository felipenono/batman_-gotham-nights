// Configuração única do lobby. Caminhos públicos são relativos à raiz do site.
export const LOBBY = {
  assets: { logo: 'assets/images/logo.png', music: 'assets/audio/lobby_theme.mp3', click: 'assets/audio/menu_click.mp3' },
  base: { width: 1920, height: 1080 },
  colors: { sky: '#080e19', horizon: '#263c50', far: '#1b2b3a', middle: '#111f2d', near: '#080f19', window: '#c6ac69', accent: '#e9c46a', text: '#e6e9ed' },
  audio: { volume: 0.45, effects: 0.65, fadeIn: 1800, fadeOut: 800 },
  motion: { transition: 900, pulse: 4800, fog: 22000, parallax: 22, gamepadRepeat: 220, stickThreshold: 0.55 },
  // Bat-Sinal inteiramente 2D. Posições relativas; dimensões na resolução base.
  batSignal: {
    moon: { x: 0.75, y: 0.21, radius: 82, craterOpacity: 0.09,
      narrowX: 0.8, narrowY: 0.12, narrowScale: 0.72 }, // Céu visível no celular.
    symbolScale: 0.83,           // Fração do diâmetro da lua ocupada pela silhueta.
    logoBackground: 'auto',     // auto, transparent ou light (preto sobre fundo claro).
    maskContrast: 12,           // Mesmo contraste usado na apresentação da logo.
    maskMaxSize: 512,
    fadeIn: 2400,               // Milissegundos, reiniciado a cada entrada no lobby.
    intensity: 0.8,
    glowIntensity: 0.65,
    haloRadius: 2.6,            // Multiplicador do raio da lua.
    beamWidth: 1.9,             // Largura na lua em múltiplos do raio.
    beamOpacity: 0.28,
    beamEdgeSoftness: 1.7,
    sourceWidth: 7,
    sourceX: 0.84,              // Seleciona o telhado plano mais próximo na camada frontal.
    flickerSpeed: 0.34,         // Ciclos por segundo; oscilação contínua, sem sorteios.
    flickerAmount: 0.035,
    dustCount: 22,
    dustSpeed: 0.018,           // Fração do comprimento do feixe por segundo.
    dustOpacity: 0.22,
    mistOpacity: 0.1,
    mistSpeed: 0.025,
    rimIntensity: 0.24,
    rimDistance: 190,
    textureSize: 256,           // Texturas pequenas, preparadas uma única vez.
    colors: {
      moon: '#cdd1b6', crater: '#788c94', beam: '#fff1bd',
      halo: '#dfebcf', dust: '#fff3cc', rim: '#e5d9aa',
      fixture: '#182331', fixtureEdge: '#71818b', symbol: '#000000',
    },
    // Mesmo recorte geométrico do placeholder da logo; só usado se o asset falhar.
    placeholder: [[0,0],[0.35,0.3],[0.42,0],[0.5,0.24],[0.58,0],[0.65,0.3],[1,0],[0.8,0.65],[0.5,1],[0.2,0.65]],
  },
  targetScene: 'GameScene',
  buttons: [
    { id: 'start', label: 'INICIAR', detail: 'ENTRE NA ESCURIDÃO', enabled: true, scene: 'GameScene' },
    { id: 'skins', label: 'TROCAR SKIN', detail: 'EM BREVE', enabled: false, scene: 'SkinScene' },
    { id: 'coop', label: '2 JOGADORES', detail: 'EM BREVE', enabled: false, scene: 'CoopScene' },
  ],
};
export const assetURL = path => `${import.meta.env?.BASE_URL ?? '/'}${path}`;

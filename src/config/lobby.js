// Configuração única do lobby. Caminhos públicos são relativos à raiz do site.
export const LOBBY = {
  // Pontuação: tipos usam a propriedade estável scoreType das entidades.
  scoring: {
    mob: 100, boss: 500,
    mobTypes: {}, // Exemplo: Penguin: 200
    bossTypes: {}, // Exemplo: JokerBoss: 750
    timeBonuses: [{ seconds: 90, points: 1000 }, { seconds: 180, points: 500 }, { seconds: 300, points: 250 }, { seconds: Infinity, points: 100 }],
    storageKey: 'gotham-nights.best-score.v1',
    countDuration: 1400, pulseDuration: 300, pulseScale: 0.1,
    colors: { panel: '#091422e6', text: '#e6e9ed', accent: '#e9c46a', muted: '#91a3b7' },
    font: 'Impact, "Arial Narrow", sans-serif',
    labels: { score: 'PONTOS', time: 'TEMPO DA FASE', mobs: 'MOBS DERROTADOS', bosses: 'CHEFÕES DERROTADOS', bonus: 'BÔNUS DE TEMPO', previousBonus: 'BÔNUS DAS FASES ANTERIORES', record: 'NOVO RECORDE!', paused: 'JOGO PAUSADO', resume: 'CONTINUAR', pauseHint: 'ESC / P · PAUSAR', resumeHint: 'ESC / P · CONTINUAR' },
  },
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
  // Uma cena recebe o resultado e os dados; esta seção controla suas variações.
  endScreens: {
    transition: 850, titleEntrance: 1100, inputDelay: 450,
    demo: { score: 14800, bestScore: 22500, elapsedSeconds: 754, levelIndex: 1 },
    features: { twoPlayers: false, skinPreview: false, nextLevel: false },
    nextScene: 'NextLevelScene',
    assets: { skinPlaceholder: '' },
    labels: {
      report: 'RELATÓRIO DE PATRULHA', city: 'GOTHAM CITY', score: 'PONTUAÇÃO FINAL',
      bestScore: 'MELHOR PONTUAÇÃO', time: 'TEMPO DE JOGO', demo: 'DADOS ILUSTRATIVOS',
      navigation: 'NAVEGAR', select: 'SELECIONAR', back: 'VOLTAR AO MENU',
      soon: 'EM BREVE', nextReady: 'CONTINUE A MISSÃO', medals: 'MEDALHAS', players: 'RESULTADO DA EQUIPE',
      player: 'JOGADOR', skin: 'TRAJE EQUIPADO', skinPlaceholder: 'SELEÇÃO DE SKIN EM BREVE',
      music: 'TRILHA SONORA', muted: 'SOM DESLIGADO', mute: 'Silenciar áudio',
      unmute: 'Ativar áudio', volume: 'Volume', logo: 'Símbolo do Batman',
    },
    colors: { text: '#e6e9ed', muted: '#91a3b7', panel: '#091422c9', border: '#8598ad38',
      fog: '#98b1c9', rain: '#b9d3ee35', sparkle: '#f9d783', placeholder: '#66768b' },
    screens: {
      defeat: {
        title: 'VOCÊ FOI DERROTADO', eyebrow: 'A NOITE AINDA NÃO TERMINOU',
        description: 'Até os maiores heróis precisam se levantar outra vez.',
        footer: 'GOTHAM AINDA PRECISA DE VOCÊ.', accent: '#d9b967', glow: '#9b253940',
        audio: { music: 'assets/audio/defeat.mp3', fallbackTrack: 'defeat', tempo: 58,
          notes: [146.83, 130.81, 116.54, 110], fadeIn: 1700, fadeOut: 700, gain: 0.75, cue: 'gameover' },
        background: { colors: { sky: '#040913', horizon: '#182c40', far: '#112131', middle: '#0b1726', near: '#060e19' },
          weather: { rainCount: 85, fogOpacity: 0.2, fogStart: 0.2 },
          signal: { intensity: 0.065, glowIntensity: 0.16, flickerAmount: 0.28, flickerSpeed: 0.24, dustCount: 5,
            colors: { moon: '#516679', halo: '#8299b6' } } },
        particles: { count: 0, speed: 0.015, opacity: 0.25 },
        buttons: [
          { id: 'retry', label: 'TENTAR NOVAMENTE', detail: 'RETOME SUA MISSÃO', scene: 'RetryScene', enabled: true },
          { id: 'menu', label: 'VOLTAR AO MENU', detail: 'RETORNAR AO LOBBY', scene: 'MenuScene', enabled: true },
        ],
      },
      victory: {
        title: 'GOTHAM ESTÁ SALVA', eyebrow: 'MISSÃO CUMPRIDA',
        description: 'A escuridão recua. A esperança permanece.',
        footer: 'O SÍMBOLO DE GOTHAM CONTINUA ACESO.', accent: '#e9c46a', glow: '#e9c46a55',
        audio: { music: 'assets/audio/victory.mp3', fallbackTrack: 'victory', tempo: 86,
          notes: [146.83, 196, 220, 293.66], fadeIn: 1800, fadeOut: 700, gain: 0.85, cue: 'victory' },
        background: { colors: { sky: '#101c2c', horizon: '#53687a', far: '#2e4356', middle: '#1a2e40', near: '#0a1827' },
          weather: { rainCount: 0, fogOpacity: 0.025, fogStart: 0.12, fogDissipate: 5500 },
          signal: { intensity: 0.95, glowIntensity: 0.95, beamOpacity: 0.34, flickerAmount: 0.02 } },
        particles: { count: 28, speed: 0.015, opacity: 0.25 },
        buttons: [
          { id: 'replay', label: 'JOGAR NOVAMENTE', detail: 'UMA NOVA PATRULHA', scene: 'GameScene', enabled: true },
          { id: 'menu', label: 'VOLTAR AO MENU', detail: 'RETORNAR AO LOBBY', scene: 'MenuScene', enabled: true },
          { id: 'next', label: 'PRÓXIMA FASE', detail: 'EM BREVE', scene: 'NextLevelScene', enabled: false },
        ],
      },
    },
  },
  buttons: [
    { id: 'start', label: 'INICIAR', detail: 'ENTRE NA ESCURIDÃO', enabled: true, scene: 'GameScene' },
    { id: 'skins', label: 'TROCAR SKIN', detail: 'EM BREVE', enabled: false, scene: 'SkinScene' },
    { id: 'coop', label: '2 JOGADORES', detail: 'EM BREVE', enabled: false, scene: 'CoopScene' },
  ],
};
export const assetURL = path => `${import.meta.env?.BASE_URL ?? '/'}${path}`;

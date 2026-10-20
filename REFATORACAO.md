# Refatoração do jogo — guia de entrega

Esta entrega reúne todas as etapas, incluindo interface, áudio, partida, combate, HUD, cenários e documentação. JavaScript, Canvas 2D, Vite e as bibliotecas existentes foram mantidos. Os arquivos completos estão no projeto; o pacote de entrega contém somente arquivos novos ou alterados e um manifesto da remoção.

## Análise e decisões

| Categoria | Problema encontrado | Tratamento |
| --- | --- | --- |
| Código repetido | Controles de volume/mudo, validação de resultados e envelopes de efeitos sonoros repetidos. | Componentes e auxiliares compartilhados. |
| Funções grandes | Atualização da partida e desenho dos cenários misturavam várias tarefas. | Separação por jogador, ondas, chefes, combate e camadas de desenho. |
| Nomes confusos | Muitos parâmetros abreviados de tempo, posição e contexto. | Nomes locais mais descritivos em português, preservando as interfaces públicas existentes. |
| Números e textos dispersos | Configurações divididas entre lobby, constantes e áudio; mapas e paletas dentro dos desenhos. | Arquivo central com blocos para regras, telas, áudio, mapas, animação e aparência. |
| Variáveis globais | A instância de depuração do jogo ficava sempre exposta na janela. | Só é exposta quando `GAME.DEBUG` está ativo. |
| Código morto | Adaptador de som sem consumidores, desenho antigo de brasão e campos sem leitura. | Remoção listada abaixo. |
| Comentários | Descrições longas ou antigas dificultavam localizar responsabilidades. | Resumos por arquivo, seções e comentários próximos das decisões. |
| Desempenho | Janelas da cidade eram recalculadas a cada desenho; consultas e escritas repetidas na interface. | Janelas preparadas uma vez, referências da interface guardadas e atualização apenas quando necessária. |
| Recursos | Eventos pendentes de áudio e ausência de encerramento da instância inteira. | Descarte explícito de eventos, áudio e quadro de animação. |

A prioridade foi preservar regras e aparência; depois separar responsabilidades, reduzir trabalho repetido e documentar. Não houve renomeação de pastas. Os caminhos antigos de configuração continuam disponíveis por reexportação, mas o código do jogo importa o arquivo central.

## Antes e depois

- `Game` continua coordenando a partida, mas delega a atualização a funções menores e com nomes explícitos.
- `CombatSystem` separa ataques do jogador, projéteis inimigos, contato e partículas. A ordem dos acertos foi preservada.
- `HUD` desenha vida, fase, chefe, medo, áudio e pontuação em funções distintas.
- `MenuMarkup` e `ResultMarkup` montam o HTML; as cenas coordenam entrada, atualização e saída.
- `ScreenAudioControls` compartilha mudo e volume. `GamepadInput` compartilha a leitura do direcional sem mudar as diferenças de confirmação entre telas.
- `Instrumentos` produz os timbres; `MusicComposer` agenda as notas. Efeitos com a mesma estrutura usam um auxiliar.
- `ScoreManager` separa cronômetro, abates, bônus, recorde e resumo. A tabela de bônus não precisa mais ser copiada e ordenada a cada consulta.
- Mapas e paletas foram reunidos na configuração. Os cenários e as plataformas separam seus elementos de desenho.
- `Input` reutiliza a coleção de teclas pressionadas; a cidade reutiliza posições de janelas e a preferência de movimento reduzido do HUD não é consultada novamente a cada quadro.
- O CSS permanece separado do Canvas e foi formatado sem mudar seletores, valores ou ordem. A prévia de telas agora usa o CSS real e o loop real do jogo.

## Correções autorizadas

1. Imagem ausente ou inválida não interrompe o carregamento das outras referências nem impede usar o desenho alternativo.
2. Um abate comum deixa de tocar o efeito sonoro duas vezes. O som posterior de conclusão do chefe foi mantido.
3. A nuvem de gás cresce ao redor do centro do impacto. É uma correção deliberada da posição anterior da área de dano.
4. O Pinguim de elite aceita pontuação própria por `PenguinElite`. O padrão continua em 100 pontos.
5. Encerrar o áudio remove eventos de desbloqueio pendentes; um gesto posterior não recria o contexto encerrado.
6. Chamar `start()` repetidamente não cria vários loops. `destroy()` cancela o quadro pendente e encerra os recursos da instância.
7. Vida máxima zero, dimensão de desenho nula e dados de resultado nulos têm tratamento defensivo.

## O que foi removido

- Arquivo `src/systems/SoundManager.js`: adaptador sem consumidores. O áudio ativo continua em `src/audio/AudioManager.js`.
- Função `drawBatCrest` e seu import: desenho antigo sem chamada. O Bat-Sinal continua usando a logo configurada.
- Campos sem uso: `Joker.patrolTimer`, `Scarecrow.auraActive` e `Level2Background.lightPulse`.
- Constantes duplicadas nos três caminhos antigos de configuração.
- Reprodução duplicada do som de abate e cópia do CSS de produção na prévia de telas.

Os botões Trocar Skin, 2 Jogadores e Próxima fase, os espaços de medalhas/skin e a pontuação individual continuam preparados.

## Como o projeto funciona

**Entrada e núcleo (`src/main.js`, `src/core/`)**: a entrada carrega os desenhos e cria `Game`. O núcleo recebe teclado/mouse, acompanha a câmera, ajusta a escala e troca de cena no meio do fade. `Game` é o ponto de partida para entender a ordem da execução.

**Configuração (`src/config/`)**: `configuracao.js` reúne os valores compartilhados em blocos identificados. `lobby.js`, `src/utils/constants.js` e `src/audio/AudioConfig.js` são pontes de compatibilidade; não edite valores nesses três arquivos.

**Cenas (`src/scenes/`)**: `MenuScene` coordena o lobby; `EndGameScene` atende vitória e derrota; `GothamBackdrop` desenha a cidade. `BatSignal` cuida da lua, máscara da logo, feixe e brilho. Lua e símbolo usam o mesmo centro calculado a partir da área visível.

**Interface (`src/ui/`, `src/styles/`)**: os arquivos Markup geram HTML. Os outros módulos cuidam de navegação, logo e controles de áudio. O CSS define a aparência e a resposta a diferentes tamanhos de tela; o Canvas desenha o cenário e a partida.

**Sistemas (`src/systems/`)**: física resolve movimento e contato; combate aplica acertos; Spawner gera ondas; BossManager coordena chefes; LevelManager controla progressão. ScoreManager registra os resultados; HUD e ScreenUI os apresentam.

**Entidades (`src/entities/`)**: Entity compartilha posição e colisão, Character acrescenta vida/animação, Batman recebe comandos. As subpastas agrupam os inimigos e seus projéteis. Pontos são registrados quando o combate comunica uma morte, sem o placar controlar os inimigos.

**Áudio (`src/audio/`)**: AudioManager controla o áudio sintetizado compartilhado. ScreenAudioManager toca arquivos opcionais e faz os fades, com alternativa sintetizada quando necessário. Instrumentos e SoundEffects produzem os sons; MusicComposer organiza as trilhas.

**Mundo (`src/world/`)**: Level monta plataformas conforme o mapa configurado. Cada LevelBackground desenha um cenário específico. Background é a base comum. Os cenários mantêm sua ordem de desenho e aleatoriedade.

**Desenhos e auxiliares (`src/assets/`, `src/utils/`)**: os PNGs são referências dos personagens; os arquivos JavaScript contêm alternativas vetoriais. SpriteAnimator seleciona e reutiliza quadros. Os utilitários de tempo e resultado não dependem de cenas.

**Arquivos públicos (`public/assets/`)**: coloque aqui a logo e músicas opcionais. Arquivos desta pasta são copiados para a publicação pelo Vite. Consulte os caminhos abaixo.

**Testes e ferramentas (`tests/`, `scripts/`)**: testes verificam comportamento fora da página principal; páginas HTML permitem inspeção manual. `scripts/check.mjs` confere sintaxe, e `scripts/clean.mjs` limpa a publicação. Os testes não entram no jogo publicado; removê-los tira essas verificações, mas não remove funcionalidades da partida.

## Onde mexer primeiro

No arquivo `src/config/configuracao.js`:

| Quero alterar | Bloco |
| --- | --- |
| Título e subtítulo do lobby | `LOBBY.textosMenu.titulo` / `subtitulo` |
| Botões do lobby | `LOBBY.buttons` |
| Logo e clique | `LOBBY.assets` |
| Lua, halo, feixe, partículas e flicker | `LOBBY.batSignal` |
| Fades e movimento dos menus | `LOBBY.motion` |
| Vitória, derrota e botões futuros | `LOBBY.endScreens` |
| Pontos e bônus | `LOBBY.scoring` |
| Resolução e regras gerais | `GAME` |
| Teclas e projéteis | `KEYS` / `PROJECTILE` |
| Configuração e mapa das fases | `LEVELS` / `MUNDO` |
| Volumes, efeitos e sequência de notas | `AUDIO_CONFIG` / `PARTITURAS` |
| Quadros de animação | `ANIMACAO` |
| Cores, fontes e textos estáticos dos desenhos | `APARENCIA`, agrupado por arquivo |

`APARENCIA` conserva chaves numeradas para identificar as diferentes cores do mesmo desenho. Para localizar seu uso, pesquise a chave no arquivo indicado pelo grupo. Coordenadas das ilustrações, fórmulas e detalhes da síntese sonora continuam próximos do desenho/som: transformá-los em centenas de parâmetros distantes tornaria a manutenção menos clara. As regras de layout e os valores próprios do CSS permanecem em `src/styles/`. Portanto, o arquivo central não substitui as folhas de estilo nem contém cada literal matemático do projeto.

Nomes públicos já usados, como `Game`, `update`, `draw`, `score`, `elapsedSeconds` e nomes de cenas, foram preservados por compatibilidade. Os novos auxiliares e muitos parâmetros locais usam português. Alguns desenhos vetoriais ainda têm funções longas, pois a sequência de traços define a ilustração; o comportamento e os valores foram conservados.

## Assets e expansão

- Logo: `public/assets/images/logo.png`. O menu e o Bat-Sinal apontam para `LOBBY.assets.logo`; não há uma segunda imagem do símbolo para atualizar.
- Lobby: `public/assets/audio/lobby_theme.mp3`.
- Derrota: `public/assets/audio/defeat.mp3`.
- Vitória: `public/assets/audio/victory.mp3`.
- Clique opcional: `public/assets/audio/menu_click.mp3`.

Para mudar os nomes, edite os caminhos da configuração. O navegador pode aguardar um clique ou tecla antes de liberar o áudio.

Para habilitar Trocar Skin ou 2 Jogadores: implemente o destino, registre-o com `game.sceneManager.register(...)` e altere `enabled` no item de `LOBBY.buttons`. Para Próxima fase, registre a ação/destino correspondente antes de ativar `LOBBY.endScreens.features.nextLevel`. Esses controles não implementam automaticamente as regras de um modo novo.

Para exibir a pontuação de dois jogadores, ative `LOBBY.endScreens.features.twoPlayers` e informe o índice 0 ou 1 nas funções de abate. A prévia da skin usa `features.skinPreview` e o parâmetro `skin`. Exemplos completos estão em LOBBY.md, END_SCREENS.md e SCORING.md.

## Pontuação e chamadas

| Regra | Pontos | Campo em `LOBBY.scoring` |
| --- | ---: | --- |
| Mob | 100 | `mob` |
| Chefão | 500 | `boss` |
| Tipo específico | Padrão até configurar | `mobTypes` / `bossTypes` |
| Até 90 s | 1000 | `timeBonuses` |
| Até 180 s | 500 | `timeBonuses` |
| Até 300 s | 250 | `timeBonuses` |
| Acima de 300 s | 100 | `timeBonuses` |

```js
// O combate atual já emite estas chamadas. Não registre o mesmo abate duas vezes.
game.scoreManager.adicionarPontosMob(inimigo.scoreType);
game.scoreManager.adicionarPontosChefao(chefao.scoreType);

// Finaliza o placar e transporta uma cópia dos dados para a tela final.
game.showEndScreen("victory");
// Ou, quando perder:
game.showEndScreen("defeat");
```

O tempo pausa junto com a partida. Vitória concede o bônus uma vez; derrota preserva pontos e bônus das fases anteriores sem premiar a fase perdida. A chave do recorde local foi preservada.

## Validação realizada

- `npm run check`: sintaxe aprovada, 77 testes aprovados e publicação gerada.
- 17 regressões persistentes comparam registros de desenho de três cenários, cinco plataformas e seis personagens à versão anterior.
- Comparações adicionais com a versão anterior aprovaram seis desenhos de Gotham, o HTML do lobby em três volumes e o HTML de vitória e derrota.
- O agendamento de 16 efeitos sonoros e cinco trilhas sintetizadas, com 64 passos por trilha, permaneceu igual nos registros comparados.
- O CSS foi comparado estruturalmente e o arquivo de publicação mantém o mesmo identificador de conteúdo.
- A execução real no Edge foi conferida em seguida; consulte VERIFICACAO.md. Não houve medição de FPS nem avaliação auditiva subjetiva.
- A comparação no Edge, inicialmente impedida pelo limite do serviço de aprovação, foi concluída na solicitação seguinte: 14 pares de capturas idênticas e 15 verificações funcionais aprovadas. Os MP3s opcionais continuam ausentes; a saída de áudio sintetizada foi medida e validada.

A construção repetida de uma fase no fluxo de transição foi conservada: removê-la diretamente mudaria a sequência de sorteios do cenário. Não foi adotada uma camada adicional de aleatoriedade apenas para otimizar uma operação que ocorre entre fases.

## Lista de verificação manual

Inicie com `npm run dev`. As prévias ficam em `/tests/screens.html` e `/tests/end-screens.html`.

- [ ] Abrir o lobby e conferir logo, título, lua, símbolo, feixe, névoa e botões.
- [ ] Redimensionar a janela e conferir o alinhamento do Bat-Sinal na lua.
- [ ] Navegar com mouse, setas, Enter e controle; conferir que botões futuros continuam bloqueados.
- [ ] Ouvir as músicas e efeitos; testar volume, mudo e fades nas trocas de tela.
- [ ] Iniciar, andar, pular, mirar e lançar batarangues; conferir vida e recarga.
- [ ] Derrotar mobs e chefes; conferir pontos, animação do HUD e som de abate.
- [ ] Pausar, esperar e continuar; conferir que o relógio não contou a pausa.
- [ ] Perder, conferir o resumo sem bônus da fase perdida e tentar novamente.
- [ ] Concluir as três fases, conferir vitória, bônus, contagem animada e recorde.
- [ ] Voltar ao menu, iniciar outra partida e conferir que comandos não disparam em duplicidade.
- [ ] Reabrir a página e conferir a persistência do recorde.
- [ ] Em uma cópia de teste, remover um asset opcional e conferir a alternativa visual/sonora.

## Mapa de arquivos

O mapa abaixo complementa o guia por pastas com a responsabilidade de cada módulo JavaScript do jogo.

| Arquivo | Responsabilidade |
| --- | --- |
| `src/assets/sprites/batman.js` | Este arquivo cuida de desenhar a alternativa vetorial de batman. |
| `src/assets/sprites/harley_quinn.js` | Este arquivo cuida de desenhar a alternativa vetorial de harley_quinn. |
| `src/assets/sprites/joker.js` | Este arquivo cuida de desenhar a alternativa vetorial de joker. |
| `src/assets/sprites/penguin.js` | Este arquivo cuida de desenhar a alternativa vetorial de penguin. |
| `src/assets/sprites/referenceSprites.js` | Este arquivo cuida de carregar, recortar e recolorir as imagens de referência. |
| `src/assets/sprites/scarecrow.js` | Este arquivo cuida de desenhar a alternativa vetorial de scarecrow. |
| `src/assets/sprites/two_face.js` | Este arquivo cuida de desenhar a alternativa vetorial de two_face. |
| `src/audio/AudioConfig.js` | Este arquivo cuida de manter o caminho antigo da configuração de áudio. |
| `src/audio/AudioManager.js` | Este arquivo cuida de coordenar o contexto de áudio, os volumes e o sequenciador. |
| `src/audio/Instrumentos.js` | Este arquivo cuida de sintetizar os instrumentos das trilhas. |
| `src/audio/LobbyAudioManager.js` | Este arquivo cuida de manter a interface de áudio do lobby. |
| `src/audio/MusicComposer.js` | Este arquivo cuida de agendar as notas das trilhas sintetizadas. |
| `src/audio/ScreenAudioManager.js` | Este arquivo cuida de controlar músicas de menu, alternativas e fades. |
| `src/audio/SoundEffects.js` | Este arquivo cuida de reproduzir os efeitos sonoros das ações. |
| `src/audio/index.js` | Este arquivo cuida de reunir a interface pública do módulo de áudio. |
| `src/config/configuracao.js` | Este arquivo cuida de reunir as configurações compartilhadas do jogo. |
| `src/config/lobby.js` | Este arquivo cuida de reunir as configurações compartilhadas do jogo. |
| `src/core/Camera.js` | Este arquivo cuida de acompanhar o personagem e controlar o tremor da tela. |
| `src/core/Game.js` | Este arquivo cuida de coordenar a partida e seus sistemas. |
| `src/core/GameState.js` | Este arquivo cuida de definir os estados possíveis da partida. |
| `src/core/Input.js` | Este arquivo cuida de guardar as teclas pressionadas em cada atualização. |
| `src/core/Mouse.js` | Este arquivo cuida de converter cliques e toques em coordenadas do jogo. |
| `src/core/SceneManager.js` | Este arquivo cuida de trocar as cenas durante o fade. |
| `src/core/Viewport.js` | Este arquivo cuida de manter a mesma escala para desenho e apontamento. |
| `src/entities/Batman.js` | Este arquivo cuida de controlar movimento, saltos, ataques e vidas do jogador. |
| `src/entities/Character.js` | Este arquivo cuida de compartilhar vida, dano e animação entre personagens. |
| `src/entities/Entity.js` | Este arquivo cuida de definir posição, tamanho e colisão dos objetos do jogo. |
| `src/entities/Platform.js` | Este arquivo cuida de desenhar cada tema de plataforma. |
| `src/entities/projectiles/Batarang.js` | Este arquivo cuida de controlar o batarangue e seu limite de lançamentos. |
| `src/entities/projectiles/Bullet.js` | Este arquivo cuida de mover e desenhar as balas. |
| `src/entities/projectiles/Coin.js` | Este arquivo cuida de controlar as moedas lançadas. |
| `src/entities/projectiles/FearSmoke.js` | Este arquivo cuida de controlar a fumaça de medo. |
| `src/entities/projectiles/GasBomb.js` | Este arquivo cuida de controlar a bomba e a expansão da nuvem de gás. |
| `src/entities/projectiles/JokerTeeth.js` | Este arquivo cuida de controlar os dentes saltitantes. |
| `src/entities/projectiles/Mallet.js` | Este arquivo cuida de mover e desenhar a marreta. |
| `src/entities/projectiles/PenguinBomb.js` | Este arquivo cuida de controlar a bomba perseguidora e sua explosão. |
| `src/entities/projectiles/Projectile.js` | Este arquivo cuida de compartilhar movimento e duração dos projéteis. |
| `src/entities/projectiles/UmbrellaBurst.js` | Este arquivo cuida de compartilhar a perseguição dos projéteis do Pinguim. |
| `src/entities/villains/HarleyQuinn.js` | Este arquivo cuida de controlar a Arlequina e suas acrobacias. |
| `src/entities/villains/HarleyThug.js` | Este arquivo cuida de especializar o capanga da Arlequina. |
| `src/entities/villains/Joker.js` | Este arquivo cuida de controlar os ataques do Coringa comum. |
| `src/entities/villains/JokerBoss.js` | Este arquivo cuida de controlar o Coringa como chefe. |
| `src/entities/villains/Penguin.js` | Este arquivo cuida de controlar os ataques do Pinguim. |
| `src/entities/villains/Scarecrow.js` | Este arquivo cuida de controlar o Espantalho e seus ataques de medo. |
| `src/entities/villains/ScarecrowAcolyte.js` | Este arquivo cuida de especializar o inimigo de gás. |
| `src/entities/villains/TwoFace.js` | Este arquivo cuida de controlar o Duas-Caras e a escolha de ataques. |
| `src/entities/villains/TwoFaceEnforcer.js` | Este arquivo cuida de especializar o capanga do Duas-Caras. |
| `src/main.js` | Este arquivo cuida de iniciar o canvas e carregar o jogo. |
| `src/scenes/BatSignal.js` | Este arquivo cuida de preparar e desenhar a lua, a silhueta e a luz do Bat-Sinal. |
| `src/scenes/EndGameScene.js` | Este arquivo cuida de coordenar a tela compartilhada de vitória e derrota. |
| `src/scenes/GothamBackdrop.js` | Este arquivo cuida de desenhar a cidade em camadas dos menus. |
| `src/scenes/MenuScene.js` | Este arquivo cuida de coordenar as opções e o cenário do lobby. |
| `src/systems/BossManager.js` | Este arquivo cuida de controlar a sequência de chefões e suas apresentações. |
| `src/systems/CombatSystem.js` | Este arquivo cuida de resolver ataques, danos e partículas. |
| `src/systems/HUD.js` | Este arquivo cuida de desenhar as informações da partida sem alterar seus dados. |
| `src/systems/LevelManager.js` | Este arquivo cuida de controlar a sequência e as transições das fases. |
| `src/systems/Physics.js` | Este arquivo cuida de aplicar gravidade e resolver contatos com plataformas. |
| `src/systems/ScoreManager.js` | Este arquivo cuida de registrar pontos, tempo ativo e recordes. |
| `src/systems/ScreenUI.js` | Este arquivo cuida de montar e desmontar a interface de cada estado. |
| `src/systems/Spawner.js` | Este arquivo cuida de criar as ondas e contar os abates de cada fase. |
| `src/ui/GamepadInput.js` | Este arquivo cuida de ler o direcional do controle conectado. |
| `src/ui/MenuMarkup.js` | Este arquivo cuida de montar o HTML do lobby. |
| `src/ui/ResultMarkup.js` | Este arquivo cuida de montar o HTML dos resultados. |
| `src/ui/ScreenAudioControls.js` | Este arquivo cuida de compartilhar os controles de volume e mudo. |
| `src/ui/ScreenElements.js` | Este arquivo cuida de compartilhar ícones, logo e proteção dos textos em HTML. |
| `src/ui/ScreenNavigation.js` | Este arquivo cuida de controlar teclado e controle nas telas finais. |
| `src/utils/SpriteAnimator.js` | Este arquivo cuida de selecionar e reutilizar quadros das animações. |
| `src/utils/batSymbols.js` | Este arquivo cuida de desenhar o batarangue e os ícones de vida. |
| `src/utils/constants.js` | Este arquivo cuida de manter os caminhos antigos das configurações. |
| `src/utils/formatPlayTime.js` | Este arquivo cuida de formatar o relógio mostrado nas telas. |
| `src/utils/resultData.js` | Este arquivo cuida de validar e copiar dados dos resultados. |
| `src/world/Background.js` | Este arquivo cuida de definir a interface dos cenários. |
| `src/world/Level.js` | Este arquivo cuida de montar o cenário e as plataformas de uma fase. |
| `src/world/Level1Background.js` | Este arquivo cuida de desenhar os telhados e o céu de Gotham. |
| `src/world/Level2Background.js` | Este arquivo cuida de desenhar o cassino e sua iluminação. |
| `src/world/Level3Background.js` | Este arquivo cuida de desenhar Arkham e seus reflexos de luz. |

Os PNGs de referência ficam junto dos desenhos em `src/assets/sprites/`; não foram alterados. `src/styles/game.css`, `lobby.css` e `end-game.css` estilizam respectivamente a página/partida, o menu e os resultados. `index.html` contém o canvas e as camadas da interface. `vite.config.js`, `package.json` e `package-lock.json` mantêm a mesma configuração de execução e dependências.

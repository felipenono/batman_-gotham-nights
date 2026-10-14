# Lobby — Batman: Noites de Gotham

O lobby está integrado ao jogo existente. Para abrir: `npm run dev`, depois acesse o endereço indicado pelo servidor.

## Organização

```text
index.html                       # canvas e camadas HTML, sem CSS embutido
public/assets/
  images/logo.png                # símbolo enviado, já incluído
  audio/lobby_theme.mp3           # coloque sua trilha aqui
  audio/menu_click.mp3            # efeito opcional do botão
src/
  config/lobby.js                 # assets, paleta, volumes, tempos e lista de botões
  scenes/MenuScene.js             # interface, teclado e controle
  scenes/GothamBackdrop.js        # skyline em três camadas, névoa, chuva e Bat-Sinal
  core/SceneManager.js            # registro de cenas e transição para preto
  audio/LobbyAudioManager.js      # loop externo, fades e fallback de áudio
  audio/AudioManager.js           # áudio compartilhado com o jogo
  styles/game.css                # layout do canvas e telas do jogo
  styles/lobby.css               # aparência e responsividade do lobby
  systems/ScreenUI.js             # ciclo de vida das telas
  core/Game.js                   # integração com a partida existente
```

Os estilos das páginas de inspeção em `tests/` também foram extraídos para arquivos CSS. Os canvas internos de sprites continuam sem estilos: são superfícies de desenho fora do DOM. Dimensões internas e comandos de desenho pertencem ao JavaScript; aparência e layout pertencem às folhas CSS.

## Assets

Substitua `public/assets/images/logo.png` para trocar a imagem. O símbolo anexado já está incluído. O CSS trata o arquivo de referência preto sobre branco para compor com o fundo. Se usar um PNG transparente colorido, remova o filtro de `.bat-logo` em `src/styles/lobby.css` para preservar suas cores.

Coloque sua música em `public/assets/audio/lobby_theme.mp3`, e o clique opcional em `public/assets/audio/menu_click.mp3`. Para outros nomes, altere `LOBBY.assets` em `src/config/lobby.js`. Os caminhos são compatíveis com o `base` do Vite.

O navegador exige uma interação antes do áudio: clique, toque ou pressione uma tecla para liberar a trilha. O fade-in começa nesse gesto; o fade-out acompanha a saída do menu. Se faltarem arquivos, a música e o clique usam o sintetizador existente. Se o logo faltar, aparece um emblema geométrico substituto. Nenhum asset opcional impede iniciar a partida.

## Navegação e transição

Mouse/toque, setas e Enter/Espaço funcionam no menu. Tab alcança os controles de áudio. `M` alterna o mudo compartilhado com o jogo. O controle usa D-pad ou analógico vertical para navegar e A/Start para selecionar. A conexão depende do suporte do navegador à Gamepad API. O suporte a controle implementado aqui cobre o lobby; a jogabilidade mantém seus controles existentes.

`GameScene` já chama a primeira fase por meio de `restartGame()`. A transição bloqueia ativações repetidas, apaga a música, troca a cena no preto e revela a partida. A base de renderização continua em 1920 × 1080; o fundo preenche o lobby e a partida preserva a proporção. A preferência por movimento reduzido desativa animações decorativas.

## Ativar Trocar Skin e 2 Jogadores

1. Implemente a tela ou o modo correspondente, por exemplo `SkinScene`.
2. Registre sua função de entrada após criar o jogo em `src/main.js`:

   ```js
   game.sceneManager.register('SkinScene', () => {
     // Abra aqui a sua seleção de skins e defina o estado correspondente.
   });
   game.sceneManager.register('CoopScene', () => {
     // Inicialize aqui o modo cooperativo quando sua implementação existir.
   });
   ```

3. Em `LOBBY.buttons`, mude `enabled: false` para `enabled: true` no item desejado e ajuste `detail`. Os cadeados desaparecem e o botão passa a aceitar mouse, teclado e controle automaticamente.

Você também pode definir `action: game => { /* sua função */ }` no item para executar uma ação própria em vez da transição. Para novos itens, basta adicionar objetos à lista. Destinos sem registro são ignorados com segurança. A seleção de skins e o modo cooperativo estão previstos, mas suas regras ainda precisam ser implementadas.

## Validação

`npm run check` verifica sintaxe, executa os testes e compila a versão de produção. Os testes do lobby cobrem destinos futuros, transição sem duplicação e fades com fallback sem arquivos externos.

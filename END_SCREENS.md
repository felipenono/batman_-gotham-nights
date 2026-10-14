# Telas de vitória e derrota

As duas telas usam `EndGameScene`, a mesma Gotham 2D e a mesma logo do lobby. Os estilos ficam em `src/styles/end-game.css`. Textos, cores, músicas, tempos, clima e botões ficam em `LOBBY.endScreens`, no arquivo `src/config/lobby.js`.

## Chamar a partir do jogo

```js
// O método congela a partida, faz fade para preto e abre a tela com estes dados.
game.showEndScreen('defeat', {
  score: 14800,
  bestScore: 22500,
  elapsedSeconds: 754,
  levelIndex: 2,
});

game.showEndScreen('victory', {
  score: 32000,
  bestScore: 32000,
  elapsedSeconds: 1250,
  levelIndex: 3,
});
```

A morte real e a vitória após o último chefe já chamam essa API com pontuação, recorde e tempo reais do ScoreManager. Consulte SCORING.md para regras, configuração e eventos de morte. Chamadas sem parâmetros usam o placar atual.

Os dados são copiados e normalizados ao entrar. A cena não lê pontuações nem tempo de variáveis globais. `elapsedSeconds` usa segundos. O ScoreManager mantém o recorde em localStorage e o envia como `bestScore`.

**Tentar novamente** reinicia a fase informada com jogador, inimigos e contadores reinicializados. **Jogar novamente** começa uma campanha na fase 1. **Voltar ao menu** usa a mesma transição para retornar ao lobby. A partida fica congelada durante a transição.

## Músicas e imagens

- Logo compartilhada: `public/assets/images/logo.png`, configurada somente em `LOBBY.assets.logo`.
- Derrota: `public/assets/audio/defeat.mp3`.
- Vitória: `public/assets/audio/victory.mp3`.
- Clique compartilhado: `public/assets/audio/menu_click.mp3`.
- Skin opcional: indique um caminho em `data.skin.image` ou `LOBBY.endScreens.assets.skinPlaceholder`, por exemplo `assets/images/skins/classic.png`, com o arquivo correspondente dentro de `public/`.

Os caminhos de música podem ser trocados em `LOBBY.endScreens.screens.defeat.audio.music` e `victory.audio.music`. Se um MP3 estiver ausente, toca o fallback sintetizado correspondente: lento na derrota e heroico na vitória. O mudo e o volume são compartilhados entre jogo, lobby e resultados. Navegadores que bloqueiam áudio aguardam clique, toque ou tecla.

O cenário e seus efeitos não exigem imagens extras. A logo ausente usa o placeholder existente. O tratamento de transparência continua sendo o do lobby e do Bat-Sinal; prefira o mesmo arquivo de logo para todas as telas.

## Ativar Próxima fase

1. Implemente a nova fase e adicione sua configuração ao sistema de fases (`LEVELS` e `LevelManager.totalLevels`).
2. Após criar `game`, registre a ação:

   ```js
   game.sceneManager.register('NextLevelScene', ({ nextLevelIndex }) => {
     game.restartGame(nextLevelIndex);
   });
   ```

3. Ative `LOBBY.endScreens.features.nextLevel = true`. O botão passa a aceitar mouse, teclado e controle e perde o texto “Em breve”. O nome da cena é ajustável em `LOBBY.endScreens.nextScene`.

O botão permanece bloqueado por padrão. Um destino não registrado é rejeitado com segurança.

## Exibir dois jogadores e skin

1. Ative `LOBBY.endScreens.features.twoPlayers = true`.
2. Passe os dados ao abrir a tela:

   ```js
   game.showEndScreen('victory', {
     score: 27400, bestScore: 30000, elapsedSeconds: 940, levelIndex: 3,
     players: [
       { name: 'JOGADOR 1', score: 14800 },
       { name: 'JOGADOR 2', score: 12600 },
     ],
     skin: { name: 'Traje clássico', image: 'assets/images/skins/classic.png' },
   });
   ```

3. Para revelar o espaço de skin, ative `LOBBY.endScreens.features.skinPreview = true`.

Isso habilita a apresentação de dados; a jogabilidade cooperativa e a seleção de skins continuam sendo funcionalidades futuras. Medalhas aparecem desativadas na vitória.

## Controles e verificação

Setas ou D-pad/analógico navegam pelos botões habilitados; Enter/Espaço ou A/Start confirmam. Esc retorna ao lobby. Tab alcança também volume e mudo. Um botão de controle segurado na partida precisa ser solto antes de confirmar a nova tela. Movimento reduzido desativa as animações decorativas.

Execute `npm run check`. As prévias de desenvolvimento usam o fluxo real de transição:

- `/tests/end-screens.html?result=defeat`
- `/tests/end-screens.html?result=victory`
- `/tests/end-screens.html?result=victory&coop` (dois jogadores e skin)

As prévias não alteram os recursos habilitados na página principal.

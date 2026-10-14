# Pontuação

Implementação em `src/systems/ScoreManager.js`. Todos os valores, textos, cores e tempos da animação ficam em `LOBBY.scoring`, em `src/config/configuracao.js`.

| Evento | Pontos | Configuração |
|---|---:|---|
| Mob comum | 100 | `mob` |
| Chefão | 500 | `boss` |
| Fase em até 90 segundos | 1.000 | `timeBonuses[0]` |
| Fase em até 180 segundos | 500 | `timeBonuses[1]` |
| Fase em até 300 segundos | 250 | `timeBonuses[2]` |
| Fase acima de 300 segundos | 100 | `timeBonuses[3]` |
| Derrota | Sem bônus de conclusão | Mantém os pontos obtidos |

Os limites são inclusivos. A pontuação acumula entre fases; o tempo é da fase atual. Cada fase concede um único bônus. Derrota mantém inclusive os bônus das fases já concluídas, mas não premia a fase perdida. Reiniciar uma tentativa zera o placar, os abates e o relógio; preserva o recorde. O resumo soma todos os abates e mostra separadamente bônus atual e bônus das fases anteriores, para conciliar o total.

## Eventos de morte

O callback `onEnemyKilled` do `CombatSystem` já está conectado no `Game`. Ele é emitido na passagem de vivo para morto, inclusive para cada chefe intermediário. Não conecte o mesmo abate uma segunda vez na entidade ou no `BossManager`.

```js
// Para outras fontes de dano, emita uma única vez por morte:
scoreManager.adicionarPontosMob(inimigo.scoreType);
scoreManager.adicionarPontosChefao(chefao.scoreType);
```

Cada entidade possui uma chave explícita `scoreType`, que não muda na compilação. Chaves atuais de mobs: `Joker`, `Penguin`, `PenguinElite`, `HarleyThug`, `ScarecrowAcolyte`, `TwoFaceEnforcer`. Chefes: `JokerBoss`, `Scarecrow`, `HarleyQuinn`, `TwoFace`.

Para valores individuais:

```js
// Dentro de LOBBY.scoring:
mobTypes: { Penguin: 200, HarleyThug: 150 },
bossTypes: { JokerBoss: 750 },
```

Tipos não listados usam 100/500. O resumo agrupa abates pelo valor aplicado, inclusive quando os tipos valem pontos diferentes.

## Relógio, conclusão e telas

```js
scoreManager.iniciarFase(2);       // mantém pontos; zera apenas tempo/bônus atual
scoreManager.atualizar(1 / 60);    // segundos ativos do passo fixo
scoreManager.pausar(true);        // pausa
scoreManager.pausar(false);       // continua
const dados = scoreManager.finalizarFase(); // bônus único e relógio parado
```

O jogo já executa esse ciclo automaticamente. Esc ou P abre/fecha a pausa; o botão Continuar também retoma. Mundo e relógio congelam juntos. O último golpe no último chefe para o relógio antes da animação de morte. A conclusão após essa animação aplica o bônus e mantém o fluxo existente de próxima fase ou vitória final.

```js
// API recomendada: finaliza o placar e envia seus dados automaticamente.
game.showEndScreen('victory');
game.showEndScreen('defeat');

// Integração explícita, caso outro sistema coordene a partida:
game.sceneManager.goTo('EndGameScene', {
  result: 'victory',
  data: game.scoreManager.finalizarFase(),
});
```

Na derrota use `finalizarDerrota()`. Os dados são copiados: `score`, `bestScore`, `mobs`, `bosses`, `mobPoints`, `bossPoints`, `elapsedSeconds`, `timeBonus`, `bonusTotal`, `breakdown`, `newRecord`, `players` e `levelIndex`. Nenhuma pontuação depende de variáveis globais. A vitória anima os valores; movimento reduzido mostra os números imediatamente.

## Recorde e expansão

O recorde é atualizado quando os pontos aumentam e salvo em `localStorage`, na chave `storageKey`. Persiste no mesmo navegador e endereço do site. Armazenamento bloqueado não interrompe a partida: mantém o recorde em memória. Empatar o recorde não mostra “NOVO RECORDE!”. As páginas de prévia usam armazenamento isolado e não alteram o recorde real.

O segundo argumento das funções de abate é `playerIndex` (0 ou 1). Os campos individuais já são enviados à tela, ocultos até ativar `LOBBY.endScreens.features.twoPlayers`. O bônus de conclusão é atribuído ao jogador 1; a divisão poderá ser ajustada quando houver cooperação real. `aplicarModificadores(points, context)` é o ponto de extensão reservado para combos, dano e itens; atualmente devolve os pontos sem multiplicação.

Verificação: `npm run check`. Os testes cobrem faixas, pausa, persistência, falha de armazenamento, abates reais, chefes consecutivos e proteção contra bônus duplicado. A prévia visual está em `/tests/end-screens.html?result=victory` ou `?result=defeat`.

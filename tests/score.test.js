import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoreManager } from '../src/models/services/ScoreManager.js';
import { LOBBY } from '../src/config/lobby.js';
import { Game } from '../src/controllers/GameController.js';
import { Joker } from '../src/models/entities/villains/Joker.js';
import { Batarang } from '../src/models/entities/projectiles/Batarang.js';

test('bonus continuo por segundo e tempo ativo sem deriva', () => {
  const score = new ScoreManager({storage:null}); score.iniciarFase();
  for (const [seconds, points] of [[0,1500],[90,1140],[90.01,1139],[180,780],[180.01,779],[300,300],[400,100]]) assert.equal(score.calcularBonusTempo(seconds),points);
  for (let i=0;i<5400;i++) score.atualizar(1/60);
  assert.equal(score.calcularBonusTempo(),1140);
  score.pausar(); const time=score.elapsedSeconds; score.atualizar(300); assert.equal(score.elapsedSeconds,time);
  score.pausar(false); score.atualizar(1); assert.equal(score.calcularBonusTempo(),1136);
});

test('valores por tipo, jogadores separados e resumo copiado conciliam o total', () => {
  const config={...LOBBY.scoring,mobTypes:{Penguin:200},bossTypes:{JokerBoss:750}};
  const score=new ScoreManager({config,storage:null}); score.iniciarFase();
  score.adicionarPontosMob('Joker'); score.adicionarPontosMob('Penguin',1); score.adicionarPontosChefao('JokerBoss');
  const data=score.finalizarFase(); assert.equal(data.score,2975); assert.equal(data.mobs,2); assert.equal(data.bosses,1);
  assert.equal(data.mobPoints+data.bossPoints+data.bonusTotal,data.score);
  assert.equal(data.players.reduce((sum,player)=>sum+player.score,0),data.score);
  data.breakdown[0].count=999; assert.equal(score.dados().breakdown[0].count,1);
  score.finalizarFase(); score.adicionarPontosChefao(); assert.equal(score.score,2975);
});

test('derrota não premia conclusão, preserva bônus anteriores e reinício conserva recorde', () => {
  const values=new Map(); const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  const score=new ScoreManager({storage}); score.iniciarFase(); score.adicionarPontosMob(); score.finalizarFase();
  score.iniciarFase(2); score.atualizar(200); score.adicionarPontosChefao();
  const data=score.finalizarDerrota(); assert.equal(data.score,2350); assert.equal(data.timeBonus,0); assert.equal(data.bonusTotal,1500);
  score.finalizarFase(); assert.equal(score.score,2350); score.atualizar(20); assert.equal(score.elapsedSeconds,200);
  assert.equal(new ScoreManager({storage}).bestScore,2350); score.reiniciar(); assert.equal(score.score,0); assert.equal(score.bestScore,2350); assert.equal(score.newRecord,false);
  score.iniciarFase(); while(score.score + 100 <= score.bestScore) { score.registrarDano(); score.adicionarPontosMob(); } assert.equal(score.newRecord,false); score.registrarDano(); score.adicionarPontosMob(); assert.equal(score.newRecord,true);
});

test('armazenamento bloqueado ou corrompido não interrompe pontuação', () => {
  for (const storage of [{getItem:()=> 'NaN',setItem:()=>{}},{getItem:()=>{throw Error();},setItem:()=>{throw Error();}}]) {
    const score=new ScoreManager({storage}); assert.equal(score.bestScore,0); score.iniciarFase(); score.adicionarPontosMob(); assert.equal(score.bestScore,100);
  }
});

globalThis.window = new EventTarget();
const makeGame=()=>new Game(Object.assign(new EventTarget(),{width:1920,height:1080,getBoundingClientRect:()=>({left:0,top:0,width:1920,height:1080}),getContext:()=>({})}));
const close=game=>{game.input.destroy();game.mouse.destroy();game.soundManager.destroy();};

test('combate real pontua uma morte, pausa congela tempo e derrota transporta dados reais', () => {
  const game=makeGame(); try {
    game.restartGame(); const enemy=new Joker({x:400,y:400}); enemy.hp=1; enemy.updateAI=()=>{};
    game.enemies=[enemy]; const shot=new Batarang(enemy.x,enemy.y,0,0); shot.intersects=target=>target===enemy; game.projectiles=[shot];
    game._update(1); assert.equal(game.scoreManager.score,100); game._update(1); assert.equal(game.scoreManager.mobs,1);
    const time=game.scoreManager.elapsedSeconds; game.togglePause(); game._update(60); assert.equal(game.scoreManager.elapsedSeconds,time);
    game.togglePause(); game.player.alive=false; game._update(1); game.sceneManager.update(LOBBY.endScreens.transition*2);
    assert.equal(game.screenUI.end.data.score,100); assert.equal(game.screenUI.end.data.mobs,1); assert.equal(game.screenUI.end.data.timeBonus,0); assert.equal(game.screenUI.end.data.demo,false);
  } finally {close(game);}
});

test('cada chefe pontua; só o último encerra cronômetro e gera bônus da fase', () => {
  const game=makeGame(); try {
    game.restartGame(); game.spawner.update=()=>{};
    game.bossManager.spawnBoss(game.levelManager.currentLevelConfig,game.currentLevel.width,game.height);
    const kill=()=>{ const boss=game.bossManager.boss; boss.hp=1; boss.updateAI=()=>{}; const shot=new Batarang(0,0,0,0); shot.intersects=target=>target===boss; game.projectiles=[shot]; game._update(1); };
    kill(); assert.equal(game.scoreManager.bosses,1); assert.equal(game.scoreManager.running,true);
    game.bossManager.deathTimer=0; game._update(1); kill();
    assert.equal(game.scoreManager.bosses,2); assert.equal(game.scoreManager.running,false);
    const time=game.scoreManager.elapsedSeconds; game.bossManager.deathTimer=0; game._update(1);
    assert.equal(game.scoreManager.elapsedSeconds,time); const finalScore=750+1250+Math.floor(1500-time*4); assert.equal(game.scoreManager.score,finalScore); assert.equal(game.state,'LEVEL_TRANSITION');
    for(let i=0;i<120;i++) game._update(1);
    assert.equal(game.scoreManager.elapsedSeconds,0); assert.equal(game.scoreManager.score,finalScore);
  } finally {close(game);}
});

test('combos variam abates, chegam a 2x e encerram por tempo ou dano',()=>{
 const score=new ScoreManager({storage:null});score.iniciarFase();
 assert.deepEqual(Array.from({length:6},()=>score.adicionarPontosMob('Joker')),[100,125,150,175,200,200]);
 score.pausar();score.atualizar(20);assert.equal(score.comboMultiplier,2);
 score.pausar(false);score.atualizar(6.01);assert.equal(score.adicionarPontosMob('Joker'),100);
 score.adicionarPontosMob('Joker');score.registrarDano();assert.equal(score.adicionarPontosMob('Joker'),100);
 score.iniciarFase(2);assert.equal(score.adicionarPontosMob('Penguin'),300);
 score.iniciarFase(3);assert.equal(score.adicionarPontosMob('PenguinElite'),500);
});

test('tomar dano no combate real quebra o combo uma unica vez por acerto valido',()=>{
 const game=makeGame();try{
  game.restartGame();game.scoreManager.adicionarPontosMob();game.scoreManager.adicionarPontosMob();
  assert.equal(game.scoreManager.comboMultiplier,1.25);game.player.invulnerable=0;
  const enemy=new Joker({x:game.player.x,y:game.player.y});
  game.combat.update(game.player,[enemy],null,[]);assert.equal(game.scoreManager.comboMultiplier,1);
  game.scoreManager.adicionarPontosMob();game.scoreManager.adicionarPontosMob();
  game.combat.update(game.player,[enemy],null,[]);assert.equal(game.scoreManager.comboMultiplier,1.25);
 }finally{game.destroy();}
});

import {EndGameView} from '../src/views/screens/EndGameView.js';
import {normalizeResultData} from '../src/models/results/resultData.js';
import {criarResultadoHTML} from '../src/views/ui/ResultMarkup.js';

test('resumo agrupa pontos de combos por inimigo e mostra cada nome em sua linha',()=>{
 const score=new ScoreManager({storage:null});score.iniciarFase();
 score.adicionarPontosMob('Joker');score.adicionarPontosMob('Joker');score.adicionarPontosMob('Penguin');
 score.adicionarPontosChefao('JokerBoss');
 const data=normalizeResultData(score.finalizarDerrota());
 const summary=new EndGameView().scoreSummary({result:'defeat',data});
 assert.ok(summary.includes('<dt>Coringa<small>2 derrotados</small></dt><dd data-count="225">225</dd>'));
 assert.ok(summary.includes('<dt>Pinguim<small>1 derrotado</small></dt><dd data-count="300">300</dd>'));
 assert.match(summary,/CHEFÕES DERROTADOS/);assert.ok(!summary.includes(' × '));
 assert.equal((summary.match(/<dt>Coringa/g)||[]).length,2);
});

test('tempo total acumula fases, ignora pausas e transicoes, e aparece nos dois resultados',()=>{
 const score=new ScoreManager({storage:null});score.iniciarFase(1);score.atualizar(100);score.finalizarFase();score.atualizar(20);
 score.iniciarFase(2);score.atualizar(80);score.pausar();score.atualizar(50);score.pausar(false);
 score.finalizarFase();score.iniciarFase(3);score.atualizar(30);
 assert.equal(score.elapsedSeconds,30);assert.equal(score.totalElapsedSeconds,210);
 for(const result of ['victory','defeat']){
  const data=normalizeResultData(score.dados()),profile=LOBBY.endScreens.screens[result];
  const html=criarResultadoHTML(result,data,profile,profile.buttons,0.45,'');
  assert.match(html,/TEMPO TOTAL DE JOGO/);assert.match(html,/03:30/);assert.ok(!html.includes('TEMPO DA FASE'));
 }
 score.reiniciar();assert.equal(score.totalElapsedSeconds,0);
});

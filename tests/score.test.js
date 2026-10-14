import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoreManager } from '../src/systems/ScoreManager.js';
import { LOBBY } from '../src/config/lobby.js';
import { Game } from '../src/core/Game.js';
import { Joker } from '../src/entities/villains/Joker.js';
import { Batarang } from '../src/entities/projectiles/Batarang.js';

test('faixas inclusivas de bônus e tempo ativo sem deriva nos limites', () => {
  const score = new ScoreManager({storage:null}); score.iniciarFase();
  for (const [seconds, points] of [[0,1000],[90,1000],[90.01,500],[180,500],[180.01,250],[300,250],[300.01,100]]) assert.equal(score.calcularBonusTempo(seconds),points);
  for (let i=0;i<5400;i++) score.atualizar(1/60);
  assert.equal(score.calcularBonusTempo(),1000);
  score.pausar(); const time=score.elapsedSeconds; score.atualizar(300); assert.equal(score.elapsedSeconds,time);
  score.pausar(false); score.atualizar(1); assert.equal(score.calcularBonusTempo(),500);
});

test('valores por tipo, jogadores separados e resumo copiado conciliam o total', () => {
  const config={...LOBBY.scoring,mobTypes:{Penguin:200},bossTypes:{JokerBoss:750}};
  const score=new ScoreManager({config,storage:null}); score.iniciarFase();
  score.adicionarPontosMob('Joker'); score.adicionarPontosMob('Penguin',1); score.adicionarPontosChefao('JokerBoss');
  const data=score.finalizarFase(); assert.equal(data.score,2050); assert.equal(data.mobs,2); assert.equal(data.bosses,1);
  assert.equal(data.mobPoints+data.bossPoints+data.bonusTotal,data.score);
  assert.equal(data.players.reduce((sum,player)=>sum+player.score,0),data.score);
  data.breakdown[0].count=999; assert.equal(score.dados().breakdown[0].count,1);
  score.finalizarFase(); score.adicionarPontosChefao(); assert.equal(score.score,2050);
});

test('derrota não premia conclusão, preserva bônus anteriores e reinício conserva recorde', () => {
  const values=new Map(); const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  const score=new ScoreManager({storage}); score.iniciarFase(); score.adicionarPontosMob(); score.finalizarFase();
  score.iniciarFase(2); score.atualizar(200); score.adicionarPontosChefao();
  const data=score.finalizarDerrota(); assert.equal(data.score,1600); assert.equal(data.timeBonus,0); assert.equal(data.bonusTotal,1000);
  score.finalizarFase(); assert.equal(score.score,1600); score.atualizar(20); assert.equal(score.elapsedSeconds,200);
  assert.equal(new ScoreManager({storage}).bestScore,1600); score.reiniciar(); assert.equal(score.score,0); assert.equal(score.bestScore,1600); assert.equal(score.newRecord,false);
  score.iniciarFase(); for(let i=0;i<16;i++) score.adicionarPontosMob(); assert.equal(score.newRecord,false); score.adicionarPontosMob(); assert.equal(score.newRecord,true);
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
    assert.equal(game.scoreManager.elapsedSeconds,time); assert.equal(game.scoreManager.score,2000); assert.equal(game.state,'LEVEL_TRANSITION');
    for(let i=0;i<120;i++) game._update(1);
    assert.equal(game.scoreManager.elapsedSeconds,0); assert.equal(game.scoreManager.score,2000);
  } finally {close(game);}
});

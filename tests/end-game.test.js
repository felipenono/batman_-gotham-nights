import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/core/Game.js';
import { LOBBY } from '../src/config/lobby.js';
import { normalizeResultData, formatPlayTime } from '../src/scenes/EndGameScene.js';
import { ScreenAudioManager } from '../src/audio/ScreenAudioManager.js';
import { ScreenNavigation } from '../src/ui/ScreenNavigation.js';
import { escapeHTML } from '../src/ui/ScreenElements.js';

globalThis.window = new EventTarget();
const makeGame = () => new Game(Object.assign(new EventTarget(), {
  width:1920,height:1080,getBoundingClientRect:()=>({left:0,top:0,width:1920,height:1080}),getContext:()=>({}),
}));
const close = game => {game.screenUI.active?.unmount();game.input.destroy();game.mouse.destroy();game.soundManager.destroy();};

test('derrota congela a partida durante o fade e tentar novamente reinicia a fase atual', () => {
  const game=makeGame();
  try {
    game.restartGame(2);
    const x=game.player.x;
    assert.equal(game.showEndScreen('defeat',{score:1234,bestScore:5678,elapsedSeconds:99}),true);
    assert.equal(game.showEndScreen('victory'),false);
    game._update(1);assert.equal(game.player.x,x);assert.equal(game.state,'PLAYING');
    game.sceneManager.update(LOBBY.endScreens.transition);
    assert.equal(game.state,'GAME_OVER');assert.equal(game.screenUI.end.data.levelIndex,2);
    assert.equal(game.screenUI.end.data.score,1234);assert.equal(game.screenUI.end.data.demo,false);
    assert.equal(game.screenUI.end.activate('retry'),false,'ignora confirmação enquanto a cortina está ativa');
    game.sceneManager.update(LOBBY.endScreens.transition);
    game.screenUI.end.update(LOBBY.endScreens.inputDelay);
    assert.equal(game.screenUI.end.activate('retry'),true);
    game.sceneManager.update(LOBBY.endScreens.transition * 2);
    assert.equal(game.state,'PLAYING');assert.equal(game.levelManager.currentLevelIndex,2);
    assert.equal(game.player.alive,true);
  } finally { close(game); }
});

test('vitória transporta os dados, bloqueia próxima fase e permite voltar ao lobby', () => {
  const game=makeGame();
  try {
    game.restartGame(3);
    game.showEndScreen('victory',{score:9000,bestScore:10000,elapsedSeconds:3601});
    game.sceneManager.update(LOBBY.endScreens.transition * 2);
    game.screenUI.end.update(LOBBY.endScreens.inputDelay);
    assert.equal(game.state,'VICTORY');assert.equal(game.screenUI.end.data.elapsedSeconds,3601);
    assert.equal(game.screenUI.end.activate('next'),false);
    assert.equal(game.screenUI.end.activate('menu'),true);
    game.sceneManager.update(LOBBY.endScreens.transition * 2);
    assert.equal(game.state,'MENU');assert.equal(game.screenUI.active,game.screenUI.menu);
  } finally { close(game); }
});

test('dados opcionais têm placeholders, suportam dois jogadores e são copiados', () => {
  const data={score:-10,elapsedSeconds:NaN,players:[{name:'<b>A</b>',score:50},{name:'B',score:80},{name:'C',score:90}],skin:{name:'Clássica',image:'assets/images/skin.png'}};
  const model=normalizeResultData(data);
  assert.equal(model.score,0);assert.equal(model.elapsedSeconds,LOBBY.endScreens.demo.elapsedSeconds);
  assert.equal(model.players.length,2);data.players[0].score=999;assert.equal(model.players[0].score,50);
  assert.equal(escapeHTML(model.players[0].name),'&lt;b&gt;A&lt;/b&gt;');
  assert.equal(formatPlayTime(0),'00:00');assert.equal(formatPlayTime(754),'12:34');assert.equal(formatPlayTime(3601),'1:00:01');
});

test('um controle segurado ao entrar não ativa resultado nem repete confirmações', () => {
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  let clicks=0, blocked=true;
  const pad={connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))};
  pad.buttons[0].pressed=true;
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[pad]}});
  try {
    const button={click(){clicks++;}}, root={querySelector:()=>null,querySelectorAll:()=>[button]};
    const nav=new ScreenNavigation(root,{activate(){},blocked:()=>blocked,gesture(){},back(){}});
    nav.update(16);blocked=false;nav.update(16);assert.equal(clicks,0);
    pad.buttons[0].pressed=false;nav.update(16);pad.buttons[0].pressed=true;nav.update(16);
    nav.update(16);assert.equal(clicks,1);
  } finally {
    if(descriptor)Object.defineProperty(globalThis,'navigator',descriptor);else delete globalThis.navigator;
  }
});

test('troca de áudio preserva volume, ignora play atrasado e mantém fallback em arquivo ausente', async () => {
  const OriginalAudio=globalThis.Audio;
  let resolvePlay;
  globalThis.Audio=class {
    constructor(){this.paused=true;this.events={};}
    addEventListener(name,fn){this.events[name]=fn;}
    play(){this.paused=false;return new Promise(resolve=>{resolvePlay=resolve;});}
    pause(){this.paused=true;}
  };
  const shared={isMuted:false,masterVolume:0.2,screenVolumeInitialized:true,track:null,
    setTrack(track){this.track=track;},setBgmVolume(){},setMasterVolume(v){this.masterVolume=v;},_initContext(){},playSfx(){}};
  try {
    const audio=new ScreenAudioManager(shared,LOBBY.endScreens.screens.defeat.audio);
    audio.enter();audio.unlock();const previous=audio.music;audio.leave();
    audio.configure(LOBBY.endScreens.screens.victory.audio);audio.enter();
    resolvePlay();await Promise.resolve();await Promise.resolve();
    assert.equal(previous.paused,true);assert.equal(shared.track,'victory');assert.equal(audio.volume,0.2);
    audio.music.events.error();assert.equal(audio.failed,true);assert.equal(shared.track,'victory');
    audio.update(2000);assert.ok(audio.music.volume>0);shared.isMuted=true;audio.update(16);assert.equal(audio.music.volume,0);
    audio.leave();
  } finally {if(OriginalAudio===undefined)delete globalThis.Audio;else globalThis.Audio=OriginalAudio;}
});

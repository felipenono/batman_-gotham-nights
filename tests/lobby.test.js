import test from 'node:test';
import assert from 'node:assert/strict';
import { SceneManager } from '../src/controllers/SceneController.js';
import { LobbyAudioManager } from '../src/views/audio/LobbyAudioManager.js';
import { LOBBY } from '../src/config/lobby.js';

test('transição rejeita destino ausente e cliques repetidos; troca uma vez no preto', () => {
  let starts=0, fades=0, leaves=0, resets=0;
  const game={restartGame(){starts++;}, input:{_onBlur(){resets++;}}, mouse:{_onBlur(){resets++;}},screenUI:{menu:{audio:{fadeOut(){fades++;},leave(){leaves++;}}}}};
  const manager=new SceneManager(game);
  assert.equal(manager.goTo('MissingScene'),false);
  assert.equal(manager.goTo(),true);
  assert.equal(manager.goTo(),false);
  manager.update(LOBBY.motion.transition-1);
  assert.equal(starts,0);
  manager.update(1);
  assert.equal(starts,1);assert.equal(resets,2);assert.equal(leaves,1);assert.equal(fades,1);
  manager.update(LOBBY.motion.transition);
  assert.equal(manager.transition,null);assert.equal(starts,1);
});

test('destinos futuros aceitam registro sem alterar o layout', () => {
  let entered=false;
  const manager=new SceneManager({screenUI:{menu:{audio:{fadeOut(){},leave(){}}}},input:{_onBlur(){}},mouse:{_onBlur(){}}});
  manager.register('SkinScene',()=>{entered=true;});
  manager.goTo('SkinScene');manager.update(LOBBY.motion.transition);
  assert.equal(entered,true);
});

test('áudio sem arquivos usa fallback, faz fades, respeita mudo e restaura volume', () => {
  let track, bgm;
  const shared={isMuted:false,setTrack(v){track=v;},setMasterVolume(){},setBgmVolume(v){bgm=v;},_initContext(){},playSfx(){}};
  const audio=new LobbyAudioManager(shared);
  audio.enter();assert.equal(track,'menu');assert.equal(audio.gain,0);
  audio.update(LOBBY.audio.fadeIn);assert.equal(audio.gain,1);
  audio.unlock();assert.equal(audio.gain,0,'primeiro gesto reinicia o fade-in');
  audio.update(LOBBY.audio.fadeIn);assert.equal(audio.gain,1);
  audio.fadeOut();audio.update(LOBBY.audio.fadeOut);assert.equal(audio.gain,0);assert.equal(bgm,0);
  audio.setVolume(2);assert.equal(audio.volume,1);
  audio.setVolume(-1);assert.equal(audio.volume,0);
  audio.leave();assert.equal(audio.active,false);assert.ok(bgm>0);
});

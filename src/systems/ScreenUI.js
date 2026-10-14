import { MenuScene } from '../scenes/MenuScene.js';
import { GameState } from '../core/GameState.js';

export class ScreenUI {
  constructor(game,root) {
    this.game=game;this.root=root;this.previous='';
    this.menu=new MenuScene(game,root);this.inMenu=false;
    if(!root)return;
    root.addEventListener('click',event=>{
      const action=event.target.closest('button')?.dataset.action;
      if(!action||game.gameOverCooldown>0)return;
      if(action==='start')game.restartGame();
      if(action==='menu'){game.state=GameState.MENU;}
      game.input._onBlur();game.mouse._onBlur();this.update();
    });
  }
  update() {
    if(!this.root)return;
    const g=this.game, key=g.state+':'+(g.gameOverCooldown>0);
    if(key===this.previous)return;this.previous=key;
    if(this.inMenu && g.state!==GameState.MENU){this.menu.unmount();this.inMenu=false;}
    const disabled=g.gameOverCooldown>0?'disabled':'';
    const button=(label,action)=>`<button data-action="${action}" ${disabled}>${label}</button>`;
    this.root.hidden=![GameState.MENU,GameState.GAME_OVER,GameState.VICTORY].includes(g.state);
    if(g.state===GameState.MENU){this.inMenu=true;this.menu.mount();}
    else if(g.state===GameState.GAME_OVER)this.root.innerHTML=`<div class="screen-panel"><p class="eyebrow">GOTHAM AINDA PRECISA DE VOCÊ</p><h1>Fim de jogo</h1><p>Inimigos derrotados: <strong>${g.spawner.totalKills}</strong></p><div class="screen-actions">${button('Tentar novamente','start')}${button('Voltar ao início','menu')}</div><small>Enter para tentar novamente · Esc para voltar</small></div>`;
    else if(g.state===GameState.VICTORY)this.root.innerHTML=`<div class="screen-panel"><p class="eyebrow">MISSÃO CONCLUÍDA</p><h1>Gotham está segura</h1><p>Três fases concluídas · ${g.spawner.totalKills} inimigos derrotados</p><div class="screen-actions">${button('Jogar novamente','start')}${button('Voltar ao início','menu')}</div></div>`;
  }
}

import { LOBBY } from '../../config/configuracao.js';
import { GothamBackdrop } from '../scenes/GothamBackdrop.js';
import { criarMenuHTML } from '../ui/MenuMarkup.js';
import { loadLogo } from '../ui/ScreenElements.js';

export class MenuView {
  constructor() {this.backdrop=new GothamBackdrop();}
  mount(root,volume,time) {
    this.backdrop.batSignal.enter(time);
    document.documentElement.style.setProperty("--lobby-accent", LOBBY.colors.accent);
    document.documentElement.style.setProperty("--lobby-text", LOBBY.colors.text);
    document.documentElement.style.setProperty("--lobby-pulse", `${LOBBY.motion.pulse}ms`);
    document.documentElement.style.setProperty("--lobby-fog", `${LOBBY.motion.fog}ms`);
    root.classList.add("lobby");
    root.innerHTML = criarMenuHTML(volume);
    loadLogo(root);

  }
  unmount(root) {root.classList.remove('lobby');}
  draw(contexto, largura, altura, state) {
    const screenAspect = state.root?.clientHeight ? state.root.clientWidth / state.root.clientHeight : null;
    state.backdrop.draw(contexto, largura, altura, state.time, state.pointer, state.reduced, screenAspect);

  }
}

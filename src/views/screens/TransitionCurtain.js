export class TransitionCurtain {
  constructor(root=globalThis.document?.getElementById('scene-transition')) {this.root=root;}
  setOpacity(value) {if(this.root)this.root.style.opacity=String(value);}
}

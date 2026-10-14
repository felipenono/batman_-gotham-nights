// Este arquivo cuida de compartilhar ícones, logo e proteção dos textos em HTML.
// ===== DEPENDÊNCIAS E CONFIGURAÇÕES =====
import { LOBBY, assetURL } from "../config/configuracao.js";
export const LOCK_ICON = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"6\" y=\"10\" width=\"12\" height=\"10\" rx=\"2\"/><path d=\"M9 10V7a3 3 0 0 1 6 0v3\"/></svg>";
export const SOUND_ICON = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 10h4l5-4v12l-5-4H4zM16 8q5 4 0 8M19 5q8 7 0 14\"/></svg>";
export const escapeHTML = (valor) => String(valor ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
})[char]);
/** A mesma logo e o mesmo fallback visual usados no lobby. */
export function logoMarkup(label = "Símbolo do Batman") {
  return `<svg class="svg-defs" aria-hidden="true"><defs><filter id="bat-cutout" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.91 0 0 0 0 0.77 0 0 0 0 0.42 -0.3333 -0.3333 -0.3333 0 1"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs></svg><div class="lobby-crest"><span class="crest-fallback" aria-hidden="true">◆</span><img alt="${escapeHTML(label)}" class="bat-logo"></div>`;
}
export function loadLogo(raiz) {
  const imagem = raiz.querySelector(".bat-logo");
  imagem.addEventListener("load", () => raiz.querySelector(".crest-fallback")?.setAttribute("hidden", ""));
  imagem.addEventListener("error", () => {
    imagem.hidden = true;
  });
  imagem.src = assetURL(LOBBY.assets.logo);
}

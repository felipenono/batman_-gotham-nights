// Este arquivo fornece um contexto 2D de registro para verificar a ordem e os valores do desenho.
export function criarRegistroCanvas() {
  const operacoes = [];
  let numeroGradiente = 0;
  const valores = { globalAlpha: 1, measureText: texto => ({ width: String(texto).length * 8 }) };
  const contexto = new Proxy(valores, {
    get(objeto, chave) {
      if (chave in objeto) return objeto[chave];
      if (chave === 'createLinearGradient' || chave === 'createRadialGradient') {
        return (...argumentos) => {
          const id = 'gradiente' + numeroGradiente++;
          operacoes.push([chave, ...argumentos]);
          return { id, addColorStop: (...valores) => operacoes.push(['corGradiente', id, ...valores]) };
        };
      }
      return (...argumentos) => operacoes.push([chave, ...argumentos]);
    },
    set(objeto, chave, valor) {
      objeto[chave] = valor;
      operacoes.push(['atributo', chave, valor?.id ?? valor]);
      return true;
    },
  });
  return { contexto, operacoes };
}

// Usa sorteios repetíveis apenas nos testes; o jogo mantém sua aleatoriedade normal.
export function usarSemente() {
  const original = Math.random;
  let semente = 731;
  Math.random = () => {
    semente = (semente * 16807) % 2147483647;
    return semente / 2147483647;
  };
  return () => { Math.random = original; };
}

export const poseDeTeste = {
  alive: true, x: 100, y: 200, w: 40, h: 72, facing: 1, vx: 2, vy: 0,
  onGround: true, isAttacking: true, throwAnimTimer: 10, hurtFlash: 0,
  invulnerable: 0, fearTimer: 0, hp: 100, maxHp: 100, hpRatio: 1,
  coinFlipping: false, animTime: 1, wobble: 0.3, waddleTime: 0.3,
  floatCycle: 0.5, acrobatTime: 0.4, stride: 0.3,
};

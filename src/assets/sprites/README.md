# Sprites e animações

O jogo combina imagens PNG fornecidas com animações montadas em Canvas. Os arquivos originais permanecem intactos; a transparência externa, os passos e as transformações de cada estado são aplicados durante a renderização.

## Imagens dos personagens

| Personagem | Identificador | Arquivo |
| --- | --- | --- |
| Batman | `batman` | `batman_reference.png` |
| Coringa | `joker` | `joker_reference.png` |
| Pinguim | `penguin` | `penguin_reference.png` |
| Espantalho | `scarecrow` | `scarecrow_reference.png` |
| Arlequina | `harley_quinn` | `harley_quinn_reference.png` |
| Duas-Caras | `two_face` | `two_face_reference.png` |

O Coringa utiliza a imagem enviada e aparece tanto nas ondas quanto como chefão. O Espantalho utiliza a referência mais recente, com máscara costurada e efeito de gás. Os capangas herdam o sprite do personagem correspondente, com escala e identificação de cor próprias.

Os módulos `batman.js`, `joker.js`, `penguin.js`, `scarecrow.js`, `harley_quinn.js` e `two_face.js` conservam os desenhos procedurais anteriores. O carregamento das imagens e a máscara do fundo claro ficam em `referenceSprites.js`.

## Estados de animação

Cada personagem possui seis sequências:

| Ação | Nome no código | Quadros |
| --- | --- | --- |
| Parado | `idle` | 8 |
| Caminhada | `walk` | 12 |
| Salto | `jump` | 4 |
| Ataque | `attack` | 6 |
| Dano | `hurt` | 4 |
| Morte | `death` | 10 |

São **36 sequências e 264 quadros**, com nomes como `batman_walk`, `joker_attack` e `scarecrow_death`. `SpriteAnimator.js` seleciona o estado conforme velocidade, contato com o chão, ataque, dano e morte.

Os quadros têm **512 × 512 pixels**, com um ponto fixo nos pés. A caminhada movimenta as partes inferiores da imagem em passos alternados; as outras ações usam poses e transformações em Canvas. As transições duram três atualizações, e a morte termina no último quadro sem repetir.

Os quadros são preparados sob demanda e mantidos em um cache de até 64 entradas. As dimensões transparentes do quadro não alteram as caixas de colisão dos personagens.

## Armas, efeitos e logo

- `batarang_reference.png`: imagem do batarangue lançado, ajustada proporcionalmente para até 24 × 11 unidades do jogo. A mesma forma aparece nas vidas do HUD.
- `bat_logo_reference.png`: símbolo normal do Batman aplicado às telas, com contorno amarelo escurecido em 50%.
- `PenguinBomb.js`: desenho em código do pinguim mecânico explosivo e de sua explosão.
- `Mallet.js`: desenho em código da marreta arremessada.
- `batSymbols.js`: aplicação dos sprites da arma e da logo na interface e no combate.

As imagens dos personagens, da logo e do batarangue vieram dos anexos. As animações foram construídas em Canvas a partir dessas imagens; não são folhas PNG com poses desenhadas individualmente.

## Inspeção

Com `npm run dev` ativo, abra `/tests/screens.html` e selecione **Verificar sprites** para visualizar as sequências e conferir cortes nas bordas dos 264 quadros.

Abra `/tests/browser.html` para observar os personagens nos mapas e testar o movimento e os ataques dos chefões. O funcionamento geral do jogo está no [README principal](../../../README.md).

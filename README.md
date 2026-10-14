# Batman: Noites de Gotham

**Batman: Gotham Nights** é um jogo de ação e plataformas em 2D desenvolvido em **JavaScript**, com **HTML5 Canvas**, **Vite** e **Programação Orientada a Objetos (POO)**. Você controla o Batman, enfrenta ondas de inimigos e derrota os chefões para concluir três fases de Gotham.

O jogo usa sprites em PNG, animações montadas em Canvas e cenários desenhados em código. A interface está em português e a renderização é feita em **1920 × 1080**, com escala proporcional.

## Como instalar e jogar

### Requisitos

- Node.js **20.x a partir de 20.19.0**, ou **22.12.0 ou superior**, conforme o requisito do Vite usado pelo projeto.
- npm, incluído no Node.js.
- Navegador com suporte a Canvas 2D e Web Audio.
- Git, caso queira baixar o repositório pelo terminal.

### Baixar o projeto

```bash
git clone https://github.com/felipenono/batman_-gotham-nights.git
cd batman_-gotham-nights
```

Se você já possui a pasta do projeto, abra um terminal dentro dela.

### Instalar e iniciar

```bash
npm ci
npm run dev
```

Abra o endereço mostrado pelo Vite no terminal, normalmente **http://localhost:3000**. Na tela inicial, clique em **Iniciar jogo** ou pressione **Enter** ou **Espaço**.

`npm ci` instala as versões registradas em `package-lock.json`. Se você alterar as dependências do projeto, use `npm install` para atualizar a instalação e esse arquivo.

### Compilar a versão de produção

```bash
npm run build
npm run preview
```

A compilação gera a pasta `dist/`. O comando de prévia serve essa versão no endereço indicado pelo terminal. Para executar o jogo, use o servidor de desenvolvimento ou de prévia, pois o projeto utiliza módulos JavaScript e carregamento de imagens.

## Controles

| Ação | Controle |
| --- | --- |
| Andar para a esquerda | `A` ou `←` |
| Andar para a direita | `D` ou `→` |
| Pular | `W`, `↑` ou `Espaço` |
| Mirar | Mover o mouse |
| Lançar um batarangue | Clique esquerdo, `X` ou `Z` |
| Iniciar ou tentar novamente | Botão da tela, `Enter` ou `Espaço` |
| Voltar ao início após fim de jogo ou vitória | Botão **Voltar ao início** ou `Esc` |
| Ligar ou desligar o som | `M` |

As teclas `C`, `V`, `J`, `K`, `F`, `Q`, `E`, `Control` e `Shift` também estão configuradas para lançar batarangues. Depois de mover o mouse, os disparos pelo teclado seguem a mira; enquanto ela não estiver definida, seguem a direção do Batman.

O movimento para ao soltar a direção. Pressionar esquerda e direita ao mesmo tempo interrompe o deslocamento horizontal. Perder o foco da janela limpa as teclas e os cliques pendentes.

O pulo aceita uma pequena margem de aproximadamente **100 ms** antes do pouso ou depois de sair de uma borda, para facilitar a resposta dos controles. Essa margem permite um salto normal e não concede pulo duplo.

## Objetivo e progressão

Cada fase começa com ondas de inimigos. O HUD mostra quantos você já derrotou e a quantidade necessária para liberar os chefões. Ao atingir essa meta, novas ondas deixam de aparecer.

| Fase | Cenário | Inimigos das ondas | Meta | Chefões |
| --- | --- | --- | --- | --- |
| 1 | Telhados de Gotham | Coringas e acólitos do Espantalho | 10 derrotados | Coringa, depois Espantalho |
| 2 | Salão Iceberg | Pinguins e capangas da Arlequina | 15 derrotados | Arlequina |
| 3 | Asilo Arkham | Agentes do Duas-Caras e Pinguins de contenção | 10 derrotados | Duas-Caras |

Na primeira fase, é necessário derrotar **os dois chefes em sequência** para avançar. Depois dos chefões de uma fase, uma transição apresenta a próxima missão. Derrotar o Duas-Caras na terceira fase leva à tela de vitória.

### Comportamento dos chefões

- **Coringa — 120 pontos de vida:** aproxima-se, recua e salta. Lança dentes mecânicos em arco e bombas de gás. Com menos da metade da vida, seu ataque de dentes dispara uma sequência mais ampla.
- **Espantalho — 100 pontos de vida:** persegue, patrulha e recua usando a física do jogo. Pode saltar para alcançar um jogador em posição mais alta. Usa fumaça e bombas de gás; sua aura de medo inverte os controles direcionais por três segundos.
- **Arlequina — 120 pontos de vida:** faz investidas com estrelas, dispara balas e lança marretas em arco. Abaixo de metade da vida, passa a usar três balas por disparo.
- **Duas-Caras — 150 pontos de vida:** joga uma moeda antes de escolher seu ataque. Cara indica tiros e coroa indica moedas saltitantes. Seus padrões ficam mais intensos quando está com pouca vida.

Os inimigos comuns acompanham o tema dos chefões: dentes e gás nos telhados, pinguins explosivos e marretas no Salão Iceberg, balas, moedas e explosivos em Arkham.

## Combate, vidas e HUD

### Batarangues

O ataque principal do Batman é o lançamento de batarangues.

- Cada clique esquerdo ou novo pressionamento de uma tecla de ataque lança **no máximo um** batarangue.
- Segurar o mouse ou uma tecla não gera novos disparos; a repetição automática do teclado é ignorada.
- Existe uma recarga de **0,5 segundo** entre lançamentos.
- O jogador pode ter até **cinco batarangues ativos** simultaneamente.
- Colisão, expiração ou saída do mundo remove o projétil e libera uma vaga.
- Tentativas feitas durante a recarga ou quando não há vagas são descartadas. Para lançar depois, faça um novo clique ou pressionamento.

O HUD mostra as vagas livres em **BATARANGUES**, a contagem da **RECARGA** e quando a arma está pronta. O número de vagas e a recarga são regras independentes: ter uma vaga livre não elimina o tempo entre disparos.

### Ataques do Pinguim

Os Pinguins das fases 2 e 3 lançam pequenos pinguins mecânicos explosivos em direção ao jogador, inclusive para cima, para baixo e para trás.

O projétil acompanha o alvo durante **um segundo**, com giro limitado para permitir esquivas. Depois desse período, mantém a trajetória. Ele explode ao atingir uma plataforma, tocar um jogador que não esteja intangível ou completar seu tempo de voo de dois segundos. Cada explosão aplica dano ao jogador no máximo uma vez.

### Saúde e vidas

Batman começa com **cinco vidas**, cada uma com **três pontos de saúde**. Os ícones de batarangue representam as vidas; as barras verdes representam a saúde da vida atual.

Ao perder toda a saúde, Batman perde uma vida e executa uma animação de morte. Se ainda houver vidas, reaparece no ponto inicial da fase com a saúde restaurada e fica intangível a inimigos e projéteis por **um segundo**. Durante esse período, continua colidindo com as plataformas; não há aviso textual de intangibilidade.

Ao iniciar uma nova fase, o jogo restaura as cinco vidas e a saúde. Se as vidas da fase acabarem, aparece a tela **Fim de jogo**. **Tentar novamente** inicia a campanha pela primeira fase.

O HUD também apresenta a fase atual, a meta de inimigos, o nome e a saúde do chefe, o estado do som e o aviso de controles invertidos pelo gás do medo.

## Sprites, câmera e resolução

Os seis personagens principais possuem os estados **parado, caminhada, salto, ataque, dano e morte**. As sequências têm nomes como `batman_walk`, `joker_attack` e `scarecrow_death`.

As imagens fornecidas são carregadas de `src/assets/sprites/`. O fundo externo claro é mascarado durante o carregamento, preservando os detalhes internos, como roupas e olhos brancos. As animações usam transformações e movimentos de partes da imagem em Canvas; as imagens originais permanecem intactas.

Os **264 quadros** das **36 sequências** são gerados sob demanda em telas transparentes de 512 × 512 pixels. Eles compartilham um ponto fixo nos pés e usam transições curtas entre estados. O cache é limitado para reduzir o consumo de memória. Veja os detalhes no [catálogo de sprites](src/assets/sprites/README.md).

O cenário acompanha a câmera. Plataformas, personagens, projéteis e colisões usam as mesmas coordenadas do mundo. Quando a câmera estabiliza, a arquitetura fica parada; chuva, névoa e efeitos de luz continuam animados.

O Canvas possui resolução interna de **1920 × 1080**. O jogo mantém um espaço lógico de **900 × 500**, ampliado com uma única escala para preservar proporções. Duas faixas de aproximadamente sete pixels no topo e na base completam a imagem Full HD. A apresentação se ajusta à janela e a mira do mouse converte a posição do cursor usando essa mesma escala.

As luzes dos mapas são suaves. Em Arkham, halos e reflexos acompanham a posição e o estado das luminárias; uma luz apagada não produz esses efeitos. A logo inicial utiliza o símbolo normal do Batman com contorno amarelo escurecido em 50%.

## Como o código funciona

`src/main.js` prepara as imagens e inicia uma instância de `Game`. O jogo executa a lógica em passos fixos de **60 atualizações por segundo** e desenha a cena com `requestAnimationFrame`.

Em cada atualização, o jogo lê os controles, movimenta o jogador, executa a IA dos inimigos, aplica a física, atualiza os projéteis e resolve o combate. Depois atualiza o cenário e a câmera. Na renderização, desenha o mundo, as entidades, os efeitos e o HUD.

A arquitetura distribui essas responsabilidades entre classes:

| Componente | Responsabilidade |
| --- | --- |
| `Game` e `GameState` | Coordenar o ciclo e os estados: início, partida, transição, fim de jogo e vitória. |
| `Input` e `Mouse` | Capturar teclas, cliques e mira, distinguindo pressionamentos novos de comandos mantidos. |
| `Camera` e `Viewport` | Acompanhar o jogador e compartilhar a escala entre desenho e entrada do mouse. |
| `Entity`, `Character` e subclasses | Representar geometria, saúde, animação e comportamento de personagens e projéteis. |
| `Physics` | Aplicar gravidade e resolver colisões com plataformas e limites do mundo. |
| `CombatSystem` | Detectar impactos, aplicar dano e produzir efeitos de combate. |
| `Spawner` | Criar ondas de inimigos e contar as derrotas necessárias para liberar os chefes. |
| `BossManager` e `LevelManager` | Controlar a sequência de chefões e a passagem entre fases. |
| `HUD` e `ScreenUI` | Exibir informações da partida e os botões das telas. |
| `SpriteAnimator` | Escolher a animação de cada personagem e reutilizar seus quadros. |
| `AudioManager` | Reproduzir música e efeitos produzidos com Web Audio. |

A herança mantém interfaces comuns: `Character` estende `Entity`, Batman e os vilões estendem `Character`, e `JokerBoss` especializa `Joker`. Da mesma forma, `Projectile` estende `Entity` e cada arma especializa seu movimento e desenho. O jogo chama os métodos das subclasses por polimorfismo.

### Organização das pastas

```text
src/
├── main.js              # Entrada do jogo
├── assets/sprites/      # Imagens, desenhos-base e carregamento dos sprites
├── audio/               # Música, efeitos e controle de áudio
├── core/                # Game, estados, controles, câmera e viewport
├── entities/            # Personagens, plataformas, vilões e projéteis
├── systems/             # Física, combate, ondas, chefes, fases e interface
├── utils/               # Constantes, animações e símbolos
└── world/               # Construção dos mapas, plataformas e cenários
scripts/                 # Verificação de sintaxe e limpeza de dist/
tests/                   # Testes automatizados e páginas de inspeção
index.html               # Canvas e estrutura da interface
vite.config.js           # Configuração do Vite em JavaScript
package.json             # Dependências e comandos
package-lock.json        # Versões exatas das dependências
```

### Ajustar as regras do jogo

As configurações principais ficam em [src/config/configuracao.js](src/config/configuracao.js):

- `GAME`: resolução, gravidade, vidas, saúde, duração da intangibilidade e tolerância do pulo.
- `PROJECTILE`: dano, velocidade, recarga, limite de batarangues e parâmetros dos explosivos do Pinguim.
- `LEVELS`: nomes das fases, inimigos, chefões e metas de derrotas.
- `KEYS`: teclas associadas a cada ação.
- `LIGHTING` e `LOGO_GOLD`: intensidade da iluminação e cor do contorno da logo.

Os tempos de combate são expressos em atualizações: **30 equivalem a 0,5 segundo** e **60 equivalem a um segundo**.

## Testes e verificações

| Comando | Função |
| --- | --- |
| `npm run dev` | Iniciar o servidor de desenvolvimento. |
| `npm run lint` | Verificar a sintaxe JavaScript e a ausência de arquivos TypeScript. |
| `npm test` | Executar os testes com o runner nativo do Node.js. |
| `npm run build` | Compilar a versão de produção em `dist/`. |
| `npm run preview` | Servir a compilação para inspeção local. |
| `npm run check` | Executar sintaxe, testes e compilação em sequência. |
| `npm run clean` | Remover somente a pasta `dist/` gerada. |

Para verificar o projeto completo:

```bash
npm run check
```

Os testes cobrem disparo único, recarga, limite de projéteis, mira, liberação de controles, pulo, explosões, movimento e colisões, iluminação, transparência dos sprites e progressão dos chefões até a vitória.

Com `npm run dev` ativo, você também pode abrir:

- **http://localhost:3000/tests/browser.html**: execute as verificações, selecione mapas e chefões, alterne as luminárias e avance ou anime o combate.
- **http://localhost:3000/tests/screens.html**: confira as telas, a morte do jogador e os quadros de animação, incluindo a verificação de cortes nas bordas.

Se o Vite utilizar outra porta, substitua `3000` pelo valor mostrado no terminal. Essas páginas são ferramentas de desenvolvimento e não fazem parte da compilação de produção.

## Lobby cinematográfico

O menu inicial tem skyline de Gotham com parallax, névoa, chuva e Bat-Sinal, áudio opcional em loop e navegação por mouse, teclado ou controle. Veja [LOBBY.md](LOBBY.md) para a estrutura completa, os caminhos de assets e como habilitar os botões futuros.

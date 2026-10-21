# Batman: Noites dos Vilões

Jogo de ação e plataformas em JavaScript, Canvas 2D e Vite, organizado em **MVC com orientação a objetos**. São três fases, inimigos temáticos, chefões, pontuação e interface em português. Renderização em 1920 × 1080 com escala proporcional.

## Executar

Requer Node.js 20.19+ na série 20, ou 22.12+ nas séries seguintes, e npm.

```bash
git clone https://github.com/felipenono/batman_-gotham-nights.git
cd batman_-gotham-nights
npm ci
npm run dev
```

Abra **http://localhost:3000** ou a porta indicada pelo Vite. Mantenha o terminal aberto enquanto joga.

## Controles e regras

| Ação | Controle |
| --- | --- |
| Andar | A/D ou ←/→ |
| Pular | W, ↑ ou Espaço |
| Mirar | Mouse |
| Lançar batarangue | Clique esquerdo, X ou Z |
| Pausar/continuar | Esc ou P |
| Alternar som | M |
| Navegar nas telas | Mouse, setas e Enter/Espaço; Esc retorna ao menu nos resultados |

- Cada clique ou pressionamento lança um batarangue: segurar não repete. Recarga de **0,5 s**, até **cinco ativos**; tentativas bloqueadas são descartadas.
- Batman começa cada fase com **cinco vidas e três pontos de saúde por vida**. Após reaparecer, fica protegido de inimigos por um segundo.
- Derrote as ondas para liberar os chefes. A derrota permite tentar novamente a fase atual; jogar novamente após a vitória começa na fase 1.
- Abates e bônus por tempo geram pontos. O recorde fica no `localStorage`; a pausa congela o relógio da fase.

| Fase | Cenário | Chefes |
| --- | --- | --- |
| 1 | Telhados de Gotham | Coringa → Espantalho |
| 2 | Salão Iceberg | Arlequina |
| 3 | Asilo Arkham | Duas-Caras |

Os Pinguins das fases 2 e 3 lançam explosivos com perseguição limitada. Cada dano recebido sorteia uma das sete reações de áudio. Skins, dois jogadores e o botão de próxima fase ainda não estão disponíveis; seus atalhos ficam ocultos nas telas.

## Pastas e MVC

```text
src/
├── main.js                  # Carrega recursos e inicia GameController
├── models/                  # Estado e regras da partida
│   ├── entities/            # Batman, vilões, plataformas e projéteis
│   ├── services/            # Física, combate, ondas, chefes, fases e pontos
│   ├── world/               # Dados dos mapas e estado da câmera
│   └── results/             # Dados de vitória e derrota
├── views/                   # Apresentação
│   ├── renderers/           # Desenho das entidades e efeitos
│   ├── sprites/             # Quadros, transparência, cache e arte
│   ├── world/               # Cenários, iluminação e paralaxe
│   ├── screens/             # Menu, resultados, pausa e transição
│   ├── scenes/              # Gotham e Bat-Sinal das telas
│   ├── ui/                  # HTML e formatação
│   ├── audio/               # Música, efeitos e vozes
│   └── styles/              # CSS
├── controllers/             # Entradas e coordenação
│   ├── input/               # Teclado, mouse, controle e ações do Batman
│   ├── screens/             # Ações do menu e dos resultados
│   └── ui/                  # Navegação e comandos de áudio
├── config/                  # Configuração compartilhada
└── assets/sprites/          # Imagens PNG
public/assets/               # Logo e arquivos de áudio
tests/                       # Testes e páginas de inspeção
scripts/                     # Verificação de sintaxe e limpeza
```

`GameController` lê as entradas, coordena os serviços de `GameModel` em passos de 60 Hz e solicita o desenho a `GameView`. `SceneController` e `ScreenController` gerenciam navegação e telas; `HUD` apresenta os dados da partida.

O Model não depende de DOM, Canvas ou Controllers. A View consulta os modelos sem avançar as regras; o Controller conecta as camadas. A herança `Entity → Character/Projectile → especializações` mantém os comportamentos comuns. `AnimationState` escolhe os quadros; `SpriteRenderer` os desenha.

## Onde alterar

As regras ficam em [src/config/configuracao.js](src/config/configuracao.js): `GAME` define vidas e resolução; `PROJECTILE`, armas e recarga; `LEVELS`, fases e metas; `KEYS`, controles; `LOBBY`, telas e pontuação; `ANIMACAO` e `APARENCIA`, apresentação; `AUDIO_CONFIG`, áudio.

Para criar um ator, adicione sua classe em `models/entities/` e seu desenho em `views/renderers/` ou `views/sprites/`. Registre o desenho em `EntityRenderer`; subclasses de `Character` compartilham o renderizador de sprites. Regras de combate ficam em `CombatSystem`, sem código de desenho.

Os seis personagens usam os PNGs fornecidos e animações de parado, movimento, salto, ataque, dano e morte em Canvas. Os arquivos `public/assets/audio/penguin_hurt_01.mp3` a `penguin_hurt_07.mp3` são as gravações fornecidas, preservadas sem cortes. `AUDIO_CONFIG.VOZES` define caminhos e volumes; `GRUPOS_VOZES` define o sorteio. Os eventos de dano passam do Model pelo Controller ao áudio, respeitando mudo e volume. O navegador libera o som após uma interação; trilhas opcionais ausentes usam o sintetizador.

## Verificar e compilar

```bash
npm run check        # Sintaxe, testes e compilação
npm run build        # Gera dist/
npm run preview      # Serve a versão compilada
```

`npm test` executa apenas os testes; `npm run lint` verifica a sintaxe JavaScript; `npm run clean` remove `dist/`. A suíte cobre jogabilidade, MVC, desenhos, controles, áudio e progressão das fases.

Com o servidor ativo, use `/tests/browser.html` para mapas, combate, controles e áudio; `/tests/screens.html` para telas e sprites; `/tests/end-screens.html` para resultados. Essas ferramentas não entram na compilação de produção.

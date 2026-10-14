# 🦇 Guia Didático de Programação Orientada a Objetos (POO)
## Batman: Gotham Nights — Arquitetura de Software em JavaScript Moderno

Este documento detalha como todos os conceitos fundamentais de **Programação Orientada a Objetos (POO)** e **Padrões de Projeto (Design Patterns)** foram aplicados na construção deste jogo de plataforma 2D estilo *Cuphead* e *Boss-Rush*.

---

## 🏛️ Os 4 Pilares da POO no Jogo

### 1. Abstração (Abstraction)
A abstração consiste em modelar entidades do mundo real em classes no código, capturando apenas as características essenciais para o domínio do problema e ocultando detalhes desnecessários.
- **`Entity`**: Abstrai qualquer corpo físico que ocupa um espaço retangular no plano bidimensional cartesiano ($x, y, w, h$).
- **`Character`**: Abstrai seres com vida biológica, estados vitais e vulnerabilidade a dano ($hp, maxHp, hurtFlash, invulnerable$).
- **`Projectile`**: Abstrai elementos balísticos com tempo de vida útil e propriedade de dano.
- **`Background`**: Abstrai o cenário atmosférico em camadas de paralaxe.

### 2. Encapsulamento (Encapsulation)
O encapsulamento protege o estado interno dos objetos, garantindo que suas propriedades só sejam manipuladas através de métodos e getters intencionais, mantendo a integridade das regras de negócio.
- **Getters Computados**:
  - `Entity.bounds`: O exterior não calcula extremidades manuais; consulta a propriedade calculada `{ left, right, top, bottom }`.
  - `Character.hpRatio`: Fornece a razão normalizada de vida para renderização em barras de status no HUD sem expor matemática arbitrária.
  - `Spawner.thresholdReached`: Encapsula a regra de quando a horda de capangas foi eliminada para despertar o chefe.
  - `Input.anyKeyPressed`: Esconde a manipulação interna dos conjuntos (`Set`) do DOM.
- **Métodos de Mutação Segura**:
  - `Character.takeDamage(amount)`: Em vez de alterar `this.hp -= 10` diretamente de fora, o método valida se o alvo está vivo ou invulnerável antes de aplicar o dano.
  - `Batman.loseLife()` e `Batman.respawn()`: Gerenciam a transição segura entre contadores de vida e reposicionamento.

### 3. Herança (Inheritance)
A herança permite reaproveitar código e estabelecer relações de tipo do tipo **"é-um" (is-a)** em múltiplos níveis:
```
Entity (Geometria 2D & Colisão AABB)
 ├── Platform (Superfície Estática)
 ├── Projectile (Munições & Disparos Balísticos)
 │    ├── Batarang (Arma do Batman)
 │    ├── JokerTeeth (Dentadura saltitante do Coringa)
 │    ├── FearSmoke (Nuvem de gás do Espantalho)
 │    ├── GasBomb (Bomba arremessada)
 │    ├── UmbrellaBurst (Raio do Pinguim)
 │    └── Bullet / Coin (Balas e moedas)
 └── Character (Atores Vivos com Vida & Animações)
      ├── Batman (O Herói / Jogador)
      ├── Joker (Inimigo comum Estágio 1)
      ├── Penguin (Inimigo comum Estágio 2 e 3)
      ├── Scarecrow (Chefe Estágio 1 - Gás do Medo)
      ├── HarleyQuinn (Chefe Estágio 2 - Acrobata)
      └── TwoFace (Chefe Estágio 3 - Dupla Face)
```

### 4. Polimorfismo (Polymorphism)
O polimorfismo permite que objetos de diferentes classes derivadas respondam à mesma chamada de método com comportamentos completamente customizados:
- **`draw(ctx)`**: Chamado uniformemente no loop de renderização para qualquer entidade; no entanto, cada classe pinta sua própria arte vetorial procedural (Batman desenha capa e capuz, Coringa desenha terno roxo e sorriso, Batarang desenha morcego dourado rotacionando).
- **`update(dt, world)`**: A superclasse `Entity` atualiza apenas a translação $x, y$. `Character` adiciona contadores de caminhada e flash. `Batman` gerencia recarga de batarang. `Projectile` gerencia decaimento de tempo e rotação angular.
- **`takeDamage(amount)`**: Em inimigos comuns, registra dano sem invulnerabilidade; em chefes, adiciona frames de imunidade; no Batman, gerencia perda de vidas e reposicionamento no cenário.
- **`updateAI(player, projectilesOut)`**: Cada vilão implementa sua própria inteligência artificial (perseguição, voo flutuante senoidal, disparos em arco).

---

## 📂 Estrutura de Pastas e Mapeamento de Classes

### 1. `src/core/` — O Núcleo do Motor (Core Engine)
- **`GameState.js`**: Padrão *State Pattern* / *Enum*. Centraliza os estados da aplicação (`MENU`, `PLAYING`, `LEVEL_TRANSITION`, `GAME_OVER`, `VICTORY`).
- **`Game.js`**: Padrão *Façade (Fachada)*. Orquestrador central que compõe todos os subsistemas e executa o *Game Loop* com passo de tempo fixo (*Fixed Timestep*).
- **`Input.js`**: Camada de abstração de hardware que traduz eventos de teclado do navegador em ações semânticas (`JUMP`, `SHOOT`).
- **`Mouse.js`**: Camada de abstração de coordenadas de tela e toques/cliques com suporte tátil (*Touch/Pointer*).
- **`Camera.js`**: Sistema de viewport 2D com interpolação suave (*Lerp*) e oscilação de impacto (*Screen Shake*).

### 2. `src/entities/` — Hierarquia de Atores do Jogo
- **`Entity.js`**: Superclasse base que provê coordenadas, velocidade e colisão delimitadora retangular (*AABB*).
- **`Character.js`**: Subclasse base para qualquer personagem com vida, imunidade e ciclo de passos.
- **`Batman.js`**: Especialização do jogador com controles de salto, arremesso direcional de Batarang e debuff de medo.
- **`Platform.js`**: Superfície sólida e semissólida (*one-way*) com temas visuais (telhados, dutos, mármore, grades).

### 3. `src/entities/projectiles/` — Projéteis e Balística
- **`Projectile.js`**: Superclasse abstrata de projéteis com tempo de vida e diferenciação de dono (`owner: 'batman' | 'villain'`).
- **`Batarang.js`**: Projétil de alta velocidade com rotação contínua e rastro dourado.
- **`JokerTeeth.js`**: Projétil do Coringa com simulação de gravidade parabólica e quiques no chão.
- **`FearSmoke.js` / `GasBomb.js`**: Toxinas do Espantalho com flutuação senoidal e explosão em área.
- **`UmbrellaBurst.js` / `Bullet.js` / `Coin.js`**: Projéteis temáticos do Pinguim, Harley Quinn e Duas-Caras.

### 4. `src/entities/villains/` — Galeria de Vilões de Gotham
- **`Joker.js`**: Capanga comum que persegue o Batman e atira dentaduras saltitantes.
- **`Penguin.js`**: Capanga mobster com rajadas de guarda-chuva.
- **`Scarecrow.js`**: Chefe do Estágio 1 com toxina do medo e aura que inverte controles.
- **`HarleyQuinn.js`**: Chefe do Estágio 2 com disparos triplos e piruetas acrobáticas.
- **`TwoFace.js`**: Chefe do Estágio 3 com ataques telegrafados por moeda de prata.

### 5. `src/systems/` — Subsistemas de Suporte (Princípio da Responsabilidade Única - SRP)
- **`Physics.js`**: Centraliza gravidade e pouso sobre plataformas de forma desacoplada dos personagens.
- **`CombatSystem.js`**: Padrão *Mediator*. Avalia colisões entre ataques e alvos, dispara partículas e sons.
- **`Spawner.js`**: Padrão *Factory / Wave Generator*. Cria ondas de capangas e rastreia a cota de 10 eliminações.
- **`BossManager.js`**: Padrão *Factory Method & Lifecycle*. Instancia e monitora a batalha do chefe da fase.
- **`LevelManager.js`**: Carregamento de estágios e cortinas de transição animadas.
- **`HUD.js`**: Classe estática de visualização (*View Layer*) que renderiza vidas, armadura e barra do chefe.

### 6. `src/world/` — Cenários e Ambientes
- **`Background.js`**: Classe base abstrata de fundos paralaxe.
- **`Level1Background.js`**: Telhados de Gotham com chuva, raios e Bat-Sinal com holofote volumétrico.
- **`Level2Background.js` / `Level3Background.js`**: Cenários temáticos do Cassino e Asilo Arkham.
- **`Level.js`**: Padrão *Composite & Builder*. Reúne o plano de fundo, plataformas e pontos de nascimento.

### 7. `src/audio/` — Sistema Modular de Som
- **`src/config/configuracao.js`**: Configurações de volume, tempos (BPM) e frequências sonoras. `AudioConfig.js` preserva o caminho antigo por reexportação.
- **`SoundEffects.js`**: Fábrica procedural de síntese sonora para cada golpe, risada e impacto.
- **`MusicComposer.js`**: Compositor orquestral sintetizado em tempo real via Web Audio API.
- **`AudioManager.js`**: Padrão *Façade*. Gerencia canais de mixagem (Master, BGM, SFX) e o sequenciador de compassos.

---

## 🎯 Padrões de Projeto (Design Patterns) Demonstrados no Código

1. **Façade (Fachada)**:
   Implementado em `Game.js` e `AudioManager.js`. Esconde a complexidade de múltiplos subsistemas atrás de métodos simples (`game.start()`, `audioManager.playSfx('kill')`).

2. **State Pattern (Máquina de Estados)**:
   Implementado em `GameState.js` e operado no `Game.js`. Garante transições determinísticas entre Menus, Combate, Transição e Game Over.

3. **Factory Method (Método Fábrica)**:
   Implementado em `BossManager.spawnBoss()` e `Spawner.spawnWave()`. Instancia subclasses dinamicamente baseando-se na configuração do nível.

4. **Composite (Composição)**:
   Implementado em `Level.js` e `Game.js`. Objetos complexos são construídos a partir da agregação de partes menores e reutilizáveis.

5. **Mediator (Mediador)**:
   Implementado em `CombatSystem.js`. Desacopla atacantes de defensores, resolvendo impactos e disparando efeitos colaterais de forma isolada.

6. **Static Utility Class (Classe Utilitária Estática)**:
   Implementado em `HUD.js`. Fornece renderização pura sem necessidade de instanciar estado interno desnecessário.

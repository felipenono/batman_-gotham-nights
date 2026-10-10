# Batman: Gotham Nights — Plataforma 2D estilo Cuphead

Um jogo retrô de plataforma run-and-gun (correr e atirar) e boss-rush construído com pura **renderização procedural em HTML5 Canvas 2D** (sem assets de imagens sprite externas) e estrita **Programação Orientada a Objetos (POO)**.

---

## 📑 Índice

- [🎮 Visão Geral do Jogo](#-visão-geral-do-jogo)
- [🦇 Fases e Chefes](#-fases-e-chefes)
  - [1. Nível 1 — Telhados de Gotham](#1-nível-1--telhados-de-gotham)
  - [2. Nível 2 — Iceberg Lounge](#2-nível-2--iceberg-lounge)
  - [3. Nível 3 — Asilo Arkham](#3-nível-3--asilo-arkham)
- [🕹️ Controles](#️-controles)
- [🏗️ Arquitetura e Hierarquia de Classes POO](#️-arquitetura-e-hierarquia-de-classes-poo)
- [🎨 Sistemas Visuais e de Áudio Procedurais](#-sistemas-visuais-e-de-áudio-procedurais)
- [🚀 Como Executar](#-como-executar)
- [📄 Licença](#-licença)

---

## 🎮 Visão Geral do Jogo

| Característica | Descrição |
|---|---|
| **Gênero** | Plataforma Run-and-Gun / Boss Rush (estilo Cuphead) |
| **Jogador** | Batman (traje blindado estilo Arkham, olhos brancos brilhantes, capa animada dinâmica, barbatanas nas manoplas, cinto de utilidades amarelo) |
| **Vidas** | 5 Bat-Vidas por jogada (3 HP por vida) |
| **Combate** | Mire e lance Batarangues em alta velocidade com o mouse ou teclado, avance rapidamente pelos perigos, desvie de projéteis inimigos |
| **Progressão** | 3 fases sequenciais apresentando ondas de inimigos seguidas por confrontos intensos contra chefes |

---

## 🦇 Fases e Chefes

### 1. Nível 1 — Telhados de Gotham

> **Atmosfera:** Céu noturno escuro e chuvoso, clarões dinâmicos de tempestade, silhuetas distantes de arranha-céus de Gotham e o brilhante Bat-Sinal projetado nas nuvens.

| Elemento | Detalhes |
|---|---|
| **Inimigo Comum** | **Coringa** — lança dentaduras de corda tagarelas em arco (necessário abater 15) |
| **Chefe** | **Espantalho** — 100 HP |
| **Ataques do Chefe** | Toxinas **FearSmoke** (Fumaça do Medo) à deriva; **GasBombs** (Bombas de Gás) explosivas em arco |
| **Especial** | **Aura de Medo** a cada 20 segundos, invertendo temporariamente os controles do Batman por 3 segundos |

### 2. Nível 2 — Iceberg Lounge

> **Atmosfera:** Interior opulento de cassino art-déco, cortinas de veludo, lustres de cristal, letreiros de neon e reflexos no chão de mármore.

| Elemento | Detalhes |
|---|---|
| **Inimigo Comum** | **Capangas do Pinguim** — mafiosos cambaleantes que atiram raios de energia roxa de guarda-chuvas (necessário abater 15) |
| **Chefe** | **Arlequina** — 120 HP |
| **Ataques do Chefe** | **Balas** de pistola em tiro rápido; **Lançamentos de Marreta** bumerangue; **Investidas de Estrela** (Cartwheel) em alta velocidade |
| **Especial** | Dispara uma barragem de balas com propagação tripla quando o HP está abaixo de 50% |

### 3. Nível 3 — Asilo Arkham

> **Atmosfera:** Paredes góticas de prisão de pedra, grades pesadas de celas de ferro com olhos brilhantes de detentos, tubos fluorescentes piscando, gárgulas empoleiradas e uma névoa verde tóxica rastejante.

| Elemento | Detalhes |
|---|---|
| **Inimigo Comum** | **Pinguins** — variantes de elite (necessário abater 10) |
| **Chefe** | **Duas-Caras** — 150 HP |
| **Ataques do Chefe** | **Balas** de pistola pesada; **Moedas Marcadas** saltitantes; tiros em formato de V |
| **Especial** | Joga um dólar de prata para o alto antes de atacar — **Cara** aciona balas rápidas, **Coroa** aciona moedas saltitantes |

---

## 🕹️ Controles

| Ação | Tecla Primária | Secundária / Mouse |
|---|---|---|
| **Mover Esquerda / Direita** | `A` / `D` | `←` / `→` |
| **Pular** | `W` / `Espaço` | `↑` |
| **Batarangue** | `Clique Esquerdo` (Mirar / Segurar para Tiro Rápido) | `X` / `Z` |
| **Iniciar / Reiniciar** | `Espaço` / `Enter` | `Enter` / `Clique` |
| **Mutar / Desmutar** | `M` | Ícone na HUD |

---



  # Como baixar e executar Batman: Gotham Nights

## Requisitos

- Git instalado
- Node.js instalado
- npm (incluído na instalação do Node.js)

## Baixar o jogo

Abra o terminal ou o PowerShell na pasta onde deseja guardar o projeto e execute:

```bash
git clone https://github.com/felipenono/batman_-gotham-nights.git
cd batman_-gotham-nights
```

O comando `git clone` baixa os arquivos do repositório e cria a pasta
`batman_-gotham-nights`.

## Instalar dependências e iniciar

Dentro da pasta do projeto, execute:

```bash
npm install
npm run dev
```

Abra no navegador o endereço que o Vite mostrar no terminal
(normalmente `http://localhost:3000`).

## Atualizar uma cópia já baixada

Para obter as alterações mais recentes, primeiro entre na pasta do projeto e
depois execute:

```bash
git pull
npm install
```

Em seguida, inicie novamente o jogo com:

```bash
npm run dev
```


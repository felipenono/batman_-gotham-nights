# Batman: Gotham Nights — Cuphead-style 2D Platformer

A retro run-and-gun platformer and boss-rush game built with pure **HTML5 Canvas 2D procedural rendering** (no external sprite image assets) and strict **Object-Oriented Programming (OOP)**.

---

## 🎮 Game Overview

- **Genre**: Run-and-Gun Platformer / Boss Rush (Cuphead style)
- **Player**: Batman (Arkham-style armored suit, glowing white eyes, dynamic animated cape, gauntlet fins, yellow utility belt)
- **Lives**: 5 Bat-Lives per playthrough (3 HP per life)
- **Combat**: Aim and throw high-speed Batarangs with mouse or keyboard, dash past hazards, dodge enemy projectiles
- **Progression**: 3 sequential stages featuring enemy waves followed by intense boss showdowns

---

## 🦇 Stages & Bosses

### 1. Level 1 — Gotham Rooftops
- **Atmosphere**: Dark rainy night sky, dynamic thunderstorm flashes, distant Gotham skyscraper silhouettes, and the glowing Bat-Signal projected onto the clouds.
- **Common Enemy**: **Joker** (throws arcing chattering wind-up dentures, 15 kills required).
- **Boss**: **Scarecrow** (100 HP)
  - Attacks: Drifting **FearSmoke** toxins, arcing explosive **GasBombs**.
  - Special: **Fear Aura** every 20 seconds, temporarily reversing Batman's controls for 3 seconds.

### 2. Level 2 — Iceberg Lounge
- **Atmosphere**: Opulent art-deco casino interior, velvet drapery, crystal chandeliers, neon signs, and marble floor reflections.
- **Common Enemy**: **Penguin Grunts** (waddling mobsters firing purple energy beams from umbrellas, 15 kills required).
- **Boss**: **Harley Quinn** (120 HP)
  - Attacks: Rapid-fire handgun **Bullets**, boomerang **Mallet tosses**, and high-speed **Cartwheel dashes**.
  - Special: Fires a triple-spread bullet barrage when below 50% HP.

### 3. Level 3 — Arkham Asylum
- **Atmosphere**: Gothic stone prison walls, heavy iron cell bars with glowing inmate eyes, flickering fluorescent tubes, perched gargoyles, and creeping toxic green fog.
- **Common Enemy**: **Penguins** (elite variants, 10 kills required).
- **Boss**: **Two-Face** (150 HP)
  - Attacks: Heavy pistol **Bullets**, bouncing **Scarred Coins**, and V-spread gunfire.
  - Special: Flips a silver dollar overhead before attacking — Heads triggers rapid bullets, Tails triggers bouncing coins.

---

## 🕹️ Controls

| Action | Primary Key | Secondary / Mouse |
|---|---|---|
| **Move Left / Right** | `A` / `D` | `←` / `→` |
| **Jump** | `W` / `Space` | `↑` |
| **Batarang** | `Left Click` (Aim / Hold Rapid Fire) | `X` / `Z` |
| **Start / Restart** | `Space` / `Enter` | `Enter` / `Click` |
| **Mute / Unmute** | `M` | HUD Icon |

---

## 🏗️ Architecture & OOP Class Hierarchy

```
Entity (base class: x, y, w, h, vx, vy, bounds, intersects, update, draw)
├── Character (abstract: hp, maxHp, facing, hurtFlash, invulnerable)
│   ├── Batman (player: lives, fearTimer, batarang cooldown, cape physics)
│   └── Villains
│       ├── Joker (common enemy L1: laugh, teeth chatter)
│       ├── Scarecrow (boss L1: fear drone, toxic hiss, gas bomb)
│       ├── Penguin (grunt L2 / L3: umbrella laser blast)
│       ├── HarleyQuinn (boss L2: gunshots, mallet throws)
│       └── TwoFace (boss L3: coin ping, dual gunfire)
│
├── Platform (static collision surfaces with themed procedural textures)
│
└── Projectile (abstract: vx, vy, damage, lifetime, owner, spin)
    ├── Batarang (Batman player projectile)
    ├── JokerTeeth (arced chattering dentures)
    ├── FearSmoke (drifting toxic cloud)
    ├── GasBomb (burlap explosive canister)
    ├── UmbrellaBurst (purple energy beam)
    ├── PenguinBomb (mechanical ticking minion)
    ├── Bullet (Harley Quinn & Two-Face firearm shot)
    └── Coin (Two-Face bouncing scarred silver dollar)
```

---

## 🎨 Procedural Visual & Audio Systems

- **Procedural Canvas Rendering**: 100% vector paths, linear/radial gradients, and arcs matching reference sprites without any external PNG/JPG downloads.
- **Gotham Orchestral Soundtrack (Web Audio API)**:
  - **Batman Theme**: Driving D Minor gothic ostinato, pulsating bassline, orchestral timpani, cathedral bells, and iconic brass fanfare motif inspired by Danny Elfman / The Dark Knight.
  - **Dynamic State Shifts**: Brooding ambient menu theme, intense accelerated boss combat battle theme, tragic minor funeral drone on Game Over, and victorious D major brass fanfare.
- **Rogue Gallery Enemy Sound Effects**:
  - **Joker**: Maniacal high-pitched laughter arpeggio and rapid mechanical teeth chatter clicks.
  - **Scarecrow**: Filtered toxic gas hiss, resonant psycho-acoustic fear aura drone, and bomb blast rumble.
  - **Penguin**: Resonant umbrella electric beam zap and waddle cadence.
  - **Harley Quinn**: Handgun gunfire and mallet swings.
  - **Two-Face**: High-pitched metallic coin ping chime (2.5 kHz) and heavy pistol gunshots.

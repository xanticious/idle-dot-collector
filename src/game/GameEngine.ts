import { Application, Assets, Graphics, Sprite, Texture, Rectangle, Container } from 'pixi.js';
import type { GameConfig, OrbData, HeroData } from './types';
import {
  HERO_SPRITE_SHEET,
  HERO_SPRITE_FRAMES,
  HERO_DISPLAY_HEIGHT,
  type AnimationKey,
} from './heroSpriteDefinitions';
import { ORB_TYPES, BASE_ORB_RADIUS, ORB_RADIUS_STEP } from './orbDefinitions';
import { CREATURE_TYPES } from './creatureDefinitions';

const ORB_SPAWN_INTERVAL = 60;
const MAX_ORBS = 50;
// Prevent log(0) in exponential distribution sampling
const MAX_RANDOM_VALUE = 0.9999;
const ATTACK_RANGE = 35; // px — hero must be within this distance to attack
const ATTACK_COOLDOWN = 60; // frames between each hero's attacks
const HP_BAR_HERO_WIDTH = 40;
const HP_BAR_CREATURE_WIDTH = 60;

const HP_BAR_HEIGHT = 6;

interface InternalOrb {
  data: OrbData;
  graphics: Graphics;
  claimed: boolean;
  radius: number;
}

interface InternalHero {
  data: HeroData;
  sprite: Sprite;
  targetOrbId: number | null;
  speed: number;
  direction: AnimationKey;
  currentHp: number;
  maxHp: number;
  attackCooldown: number;
  dead: boolean;
  healthBarBg: Graphics;
  healthBar: Graphics;
}

interface InternalCreature {
  creatureIdx: number;
  x: number;
  y: number;
  currentHp: number;
  maxHp: number;
  graphics: Graphics;
  healthBarBg: Graphics;
  healthBar: Graphics;
}

export class GameEngine {
  private heroTextures: Map<AnimationKey, Texture> = new Map();
  private app: Application | null = null;
  private container: HTMLElement;
  private onCollect: (amount: number) => void;
  private onQuestComplete: (reward: number) => void;
  private onQuestFail: () => void;
  private orbs: InternalOrb[] = [];
  private heroes: InternalHero[] = [];
  private creature: InternalCreature | null = null;
  private config: GameConfig = {
    heroCount: 1,
    heroSpeed: 1,
    unlockedOrbLevel: 0,
    betterOrbsParam: 1,
    heroMaxHp: 10,
    activeQuestCreatureIdx: null,
  };
  private frameCount = 0;
  private nextOrbId = 0;
  private heroContainer: Container | null = null;
  private orbContainer: Container | null = null;
  private creatureContainer: Container | null = null;
  private uiContainer: Container | null = null;
  private destroyed = false;

  constructor(
    container: HTMLElement,
    onCollect: (amount: number) => void,
    onQuestComplete: (reward: number) => void,
    onQuestFail: () => void,
  ) {
    this.container = container;
    this.onCollect = onCollect;
    this.onQuestComplete = onQuestComplete;
    this.onQuestFail = onQuestFail;
  }

  async init(config: GameConfig): Promise<void> {
    this.config = config;

    const app = new Application();
    await app.init({
      resizeTo: this.container,
      backgroundColor: 0x0d0d1a,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    if (this.destroyed) {
      app.destroy(true, { children: true });
      return;
    }

    // Load sprite sheet and build per-animation textures
    const sheetTexture: Texture = await Assets.load(HERO_SPRITE_SHEET);
    for (const [key, frame] of Object.entries(HERO_SPRITE_FRAMES) as [
      Exclude<AnimationKey, 'walk_w'>,
      (typeof HERO_SPRITE_FRAMES)[keyof typeof HERO_SPRITE_FRAMES],
    ][]) {
      const texture = new Texture({
        source: sheetTexture.source,
        frame: new Rectangle(frame.x, frame.y, frame.width, frame.height),
      });
      this.heroTextures.set(key, texture);
    }
    // walk_w reuses the walk_e texture; the sprite is flipped via scale.x
    this.heroTextures.set('walk_w', this.heroTextures.get('walk_e')!);

    this.app = app;
    this.container.appendChild(this.app.canvas);

    this.orbContainer = new Container();
    this.creatureContainer = new Container();
    this.heroContainer = new Container();
    this.uiContainer = new Container();
    this.app.stage.addChild(this.orbContainer);
    this.app.stage.addChild(this.creatureContainer);
    this.app.stage.addChild(this.heroContainer);
    this.app.stage.addChild(this.uiContainer);

    this.syncHeroCount();

    for (let i = 0; i < 10; i++) {
      this.spawnOrb();
    }

    this.app.ticker.add(this.update.bind(this));
  }

  updateConfig(config: GameConfig): void {
    const prevHeroCount = this.config.heroCount;
    const prevQuestIdx = this.config.activeQuestCreatureIdx;
    this.config = config;

    if (config.heroCount !== prevHeroCount) {
      this.syncHeroCount();
    }

    for (const hero of this.heroes) {
      hero.speed = config.heroSpeed;
      hero.maxHp = config.heroMaxHp;
      hero.currentHp = Math.min(hero.currentHp, hero.maxHp);
    }

    // Handle quest state changes
    if (config.activeQuestCreatureIdx !== prevQuestIdx) {
      if (config.activeQuestCreatureIdx !== null && this.creature === null) {
        this.spawnCreature(config.activeQuestCreatureIdx);
      } else if (config.activeQuestCreatureIdx === null && this.creature !== null) {
        this.removeCreature();
      }
    }
  }

  private syncHeroCount(): void {
    if (!this.heroContainer || !this.app) return;

    while (this.heroes.length < this.config.heroCount) {
      this.addHero();
    }

    while (this.heroes.length > this.config.heroCount) {
      const hero = this.heroes.pop()!;
      this.removeHeroGraphics(hero);
    }
  }

  private removeHeroGraphics(hero: InternalHero): void {
    if (!this.heroContainer || !this.uiContainer) return;
    this.heroContainer.removeChild(hero.sprite);
    hero.sprite.destroy();
    this.uiContainer.removeChild(hero.healthBarBg);
    hero.healthBarBg.destroy();
    this.uiContainer.removeChild(hero.healthBar);
    hero.healthBar.destroy();
  }

  private addHero(): void {
    if (!this.heroContainer || !this.uiContainer || !this.app) return;

    const id = this.heroes.length;
    const x = 100 + Math.random() * (this.app.screen.width - 200);
    const y = 100 + Math.random() * (this.app.screen.height - 200);

    const idleTexture = this.heroTextures.get('idle')!;
    const scale = HERO_DISPLAY_HEIGHT / idleTexture.height;

    const sprite = new Sprite(idleTexture);
    sprite.anchor.set(0.5, 0.5);
    sprite.scale.set(scale);
    sprite.x = x;
    sprite.y = y;
    this.heroContainer.addChild(sprite);

    const healthBarBg = new Graphics();
    const healthBar = new Graphics();
    healthBarBg.visible = false;
    healthBar.visible = false;
    this.uiContainer.addChild(healthBarBg);
    this.uiContainer.addChild(healthBar);

    this.heroes.push({
      data: { id, x, y, color: 0xffffff },
      sprite,
      targetOrbId: null,
      speed: this.config.heroSpeed,
      direction: 'idle',
      currentHp: this.config.heroMaxHp,
      maxHp: this.config.heroMaxHp,
      attackCooldown: 0,
      dead: false,
      healthBarBg,
      healthBar,
    });
  }

  private spawnOrb(): void {
    if (!this.orbContainer || !this.app || this.orbs.length >= MAX_ORBS) return;

    const unlockedOrbCount = Math.min(this.config.unlockedOrbLevel + 1, ORB_TYPES.length);

    // Exponential distribution: betterOrbsParam > 1 shifts probability toward
    // higher-index (higher-value) orbs.
    // orbIdx = floor(Exp(1) * betterOrbsParam), clamped to [0, unlockedOrbCount - 1]
    const param = this.config.betterOrbsParam;
    const u = Math.random();
    const expVal = -Math.log(1 - Math.min(u, MAX_RANDOM_VALUE)) * param;
    const orbTypeIdx = Math.min(Math.floor(expVal), unlockedOrbCount - 1);
    const orbDef = ORB_TYPES[orbTypeIdx];

    const id = this.nextOrbId++;
    const x = 20 + Math.random() * (this.app.screen.width - 40);
    const y = 20 + Math.random() * (this.app.screen.height - 40);
    const radius = BASE_ORB_RADIUS + orbTypeIdx * ORB_RADIUS_STEP;

    const g = new Graphics();
    g.circle(0, 0, radius + 4);
    g.fill({ color: orbDef.glowColor, alpha: 0.35 });
    g.circle(0, 0, radius);
    g.fill(orbDef.color);
    g.x = x;
    g.y = y;
    this.orbContainer.addChild(g);

    this.orbs.push({
      data: { id, x, y, orbTypeIndex: orbTypeIdx, value: orbDef.value },
      graphics: g,
      claimed: false,
      radius,
    });
  }

  private spawnCreature(creatureIdx: number): void {
    if (!this.creatureContainer || !this.uiContainer || !this.app) return;

    const creatureDef = CREATURE_TYPES[creatureIdx];
    if (!creatureDef) return;

    const x = this.app.screen.width / 2;
    const y = this.app.screen.height / 2;

    const g = new Graphics();
    g.rect(-25, -35, 50, 70);
    g.fill(creatureDef.color);
    g.rect(-25, -35, 50, 70);
    g.stroke({ color: 0xffffff, alpha: 0.4, width: 2 });
    g.x = x;
    g.y = y;
    this.creatureContainer.addChild(g);

    const healthBarBg = new Graphics();
    const healthBar = new Graphics();
    this.uiContainer.addChild(healthBarBg);
    this.uiContainer.addChild(healthBar);

    this.creature = {
      creatureIdx,
      x,
      y,
      currentHp: creatureDef.hp,
      maxHp: creatureDef.hp,
      graphics: g,
      healthBarBg,
      healthBar,
    };

    // Reset heroes for quest
    for (const hero of this.heroes) {
      hero.targetOrbId = null;
      hero.attackCooldown = 0;
      hero.dead = false;
      hero.sprite.visible = true;
      hero.currentHp = hero.maxHp;
    }

    // Unclaim all orbs so heroes don't have stale targets
    for (const orb of this.orbs) {
      orb.claimed = false;
    }
  }

  private removeCreature(): void {
    if (!this.creature || !this.creatureContainer || !this.uiContainer) return;
    this.creatureContainer.removeChild(this.creature.graphics);
    this.creature.graphics.destroy();
    this.uiContainer.removeChild(this.creature.healthBarBg);
    this.creature.healthBarBg.destroy();
    this.uiContainer.removeChild(this.creature.healthBar);
    this.creature.healthBar.destroy();
    this.creature = null;

    // Restore heroes after quest ends
    for (const hero of this.heroes) {
      hero.dead = false;
      hero.sprite.visible = true;
      hero.currentHp = hero.maxHp;
      hero.targetOrbId = null;
      hero.healthBar.visible = false;
      hero.healthBarBg.visible = false;
      this.setHeroDirection(hero, 'idle');
    }
  }

  private drawHealthBar(
    barBg: Graphics,
    bar: Graphics,
    cx: number,
    topY: number,
    width: number,
    hp: number,
    maxHp: number,
  ): void {
    const ratio = Math.max(0, hp / maxHp);
    const fillColor = ratio > 0.6 ? 0x44ff44 : ratio > 0.3 ? 0xffcc00 : 0xff4444;

    barBg.clear();
    barBg.rect(cx - width / 2, topY, width, HP_BAR_HEIGHT);
    barBg.fill({ color: 0x333355, alpha: 0.85 });

    bar.clear();
    bar.rect(cx - width / 2, topY, width * ratio, HP_BAR_HEIGHT);
    bar.fill(fillColor);
  }

  private update(): void {
    if (this.destroyed || !this.app) return;
    this.frameCount++;

    if (this.frameCount % ORB_SPAWN_INTERVAL === 0) {
      this.spawnOrb();
    }

    const questActive = this.creature !== null;

    for (const hero of this.heroes) {
      if (hero.dead) continue;
      if (questActive) {
        this.updateHeroQuest(hero);
      } else {
        this.updateHero(hero);
      }
    }

    if (questActive && this.creature) {
      this.drawHealthBar(
        this.creature.healthBarBg,
        this.creature.healthBar,
        this.creature.x,
        this.creature.y - 50,
        HP_BAR_CREATURE_WIDTH,
        this.creature.currentHp,
        this.creature.maxHp,
      );
    }
  }

  private updateHero(hero: InternalHero): void {
    if (!this.app) return;

    if (hero.targetOrbId === null) {
      const target = this.findNearestUnclaimedOrb(hero);
      if (target) {
        hero.targetOrbId = target.data.id;
        target.claimed = true;
      }
    }

    if (hero.targetOrbId !== null) {
      const orb = this.orbs.find((o) => o.data.id === hero.targetOrbId);
      if (!orb) {
        hero.targetOrbId = null;
        this.setHeroDirection(hero, 'idle');
        return;
      }

      const dx = orb.data.x - hero.sprite.x;
      const dy = orb.data.y - hero.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = hero.speed * 2;

      if (dist < speed + orb.radius) {
        this.collectOrb(orb, hero);
      } else {
        this.moveHeroToward(hero, dx, dy, dist, speed);
      }
    } else {
      this.setHeroDirection(hero, 'idle');
    }

    hero.healthBar.visible = false;
    hero.healthBarBg.visible = false;
  }

  private updateHeroQuest(hero: InternalHero): void {
    if (!this.creature || !this.app) return;

    const dx = this.creature.x - hero.sprite.x;
    const dy = this.creature.y - hero.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = hero.speed * 2;

    if (hero.attackCooldown > 0) {
      hero.attackCooldown--;
    }

    if (dist <= ATTACK_RANGE) {
      this.setHeroDirection(hero, 'idle');

      if (hero.attackCooldown === 0) {
        hero.attackCooldown = ATTACK_COOLDOWN;

        const creatureDef = CREATURE_TYPES[this.creature.creatureIdx];

        // Hero takes damage from creature
        hero.currentHp -= creatureDef.damage;
        // Creature takes 1 damage from hero
        this.creature.currentHp -= 1;

        if (hero.currentHp <= 0) {
          hero.dead = true;
          hero.sprite.visible = false;
          hero.healthBar.visible = false;
          hero.healthBarBg.visible = false;
          this.checkQuestFail();
          return;
        }

        if (this.creature.currentHp <= 0) {
          const reward = creatureDef.reward;
          this.removeCreature();
          this.onQuestComplete(reward);
          return;
        }
      }
    } else {
      this.moveHeroToward(hero, dx, dy, dist, speed);
    }

    // Update hero health bar
    this.drawHealthBar(
      hero.healthBarBg,
      hero.healthBar,
      hero.sprite.x,
      hero.sprite.y - HERO_DISPLAY_HEIGHT / 2 - 12,
      HP_BAR_HERO_WIDTH,
      hero.currentHp,
      hero.maxHp,
    );
    hero.healthBar.visible = true;
    hero.healthBarBg.visible = true;
  }

  private checkQuestFail(): void {
    const allDead = this.heroes.every((h) => h.dead);
    if (allDead) {
      this.removeCreature();
      this.onQuestFail();
    }
  }

  private moveHeroToward(
    hero: InternalHero,
    dx: number,
    dy: number,
    dist: number,
    speed: number,
  ): void {
    let newDirection: AnimationKey;
    if (Math.abs(dx) >= Math.abs(dy)) {
      newDirection = dx > 0 ? 'walk_e' : 'walk_w';
    } else {
      newDirection = dy > 0 ? 'walk_s' : 'walk_n';
    }
    this.setHeroDirection(hero, newDirection);
    hero.sprite.x += (dx / dist) * speed;
    hero.sprite.y += (dy / dist) * speed;
  }

  private setHeroDirection(hero: InternalHero, direction: AnimationKey): void {
    if (hero.direction === direction) return;
    hero.direction = direction;

    const texture = this.heroTextures.get(direction)!;
    const scale = HERO_DISPLAY_HEIGHT / texture.height;
    hero.sprite.texture = texture;
    if (direction === 'walk_w') {
      hero.sprite.scale.set(-scale, scale);
    } else {
      hero.sprite.scale.set(scale, scale);
    }
  }

  private findNearestUnclaimedOrb(hero: InternalHero): InternalOrb | null {
    let nearest: InternalOrb | null = null;
    let nearestDist = Infinity;

    for (const orb of this.orbs) {
      if (orb.claimed) continue;
      const dx = orb.data.x - hero.sprite.x;
      const dy = orb.data.y - hero.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = orb;
      }
    }

    return nearest;
  }

  private collectOrb(orb: InternalOrb, hero: InternalHero): void {
    if (!this.orbContainer) return;

    this.orbContainer.removeChild(orb.graphics);
    orb.graphics.destroy();

    const idx = this.orbs.indexOf(orb);
    if (idx !== -1) this.orbs.splice(idx, 1);

    hero.targetOrbId = null;

    this.onCollect(orb.data.value);
  }

  destroy(): void {
    this.destroyed = true;
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
    this.orbs = [];
    this.heroes = [];
    this.creature = null;
  }
}

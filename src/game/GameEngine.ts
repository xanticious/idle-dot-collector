import { Application, Assets, Graphics, Sprite, Texture, Rectangle, Container } from 'pixi.js';
import type { GameConfig, DotData, HeroData } from './types';
import {
  HERO_SPRITE_SHEET,
  HERO_SPRITE_FRAMES,
  HERO_DISPLAY_HEIGHT,
  type AnimationKey,
} from './heroSpriteDefinitions';

const DOT_COLOR = 0xffff00;
const SPECIAL_DOT_COLOR = 0xffaa00;
const DOT_SPAWN_INTERVAL = 60;
const MAX_DOTS = 50;
const DOT_RADIUS = 6;
const SPECIAL_DOT_RADIUS = 10;

interface InternalDot {
  data: DotData;
  graphics: Graphics;
  claimed: boolean;
}

interface InternalHero {
  data: HeroData;
  sprite: Sprite;
  targetDotId: number | null;
  speed: number;
  direction: AnimationKey;
}

export class GameEngine {
  private heroTextures: Map<AnimationKey, Texture> = new Map();
  private app: Application | null = null;
  private container: HTMLElement;
  private onCollect: (amount: number) => void;
  private dots: InternalDot[] = [];
  private heroes: InternalHero[] = [];
  private config: GameConfig = {
    heroCount: 1,
    heroSpeed: 1,
    specialDotChance: 0.05,
  };
  private frameCount = 0;
  private nextDotId = 0;
  private heroContainer: Container | null = null;
  private dotContainer: Container | null = null;
  private destroyed = false;

  constructor(container: HTMLElement, onCollect: (amount: number) => void) {
    this.container = container;
    this.onCollect = onCollect;
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

    this.dotContainer = new Container();
    this.heroContainer = new Container();
    this.app.stage.addChild(this.dotContainer);
    this.app.stage.addChild(this.heroContainer);

    this.syncHeroCount();

    for (let i = 0; i < 10; i++) {
      this.spawnDot();
    }

    this.app.ticker.add(this.update.bind(this));
  }

  updateConfig(config: GameConfig): void {
    const prevHeroCount = this.config.heroCount;
    this.config = config;

    if (config.heroCount !== prevHeroCount) {
      this.syncHeroCount();
    }

    for (const hero of this.heroes) {
      hero.speed = config.heroSpeed;
    }
  }

  private syncHeroCount(): void {
    if (!this.heroContainer || !this.app) return;

    while (this.heroes.length < this.config.heroCount) {
      this.addHero();
    }

    while (this.heroes.length > this.config.heroCount) {
      const hero = this.heroes.pop()!;
      this.heroContainer.removeChild(hero.sprite);
      hero.sprite.destroy();
    }
  }

  private addHero(): void {
    if (!this.heroContainer || !this.app) return;

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

    this.heroes.push({
      data: { id, x, y, color: 0xffffff },
      sprite,
      targetDotId: null,
      speed: this.config.heroSpeed,
      direction: 'idle',
    });
  }

  private spawnDot(): void {
    if (!this.dotContainer || !this.app || this.dots.length >= MAX_DOTS) return;

    const isSpecial = Math.random() < this.config.specialDotChance;
    const id = this.nextDotId++;
    const x = 20 + Math.random() * (this.app.screen.width - 40);
    const y = 20 + Math.random() * (this.app.screen.height - 40);
    const radius = isSpecial ? SPECIAL_DOT_RADIUS : DOT_RADIUS;
    const value = isSpecial ? 10 : 1;

    const g = new Graphics();
    if (isSpecial) {
      g.circle(0, 0, radius + 4);
      g.fill({ color: SPECIAL_DOT_COLOR, alpha: 0.3 });
      g.circle(0, 0, radius);
      g.fill(SPECIAL_DOT_COLOR);
    } else {
      g.circle(0, 0, radius);
      g.fill(DOT_COLOR);
    }
    g.x = x;
    g.y = y;
    this.dotContainer.addChild(g);

    this.dots.push({
      data: { id, x, y, isSpecial, value },
      graphics: g,
      claimed: false,
    });
  }

  private update(): void {
    if (this.destroyed || !this.app) return;
    this.frameCount++;

    if (this.frameCount % DOT_SPAWN_INTERVAL === 0) {
      this.spawnDot();
    }

    for (const hero of this.heroes) {
      this.updateHero(hero);
    }
  }

  private updateHero(hero: InternalHero): void {
    if (!this.app) return;

    if (hero.targetDotId === null) {
      const target = this.findNearestUnclaimedDot(hero);
      if (target) {
        hero.targetDotId = target.data.id;
        target.claimed = true;
      }
    }

    if (hero.targetDotId !== null) {
      const dot = this.dots.find((d) => d.data.id === hero.targetDotId);
      if (!dot) {
        hero.targetDotId = null;
        this.setHeroDirection(hero, 'idle');
        return;
      }

      const dx = dot.data.x - hero.sprite.x;
      const dy = dot.data.y - hero.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = hero.speed * 2;

      if (
        dist <
        speed + (dot.data.isSpecial ? SPECIAL_DOT_RADIUS : DOT_RADIUS)
      ) {
        this.collectDot(dot, hero);
      } else {
        // Determine walking direction from dominant axis
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
    } else {
      this.setHeroDirection(hero, 'idle');
    }
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

  private findNearestUnclaimedDot(hero: InternalHero): InternalDot | null {
    let nearest: InternalDot | null = null;
    let nearestDist = Infinity;

    for (const dot of this.dots) {
      if (dot.claimed) continue;
      const dx = dot.data.x - hero.sprite.x;
      const dy = dot.data.y - hero.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = dot;
      }
    }

    return nearest;
  }

  private collectDot(dot: InternalDot, hero: InternalHero): void {
    if (!this.dotContainer) return;

    this.dotContainer.removeChild(dot.graphics);
    dot.graphics.destroy();

    const idx = this.dots.indexOf(dot);
    if (idx !== -1) this.dots.splice(idx, 1);

    hero.targetDotId = null;

    this.onCollect(dot.data.value);
  }

  destroy(): void {
    this.destroyed = true;
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
    this.dots = [];
    this.heroes = [];
  }
}

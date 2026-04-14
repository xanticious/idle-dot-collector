// Hero sprite definitions derived from design/sprite-definitions.json
// Sprite sheet: public/medieval-knight-sprite-sheet.png

export const HERO_SPRITE_SHEET = 'medieval-knight-sprite-sheet.png';

export type AnimationKey = 'idle' | 'walk_n' | 'walk_s' | 'walk_e' | 'walk_w';

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

// One frame per animation direction (more frames can be added later)
export const HERO_SPRITE_FRAMES: Record<
  Exclude<AnimationKey, 'walk_w'>,
  SpriteFrame
> = {
  idle: { x: 170, y: 20, width: 120, height: 190 },
  walk_n: { x: 157, y: 216, width: 156, height: 200 },
  walk_e: { x: 157, y: 420, width: 156, height: 200 },
  walk_s: { x: 170, y: 630, width: 140, height: 200 },
};

// Target display height in pixels — the sprite is scaled to this height
export const HERO_DISPLAY_HEIGHT = 64;

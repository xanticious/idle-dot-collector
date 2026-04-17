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

// Animation frames per direction — each array is cycled to produce smooth animation
export const HERO_SPRITE_FRAMES: Record<
  Exclude<AnimationKey, 'walk_w'>,
  SpriteFrame[]
> = {
  idle: [
    { x: 168, y: 20, width: 122, height: 190 },
    { x: 309, y: 20, width: 122, height: 190 },
    { x: 445, y: 20, width: 122, height: 190 },
    { x: 580, y: 20, width: 122, height: 190 },
    { x: 718, y: 20, width: 122, height: 190 },
    { x: 853, y: 20, width: 122, height: 190 },
    { x: 989, y: 20, width: 122, height: 190 },
    { x: 1126, y: 20, width: 122, height: 190 },
    { x: 1263, y: 20, width: 122, height: 190 },
  ],
  walk_n: [
    { x: 180, y: 216, width: 137, height: 200 },
    { x: 315, y: 216, width: 137, height: 200 },
    { x: 449, y: 216, width: 137, height: 200 },
    { x: 583, y: 216, width: 137, height: 200 },
    { x: 717, y: 216, width: 137, height: 200 },
    { x: 852, y: 216, width: 137, height: 200 },
    { x: 993, y: 216, width: 137, height: 200 },
    { x: 1135, y: 216, width: 137, height: 200 },
    { x: 1268, y: 216, width: 137, height: 200 },
  ],
  walk_e: [
    { x: 163, y: 420, width: 139, height: 200 },
    { x: 307, y: 420, width: 139, height: 200 },
    { x: 456, y: 420, width: 139, height: 200 },
    { x: 606, y: 420, width: 139, height: 200 },
    { x: 766, y: 420, width: 139, height: 200 },
    { x: 921, y: 420, width: 139, height: 200 },
    { x: 1078, y: 420, width: 139, height: 200 },
    { x: 1237, y: 420, width: 139, height: 200 },
  ],
  walk_s: [
    { x: 165, y: 630, width: 147, height: 202 },
    { x: 316, y: 630, width: 147, height: 202 },
    { x: 475, y: 630, width: 147, height: 202 },
    { x: 667, y: 630, width: 147, height: 202 },
    { x: 836, y: 630, width: 147, height: 202 },
    { x: 1003, y: 630, width: 147, height: 202 },
    { x: 1174, y: 630, width: 147, height: 202 },
  ],
};

// Target display height in pixels — the sprite is scaled to this height
export const HERO_DISPLAY_HEIGHT = 64;

// Animation playback rate for heroes
export const HERO_ANIM_FPS = 8;

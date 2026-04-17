// Creature sprite definitions
// Sprite sheet: public/fantasy-creatures-sprite-sheet.png
//
// Row layout (sheet is 1536×1024):
//   Row 1 (y=10, h=250):  green-dragon (frames 1-2) + red-dragon (frames 3-4)
//   Row 2 (y=289, h=202): boar (4 frames)
//   Row 3 (y=520, h=243): dark-knight (5 frames)
//   Row 4 (y=774, h=239): evil-wizard (4 frames)

import type { SpriteFrame } from './heroSpriteDefinitions';

export const CREATURE_SPRITE_SHEET = 'fantasy-creatures-sprite-sheet.png';

export interface CreatureType {
  name: string;
  hp: number;
  damage: number;
  /** Target display height in pixels */
  displayHeight: number;
  frames: SpriteFrame[];
}

export const CREATURE_TYPES: CreatureType[] = [
  {
    name: 'green-dragon',
    hp: 10,
    damage: 2,
    displayHeight: 160,
    frames: [
      { x: 59, y: 10, width: 331, height: 250 },
      { x: 407, y: 10, width: 345, height: 250 },
    ],
  },
  {
    name: 'red-dragon',
    hp: 20,
    damage: 4,
    displayHeight: 160,
    frames: [
      { x: 771, y: 10, width: 347, height: 250 },
      { x: 1146, y: 10, width: 355, height: 250 },
    ],
  },
  {
    name: 'boar',
    hp: 40,
    damage: 8,
    displayHeight: 120,
    frames: [
      { x: 65, y: 289, width: 291, height: 202 },
      { x: 414, y: 289, width: 298, height: 202 },
      { x: 765, y: 289, width: 307, height: 202 },
      { x: 1147, y: 289, width: 285, height: 202 },
    ],
  },
  {
    name: 'dark-knight',
    hp: 80,
    damage: 16,
    displayHeight: 128,
    frames: [
      { x: 60, y: 520, width: 257, height: 243 },
      { x: 358, y: 520, width: 257, height: 243 },
      { x: 655, y: 520, width: 258, height: 243 },
      { x: 941, y: 520, width: 256, height: 243 },
      { x: 1227, y: 520, width: 219, height: 243 },
    ],
  },
  {
    name: 'evil-wizard',
    hp: 160,
    damage: 32,
    displayHeight: 128,
    frames: [
      { x: 120, y: 774, width: 275, height: 239 },
      { x: 467, y: 774, width: 277, height: 239 },
      { x: 821, y: 774, width: 278, height: 239 },
      { x: 1170, y: 774, width: 279, height: 239 },
    ],
  },
];

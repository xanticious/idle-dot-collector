// Orb sprite definitions
// Sprite sheet: public/glowing-orbs-in-vibrant-colors.png
//
// Row layout (sheet is 1536×1024):
//   Row 1 (y=23, h=160): white orb (frames 1-4) + blue orb (frames 5-7)
//   Row 2 (y=215, h=151): green orb (frames 1-3) + yellow-green orb (frames 4-7)
//   Row 3 (y=397, h=153): red orb (frames 1-3) + orange orb (frames 4-7)
//   Row 4 (y=579, h=157): purple orb (all 7 frames)
//   Row 5 (y=765, h=175): dark-orange orb (frames 1-3) + dark-blue orb (frames 4-7)

import type { SpriteFrame } from './heroSpriteDefinitions';

export const ORB_SPRITE_SHEET = 'glowing-orbs-in-vibrant-colors.png';

/** Display diameter in pixels for a rendered orb */
export const ORB_DISPLAY_SIZE = 40;

/** Animation playback rate for orbs */
export const ORB_ANIM_FPS = 6;

export interface OrbType {
  name: string;
  /** Coin value awarded when collected */
  value: number;
  frames: SpriteFrame[];
}

export const ORB_TYPES: OrbType[] = [
  {
    name: 'white',
    value: 1,
    frames: [
      { x: 82, y: 23, width: 151, height: 160 },
      { x: 267, y: 23, width: 155, height: 160 },
      { x: 455, y: 23, width: 153, height: 160 },
      { x: 645, y: 23, width: 153, height: 160 },
    ],
  },
  {
    name: 'blue',
    value: 2,
    frames: [
      { x: 839, y: 23, width: 147, height: 160 },
      { x: 1031, y: 23, width: 144, height: 160 },
      { x: 1221, y: 23, width: 153, height: 160 },
    ],
  },
  {
    name: 'dark-blue',
    value: 4,
    frames: [
      { x: 647, y: 765, width: 164, height: 175 },
      { x: 838, y: 765, width: 165, height: 175 },
      { x: 1030, y: 765, width: 164, height: 175 },
      { x: 1221, y: 765, width: 167, height: 175 },
    ],
  },
  {
    name: 'green',
    value: 8,
    frames: [
      { x: 106, y: 215, width: 121, height: 151 },
      { x: 292, y: 215, width: 125, height: 151 },
      { x: 474, y: 215, width: 134, height: 151 },
    ],
  },
  {
    name: 'yellow-green',
    value: 16,
    frames: [
      { x: 673, y: 215, width: 126, height: 151 },
      { x: 864, y: 215, width: 126, height: 151 },
      { x: 1056, y: 215, width: 127, height: 151 },
      { x: 1248, y: 215, width: 123, height: 151 },
    ],
  },
  {
    name: 'orange',
    value: 32,
    frames: [
      { x: 647, y: 397, width: 168, height: 153 },
      { x: 839, y: 397, width: 167, height: 153 },
      { x: 1031, y: 397, width: 168, height: 153 },
      { x: 1222, y: 397, width: 163, height: 153 },
    ],
  },
  {
    name: 'dark-orange',
    value: 64,
    frames: [
      { x: 74, y: 765, width: 175, height: 175 },
      { x: 264, y: 765, width: 169, height: 175 },
      { x: 454, y: 765, width: 166, height: 175 },
    ],
  },
  {
    name: 'purple',
    value: 128,
    frames: [
      { x: 77, y: 579, width: 173, height: 157 },
      { x: 254, y: 579, width: 185, height: 157 },
      { x: 447, y: 579, width: 182, height: 157 },
      { x: 632, y: 579, width: 185, height: 157 },
      { x: 829, y: 579, width: 181, height: 157 },
      { x: 1020, y: 579, width: 184, height: 157 },
      { x: 1212, y: 579, width: 184, height: 157 },
    ],
  },
  {
    name: 'red',
    value: 256,
    frames: [
      { x: 82, y: 397, width: 165, height: 153 },
      { x: 268, y: 397, width: 166, height: 153 },
      { x: 457, y: 397, width: 168, height: 153 },
    ],
  },
];

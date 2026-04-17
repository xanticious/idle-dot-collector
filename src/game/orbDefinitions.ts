// Orb definitions for the glowing-orbs-in-vibrant-colors sprite sheet.
// Sprite frames will be added by the sprite artist; until then orbs are
// rendered as coloured circles with a glow ring.
// Orbs are sorted by value ascending — index 0 is the cheapest/most common.

export const ORB_SPRITE_SHEET = 'glowing-orbs-in-vibrant-colors.png';

export interface OrbDef {
  name: string;
  value: number;
  color: number; // PixiJS hex colour for fallback circle rendering
  glowColor: number;
}

export const ORB_TYPES: OrbDef[] = [
  { name: 'white',        value: 1,   color: 0xffffff, glowColor: 0xddddff },
  { name: 'blue',         value: 2,   color: 0x4488ff, glowColor: 0x2266dd },
  { name: 'dark blue',    value: 4,   color: 0x2255cc, glowColor: 0x113399 },
  { name: 'green',        value: 8,   color: 0x44ff88, glowColor: 0x22dd66 },
  { name: 'yellow-green', value: 16,  color: 0xaaff44, glowColor: 0x88ee22 },
  { name: 'orange',       value: 32,  color: 0xff8800, glowColor: 0xdd6600 },
  { name: 'dark orange',  value: 64,  color: 0xcc4400, glowColor: 0xaa3300 },
  { name: 'purple',       value: 128, color: 0xaa44ff, glowColor: 0x8822dd },
  { name: 'red',          value: 256, color: 0xff2222, glowColor: 0xdd0000 },
];

// Base orb radius (px). Scales slightly with orb index for visual feedback.
export const BASE_ORB_RADIUS = 6;
export const ORB_RADIUS_STEP = 0.7;

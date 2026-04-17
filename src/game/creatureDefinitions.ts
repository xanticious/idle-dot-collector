// Creature definitions for the fantasy-creatures-sprite-sheet.
// Sprite frames will be added by the sprite artist; until then creatures are
// rendered as coloured rectangles with a health bar.
// Creatures are sorted by difficulty ascending — index 0 is the easiest.

export const CREATURE_SPRITE_SHEET = 'fantasy-creatures-sprite-sheet.png';

export interface CreatureDef {
  name: string;
  hp: number;
  damage: number;
  color: number; // PixiJS hex colour for fallback rectangle rendering
  reward: number; // coins awarded to the player on defeat
}

export const CREATURE_TYPES: CreatureDef[] = [
  { name: 'Green Dragon', hp: 10,  damage: 2,  color: 0x44cc44, reward: 60   },
  { name: 'Red Dragon',   hp: 20,  damage: 4,  color: 0xff4444, reward: 200  },
  { name: 'Boar',         hp: 40,  damage: 8,  color: 0x886633, reward: 600  },
  { name: 'Dark Knight',  hp: 80,  damage: 16, color: 0x334455, reward: 2000 },
  { name: 'Evil Wizard',  hp: 160, damage: 32, color: 0x6622cc, reward: 6000 },
];

// One-time purchase cost to start a quest at each creature level.
export const QUEST_BUY_COSTS = [200, 500, 1200, 3000, 8000];

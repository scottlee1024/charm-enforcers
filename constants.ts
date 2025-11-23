import { Card, CardType, Character, HeroRole, SavedDeck } from './types';

// *** IMPORTANT: REPLACE THIS STRING WITH THE URL/PATH OF YOUR UPLOADED IMAGE ***
// Example: '/kayla_skin.png' (if placed in public folder) or a direct web URL.
export const KAYLA_SKIN_URL = 'https://i.ibb.co/FkCfBdB0/lisisicheng-3-D-no-chaos-10-ar-49-fast-stylize-100-v-7-6921e3beef6c168da9084695-1.png'; 

// GLB Model URLs
export const FALLBACK_MODEL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb';

export const KAYLA_MODEL_URL = 'https://raw.githubusercontent.com/scottlee1024/game-assets/main/Cyber_Warrior_Princes_1122175649_texture.glb';
export const LINA_MODEL_URL = 'https://raw.githubusercontent.com/scottlee1024/game-assets/main/Steampunk_Commander_1122180253_texture.glb';
export const PIRATE_MODEL_URL = 'https://raw.githubusercontent.com/scottlee1024/game-assets/main/Cyber_Gladiator_1123023056_texture.glb';

export const HEROES: Record<string, Character> = {
    kayla: {
        id: 'kayla',
        name: 'Kayla',
        role: HeroRole.Attacker,
        maxHp: 80,
        currentHp: 80,
        defense: 0,
        intelligence: 10,
        charmThreshold: 100,
        avatarUrl: KAYLA_SKIN_URL,
        modelUrl: KAYLA_MODEL_URL,
        modelScale: 1.1,
        skillName: 'Fire at Will',
        skillCost: 1,
        skillDescription: 'Next Destruction card dmg +50% (Synergy: +75%)',
        color: 'text-red-500 border-red-500 shadow-red-500/50'
    },
    lina: {
        id: 'lina',
        name: 'Lina',
        role: HeroRole.Charmer,
        maxHp: 70,
        currentHp: 70,
        defense: 0,
        intelligence: 15,
        charmThreshold: 100,
        avatarUrl: 'https://i.ibb.co/FLm3WPYR/01.png',
        modelUrl: LINA_MODEL_URL,
        modelScale: 1.1,
        skillName: 'Dream Tune',
        skillCost: 2,
        skillDescription: 'Boost next Charm card effect 150% + 25% Int',
        color: 'text-pink-500 border-pink-500 shadow-pink-500/50'
    },
    ella: {
        id: 'ella',
        name: 'Ella',
        role: HeroRole.Outsmart,
        maxHp: 65,
        currentHp: 65,
        defense: 0,
        intelligence: 25,
        charmThreshold: 100,
        avatarUrl: 'https://picsum.photos/seed/ella/200/200',
        skillName: 'Supercalc',
        skillCost: 2,
        skillDescription: 'Draw 2 cards. (Synergy: Draw 3)',
        color: 'text-blue-500 border-blue-500 shadow-blue-500/50'
    },
    fiona: {
        id: 'fiona',
        name: 'Fiona',
        role: HeroRole.Defender,
        maxHp: 90,
        currentHp: 90,
        defense: 0,
        intelligence: 10,
        charmThreshold: 100,
        avatarUrl: 'https://picsum.photos/seed/fiona/200/200',
        skillName: 'Barrier',
        skillCost: 1,
        skillDescription: 'Gain 10 Defense. (Synergy: +5)',
        color: 'text-green-500 border-green-500 shadow-green-500/50'
    }
};

export const CARD_POOL: Card[] = [
    // --- NEUTRAL ---
    { id: 'n_shot', name: 'Shoot', cost: 1, type: CardType.Destruction, description: 'Deal 5 damage.', effectId: 'dmg', value: 5 },
    { id: 'n_heavy', name: 'Heavy Hit', cost: 2, type: CardType.Destruction, description: 'Deal 12 damage.', effectId: 'dmg', value: 12 },
    { id: 'n_def', name: 'Defense', cost: 1, type: CardType.Enhancement, description: 'Gain 6 Defense.', effectId: 'def', value: 6 },
    { id: 'n_focus', name: 'Focus', cost: 1, type: CardType.Enhancement, description: 'Gain 3 Attack this turn.', effectId: 'buff_atk', value: 3 },
    { id: 'n_plan', name: 'Tactical Plan', cost: 1, type: CardType.Resource, description: 'Draw 2 cards.', effectId: 'draw', value: 2 },
    { id: 'n_rush', name: 'Rush', cost: 0, type: CardType.Energy, description: 'Gain 1 Energy next turn.', effectId: 'energy', value: 1 },
    { id: 'n_cover', name: 'Cover Fire', cost: 1, type: CardType.Destruction, description: 'Deal 3 dmg, Gain 3 Def.', effectId: 'dmg_def', value: 3 },
    
    // --- KAYLA (Attacker) ---
    { id: 'k_beam', name: 'Blast Beam', cost: 2, type: CardType.Destruction, description: 'Deal 16 Damage.', effectId: 'dmg', value: 16, ownerHeroId: 'kayla' },
    { id: 'k_wep', name: 'Overclock', cost: 1, type: CardType.Enhancement, description: 'Gain 5 Attack this turn.', effectId: 'buff_atk', value: 5, ownerHeroId: 'kayla' },
    { id: 'k_disable', name: 'Disable', cost: 2, type: CardType.Destruction, description: '8 Dmg + Reduce Enemy Atk.', effectId: 'dmg_debuff', value: 8, ownerHeroId: 'kayla' },
    { id: 'k_rage', name: 'Battle Rage', cost: 1, type: CardType.Resource, description: 'Draw 1 per kill.', effectId: 'draw_cond', value: 1, ownerHeroId: 'kayla' },
    { id: 'k_ult', name: 'Full Auto', cost: 3, type: CardType.Destruction, description: 'Deal 4 damage 5 times.', effectId: 'dmg_multi', value: 4, ownerHeroId: 'kayla' },

    // --- LINA (Charmer) ---
    { id: 'l_charm', name: 'Phantom Proj', cost: 2, type: CardType.Destruction, description: 'Lower Charm Thresh by 20.', effectId: 'charm_dmg', value: 20, ownerHeroId: 'lina' },
    { id: 'l_whisper', name: 'Whisper', cost: 1, type: CardType.Destruction, description: 'Lower Charm Thresh by 10.', effectId: 'charm_dmg', value: 10, ownerHeroId: 'lina' },
    { id: 'l_interrupt', name: 'Mind Break', cost: 2, type: CardType.Control, description: 'Interrupt & Charm Dmg.', effectId: 'interrupt', value: 10, ownerHeroId: 'lina' },
    { id: 'l_dance', name: 'Light Dance', cost: 1, type: CardType.Resource, description: 'Draw 1, Gain 4 Def.', effectId: 'draw_def', value: 4, ownerHeroId: 'lina' },
    { id: 'l_siren', name: 'Siren Song', cost: 3, type: CardType.Control, description: 'Stun Enemy 1 turn.', effectId: 'stun', value: 1, ownerHeroId: 'lina' },

    // --- ELLA (Outsmart) ---
    { id: 'e_scan', name: 'Scan', cost: 1, type: CardType.Destruction, description: 'Lower enemy Def by 5.', effectId: 'shred', value: 5, ownerHeroId: 'ella' },
    { id: 'e_calc', name: 'Reverse Eng', cost: 2, type: CardType.Control, description: 'Remove Enemy Buffs.', effectId: 'purge', value: 0, ownerHeroId: 'ella' },
    { id: 'e_predict', name: 'Prediction', cost: 1, type: CardType.Resource, description: 'See intent + Draw 1.', effectId: 'peek_draw', value: 1, ownerHeroId: 'ella' },
    { id: 'e_hack', name: 'Sys Hack', cost: 1, type: CardType.Control, description: 'Enemy cards cost +1.', effectId: 'cost_up', value: 1, ownerHeroId: 'ella' },
    { id: 'e_opt', name: 'Optimize', cost: 0, type: CardType.Energy, description: 'Gain 2 Energy.', effectId: 'energy', value: 2, ownerHeroId: 'ella' },

    // --- FIONA (Defender) ---
    { id: 'f_fort', name: 'Fortress', cost: 2, type: CardType.Enhancement, description: 'Gain 15 Defense.', effectId: 'def', value: 15, ownerHeroId: 'fiona' },
    { id: 'f_rep', name: 'Nano Repair', cost: 1, type: CardType.Enhancement, description: 'Heal 5 HP.', effectId: 'heal', value: 5, ownerHeroId: 'fiona' },
    { id: 'f_bash', name: 'Shield Bash', cost: 2, type: CardType.Conversion, description: 'Dmg = 50% of Def.', effectId: 'slam', value: 0.5, ownerHeroId: 'fiona' },
    { id: 'f_reflect', name: 'Pulse Reflect', cost: 1, type: CardType.Enhancement, description: 'Gain 6 Def. Reflect 8 dmg.', effectId: 'reflect', value: 6, ownerHeroId: 'fiona' },
    { id: 'f_wall', name: 'Bulwark', cost: 3, type: CardType.Enhancement, description: 'Double Defense.', effectId: 'def_x2', value: 0, ownerHeroId: 'fiona' }
];

export const INITIAL_SAVED_DECKS: SavedDeck[] = [
    { id: 'd1', name: 'Starter Assault', heroId: 'kayla', cards: CARD_POOL.filter(c => c.ownerHeroId === 'kayla' || !c.ownerHeroId).slice(0, 6) },
    { id: 'd2', name: 'Mind Games', heroId: 'lina', cards: CARD_POOL.filter(c => c.ownerHeroId === 'lina' || !c.ownerHeroId).slice(0, 4) }
];
import { Card, CardType, GameState, FormationType, Character, Enemy } from '../types';

// Check if formation synergy is active for a specific card/hero combo
export const checkSynergy = (
    gameState: GameState, 
    heroId: string | undefined, 
    cardType: CardType
): boolean => {
    if (!heroId) return false; 
    
    const { formation } = gameState;

    // Logic based on Design Doc Chapter 1
    if (heroId === 'kayla' && formation === FormationType.FrontBack && cardType === CardType.Destruction) return true;
    if (heroId === 'lina' && formation === FormationType.Spread && cardType === CardType.Destruction) return true; 
    if (heroId === 'ella' && formation === FormationType.Spread) return true; 
    if (heroId === 'fiona' && formation === FormationType.FrontBack) return true;

    return false;
};

// Core Attribute: Intellect Logic
// If Source Int > Target Int, high probability to negate Buff/Debuff
export const shouldNegateEffect = (
    sourceInt: number,
    targetInt: number
): boolean => {
    if (sourceInt > targetInt) {
        // 70% chance to negate if superior intellect
        return Math.random() < 0.7;
    }
    return false;
};

export const calculateDamage = (
    baseValue: number, 
    cardType: CardType, 
    state: GameState,
    target?: Character | Enemy // Optional target to check for 'Broken' status
): number => {
    let multiplier = 1;
    let additive = 0;

    if (cardType === CardType.Destruction) {
        if (state.nextDestructionBuff > 0) {
            multiplier += (state.nextDestructionBuff / 100);
        }
        additive += state.tempAttackBuff;
    }

    // Core Attribute: Defense (Broken Status)
    // If Defense <= 0, damage is increased by 50%
    if (target && target.statuses.isBroken) {
        multiplier += 0.5;
    }

    return Math.floor((baseValue + additive) * multiplier);
};

export const calculateCost = (
    baseCost: number,
    heroId: string | undefined,
    cardType: CardType,
    formation: FormationType
): number => {
    let cost = baseCost;
    
    if (heroId === 'lina' && formation === FormationType.Spread && (cardType === CardType.Destruction || cardType === CardType.Control)) {
        cost -= 1;
    }

    return Math.max(0, cost);
};

// Helper to update statuses based on attributes
export const updateStatuses = (entity: Character | Enemy) => {
    // Core Attribute: Defense -> Broken
    entity.statuses.isBroken = entity.defense <= 0;

    // Core Attribute: Attack -> Disarmed
    // Only applicable if attack drops to 0 or below (debuffs)
    if ('attack' in entity) {
        entity.statuses.isDisarmed = (entity as Enemy).attack <= 0;
    }

    // Core Attribute: Charm Threshold -> Confused
    if (entity.charmThreshold <= 0 && entity.statuses.confusedDuration === 0) {
        entity.statuses.confusedDuration = 2; // Lasts 2 turns
        entity.charmThreshold = 0; // Cap at 0
    }
};
import { Card, CardType, GameState, FormationType } from '../types';

// Check if formation synergy is active for a specific card/hero combo
export const checkSynergy = (
    gameState: GameState, 
    heroId: string | undefined, 
    cardType: CardType
): boolean => {
    if (!heroId) return false; // Neutral cards usually don't have specific formation synergy in this basic MVP unless specified
    
    const { formation } = gameState;

    // Logic based on Design Doc Chapter 1
    if (heroId === 'kayla' && formation === FormationType.FrontBack && cardType === CardType.Destruction) return true;
    if (heroId === 'lina' && formation === FormationType.Spread && cardType === CardType.Destruction) return true; // Lina's synergy is cost reduction, handled separately, but visual feedback is good
    if (heroId === 'ella' && formation === FormationType.Spread) return true; // "Charging" implies Spread in this MVP simplification
    if (heroId === 'fiona' && formation === FormationType.FrontBack) return true;

    return false;
};

export const calculateDamage = (
    baseValue: number, 
    cardType: CardType, 
    state: GameState
): number => {
    let multiplier = 1;
    let additive = 0;

    if (cardType === CardType.Destruction) {
        if (state.nextDestructionBuff > 0) {
            multiplier += (state.nextDestructionBuff / 100);
        }
        additive += state.tempAttackBuff;
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
    
    // Lina Synergy: Spread formation reduces cost of Charm skills (Using destruction type for MVP as placeholder for charm-destruct)
    if (heroId === 'lina' && formation === FormationType.Spread && (cardType === CardType.Destruction || cardType === CardType.Control)) {
        cost -= 1;
    }

    return Math.max(0, cost);
};
import React from 'react';

export enum CardType {
    Destruction = 'Destruction', // 破坏
    Enhancement = 'Enhancement', // 增益
    Energy = 'Energy', // 能量
    Resource = 'Resource', // 资源
    Conversion = 'Conversion', // 转化
    Control = 'Control', // 控制
}

export enum HeroRole {
    Attacker = 'Attacker',
    Charmer = 'Charmer',
    Outsmart = 'Outsmart',
    Defender = 'Defender',
}

export enum FormationType {
    FrontBack = 'FrontBack', // 前后 (合力/阻挡)
    Spread = 'Spread', // 展开 (蓄能/掩护)
}

export interface StatusEffects {
    isDisarmed: boolean; // Attack <= 0
    isBroken: boolean;   // Defense <= 0
    confusedDuration: number; // Turns remaining for Confusion (Charm <= 0)
}

export interface Card {
    id: string;
    name: string;
    cost: number;
    type: CardType;
    description: string;
    effectId: string; // Identifier for the logic engine
    value: number; // Base numerical value (damage, shield, etc.)
    ownerHeroId?: string; // If exclusive to a hero
}

export interface SavedDeck {
    id: string;
    name: string;
    heroId: string;
    cards: Card[];
    lastEdited?: number;
}

export interface Character {
    id: string;
    name: string;
    role: HeroRole;
    maxHp: number;
    currentHp: number;
    defense: number; // Armor
    intelligence: number;
    charmThreshold: number; // Sanity/Resist
    maxCharmThreshold: number;
    avatarUrl: string;
    modelUrl?: string; // URL to .glb file
    modelScale?: number; // Scale adjustment for 3D model
    skillName: string;
    skillCost: number;
    skillDescription: string;
    color: string;
    statuses: StatusEffects;
}

export interface Enemy {
    id: string;
    name: string;
    maxHp: number;
    currentHp: number;
    attack: number;
    defense: number;
    charmThreshold: number; // Max 100
    maxCharmThreshold: number;
    intent: 'Attack' | 'Buff' | 'Debuff' | 'Charge' | 'Self-Hit' | 'Stunned';
    nextMoveValue: number;
    modelUrl?: string; // Optional custom model
    intelligence: number; // Added for core attribute comparison
    statuses: StatusEffects;
}

export interface GameState {
    turn: number;
    mana: number;
    maxMana: number;
    formation: FormationType;
    players: Character[]; // The 2 active enforcers
    enemies: Enemy[];
    hand: Card[];
    deck: Card[]; // The current draw pile
    discard: Card[];
    selectedCardId: string | null;
    gameLog: string[];
    
    // Buff States
    nextDestructionBuff: number; // Kayla's skill (percentage)
    nextCharmBuff: number; // Lina's skill (percentage)
    tempAttackBuff: number; // For current turn
    costReduction: number; // Global cost reduction
}

export type AppScreen = 'login' | 'menu' | 'hero_selection' | 'game' | 'deckbuilder' | 'exploration';

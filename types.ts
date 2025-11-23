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
    avatarUrl: string;
    modelUrl?: string; // URL to .glb file
    modelScale?: number; // Scale adjustment for 3D model
    skillName: string;
    skillCost: number;
    skillDescription: string;
    color: string;
}

export interface Enemy {
    id: string;
    name: string;
    maxHp: number;
    currentHp: number;
    attack: number;
    defense: number;
    charmThreshold: number; // Max 100
    intent: 'Attack' | 'Buff' | 'Debuff' | 'Charge';
    nextMoveValue: number;
    modelUrl?: string; // Optional custom model
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

// Fix for React Three Fiber Intrinsic Elements
// Augments the JSX namespace to recognize Three.js elements used in R3F components
declare global {
    namespace JSX {
        interface IntrinsicElements {
            ambientLight: any;
            directionalLight: any;
            pointLight: any;
            mesh: any;
            group: any;
            primitive: any;
            planeGeometry: any;
            meshBasicMaterial: any;
            cylinderGeometry: any;
            meshStandardMaterial: any;
            sphereGeometry: any;
            boxGeometry: any;
            circleGeometry: any;
            gridHelper: any;
            stars: any; // For drei stars
            ringGeometry: any;
            torusGeometry: any;
        }
    }

    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                ambientLight: any;
                directionalLight: any;
                pointLight: any;
                mesh: any;
                group: any;
                primitive: any;
                planeGeometry: any;
                meshBasicMaterial: any;
                cylinderGeometry: any;
                meshStandardMaterial: any;
                sphereGeometry: any;
                boxGeometry: any;
                circleGeometry: any;
                gridHelper: any;
                stars: any;
                ringGeometry: any;
                torusGeometry: any;
            }
        }
    }
}
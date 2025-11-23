
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Activity, Shield, Skull, Users, Sparkles, Sword, ChevronRight, BarChart2, LogOut, Loader2, Heart, Zap } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { HEROES } from '../constants';
import { GameState, FormationType, Card, CardType, Character, Enemy } from '../types';
import CardComponent from './CardComponent';
import StatsModal from './StatsModal';
import HeroModel3D from './HeroModel3D';
import EnemyModel3D from './EnemyModel3D';
import { checkSynergy, calculateDamage, calculateCost } from '../services/gameLogic';
import { audioService } from '../services/audioService';
import * as THREE from 'three';

interface GameScreenProps {
    onExit: (result: 'victory' | 'defeat' | 'surrender') => void;
    frontHeroId: string;
    backHeroId: string;
    frontDeck: Card[];
    backDeck: Card[];
    enemyData: Enemy;
}

// --- VFX TYPES & COMPONENTS ---
type VFXType = 'BEAM' | 'PROJECTILE' | 'EXPLOSION' | 'SLASH' | 'SONIC' | 'SCAN' | 'GENERIC_HIT';

interface VFXState {
    type: VFXType;
    timestamp: number;
    duration: number;
}

// 1. PROJECTILE VFX: Moves from Hero to Enemy
// Made larger and slower for visibility
const ProjectileVFX = ({ startTime }: { startTime: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (!meshRef.current) return;
        const progress = (Date.now() - startTime) / 400; // Increased to 400ms
        if (progress < 1) {
            // Lerp from x=-0.5 to x=2.5
            meshRef.current.position.x = -0.5 + (progress * 3.0);
            meshRef.current.position.y = 1.2;
            // Arc slightly
            meshRef.current.position.y += Math.sin(progress * Math.PI) * 0.5;
            
            // Stretch effect based on speed
            meshRef.current.scale.set(0.6, 0.2, 0.2);
            meshRef.current.rotation.z = -Math.atan2(0.5 * Math.cos(progress * Math.PI), 3.0);
        } else {
            meshRef.current.scale.set(0,0,0);
        }
    });
    return (
        <mesh ref={meshRef} position={[-0.5, 1, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3} />
        </mesh>
    );
};

// 2. EXPLOSION VFX: Expands at Enemy location
const ExplosionVFX = ({ startTime }: { startTime: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (!meshRef.current) return;
        const progress = (Date.now() - startTime) / 500;
        if (progress < 1) {
            const scale = 0.5 + progress * 4;
            meshRef.current.scale.set(scale, scale, scale);
            const opacity = 1 - progress;
            (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
        } else {
             meshRef.current.scale.set(0,0,0);
        }
    });
    return (
        <group position={[2.5, 1, 0]}>
            <pointLight intensity={5} distance={5} color="orange" decay={2} />
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
            </mesh>
        </group>
    );
};

// 3. SLASH VFX: Rotates and fades at Enemy
const SlashVFX = ({ startTime }: { startTime: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(() => {
        if (!groupRef.current) return;
        const progress = (Date.now() - startTime) / 250;
        if (progress < 1) {
            groupRef.current.rotation.z = (progress - 0.5) * Math.PI; // Swipe rotation
            groupRef.current.scale.set(1 + progress * 2, 1, 1);
            
             // Fade children
             groupRef.current.children.forEach((child: any) => {
                 if(child.material) child.material.opacity = 1 - progress;
             });
        } else {
             groupRef.current.scale.set(0,0,0);
        }
    });
    return (
        <group ref={groupRef} position={[2.5, 1.2, 0]}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.1, 3.5, 0.1]} />
                <meshBasicMaterial color="cyan" transparent opacity={1} />
            </mesh>
        </group>
    );
};

// 4. SONIC WAVE VFX: Rings moving towards enemy
const SonicVFX = ({ startTime }: { startTime: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(() => {
        if (!groupRef.current) return;
        const progress = (Date.now() - startTime) / 700;
        if (progress < 1) {
            groupRef.current.position.x = -0.5 + (progress * 3.0);
            const scale = 0.5 + progress * 3;
            groupRef.current.scale.set(scale, scale, scale);
             (groupRef.current.children[0] as any).material.opacity = 1 - progress;
        } else {
            groupRef.current.scale.set(0,0,0);
        }
    });
    return (
        <group ref={groupRef} position={[-0.5, 1, 0]} rotation={[0, Math.PI/2, 0]}>
            <mesh>
                <torusGeometry args={[0.6, 0.1, 16, 32]} />
                <meshBasicMaterial color="#ec4899" transparent opacity={0.8} />
            </mesh>
        </group>
    );
};

// 5. SCANNER VFX: Grid plane sweeping
const ScannerVFX = ({ startTime }: { startTime: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (!meshRef.current) return;
        const progress = (Date.now() - startTime) / 600;
        if (progress < 1) {
            meshRef.current.position.z = -2.0 + (progress * 4.0); // Sweep across Z
            (meshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(progress * Math.PI) * 0.8;
        } else {
            meshRef.current.visible = false;
        }
    });
    return (
        <mesh ref={meshRef} position={[2.5, 1, 0]} rotation={[0, Math.PI/2, 0]}>
            <planeGeometry args={[4, 4]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.5} wireframe />
        </mesh>
    );
};

// 6. BEAM VFX (Kayla)
const BeamVFX = ({ startTime }: { startTime: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (!meshRef.current) return;
        const progress = (Date.now() - startTime) / 500;
        if (progress < 1) {
             const width = Math.sin(progress * Math.PI) * 0.5; // Thicker beam
             meshRef.current.scale.set(width, 1, width);
             (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 1 - progress;
        } else {
            meshRef.current.visible = false;
        }
    });
    return (
        <group>
             <pointLight position={[1, 1, 0]} intensity={3} color="red" distance={5} />
             <mesh ref={meshRef} position={[1, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 6, 16]} />
                <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={4} transparent opacity={0.9} />
            </mesh>
        </group>
    );
};


// --- HUD Components ---
const HeroStatusPanel = ({ character, isFront }: { character: Character, isFront: boolean }) => {
    const colorClass = isFront ? 'border-red-500/50 bg-red-950/80' : 'border-blue-500/50 bg-blue-950/80';
    const textColor = isFront ? 'text-red-400' : 'text-blue-400';
    const barColor = isFront ? 'bg-red-500' : 'bg-blue-500';

    return (
        <div className={`w-56 p-3 rounded-r-xl border-l-4 border-y border-r border-slate-800 backdrop-blur-md shadow-xl mb-4 transition-all ${colorClass}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className={`text-[10px] font-black uppercase tracking-widest opacity-70 ${textColor}`}>
                        {isFront ? 'FRONT LINE' : 'BACK LINE'}
                    </div>
                    <div className="text-lg font-bold text-white leading-none">{character.name}</div>
                </div>
                {character.defense > 0 && (
                    <div className="flex flex-col items-center bg-slate-900/50 p-1 rounded">
                        <Shield size={14} className="text-cyan-400 mb-0.5"/>
                        <span className="text-xs font-bold text-cyan-400">{character.defense}</span>
                    </div>
                )}
            </div>
            
            <div className="relative h-6 bg-slate-900 rounded overflow-hidden border border-slate-700/50">
                <div 
                    className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-300`} 
                    style={{ width: `${(character.currentHp / character.maxHp) * 100}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white drop-shadow-md z-10">
                    {character.currentHp} / {character.maxHp}
                </div>
            </div>
        </div>
    );
};

const EnemyStatusPanel = ({ enemy }: { enemy: Enemy }) => {
    return (
        <div className="w-64 p-4 rounded-l-xl border-r-4 border-l border-y border-red-900/50 bg-slate-900/90 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-3">
                <div className="text-right flex-1">
                    <div className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-0.5">HOSTILE TARGET</div>
                    <div className="text-xl font-bold text-white">{enemy.name}</div>
                </div>
                <div className="ml-3 w-10 h-10 rounded-full bg-red-900 border border-red-500 flex items-center justify-center animate-pulse">
                    <Skull className="text-red-200" size={20} />
                </div>
            </div>

            <div className="relative h-8 bg-black rounded-lg overflow-hidden border border-red-900 mb-2">
                <div 
                    className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-600 to-red-800 transition-all duration-500" 
                    style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-red-100 z-10">
                    <Heart size={14} className="mr-2 fill-current"/> {enemy.currentHp} / {enemy.maxHp}
                </div>
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1">
                    <Sword size={12} className="text-red-400" /> ATK: {enemy.attack}
                </div>
                <div className="flex items-center gap-1">
                    <Shield size={12} className="text-cyan-400" /> DEF: {enemy.defense}
                </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-white/10 text-center">
                <span className="text-[10px] text-slate-500 uppercase">INTENT DETECTED</span>
                <div className="text-red-400 font-bold flex items-center justify-center gap-2">
                    <Activity size={14} /> {enemy.intent} ({enemy.nextMoveValue} DMG)
                </div>
            </div>
        </div>
    );
};

// --- 3D SCENE COMPONENT ---
const BattleScene = ({ gameState, activeVFX }: { gameState: GameState, activeVFX: VFXState | null }) => {
    const frontHero = gameState.players[0];
    const backHero = gameState.players[1];
    const enemy = gameState.enemies[0];

    const getHeroAction = (heroId: string) => {
        if (!activeVFX) return 'IDLE';
        // Hero animates if they own the VFX
        if (activeVFX.type === 'BEAM' && heroId === 'kayla') return 'ATTACK';
        if (activeVFX.type === 'PROJECTILE' && activeVFX.timestamp > Date.now() - 500) return 'ATTACK'; // Generic attack anim
        return 'IDLE';
    };

    const getEnemyAction = () => {
        if (activeVFX && (activeVFX.type === 'BEAM' || activeVFX.type === 'EXPLOSION' || activeVFX.type === 'SLASH' || activeVFX.type === 'PROJECTILE')) return 'HIT';
        return 'IDLE';
    };

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <Grid position={[0, -0.05, 0]} args={[20, 20]} cellColor="#22d3ee" sectionColor="#0f172a" fadeDistance={15} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
                <planeGeometry args={[50, 50]} />
                <meshBasicMaterial color="#020617" />
            </mesh>

            <group position={[-0.5, 0, 0]}>
                {frontHero && (
                     <HeroModel3D 
                        character={frontHero} 
                        position={gameState.formation === FormationType.FrontBack ? [0.8, 0, 1.5] : [0.5, 0, 1.5]} 
                        rotation={[0, Math.PI / 2, 0]}
                        action={getHeroAction(frontHero.id)}
                        isFront={true}
                     />
                )}
                {backHero && (
                    <HeroModel3D 
                        character={backHero} 
                        position={gameState.formation === FormationType.FrontBack ? [-0.8, 0, -1.0] : [-0.5, 0, -1.0]} 
                        rotation={[0, Math.PI / 2, 0]}
                        action={getHeroAction(backHero.id)}
                        isFront={false}
                    />
                )}
            </group>

            {enemy && enemy.currentHp > 0 && (
                <EnemyModel3D 
                    enemy={enemy} 
                    position={[2.5, 0, 0]} 
                    action={getEnemyAction()}
                />
            )}

            {/* RENDER ACTIVE VFX - Key ensures replay on re-trigger */}
            {activeVFX && activeVFX.type === 'BEAM' && <BeamVFX key={activeVFX.timestamp} startTime={activeVFX.timestamp} />}
            {activeVFX && activeVFX.type === 'PROJECTILE' && <ProjectileVFX key={activeVFX.timestamp} startTime={activeVFX.timestamp} />}
            {activeVFX && activeVFX.type === 'EXPLOSION' && <ExplosionVFX key={activeVFX.timestamp} startTime={activeVFX.timestamp} />}
            {activeVFX && activeVFX.type === 'SLASH' && <SlashVFX key={activeVFX.timestamp} startTime={activeVFX.timestamp} />}
            {activeVFX && activeVFX.type === 'SONIC' && <SonicVFX key={activeVFX.timestamp} startTime={activeVFX.timestamp} />}
            {activeVFX && activeVFX.type === 'SCAN' && <ScannerVFX key={activeVFX.timestamp} startTime={activeVFX.timestamp} />}

        </>
    );
};


const GameScreen: React.FC<GameScreenProps> = ({ onExit, frontHeroId, backHeroId, frontDeck, backDeck, enemyData }) => {
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [dmgStats, setDmgStats] = useState<{name: string, damage: number}[]>([]);
    const [activeVFX, setActiveVFX] = useState<VFXState | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null);

    // Initialize Game State
    const [gameState, setGameState] = useState<GameState>(() => {
        const frontHero = { ...HEROES[frontHeroId] };
        const backHero = { ...HEROES[backHeroId] };
        
        const combinedDeck = [...frontDeck, ...backDeck].sort(() => Math.random() - 0.5);

        return {
            turn: 1,
            mana: 3,
            maxMana: 3,
            formation: FormationType.FrontBack,
            players: [frontHero, backHero],
            enemies: [enemyData], 
            hand: [],
            deck: combinedDeck,
            discard: [],
            selectedCardId: null,
            gameLog: [`Encounter started: ${enemyData.name}`],
            nextDestructionBuff: 0,
            nextCharmBuff: 0,
            tempAttackBuff: 0,
            costReduction: 0,
        };
    });
    
    useEffect(() => {
        setDmgStats([
            { name: HEROES[frontHeroId].name, damage: 0 },
            { name: HEROES[backHeroId].name, damage: 0 }
        ]);
    }, [frontHeroId, backHeroId]);
    
    useEffect(() => {
        drawCards(4);
    }, []);

    const addLog = (msg: string) => {
        setGameState(prev => ({
            ...prev,
            gameLog: [msg, ...prev.gameLog].slice(0, 8)
        }));
    };

    const triggerVFX = (type: VFXType, duration: number = 600) => {
        setActiveVFX({ type, timestamp: Date.now(), duration });
        if (type === 'EXPLOSION' || type === 'BEAM') {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 300);
        }
        setTimeout(() => setActiveVFX(null), duration);
    };

    const drawCards = (count: number) => {
        setGameState(prev => {
            let newDeck = [...prev.deck];
            let newDiscard = [...prev.discard];
            const newHand = [...prev.hand];

            for (let i = 0; i < count; i++) {
                if (newDeck.length === 0) {
                    if (newDiscard.length === 0) break;
                    newDeck = newDiscard.sort(() => Math.random() - 0.5);
                    newDiscard = [];
                }
                const card = newDeck.pop();
                if (card) newHand.push(card);
            }

            return { ...prev, deck: newDeck, discard: newDiscard, hand: newHand };
        });
    };

    const toggleFormation = () => {
        setGameState(prev => ({
            ...prev,
            formation: prev.formation === FormationType.FrontBack ? FormationType.Spread : FormationType.FrontBack,
            gameLog: [`Formation switched to ${prev.formation === FormationType.FrontBack ? 'Spread' : 'Front-Back'}.`, ...prev.gameLog].slice(0,8)
        }));
    };

    const playCard = (card: Card) => {
        if (gameResult) return; 

        const cost = calculateCost(card.cost, card.ownerHeroId, card.type, gameState.formation);
        
        if (gameState.mana < cost) {
            addLog("Not enough energy!");
            return;
        }

        // --- DETERMINE VFX & SFX ---
        let vfxToPlay: VFXType = 'PROJECTILE';
        
        // AUDIO TRIGGER LOGIC
        if (card.ownerHeroId === 'kayla') {
            audioService.playKaylaShot();
            if (card.id.includes('beam')) vfxToPlay = 'BEAM';
            else if (card.id.includes('disable')) vfxToPlay = 'SLASH';
            else if (card.id.includes('ult')) { vfxToPlay = 'EXPLOSION'; audioService.playAttack(true); }
        } else if (card.ownerHeroId === 'lina') {
            audioService.playLinaCharm();
            vfxToPlay = 'SONIC';
        } else if (card.ownerHeroId === 'ella') {
             audioService.playEllaScan();
             if (card.id.includes('scan')) vfxToPlay = 'SCAN';
        } else if (card.type === CardType.Enhancement || card.type === CardType.Resource) {
            audioService.playBuff();
        } else if (card.type === CardType.Destruction) {
            audioService.playAttack(false);
             if (card.id.includes('heavy')) vfxToPlay = 'EXPLOSION';
        } else {
             audioService.playDefense();
        }

        // Trigger visual
        if (card.type === CardType.Destruction || card.type === CardType.Control) {
            triggerVFX(vfxToPlay, vfxToPlay === 'SONIC' ? 600 : 400);
        }

        setGameState(prev => {
            let newState = { ...prev };
            let logMsg = `Played ${card.name}. `;
            newState.mana -= cost;
            newState.hand = newState.hand.filter(c => c.id !== card.id);
            newState.discard.push(card);

            const targetEnemy = newState.enemies[0]; 
            const isSynergy = checkSynergy(prev, card.ownerHeroId, card.type);

            if (card.effectId === 'dmg' || card.effectId.includes('dmg')) {
                let dmg = calculateDamage(card.value, card.type, prev);
                if (isSynergy && card.ownerHeroId === 'kayla') dmg = Math.floor(dmg * 1.25);
                
                let finalDmg = dmg;
                if (targetEnemy.defense > 0) {
                    const overkill = dmg - targetEnemy.defense;
                    targetEnemy.defense = Math.max(0, targetEnemy.defense - dmg);
                    finalDmg = Math.max(0, overkill);
                }
                targetEnemy.currentHp = Math.max(0, targetEnemy.currentHp - finalDmg);
                logMsg += `Dealt ${dmg} damage.`;

                // VICTORY CHECK
                if (targetEnemy.currentHp <= 0) {
                    setGameResult('victory');
                }

                const heroName = card.ownerHeroId ? HEROES[card.ownerHeroId].name : 'Team';
                setDmgStats(stats => {
                    const newStats = [...stats];
                    const idx = newStats.findIndex(s => s.name === heroName);
                    if (idx >= 0) newStats[idx].damage += dmg;
                    else if (heroName === 'Team') {
                        newStats[0].damage += Math.floor(dmg/2);
                        newStats[1].damage += Math.ceil(dmg/2);
                    }
                    return newStats;
                });
                newState.nextDestructionBuff = 0; 
            } 
            else if (card.effectId === 'def') {
                let amount = card.value;
                if (isSynergy && card.ownerHeroId === 'fiona') amount += 5;
                newState.players.forEach(p => p.defense += Math.ceil(amount / newState.players.length));
                logMsg += `Team gained ${amount} Defense.`;
            }
            else if (card.effectId === 'buff_atk') {
                newState.tempAttackBuff += card.value;
                logMsg += `Attack boosted by ${card.value}.`;
            }
            else if (card.effectId === 'draw') {
                let amount = card.value;
                if (isSynergy && card.ownerHeroId === 'ella') amount += 1;
                 let newDeck = [...newState.deck];
                 let newDiscard = [...newState.discard];
                 for(let i=0; i<amount; i++) {
                     if(newDeck.length === 0 && newDiscard.length > 0) {
                         newDeck = newDiscard.sort(() => Math.random() - 0.5);
                         newDiscard = [];
                     }
                     const drawn = newDeck.pop();
                     if(drawn) newState.hand.push(drawn);
                 }
                 newState.deck = newDeck;
                 newState.discard = newDiscard;
                 logMsg += `Drew ${amount} cards.`;
            }

            newState.gameLog = [logMsg, ...newState.gameLog].slice(0,8);
            return newState;
        });
    };

    const useHeroSkill = (heroId: string) => {
        if (gameResult) return;
        const hero = gameState.players.find(h => h.id === heroId);
        if (!hero) return;

        if (gameState.mana < hero.skillCost) {
            addLog("Not enough energy for skill!");
            return;
        }

        setGameState(prev => {
            const newState = { ...prev };
            newState.mana -= hero.skillCost;
            let logMsg = `${hero.name} used ${hero.skillName}! `;
            const formation = prev.formation;

            switch (heroId) {
                case 'kayla':
                    let buff = 50;
                    if (formation === FormationType.FrontBack) buff = 75;
                    newState.nextDestructionBuff = buff;
                    logMsg += `Destruction +${buff}%.`;
                    triggerVFX('BEAM'); 
                    audioService.playKaylaShot();
                    break;
                case 'lina':
                    newState.nextCharmBuff = 50 + (hero.intelligence * 2.5);
                    logMsg += `Charm boosted.`;
                    audioService.playLinaCharm();
                    break;
                case 'fiona':
                    let def = 10;
                    if (formation === FormationType.FrontBack) def += 5;
                    const fionaUnit = newState.players.find(p => p.id === 'fiona');
                    if(fionaUnit) fionaUnit.defense += def;
                    logMsg += `Gained ${def} Def.`;
                    audioService.playDefense();
                    break;
                case 'ella':
                    let drawCount = 2;
                    if (formation === FormationType.Spread) drawCount += 1;
                    let newDeck = [...newState.deck];
                    let newDiscard = [...newState.discard];
                    for(let i=0; i<drawCount; i++) {
                         if(newDeck.length === 0 && newDiscard.length > 0) {
                             newDeck = newDiscard.sort(() => Math.random() - 0.5);
                             newDiscard = [];
                         }
                         const drawn = newDeck.pop();
                         if(drawn) newState.hand.push(drawn);
                     }
                     newState.deck = newDeck;
                     newState.discard = newDiscard;
                    logMsg += `Drew ${drawCount}.`;
                    audioService.playBuff();
                    break;
            }
            newState.gameLog = [logMsg, ...newState.gameLog].slice(0,8);
            return newState;
        });
    };

    const endTurn = () => {
        if (gameResult) return;

        setGameState(prev => {
            let newState = { ...prev };
            const enemy = newState.enemies[0];
            
            if (enemy.currentHp > 0) {
                const dmg = enemy.attack;
                let remainingDmg = dmg;
                const targetIdx = Math.floor(Math.random() * newState.players.length);
                const target = newState.players[targetIdx];
                
                if (target.defense >= remainingDmg) {
                    target.defense -= remainingDmg;
                    remainingDmg = 0;
                } else {
                    remainingDmg -= target.defense;
                    target.defense = 0;
                    target.currentHp -= remainingDmg;
                }
                
                newState.gameLog = [`${enemy.name} hits ${target.name} for ${dmg}!`, ...newState.gameLog].slice(0,8);
            }

            newState.tempAttackBuff = 0;
            newState.maxMana = Math.min(10, newState.maxMana + 1);
            newState.mana = newState.maxMana;
            newState.turn += 1;
            return newState;
        });

        setTimeout(() => drawCards(5), 500);
    };

    return (
        <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden relative ${isShaking ? 'animate-shake' : ''}`}>
            <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} data={dmgStats} />

            {/* VICTORY SCREEN OVERLAY */}
            {gameResult === 'victory' && (
                <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-1000">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-4 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
                        MISSION ACCOMPLISHED
                    </h1>
                    <p className="text-slate-400 tracking-widest uppercase mb-8">Target Neutralized // Area Secure</p>
                    <button 
                        onClick={() => onExit('victory')}
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg transition-all"
                    >
                        RETURN TO MAP
                    </button>
                </div>
            )}

            {/* TOP NAVIGATION BAR */}
            <header className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-40 fixed top-0 w-full">
                <div className="flex items-center gap-2">
                    <Users className="text-cyan-400" />
                    <h1 className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        CHARM ENFORCERS
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2 bg-slate-800 px-4 py-1 rounded-full border border-slate-700">
                        <span className="text-xs text-slate-400 uppercase">Mana</span>
                        <div className="flex gap-1">
                            {[...Array(gameState.maxMana)].map((_, i) => (
                                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < gameState.mana ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110' : 'bg-slate-700'}`}></div>
                            ))}
                        </div>
                        <span className="font-mono text-cyan-400 ml-2 font-bold">{gameState.mana}/{gameState.maxMana}</span>
                    </div>

                    <div className="text-xl font-bold text-slate-500">TURN {gameState.turn}</div>
                    
                    <div className="flex gap-2">
                         <button onClick={() => setIsStatsOpen(true)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                            <BarChart2 size={20}/>
                        </button>
                        <button onClick={() => onExit('surrender')} className="p-2 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400">
                            <LogOut size={20}/>
                        </button>
                    </div>
                </div>
            </header>

            {/* GAME LAYOUT */}
            <div className="flex h-screen pt-14">
                
                {/* LEFT SIDEBAR - HERO HUD */}
                <div className="absolute left-0 top-20 z-30 flex flex-col gap-2 pl-0 transition-all">
                    <HeroStatusPanel character={gameState.players[0]} isFront={true} />
                    <HeroStatusPanel character={gameState.players[1]} isFront={false} />
                    
                    {/* Skill Buttons */}
                    <div className="w-56 pl-4 mt-4 space-y-2">
                         {gameState.players.map(hero => (
                            <button 
                                key={`skill-${hero.id}`}
                                onClick={() => useHeroSkill(hero.id)}
                                disabled={gameState.mana < hero.skillCost || !!gameResult}
                                className={`
                                    w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-between border transition-all
                                    ${gameState.mana >= hero.skillCost && !gameResult
                                        ? `bg-slate-800/90 hover:bg-slate-700 hover:pl-4 border-${hero.color.split('-')[1]}-500 text-white shadow-lg` 
                                        : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'}
                                `}
                            >
                                <span className="flex items-center gap-2"><Sparkles size={14}/> {hero.skillName}</span>
                                <span className="bg-black/30 px-1.5 rounded font-mono">{hero.skillCost} Energy</span>
                            </button>
                         ))}
                    </div>
                </div>

                {/* RIGHT SIDEBAR - BOSS HUD & LOG */}
                <div className="absolute right-0 top-20 z-30 flex flex-col items-end pr-0">
                    {gameState.enemies[0] && gameState.enemies[0].currentHp > 0 && (
                        <EnemyStatusPanel enemy={gameState.enemies[0]} />
                    )}
                    
                    {/* Game Log Mini */}
                    <div className="mt-6 w-64 mr-4 bg-black/60 backdrop-blur rounded border border-slate-800 p-3 font-mono text-[10px] h-32 overflow-hidden flex flex-col-reverse">
                         {gameState.gameLog.map((log, i) => (
                            <div key={i} className={`truncate ${i===0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                                {'>'} {log}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CENTER - 3D VIEWPORT */}
                <div className="flex-1 relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-black">
                        <Suspense fallback={<div className="text-cyan-500 flex justify-center items-center h-full"><Loader2 className="animate-spin mr-2"/> Loading Battlefield...</div>}>
                            <Canvas shadows camera={{ position: [0.5, 3, 9.5], fov: 40 }}>
                                <BattleScene gameState={gameState} activeVFX={activeVFX} />
                                <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.2} />
                            </Canvas>
                        </Suspense>
                    </div>

                    {/* FORMATION TOGGLE */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
                         <button 
                            onClick={toggleFormation}
                            className="flex items-center gap-3 bg-slate-900/80 backdrop-blur hover:bg-slate-800 border border-cyan-900/50 px-6 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
                        >
                            {gameState.formation === FormationType.FrontBack ? (
                                <div className="flex flex-col gap-1 group-hover:gap-0.5 transition-all"><div className="w-6 h-1.5 bg-cyan-500 rounded-sm"></div><div className="w-6 h-1.5 bg-cyan-800 rounded-sm"></div></div>
                            ) : (
                                <div className="flex gap-1 group-hover:gap-2 transition-all"><div className="w-1.5 h-4 bg-cyan-500 rounded-sm"></div><div className="w-1.5 h-4 bg-cyan-800 rounded-sm"></div></div>
                            )}
                            <span className="text-sm font-bold text-cyan-100">
                                {gameState.formation === FormationType.FrontBack ? 'FORMATION: COLUMN' : 'FORMATION: SPREAD'}
                            </span>
                        </button>
                    </div>

                    {/* END TURN */}
                    <div className="absolute right-8 bottom-56 z-30">
                        <button 
                            onClick={endTurn}
                            disabled={!!gameResult}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
                        >
                            END TURN <ChevronRight />
                        </button>
                    </div>

                    {/* CARDS HAND */}
                    <div className="absolute bottom-0 left-0 w-full h-56 flex justify-center items-end pb-6 z-40 pointer-events-none">
                         {gameState.hand.map((card, index) => {
                             const rotation = (index - (gameState.hand.length - 1) / 2) * 4;
                             const translateY = Math.abs(index - (gameState.hand.length - 1) / 2) * 6;
                             const synergy = checkSynergy(gameState, card.ownerHeroId, card.type);
                             const cost = calculateCost(card.cost, card.ownerHeroId, card.type, gameState.formation);

                             return (
                                 <div 
                                    key={`${card.id}-${index}`}
                                    className="pointer-events-auto origin-bottom transition-all duration-200 hover:z-50 hover:scale-110 hover:-translate-y-10"
                                    style={{
                                        transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                                        marginLeft: index === 0 ? 0 : '-3.5rem'
                                    }}
                                 >
                                     <CardComponent 
                                        card={{...card, cost}} 
                                        isSelected={false}
                                        onClick={() => playCard(card)}
                                        disabled={gameState.mana < cost}
                                        synergyActive={synergy}
                                     />
                                 </div>
                             );
                         })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameScreen;

import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import DeckBuilder from './components/DeckBuilder';
import HeroSelection from './components/HeroSelection';
import ExplorationScreen from './components/ExplorationScreen';
import LoginScreen from './components/LoginScreen';
import { SavedDeck, AppScreen, Enemy } from './types';
import { INITIAL_SAVED_DECKS, PIRATE_MODEL_URL } from './constants';
import { supabase } from './services/supabase';

const App: React.FC = () => {
    // Initial screen is 'login', but we check session immediately
    const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
    
    // State for Deck Management
    const [savedDecks, setSavedDecks] = useState<SavedDeck[]>(() => INITIAL_SAVED_DECKS);

    // Game Initialization Data
    const [gameSetup, setGameSetup] = useState<{
        frontHeroId: string;
        backHeroId: string;
        frontDeckId: string;
        backDeckId: string;
    } | null>(null);

    // Exploration State
    const [defeatedEnemies, setDefeatedEnemies] = useState<string[]>([]);
    const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null);

    // Check for existing session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setCurrentScreen('menu');
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setCurrentScreen('menu');
            } else {
                setCurrentScreen('login');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSaveDeck = (deck: SavedDeck) => {
        setSavedDecks(prev => {
            const existingIndex = prev.findIndex(d => d.id === deck.id);
            if (existingIndex >= 0) {
                const newDecks = [...prev];
                newDecks[existingIndex] = deck;
                return newDecks;
            } else {
                return [...prev, deck];
            }
        });
    };

    const handleDeleteDeck = (deckId: string) => {
        setSavedDecks(prev => prev.filter(d => d.id !== deckId));
    };

    const handleStartMission = (frontHeroId: string, backHeroId: string, frontDeckId: string, backDeckId: string) => {
        setGameSetup({ frontHeroId, backHeroId, frontDeckId, backDeckId });
        // Start exploration instead of jumping straight to game
        setCurrentScreen('exploration');
    };

    const handleEncounter = (enemyId: string) => {
        // Config the enemy based on ID
        const isBoss = enemyId.includes('boss');
        const newEnemy: Enemy = {
            id: enemyId,
            name: isBoss ? 'Elite Guard' : 'Pirate Raider',
            maxHp: isBoss ? 300 : 120,
            currentHp: isBoss ? 300 : 120,
            attack: isBoss ? 20 : 10,
            defense: isBoss ? 30 : 5,
            charmThreshold: 100,
            maxCharmThreshold: 100,
            intelligence: isBoss ? 25 : 15,
            statuses: { isDisarmed: false, isBroken: false, confusedDuration: 0 },
            intent: 'Attack',
            nextMoveValue: isBoss ? 20 : 10,
            modelUrl: PIRATE_MODEL_URL
        };
        setActiveEnemy(newEnemy);
        setCurrentScreen('game');
    };

    const handleBattleExit = (result: 'victory' | 'defeat' | 'surrender') => {
        if (result === 'victory' && activeEnemy) {
            setDefeatedEnemies(prev => [...prev, activeEnemy.id]);
            setCurrentScreen('exploration');
        } else if (result === 'surrender') {
             setCurrentScreen('exploration');
        } else {
            // Defeat
            setCurrentScreen('menu');
            setDefeatedEnemies([]); // Reset run
        }
        setActiveEnemy(null);
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'login':
                return <LoginScreen onLoginSuccess={() => setCurrentScreen('menu')} />;
            case 'hero_selection':
                return (
                    <HeroSelection 
                        onBack={() => setCurrentScreen('menu')}
                        onStart={handleStartMission}
                        savedDecks={savedDecks}
                    />
                );
            case 'exploration':
                 return (
                     <ExplorationScreen 
                        frontHeroId={gameSetup?.frontHeroId || 'kayla'}
                        onEncounter={handleEncounter}
                        defeatedEnemies={defeatedEnemies}
                        onExit={() => setCurrentScreen('menu')}
                     />
                 );
            case 'game':
                const frontDeck = savedDecks.find(d => d.id === gameSetup?.frontDeckId);
                const backDeck = savedDecks.find(d => d.id === gameSetup?.backDeckId);
                
                return (
                    <GameScreen 
                        onExit={handleBattleExit} 
                        frontHeroId={gameSetup!.frontHeroId}
                        backHeroId={gameSetup!.backHeroId}
                        frontDeck={frontDeck!.cards}
                        backDeck={backDeck!.cards}
                        enemyData={activeEnemy!}
                    />
                );
            case 'deckbuilder':
                return (
                    <DeckBuilder 
                        onBack={() => setCurrentScreen('menu')} 
                        savedDecks={savedDecks}
                        onSaveDeck={handleSaveDeck}
                        onDeleteDeck={handleDeleteDeck}
                    />
                );
            case 'menu':
            default:
                return (
                    <MainMenu 
                        onStartGame={() => setCurrentScreen('hero_selection')}
                        onDeckBuilder={() => setCurrentScreen('deckbuilder')}
                    />
                );
        }
    };

    return (
        <>
            {renderScreen()}
        </>
    );
};

export default App;
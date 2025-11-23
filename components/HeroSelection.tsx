import React, { useState } from 'react';
import { ArrowLeft, Play, Shield, Zap, ChevronRight, Settings, X, RefreshCw } from 'lucide-react';
import { HEROES } from '../constants';
import { SavedDeck, Character } from '../types';

interface HeroSelectionProps {
    onBack: () => void;
    onStart: (frontHeroId: string, backHeroId: string, frontDeckId: string, backDeckId: string) => void;
    savedDecks: SavedDeck[];
}

interface DeckSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    heroId: string;
    currentDeckId: string | null;
    decks: SavedDeck[];
    onSelect: (deckId: string) => void;
}

const DeckSelectionModal: React.FC<DeckSelectionModalProps> = ({ isOpen, onClose, heroId, currentDeckId, decks, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic">Select Loadout</h2>
                        <p className="text-sm text-slate-400">Available configurations for {HEROES[heroId].name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
                    {decks.length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                            No decks found for this operator.
                        </div>
                    ) : (
                        decks.map(deck => (
                            <button
                                key={deck.id}
                                onClick={() => { onSelect(deck.id); onClose(); }}
                                className={`relative p-4 rounded-xl border text-left transition-all group ${
                                    currentDeckId === deck.id
                                        ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                        : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold ${currentDeckId === deck.id ? 'text-cyan-400' : 'text-white'}`}>
                                        {deck.name}
                                    </h3>
                                    {currentDeckId === deck.id && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]"></div>}
                                </div>
                                
                                <div className="text-xs text-slate-500 flex gap-3 font-mono">
                                    <span className="flex items-center gap-1"><Zap size={10}/> {deck.cards.filter(c => c.type === 'Destruction').length} ATK</span>
                                    <span className="flex items-center gap-1"><Shield size={10}/> {deck.cards.filter(c => c.type === 'Enhancement').length} DEF</span>
                                </div>
                                <div className="mt-3 text-[10px] text-slate-600 uppercase tracking-widest">
                                    {deck.cards.length} Modules
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const HeroSelection: React.FC<HeroSelectionProps> = ({ onBack, onStart, savedDecks }) => {
    const [frontHeroId, setFrontHeroIdState] = useState<string | null>(null);
    const [backHeroId, setBackHeroIdState] = useState<string | null>(null);
    const [frontDeckId, setFrontDeckId] = useState<string | null>(null);
    const [backDeckId, setBackDeckId] = useState<string | null>(null);

    // Modal State
    const [modalState, setModalState] = useState<{ isOpen: boolean, slot: 'front' | 'back' | null }>({ isOpen: false, slot: null });

    const heroes = Object.values(HEROES);

    const getDecksForHero = (heroId: string | null) => {
        if (!heroId) return [];
        return savedDecks.filter(d => d.heroId === heroId);
    };

    // Auto-select first deck logic
    const setFrontHeroId = (id: string) => {
        setFrontHeroIdState(id);
        const decks = getDecksForHero(id);
        if (decks.length > 0) setFrontDeckId(decks[0].id);
        else setFrontDeckId(null);
    };

    const setBackHeroId = (id: string) => {
        setBackHeroIdState(id);
        const decks = getDecksForHero(id);
        if (decks.length > 0) setBackDeckId(decks[0].id);
        else setBackDeckId(null);
    };

    const isHeroTaken = (id: string, currentSlot: 'front' | 'back') => {
        if (currentSlot === 'front') return id === backHeroId;
        if (currentSlot === 'back') return id === frontHeroId;
        return false;
    };

    const canStart = frontHeroId && backHeroId && frontDeckId && backDeckId;

    // Helper to render the Loadout Card
    const LoadoutCard = ({ deckId, heroId, slot }: { deckId: string | null, heroId: string, slot: 'front' | 'back' }) => {
        const decks = getDecksForHero(heroId);
        const currentDeck = decks.find(d => d.id === deckId);

        if (decks.length === 0) {
            return (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-lg text-yellow-500 text-xs text-center">
                    No loadouts found. Please create a deck first.
                </div>
            );
        }

        return (
            <div className="mt-6 bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors">
                <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Active Loadout</div>
                    <div className="font-bold text-white text-sm">{currentDeck?.name || 'Select Deck'}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{currentDeck?.cards.length || 0} Cards Configured</div>
                </div>
                <button 
                    onClick={() => setModalState({ isOpen: true, slot })}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all hover:scale-105"
                    title="Change Loadout"
                >
                    <RefreshCw size={16} />
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
            {/* Modal */}
            <DeckSelectionModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                heroId={modalState.slot === 'front' ? frontHeroId! : backHeroId!}
                currentDeckId={modalState.slot === 'front' ? frontDeckId : backDeckId}
                decks={getDecksForHero(modalState.slot === 'front' ? frontHeroId : backHeroId)}
                onSelect={(deckId) => modalState.slot === 'front' ? setFrontDeckId(deckId) : setBackDeckId(deckId)}
            />

            {/* Header */}
            <header className="h-20 border-b border-slate-800 flex items-center px-8 bg-slate-900 sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white mr-4">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-wider">Operation Setup</h1>
                    <p className="text-xs text-slate-500">Assign Enforcers and Equipment</p>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row gap-8 p-8 items-start justify-center overflow-y-auto">
                
                {/* FRONT LINE SLOT */}
                <div className="flex flex-col gap-4 w-full lg:w-1/3 max-w-md">
                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-sm">
                        <div className="w-2 h-8 bg-red-500"></div>
                        Front Line
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg transition-all hover:shadow-red-900/10">
                        <label className="text-xs text-slate-500 mb-4 block font-mono">SELECT ENFORCER</label>
                        <div className="grid grid-cols-2 gap-4">
                            {heroes.map(hero => {
                                const disabled = isHeroTaken(hero.id, 'front');
                                const selected = frontHeroId === hero.id;
                                return (
                                    <button
                                        key={hero.id}
                                        onClick={() => setFrontHeroId(hero.id)}
                                        disabled={disabled}
                                        className={`
                                            relative p-2 rounded-xl border flex flex-col items-center gap-3 transition-all
                                            ${selected ? 'bg-red-950/30 border-red-500 shadow-lg scale-105 z-10' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-600'}
                                            ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : ''}
                                        `}
                                    >
                                        {/* 1:2 Aspect Ratio Container */}
                                        <div className="w-20 h-40 rounded-full overflow-hidden border border-slate-700 shadow-inner relative bg-black group">
                                            <img src={hero.avatarUrl} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                            {selected && <div className="absolute inset-0 bg-red-500/10 ring-4 ring-inset ring-red-500 rounded-full"></div>}
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wide ${selected ? 'text-white' : 'text-slate-500'}`}>
                                            {hero.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Auto-Selected Loadout Display */}
                        {frontHeroId && (
                            <LoadoutCard deckId={frontDeckId} heroId={frontHeroId} slot="front" />
                        )}
                    </div>
                </div>

                {/* CENTER PILLAR */}
                <div className="hidden lg:flex flex-col items-center justify-center gap-4 opacity-30 self-center">
                    <div className="w-px h-32 bg-gradient-to-b from-transparent via-slate-400 to-transparent"></div>
                    <Shield size={48} />
                    <div className="w-px h-32 bg-gradient-to-b from-transparent via-slate-400 to-transparent"></div>
                </div>

                {/* BACK LINE SLOT */}
                <div className="flex flex-col gap-4 w-full lg:w-1/3 max-w-md">
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-sm justify-end">
                        Back Line
                        <div className="w-2 h-8 bg-blue-500"></div>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg transition-all hover:shadow-blue-900/10">
                        <label className="text-xs text-slate-500 mb-4 block font-mono text-right">SELECT ENFORCER</label>
                        <div className="grid grid-cols-2 gap-4" dir="rtl">
                            {heroes.map(hero => {
                                const disabled = isHeroTaken(hero.id, 'back');
                                const selected = backHeroId === hero.id;
                                return (
                                    <button
                                        key={hero.id}
                                        onClick={() => setBackHeroId(hero.id)}
                                        disabled={disabled}
                                        className={`
                                            relative p-2 rounded-xl border flex flex-col items-center gap-3 transition-all
                                            ${selected ? 'bg-blue-950/30 border-blue-500 shadow-lg scale-105 z-10' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-600'}
                                            ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : ''}
                                        `}
                                        dir="ltr"
                                    >
                                        {/* 1:2 Aspect Ratio Container */}
                                        <div className="w-20 h-40 rounded-full overflow-hidden border border-slate-700 shadow-inner relative bg-black group">
                                            <img src={hero.avatarUrl} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                            {selected && <div className="absolute inset-0 bg-blue-500/10 ring-4 ring-inset ring-blue-500 rounded-full"></div>}
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wide ${selected ? 'text-white' : 'text-slate-500'}`}>
                                            {hero.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Auto-Selected Loadout Display */}
                        {backHeroId && (
                             <LoadoutCard deckId={backDeckId} heroId={backHeroId} slot="back" />
                        )}
                    </div>
                </div>
            </main>

            <footer className="p-8 bg-slate-900/50 border-t border-slate-800 flex justify-center backdrop-blur-sm sticky bottom-0 z-20">
                <button
                    onClick={() => canStart && onStart(frontHeroId!, backHeroId!, frontDeckId!, backDeckId!)}
                    disabled={!canStart}
                    className={`
                        relative group overflow-hidden flex items-center gap-4 px-16 py-4 rounded-2xl text-xl font-black tracking-[0.2em] transition-all duration-300
                        ${canStart 
                            ? 'bg-cyan-600 text-white shadow-[0_0_40px_rgba(8,145,178,0.4)] hover:scale-105 hover:bg-cyan-500' 
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}
                    `}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    START MISSION
                    <ChevronRight className={`transition-transform ${canStart ? 'group-hover:translate-x-2' : ''}`} />
                </button>
            </footer>
        </div>
    );
};

export default HeroSelection;
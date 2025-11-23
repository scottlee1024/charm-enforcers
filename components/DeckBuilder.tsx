import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Search, Filter, Shield, Zap, Plus, Trash2, Edit3, ChevronRight } from 'lucide-react';
import { HEROES, CARD_POOL } from '../constants';
import { Card, SavedDeck } from '../types';
import CardComponent from './CardComponent';

interface DeckBuilderProps {
    onBack: () => void;
    savedDecks: SavedDeck[];
    onSaveDeck: (deck: SavedDeck) => void;
    onDeleteDeck: (deckId: string) => void;
}

type BuilderStep = 'select_hero' | 'select_deck' | 'edit_deck';

const DeckBuilder: React.FC<DeckBuilderProps> = ({ onBack, savedDecks, onSaveDeck, onDeleteDeck }) => {
    const [step, setStep] = useState<BuilderStep>('select_hero');
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
    const [currentDeck, setCurrentDeck] = useState<SavedDeck | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- HANDLERS ---

    const handleHeroSelect = (heroId: string) => {
        setSelectedHeroId(heroId);
        setStep('select_deck');
    };

    const handleCreateNewDeck = () => {
        if (!selectedHeroId) return;
        const newDeck: SavedDeck = {
            id: `deck_${Date.now()}`,
            name: `New ${HEROES[selectedHeroId].name} Deck`,
            heroId: selectedHeroId,
            cards: []
        };
        setCurrentDeck(newDeck);
        setStep('edit_deck');
    };

    const handleEditDeck = (deck: SavedDeck) => {
        setCurrentDeck({ ...deck }); // Clone to avoid direct mutation until save
        setStep('edit_deck');
    };

    const handleSaveCurrentDeck = () => {
        if (currentDeck) {
            onSaveDeck(currentDeck);
            setStep('select_deck');
        }
    };

    const handleAddCard = (card: Card) => {
        if (!currentDeck) return;
        if (currentDeck.cards.length >= 30) return;
        
        // Create instance
        const newCardInstance = { ...card, id: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
        setCurrentDeck(prev => prev ? { ...prev, cards: [...prev.cards, newCardInstance] } : null);
    };

    const handleRemoveCard = (index: number) => {
        if (!currentDeck) return;
        const newCards = [...currentDeck.cards];
        newCards.splice(index, 1);
        setCurrentDeck(prev => prev ? { ...prev, cards: newCards } : null);
    };

    const handleNameChange = (name: string) => {
        setCurrentDeck(prev => prev ? { ...prev, name } : null);
    };

    // --- FILTERS ---

    const filteredCards = useMemo(() => {
        if (!selectedHeroId) return [];

        return CARD_POOL.filter(card => {
            if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Show Neutral + Specific Hero cards
            const isNeutral = !card.ownerHeroId;
            const isOwnedByHero = card.ownerHeroId === selectedHeroId;
            
            return isNeutral || isOwnedByHero;
        });
    }, [selectedHeroId, searchQuery]);

    const getHeroColor = (id: string) => {
        return HEROES[id]?.color || 'text-slate-500';
    };

    // --- RENDER STEPS ---

    // STEP 1: SELECT HERO
    if (step === 'select_hero') {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center pt-20 overflow-y-auto custom-scrollbar pb-20">
                 <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-white z-10">
                    <ArrowLeft size={20} /> Back to Menu
                </button>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                    ARMORY ACCESS
                </h1>
                <p className="text-slate-500 mb-12 uppercase tracking-widest text-sm">Select an Enforcer to configure</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
                    {Object.values(HEROES).map(hero => (
                        <button 
                            key={hero.id}
                            onClick={() => handleHeroSelect(hero.id)}
                            className="group relative w-64 h-96 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-2"
                        >
                            <img src={hero.avatarUrl} alt={hero.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 w-full p-6">
                                <div className={`text-sm font-bold uppercase tracking-widest mb-1 ${hero.color.split(' ')[0]}`}>{hero.role}</div>
                                <div className="text-3xl font-black text-white mb-2">{hero.name}</div>
                                <div className="h-1 w-12 bg-cyan-500 rounded-full group-hover:w-full transition-all duration-500"></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // STEP 2: SELECT DECK
    if (step === 'select_deck') {
        const heroDecks = savedDecks.filter(d => d.heroId === selectedHeroId);
        const hero = selectedHeroId ? HEROES[selectedHeroId] : null;

        return (
             <div className="h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
                <header className="h-20 bg-slate-900/80 border-b border-slate-800 flex items-center px-8 backdrop-blur-md sticky top-0 z-50 shrink-0">
                    <button onClick={() => setStep('select_hero')} className="mr-6 p-2 hover:bg-slate-800 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    {hero && (
                        <div className="flex items-center gap-4">
                            <img src={hero.avatarUrl} alt={hero.name} className="w-12 h-12 rounded-full border-2 border-slate-600 object-cover" />
                            <div>
                                <h1 className="text-xl font-bold text-white">{hero.name}'s Loadouts</h1>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Manage Deck Configurations</p>
                            </div>
                        </div>
                    )}
                </header>

                <main className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                        {/* Create New Button */}
                        <button 
                            onClick={handleCreateNewDeck}
                            className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500 hover:bg-slate-900/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                                <Plus size={24} />
                            </div>
                            <span className="font-bold text-slate-400 group-hover:text-white">Create New Deck</span>
                        </button>

                        {/* Existing Decks */}
                        {heroDecks.map(deck => (
                            <div key={deck.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-white mb-1">{deck.name}</h3>
                                        <p className="text-xs text-slate-500">{deck.cards.length} Cards</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteDeck(deck.id); }}
                                            className="p-2 hover:bg-red-900/50 text-slate-600 hover:text-red-400 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                     <div className="text-xs text-slate-500 grid grid-cols-2 gap-2">
                                        <span>ATK: {deck.cards.filter(c => c.type === 'Destruction').length}</span>
                                        <span>DEF: {deck.cards.filter(c => c.type === 'Enhancement').length}</span>
                                     </div>
                                </div>

                                <button 
                                    onClick={() => handleEditDeck(deck)}
                                    className="mt-6 w-full py-2 bg-slate-800 hover:bg-cyan-900/30 text-cyan-400 border border-slate-700 hover:border-cyan-500/50 rounded font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit3 size={16} /> EDIT DECK
                                </button>
                            </div>
                        ))}
                    </div>
                </main>
             </div>
        );
    }

    // STEP 3: EDIT DECK (The actual Builder)
    return (
        <div className="h-screen flex flex-col bg-slate-950 font-sans overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep('select_deck')} className="text-slate-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-8 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">DECK NAME:</span>
                        <input 
                            type="text" 
                            value={currentDeck?.name || ''}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="bg-transparent border-b border-slate-600 focus:border-cyan-500 text-white font-bold px-2 py-1 focus:outline-none w-64"
                            placeholder="Enter Deck Name..."
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search modules..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500 w-48"
                        />
                    </div>
                    <button 
                        onClick={handleSaveCurrentDeck}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                    >
                        <Save size={16} /> SAVE DECK
                    </button>
                </div>
            </header>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                
                {/* CARD POOL (Left) */}
                <div className="flex-1 bg-slate-950 flex flex-col min-w-0">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center shrink-0">
                        <h2 className="font-bold text-slate-400 flex items-center gap-2">
                            <Filter size={14} /> AVAILABLE MODULES
                        </h2>
                        <span className="text-xs text-slate-600 font-mono">{filteredCards.length} FOUND</span>
                    </div>
                    
                    {/* SCROLLABLE GRID AREA */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-32">
                            {filteredCards.map((card, idx) => (
                                <div key={`${card.id}_pool_${idx}`} className="group relative">
                                    <div className="transform transition-transform duration-200 group-hover:-translate-y-2">
                                        <CardComponent 
                                            card={card} 
                                            isSelected={false} 
                                            onClick={() => handleAddCard(card)} 
                                            disabled={false} 
                                            synergyActive={false} 
                                        />
                                    </div>
                                    <button 
                                        onClick={() => handleAddCard(card)}
                                        className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity rounded-xl"
                                    >
                                        <Plus size={32} className="text-green-400 drop-shadow-lg" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CURRENT DECK (Right Sidebar) */}
                <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-10 shrink-0 h-full">
                    <div className="p-4 bg-slate-800 border-b border-slate-700 shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-white text-sm">CURRENT LOADOUT</span>
                            <span className={`font-mono font-bold ${currentDeck!.cards.length >= 30 ? 'text-red-500' : 'text-cyan-400'}`}>
                                {currentDeck?.cards.length} / 30
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-cyan-400 h-full transition-all duration-300"
                                style={{ width: `${((currentDeck?.cards.length || 0) / 30) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar pb-20">
                        {currentDeck?.cards.length === 0 ? (
                            <div className="text-center py-12 text-slate-600 px-4">
                                <p className="text-sm mb-1">Loadout Empty</p>
                                <p className="text-xs">Click cards from the left panel to add them to this deck.</p>
                            </div>
                        ) : (
                            currentDeck?.cards.map((card, index) => (
                                <div 
                                    key={`${card.id}_deck_${index}`}
                                    onClick={() => handleRemoveCard(index)}
                                    className="relative group flex items-center gap-3 p-2 bg-slate-800 border border-slate-700 rounded hover:border-red-500/50 cursor-pointer transition-all hover:bg-red-900/10"
                                >
                                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
                                        {card.cost}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-200 truncate group-hover:text-red-200">{card.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase">{card.type}</div>
                                    </div>
                                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 text-red-400">
                                        <Trash2 size={14} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default DeckBuilder;
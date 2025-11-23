import React from 'react';
import { Card, CardType } from '../types';
import { Shield, Zap, Heart, Brain, RefreshCw, Lock } from 'lucide-react';

interface CardProps {
    card: Card;
    isSelected: boolean;
    onClick: () => void;
    disabled: boolean;
    synergyActive: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, isSelected, onClick, disabled, synergyActive }) => {
    
    const getTypeColor = (type: CardType) => {
        switch (type) {
            case CardType.Destruction: return 'border-red-500 bg-red-950/80';
            case CardType.Enhancement: return 'border-green-500 bg-green-950/80';
            case CardType.Energy: return 'border-yellow-500 bg-yellow-950/80';
            case CardType.Resource: return 'border-blue-500 bg-blue-950/80';
            case CardType.Conversion: return 'border-purple-500 bg-purple-950/80';
            case CardType.Control: return 'border-slate-400 bg-slate-800/90';
            default: return 'border-gray-500 bg-gray-900';
        }
    };

    const getTypeIcon = (type: CardType) => {
        switch (type) {
            case CardType.Destruction: return <Zap size={16} className="text-red-300" />;
            case CardType.Enhancement: return <Shield size={16} className="text-green-300" />;
            case CardType.Conversion: return <RefreshCw size={16} className="text-purple-300" />;
            case CardType.Control: return <Lock size={16} className="text-slate-300" />;
            case CardType.Resource: return <Brain size={16} className="text-blue-300" />;
            default: return <Heart size={16} />;
        }
    };

    return (
        <div 
            onClick={!disabled ? onClick : undefined}
            className={`
                relative w-40 h-56 rounded-xl border-2 flex flex-col p-2 select-none transition-all duration-200
                ${getTypeColor(card.type)}
                ${isSelected ? 'ring-4 ring-yellow-400 -translate-y-8 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'hover:-translate-y-4 hover:shadow-lg'}
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                ${synergyActive ? 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' : ''}
            `}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="bg-slate-900 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm border border-slate-600">
                    {card.cost}
                </div>
                <div className="text-xs font-bold uppercase tracking-tighter text-white/80">
                    {card.type}
                </div>
            </div>

            {/* Image Placeholder */}
            <div className="w-full h-20 bg-black/40 rounded-md mb-2 overflow-hidden border border-white/10 relative">
                 {/* Synergy Indicator */}
                 {synergyActive && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[0.6rem] px-1 rounded-bl-md">
                        SYNERGY
                    </div>
                )}
                <img 
                    src={`https://picsum.photos/seed/${card.id}/160/100`} 
                    alt={card.name} 
                    className="w-full h-full object-cover opacity-80" 
                />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow text-center">
                <h3 className="font-bold text-sm mb-1 text-white">{card.name}</h3>
                <p className="text-[0.65rem] text-slate-300 leading-tight">
                    {card.description}
                </p>
            </div>

            {/* Footer Icon */}
            <div className="mt-auto flex justify-center opacity-50">
                {getTypeIcon(card.type)}
            </div>
        </div>
    );
};

export default CardComponent;
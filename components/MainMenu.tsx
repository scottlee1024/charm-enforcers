import React from 'react';
import { Play, Layers, Shield, Cpu } from 'lucide-react';

interface MainMenuProps {
    onStartGame: () => void;
    onDeckBuilder: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onDeckBuilder }) => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
             
             {/* Animated Grid Background */}
             <div className="absolute inset-0 opacity-10" 
                  style={{ 
                      backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                  }}>
             </div>

             {/* Hero Graphic / Logo Area */}
             <div className="z-10 text-center mb-16 relative">
                 <div className="absolute -inset-10 bg-cyan-500/20 blur-3xl rounded-full"></div>
                 <div className="flex flex-col items-center justify-center relative">
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20"></div>
                        <Shield size={80} className="text-cyan-400 relative z-10" strokeWidth={1.5} />
                        <Cpu size={40} className="text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
                    </div>
                    
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-cyan-500 to-blue-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] mb-2">
                        CHARM ENFORCERS
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="h-px w-12 bg-slate-700"></div>
                        <h2 className="text-xl font-bold text-slate-400 tracking-[0.6em] uppercase">Operation Legends</h2>
                        <div className="h-px w-12 bg-slate-700"></div>
                    </div>
                 </div>
             </div>

             {/* Menu Options */}
             <div className="z-10 flex flex-col gap-6 w-full max-w-md px-6">
                 <button 
                    onClick={onStartGame}
                    className="group relative w-full px-8 py-5 bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                >
                    <div className="absolute inset-0 bg-cyan-400/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <Play className="text-cyan-400 fill-cyan-400" size={20} />
                    </div>
                    
                    <div className="relative flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-2xl text-cyan-100 tracking-wider group-hover:text-white">START MISSION</span>
                        </div>
                        <span className="text-xs text-cyan-500/70 font-mono group-hover:text-cyan-400">INITIATE BOSS ENCOUNTER SEQUENCE</span>
                    </div>
                 </button>

                 <button 
                    onClick={onDeckBuilder}
                    className="group relative w-full px-8 py-5 bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                >
                     <div className="absolute inset-0 bg-purple-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                     <div className="relative flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-2xl text-slate-300 tracking-wider group-hover:text-purple-200">DECK PROTOCOLS</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono group-hover:text-purple-400/80">MANAGE CARD LOADOUTS & SYNERGIES</span>
                    </div>
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-purple-500 transition-colors">
                        <Layers size={24} />
                    </div>
                 </button>
             </div>

             {/* Footer */}
             <div className="absolute bottom-8 text-slate-700 text-[10px] font-mono tracking-widest flex flex-col items-center gap-1">
                 <div>SYSTEM ID: CE-OP-L // SECURE CONNECTION ESTABLISHED</div>
                 <div>COPYRIGHT © 2025 ENFORCER CORPS</div>
             </div>
        </div>
    );
};

export default MainMenu;
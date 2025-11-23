import React, { useState } from 'react';
import { Shield, Key, User, ChevronRight, Lock, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Simulate network delay for effect
        setTimeout(() => {
            if (username === 'test' && password === '123') {
                onLoginSuccess();
            } else {
                setError('Invalid credentials. Access denied.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans text-slate-200">
            {/* Background Animations */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
            <div className="absolute inset-0 opacity-10" 
                  style={{ 
                      backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                  }}>
            </div>

            {/* Login Container */}
            <div className="z-10 w-full max-w-md p-8">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10 relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
                    <Shield size={64} className="text-cyan-400 mb-4 relative z-10" strokeWidth={1.5} />
                    <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
                        Charm Enforcers
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                         <span className="text-xs text-red-400 font-mono tracking-widest uppercase">System Locked</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 p-3">
                        <Lock size={16} className="text-slate-600" />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Operative ID</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setError(null); }}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                    placeholder="Enter username"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Passcode</label>
                            <div className="relative group">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={16} />
                                <span className="text-xs font-bold">{error}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`
                                w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg 
                                transition-all flex items-center justify-center gap-2 mt-4
                                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(8,145,178,0.4)]'}
                            `}
                        >
                            {isLoading ? (
                                <span className="animate-pulse">AUTHENTICATING...</span>
                            ) : (
                                <>
                                    ACCESS TERMINAL <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-mono">
                        RESTRICTED ACCESS // AUTHORIZED PERSONNEL ONLY<br/>
                        VERSION 2.5.0 // SECURE CONNECTION
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
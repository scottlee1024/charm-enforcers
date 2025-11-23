import React, { useState } from 'react';
import { Shield, Key, User, ChevronRight, Lock, AlertCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                // --- REGISTRATION LOGIC ---
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // Check if session was created immediately (Email confirmation disabled in Supabase)
                if (data.session) {
                    onLoginSuccess();
                } else {
                    // Email confirmation IS required
                    setMessage('Registration successful! Please check your email inbox to confirm your account before logging in.');
                    setIsSignUp(false); // Switch back to login mode so they can login after clicking email
                }
            } else {
                // --- LOGIN LOGIC ---
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    // Provide more helpful error messages
                    if (error.message.includes('Invalid login credentials')) {
                        throw new Error('Incorrect email or password. If you just registered, please verify your email address.');
                    }
                    throw error;
                }
                onLoginSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
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
                         <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                         <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase">Secure Network</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 p-3">
                        <Lock size={16} className="text-slate-600" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-6 text-center uppercase">
                        {isSignUp ? 'New Operative Registration' : 'Operative Login'}
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Frequency</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                    placeholder="agent@example.com"
                                    autoFocus
                                    required
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
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span className="text-xs font-bold leading-tight">{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="flex items-start gap-2 text-green-400 bg-green-950/30 p-3 rounded-lg border border-green-900/50 animate-in fade-in slide-in-from-top-1">
                                <Shield size={16} className="mt-0.5 shrink-0" />
                                <span className="text-xs font-bold leading-tight">{message}</span>
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
                                <>
                                    <Loader2 size={18} className="animate-spin" /> PROCESSING...
                                </>
                            ) : (
                                <>
                                    {isSignUp ? 'REGISTER IDENTITY' : 'ACCESS TERMINAL'} <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <button 
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono tracking-wide"
                        >
                            {isSignUp ? '<< RETURN TO LOGIN' : 'NEW RECRUIT? CREATE ID >>'}
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
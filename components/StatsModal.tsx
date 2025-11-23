import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatData {
    name: string;
    damage: number;
}

interface StatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: StatData[];
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-[600px] h-[400px] shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-white">Battle Statistics</h2>
                <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            />
                            <Bar dataKey="damage" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <button 
                    onClick={onClose}
                    className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default StatsModal;
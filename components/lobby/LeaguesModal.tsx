"use client";

import { Trophy, X, Medal, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface LeaguesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LeaguesModal({ isOpen, onClose }: LeaguesModalProps) {
    const router = useRouter();

    const leagues = [
        { id: 'gold-enamel', name: 'GOLD ENAMEL', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Trophy },
        { id: 'silver-shield', name: 'SILVER SHIELD', color: 'text-slate-300', bg: 'bg-slate-300/10', icon: Medal },
        { id: 'bronze-brush', name: 'BRONZE BRUSH', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Medal },
    ];

    // Navigation logic handled by selection grid


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-100 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 md:p-8"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 md:mb-12 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500 p-2 md:p-3 pixel-depth-sm">
                                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-black" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-5xl font-pixel text-white leading-none drop-shadow-[4px_4px_0_#000]">LEADERBOARD</h2>
                                <p className="text-[10px] md:text-xs font-pixel text-emerald-400 uppercase tracking-widest mt-1">Thy standing among legendary warriors</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="cartoon-btn p-2 md:p-4 bg-red-600 text-white"
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                    </div>

                    {/* Rankings List */}
                    <div className="flex-1 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto no-scrollbar pb-10">
                        <h3 className="font-pixel text-white/40 text-xs mb-4 uppercase tracking-[0.2em] text-center">Select Realm to View Rankings</h3>

                        <div className="grid gap-4">
                            {leagues.map((league) => (
                                <button
                                    key={league.id}
                                    onClick={() => {
                                        onClose();
                                        router.push(`/leagues/${league.id}`);
                                    }}
                                    className={`cartoon-card ${league.bg} p-6 flex items-center justify-between border-white/5 hover:border-white/20 transition-all group`}
                                >
                                    <div className="flex items-center gap-6">
                                        <league.icon className={`w-10 h-10 ${league.color}`} />
                                        <div className="text-left">
                                            <h4 className={`font-pixel text-2xl ${league.color} leading-none`}>{league.name}</h4>
                                            <p className="font-pixel text-[10px] text-white/40 uppercase mt-1">Combatants: Top 100 Warriors</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 p-8 border-4 border-dashed border-white/5 text-center">
                            <p className="font-pixel text-white/20 text-xs uppercase italic">Rankings reset every blood moon (seasonally)</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Zap, Star } from "lucide-react";
import { useFullscreen } from "@/hooks/useFullscreen";
import api from "@/lib/api";

interface LeaderboardEntry {
    _id: string;
    username: string;
    character: string;
    stats: {
        totalXP: number;
    };
}

export default function LeaguePage() {
    const { id } = useParams();
    const router = useRouter();
    const { forceFullscreen } = useFullscreen();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const leagueInfo = {
        'gold-enamel': { name: 'GOLD ENAMEL', color: 'text-yellow-400', border: 'border-yellow-400' },
        'silver-shield': { name: 'SILVER SHIELD', color: 'text-slate-300', border: 'border-slate-300' },
        'bronze-brush': { name: 'BRONZE BRUSH', color: 'text-orange-500', border: 'border-orange-500' },
    }[id as string] || { name: 'UNKNOWN LEAGUE', color: 'text-white', border: 'border-white' };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fix: Point to the correct endpoint
                const res = await api.get('/api/leaderboard');
                setLeaderboard(res.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, [id]);

    return (
        <div
            className="flex flex-col h-screen w-screen max-h-screen overflow-hidden p-4 md:p-8 relative bg-slate-950"
            onClick={forceFullscreen}
        >
            <nav className="flex justify-between items-center mb-6 md:mb-12 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/subjects")}
                        className="cartoon-btn p-2 md:p-3 bg-black/40 text-white"
                    >
                        <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <div>
                        <h2 className={`text-2xl md:text-5xl font-pixel ${leagueInfo.color} leading-none drop-shadow-[4px_4px_0_#000]`}>{leagueInfo.name} RANKINGS</h2>
                        <p className="text-[10px] md:text-xs font-pixel text-white/40 uppercase tracking-widest mt-1">Thy standing in the {leagueInfo.name} realm</p>
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-4xl mx-auto w-full space-y-2 md:space-y-4 overflow-y-auto no-scrollbar pb-10 px-2 mt-4">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="font-pixel text-white/20 animate-pulse uppercase tracking-[0.2em]">Consulting the Scrolls...</p>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <p className="text-center font-pixel text-white/40 uppercase mt-20">No warriors mapped yet...</p>
                ) : (
                    leaderboard.map((entry, idx) => (
                        <motion.div
                            key={entry._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`p-3 md:p-6 cartoon-card bg-black/40 flex items-center justify-between border-white/5 hover:${leagueInfo.border}/50 transition-colors ${idx < 3 ? 'scale-105 my-4' : ''}`}
                        >
                            <div className="flex items-center gap-3 md:gap-6">
                                <div className={`w-8 md:w-12 h-8 md:h-12 flex items-center justify-center font-pixel text-lg md:text-2xl ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-500' : 'text-white/40'
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div className="bg-black/60 p-2 md:p-3 pixel-depth-sm relative">
                                    {idx === 0 && <Star className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />}
                                    <Medal className={`w-5 h-5 md:w-8 md:h-8 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-500' : 'text-white/20'
                                        }`} />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-xl font-pixel text-white uppercase">{entry.username}</h3>
                                    <p className="text-[8px] md:text-[10px] font-pixel text-white/40 uppercase tracking-tighter">{entry.character || "Recruit"}</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-2 md:gap-4">
                                <Zap className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                                <p className="text-xs md:text-2xl font-pixel text-yellow-400">{entry.stats?.totalXP?.toLocaleString() || 0} XP</p>
                            </div>
                        </motion.div>
                    ))
                )}

                <div className="p-8 text-center bg-black/20 border-4 border-dashed border-white/10 mt-12 mb-10">
                    <p className="font-pixel text-white/30 text-[8px] md:text-sm uppercase italic">Battle on to ascend the ranks</p>
                </div>
            </div>
        </div>
    );
}

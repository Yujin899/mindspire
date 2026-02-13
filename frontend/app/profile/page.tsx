"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Zap, Calendar, Medal, Swords } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useFullscreen } from "@/hooks/useFullscreen";
import api from "@/lib/api";

export default function ProfilePage() {
    const router = useRouter();
    const { } = useAuthStore();
    const { forceFullscreen } = useFullscreen();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setUser(res.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const stats = [
        { label: "TOTAL XP", value: user?.stats?.totalXP?.toLocaleString() || "0", icon: Zap, color: "text-yellow-400" },
        { label: "STREAK", value: `${user?.stats?.currentStreak || 0} DAYS`, icon: Calendar, color: "text-orange-400" },
        { label: "RANK", value: `RECRUIT #${(user?._id || "").slice(-4).toUpperCase()}`, icon: Medal, color: "text-blue-400" },
        { label: "LEAGUE", value: "GOLD ENAMEL", icon: Trophy, color: "text-emerald-400" },
    ];

    if (isLoading) {
        return (
            <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
                <p className="font-pixel text-white/20 animate-pulse tracking-widest">ACCESSING DOSSIER...</p>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col h-screen w-screen max-h-screen overflow-hidden p-4 md:p-8 relative bg-slate-950"
            onClick={forceFullscreen}
        >
            {/* Header */}
            <nav className="flex justify-between items-center mb-6 md:mb-12 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/subjects")}
                        className="cartoon-btn p-2 md:p-3 bg-black/40 text-white"
                    >
                        <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <div>
                        <h2 className="text-2xl md:text-5xl font-pixel text-yellow-400 leading-none drop-shadow-[4px_4px_0_#000]">WARRIOR PROFILE</h2>
                        <p className="text-[10px] md:text-xs font-pixel text-white/40 uppercase tracking-widest mt-1">Thy progress through the academy</p>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto w-full overflow-y-auto no-scrollbar pb-10 px-2 mt-10">
                {/* Left Side: Avatar & Identity */}
                <div className="w-full md:w-1/3 flex flex-col items-center text-center space-y-6 shrink-0">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-64 md:h-64 bg-black/40 pixel-depth flex items-center justify-center relative overflow-hidden">
                            <div className="tooth-hero scale-150 md:scale-[3.5] mt-4" />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-pixel px-4 py-2 text-xs md:text-sm pixel-depth-sm">
                            LEVEL {Math.floor((user?.stats?.totalXP || 0) / 100) + 1}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl md:text-5xl font-pixel text-white uppercase">{user?.username}</h3>
                        <p className="text-xs md:text-lg font-pixel text-white/40 uppercase tracking-widest">{user?.character || "ACADEMY RECRUIT"}</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/60 p-4 pixel-depth-sm">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="bg-black/60 p-4 pixel-depth-sm">
                            <Swords className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Detailed Stats */}
                <div className="flex-1 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="cartoon-card bg-black/40 border-white/5 p-4 md:p-8 flex flex-col items-center justify-center text-center gap-2 md:gap-4"
                            >
                                <stat.icon className={`w-6 h-6 md:w-12 md:h-12 ${stat.color}`} />
                                <span className="text-[8px] md:text-xs font-pixel text-white/40 uppercase">{stat.label}</span>
                                <span className="text-sm md:text-3xl font-pixel text-white">{stat.value}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="cartoon-card bg-black/40 border-white/5 p-6 md:p-10">
                        <h4 className="font-pixel text-white text-xs md:text-lg mb-6 uppercase border-b-2 border-white/10 pb-4 flex items-center gap-4">
                            <Zap className="w-5 h-5 text-yellow-400" /> RECENT ACHIEVEMENTS
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between opacity-50 italic">
                                <span className="font-pixel text-white text-[10px] md:text-sm uppercase">Plaque Destroyer I</span>
                                <span className="font-pixel text-white/40 text-[8px] md:text-xs tracking-tighter uppercase">LOCKED</span>
                            </div>
                            <div className="flex items-center justify-between opacity-50 italic">
                                <span className="font-pixel text-white text-[10px] md:text-sm uppercase">Enamel Guard</span>
                                <span className="font-pixel text-white/40 text-[8px] md:text-xs tracking-tighter uppercase">LOCKED</span>
                            </div>
                            <p className="text-center font-pixel text-white/20 text-[8px] md:text-[10px] uppercase mt-4">Continue thy journey to unlock feats</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

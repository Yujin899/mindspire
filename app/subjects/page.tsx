"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, Swords, Trophy, BookOpen, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useFullscreen } from "@/hooks/useFullscreen";
import api from "@/lib/api";
import SubjectsModal from "@/components/lobby/SubjectsModal";
import LeaguesModal from "@/components/lobby/LeaguesModal";

interface UserStats {
    username: string;
    character: string;
    role: string;
    stats: {
        totalXP: number;
        currentStreak: number;
    };
}

export default function SubjectsPage() {
    const router = useRouter();
    const { subjects, fetchSubjects } = useQuizStore();
    const { user, logout } = useAuthStore();
    const { forceFullscreen } = useFullscreen();

    const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
    const [isLeaguesOpen, setIsLeaguesOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const [userStats, setUserStats] = useState<UserStats | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setUserStats(res.data);
            } catch (err) {
                console.error("Failed to fetch user stats", err);
            }
        };
        fetchUserData();
        fetchSubjects();
    }, [fetchSubjects]);

    const currentXP = userStats?.stats?.totalXP || 0;
    const currentLevel = Math.floor(currentXP / 100) + 1;
    const xpToNext = (currentLevel) * 100;

    const handleSubjectClick = (subjectId: string) => {
        router.push(`/subjects/${subjectId}/quizzes`);
    };

    return (
        <div
            className="flex flex-col h-screen w-screen max-h-screen overflow-hidden p-4 md:p-8 relative"
            onClick={forceFullscreen}
        >
            {/* Background Decor - Optional but adds game feel */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

            <nav className="flex justify-between items-center mb-4 md:mb-8 shrink-0 relative z-10">
                <button
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-3 md:gap-4 bg-black/40 px-3 md:px-6 py-1 md:py-2 pixel-depth-sm hover:bg-black/60 transition-colors"
                >
                    <div className="tooth-hero scale-[0.3] md:scale-50" />
                    <div className="flex flex-col items-start">
                        <span className="font-pixel text-white text-[8px] md:text-[10px] uppercase text-left">{user?.username}</span>
                        <span className="font-pixel text-yellow-400 text-[6px] md:text-[8px] uppercase text-left">{user?.character || "Recruit"}</span>
                    </div>
                </button>

                <div className="flex items-center gap-2 md:gap-4">
                    {(userStats?.role === 'admin' || user?.role === 'admin') && (
                        <button
                            onClick={() => router.push("/admin")}
                            className="bg-slate-800 text-white px-3 py-1.5 md:px-4 md:py-2 text-[8px] md:text-[10px] flex items-center gap-2 border-b-4 border-slate-950 hover:bg-slate-700 transition-all font-pixel"
                        >
                            <ShieldAlert className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" /> DM PANEL
                        </button>
                    )}

                    <div className="bg-black/40 px-4 py-1.5 md:py-2 pixel-depth-sm flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[6px] md:text-[8px] font-pixel text-white/60 uppercase">Power Level</span>
                            <span className="text-[10px] md:text-sm font-pixel text-emerald-400 uppercase">LVL {currentLevel}</span>
                        </div>
                        <div className="h-4 md:h-6 w-[2px] bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[6px] md:text-[8px] font-pixel text-white/60 uppercase">Dental XP</span>
                            <span className="text-[10px] md:text-sm font-pixel text-yellow-400 uppercase">{currentXP.toLocaleString()} / {xpToNext.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="cartoon-btn px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white text-[8px] md:text-[10px] flex items-center gap-2"
                    >
                        <LogOut className="w-3 h-3 md:w-4 md:h-4" /> LOGOUT
                    </button>
                </div>
            </nav>

            {/* Central Stage - Refined for secondary actions */}
            <div className="flex-1 relative flex items-center justify-center">
                {/* Visual Flourish (kept for atmosphere) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] border-2 border-dashed border-white/5 rounded-full" />
                </motion.div>

                {/* Bottom Bar Actions */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end pb-4 md:pb-0">
                    <div className="flex gap-2 md:gap-4">
                        <button
                            onClick={() => setIsLeaguesOpen(true)}
                            className="cartoon-btn bg-emerald-600 text-white px-4 py-3 md:px-12 md:py-8 flex flex-col items-center gap-1 md:gap-2 group"
                        >
                            <Trophy className="w-5 h-5 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
                            <span className="font-pixel text-[8px] md:text-sm tracking-widest">LEAGUES</span>
                        </button>

                        <button
                            onClick={() => router.push("/mistakes")}
                            className="cartoon-btn bg-purple-600 text-white px-4 py-3 md:px-12 md:py-8 flex flex-col items-center gap-1 md:gap-2 group"
                        >
                            <BookOpen className="w-5 h-5 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
                            <span className="font-pixel text-[8px] md:text-sm tracking-widest uppercase">Mistakes</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsSubjectsOpen(true)}
                        className="cartoon-btn bg-yellow-400 text-black px-8 py-6 md:px-20 md:py-12 flex flex-col items-center gap-2 group shadow-[0_12px_0_#ca8a04] hover:shadow-[0_8px_0_#ca8a04] active:shadow-none translate-y-[-12px] active:translate-y-0 transition-all"
                    >
                        <Swords className="w-10 h-10 md:w-16 md:h-16 group-hover:rotate-12 transition-transform" />
                        <span className="font-pixel text-xl md:text-3xl tracking-tighter block translate-y-1">START BATTLE</span>
                        <span className="text-[8px] md:text-xs font-pixel opacity-60 uppercase mt-1">Select Realms</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            <SubjectsModal
                isOpen={isSubjectsOpen}
                onClose={() => setIsSubjectsOpen(false)}
                subjects={subjects}
                onSelectSubject={handleSubjectClick}
            />

            <LeaguesModal
                isOpen={isLeaguesOpen}
                onClose={() => setIsLeaguesOpen(false)}
            />
        </div>
    );
}

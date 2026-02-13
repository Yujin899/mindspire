"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useFullscreen } from "@/hooks/useFullscreen";

export default function QuizzesPage() {
    const { id } = useParams();
    const router = useRouter();
    const { quizzes, fetchQuizzes } = useQuizStore();
    const { user, logout } = useAuthStore();
    const { forceFullscreen } = useFullscreen();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    useEffect(() => {
        if (id) {
            fetchQuizzes(id as string);
        }
    }, [id, fetchQuizzes]);

    const handleQuizClick = (quizId: string) => {
        router.push(`/battle/${quizId}`);
    };

    return (
        <div
            className="flex flex-col h-screen w-screen max-h-screen overflow-hidden p-4 md:p-8"
            onClick={forceFullscreen}
        >
            <nav className="flex justify-between items-center mb-4 md:mb-8 shrink-0">
                <div className="flex items-center gap-2 md:gap-6">
                    <button
                        onClick={() => router.push("/subjects")}
                        className="cartoon-btn px-3 py-1.5 md:px-6 md:py-3 bg-white text-black text-[8px] md:text-xs"
                    >
                        &larr; BACK
                    </button>
                    <div className="flex items-center gap-2 md:gap-4 bg-black/40 px-3 md:px-6 py-1 md:py-2 pixel-depth-sm">
                        <div className="tooth-hero scale-[0.3] md:scale-50" />
                        <div className="flex flex-col">
                            <span className="font-pixel text-white text-[8px] md:text-[10px] uppercase">{user?.username}</span>
                            <span className="font-pixel text-yellow-400 text-[6px] md:text-[8px] uppercase">{user?.character || "Recruit"}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="cartoon-btn px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white text-[8px] md:text-[10px] flex items-center gap-2"
                >
                    <LogOut className="w-3 h-3 md:w-4 md:h-4" /> LOGOUT
                </button>
            </nav>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col min-h-0"
            >
                <div className="text-center mb-4 md:mb-12 shrink-0">
                    <h2 className="text-2xl md:text-6xl font-pixel text-yellow-400 drop-shadow-[2px_2px_0_#000] md:drop-shadow-[4px_4px_0_#000]">SELECT BATTLE</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto px-2">
                        {quizzes.map((quiz) => (
                            <button
                                key={quiz._id}
                                onClick={() => handleQuizClick(quiz._id)}
                                className="p-4 md:p-6 cartoon-card cartoon-card-dark cartoon-card-hover text-left flex items-center justify-between bg-slate-900/90"
                            >
                                <div className="flex-1 pr-4">
                                    <h3 className="text-lg md:text-xl font-pixel text-white mb-2 md:mb-4 leading-none">{quiz.title}</h3>
                                    <span className={cn(
                                        "text-[10px] px-3 py-1 pixel-depth-sm font-pixel",
                                        quiz.difficulty === "Easy" && "bg-green-600 text-white",
                                        quiz.difficulty === "Medium" && "bg-blue-600 text-white",
                                        quiz.difficulty === "Hard" && "bg-red-600 text-white"
                                    )}>
                                        {quiz.difficulty}
                                    </span>
                                </div>
                                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white/40" />
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

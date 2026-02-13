"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuizRunner from "@/components/gameplay/QuizRunner";
import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { useFullscreen } from "@/hooks/useFullscreen";



export default function BattlePage() {
    const { id } = useParams();
    const router = useRouter();
    const { questions, fetchQuestions, isLoading } = useQuizStore();
    const { user } = useAuthStore();

    const [currentSessionId, setCurrentSessionId] = useState<string>("");
    const [showBattleIntro, setShowBattleIntro] = useState(true);

    const userId = user?.id || "";

    // Enemy Name from Quiz Title
    const currentQuiz = useQuizStore.getState().quizzes.find(q => q._id === id);
    const enemyName = currentQuiz?.title?.toUpperCase() || "PLAQUE";

    const { forceFullscreen } = useFullscreen();

    useEffect(() => {
        if (id) {
            fetchQuestions(id as string);

            // Sequence: VS Intro -> Quiz
            const introTimer = setTimeout(() => {
                setShowBattleIntro(false);
                const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                setCurrentSessionId(newSessionId);
            }, 2500);

            return () => clearTimeout(introTimer);
        }
    }, [id, fetchQuestions]);

    return (
        <div
            className="h-screen w-screen flex flex-col relative overflow-hidden"
            onClick={forceFullscreen}
        >
            <AnimatePresence>
                {showBattleIntro && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-300 bg-black/80 backdrop-blur-sm flex items-center justify-center overflow-hidden"
                    >
                        <motion.div
                            initial={{ x: -600 }}
                            animate={{ x: 0 }}
                            className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-600/90 flex flex-col items-center justify-center border-r-4 md:border-r-8 border-white"
                        >
                            <span className="text-3xl sm:text-4xl md:text-8xl font-pixel text-white drop-shadow-[2px_2px_0_#000] md:drop-shadow-[4px_4px_0_#000] text-center px-2">{user?.username?.toUpperCase() || "HERO"}</span>
                        </motion.div>
                        <motion.div
                            initial={{ x: 600 }}
                            animate={{ x: 0 }}
                            className="absolute right-0 top-0 bottom-0 w-1/2 bg-red-600/90 flex flex-col items-center justify-center border-l-4 md:border-l-8 border-white"
                        >
                            <span className="text-3xl sm:text-4xl md:text-8xl font-pixel text-white drop-shadow-[2px_2px_0_#000] md:drop-shadow-[4px_4px_0_#000] text-center px-2">{enemyName}</span>
                        </motion.div>
                        <motion.div
                            initial={{ scale: 5, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="z-10 bg-black border-4 md:border-8 border-yellow-400 p-4 md:p-8"
                        >
                            <span className="text-5xl sm:text-6xl md:text-9xl font-pixel text-yellow-400 italic drop-shadow-[2px_2px_0_#000] md:drop-shadow-[4px_4px_0_#000]">VS</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            <div className="flex-1 relative overflow-hidden">
                {!showBattleIntro && questions.length > 0 && currentSessionId && (
                    <QuizRunner
                        userId={userId}
                        questions={questions}
                        sessionId={currentSessionId}
                        enemyName={enemyName}
                        playerName={user?.username?.toUpperCase()}
                        onExit={() => router.push(`/subjects/${id}/quizzes`)}
                    />
                )}
            </div>

            {isLoading && questions.length === 0 && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
                    <h3 className="text-2xl font-pixel text-yellow-400 animate-pulse">LOADING ARENA...</h3>
                </div>
            )}
        </div>
    );
}

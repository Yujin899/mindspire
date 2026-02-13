"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useFullscreen } from "@/hooks/useFullscreen";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Subject {
    _id: string;
    name: string;
}

interface Quiz {
    _id: string;
    title: string;
}

interface Question {
    _id: string;
    content: string; // Corrected from text to content to match model
    options: {
        id: string;
        text: string;
        isCorrect: boolean;
    }[];
    explanation?: string;
    userChoiceId: string;
}

export default function MistakesPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { forceFullscreen } = useFullscreen();
    const [mistakes, setMistakes] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ... (rest of the state and fetchers remain same)

    // Filter Stats
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await api.get('/api/subjects');
                setSubjects(res.data);
            } catch (err) {
                console.error("Failed to fetch subjects", err);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        if (selectedSubjectId) {
            const fetchQuizzes = async () => {
                try {
                    const res = await api.get(`/api/subjects/${selectedSubjectId}/quizzes`);
                    setQuizzes(res.data);
                    setSelectedQuizId(""); // Reset quiz when subject changes
                } catch (err) {
                    console.error("Failed to fetch quizzes", err);
                }
            };
            fetchQuizzes();
        } else {
            setQuizzes([]);
            setSelectedQuizId("");
        }
    }, [selectedSubjectId]);

    const fetchMistakes = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            let url = `/api/mistakes?userId=${user.id}`;
            if (selectedSubjectId) url += `&subjectId=${selectedSubjectId}`;
            if (selectedQuizId) url += `&quizId=${selectedQuizId}`;

            const res = await api.get(url);
            setMistakes(res.data);
        } catch (error) {
            console.error("Failed to fetch mistakes:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, selectedSubjectId, selectedQuizId]);

    useEffect(() => {
        fetchMistakes();
    }, [user?.id, selectedSubjectId, selectedQuizId, fetchMistakes]);

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
                        <h2 className="text-2xl md:text-5xl font-pixel text-purple-400 leading-none drop-shadow-[4px_4px_0_#000]">MISTAKES ARCADE</h2>
                        <p className="text-[10px] md:text-xs font-pixel text-white/40 uppercase tracking-widest mt-1">Review thy failures to achieve mastery</p>
                    </div>
                </div>

                <div className="bg-black/40 px-4 py-2 pixel-depth-sm flex items-center gap-3">
                    <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
                    <span className="text-xs md:text-xl font-pixel text-white">{mistakes.length} RECORDS</span>
                </div>
            </nav>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 mb-8 shrink-0 relative z-10">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-pixel text-purple-400/60 uppercase ml-2">Realm</span>
                    <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="cartoon-btn bg-black/60 text-white font-pixel text-xs md:text-sm px-4 py-2 outline-none border-none cursor-pointer appearance-none min-w-[150px]"
                    >
                        <option value="">All Realms</option>
                        {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {selectedSubjectId && (
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-pixel text-purple-400/60 uppercase ml-2">Expedition</span>
                        <select
                            value={selectedQuizId}
                            onChange={(e) => setSelectedQuizId(e.target.value)}
                            className="cartoon-btn bg-black/60 text-white font-pixel text-xs md:text-sm px-4 py-2 outline-none border-none cursor-pointer appearance-none min-w-[150px]"
                        >
                            <option value="">All Expeditions</option>
                            {quizzes.map(q => (
                                <option key={q._id} value={q._id}>{q.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {(selectedSubjectId || selectedQuizId) && (
                    <button
                        onClick={() => {
                            setSelectedSubjectId("");
                            setSelectedQuizId("");
                        }}
                        className="mt-auto mb-1 text-[10px] font-pixel text-white/40 hover:text-white transition-colors"
                    >
                        [RESET FILTERS]
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="font-pixel text-white/20 animate-pulse uppercase tracking-[0.2em]">Accessing Records...</p>
                    </div>
                ) : mistakes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <CheckCircle2 className="w-16 h-16 md:w-24 md:h-24 text-emerald-500 opacity-20" />
                        <h3 className="font-pixel text-white text-xl md:text-3xl uppercase">Flawless Victory</h3>
                        <p className="font-pixel text-white/40 text-[10px] md:text-sm">Thy record is clean. No mistakes found.</p>
                        <button
                            onClick={() => router.push("/subjects")}
                            className="cartoon-btn bg-yellow-400 text-black px-8 py-3 mt-4"
                        >
                            RETURN TO LOBBY
                        </button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 px-2">
                        {mistakes.map((question, idx) => {
                            return (
                                <motion.div
                                    key={question._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="cartoon-card bg-black/40 border-purple-500/30 p-4 md:p-8"
                                >
                                    <div className="flex items-start gap-4 mb-4 md:mb-6">
                                        <div className="bg-purple-600 p-2 md:p-3 pixel-depth-sm shrink-0 mt-1">
                                            <AlertCircle className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <h4 className="text-sm md:text-2xl font-pixel text-white leading-relaxed uppercase drop-shadow-md">
                                            {question.content}
                                        </h4>
                                    </div>

                                    <div className="ml-8 md:ml-16 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                            {question.options.map((option) => {
                                                const isUserChoice = option.id === question.userChoiceId;
                                                const isCorrect = option.isCorrect;

                                                let statusClass = "bg-white/5 border-white/10 text-white/40";
                                                if (isUserChoice && !isCorrect) statusClass = "bg-red-600/20 border-red-500 text-red-400";
                                                if (isCorrect) statusClass = "bg-emerald-600/20 border-emerald-500 text-emerald-400";

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className={cn(
                                                            "p-3 md:p-4 border-2 font-pixel text-[10px] md:text-sm flex items-center justify-between",
                                                            statusClass
                                                        )}
                                                    >
                                                        <span className="leading-tight">{option.text}</span>
                                                        <div className="flex gap-2">
                                                            {isUserChoice && !isCorrect && <span className="text-[8px] uppercase font-bold text-red-500">[CORRUPTED]</span>}
                                                            {isCorrect && <span className="text-[8px] uppercase font-bold text-emerald-500">[PURIFIED]</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {question.explanation && (
                                            <div className="bg-blue-600/10 border-l-4 border-blue-500 p-4 md:p-6 italic">
                                                <p className="text-[10px] md:text-sm font-sans text-blue-200 opacity-90">
                                                    <span className="font-pixel text-blue-400 block mb-2 not-italic text-xs">ELDER KNOWLEDGE:</span>
                                                    {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

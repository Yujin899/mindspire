"use client";

import { useState, useEffect } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import QuestionCard from "./QuestionCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFullscreen } from "@/hooks/useFullscreen";

interface Option {
    id: string;
    text: string;
    isCorrect?: boolean;
}

interface Question {
    _id: string;
    content: string;
    options: Option[];
}

interface QuizRunnerProps {
    userId: string;
    questions: Question[];
    sessionId: string;
    enemyName?: string;
    playerName?: string;
    onExit: () => void;
}

interface DamagePop {
    id: number;
    amount: number;
    isEnemy: boolean;
}

const DamageIndicator = ({ amount, isEnemy }: { amount: number; isEnemy: boolean }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 0 }}
        animate={{
            opacity: [0, 1, 1, 0],
            scale: [2, 3, 2],
            y: -150,
            x: isEnemy ? 40 : -40
        }}
        transition={{ duration: 0.8, ease: "anticipate" }}
        className={cn(
            "absolute pointer-events-none text-5xl font-pixel z-300 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]",
            isEnemy ? "text-rose-400" : "text-red-500"
        )}
        style={{ left: isEnemy ? "70%" : "30%", top: "45%" }}
    >
        -{amount}
    </motion.div>
);

const HealthBar = ({ hp, maxHp, isEnemy, name }: { hp: number; maxHp: number; isEnemy: boolean; name: string }) => {
    const percentage = Math.max(0, (hp / maxHp) * 100);
    return (
        <div className={cn(
            "flex flex-col gap-1 md:gap-2 w-full max-w-[140px] md:max-w-sm",
            isEnemy ? "items-end text-right" : "items-start text-left"
        )}>
            <div className="flex items-center gap-1 md:gap-2">
                {!isEnemy && <div className="tooth-hero scale-[0.15] md:scale-[0.25]" />}
                <div className="flex flex-col items-start min-w-0">
                    <span className="text-[8px] md:text-sm font-pixel text-black leading-none uppercase tracking-tighter truncate max-w-[80px] md:max-w-none">{name}</span>
                    <span className="text-[6px] md:text-[10px] font-pixel text-black/60 uppercase">{hp} / {maxHp} HP</span>
                </div>
                {isEnemy && <div className="plaque-boss scale-[0.12] md:scale-[0.2] rotate-12" />}
            </div>
            <div className="w-full h-3 md:h-7 bg-black pixel-depth-sm overflow-hidden relative">
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${percentage}%` }}
                    className={cn(
                        "h-full",
                        isEnemy ? "bg-rose-500 float-right" : "bg-emerald-500"
                    )}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
                <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-px h-full bg-black/20" />
                    ))}
                </div>
            </div>
        </div>
    );
};

type GamePhase = 'IDLE' | 'OPENING' | 'QUESTION' | 'RESOLVING' | 'CLOSING' | 'RESULTS';

interface AnswerRecord {
    question: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
}

const BattleResults = ({
    records,
    onExit,
    isWin
}: {
    records: AnswerRecord[];
    onExit: () => void;
    isWin: boolean;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-4 md:p-8 overflow-y-auto no-scrollbar"
    >
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className={cn(
                    "pixel-depth px-6 md:px-16 py-3 md:py-8 mb-6 md:mb-8 mt-6 md:mt-10 transform -rotate-2 w-full text-center",
                    isWin ? "bg-yellow-400 text-black" : "bg-red-600 text-white"
                )}
            >
                <h2 className="text-2xl sm:text-4xl md:text-7xl font-pixel uppercase drop-shadow-md leading-tight">
                    {isWin ? "MARRIOR VICTORIOUS" : "DEFEAT IN BATTLE"}
                </h2>
                <p className="font-pixel text-[8px] md:text-sm mt-2 opacity-80 uppercase tracking-widest">
                    {isWin ? "Thy teeth shine with holy light" : "The plaque has claimed this territory"}
                </p>
            </motion.div>

            <div className="w-full space-y-4 mb-12">
                <h3 className="font-pixel text-white/40 text-[10px] md:text-sm uppercase mb-4 tracking-widest text-center">Battle Log Summary</h3>
                {records.map((rec, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="cartoon-card bg-black/40 p-4 md:p-6 border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                    >
                        <div className="flex-1">
                            <h4 className="font-pixel text-white text-xs md:text-lg mb-2 leading-tight uppercase">{rec.question}</h4>
                            <div className="flex gap-4">
                                <span className="font-pixel text-[8px] md:text-xs text-white/40 uppercase">Thy Strike: <span className={rec.isCorrect ? "text-emerald-400" : "text-red-500"}>{rec.userAnswer}</span></span>
                                {!rec.isCorrect && (
                                    <span className="font-pixel text-[8px] md:text-xs text-emerald-400 uppercase italic">Truth: {rec.correctAnswer}</span>
                                )}
                            </div>
                        </div>
                        <div className={cn(
                            "pixel-depth-sm px-4 py-2 font-pixel text-[10px] md:text-sm uppercase shrink-0",
                            rec.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-500"
                        )}>
                            {rec.isCorrect ? "CRITICAL" : "MISS"}
                        </div>
                    </motion.div>
                ))}
            </div>

            <button
                onClick={onExit}
                className="cartoon-btn bg-blue-600 text-white px-12 md:px-20 py-4 md:py-8 text-xl md:text-4xl hover:bg-blue-500 mb-20 group"
            >
                <span className="relative z-10 font-pixel translate-y-1 block">RETURN TO LOBBY</span>
            </button>
        </div>
    </motion.div>
);

export default function QuizRunner({ userId, questions, sessionId, onExit, enemyName = "PLAQUE BOSS", playerName = "THY TOOTH" }: QuizRunnerProps) {
    const { submitAnswer, multiplier, lastResult, isLoading, error, clearLastResult } = useQuizStore();

    // State Machine
    const [phase, setPhase] = useState<GamePhase>('IDLE');

    // Card State: Infinite Deck Logic
    const [visibleCards, setVisibleCards] = useState<number[]>([]);
    const [deck, setDeck] = useState<number[]>([]);
    const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

    // Results Tracking
    const [battleLog, setBattleLog] = useState<AnswerRecord[]>([]);

    // Derived Animation State
    const isFlipped = ['QUESTION', 'RESOLVING'].includes(phase);

    // Fullscreen System
    const { isFullscreen, toggleFullscreen, forceFullscreen } = useFullscreen();

    // Game State
    const [answeredCount, setAnsweredCount] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Combat State
    const [maxEnemyHP, setMaxEnemyHP] = useState(questions.length || 100);
    const [maxPlayerHP, setMaxPlayerHP] = useState(Math.ceil(questions.length / 2) || 50);
    const [playerHP, setPlayerHP] = useState(Math.ceil(questions.length / 2) || 50);
    const [enemyHP, setEnemyHP] = useState(questions.length || 100);
    const [damagePop, setDamagePop] = useState<DamagePop | null>(null);
    const [shake, setShake] = useState(0);


    // Initialize Deck and HP on Mount
    useEffect(() => {
        // Dynamic HP
        const eHP = questions.length || 10;
        const pHP = Math.ceil(eHP / 2);
        setMaxEnemyHP(eHP);
        setEnemyHP(eHP);
        setMaxPlayerHP(pHP);
        setPlayerHP(pHP);

        // Create full deck of indices [0, 1, ... N]
        const allIndices = Array.from({ length: questions.length }, (_, i) => i);

        // Fisher-Yates Shuffle
        for (let i = allIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
        }

        setVisibleCards(allIndices.slice(0, 12));
        setDeck(allIndices.slice(12));
    }, [questions.length]);

    // Get current question based on activeCardIndex
    const currentQuestion = activeCardIndex !== null ? questions[activeCardIndex] : null;

    // 1. User Clicks Card -> Start OPENING
    const handleCardClick = (index: number) => {
        if (phase !== 'IDLE' || playerHP <= 0 || enemyHP <= 0) return;

        clearLastResult();
        setSelectedId(null);

        setActiveCardIndex(index);
        setPhase('OPENING');
    };

    // 2. User Selects Answer -> Optimistic Resolution
    const handleSelect = (choiceId: string) => {
        if (phase !== 'QUESTION' || !currentQuestion || !sessionId) return;

        setSelectedId(choiceId);
        setPhase('RESOLVING');

        const selectedOption = currentQuestion.options.find(o => o.id === choiceId);
        const correctOption = currentQuestion.options.find(o => o.isCorrect);
        const isCorrect = selectedOption?.isCorrect || false;

        // Record for results with fallback values
        setBattleLog(prev => [...prev, {
            question: currentQuestion.content,
            isCorrect,
            userAnswer: selectedOption?.text || "UNKNOWN",
            correctAnswer: correctOption?.text || "UNKNOWN"
        }]);

        if (isCorrect) {
            setEnemyHP(prev => Math.max(0, prev - 1));
            setDamagePop({ id: Date.now(), amount: 1, isEnemy: true });
            setShake(10);
        } else {
            setPlayerHP(prev => Math.max(0, prev - 1));
            setDamagePop({ id: Date.now(), amount: 1, isEnemy: false });
            setShake(25);
        }

        submitAnswer(userId, currentQuestion._id, choiceId, sessionId);

        setTimeout(() => {
            setPhase('CLOSING');
        }, 1500);
    };

    // 4. Handle CLOSING -> Reset to IDLE or RESULTS
    useEffect(() => {
        if (phase === 'CLOSING') {
            const resetTimer = setTimeout(() => {
                setShake(0);
                setDamagePop(null);

                if (activeCardIndex !== null) {
                    setVisibleCards(prev => {
                        const newHand = prev.filter(c => c !== activeCardIndex);
                        if (deck.length > 0) {
                            const [nextCard, ...remainingDeck] = deck;
                            setDeck(remainingDeck);
                            newHand.push(nextCard);
                        }
                        return newHand;
                    });
                }
                setActiveCardIndex(null);
                setSelectedId(null);
                setAnsweredCount(prev => prev + 1);

                // Check Game Over
                if (playerHP <= 0 || enemyHP <= 0 || (visibleCards.length <= 1 && deck.length === 0)) {
                    setPhase('RESULTS');
                } else {
                    setPhase('IDLE');
                }
            }, 600);

            return () => clearTimeout(resetTimer);
        }
    }, [phase, activeCardIndex, playerHP, enemyHP, deck, visibleCards.length]);

    if (phase === 'RESULTS') {
        return <BattleResults records={battleLog} onExit={onExit} isWin={enemyHP <= 0} />;
    }

    return (
        <motion.div
            animate={shake ? { x: [0, -shake, shake, -shake, shake, 0] } : {}}
            transition={{ duration: 0.4 }}
            onClick={forceFullscreen}
            className="relative flex flex-col items-center w-full h-screen max-h-screen py-0 md:py-8 px-4 overflow-hidden select-none"
        >
            {/* Combat HUD */}
            <div className="relative flex items-center justify-between w-full max-w-4xl px-2 md:px-4 py-1.5 md:py-3 bg-white/90 pixel-depth mb-2 md:mb-4 backdrop-blur-sm z-40">
                <HealthBar hp={playerHP} maxHp={maxPlayerHP} isEnemy={false} name={playerName} />
                <div className="flex flex-col items-center gap-1 mx-2">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors pixel-depth-sm text-white group"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5.5h4a.5.5 0 0 0 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5" />
                            </svg>
                        )}
                    </button>
                    <div className="bg-yellow-400 pixel-depth-sm px-3 py-1 mt-1">
                        <span className="text-xl font-pixel italic text-black leading-none">x{multiplier.toFixed(1)}</span>
                    </div>
                </div>
                <HealthBar hp={enemyHP} maxHp={maxEnemyHP} isEnemy={true} name={enemyName} />
            </div>

            <AnimatePresence>
                {damagePop && <DamageIndicator amount={damagePop.amount} isEnemy={damagePop.isEnemy} />}
            </AnimatePresence>

            {/* Card Grid */}
            <div className="w-full max-w-5xl flex-1 overflow-y-auto pb-10 md:pb-20 no-scrollbar">
                <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6 p-2">
                    <AnimatePresence mode="popLayout">
                        {visibleCards.map((cardIndex) => (
                            <motion.div
                                key={cardIndex}
                                layoutId={`card-${cardIndex}`}
                                onClick={() => handleCardClick(cardIndex)}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0, y: -100, rotate: 20 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "aspect-3/4 cursor-pointer bg-blue-500 pixel-depth-sm relative overflow-hidden group",
                                    activeCardIndex === cardIndex ? "opacity-0" : "opacity-100"
                                )}
                            >
                                <div className="absolute inset-0 bg-[url('/backgrounds/card-pattern.png')] opacity-20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="font-pixel text-4xl text-white/50 group-hover:text-white transition-colors">?</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Active Card Overlay */}
            <AnimatePresence>
                {activeCardIndex !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm" style={{ perspective: "1000px" }}>
                        <motion.div
                            layoutId={`card-${activeCardIndex}`}
                            className="w-full max-w-2xl h-full max-h-[92vh] md:max-h-[85vh] aspect-3/4 md:aspect-4/3 relative"
                            onLayoutAnimationComplete={() => {
                                if (phase === 'OPENING') {
                                    setPhase('QUESTION');
                                }
                            }}
                        >
                            <motion.div
                                className="w-full h-full relative"
                                style={{ transformStyle: "preserve-3d" }}
                                initial={{ rotateY: 0 }}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring" }}
                            >
                                {/* Front of Card */}
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-blue-600 pixel-depth"
                                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                                >
                                    <span className="font-pixel text-9xl text-white/20">?</span>
                                </div>

                                {/* Back of Card */}
                                <div
                                    className="absolute inset-0 bg-white pixel-depth p-6 md:p-8 flex flex-col overflow-y-auto no-scrollbar"
                                    style={{
                                        transform: "rotateY(180deg)",
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden"
                                    }}
                                >
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <div className="mb-6 flex justify-center sticky top-0 z-10">
                                            <div className="bg-yellow-400 px-4 py-1 pixel-depth-sm transform -rotate-1 shadow-sm">
                                                <span className="font-pixel text-black text-sm">QUESTION #{answeredCount + 1}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center">
                                            {currentQuestion && (
                                                <QuestionCard
                                                    question={currentQuestion.content}
                                                    options={currentQuestion.options}
                                                    onSelect={handleSelect}
                                                    disabled={isLoading || phase === 'RESOLVING'}
                                                    selectedId={selectedId}
                                                    correctId={lastResult?.correctChoiceId || null}
                                                />
                                            )}
                                        </div>

                                        {lastResult && selectedId && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={cn(
                                                    "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 pointer-events-none"
                                                )}
                                            >
                                                <div className={cn(
                                                    "px-8 py-4 pixel-depth transform rotate-[-5deg]",
                                                    lastResult.isCorrect ? "bg-emerald-500" : "bg-rose-500"
                                                )}>
                                                    <span className="text-4xl font-pixel text-white drop-shadow-md">
                                                        {lastResult.isCorrect ? "CORRECT!" : "WRONG!"}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {error && (
                <div className="fixed bottom-10 cartoon-card bg-red-600 px-8 py-4 text-white font-pixel z-50 text-xs">
                    {error}
                </div>
            )}
        </motion.div>
    );
}

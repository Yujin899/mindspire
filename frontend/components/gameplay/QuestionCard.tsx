"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface Option {
    id: string;
    text: string;
}

interface QuestionCardProps {
    question: string;
    options: Option[];
    onSelect: (id: string) => void;
    disabled?: boolean;
    selectedId?: string | null;
    correctId?: string | null;
}

export default function QuestionCard({ question, options, onSelect, disabled, selectedId, correctId }: QuestionCardProps) {

    return (
        <div className="w-full h-full flex flex-col gap-2 md:gap-6">
            {/* Main Question Display */}
            <div className="flex-1 flex items-center justify-center min-h-[60px] md:min-h-[100px] overflow-y-auto py-2">
                <h2 className="text-base md:text-3xl font-black text-black leading-tight text-center uppercase font-pixel tracking-wide px-2">
                    {question}
                </h2>
            </div>

            {/* Choices Grid - Internal Scroll */}
            <div className="grid grid-cols-1 gap-2 md:gap-3 pb-2 md:pb-4 overflow-y-auto max-h-[50vh] no-scrollbar">
                <AnimatePresence>
                    {options.map((option, index) => {
                        const isSelected = selectedId === option.id;
                        const isCorrect = correctId === option.id;
                        const isWrong = selectedId === option.id && correctId !== null && !isCorrect;
                        const showResult = correctId !== null;

                        let bgClass = "bg-white hover:bg-yellow-50";
                        if (isCorrect) bgClass = "bg-emerald-500 text-white";
                        else if (isWrong) bgClass = "bg-rose-500 text-white";
                        else if (isSelected) bgClass = "bg-blue-500 text-white";
                        else if (showResult && !isCorrect) bgClass = "bg-gray-100 opacity-50";

                        return (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => onSelect(option.id)}
                                disabled={disabled}
                                className={cn(
                                    "relative w-full p-4 pixel-depth-sm text-left transition-all group",
                                    bgClass,
                                    !disabled && !showResult && "active:translate-y-1 active:shadow-none"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 flex-shrink-0 flex items-center justify-center font-pixel text-sm border-2 border-black/20",
                                        isSelected || isCorrect || isWrong ? "bg-white/20 text-white" : "bg-black/10 text-black"
                                    )}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className={cn(
                                        "font-sans font-bold text-sm md:text-base uppercase leading-snug",
                                        (isSelected || isCorrect || isWrong) ? "text-white" : "text-black"
                                    )}>
                                        {option.text}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

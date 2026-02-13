"use client";

import { BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Subject {
    _id: string;
    name: string;
    description: string;
}

interface SubjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjects: Subject[];
    onSelectSubject: (id: string) => void;
}

export default function SubjectsModal({ isOpen, onClose, subjects, onSelectSubject }: SubjectsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="fixed inset-0 z-100 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 md:p-8"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 md:mb-12 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-400 p-2 md:p-3 pixel-depth-sm">
                                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-black" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-5xl font-pixel text-white leading-none drop-shadow-[4px_4px_0_#000]">SELECT REALM</h2>
                                <p className="text-[10px] md:text-xs font-pixel text-yellow-400 uppercase tracking-widest mt-1">Thy knowledge awaits</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="cartoon-btn p-2 md:p-4 bg-red-600 text-white"
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                    </div>

                    {/* Scrollable Grid */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto px-2">
                            {subjects.map((subject, idx) => {
                                const colors = ["bg-blue-600/90", "bg-emerald-600/90", "bg-purple-600/90"];
                                return (
                                    <button
                                        key={subject._id}
                                        onClick={() => onSelectSubject(subject._id)}
                                        className={cn(
                                            "group p-4 md:p-8 cartoon-card cartoon-card-hover flex flex-col items-center gap-3 md:gap-6 border-white/20 text-center",
                                            colors[idx % colors.length]
                                        )}
                                    >
                                        <div className="p-2 md:p-4 bg-black/40 pixel-depth-sm">
                                            <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg md:text-2xl font-pixel text-white mb-1 md:mb-4 leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] md:drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] uppercase">
                                                {subject.name}
                                            </h3>
                                            <p className="text-white font-sans text-xs md:text-lg italic drop-shadow-md">
                                                {subject.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

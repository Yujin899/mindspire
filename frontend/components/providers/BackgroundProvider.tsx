"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "bright" | "sunrise" | "sunset" | "night";

interface BackgroundContextType {
    theme: Theme;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const DENTAL_TIPS = [
    "Floss daily to remove plaque from between teeth where a toothbrush can't reach!",
    "Replace your toothbrush every 3-4 months or sooner if bristles are frayed.",
    "Brushing for at least 2 minutes twice a day is the gold standard.",
    "Limit sugary snacks to prevent plaque-causing bacteria from producing acid.",
    "Fluoride helps rebuild weakened tooth enamel and reverses early signs of tooth decay.",
    "A professional dental cleaning every 6 months is essential for oral health."
];

export const BackgroundProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [theme, setTheme] = useState<Theme>("bright");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentTip, setCurrentTip] = useState("");
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            const mobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
            setIsPortrait(mobile && window.innerHeight > window.innerWidth);
        };
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    useEffect(() => {
        // 1. Determine the page theme
        let newTheme: Theme = "bright";
        if (pathname === "/") {
            newTheme = "bright";
        } else if (pathname === "/login" || pathname === "/register") {
            newTheme = "sunset";
        } else if (pathname.startsWith("/battle")) {
            newTheme = "sunrise";
        } else if (pathname.startsWith("/subjects") || pathname.startsWith("/onboarding")) {
            newTheme = "bright";
        }

        // 2. Trigger "Night" Transition with Tip
        setTimeout(() => {
            setIsTransitioning(true);
            setCurrentTip(DENTAL_TIPS[Math.floor(Math.random() * DENTAL_TIPS.length)]);
        }, 0);

        const timer = setTimeout(() => {
            setTheme(newTheme);
            setIsTransitioning(false);
        }, 1500); // 1.5s of "Night" transition for better readability

        return () => clearTimeout(timer);
    }, [pathname]);

    const getBgStyle = (t: Theme) => {
        switch (t) {
            case "bright": return { backgroundImage: "url('/backgrounds/bright.png')" };
            case "sunrise": return { backgroundImage: "url('/backgrounds/sunrise.png')" };
            case "sunset": return { backgroundImage: "url('/backgrounds/sunset.png')" };
            case "night": return { backgroundImage: "url('/backgrounds/night.png')" };
            default: return { backgroundImage: "url('/backgrounds/bright.png')" };
        }
    };

    return (
        <BackgroundContext.Provider value={{ theme }}>
            <main
                className="h-screen w-screen relative overflow-hidden font-sans bg-cover bg-bottom bg-no-repeat transition-all duration-1000"
                style={getBgStyle(theme)}
            >
                <AnimatePresence>
                    {isTransitioning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[1000] bg-cover bg-bottom bg-no-repeat flex flex-col items-center justify-center p-8 text-center"
                            style={getBgStyle("night")}
                        >
                            <div className="max-w-4xl space-y-12">


                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-black/60 backdrop-blur-md border-4 border-white/10 p-10 pixel-depth-sm"
                                >
                                    <p className="font-pixel text-yellow-400 text-xs mb-6 uppercase tracking-widest opacity-70">
                                        ⚔️ DID YOU KNOW? ⚔️
                                    </p>
                                    <p className="text-2xl md:text-3xl font-pixel text-white leading-relaxed drop-shadow-md">
                                        {currentTip}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isTransitioning && children}

                {/* Global Orientation Guard */}
                <AnimatePresence>
                    {isPortrait && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] bg-blue-900 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="tooth-hero mb-8 scale-[2]" />
                            <h2 className="text-4xl font-pixel text-yellow-400 mb-6 drop-shadow-[4px_4px_0_#000]">
                                PLEASE ROTATE
                            </h2>
                            <div className="w-32 h-20 border-4 border-white rounded-lg flex items-center justify-center animate-bounce">
                                <div className="w-16 h-4 bg-white/30 rounded-full" />
                            </div>
                            <p className="font-pixel text-white text-sm mt-8 uppercase leading-loose">
                                This academy realm requires <br />
                                <span className="text-yellow-400">landscape mode</span> <br />
                                for the best dental experience!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => {
    const context = useContext(BackgroundContext);
    if (!context) throw new Error("useBackground must be used within BackgroundProvider");
    return context;
};

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Sparkles, Sword, Zap } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const CHARACTERS = [
    {
        name: "Bristle Knight",
        role: "Defender of Enamel",
        icon: <Shield className="w-12 h-12" />,
        color: "bg-blue-600",
        description: "Equipped with the Golden Scrub, he blocks plaque with ease.",
    },
    {
        name: "Floss Rogue",
        role: "Hidden Crack Seeker",
        icon: <Zap className="w-12 h-12" />,
        color: "bg-purple-600",
        description: "Speedy and precise, she cleans where others cannot reach.",
    },
    {
        name: "Paste Paladin",
        role: "Fluoride Infuser",
        icon: <Sparkles className="w-12 h-12" />,
        color: "bg-emerald-600",
        description: "Heals and fortifies thy teeth with holy minty essence.",
    },
    {
        name: "Rinse Ranger",
        role: "Liquid Sweeper",
        icon: <Sword className="w-12 h-12" />,
        color: "bg-rose-600",
        description: "A torrent of freshness that wipes out entire colonies of decay.",
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { updateUser } = useAuthStore();

    const handleSelect = async (characterName: string) => {
        try {
            await api.post("/api/auth/onboarding", { character: characterName });

            updateUser({ character: characterName });
            router.push("/subjects");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error saving character";
            alert(`${message}. Try again warrior!`);
        }
    };

    return (
        <div className="pt-10 px-4 max-w-7xl mx-auto h-full overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 mb-12"
            >
                <h2 className="text-4xl md:text-6xl font-pixel text-yellow-400 drop-shadow-[4px_4px_0_#000]">CHOOSE THY HERO</h2>
                <p className="font-pixel text-white text-xs uppercase tracking-widest">Thy identity in the dental arena starts here</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {CHARACTERS.map((char, idx) => (
                    <motion.button
                        key={char.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSelect(char.name)}
                        className={cn(
                            "group p-8 cartoon-card cartoon-card-hover flex flex-col items-center gap-6 border-white/20",
                            char.color
                        )}
                    >
                        <div className="p-4 bg-black/40 pixel-depth-sm group-hover:scale-110 transition-transform">
                            {char.icon}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-pixel text-white mb-2 leading-none uppercase drop-shadow-md">
                                {char.name}
                            </h3>
                            <p className="text-yellow-300 font-pixel text-[10px] uppercase mb-4 tracking-tighter">
                                {char.role}
                            </p>
                            <p className="text-white font-sans text-sm italic opacity-80 leading-relaxed">
                                {char.description}
                            </p>
                        </div>
                        <div className="mt-4 px-6 py-2 bg-white text-black font-pixel text-xs translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                            ENLIST
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

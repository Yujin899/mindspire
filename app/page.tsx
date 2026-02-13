"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handlePlay = () => {
    if (user) {
      router.push("/subjects");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden gap-8 md:gap-12 px-4 relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center relative z-10"
      >
        <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-pixel text-yellow-400 drop-shadow-[4px_4px_0_#000] md:drop-shadow-[8px_8px_0_#000] leading-none mb-4 uppercase">
          MINDSPIRE
        </h1>
        <div className="pixel-depth bg-blue-600 px-4 md:px-6 py-1 md:py-2 inline-block">
          <p className="text-[10px] sm:text-xs md:text-xl font-pixel text-white uppercase tracking-tight">
            DENTAL BATTLE ACADEMY
          </p>
        </div>
      </motion.div>

      <button
        onClick={handlePlay}
        className="cartoon-btn px-10 md:px-20 py-5 md:py-10 text-xl md:text-4xl hover:bg-yellow-300 group shadow-[0_10px_0_#ca8a04] md:shadow-[0_20px_0_#ca8a04] active:shadow-none active:translate-y-2 transition-all"
      >
        <span className="relative z-10 font-pixel translate-y-1 block md:translate-y-2">ENTER ARENA</span>
      </button>

      <p className="font-pixel text-white/40 text-[8px] md:text-[10px] uppercase mt-4 md:mt-12 animate-pulse">
        Waiting for combatants...
      </p>
    </div>
  );
}

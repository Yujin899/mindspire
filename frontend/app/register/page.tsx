"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await api.post("/api/auth/register", {
                username,
                password,
            });

            const data = response.data;
            setAuth(data.token, data.user);
            router.push("/onboarding");
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
            const message = axiosError.response?.data?.message || axiosError.message || "Registration failed warrior!";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen p-4 bg-slate-950 overflow-y-auto">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md cartoon-card bg-slate-900/90 p-6 md:p-12 relative my-12"
            >
                <div className="absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2 bg-emerald-500 pixel-depth px-4 md:px-8 py-2 md:py-4 z-10 w-max">
                    <span className="font-pixel text-white text-xs md:text-xl flex items-center gap-2 md:gap-4 whitespace-nowrap">
                        <UserPlus className="w-5 h-5 md:w-8 md:h-8" /> ENLIST HERO
                    </span>
                </div>

                {error && (
                    <div className="bg-red-600/20 border-4 border-red-600 p-2 md:p-4 mb-4 md:mb-6 mt-4">
                        <p className="font-pixel text-red-500 text-[10px] md:text-xs text-center uppercase">{error}</p>
                    </div>
                )}

                <form onSubmit={handleRegister} className="mt-8 space-y-4 md:space-y-8">
                    <div className="space-y-2 md:space-y-4">
                        <label className="block text-white font-pixel text-[8px] md:text-xs uppercase">Choose Thy Alias</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/40 border-2 md:border-4 border-white/20 p-3 md:p-4 font-pixel text-sm md:text-lg text-emerald-400 focus:border-emerald-400 outline-none transition-colors"
                            placeholder="USERNAME..."
                        />
                    </div>

                    <div className="space-y-2 md:space-y-4">
                        <label className="block text-white font-pixel text-[8px] md:text-xs uppercase">Battle Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border-2 md:border-4 border-white/20 p-3 md:p-4 font-pixel text-sm md:text-lg text-emerald-400 focus:border-emerald-400 outline-none transition-colors"
                            placeholder="****"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="cartoon-btn w-full py-4 md:py-6 text-xl md:text-2xl hover:bg-emerald-400 group flex items-center justify-center gap-2 md:gap-4 disabled:opacity-50"
                    >
                        <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
                        <span className="relative z-10 font-pixel translate-y-1 block">
                            {isLoading ? "WAITING..." : "CREATE"}
                        </span>
                    </button>
                </form>

                <button
                    onClick={() => router.push("/login")}
                    className="mt-8 w-full text-center font-pixel text-[10px] text-white/40 uppercase hover:text-white transition-colors"
                >
                    Already have an account? Login here
                </button>
            </motion.div>
        </div>
    );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

interface User {
    id: string;
    username: string;
    role: "student" | "admin";
    character: string | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: Record<string, string>) => Promise<void>;
    register: (details: Record<string, string>) => Promise<void>;
    logout: () => Promise<void>;
    fetchMe: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/api/auth/login', credentials);
                    set({ user: res.data.user, isAuthenticated: true });
                } finally {
                    set({ isLoading: false });
                }
            },
            register: async (details) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/api/auth/register', details);
                    set({ user: res.data.user, isAuthenticated: true });
                } finally {
                    set({ isLoading: false });
                }
            },
            logout: async () => {
                try {
                    await api.post('/api/auth/logout');
                } finally {
                    set({ user: null, isAuthenticated: false });
                }
            },
            fetchMe: async () => {
                try {
                    const res = await api.get('/api/auth/me');
                    set({ user: res.data, isAuthenticated: true });
                } catch {
                    set({ user: null, isAuthenticated: false });
                }
            },
            updateUser: (data) => set((state) => ({
                user: state.user ? { ...state.user, ...data } : null
            })),
        }),
        {
            name: "mindspire-auth",
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

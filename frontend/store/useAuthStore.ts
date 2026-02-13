import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string;
    username: string;
    role: "student" | "admin";
    character: string | null;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
            updateUser: (data) => set((state) => ({
                user: state.user ? { ...state.user, ...data } : null
            })),
        }),
        {
            name: "mindspire-auth",
        }
    )
);

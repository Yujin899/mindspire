"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
            router.push("/login");
        } else if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
            // If logged in and no character, force onboarding
            if (!user?.character) {
                router.push("/onboarding");
            } else {
                router.push("/subjects");
            }
        } else if (isAuthenticated && user && !user.character && pathname !== "/onboarding") {
            // Force onboarding if character is missing
            router.push("/onboarding");
        }
    }, [isAuthenticated, user, pathname, router]);

    return <>{children}</>;
};

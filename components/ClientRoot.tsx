"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import ThemeProvider from "./ThemeProvider";
import Sidebar from "./Sidebar";
import ChatPanel from "./ChatPanel";
import CallPip from "./CallPip";
import ToastContainer from "./Toast";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

function Loader() {
    return (
        <div style={{ background: "var(--bg-primary, #0f1117)", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
            </div>
        </div>
    );
}

export default function ClientRoot({ children }: { children: React.ReactNode }) {
    const user = useStore((s) => s.user);
    const chatOpen = useStore((s) => s.chatOpen);
    const pathname = usePathname();
    const router = useRouter();
    const [hydrated, setHydrated] = useState(false);
    const redirecting = useRef(false);

    // Zustand persist rehydrates on mount — wait one tick
    useEffect(() => {
        setHydrated(true);
    }, []);

    const isAuthPage = AUTH_ROUTES.includes(pathname);

    useEffect(() => {
        if (!hydrated || redirecting.current) return;

        if (!user && !isAuthPage) {
            redirecting.current = true;
            router.replace("/login");
            return;
        }

        if (user && isAuthPage) {
            redirecting.current = true;
            router.replace("/");
            return;
        }

        // Reset redirect flag when settled on correct page
        redirecting.current = false;
    }, [user, isAuthPage, hydrated, router]);

    // Auth pages always render — no auth needed
    if (isAuthPage) {
        return <ThemeProvider>{children}</ThemeProvider>;
    }

    // Show loader while checking auth state
    if (!hydrated || !user) {
        return <Loader />;
    }

    return (
        <ThemeProvider>
            <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
                <Sidebar />
                <main className="flex-1 overflow-hidden flex flex-col relative">
                    {children}
                    {chatOpen && <ChatPanel />}
                </main>
                <CallPip />
            </div>
            <ToastContainer />
        </ThemeProvider>
    );
}

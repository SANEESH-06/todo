"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GitBranch, Sun, Moon } from "lucide-react";
import { useStore } from "@/lib/store";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const login = useStore((s) => s.login);
    const theme = useStore((s) => s.theme);
    const setTheme = useStore((s) => s.setTheme);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Please fill in all fields."); return; }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        // Mock auth — any email/password works
        // admin@... emails get admin access
        login({
            id: "u1",
            name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            email,
            avatar: email.slice(0, 2).toUpperCase(),
            role: email.startsWith("admin") ? "Admin" : "Developer",
            isLoggedIn: true,
            isAdmin: email.startsWith("admin"),
        });
        setLoading(false);
        // Small delay to let zustand persist write before navigation
        await new Promise((r) => setTimeout(r, 50));
        router.replace("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
            {/* Theme toggle */}
            <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="fixed top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center border"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
                        <GitBranch size={20} color="#fff" />
                    </div>
                    <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Project Pipeline</span>
                </div>

                <div className="rounded-xl border p-6" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                    <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
                    <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Sign in to your account</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--text-secondary)" }}>
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-xs" style={{ color: "var(--accent)" }}>
                                Forgot password?
                            </Link>
                        </div>

                        {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity"
                            style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="text-center text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
                        Don't have an account?{" "}
                        <Link href="/signup" style={{ color: "var(--accent)" }}>Sign up</Link>
                    </p>
                </div>

                <p className="text-center text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
                    Demo: use any email & password to sign in
                </p>
            </div>
        </div>
    );
}

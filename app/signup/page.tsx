"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GitBranch } from "lucide-react";
import { useStore } from "@/lib/store";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const login = useStore((s) => s.login);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name || !email || !password) { setError("Please fill in all fields."); return; }
        if (password !== confirm) { setError("Passwords don't match."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        login({ id: `u${Date.now()}`, name, email, avatar: name.slice(0, 2).toUpperCase(), role: "Developer", isLoggedIn: true });
        setLoading(false);
        await new Promise((r) => setTimeout(r, 50));
        router.replace("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
                        <GitBranch size={20} color="#fff" />
                    </div>
                    <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Project Pipeline</span>
                </div>

                <div className="rounded-xl border p-6" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                    <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Create account</h1>
                    <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Start managing your projects</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Full name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name"
                                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Password</label>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }}>
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Confirm password</label>
                            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
                                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>

                        {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}

                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="text-center text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
                        Already have an account?{" "}
                        <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

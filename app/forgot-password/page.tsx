"use client";
import { useState } from "react";
import Link from "next/link";
import { GitBranch, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        setSent(true);
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
                    {sent ? (
                        <div className="flex flex-col items-center text-center gap-3 py-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(63,185,80,0.15)" }}>
                                <CheckCircle size={24} style={{ color: "var(--green)" }} />
                            </div>
                            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Check your email</h2>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                We've sent a reset link to <strong>{email}</strong>
                            </p>
                            <Link href="/login" className="text-sm font-medium mt-2" style={{ color: "var(--accent)" }}>
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Reset password</h1>
                            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                                Enter your email and we'll send you a reset link.
                            </p>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-2.5 rounded-lg text-sm font-medium"
                                    style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}>
                                    {loading ? "Sending..." : "Send reset link"}
                                </button>
                            </form>
                            <Link href="/login" className="flex items-center gap-1 justify-center text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
                                <ArrowLeft size={12} /> Back to sign in
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

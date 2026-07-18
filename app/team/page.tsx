"use client";
import TopNav from "@/components/TopNav";
import { Phone, Video, MessageSquare } from "lucide-react";

const members = [
    { name: "Aria Chen", role: "Product", avatar: "AC", color: "#7c3aed", status: "online", joined: "Jan 2024" },
    { name: "Noah Patel", role: "Engineer", avatar: "NP", color: "#58a6ff", status: "online", joined: "Feb 2024" },
    { name: "Mia Rossi", role: "Designer", avatar: "MR", color: "#f0883e", status: "away", joined: "Mar 2024" },
    { name: "Leo Wang", role: "UI Lead", avatar: "LW", color: "#3fb950", status: "online", joined: "Jan 2024" },
    { name: "Sara Khan", role: "DevOps", avatar: "SK", color: "#d29922", status: "offline", joined: "Apr 2024" },
];

export default function TeamPage() {
    return (
        <div className="flex flex-col h-full">
            <TopNav title="Team" subtitle="Your collaborators" />
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-2 gap-3 max-w-2xl">
                    {members.map((m) => (
                        <div
                            key={m.name}
                            className="p-4 rounded-lg border flex flex-col gap-3"
                            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                                        style={{ background: m.color, color: "#fff" }}
                                    >
                                        {m.avatar}
                                    </div>
                                    <div
                                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                                        style={{
                                            background: m.status === "online" ? "var(--green)" : m.status === "away" ? "var(--yellow)" : "#6b7280",
                                            borderColor: "var(--bg-card)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        {m.name}
                                    </div>
                                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {m.role} · since {m.joined}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs border"
                                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}
                                >
                                    <MessageSquare size={12} /> Message
                                </button>
                                <button
                                    className="w-8 h-7 flex items-center justify-center rounded border"
                                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}
                                >
                                    <Phone size={12} />
                                </button>
                                <button
                                    className="w-8 h-7 flex items-center justify-center rounded border"
                                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}
                                >
                                    <Video size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

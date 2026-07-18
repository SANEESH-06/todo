"use client";
import { useState } from "react";
import TopNav from "@/components/TopNav";
import { useRouter } from "next/navigation";
import { Plus, Phone, Video, Phone as PhoneIcon, Clock } from "lucide-react";

const colleagues = [
    { id: 1, name: "Aria Chen", role: "Product", status: "Online", avatar: "AC", color: "#7c3aed" },
    { id: 2, name: "Noah Patel", role: "Designer", status: "Online", avatar: "NP", color: "#58a6ff" },
    { id: 3, name: "Mia Rossi", role: "Engineer", status: "Away", avatar: "MR", color: "#f0883e" },
    { id: 4, name: "Leo Wang", role: "UI Lead", status: "Online", avatar: "LW", color: "#3fb950" },
    { id: 5, name: "Sara Khan", role: "DevOps", status: "Offline", avatar: "SK", color: "#d29922" },
];

const callHistory = [
    { id: 1, participants: "Aria, Noah", time: "1h ago, 29m", code: "abc·defg·hij", type: "video" },
    { id: 2, participants: "Mia", time: "4h ago, Missed", code: "ujp·mmb·lpc", type: "missed" },
    { id: 3, participants: "Leo, Sara", time: "Yesterday, 12m", code: "mxr·ady·add", type: "video" },
];

export default function MeetingsPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<number[]>([1]);
    const [code, setCode] = useState("");

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const startCall = (type: "voice" | "video") => {
        router.push(`/call?type=${type}`);
    };

    return (
        <div className="flex flex-col h-full">
            <TopNav title="Meeting room" subtitle="Start, join, or review calls" />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => startCall("video")}
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
                        style={{ background: "var(--accent)", color: "#fff" }}
                    >
                        <Plus size={14} /> New meeting
                    </button>
                    <button
                        onClick={() => startCall("voice")}
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border"
                        style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--bg-card)" }}
                    >
                        <Phone size={14} /> New voice call
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Invite colleagues */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                👥 Invite colleagues
                            </span>
                            <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
                            >
                                {selected.length} selected
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            {colleagues.map((c) => {
                                const isSelected = selected.includes(c.id);
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => toggleSelect(c.id)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer border transition-all"
                                        style={{
                                            background: isSelected ? "rgba(124,58,237,0.15)" : "var(--bg-card)",
                                            borderColor: isSelected ? "var(--accent)" : "var(--border)",
                                        }}
                                    >
                                        <div className="relative">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                                                style={{ background: c.color, color: "#fff" }}
                                            >
                                                {c.avatar}
                                            </div>
                                            <div
                                                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border"
                                                style={{
                                                    background:
                                                        c.status === "Online" ? "var(--green)" :
                                                            c.status === "Away" ? "var(--yellow)" : "#6b7280",
                                                    borderColor: "var(--bg-card)",
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                {c.name}
                                            </div>
                                            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                {c.role} · {c.status}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div
                                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ background: "var(--accent)" }}
                                            >
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Call selected */}
                        {selected.length > 0 && (
                            <div
                                className="mt-4 p-3 rounded-lg border"
                                style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
                            >
                                <div className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                                    Call selected ({selected.length})
                                </div>
                                <div className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                                    Share your device microphone and camera
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startCall("voice")}
                                        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm border"
                                        style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--bg-secondary)" }}
                                    >
                                        <Phone size={14} /> Voice
                                    </button>
                                    <button
                                        onClick={() => startCall("video")}
                                        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm"
                                        style={{ background: "var(--accent)", color: "#fff" }}
                                    >
                                        <Video size={14} /> Video
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Join by code + Call history */}
                    <div className="w-80 flex flex-col gap-4">
                        {/* Join by code */}
                        <div
                            className="p-4 rounded-lg border"
                            style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
                        >
                            <div className="flex gap-2">
                                <input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Enter code (abc·defg·hij)"
                                    className="flex-1 px-3 py-2 rounded-md text-sm outline-none"
                                    style={{
                                        background: "var(--bg-secondary)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-primary)",
                                    }}
                                />
                                <button
                                    className="px-3 py-2 rounded-md text-sm font-medium"
                                    style={{ background: "var(--accent)", color: "#fff" }}
                                >
                                    Join
                                </button>
                            </div>
                        </div>

                        {/* Call history */}
                        <div
                            className="p-4 rounded-lg border"
                            style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                    <Clock size={14} /> Call history
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {callHistory.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-start gap-3 p-2 rounded-md"
                                        style={{ background: "var(--bg-secondary)" }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                            style={{
                                                background: c.type === "missed" ? "rgba(248,81,73,0.2)" : "rgba(63,185,80,0.2)",
                                            }}
                                        >
                                            {c.type === "missed" ? (
                                                <PhoneIcon size={14} style={{ color: "var(--red)" }} />
                                            ) : (
                                                <Video size={14} style={{ color: "var(--green)" }} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                                {c.participants}
                                            </div>
                                            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                {c.time}
                                            </div>
                                            <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                                                {c.code}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

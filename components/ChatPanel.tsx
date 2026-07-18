"use client";
import { useState } from "react";
import { X, Send } from "lucide-react";
import { useStore } from "@/lib/store";

const contacts = [
    { id: 1, name: "Aria Chen", avatar: "AC", color: "#7c3aed", status: "online" },
    { id: 2, name: "Noah Patel", avatar: "NP", color: "#58a6ff", status: "online" },
    { id: 3, name: "Mia Rossi", avatar: "MR", color: "#f0883e", status: "away" },
    { id: 4, name: "Leo Wang", avatar: "LW", color: "#3fb950", status: "online" },
];

export default function ChatPanel() {
    const toggleChat = useStore((s) => s.toggleChat);
    const messages = useStore((s) => s.messages);
    const sendMessage = useStore((s) => s.sendMessage);
    const [activeId, setActiveId] = useState(1);
    const [input, setInput] = useState("");

    const active = contacts.find((c) => c.id === activeId)!;
    const msgs = messages[activeId] || [];

    const send = () => {
        if (!input.trim()) return;
        sendMessage(activeId, input);
        setInput("");
    };

    return (
        <div
            className="absolute bottom-4 right-4 w-80 flex flex-col rounded-xl border overflow-hidden shadow-xl z-50"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", height: "420px", boxShadow: "var(--shadow)" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Team Chat</span>
                <button onClick={toggleChat} style={{ color: "var(--text-secondary)" }}>
                    <X size={16} />
                </button>
            </div>

            {/* Contact tabs */}
            <div className="flex gap-1 px-2 py-1.5 border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
                {contacts.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => setActiveId(c.id)}
                        className="relative shrink-0"
                        title={c.name}
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            style={{
                                background: c.color,
                                color: "#fff",
                                opacity: activeId === c.id ? 1 : 0.5,
                                outline: activeId === c.id ? `2px solid var(--accent)` : "none",
                                outlineOffset: "1px",
                            }}
                        >
                            {c.avatar}
                        </div>
                        <div
                            className="absolute bottom-0 right-0 w-2 h-2 rounded-full border"
                            style={{
                                background: c.status === "online" ? "var(--green)" : c.status === "away" ? "var(--yellow)" : "#6b7280",
                                borderColor: "var(--bg-secondary)",
                            }}
                        />
                    </button>
                ))}
            </div>

            {/* Active contact name */}
            <div className="px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{active.name}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
                {msgs.map((msg) => (
                    <div key={msg.id} className={`flex gap-1.5 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                        {!msg.isMe && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                                style={{ background: active.color, color: "#fff", fontSize: "9px" }}>
                                {active.avatar}
                            </div>
                        )}
                        <div
                            className="px-2.5 py-1.5 rounded-xl text-xs max-w-52"
                            style={{
                                background: msg.isMe ? "var(--accent)" : "var(--bg-card)",
                                color: msg.isMe ? "#fff" : "var(--text-primary)",
                            }}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {msgs.length === 0 && (
                    <p className="text-xs text-center mt-4" style={{ color: "var(--text-secondary)" }}>
                        Start a conversation
                    </p>
                )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-2 py-2 border-t" style={{ borderColor: "var(--border)" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={`Message ${active.name}...`}
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
                <button onClick={send} className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    <Send size={13} />
                </button>
            </div>
        </div>
    );
}

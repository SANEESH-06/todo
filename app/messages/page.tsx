"use client";
import { useState, useRef, useEffect } from "react";
import {
    Send, Search, Phone, Video, MoreHorizontal,
    Mic, Play, Pause, X, Square,
} from "lucide-react";

const contacts = [
    { id: 1, name: "Aria Chen", role: "Product", avatar: "AC", color: "#7c3aed", status: "online", unread: 2, lastMsg: "Yes — moved it to Design column." },
    { id: 2, name: "Noah Patel", role: "Engineer", avatar: "NP", color: "#58a6ff", status: "online", unread: 0, lastMsg: "Wireframes are ready for review 🎨" },
    { id: 3, name: "Mia Rossi", role: "Designer", avatar: "MR", color: "#f0883e", status: "away", unread: 1, lastMsg: "Also updating the deploying notes..." },
    { id: 4, name: "Leo Wang", role: "UI Lead", avatar: "LW", color: "#3fb950", status: "online", unread: 0, lastMsg: "Ok lads" },
    { id: 5, name: "Sara Khan", role: "DevOps", avatar: "SK", color: "#d29922", status: "offline", unread: 0, lastMsg: "Deployment ready" },
];

type Msg = {
    id: number;
    from: string;
    text?: string;
    time: string;
    isMe: boolean;
    voice?: { url: string; duration: number; bars: number[] };
};

const initialMessages: Record<number, Msg[]> = {
    1: [
        { id: 1, from: "Aria Chen", text: "Hey! Did you push the MVP scope doc?", time: "10:21", isMe: false },
        { id: 2, from: "You", text: "Yes — moved it to Design column.", time: "10:22", isMe: true },
        { id: 3, from: "Aria Chen", text: "Perfect, thanks!", time: "10:23", isMe: false },
        { id: 4, from: "Aria Chen", text: "Can you also check the wireframe?", time: "10:24", isMe: false },
    ],
    2: [
        { id: 1, from: "Noah Patel", text: "Wireframes are ready for review 🎨", time: "09:45", isMe: false },
        { id: 2, from: "You", text: "Looks great! I'll review later today", time: "09:50", isMe: true },
    ],
    3: [{ id: 1, from: "Mia Rossi", text: "Also updating the deploying notes...", time: "Yesterday", isMe: false }],
    4: [{ id: 1, from: "Leo Wang", text: "Ok lads", time: "1h ago", isMe: false }],
    5: [{ id: 1, from: "Sara Khan", text: "Deployment ready", time: "2h ago", isMe: false }],
};

// ── Voice Bubble ─────────────────────────────────────────────────────────────
function VoiceBubble({ voice, isMe }: {
    voice: { url: string; duration: number; bars: number[] };
    isMe: boolean;
}) {
    const [playing, setPlaying] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const toggle = () => {
        if (playing) {
            clearInterval(timerRef.current!);
            setPlaying(false);
        } else {
            setElapsed(0);
            setPlaying(true);
            timerRef.current = setInterval(() => {
                setElapsed((e) => {
                    if (e >= voice.duration) {
                        clearInterval(timerRef.current!);
                        setPlaying(false);
                        return 0;
                    }
                    return e + 1;
                });
            }, 1000);
        }
    };

    useEffect(() => () => clearInterval(timerRef.current!), []);

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    const progress = voice.duration > 0 ? elapsed / voice.duration : 0;

    return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl min-w-[180px]"
            style={{ background: isMe ? "var(--accent)" : "var(--bg-card)" }}>
            <button onClick={toggle}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: isMe ? "rgba(255,255,255,0.2)" : "var(--bg-hover)" }}>
                {playing
                    ? <Pause size={14} color={isMe ? "#fff" : "var(--text-primary)"} />
                    : <Play size={14} color={isMe ? "#fff" : "var(--text-primary)"} />}
            </button>
            <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-end gap-0.5 h-6">
                    {voice.bars.map((h, i) => {
                        const active = i / voice.bars.length <= progress;
                        return (
                            <div key={i} className="flex-1 rounded-sm"
                                style={{
                                    height: `${h}%`,
                                    background: isMe
                                        ? active ? "#fff" : "rgba(255,255,255,0.35)"
                                        : active ? "var(--accent)" : "var(--border)",
                                    transition: "background 0.1s",
                                }} />
                        );
                    })}
                </div>
                <span className="text-xs" style={{ color: isMe ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}>
                    {playing ? fmt(elapsed) : fmt(voice.duration)}
                </span>
            </div>
        </div>
    );
}

// ── Voice Recorder ────────────────────────────────────────────────────────────
function VoiceRecorder({ onSend, onCancel }: {
    onSend: (voice: { url: string; duration: number; bars: number[] }) => void;
    onCancel: () => void;
}) {
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(timerRef.current!);
    }, []);

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    const handleSend = () => {
        clearInterval(timerRef.current!);
        const bars = Array.from({ length: 28 }, () => 20 + Math.floor(Math.random() * 80));
        onSend({ url: "", duration: Math.max(1, seconds), bars });
    };

    return (
        <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border"
                style={{ background: "rgba(248,81,73,0.08)", borderColor: "rgba(248,81,73,0.3)" }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--red)" }} />
                <span className="text-sm font-mono" style={{ color: "var(--red)" }}>{fmt(seconds)}</span>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Recording…</span>
            </div>
            <button onClick={handleSend}
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent)", color: "#fff" }} title="Send">
                <Send size={15} />
            </button>
            <button onClick={onCancel}
                className="w-9 h-9 rounded-lg flex items-center justify-center border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }} title="Cancel">
                <X size={15} />
            </button>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MessagesPage() {
    const [msgs, setMsgs] = useState<Record<number, Msg[]>>(initialMessages);
    const [activeContact, setActiveContact] = useState(1);
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [recording, setRecording] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const contact = contacts.find((c) => c.id === activeContact)!;
    const thread = msgs[activeContact] || [];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [thread]);

    const send = () => {
        if (!input.trim()) return;
        setMsgs((prev) => ({
            ...prev,
            [activeContact]: [
                ...(prev[activeContact] || []),
                { id: Date.now(), from: "You", text: input.trim(), time: "now", isMe: true },
            ],
        }));
        setInput("");
    };

    const sendVoice = (voice: { url: string; duration: number; bars: number[] }) => {
        setMsgs((prev) => ({
            ...prev,
            [activeContact]: [
                ...(prev[activeContact] || []),
                { id: Date.now(), from: "You", time: "now", isMe: true, voice },
            ],
        }));
        setRecording(false);
    };

    const filtered = contacts.filter(
        (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-full" style={{ background: "var(--bg-primary)" }}>

            {/* Contact list */}
            <div className="w-72 flex flex-col border-r shrink-0"
                style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Messages</h2>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <Search size={13} style={{ color: "var(--text-secondary)" }} />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="flex-1 text-xs outline-none bg-transparent"
                            style={{ color: "var(--text-primary)" }} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filtered.map((c) => (
                        <button key={c.id} onClick={() => setActiveContact(c.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left border-b transition-colors"
                            style={{
                                borderColor: "var(--border)",
                                background: activeContact === c.id ? "var(--bg-hover)" : "transparent",
                            }}>
                            <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{ background: c.color, color: "#fff" }}>
                                    {c.avatar}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border"
                                    style={{
                                        background: c.status === "online" ? "var(--green)" : c.status === "away" ? "var(--yellow)" : "#6b7280",
                                        borderColor: "var(--bg-secondary)",
                                    }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                                    {c.unread > 0 && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                            style={{ background: "var(--accent)", color: "#fff" }}>
                                            {c.unread}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{c.lastMsg}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
                    style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: contact.color, color: "#fff" }}>
                            {contact.avatar}
                        </div>
                        <div>
                            <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{contact.name}</div>
                            <div className="text-xs capitalize"
                                style={{ color: contact.status === "online" ? "var(--green)" : "var(--text-secondary)" }}>
                                {contact.status}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {[Phone, Video, MoreHorizontal].map((Icon, i) => (
                            <button key={i} className="w-8 h-8 rounded-md flex items-center justify-center"
                                style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
                                <Icon size={15} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                    {thread.map((msg) => (
                        <div key={msg.id} className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                            {!msg.isMe && (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                                    style={{ background: contact.color, color: "#fff" }}>
                                    {contact.avatar}
                                </div>
                            )}
                            <div className={`flex flex-col gap-1 max-w-sm ${msg.isMe ? "items-end" : ""}`}>
                                {msg.voice ? (
                                    <VoiceBubble voice={msg.voice} isMe={msg.isMe} />
                                ) : (
                                    <div className="px-3 py-2 rounded-xl text-sm"
                                        style={{
                                            background: msg.isMe ? "var(--accent)" : "var(--bg-card)",
                                            color: msg.isMe ? "#fff" : "var(--text-primary)",
                                        }}>
                                        {msg.text}
                                    </div>
                                )}
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{msg.time}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-t"
                    style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                    {recording ? (
                        <VoiceRecorder onSend={sendVoice} onCancel={() => setRecording(false)} />
                    ) : (
                        <>
                            <input value={input} onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && send()}
                                placeholder={`Message ${contact.name}…`}
                                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                            <button onClick={() => setRecording(true)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center border"
                                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }} title="Voice message">
                                <Mic size={15} />
                            </button>
                            <button onClick={send}
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ background: "var(--accent)", color: "#fff" }}>
                                <Send size={15} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

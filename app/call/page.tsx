"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, Minimize2, Maximize2,
} from "lucide-react";
import { useStore } from "@/lib/store";

function CallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callType = (searchParams.get("type") || "video") as "audio" | "video";
    const contactName = searchParams.get("contact") || "Aria Chen";

    const setActiveCall = useStore((s) => s.setActiveCall);

    const [elapsed, setElapsed] = useState(0);
    const [muted, setMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(false);

    useEffect(() => {
        const t = setInterval(() => {
            setElapsed((e) => {
                const next = e + 1;
                setActiveCall({ type: callType, contact: contactName, elapsed: next });
                return next;
            });
        }, 1000);
        // Register call on mount
        setActiveCall({ type: callType, contact: contactName, elapsed: 0 });
        return () => clearInterval(t);
    }, [callType, contactName, setActiveCall]);

    const fmt = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const endCall = () => {
        setActiveCall(null);
        router.push("/meetings");
    };

    const minimize = () => {
        // activeCall is already set — just navigate away, the PiP widget takes over
        router.push("/");
    };

    return (
        <div className="flex flex-col h-full" style={{ background: "#0d1117" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--green)" }} />
                    <span className="text-sm font-medium text-white">
                        {callType === "video" ? "Video" : "Voice"} call · {fmt(elapsed)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(63,185,80,0.15)", color: "var(--green)" }}>
                        Connected
                    </span>
                </div>
                <button onClick={minimize}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors hover:opacity-80"
                    style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                    title="Minimize call">
                    <Minimize2 size={13} /> Minimize
                </button>
            </div>

            {/* Video grid */}
            <div className="flex-1 grid grid-cols-2 gap-3 p-4">
                {/* You */}
                <div className="rounded-2xl flex items-end justify-start p-3 relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)", minHeight: 200 }}>
                    {videoOff || callType === "audio" ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                                style={{ background: "#7c3aed", color: "#fff" }}>
                                YO
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs"
                            style={{ color: "rgba(255,255,255,0.3)" }}>
                            Camera preview
                        </div>
                    )}
                    <div className="relative z-10 flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                        {muted && <MicOff size={10} style={{ color: "var(--red)" }} />}
                        You
                    </div>
                </div>

                {/* Remote */}
                <div className="rounded-2xl flex items-end justify-start p-3 relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", minHeight: 200 }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                                style={{ background: "#7c3aed", color: "#fff" }}>
                                {contactName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                            </div>
                            {callType === "audio" && (
                                <div className="flex gap-0.5 items-end h-5">
                                    {[3, 5, 8, 5, 3, 7, 4, 6, 3, 5].map((h, i) => (
                                        <div key={i} className="w-1 rounded-sm animate-pulse"
                                            style={{ height: h * 2, background: "var(--accent)", animationDelay: `${i * 80}ms` }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative z-10 text-xs px-2 py-1 rounded-lg"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                        ● {contactName}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 py-5 border-t"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <CtrlBtn active={muted} danger onClick={() => setMuted(!muted)}
                    icon={muted ? MicOff : Mic} label={muted ? "Unmute" : "Mute"} />

                {callType === "video" && (
                    <CtrlBtn active={videoOff} danger onClick={() => setVideoOff(!videoOff)}
                        icon={videoOff ? VideoOff : Video} label={videoOff ? "Show cam" : "Hide cam"} />
                )}

                <CtrlBtn onClick={minimize} icon={Minimize2} label="Minimize" />
                <CtrlBtn icon={MessageSquare} label="Chat" onClick={() => { }} />

                {/* End call — prominent */}
                <button onClick={endCall}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "var(--red)", color: "#fff" }}>
                    <PhoneOff size={16} /> End call
                </button>
            </div>
        </div>
    );
}

function CtrlBtn({ icon: Icon, label, onClick, active, danger }: {
    icon: React.ElementType; label: string; onClick: () => void; active?: boolean; danger?: boolean;
}) {
    return (
        <button onClick={onClick} title={label}
            className="flex flex-col items-center gap-1 w-14"
        >
            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all border"
                style={{
                    background: active && danger ? "rgba(248,81,73,0.25)" : "rgba(255,255,255,0.07)",
                    borderColor: active && danger ? "rgba(248,81,73,0.4)" : "rgba(255,255,255,0.1)",
                    color: active && danger ? "var(--red)" : "rgba(255,255,255,0.85)",
                }}>
                <Icon size={18} />
            </div>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
        </button>
    );
}

export default function CallPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full" style={{ background: "#0d1117" }}>
                <span className="text-white text-sm">Connecting…</span>
            </div>
        }>
            <CallContent />
        </Suspense>
    );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff, Maximize2, Video } from "lucide-react";
import { useStore } from "@/lib/store";

export default function CallPip() {
    const router = useRouter();
    const activeCall = useStore((s) => s.activeCall);
    const setActiveCall = useStore((s) => s.setActiveCall);

    const [muted, setMuted] = useState(false);
    const [elapsed, setElapsed] = useState(activeCall?.elapsed ?? 0);

    useEffect(() => {
        if (!activeCall) return;
        setElapsed(activeCall.elapsed);
    }, [activeCall?.elapsed]);

    if (!activeCall) return null;

    const fmt = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const initials = activeCall.contact.split(" ").map((w) => w[0]).join("").slice(0, 2);

    return (
        <div
            className="fixed bottom-5 right-5 z-50 rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
            style={{
                width: 220,
                background: "#0d1117",
                borderColor: "rgba(124,58,237,0.5)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2)",
            }}
        >
            {/* Mini video area */}
            <div className="relative flex items-center justify-center"
                style={{
                    height: 100,
                    background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
                }}>
                <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: "#7c3aed", color: "#fff" }}>
                        {initials}
                    </div>
                    {/* Audio wave */}
                    <div className="flex gap-0.5 items-end h-3">
                        {[2, 4, 3, 5, 2, 4, 3].map((h, i) => (
                            <div key={i} className="w-0.5 rounded-sm animate-pulse"
                                style={{ height: h * 2, background: "var(--accent)", animationDelay: `${i * 100}ms` }} />
                        ))}
                    </div>
                </div>

                {/* Type badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs"
                    style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
                    {activeCall.type === "video" ? <Video size={10} /> : <Mic size={10} />}
                    {fmt(elapsed)}
                </div>
            </div>

            {/* Info + controls */}
            <div className="px-3 py-2.5 flex flex-col gap-2">
                <div>
                    <p className="text-xs font-semibold text-white truncate">{activeCall.contact}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {activeCall.type === "video" ? "Video" : "Voice"} call · ongoing
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Mute */}
                    <button onClick={() => setMuted(!muted)}
                        className="w-8 h-8 rounded-full flex items-center justify-center border transition-all"
                        style={{
                            background: muted ? "rgba(248,81,73,0.2)" : "rgba(255,255,255,0.07)",
                            borderColor: muted ? "rgba(248,81,73,0.4)" : "rgba(255,255,255,0.1)",
                            color: muted ? "var(--red)" : "rgba(255,255,255,0.8)",
                        }}
                        title={muted ? "Unmute" : "Mute"}>
                        {muted ? <MicOff size={13} /> : <Mic size={13} />}
                    </button>

                    {/* Expand back */}
                    <button onClick={() => router.push(`/call?type=${activeCall.type}&contact=${encodeURIComponent(activeCall.contact)}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs border transition-all hover:opacity-80"
                        style={{
                            background: "rgba(255,255,255,0.07)",
                            borderColor: "rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.8)",
                        }}
                        title="Expand call">
                        <Maximize2 size={12} /> Expand
                    </button>

                    {/* End */}
                    <button onClick={() => setActiveCall(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                        style={{ background: "var(--red)", color: "#fff" }}
                        title="End call">
                        <PhoneOff size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}

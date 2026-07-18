"use client";
import { useState } from "react";
import { CheckCircle2, MessageSquare, Bug, Zap, ThumbsUp, AlertCircle, ChevronDown } from "lucide-react";
import TopNav from "@/components/TopNav";
import { useStore, FeedbackType } from "@/lib/store";

const TYPES: { id: FeedbackType; label: string; icon: React.ElementType; desc: string; color: string }[] = [
    { id: "bug", label: "Bug report", icon: Bug, desc: "Something is broken", color: "#f85149" },
    { id: "feature", label: "Feature request", icon: Zap, desc: "I want a new capability", color: "#58a6ff" },
    { id: "complaint", label: "Complaint", icon: AlertCircle, desc: "I'm having a bad experience", color: "#f0883e" },
    { id: "praise", label: "Praise", icon: ThumbsUp, desc: "Something works great", color: "#3fb950" },
    { id: "other", label: "Other", icon: MessageSquare, desc: "Something else entirely", color: "#8b949e" },
];

export default function FeedbackPage() {
    const { user, addFeedback, feedbacks } = useStore();

    const [type, setType] = useState<FeedbackType>("bug");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const myFeedbacks = feedbacks.filter((f) => f.userEmail === user?.email);

    const handleSubmit = () => {
        if (!subject.trim() || !message.trim()) return;
        addFeedback({
            userId: user?.id || "guest",
            userName: user?.name || "Guest",
            userEmail: user?.email || "guest@example.com",
            type, subject: subject.trim(), message: message.trim(),
            status: "open",
        });
        setSubmitted(true);
        setSubject("");
        setMessage("");
        setTimeout(() => setSubmitted(false), 3000);
    };

    const selectedType = TYPES.find((t) => t.id === type)!;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <TopNav title="Feedback" subtitle="Share your thoughts" />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto flex flex-col gap-6">

                    {/* Submit form */}
                    <div className="rounded-2xl border overflow-hidden"
                        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                        <div className="px-5 py-4 border-b flex items-center gap-3"
                            style={{ borderColor: "var(--border)" }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: `${selectedType.color}18` }}>
                                <selectedType.icon size={18} style={{ color: selectedType.color }} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Send feedback</p>
                                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Help us improve the product</p>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-4">
                            {/* Type selector */}
                            <div>
                                <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
                                    Type
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {TYPES.map((t) => (
                                        <button key={t.id} onClick={() => setType(t.id)}
                                            className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all"
                                            style={{
                                                background: type === t.id ? `${t.color}12` : "var(--bg-secondary)",
                                                borderColor: type === t.id ? t.color : "var(--border)",
                                            }}>
                                            <t.icon size={16} style={{ color: type === t.id ? t.color : "var(--text-secondary)" }} />
                                            <span className="text-xs" style={{ color: type === t.id ? t.color : "var(--text-secondary)" }}>
                                                {t.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                                    {selectedType.desc}
                                </p>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Subject</label>
                                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief summary..."
                                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Message</label>
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your feedback in detail..."
                                    rows={5}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                    Sending as <strong style={{ color: "var(--text-primary)" }}>{user?.name}</strong>
                                </span>
                                <button onClick={handleSubmit}
                                    disabled={!subject.trim() || !message.trim()}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all"
                                    style={{
                                        background: submitted ? "var(--green)" : !subject.trim() || !message.trim() ? "var(--bg-secondary)" : "var(--accent)",
                                        color: !subject.trim() || !message.trim() ? "var(--text-secondary)" : "#fff",
                                        cursor: !subject.trim() || !message.trim() ? "not-allowed" : "pointer",
                                    }}>
                                    {submitted
                                        ? <><CheckCircle2 size={15} /> Submitted!</>
                                        : <><MessageSquare size={15} /> Submit feedback</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* My previous feedback */}
                    {myFeedbacks.length > 0 && (
                        <div className="rounded-2xl border overflow-hidden"
                            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                            <div className="px-5 py-3 border-b"
                                style={{ borderColor: "var(--border)" }}>
                                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                    Your previous feedback
                                </p>
                            </div>
                            {myFeedbacks.map((f) => {
                                const t = TYPES.find((x) => x.id === f.type)!;
                                const statusColor = f.status === "resolved" ? "#3fb950" : f.status === "in-progress" ? "#d29922" : "#f85149";
                                const statusLabel = f.status === "in-progress" ? "In Progress" : f.status.charAt(0).toUpperCase() + f.status.slice(1);
                                return (
                                    <div key={f.id} className="flex items-center gap-3 px-5 py-3 border-b last:border-0"
                                        style={{ borderColor: "var(--border)" }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: `${t.color}15` }}>
                                            <t.icon size={14} style={{ color: t.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{f.subject}</p>
                                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                {new Date(f.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                                            style={{ background: `${statusColor}15`, color: statusColor }}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

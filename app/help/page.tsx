import TopNav from "@/components/TopNav";
import { BookOpen, MessageCircle, GitBranch, Video } from "lucide-react";

const topics = [
    { icon: GitBranch, title: "Using the Pipeline", desc: "Learn how to manage tasks across stages in the Kanban board." },
    { icon: Video, title: "Starting a Meeting", desc: "How to create, join, or schedule voice and video calls." },
    { icon: MessageCircle, title: "Team Chat", desc: "Send messages and collaborate with your team in real time." },
    { icon: BookOpen, title: "API Reference", desc: "Browse and test all available API endpoints interactively." },
];

export default function HelpPage() {
    return (
        <div className="flex flex-col h-full">
            <TopNav title="Help" subtitle="Documentation & support" />
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-2 gap-4 max-w-xl">
                    {topics.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="p-4 rounded-lg border cursor-pointer transition-colors"
                            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                        >
                            <div
                                className="w-8 h-8 rounded-md flex items-center justify-center mb-3"
                                style={{ background: "rgba(124,58,237,0.2)" }}
                            >
                                <Icon size={16} style={{ color: "var(--accent)" }} />
                            </div>
                            <div className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                                {title}
                            </div>
                            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                {desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

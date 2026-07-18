import TopNav from "@/components/TopNav";
import { Bell, CheckCircle, MessageSquare, GitBranch } from "lucide-react";

const notifications = [
    { id: 1, icon: MessageSquare, color: "#7c3aed", text: "Aria Chen sent you a message", time: "2m ago", read: false },
    { id: 2, icon: GitBranch, color: "#3fb950", text: "Task 'Auth API endpoints' moved to Testing", time: "15m ago", read: false },
    { id: 3, icon: Bell, color: "#58a6ff", text: "Meeting starting in 5 minutes", time: "1h ago", read: true },
    { id: 4, icon: CheckCircle, color: "#d29922", text: "Noah Patel completed 'Wireframe dashboard'", time: "2h ago", read: true },
];

export default function NotificationsPage() {
    return (
        <div className="flex flex-col h-full">
            <TopNav title="Notifications" />
            <div className="flex-1 overflow-auto p-6 max-w-lg">
                {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                        <div
                            key={n.id}
                            className="flex items-start gap-3 py-3 border-b"
                            style={{ borderColor: "var(--border)", opacity: n.read ? 0.6 : 1 }}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: `${n.color}22` }}
                            >
                                <Icon size={15} style={{ color: n.color }} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                                    {n.text}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                                    {n.time}
                                </div>
                            </div>
                            {!n.read && (
                                <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: "var(--accent)" }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

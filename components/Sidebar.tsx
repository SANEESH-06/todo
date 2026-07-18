"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    GitBranch, Video, Code2, MessageSquare, Settings,
    Bell, Users, HelpCircle, Sun, Moon, LogOut, MessageCircle,
    MessageSquareDot, ShieldCheck,
} from "lucide-react";
import { useStore } from "@/lib/store";

const navItems = [
    { href: "/", icon: GitBranch, label: "Pipeline" },
    { href: "/meetings", icon: Video, label: "Meetings" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/api-docs", icon: Code2, label: "API Docs" },
    { href: "/team", icon: Users, label: "Team" },
    { href: "/feedback", icon: MessageSquareDot, label: "Feedback" },
];

const bottomItems = [
    { href: "/admin", icon: ShieldCheck, label: "Admin" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/help", icon: HelpCircle, label: "Help" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const user = useStore((s) => s.user);
    const logout = useStore((s) => s.logout);
    const theme = useStore((s) => s.theme);
    const setTheme = useStore((s) => s.setTheme);
    const toggleChat = useStore((s) => s.toggleChat);
    const chatOpen = useStore((s) => s.chatOpen);
    const feedbacks = useStore((s) => s.feedbacks);
    const openIssues = feedbacks.filter((f) => f.status === "open").length;

    // Only admins see the Admin panel link
    const visibleBottomItems = bottomItems.filter(
        (item) => item.href !== "/admin" || user?.isAdmin
    );

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside className="flex flex-col w-14 h-full border-r shrink-0"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            {/* Logo */}
            <div className="flex items-center justify-center h-12 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ background: "var(--accent)" }}>
                    <GitBranch size={16} />
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col items-center gap-1 p-2 flex-1 mt-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href;
                    const showBadge = href === "/feedback" && openIssues > 0;
                    return (
                        <div key={href} className="relative">
                            <NavBtn href={href} icon={Icon} label={label} active={active} />
                            {showBadge && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white pointer-events-none"
                                    style={{ background: "var(--red)", fontSize: 9, fontWeight: 700 }}>
                                    {openIssues > 9 ? "9+" : openIssues}
                                </span>
                            )}
                        </div>
                    );
                })}

                {/* Team Chat toggle button */}
                <button
                    title="Team Chat"
                    onClick={toggleChat}
                    className="w-10 h-10 flex items-center justify-center rounded-md transition-colors"
                    style={{
                        background: chatOpen ? "var(--accent)" : "transparent",
                        color: chatOpen ? "#fff" : "var(--text-secondary)",
                    }}
                >
                    <MessageCircle size={18} />
                </button>
            </nav>

            {/* Bottom */}
            <div className="flex flex-col items-center gap-1 p-2 pb-3">
                {/* Theme toggle */}
                <button
                    title={theme === "dark" ? "Switch to light" : "Switch to dark"}
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-10 h-10 flex items-center justify-center rounded-md"
                    style={{ color: "var(--text-secondary)" }}
                >
                    {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                {visibleBottomItems.map(({ href, icon: Icon, label }) => (
                    <NavBtn key={href} href={href} icon={Icon} label={label} active={pathname === href} />
                ))}

                {/* Logout */}
                <button
                    title="Sign out"
                    onClick={handleLogout}
                    className="w-10 h-10 flex items-center justify-center rounded-md"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <LogOut size={17} />
                </button>

                {/* Avatar */}
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer mt-1"
                    style={{ background: "var(--accent)", color: "#fff" }}
                    title={user?.name}
                >
                    {user?.avatar || "?"}
                </div>
            </div>
        </aside>
    );
}

function NavBtn({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            title={label}
            className="w-10 h-10 flex items-center justify-center rounded-md transition-colors"
            style={{ background: active ? "var(--accent)" : "transparent", color: active ? "#fff" : "var(--text-secondary)" }}
        >
            <Icon size={18} />
        </Link>
    );
}

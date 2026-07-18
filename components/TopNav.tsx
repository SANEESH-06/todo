"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useStore } from "@/lib/store";
import TaskQuickBar from "@/components/TaskQuickBar";

interface TopNavProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

const tabs = [
    { href: "/", label: "Pipeline" },
    { href: "/meetings", label: "Meetings" },
    { href: "/api-docs", label: "API" },
];

export default function TopNav({ title, subtitle, action }: TopNavProps) {
    const pathname = usePathname();
    const user = useStore((s) => s.user);

    return (
        <div className="flex items-center justify-between px-4 h-12 border-b shrink-0"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    {title.charAt(0)}
                </div>
                <div>
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{title}</span>
                    {subtitle && <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>{subtitle}</span>}
                </div>
            </div>

            <div className="flex items-center gap-1">
                {tabs.map(({ href, label }) => {
                    const active = pathname === href;
                    return (
                        <Link key={href} href={href}
                            className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                            style={{ background: active ? "var(--accent)" : "transparent", color: active ? "#fff" : "var(--text-secondary)" }}>
                            {label}
                        </Link>
                    );
                })}
                <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs ml-1"
                    style={{ background: "var(--accent-subtle)", color: "var(--green)" }}>
                    <Globe size={11} /> Online
                </div>
                {/* Global task CRUD bar — available on every page */}
                <TaskQuickBar />
                {action}
            </div>
        </div>
    );
}

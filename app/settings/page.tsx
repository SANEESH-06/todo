"use client";
import { useState } from "react";
import TopNav from "@/components/TopNav";
import { User, Bell, Lock, Palette, Globe, Sliders, Sun, Moon, Monitor } from "lucide-react";
import { useStore } from "@/lib/store";

const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language & Region", icon: Globe },
    { id: "advanced", label: "Advanced", icon: Sliders },
];

export default function SettingsPage() {
    const user = useStore((s) => s.user);
    const theme = useStore((s) => s.theme);
    const setTheme = useStore((s) => s.setTheme);
    const [active, setActive] = useState("profile");
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [role, setRole] = useState(user?.role || "Developer");
    const [saved, setSaved] = useState(false);
    const [notifs, setNotifs] = useState({ email: true, push: false, desktop: true, mentions: true });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex flex-col h-full">
            <TopNav title="Settings" subtitle="Manage your preferences" />
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-52 flex flex-col p-3 border-r shrink-0"
                    style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                    {sections.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setActive(id)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left mb-1 transition-colors"
                            style={{
                                background: active === id ? "var(--accent-subtle)" : "transparent",
                                color: active === id ? "var(--accent)" : "var(--text-secondary)",
                            }}>
                            <Icon size={15} />{label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {active === "profile" && (
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Profile</h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                                    style={{ background: "var(--accent)", color: "#fff" }}>
                                    {user?.avatar || "?"}
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
                                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <Field label="Display name" value={name} onChange={setName} />
                                <Field label="Email" value={email} onChange={setEmail} type="email" />
                                <Field label="Role" value={role} onChange={setRole} />
                                <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium w-fit"
                                    style={{ background: saved ? "var(--green)" : "var(--accent)", color: "#fff" }}>
                                    {saved ? "Saved ✓" : "Save changes"}
                                </button>
                            </div>
                        </div>
                    )}

                    {active === "notifications" && (
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Notifications</h2>
                            <div className="flex flex-col gap-1">
                                {(Object.keys(notifs) as Array<keyof typeof notifs>).map((k) => (
                                    <div key={k} className="flex items-center justify-between py-3 border-b"
                                        style={{ borderColor: "var(--border)" }}>
                                        <div>
                                            <div className="text-sm capitalize" style={{ color: "var(--text-primary)" }}>{k} notifications</div>
                                            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Receive {k} alerts for activity</div>
                                        </div>
                                        <Toggle on={notifs[k]} onToggle={() => setNotifs((p) => ({ ...p, [k]: !p[k] }))} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "appearance" && (
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Appearance</h2>
                            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Choose how Project Pipeline looks for you.</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: "dark", label: "Dark", icon: Moon, preview: "#0f1117" },
                                    { id: "light", label: "Light", icon: Sun, preview: "#f6f8fa" },
                                ].map(({ id, label, icon: Icon, preview }) => (
                                    <button key={id} onClick={() => setTheme(id as "dark" | "light")}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                                        style={{
                                            borderColor: theme === id ? "var(--accent)" : "var(--border)",
                                            background: theme === id ? "var(--accent-subtle)" : "var(--bg-card)",
                                        }}>
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ background: preview }}>
                                            <Icon size={18} style={{ color: id === "dark" ? "#e6edf3" : "#1f2328" }} />
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: theme === id ? "var(--accent)" : "var(--text-secondary)" }}>
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "security" && (
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Security</h2>
                            <div className="flex flex-col gap-4">
                                <Field label="Current password" value="" onChange={() => { }} type="password" placeholder="••••••••" />
                                <Field label="New password" value="" onChange={() => { }} type="password" placeholder="Min 6 characters" />
                                <Field label="Confirm new password" value="" onChange={() => { }} type="password" placeholder="••••••••" />
                                <button className="px-4 py-2 rounded-lg text-sm font-medium w-fit"
                                    style={{ background: "var(--accent)", color: "#fff" }}>
                                    Update password
                                </button>
                                <div className="mt-4 p-4 rounded-lg border"
                                    style={{ borderColor: "rgba(248,81,73,0.3)", background: "rgba(248,81,73,0.05)" }}>
                                    <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--red)" }}>Danger zone</h3>
                                    <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>Permanently delete your account and all data.</p>
                                    <button className="px-3 py-1.5 rounded-lg text-xs border"
                                        style={{ borderColor: "var(--red)", color: "var(--red)" }}>
                                        Delete account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(active === "language" || active === "advanced") && (
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                                {sections.find((s) => s.id === active)?.label}
                            </h2>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Coming soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
    return (
        <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>
    );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button onClick={onToggle}
            className="w-11 h-6 rounded-full relative transition-colors shrink-0"
            style={{ background: on ? "var(--accent)" : "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: on ? "calc(100% - 22px)" : "2px" }} />
        </button>
    );
}

"use client";
import { useState } from "react";
import {
    Users, BarChart2, MessageSquare, GitBranch, ShieldAlert,
    CheckCircle2, Clock, Ban, Pencil, Trash2, X, Search,
    TrendingUp, Activity, AlertCircle, UserCheck,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { useStore, AdminUser, Feedback } from "@/lib/store";

const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
] as const;
type Tab = typeof TABS[number]["id"];

const USER_STATUS_STYLE: Record<AdminUser["status"], { color: string; bg: string; label: string }> = {
    active: { color: "#3fb950", bg: "rgba(63,185,80,0.12)", label: "Active" },
    inactive: { color: "#8b949e", bg: "rgba(139,148,158,0.12)", label: "Inactive" },
    banned: { color: "#f85149", bg: "rgba(248,81,73,0.12)", label: "Banned" },
};

const FB_TYPE_STYLE: Record<string, { color: string; bg: string }> = {
    bug: { color: "#f85149", bg: "rgba(248,81,73,0.1)" },
    feature: { color: "#58a6ff", bg: "rgba(88,166,255,0.1)" },
    complaint: { color: "#f0883e", bg: "rgba(240,136,62,0.1)" },
    praise: { color: "#3fb950", bg: "rgba(63,185,80,0.1)" },
    other: { color: "#8b949e", bg: "rgba(139,148,158,0.1)" },
};

const FB_STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
    "open": { color: "#f85149", bg: "rgba(248,81,73,0.1)", label: "Open" },
    "in-progress": { color: "#d29922", bg: "rgba(210,153,34,0.1)", label: "In Progress" },
    "resolved": { color: "#3fb950", bg: "rgba(63,185,80,0.1)", label: "Resolved" },
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: {
    label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
    return (
        <div className="rounded-xl border p-4 flex items-center gap-4"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}>
                <Icon size={20} style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</p>
                {sub && <p className="text-xs mt-0.5" style={{ color }}>{sub}</p>}
            </div>
        </div>
    );
}

// ── Edit User Modal ───────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }: {
    user: AdminUser; onClose: () => void;
    onSave: (id: string, data: Partial<AdminUser>) => void;
}) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    const [status, setStatus] = useState(user.status);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
            <div className="w-full max-w-sm rounded-2xl border shadow-2xl"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Edit user</span>
                    <button onClick={onClose} style={{ color: "var(--text-secondary)" }}><X size={16} /></button>
                </div>
                <div className="p-5 flex flex-col gap-3">
                    <Field label="Name" value={name} onChange={setName} />
                    <Field label="Email" value={email} onChange={setEmail} type="email" />
                    <Field label="Role" value={role} onChange={setRole} />
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as AdminUser["status"])}
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                    <button onClick={() => { onSave(user.id, { name, email, role, status }); onClose(); }}
                        className="flex-1 py-2 rounded-lg text-sm font-medium"
                        style={{ background: "var(--accent)", color: "#fff" }}>Save</button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = "text" }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
    return (
        <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
    const {
        adminUsers, feedbacks, tasks, projects,
        updateAdminUser, deleteAdminUser,
        updateFeedbackStatus, deleteFeedback,
    } = useStore();

    const [tab, setTab] = useState<Tab>("overview");
    const [userSearch, setUserSearch] = useState("");
    const [fbSearch, setFbSearch] = useState("");
    const [fbFilter, setFbFilter] = useState<string>("all");
    const [editUser, setEditUser] = useState<AdminUser | null>(null);
    const [expandFb, setExpandFb] = useState<string | null>(null);

    // Derived stats
    const activeUsers = adminUsers.filter((u) => u.status === "active").length;
    const bannedUsers = adminUsers.filter((u) => u.status === "banned").length;
    const openFeedbacks = feedbacks.filter((f) => f.status === "open").length;
    const bugs = feedbacks.filter((f) => f.type === "bug").length;

    const filteredUsers = adminUsers.filter((u) =>
        !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.role.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredFb = feedbacks.filter((f) => {
        const matchSearch = !fbSearch ||
            f.subject.toLowerCase().includes(fbSearch.toLowerCase()) ||
            f.userName.toLowerCase().includes(fbSearch.toLowerCase()) ||
            f.message.toLowerCase().includes(fbSearch.toLowerCase());
        const matchFilter = fbFilter === "all" || f.type === fbFilter || f.status === fbFilter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <TopNav title="Admin" subtitle="Dashboard" />

            <div className="flex flex-1 overflow-hidden">
                {/* Left sidebar nav */}
                <div className="w-44 border-r shrink-0 flex flex-col p-2 gap-1"
                    style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors relative"
                            style={{
                                background: tab === id ? "var(--accent-subtle)" : "transparent",
                                color: tab === id ? "var(--accent)" : "var(--text-secondary)",
                            }}>
                            <Icon size={15} />
                            {label}
                            {id === "feedback" && openFeedbacks > 0 && (
                                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold"
                                    style={{ background: "var(--red)", color: "#fff", fontSize: 10 }}>
                                    {openFeedbacks}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-y-auto p-5">

                    {/* ── OVERVIEW ── */}
                    {tab === "overview" && (
                        <div className="flex flex-col gap-5 max-w-4xl">
                            <div className="grid grid-cols-4 gap-3">
                                <StatCard label="Total users" value={adminUsers.length} icon={Users} color="#58a6ff" sub={`${activeUsers} active`} />
                                <StatCard label="Total projects" value={projects.length} icon={GitBranch} color="#7c3aed" />
                                <StatCard label="Open issues" value={openFeedbacks} icon={AlertCircle} color="#f85149" sub="need attention" />
                                <StatCard label="Total tasks" value={tasks.length} icon={Activity} color="#3fb950" />
                            </div>

                            {/* Recent feedback issues */}
                            <div className="rounded-xl border overflow-hidden"
                                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                                <div className="flex items-center justify-between px-4 py-3 border-b"
                                    style={{ borderColor: "var(--border)" }}>
                                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                        Recent Feedback Issues
                                    </span>
                                    <button onClick={() => setTab("feedback")}
                                        className="text-xs px-2 py-1 rounded-lg"
                                        style={{ color: "var(--accent)", background: "var(--accent-subtle)" }}>
                                        View all
                                    </button>
                                </div>
                                {feedbacks.filter((f) => f.status !== "resolved").slice(0, 4).map((f) => {
                                    const ts = FB_TYPE_STYLE[f.type];
                                    const ss = FB_STATUS_STYLE[f.status];
                                    return (
                                        <div key={f.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                                            style={{ borderColor: "var(--border)" }}>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md capitalize shrink-0"
                                                style={{ background: ts.bg, color: ts.color }}>{f.type}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{f.subject}</p>
                                                <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{f.userName} · {f.userEmail}</p>
                                            </div>
                                            <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                                                style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* User overview table */}
                            <div className="rounded-xl border overflow-hidden"
                                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                                <div className="flex items-center justify-between px-4 py-3 border-b"
                                    style={{ borderColor: "var(--border)" }}>
                                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Users</span>
                                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                                        <span className="flex items-center gap-1"><UserCheck size={12} style={{ color: "#3fb950" }} /> {activeUsers} active</span>
                                        <span className="flex items-center gap-1"><Ban size={12} style={{ color: "#f85149" }} /> {bannedUsers} banned</span>
                                    </div>
                                </div>
                                {adminUsers.slice(0, 5).map((u) => {
                                    const st = USER_STATUS_STYLE[u.status];
                                    return (
                                        <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0"
                                            style={{ borderColor: "var(--border)" }}>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ background: "var(--accent)", color: "#fff" }}>{u.avatar}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                                                <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{u.role} · {u.email}</p>
                                            </div>
                                            <span className="text-xs px-2 py-0.5 rounded-full"
                                                style={{ background: st.bg, color: st.color }}>{st.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── USERS ── */}
                    {tab === "users" && (
                        <div className="flex flex-col gap-4 max-w-4xl">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border"
                                    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                                    <Search size={14} style={{ color: "var(--text-secondary)" }} />
                                    <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Search users..."
                                        className="flex-1 text-sm outline-none bg-transparent"
                                        style={{ color: "var(--text-primary)" }} />
                                </div>
                            </div>

                            <div className="rounded-xl border overflow-hidden"
                                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                                {/* Table head */}
                                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2.5 border-b text-xs font-semibold"
                                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>
                                    <span>User</span><span>Role</span><span>Projects</span><span>Tasks</span><span>Status</span><span></span>
                                </div>
                                {filteredUsers.map((u) => {
                                    const st = USER_STATUS_STYLE[u.status];
                                    return (
                                        <div key={u.id}
                                            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center px-4 py-3 border-b last:border-0 group"
                                            style={{ borderColor: "var(--border)" }}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                    style={{ background: "var(--accent)", color: "#fff" }}>{u.avatar}</div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                                                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{u.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{u.role}</span>
                                            <span className="text-xs" style={{ color: "var(--text-primary)" }}>{u.projectCount}</span>
                                            <span className="text-xs" style={{ color: "var(--text-primary)" }}>{u.taskCount}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full w-fit"
                                                style={{ background: st.bg, color: st.color }}>{st.label}</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditUser(u)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg border"
                                                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                                                    <Pencil size={11} />
                                                </button>
                                                <button onClick={() => deleteAdminUser(u.id)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg border"
                                                    style={{ borderColor: "rgba(248,81,73,0.3)", color: "var(--red)" }}>
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <div className="py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                                        No users match your search.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── FEEDBACK ── */}
                    {tab === "feedback" && (
                        <div className="flex flex-col gap-4 max-w-4xl">
                            {/* Stats row */}
                            <div className="grid grid-cols-5 gap-2">
                                {["all", "bug", "feature", "complaint", "praise"].map((type) => {
                                    const count = type === "all"
                                        ? feedbacks.length
                                        : feedbacks.filter((f) => f.type === type).length;
                                    const style = type === "all"
                                        ? { color: "var(--accent)", bg: "var(--accent-subtle)" }
                                        : FB_TYPE_STYLE[type];
                                    return (
                                        <button key={type} onClick={() => setFbFilter(type)}
                                            className="rounded-xl border px-3 py-2 text-left transition-all"
                                            style={{
                                                background: fbFilter === type ? style.bg : "var(--bg-card)",
                                                borderColor: fbFilter === type ? style.color : "var(--border)",
                                            }}>
                                            <p className="text-lg font-bold" style={{ color: style.color }}>{count}</p>
                                            <p className="text-xs capitalize" style={{ color: "var(--text-secondary)" }}>{type}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search + status filter */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border"
                                    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                                    <Search size={14} style={{ color: "var(--text-secondary)" }} />
                                    <input value={fbSearch} onChange={(e) => setFbSearch(e.target.value)}
                                        placeholder="Search feedback..."
                                        className="flex-1 text-sm outline-none bg-transparent"
                                        style={{ color: "var(--text-primary)" }} />
                                </div>
                                {["all", "open", "in-progress", "resolved"].map((s) => (
                                    <button key={s} onClick={() => setFbFilter(s)}
                                        className="px-3 py-1.5 rounded-lg text-xs border capitalize transition-colors"
                                        style={{
                                            background: fbFilter === s ? "var(--accent-subtle)" : "var(--bg-card)",
                                            borderColor: fbFilter === s ? "var(--accent)" : "var(--border)",
                                            color: fbFilter === s ? "var(--accent)" : "var(--text-secondary)",
                                        }}>{s === "all" ? "All status" : s}</button>
                                ))}
                            </div>

                            {/* Feedback list */}
                            <div className="flex flex-col gap-2">
                                {filteredFb.map((f) => {
                                    const ts = FB_TYPE_STYLE[f.type];
                                    const ss = FB_STATUS_STYLE[f.status];
                                    const isOpen = expandFb === f.id;
                                    return (
                                        <div key={f.id} className="rounded-xl border overflow-hidden transition-all"
                                            style={{ background: "var(--bg-card)", borderColor: isOpen ? "var(--accent)" : "var(--border)" }}>
                                            {/* Row */}
                                            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer group"
                                                onClick={() => setExpandFb(isOpen ? null : f.id)}>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-md capitalize shrink-0"
                                                    style={{ background: ts.bg, color: ts.color }}>{f.type}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{f.subject}</p>
                                                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                        {f.userName} · {new Date(f.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                                                    style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => deleteFeedback(f.id)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg border"
                                                        style={{ borderColor: "rgba(248,81,73,0.3)", color: "var(--red)" }}>
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded */}
                                            {isOpen && (
                                                <div className="border-t px-4 py-4" style={{ borderColor: "var(--border)" }}>
                                                    <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{f.message}</p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Change status:</span>
                                                        {(["open", "in-progress", "resolved"] as const).map((s) => {
                                                            const sst = FB_STATUS_STYLE[s];
                                                            return (
                                                                <button key={s} onClick={() => updateFeedbackStatus(f.id, s)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all"
                                                                    style={{
                                                                        background: f.status === s ? sst.bg : "var(--bg-secondary)",
                                                                        borderColor: f.status === s ? sst.color : "var(--border)",
                                                                        color: f.status === s ? sst.color : "var(--text-secondary)",
                                                                    }}>
                                                                    {s === "open" && <AlertCircle size={11} />}
                                                                    {s === "in-progress" && <Clock size={11} />}
                                                                    {s === "resolved" && <CheckCircle2 size={11} />}
                                                                    {sst.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {f.resolvedAt && (
                                                        <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                                                            Resolved {new Date(f.resolvedAt).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {filteredFb.length === 0 && (
                                    <div className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                                        No feedback matches your filter.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit user modal */}
            {editUser && (
                <EditUserModal
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    onSave={updateAdminUser}
                />
            )}
        </div>
    );
}

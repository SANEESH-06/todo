"use client";
import { useState, useMemo } from "react";
import {
    ChevronDown, ChevronRight, Play, Copy, Check, Lock, Plus, Pencil, Trash2, X, Tag,
    GitBranch, Globe, Zap, Database, Shield, Layers, Box, Cpu, Cloud, Code2,
    BarChart2, Bell, FileText, Link2, Package, Settings2, Star, Terminal, Wifi,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { useStore, HttpMethod, ApiEndpoint, Project } from "@/lib/store";

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_STYLE: Record<HttpMethod, { bg: string; color: string; border: string }> = {
    GET: { bg: "#0d2c1a", color: "#3fb950", border: "#1a4d2e" },
    POST: { bg: "#0d1f3c", color: "#58a6ff", border: "#1f3a5c" },
    PUT: { bg: "#2c1a0d", color: "#f0883e", border: "#4a2a1a" },
    DELETE: { bg: "#2c0d0d", color: "#f85149", border: "#4a1a1a" },
    PATCH: { bg: "#1a1a2c", color: "#a78bfa", border: "#2a2a4a" },
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const PROJECT_ICONS: Record<string, React.ElementType> = {
    GitBranch, Globe, Zap, Database, Shield, Layers, Box, Cpu, Cloud, Code2,
    BarChart2, Bell, FileText, Link2, Package, Settings2, Star, Terminal, Wifi, Tag,
};

const ICON_OPTIONS = Object.keys(PROJECT_ICONS);

// ─── Built-in API Groups (platform-level) ────────────────────────────────────

const BUILTIN_GROUPS = [
    {
        tag: "Authentication",
        icon: Shield,
        description: "User auth & sessions",
        endpoints: [
            { method: "POST" as HttpMethod, path: "/api/v1/auth/login", summary: "Sign in", auth: false, description: "Authenticate a user and receive an access token.", body: { email: "user@example.com", password: "secret" }, response: '{\n  "token": "eyJhbGci...",\n  "user": { "id": "u1", "name": "Aria Chen" }\n}' },
            { method: "POST" as HttpMethod, path: "/api/v1/auth/signup", summary: "Create account", auth: false, description: "Register a new user account.", body: { name: "Aria Chen", email: "aria@example.com", password: "secret" }, response: '{\n  "id": "u2",\n  "name": "Aria Chen",\n  "createdAt": "2026-06-17T10:00:00Z"\n}' },
            { method: "POST" as HttpMethod, path: "/api/v1/auth/logout", summary: "Sign out", auth: true, description: "Invalidate the current session token.", body: undefined, response: '{\n  "success": true\n}' },
            { method: "POST" as HttpMethod, path: "/api/v1/auth/forgot-password", summary: "Reset password email", auth: false, description: "Send a password reset link to the user's email.", body: { email: "user@example.com" }, response: '{\n  "sent": true\n}' },
        ],
    },
    {
        tag: "Projects",
        icon: Layers,
        description: "Project management",
        endpoints: [
            { method: "GET" as HttpMethod, path: "/api/v1/projects", summary: "List projects", auth: true, description: "Returns all projects for the authenticated user.", body: undefined, response: '{\n  "data": [{ "id": "p1", "name": "Project Pipeline", "color": "#7c3aed" }],\n  "total": 1\n}' },
            { method: "POST" as HttpMethod, path: "/api/v1/projects", summary: "Create project", auth: true, description: "Create a new project.", body: { name: "New Project", description: "...", color: "#7c3aed", icon: "GitBranch" }, response: '{\n  "id": "p3",\n  "name": "New Project"\n}' },
            { method: "PUT" as HttpMethod, path: "/api/v1/projects/{id}", summary: "Update project", auth: true, description: "Update an existing project.", body: { name: "Updated", color: "#2563eb" }, response: '{\n  "id": "p1",\n  "name": "Updated"\n}' },
            { method: "DELETE" as HttpMethod, path: "/api/v1/projects/{id}", summary: "Delete project", auth: true, description: "Permanently delete a project and its endpoints.", body: undefined, response: '{\n  "deleted": true\n}' },
        ],
    },
    {
        tag: "Tasks",
        icon: FileText,
        description: "Pipeline task CRUD",
        endpoints: [
            { method: "GET" as HttpMethod, path: "/api/v1/tasks", summary: "List tasks", auth: true, description: "Returns tasks, filterable by stage or project.", body: undefined, response: '{\n  "data": [{ "id": "t1", "title": "Auth API", "stage": "development", "priority": "high" }],\n  "total": 1\n}' },
            { method: "POST" as HttpMethod, path: "/api/v1/tasks", summary: "Create task", auth: true, description: "Create a new task in the pipeline.", body: { title: "New task", stage: "planning", priority: "medium", assignee: "Aria" }, response: '{\n  "id": "t7",\n  "title": "New task",\n  "stage": "planning"\n}' },
            { method: "PUT" as HttpMethod, path: "/api/v1/tasks/{id}", summary: "Update task", auth: true, description: "Update an existing task.", body: { title: "Updated", stage: "testing", priority: "high" }, response: '{\n  "id": "t1",\n  "title": "Updated"\n}' },
            { method: "DELETE" as HttpMethod, path: "/api/v1/tasks/{id}", summary: "Delete task", auth: true, description: "Permanently remove a task.", body: undefined, response: '{\n  "deleted": true\n}' },
            { method: "PATCH" as HttpMethod, path: "/api/v1/tasks/{id}/move", summary: "Move to stage", auth: true, description: "Move a task to a different pipeline stage.", body: { stage: "production" }, response: '{\n  "id": "t1",\n  "stage": "production"\n}' },
        ],
    },
    {
        tag: "Meetings",
        icon: Wifi,
        description: "Voice & video calls",
        endpoints: [
            { method: "GET" as HttpMethod, path: "/api/v1/meetings", summary: "List meetings", auth: true, description: "Get recent meeting sessions.", body: undefined, response: '{\n  "data": [{ "id": "abc-def", "participants": ["Aria","Noah"], "duration": 29 }]\n}' },
            { method: "POST" as HttpMethod, path: "/api/v1/meetings", summary: "Start meeting", auth: true, description: "Create and start a new meeting.", body: { participants: ["u1", "u2"], type: "video" }, response: '{\n  "code": "xyz-1234",\n  "joinUrl": "/call?code=xyz-1234"\n}' },
        ],
    },
    {
        tag: "Voice Messages",
        icon: Bell,
        description: "Async audio messaging",
        endpoints: [
            { method: "GET" as HttpMethod, path: "/api/v1/voice-messages", summary: "List voice messages", auth: true, description: "Returns all voice messages for the authenticated user, sorted by newest first.", body: undefined, response: '{\n  "data": [{ "id": "vm1", "from": "Aria Chen", "duration": 12, "url": "/audio/vm1.ogg", "createdAt": "2026-06-18T09:00:00Z" }],\n  "total": 1\n}' },
            { method: "POST" as HttpMethod, path: "/api/v1/voice-messages", summary: "Send voice message", auth: true, description: "Upload and send a voice message as an audio blob (multipart/form-data).", body: { to: "u2", audio: "<binary blob>", duration: 12 }, response: '{\n  "id": "vm2",\n  "from": "u1",\n  "to": "u2",\n  "duration": 12,\n  "url": "/audio/vm2.ogg",\n  "createdAt": "2026-06-18T10:00:00Z"\n}' },
            { method: "DELETE" as HttpMethod, path: "/api/v1/voice-messages/{id}", summary: "Delete voice message", auth: true, description: "Permanently remove a voice message.", body: undefined, response: '{\n  "deleted": true\n}' },
            { method: "PATCH" as HttpMethod, path: "/api/v1/voice-messages/{id}/read", summary: "Mark as listened", auth: true, description: "Mark a voice message as listened/read.", body: undefined, response: '{\n  "id": "vm1",\n  "listened": true\n}' },
        ],
    },
];

// ─── Endpoint Modal (Add / Edit) ──────────────────────────────────────────────

function EndpointModal({
    endpoint, projectId, projects, onClose, onSave,
}: {
    endpoint?: ApiEndpoint;
    projectId: string;
    projects: Project[];
    onClose: () => void;
    onSave: (data: Omit<ApiEndpoint, "id" | "createdAt">) => void;
}) {
    const [method, setMethod] = useState<HttpMethod>(endpoint?.method || "GET");
    const [path, setPath] = useState(endpoint?.path || "/api/v1/");
    const [summary, setSummary] = useState(endpoint?.summary || "");
    const [desc, setDesc] = useState(endpoint?.description || "");
    const [reqBody, setReqBody] = useState(endpoint?.requestBody || "");
    const [resBody, setResBody] = useState(endpoint?.responseBody || '{\n  "success": true\n}');
    const [auth, setAuth] = useState(endpoint?.auth ?? true);
    const [tags, setTags] = useState(endpoint?.tags.join(", ") || "");
    const [projId, setProjId] = useState(endpoint?.projectId || projectId);
    const [error, setError] = useState("");

    const handleSave = () => {
        if (!path.trim() || !summary.trim()) { setError("Path and summary are required."); return; }
        if (!path.startsWith("/")) { setError("Path must start with /"); return; }
        onSave({
            method, path: path.trim(), summary: summary.trim(),
            description: desc.trim(), requestBody: reqBody.trim(),
            responseBody: resBody.trim(), auth,
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            projectId: projId,
        });
        onClose();
    };

    const ms = METHOD_STYLE[method];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ms.bg, border: `1px solid ${ms.border}` }}>
                            <Terminal size={14} style={{ color: ms.color }} />
                        </div>
                        <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                            {endpoint ? "Edit endpoint" : "New endpoint"}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ color: "var(--text-secondary)" }}><X size={16} /></button>
                </div>

                <div className="p-5 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
                    {/* Project + Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Project</label>
                            <select value={projId} onChange={(e) => setProjId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Method</label>
                            <div className="flex gap-1">
                                {METHODS.map((m) => (
                                    <button key={m} onClick={() => setMethod(m)}
                                        className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                                        style={{
                                            background: method === m ? METHOD_STYLE[m].bg : "var(--bg-card)",
                                            color: method === m ? METHOD_STYLE[m].color : "var(--text-secondary)",
                                            borderColor: method === m ? METHOD_STYLE[m].border : "var(--border)",
                                        }}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Path + Summary */}
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Path</label>
                        <input value={path} onChange={(e) => setPath(e.target.value)} placeholder="/api/v1/resource"
                            className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Summary</label>
                        <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief description of what this endpoint does"
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
                        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Full description..."
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    </div>

                    {/* Request + Response body */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Request body (JSON)</label>
                            <textarea value={reqBody} onChange={(e) => setReqBody(e.target.value)} rows={5} placeholder={'{\n  "key": "value"\n}'}
                                className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none resize-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Response body (JSON)</label>
                            <textarea value={resBody} onChange={(e) => setResBody(e.target.value)} rows={5} placeholder={'{\n  "id": "1"\n}'}
                                className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none resize-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>
                    </div>

                    {/* Tags + Auth */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Tags (comma-separated)</label>
                            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="users, auth, admin"
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Requires auth</label>
                            <button onClick={() => setAuth(!auth)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                                style={{
                                    background: auth ? "rgba(210,153,34,0.1)" : "var(--bg-card)",
                                    borderColor: auth ? "rgba(210,153,34,0.4)" : "var(--border)",
                                    color: auth ? "var(--yellow)" : "var(--text-secondary)",
                                }}>
                                <Lock size={13} /> {auth ? "Auth required" : "Public"}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}
                </div>

                <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ background: "var(--accent)", color: "#fff" }}>
                        {endpoint ? "Save changes" : "Add endpoint"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Single Endpoint Row ───────────────────────────────────────────────────────

function EndpointRow({
    endpointKey, method, path, summary, description, auth, body, response: defaultResponse,
    isOpen, onToggle, onEdit, onDelete, isCustom,
}: {
    endpointKey: string; method: HttpMethod; path: string; summary: string; description: string;
    auth: boolean; body?: string; response?: string; isOpen: boolean;
    onToggle: () => void; onEdit?: () => void; onDelete?: () => void; isCustom?: boolean;
}) {
    const [bodyInput, setBodyInput] = useState(body || "");
    const [resp, setResp] = useState<{ data: string; status: number; time: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const ms = METHOD_STYLE[method];

    const tryIt = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));
        setLoading(false);
        setResp({
            data: defaultResponse || '{\n  "success": true\n}',
            status: method === "DELETE" ? 200 : method === "POST" ? 201 : 200,
            time: Math.floor(30 + Math.random() * 150),
        });
    };

    const copy = (text: string, id: string) => {
        navigator.clipboard.writeText(text).catch(() => { });
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <div className="mb-2 rounded-xl border overflow-hidden transition-all"
            style={{ borderColor: isOpen ? ms.border : "var(--border)", background: "var(--bg-card)" }}>

            {/* Row header */}
            <div className="flex items-center gap-0 group">
                <button className="flex items-center gap-3 flex-1 px-4 py-3 text-left" onClick={onToggle}>
                    <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded-md text-center shrink-0"
                        style={{ background: ms.bg, color: ms.color, border: `1px solid ${ms.border}`, minWidth: 58 }}>
                        {method}
                    </span>
                    <code className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>{path}</code>
                    <span className="text-xs mr-2 hidden sm:block" style={{ color: "var(--text-secondary)" }}>{summary}</span>
                    {auth && (
                        <span className="shrink-0 mr-1">
                            <Lock size={11} style={{ color: "var(--yellow)" }} />
                        </span>
                    )}
                    {isCustom && (
                        <span className="text-xs px-1.5 py-0.5 rounded mr-1 shrink-0"
                            style={{ background: "var(--accent-subtle)", color: "var(--accent)", fontSize: 10 }}>
                            custom
                        </span>
                    )}
                </button>

                {/* Edit / Delete (custom only) */}
                {isCustom && (
                    <div className="flex items-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg border"
                            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>
                            <Pencil size={12} />
                        </button>
                        <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg border"
                            style={{ borderColor: "rgba(248,81,73,0.3)", color: "var(--red)", background: "rgba(248,81,73,0.05)" }}>
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded */}
            {isOpen && (
                <div className="border-t p-5" style={{ borderColor: "var(--border)" }}>
                    <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{description}</p>

                    {auth && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
                            style={{ background: "rgba(210,153,34,0.08)", border: "1px solid rgba(210,153,34,0.25)" }}>
                            <Lock size={13} style={{ color: "var(--yellow)" }} />
                            <span className="text-xs" style={{ color: "var(--yellow)" }}>
                                Requires <code className="px-1 py-0.5 rounded" style={{ background: "rgba(210,153,34,0.15)" }}>Authorization: Bearer &lt;token&gt;</code>
                            </span>
                        </div>
                    )}

                    {/* Request body */}
                    {(body !== undefined && body !== null) && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Request Body</h4>
                            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                                <div className="flex items-center justify-between px-3 py-1.5 border-b"
                                    style={{ background: "var(--bg-hover)", borderColor: "var(--border)" }}>
                                    <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>application/json</span>
                                    <button onClick={() => copy(bodyInput, "body")} style={{ color: "var(--text-secondary)" }}>
                                        {copied === "body" ? <Check size={13} style={{ color: "var(--green)" }} /> : <Copy size={13} />}
                                    </button>
                                </div>
                                <textarea value={bodyInput} onChange={(e) => setBodyInput(e.target.value)}
                                    rows={Math.min(10, (bodyInput.split("\n").length) + 1)}
                                    className="w-full px-3 py-2 text-xs font-mono outline-none resize-none"
                                    style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "none" }} />
                            </div>
                        </div>
                    )}

                    {/* Execute row */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <button onClick={tryIt} disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shrink-0"
                            style={{ background: ms.bg, color: ms.color, border: `1px solid ${ms.border}`, opacity: loading ? 0.65 : 1 }}>
                            <Play size={13} /> {loading ? "Executing…" : `Execute ${method}`}
                        </button>
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border overflow-hidden min-w-0"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <span className="text-xs font-bold shrink-0" style={{ color: ms.color }}>{method}</span>
                            <code className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{path}</code>
                        </div>
                        <button onClick={() => copy(path, "url")} style={{ color: "var(--text-secondary)" }}>
                            {copied === "url" ? <Check size={14} style={{ color: "var(--green)" }} /> : <Copy size={14} />}
                        </button>
                    </div>

                    {/* Response */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Response</h4>
                        {resp ? (
                            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                                <div className="flex items-center justify-between px-3 py-1.5 border-b"
                                    style={{ background: "var(--bg-hover)", borderColor: "var(--border)" }}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded"
                                            style={{ background: "rgba(63,185,80,0.12)", color: "var(--green)" }}>
                                            {resp.status} {resp.status === 200 ? "OK" : resp.status === 201 ? "Created" : ""}
                                        </span>
                                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{resp.time}ms</span>
                                    </div>
                                    <button onClick={() => copy(resp.data, "resp")} style={{ color: "var(--text-secondary)" }}>
                                        {copied === "resp" ? <Check size={13} style={{ color: "var(--green)" }} /> : <Copy size={13} />}
                                    </button>
                                </div>
                                <pre className="text-xs p-3 overflow-auto" style={{ color: "var(--green)", background: "var(--bg-secondary)", maxHeight: 220 }}>
                                    {resp.data}
                                </pre>
                            </div>
                        ) : (
                            <div className="rounded-xl border px-4 py-3 text-xs"
                                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>
                                Click <strong>Execute</strong> to see the live response
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApiDocsPage() {
    const { projects, apiEndpoints, activeProjectId, addApiEndpoint, updateApiEndpoint, deleteApiEndpoint } = useStore();

    const [filter, setFilter] = useState("");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [modal, setModal] = useState<{ open: boolean; endpoint?: ApiEndpoint }>({ open: false });
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"builtin" | "project">("builtin");
    const [selectedProj, setSelectedProj] = useState<string>(activeProjectId || projects[0]?.id || "");

    const activeProject = projects.find((p) => p.id === selectedProj) || projects[0];
    const ProjectIcon = activeProject ? (PROJECT_ICONS[activeProject.icon] || GitBranch) : GitBranch;

    // Project-scoped endpoints
    const projectEndpoints = useMemo(() =>
        apiEndpoints.filter((e) => e.projectId === selectedProj &&
            (!filter || e.path.toLowerCase().includes(filter.toLowerCase()) ||
                e.summary.toLowerCase().includes(filter.toLowerCase()) ||
                e.method.toLowerCase().includes(filter.toLowerCase()))),
        [apiEndpoints, selectedProj, filter]
    );

    // Group project endpoints by tags
    const groupedProjectEndpoints = useMemo(() => {
        const map: Record<string, ApiEndpoint[]> = {};
        projectEndpoints.forEach((e) => {
            const tag = e.tags[0] || "general";
            if (!map[tag]) map[tag] = [];
            map[tag].push(e);
        });
        return map;
    }, [projectEndpoints]);

    // Filtered built-in groups
    const filteredBuiltin = useMemo(() =>
        BUILTIN_GROUPS.map((g) => ({
            ...g,
            endpoints: g.endpoints.filter((e) =>
                !filter || e.path.toLowerCase().includes(filter.toLowerCase()) ||
                e.summary.toLowerCase().includes(filter.toLowerCase()) ||
                e.method.toLowerCase().includes(filter.toLowerCase()) ||
                g.tag.toLowerCase().includes(filter.toLowerCase())
            ),
        })).filter((g) => g.endpoints.length > 0),
        [filter]
    );

    const toggleExpand = (k: string) => setExpanded((prev) => prev === k ? null : k);

    return (
        <div className="flex flex-col h-full">
            <TopNav title="API Reference" subtitle="v1 · Interactive Explorer" />

            <div className="flex flex-1 overflow-hidden">

                {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
                <div className="w-52 border-r flex flex-col shrink-0 overflow-hidden"
                    style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>

                    {/* Search */}
                    <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
                        <input value={filter} onChange={(e) => setFilter(e.target.value)}
                            placeholder="Search endpoints..."
                            className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
                        {(["builtin", "project"] as const).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className="flex-1 py-2 text-xs font-medium capitalize"
                                style={{
                                    background: activeTab === tab ? "var(--accent-subtle)" : "transparent",
                                    color: activeTab === tab ? "var(--accent)" : "var(--text-secondary)",
                                    borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                                }}>
                                {tab === "builtin" ? "Platform" : "Project"}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {activeTab === "builtin" && (
                            <>
                                {BUILTIN_GROUPS.map((g) => {
                                    const GIcon = g.icon;
                                    return (
                                        <div key={g.tag} className="mb-3">
                                            <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                                                <GIcon size={12} style={{ color: "var(--text-secondary)" }} />
                                                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{g.tag}</span>
                                            </div>
                                            {g.endpoints.map((e) => {
                                                const k = `builtin:${e.method}:${e.path}`;
                                                const ms = METHOD_STYLE[e.method];
                                                return (
                                                    <button key={k} onClick={() => { setActiveTab("builtin"); toggleExpand(k); }}
                                                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left mb-0.5 transition-colors"
                                                        style={{ background: expanded === k ? "var(--accent-subtle)" : "transparent" }}>
                                                        <span className="text-xs font-bold shrink-0" style={{ color: ms.color, width: 42 }}>{e.method}</span>
                                                        <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{e.summary}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {activeTab === "project" && (
                            <>
                                {/* Project picker */}
                                <div className="mb-3">
                                    {projects.map((p) => {
                                        const PIcon = PROJECT_ICONS[p.icon] || GitBranch;
                                        const count = apiEndpoints.filter((e) => e.projectId === p.id).length;
                                        return (
                                            <button key={p.id} onClick={() => setSelectedProj(p.id)}
                                                className="flex items-center gap-2 w-full px-2 py-2 rounded-lg mb-0.5 transition-all"
                                                style={{
                                                    background: selectedProj === p.id ? "var(--accent-subtle)" : "transparent",
                                                    border: selectedProj === p.id ? "1px solid var(--accent)" : "1px solid transparent",
                                                }}>
                                                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                                    style={{ background: p.color }}>
                                                    <PIcon size={12} color="#fff" />
                                                </div>
                                                <span className="text-xs flex-1 text-left truncate" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                                                <span className="text-xs px-1.5 py-0.5 rounded-full"
                                                    style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedProj && (
                                    <>
                                        <div className="h-px my-2" style={{ background: "var(--border)" }} />
                                        {projectEndpoints.map((e) => {
                                            const k = `custom:${e.id}`;
                                            const ms = METHOD_STYLE[e.method];
                                            return (
                                                <button key={k} onClick={() => toggleExpand(k)}
                                                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left mb-0.5"
                                                    style={{ background: expanded === k ? "var(--accent-subtle)" : "transparent" }}>
                                                    <span className="text-xs font-bold shrink-0" style={{ color: ms.color, width: 42 }}>{e.method}</span>
                                                    <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{e.summary}</span>
                                                </button>
                                            );
                                        })}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── Main Content ─────────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-5">

                    {/* API info bar */}
                    <div className="flex items-center gap-4 mb-5 p-4 rounded-xl border"
                        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "var(--accent)" }}>
                            <Terminal size={18} color="#fff" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Project Pipeline API</span>
                                <span className="text-xs px-2 py-0.5 rounded-full border"
                                    style={{ borderColor: "var(--green)", color: "var(--green)", background: "rgba(63,185,80,0.08)" }}>
                                    v1.0.0 · Live
                                </span>
                            </div>
                            <code className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                https://api.projectpipeline.app
                            </code>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-lg"
                                style={{ background: "rgba(88,166,255,0.1)", color: "var(--blue)", border: "1px solid rgba(88,166,255,0.2)" }}>
                                {BUILTIN_GROUPS.reduce((n, g) => n + g.endpoints.length, 0) + apiEndpoints.length} endpoints
                            </span>
                        </div>
                    </div>

                    {/* ── Built-in tab ──────────────────────────────────────────────── */}
                    {activeTab === "builtin" && (
                        <>
                            {filteredBuiltin.length === 0 && (
                                <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
                                    No endpoints match your filter.
                                </div>
                            )}
                            {filteredBuiltin.map((group) => {
                                const GIcon = group.icon;
                                return (
                                    <div key={group.tag} className="mb-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-6 h-6 rounded-md flex items-center justify-center"
                                                style={{ background: "var(--accent-subtle)" }}>
                                                <GIcon size={13} style={{ color: "var(--accent)" }} />
                                            </div>
                                            <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{group.tag}</h2>
                                            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
                                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{group.description}</span>
                                        </div>
                                        {group.endpoints.map((e) => {
                                            const k = `builtin:${e.method}:${e.path}`;
                                            return (
                                                <EndpointRow key={k} endpointKey={k}
                                                    method={e.method} path={e.path} summary={e.summary}
                                                    description={e.description} auth={e.auth}
                                                    body={e.body ? JSON.stringify(e.body, null, 2) : undefined}
                                                    response={e.response}
                                                    isOpen={expanded === k}
                                                    onToggle={() => toggleExpand(k)}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* ── Project tab ───────────────────────────────────────────────── */}
                    {activeTab === "project" && (
                        <>
                            {/* Project header */}
                            {activeProject && (
                                <div className="flex items-center justify-between mb-5 p-4 rounded-xl border"
                                    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: activeProject.color }}>
                                            <ProjectIcon size={18} color="#fff" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{activeProject.name}</p>
                                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                {activeProject.description || "No description"} · {projectEndpoints.length} endpoint{projectEndpoints.length !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setModal({ open: true })}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                                        style={{ background: "var(--accent)", color: "#fff" }}>
                                        <Plus size={14} /> Add endpoint
                                    </button>
                                </div>
                            )}

                            {projectEndpoints.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4"
                                    style={{ color: "var(--text-secondary)" }}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                        style={{ background: "var(--bg-card)", border: "2px dashed var(--border)" }}>
                                        <Terminal size={28} style={{ color: "var(--text-secondary)" }} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>No endpoints yet</p>
                                        <p className="text-sm">Add your first API endpoint for <strong>{activeProject?.name}</strong></p>
                                    </div>
                                    <button onClick={() => setModal({ open: true })}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                                        style={{ background: "var(--accent)", color: "#fff" }}>
                                        <Plus size={15} /> Add first endpoint
                                    </button>
                                </div>
                            ) : (
                                Object.entries(groupedProjectEndpoints).map(([tag, eps]) => (
                                    <div key={tag} className="mb-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-6 h-6 rounded-md flex items-center justify-center"
                                                style={{ background: "var(--accent-subtle)" }}>
                                                <Tag size={12} style={{ color: "var(--accent)" }} />
                                            </div>
                                            <h2 className="font-bold text-sm capitalize" style={{ color: "var(--text-primary)" }}>{tag}</h2>
                                            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
                                            <span className="text-xs px-2 py-0.5 rounded-full"
                                                style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
                                                {eps.length} endpoint{eps.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        {eps.map((e) => {
                                            const k = `custom:${e.id}`;
                                            return (
                                                <EndpointRow key={k} endpointKey={k}
                                                    method={e.method} path={e.path} summary={e.summary}
                                                    description={e.description} auth={e.auth}
                                                    body={e.requestBody || undefined}
                                                    response={e.responseBody}
                                                    isOpen={expanded === k}
                                                    onToggle={() => toggleExpand(k)}
                                                    onEdit={() => setModal({ open: true, endpoint: e })}
                                                    onDelete={() => setDeleteTarget(e.id)}
                                                    isCustom
                                                />
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Endpoint Modal ──────────────────────────────────────────────────── */}
            {modal.open && (
                <EndpointModal
                    endpoint={modal.endpoint}
                    projectId={selectedProj}
                    projects={projects}
                    onClose={() => setModal({ open: false })}
                    onSave={(data) => {
                        if (modal.endpoint) updateApiEndpoint(modal.endpoint.id, data);
                        else addApiEndpoint(data);
                        setActiveTab("project");
                        setSelectedProj(data.projectId);
                    }}
                />
            )}

            {/* ── Delete confirm ─────────────────────────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }}>
                    <div className="rounded-2xl border p-6 w-80 shadow-2xl"
                        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: "rgba(248,81,73,0.12)" }}>
                            <Trash2 size={18} style={{ color: "var(--red)" }} />
                        </div>
                        <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Delete endpoint?</h3>
                        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>This action cannot be undone.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2 rounded-xl text-sm border"
                                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
                                Cancel
                            </button>
                            <button onClick={() => { deleteApiEndpoint(deleteTarget); setDeleteTarget(null); }}
                                className="flex-1 py-2 rounded-xl text-sm font-medium"
                                style={{ background: "var(--red)", color: "#fff" }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

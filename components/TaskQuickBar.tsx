"use client";
import { useState, useRef, useEffect } from "react";
import {
    ListTodo, Plus, Pencil, Trash2, X, ChevronDown, Search,
    CheckCircle2, Circle, Clock, AlertCircle,
} from "lucide-react";
import { useStore, Task, Stage, Priority } from "@/lib/store";

// ── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<Priority, string> = {
    low: "#3fb950",
    medium: "#d29922",
    high: "#f85149",
};

const STAGE_LABELS: Record<string, string> = {
    planning: "Planning",
    design: "Design",
    development: "Dev",
    testing: "Testing",
    staging: "Staging",
    production: "Prod",
};

const STAGE_COLORS: Record<string, string> = {
    planning: "#8b949e",
    design: "#58a6ff",
    development: "#7c3aed",
    testing: "#d29922",
    staging: "#f0883e",
    production: "#3fb950",
};

const STAGES: Stage[] = ["planning", "design", "development", "testing", "staging", "production"];

// ── Inline Input ─────────────────────────────────────────────────────────────
function Field({
    label, value, onChange, placeholder, type = "text",
}: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string;
}) {
    return (
        <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
            <input
                type={type} value={value} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
        </div>
    );
}

// ── Task Form (create / edit) ─────────────────────────────────────────────────
function TaskForm({
    task, defaultStage, projectId, onSave, onCancel,
}: {
    task?: Task;
    defaultStage?: Stage;
    projectId?: string;
    onSave: (data: Omit<Task, "id" | "createdAt">) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState(task?.title || "");
    const [desc, setDesc] = useState(task?.description || "");
    const [stage, setStage] = useState<Stage>(task?.stage || defaultStage || "planning");
    const [priority, setPriority] = useState<Priority>(task?.priority || "medium");
    const [assignee, setAssignee] = useState(task?.assignee || "");
    const [tags, setTags] = useState(task?.tags.join(", ") || "");
    const [dueDate, setDueDate] = useState(task?.dueDate || "");

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({
            title: title.trim(),
            description: desc.trim(),
            stage,
            priority,
            assignee: assignee.trim(),
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            dueDate,
            projectId,
        });
    };

    return (
        <div className="flex flex-col gap-2.5 p-3 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {task ? "Edit task" : "New task"}
                </span>
                <button onClick={onCancel} style={{ color: "var(--text-secondary)" }}>
                    <X size={14} />
                </button>
            </div>

            <Field label="Title *" value={title} onChange={setTitle} placeholder="Task title..." />

            <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
                <textarea
                    value={desc} onChange={(e) => setDesc(e.target.value)}
                    placeholder="Optional..."
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-lg text-xs outline-none resize-none"
                    style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Stage</label>
                    <select
                        value={stage} onChange={(e) => setStage(e.target.value as Stage)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    >
                        {STAGES.map((s) => (
                            <option key={s} value={s}>{STAGE_LABELS[s] || s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Priority</label>
                    <select
                        value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <Field label="Assignee" value={assignee} onChange={setAssignee} placeholder="Name..." />
            <Field label="Tags (comma-sep)" value={tags} onChange={setTags} placeholder="feat, bug..." />
            <Field label="Due date" value={dueDate} onChange={setDueDate} type="date" />

            <div className="flex gap-2 pt-1">
                <button
                    onClick={onCancel}
                    className="flex-1 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-primary)" }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: title.trim() ? "var(--accent)" : "var(--bg-hover)", color: title.trim() ? "#fff" : "var(--text-secondary)" }}
                >
                    {task ? "Save" : "Create"}
                </button>
            </div>
        </div>
    );
}

// ── Task Row ──────────────────────────────────────────────────────────────────
function TaskRow({
    task, onEdit, onDelete,
}: {
    task: Task;
    onEdit: (t: Task) => void;
    onDelete: (id: string) => void;
}) {
    const stageColor = STAGE_COLORS[task.stage] || "#8b949e";
    const prioColor = PRIORITY_COLORS[task.priority];
    const isDone = task.stage === "production";

    return (
        <div
            className="group flex items-start gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-90"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 4 }}
        >
            {/* Stage dot */}
            <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: stageColor }} />

            <div className="flex-1 min-w-0">
                <p
                    className="text-xs font-medium leading-snug truncate"
                    style={{ color: "var(--text-primary)", textDecoration: isDone ? "line-through" : "none" }}
                >
                    {task.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs" style={{ color: stageColor }}>
                        {STAGE_LABELS[task.stage] || task.stage}
                    </span>
                    <span className="text-xs px-1.5 py-0 rounded-full font-medium"
                        style={{ background: `${prioColor}22`, color: prioColor }}>
                        {task.priority}
                    </span>
                    {task.assignee && (
                        <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                            · {task.assignee.split(" ")[0]}
                        </span>
                    )}
                    {task.dueDate && (
                        <span className="text-xs flex items-center gap-0.5" style={{ color: "var(--text-secondary)" }}>
                            <Clock size={9} /> {task.dueDate}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions — show on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={() => onEdit(task)}
                    className="p-1 rounded hover:opacity-70"
                    style={{ color: "var(--text-secondary)" }}
                    title="Edit"
                >
                    <Pencil size={11} />
                </button>
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 rounded hover:opacity-70"
                    style={{ color: "var(--red)" }}
                    title="Delete"
                >
                    <Trash2 size={11} />
                </button>
            </div>
        </div>
    );
}

// ── Main TaskQuickBar ─────────────────────────────────────────────────────────
export default function TaskQuickBar() {
    const { tasks, projects, activeProjectId, addTask, updateTask, deleteTask } = useStore();
    const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | Stage>("all");
    const [formMode, setFormMode] = useState<"none" | "create" | { task: Task }>("none");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
                setFormMode("none");
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const projectTasks = tasks.filter((t) => t.projectId === activeProject?.id);
    const filtered = projectTasks.filter((t) => {
        const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.assignee || "").toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
        const matchFilter = filter === "all" || t.stage === filter;
        return matchSearch && matchFilter;
    });

    const taskCountByStage = (s: Stage) => projectTasks.filter((t) => t.stage === s).length;
    const totalTasks = projectTasks.length;
    const doneTasks = projectTasks.filter((t) => t.stage === "production").length;

    const handleSave = (data: Omit<Task, "id" | "createdAt">) => {
        if (typeof formMode === "object") {
            updateTask(formMode.task.id, data);
        } else {
            addTask({ ...data, projectId: activeProject?.id });
        }
        setFormMode("none");
    };

    const handleDelete = (id: string) => {
        deleteTask(id);
        setDeleteConfirm(null);
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Trigger button */}
            <button
                onClick={() => { setOpen(!open); setFormMode("none"); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors"
                style={{
                    borderColor: open ? "var(--accent)" : "var(--border)",
                    background: open ? "var(--accent-subtle)" : "var(--bg-card)",
                    color: open ? "var(--accent)" : "var(--text-secondary)",
                }}
                title="Task manager"
            >
                <ListTodo size={13} />
                <span className="hidden sm:inline">Tasks</span>
                {totalTasks > 0 && (
                    <span
                        className="px-1.5 py-0 rounded-full text-xs font-medium"
                        style={{ background: "var(--accent)", color: "#fff", fontSize: 10 }}
                    >
                        {totalTasks}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="absolute right-0 top-9 z-50 rounded-xl border shadow-2xl overflow-hidden flex flex-col"
                    style={{
                        width: 340,
                        maxHeight: "80vh",
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        boxShadow: "var(--shadow)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
                        style={{ borderColor: "var(--border)" }}
                    >
                        <div className="flex items-center gap-2">
                            <ListTodo size={14} style={{ color: "var(--accent)" }} />
                            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                                {activeProject?.name || "Tasks"}
                            </span>
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                {doneTasks}/{totalTasks} done
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => { setFormMode("create"); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                                style={{ background: "var(--accent)", color: "#fff" }}
                                title="New task"
                            >
                                <Plus size={11} /> New
                            </button>
                            <button onClick={() => setOpen(false)} style={{ color: "var(--text-secondary)" }}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 shrink-0" style={{ background: "var(--bg-hover)" }}>
                        <div
                            className="h-full transition-all rounded-full"
                            style={{
                                width: totalTasks > 0 ? `${(doneTasks / totalTasks) * 100}%` : "0%",
                                background: "var(--green)",
                            }}
                        />
                    </div>

                    {/* Search + filter */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
                        <div className="flex-1 flex items-center gap-2 px-2 py-1 rounded-lg"
                            style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                            <Search size={11} style={{ color: "var(--text-secondary)" }} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tasks..."
                                className="flex-1 text-xs outline-none bg-transparent"
                                style={{ color: "var(--text-primary)" }}
                            />
                            {search && (
                                <button onClick={() => setSearch("")} style={{ color: "var(--text-secondary)" }}>
                                    <X size={10} />
                                </button>
                            )}
                        </div>

                        {/* Stage filter dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs border"
                                style={{ borderColor: "var(--border)", background: "var(--bg-primary)", color: "var(--text-secondary)" }}
                            >
                                {filter === "all" ? "All" : STAGE_LABELS[filter] || filter}
                                <ChevronDown size={10} />
                            </button>
                            {filterOpen && (
                                <div
                                    className="absolute right-0 top-7 z-10 rounded-lg border shadow-lg overflow-hidden"
                                    style={{ background: "var(--bg-card)", borderColor: "var(--border)", minWidth: 110 }}
                                >
                                    <button
                                        onClick={() => { setFilter("all"); setFilterOpen(false); }}
                                        className="flex items-center justify-between w-full px-3 py-1.5 text-xs hover:opacity-80"
                                        style={{ color: filter === "all" ? "var(--accent)" : "var(--text-primary)" }}
                                    >
                                        All stages
                                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{totalTasks}</span>
                                    </button>
                                    {STAGES.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setFilter(s); setFilterOpen(false); }}
                                            className="flex items-center justify-between w-full px-3 py-1.5 text-xs hover:opacity-80"
                                            style={{ color: filter === s ? STAGE_COLORS[s] : "var(--text-primary)" }}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: STAGE_COLORS[s] }} />
                                                {STAGE_LABELS[s]}
                                            </span>
                                            <span style={{ color: "var(--text-secondary)" }}>{taskCountByStage(s)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Task list */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Circle size={28} style={{ color: "var(--border)" }} />
                                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                    {search ? "No tasks match your search" : "No tasks yet — create one!"}
                                </p>
                            </div>
                        ) : (
                            filtered.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    onEdit={(t) => setFormMode({ task: t })}
                                    onDelete={(id) => setDeleteConfirm(id)}
                                />
                            ))
                        )}
                    </div>

                    {/* Create / Edit form */}
                    {formMode !== "none" && (
                        <TaskForm
                            task={typeof formMode === "object" ? formMode.task : undefined}
                            projectId={activeProject?.id}
                            onSave={handleSave}
                            onCancel={() => setFormMode("none")}
                        />
                    )}

                    {/* Delete confirm */}
                    {deleteConfirm && (
                        <div
                            className="absolute inset-0 z-20 flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.6)", borderRadius: 12 }}
                        >
                            <div
                                className="rounded-xl border p-4 w-64"
                                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={16} style={{ color: "var(--red)" }} />
                                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Delete task?</span>
                                </div>
                                <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>This cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 py-1.5 rounded-lg text-xs border"
                                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirm)}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                                        style={{ background: "var(--red)", color: "#fff" }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

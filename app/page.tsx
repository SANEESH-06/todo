"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay,
  rectIntersection, useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, MoreHorizontal, Pencil, Trash2, X, ChevronDown,
  GitBranch, Globe, Zap, Database, Shield, Layers, Box, Cpu, Cloud, Code2,
  BarChart2, Bell, FileText, Link2, Package, Settings2, Star, Terminal, Wifi, Tag,
  Clock, ArrowRight, User,
} from "lucide-react";
import { useStore, Task, Stage, Priority, Project } from "@/lib/store";
import TopNav from "@/components/TopNav";
import { toast } from "@/components/Toast";

const STAGES: { id: Stage; label: string; color: string; desc: string; custom?: boolean }[] = [
  { id: "planning", label: "Planning", color: "#8b949e", desc: "Define scope & requirements" },
  { id: "design", label: "Design", color: "#58a6ff", desc: "UX, wireframes & specs" },
  { id: "development", label: "Development", color: "#7c3aed", desc: "Build features & code" },
  { id: "testing", label: "Testing", color: "#d29922", desc: "QA, test & integration" },
  { id: "staging", label: "Staging", color: "#f0883e", desc: "Pre-prod verification" },
  { id: "production", label: "Production", color: "#3fb950", desc: "Live & monitoring" },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#3fb950", medium: "#d29922", high: "#f85149",
};

const PROJECT_COLORS = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#0891b2", "#9333ea", "#db2777"];
const ROW_COLORS = ["#8b949e", "#58a6ff", "#7c3aed", "#d29922", "#f0883e", "#3fb950", "#f85149", "#a78bfa", "#db2777", "#0891b2"];

const PROJECT_ICONS: Record<string, React.ElementType> = {
  GitBranch, Globe, Zap, Database, Shield, Layers, Box, Cpu, Cloud, Code2,
  BarChart2, Bell, FileText, Link2, Package, Settings2, Star, Terminal, Wifi, Tag,
};

// avatar background palette (consistent per name)
const AVATAR_PALETTE = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#0891b2", "#9333ea", "#db2777", "#f0883e"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function resolveStage(overId: string, tasks: Task[], allStages: { id: Stage }[]): Stage | null {
  if (overId.startsWith("col-")) return overId.slice(4) as Stage;
  const overTask = tasks.find((t) => t.id === overId);
  if (overTask) return overTask.stage;
  return null;
}

// ── Column droppable wrapper ──────────────────────────────────────────────────
function ColumnDroppable({ stageId, children }: { stageId: Stage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${stageId}` });
  return (
    <div ref={setNodeRef} className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto"
      style={{
        minHeight: 80, borderRadius: 8, transition: "background 0.15s",
        background: isOver ? "var(--accent-subtle)" : "transparent"
      }}>
      {children}
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete }: {
  task: Task; onEdit: (t: Task) => void; onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0 : 1,
    pointerEvents: isDragging ? "none" as const : undefined,
  };
  const [menu, setMenu] = useState(false);
  const stageInfo = STAGES.find((s) => s.id === task.stage);

  return (
    <div ref={setNodeRef} style={{ ...style, background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      {...attributes} {...listeners}
      className="rounded-lg border p-3 cursor-grab active:cursor-grabbing group select-none"
      onClick={(e) => e.stopPropagation()}>

      {/* ── Assignee row at TOP ── */}
      {task.assignee ? (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: avatarColor(task.assignee), fontSize: "9px", fontWeight: 700 }}>
            {task.assignee.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>
            {task.assignee}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--bg-hover)", border: "1px dashed var(--border)" }}>
            <User size={9} style={{ color: "var(--text-secondary)" }} />
          </div>
          <span className="text-xs" style={{ color: "var(--border)" }}>Unassigned</span>
        </div>
      )}

      {/* Title + menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium leading-snug flex-1" style={{ color: "var(--text-primary)" }}>
          {task.title}
        </span>
        <div className="relative shrink-0" onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
            style={{ color: "var(--text-secondary)" }}>
            <MoreHorizontal size={14} />
          </button>
          {menu && (
            <div className="absolute right-0 top-6 z-20 rounded-lg border shadow-lg w-32 overflow-hidden"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
              <button onClick={(e) => { e.stopPropagation(); onEdit(task); setMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs"
                style={{ color: "var(--text-primary)" }}>
                <Pencil size={12} /> Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); setMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs"
                style={{ color: "var(--red)" }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs mb-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {task.tags.map((tag) => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>{tag}</span>
          ))}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: `${PRIORITY_COLORS[task.priority]}22`, color: PRIORITY_COLORS[task.priority] }}>
          {task.priority}
        </span>
      </div>

      {task.dueDate && (
        <div className="flex items-center gap-1 mt-2">
          <Clock size={10} style={{ color: "var(--text-secondary)" }} />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{task.dueDate}</span>
        </div>
      )}
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────
function Column({ stage, tasks, activeId, onAddTask, onEditTask, onDeleteTask, onDeleteStage }: {
  stage: { id: Stage; label: string; color: string; desc: string; custom?: boolean };
  tasks: Task[]; activeId: string | null;
  onAddTask: (s: Stage) => void; onEditTask: (t: Task) => void;
  onDeleteTask: (id: string) => void; onDeleteStage?: (id: Stage) => void;
}) {
  return (
    <div className="flex flex-col rounded-xl w-60 shrink-0 border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)", minHeight: 200 }}>
      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{stage.label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md"
            style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>{tasks.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {stage.custom && onDeleteStage && (
            <button onClick={() => onDeleteStage(stage.id)} style={{ color: "var(--red)" }}
              className="hover:opacity-70 transition-opacity" title="Remove column">
              <X size={13} />
            </button>
          )}
          <button onClick={() => onAddTask(stage.id)} style={{ color: "var(--text-secondary)" }}
            className="hover:text-white transition-colors" title="Add task">
            <Plus size={15} />
          </button>
        </div>
      </div>
      <p className="px-3 pt-1 pb-0 text-xs" style={{ color: "var(--text-secondary)" }}>{stage.desc}</p>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ColumnDroppable stageId={stage.id}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center rounded-lg border-2 border-dashed py-8"
              style={{ borderColor: activeId ? "var(--accent)" : "var(--border)", opacity: activeId ? 0.7 : 0.5 }}>
              <span className="text-xs select-none" style={{ color: "var(--text-secondary)" }}>Drop here</span>
            </div>
          )}
        </ColumnDroppable>
      </SortableContext>
      <button onClick={() => onAddTask(stage.id)}
        className="flex items-center gap-1 text-xs px-3 py-2 border-t w-full hover:opacity-80 transition-opacity"
        style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
        <Plus size={12} /> Add task
      </button>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
    </div>
  );
}

// ── Assignee Picker ───────────────────────────────────────────────────────────
function AssigneePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const adminUsers = useStore((s) => s.adminUsers);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = adminUsers.filter((u) =>
    u.status !== "banned" &&
    (search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()))
  );

  const selected = adminUsers.find((u) => u.name === value);

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Assignee</label>

      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left"
        style={{ background: "var(--bg-card)", border: `1px solid ${open ? "var(--accent)" : "var(--border)"}`, color: "var(--text-primary)" }}
      >
        {selected ? (
          <>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ background: avatarColor(selected.name), fontSize: "10px", fontWeight: 700 }}>
              {selected.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium block truncate">{selected.name}</span>
              <span className="text-xs block" style={{ color: "var(--text-secondary)" }}>{selected.role}</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--bg-hover)", border: "1px dashed var(--border)" }}>
              <User size={12} style={{ color: "var(--text-secondary)" }} />
            </div>
            <span style={{ color: "var(--text-secondary)" }}>Unassigned — pick a team member</span>
          </>
        )}
        <ChevronDown size={14} className="shrink-0 ml-auto" style={{
          color: "var(--text-secondary)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }} />
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border shadow-2xl overflow-hidden"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>

          {/* search */}
          <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          {/* unassign option */}
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:opacity-80 transition-opacity border-b"
            style={{
              background: !value ? "var(--accent-subtle)" : "transparent",
              borderColor: "var(--border)",
              color: !value ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--bg-hover)", border: "1px dashed var(--border)" }}>
              <User size={13} style={{ color: "var(--text-secondary)" }} />
            </div>
            <span className="font-medium">Unassigned</span>
          </button>

          {/* members */}
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-secondary)" }}>No members found</p>
            ) : (
              filtered.map((u) => {
                const isSelected = value === u.name;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { onChange(u.name); setOpen(false); setSearch(""); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:opacity-80 transition-opacity"
                    style={{ background: isSelected ? "var(--accent-subtle)" : "transparent" }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 font-bold"
                      style={{ background: avatarColor(u.name), fontSize: "11px" }}>
                      {u.avatar}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-medium block truncate"
                        style={{ color: isSelected ? "var(--accent)" : "var(--text-primary)" }}>
                        {u.name}
                      </span>
                      <span className="text-xs block" style={{ color: "var(--text-secondary)" }}>{u.role}</span>
                    </div>
                    {/* online dot */}
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: u.status === "active" ? "var(--green)" : "var(--border)" }} />
                    {isSelected && (
                      <span style={{ color: "var(--accent)", fontSize: 16 }}>✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Task Modal ────────────────────────────────────────────────────────────────
function TaskModal({ task, defaultStage, onClose, onSave }: {
  task?: Task; defaultStage?: Stage; onClose: () => void;
  onSave: (data: Omit<Task, "id" | "createdAt">) => void;
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
      title: title.trim(), description: desc.trim(), stage, priority,
      assignee: assignee.trim(), tags: tags.split(",").map((t) => t.trim()).filter(Boolean), dueDate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border shadow-xl overflow-hidden"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {task ? "Edit task" : "New task"}
          </h2>
          <button onClick={onClose} style={{ color: "var(--text-secondary)" }}><X size={16} /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <Input label="Title" value={title} onChange={setTitle} placeholder="Task title..." />
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description..."
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value as Stage)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <AssigneePicker value={assignee} onChange={setAssignee} />
          <Input label="Tags (comma-separated)" value={tags} onChange={setTags} placeholder="feat, bug, docs..." />
          <Input label="Due date" value={dueDate} onChange={setDueDate} type="date" />
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}>
            {task ? "Save changes" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project Modal ─────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose, onSave }: {
  project?: Project; onClose: () => void;
  onSave: (data: Omit<Project, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState(project?.name || "");
  const [desc, setDesc] = useState(project?.description || "");
  const [color, setColor] = useState(project?.color || PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(project?.icon || "GitBranch");
  const SelectedIcon = PROJECT_ICONS[icon] || GitBranch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border shadow-xl"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color }}>
              <SelectedIcon size={14} color="#fff" />
            </div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {project ? "Edit project" : "New project"}
            </h2>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-secondary)" }}><X size={16} /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <Input label="Project name" value={name} onChange={setName} placeholder="My Project..." />
          <Input label="Description" value={desc} onChange={setDesc} placeholder="What is this project?" />
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: color === c ? "var(--text-primary)" : "transparent" }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Icon</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(PROJECT_ICONS).map(([n, IconComp]) => (
                <button key={n} onClick={() => setIcon(n)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all"
                  style={{ background: icon === n ? color : "var(--bg-card)", borderColor: icon === n ? color : "var(--border)" }}>
                  <IconComp size={14} color={icon === n ? "#fff" : "var(--text-secondary)"} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
            Cancel
          </button>
          <button onClick={() => { if (name.trim()) { onSave({ name, description: desc, color, icon }); onClose(); } }}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}>
            {project ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Row Modal ─────────────────────────────────────────────────────────────
function AddRowModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (s: { id: string; label: string; color: string; desc: string; custom: true }) => void;
}) {
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(ROW_COLORS[0]);

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      id: `custom_${label.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
      label: label.trim(), desc: desc.trim() || label.trim(), color, custom: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border shadow-xl"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Add column</h2>
          <button onClick={onClose} style={{ color: "var(--text-secondary)" }}><X size={16} /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <Input label="Column name" value={label} onChange={setLabel} placeholder="e.g. Review, Blocked..." />
          <Input label="Description" value={desc} onChange={setDesc} placeholder="Short description..." />
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {ROW_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: color === c ? "var(--text-primary)" : "transparent" }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Add column
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Activity log type ─────────────────────────────────────────────────────────
interface ActivityEntry {
  id: string;
  taskTitle: string;
  assignee?: string;
  from: string;
  to: string;
  at: number; // timestamp ms
}

// ── Last Submitted / Activity bar ─────────────────────────────────────────────
function ActivityBar({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return null;
  const last = entries[entries.length - 1];
  const fromStage = STAGES.find((s) => s.id === last.from);
  const toStage = STAGES.find((s) => s.id === last.to);
  const elapsed = Math.round((Date.now() - last.at) / 1000);
  const timeLabel = elapsed < 60 ? "just now" : elapsed < 3600 ? `${Math.floor(elapsed / 60)}m ago` : `${Math.floor(elapsed / 3600)}h ago`;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 border-b shrink-0 overflow-x-auto"
      style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
      <Clock size={11} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
      <span className="text-xs shrink-0" style={{ color: "var(--text-secondary)" }}>Last move:</span>

      {last.assignee && (
        <>
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: avatarColor(last.assignee), fontSize: "8px", fontWeight: 700 }}>
            {last.assignee.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-xs font-medium shrink-0" style={{ color: "var(--text-primary)" }}>
            {last.assignee.split(" ")[0]}
          </span>
        </>
      )}

      <span className="text-xs font-semibold truncate max-w-32" style={{ color: "var(--text-primary)" }}>
        "{last.taskTitle}"
      </span>

      <span className="flex items-center gap-1 shrink-0 text-xs">
        <span className="px-1.5 py-0.5 rounded text-xs font-medium"
          style={{ background: `${fromStage?.color ?? "#8b949e"}22`, color: fromStage?.color ?? "#8b949e" }}>
          {fromStage?.label ?? last.from}
        </span>
        <ArrowRight size={11} style={{ color: "var(--text-secondary)" }} />
        <span className="px-1.5 py-0.5 rounded text-xs font-medium"
          style={{ background: `${toStage?.color ?? "#3fb950"}22`, color: toStage?.color ?? "#3fb950" }}>
          {toStage?.label ?? last.to}
        </span>
      </span>

      <span className="text-xs shrink-0 ml-auto" style={{ color: "var(--text-secondary)" }}>{timeLabel}</span>

      {entries.length > 1 && (
        <span className="text-xs shrink-0 px-1.5 py-0.5 rounded"
          style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
          +{entries.length - 1} more
        </span>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PipelinePage() {
  const {
    tasks, projects, activeProjectId,
    addTask, updateTask, deleteTask, moveTask,
    addProject, updateProject, deleteProject, setActiveProject,
  } = useStore();

  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task; stage?: Stage }>({ open: false });
  const [projectModal, setProjectModal] = useState<{ open: boolean; project?: Project }>({ open: false });
  const [addRowModal, setAddRowModal] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [customStages, setCustomStages] = useState<{ id: string; label: string; color: string; desc: string; custom: true }[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStageId, setOverStageId] = useState<Stage | null>(null);

  const allStages = [...STAGES, ...customStages];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const activeTask = tasks.find((t) => t.id === activeId);

  const prevProjectRef = useRef<string | null>(null);
  if (prevProjectRef.current !== (activeProject?.id ?? null)) {
    prevProjectRef.current = activeProject?.id ?? null;
    if (customStages.length > 0) setCustomStages([]);
  }

  const getTasksByStage = useCallback(
    (stage: Stage) => tasks.filter((t) => t.stage === stage && t.projectId === activeProject?.id),
    [tasks, activeProject?.id],
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    const t = tasks.find((t) => t.id === active.id);
    if (t) setOverStageId(t.stage);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    if (!over) { setOverStageId(null); return; }
    const stage = resolveStage(over.id as string, tasks, allStages);
    setOverStageId(stage);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setOverStageId(null);
    if (!over || !activeTask) return;

    const targetStage = resolveStage(over.id as string, tasks, allStages);
    if (targetStage && targetStage !== activeTask.stage) {
      const fromStage = activeTask.stage;
      moveTask(active.id as string, targetStage);

      // ── toast notification ──────────────────────────────────────────────────
      const fromLabel = STAGES.find((s) => s.id === fromStage)?.label ?? fromStage;
      const toLabel = STAGES.find((s) => s.id === targetStage)?.label ?? targetStage;
      toast(`Moved to ${toLabel}`, {
        sub: `"${activeTask.title}" · ${fromLabel} → ${toLabel}`,
        type: targetStage === "production" ? "success" : "info",
      });

      // ── activity log ────────────────────────────────────────────────────────
      setActivityLog((prev) => [...prev.slice(-9), {
        id: `act_${Date.now()}`,
        taskTitle: activeTask.title,
        assignee: activeTask.assignee,
        from: fromStage,
        to: targetStage,
        at: Date.now(),
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav
        title={activeProject?.name || "Pipeline"}
        subtitle="Kanban Board"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}>
                <div className="w-2 h-2 rounded-full" style={{ background: activeProject?.color }} />
                {activeProject?.name}
                <ChevronDown size={11} />
              </button>
              {projectMenuOpen && (
                <div className="absolute right-0 top-8 z-30 rounded-lg border shadow-xl w-52 overflow-hidden"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
                  {projects.map((p) => {
                    const PIcon = PROJECT_ICONS[p.icon] || GitBranch;
                    return (
                      <div key={p.id}
                        className="flex items-center justify-between px-3 py-2 hover:opacity-80 cursor-pointer group"
                        onClick={() => { setActiveProject(p.id); setProjectMenuOpen(false); }}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: p.color }}>
                            <PIcon size={11} color="#fff" />
                          </div>
                          <span className="text-xs" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <button onClick={(e) => { e.stopPropagation(); setProjectModal({ open: true, project: p }); setProjectMenuOpen(false); }}>
                            <Pencil size={11} style={{ color: "var(--text-secondary)" }} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); setProjectMenuOpen(false); }}>
                            <Trash2 size={11} style={{ color: "var(--red)" }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t" style={{ borderColor: "var(--border)" }}>
                    <button onClick={() => { setProjectModal({ open: true }); setProjectMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs"
                      style={{ color: "var(--accent)" }}>
                      <Plus size={12} /> New project
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setTaskModal({ open: true })}
              className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium"
              style={{ background: "var(--accent)", color: "#fff" }}>
              <Plus size={12} /> New task
            </button>
          </div>
        }
      />

      {/* ── Activity bar (last submitted move) ── */}
      <ActivityBar entries={activityLog} />

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext sensors={sensors} collisionDetection={rectIntersection}
          onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full pb-2" style={{ minWidth: "max-content" }}>
            {allStages.map((stage) => (
              <Column key={stage.id} stage={stage} tasks={getTasksByStage(stage.id)}
                activeId={activeId}
                onAddTask={(s) => setTaskModal({ open: true, stage: s })}
                onEditTask={(t) => setTaskModal({ open: true, task: t })}
                onDeleteTask={(id) => setDeleteConfirm({ open: true, id })}
                onDeleteStage={(id) => setCustomStages((prev) => prev.filter((s) => s.id !== id))}
              />
            ))}
            <button onClick={() => setAddRowModal(true)}
              className="flex flex-col items-center justify-center rounded-xl w-14 shrink-0 border-2 border-dashed gap-2 hover:opacity-70 transition-opacity"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)", minHeight: 200 }}
              title="Add column">
              <Plus size={18} />
              <span className="text-xs" style={{ writingMode: "vertical-rl" }}>Add column</span>
            </button>
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {activeTask && (
              <div className="rounded-lg border p-3 shadow-2xl rotate-1 w-60"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--accent)", opacity: 0.95 }}>
                {activeTask.assignee && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ background: avatarColor(activeTask.assignee), fontSize: "9px", fontWeight: 700 }}>
                      {activeTask.assignee.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {activeTask.assignee.split(" ")[0]}
                    </span>
                  </div>
                )}
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>{activeTask.title}</p>
                {activeTask.description && (
                  <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>{activeTask.description}</p>
                )}
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {activeTask.tags.map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>{tag}</span>
                  ))}
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-auto"
                    style={{ background: `${PRIORITY_COLORS[activeTask.priority]}22`, color: PRIORITY_COLORS[activeTask.priority] }}>
                    {activeTask.priority}
                  </span>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {addRowModal && (
        <AddRowModal onClose={() => setAddRowModal(false)}
          onSave={(stage) => setCustomStages((prev) => [...prev, stage])} />
      )}

      {taskModal.open && (
        <TaskModal task={taskModal.task} defaultStage={taskModal.stage}
          onClose={() => setTaskModal({ open: false })}
          onSave={(data) => {
            if (taskModal.task) {
              updateTask(taskModal.task.id, data);
              toast("Task updated", { sub: data.title, type: "info" });
            } else {
              addTask({ ...data, projectId: activeProject?.id });
              toast("Task created", { sub: data.title, type: "success" });
            }
          }} />
      )}

      {projectModal.open && (
        <ProjectModal project={projectModal.project}
          onClose={() => setProjectModal({ open: false })}
          onSave={(data) => {
            if (projectModal.project) updateProject(projectModal.project.id, data);
            else addProject(data);
          }} />
      )}

      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-xl border p-5 w-72"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Delete task?</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm({ open: false })}
                className="flex-1 py-2 rounded-lg text-sm border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={() => {
                const t = tasks.find((t) => t.id === deleteConfirm.id);
                deleteTask(deleteConfirm.id!);
                setDeleteConfirm({ open: false });
                toast("Task deleted", { sub: t?.title, type: "warning" });
              }} className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ background: "var(--red)", color: "#fff" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

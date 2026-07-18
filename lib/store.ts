import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Priority = "low" | "medium" | "high";
export type Stage = "planning" | "design" | "development" | "testing" | "staging" | "production" | string;
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface Task {
    id: string;
    title: string;
    description?: string;
    stage: Stage;
    priority: Priority;
    assignee?: string;
    tags: string[];
    createdAt: string;
    dueDate?: string;
    projectId?: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon: string; // lucide icon name
    createdAt: string;
}

export interface ApiEndpoint {
    id: string;
    method: HttpMethod;
    path: string;
    summary: string;
    description: string;
    requestBody?: string;
    responseBody?: string;
    auth: boolean;
    tags: string[];
    projectId: string;
    createdAt: string;
}

export interface Message {
    id: string;
    contactId: number;
    from: string;
    text: string;
    time: string;
    isMe: boolean;
}

export type FeedbackStatus = "open" | "in-progress" | "resolved";
export type FeedbackType = "bug" | "feature" | "complaint" | "praise" | "other";

export interface Feedback {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    type: FeedbackType;
    subject: string;
    message: string;
    status: FeedbackStatus;
    createdAt: string;
    resolvedAt?: string;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    status: "active" | "inactive" | "banned";
    joinedAt: string;
    lastSeen: string;
    projectCount: number;
    taskCount: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    isLoggedIn: boolean;
    isAdmin?: boolean;
}

interface AppState {
    user: User | null;
    projects: Project[];
    tasks: Task[];
    apiEndpoints: ApiEndpoint[];
    messages: Record<number, Message[]>;
    feedbacks: Feedback[];
    adminUsers: AdminUser[];
    activeProjectId: string | null;
    chatOpen: boolean;
    theme: "dark" | "light";

    // Auth
    login: (user: User) => void;
    logout: () => void;

    // Projects
    addProject: (p: Omit<Project, "id" | "createdAt">) => void;
    updateProject: (id: string, p: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    setActiveProject: (id: string) => void;

    // Tasks
    addTask: (t: Omit<Task, "id" | "createdAt">) => void;
    updateTask: (id: string, t: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    moveTask: (taskId: string, stage: Stage) => void;
    reorderTasks: (stage: Stage, oldIndex: number, newIndex: number) => void;

    // API Endpoints
    addApiEndpoint: (e: Omit<ApiEndpoint, "id" | "createdAt">) => void;
    updateApiEndpoint: (id: string, e: Partial<ApiEndpoint>) => void;
    deleteApiEndpoint: (id: string) => void;

    // Messages
    sendMessage: (contactId: number, text: string) => void;

    // Feedback
    addFeedback: (f: Omit<Feedback, "id" | "createdAt">) => void;
    updateFeedbackStatus: (id: string, status: FeedbackStatus) => void;
    deleteFeedback: (id: string) => void;

    // Admin Users
    updateAdminUser: (id: string, u: Partial<AdminUser>) => void;
    deleteAdminUser: (id: string) => void;

    // UI
    toggleChat: () => void;
    setTheme: (t: "dark" | "light") => void;
    setActiveCall: (call: { type: "audio" | "video"; contact: string; elapsed: number } | null) => void;
    activeCall: { type: "audio" | "video"; contact: string; elapsed: number } | null;
}

const defaultProjects: Project[] = [
    { id: "p1", name: "Project Pipeline", description: "Main product development", color: "#7c3aed", icon: "GitBranch", createdAt: new Date().toISOString() },
    { id: "p2", name: "Marketing Site", description: "Company landing page", color: "#2563eb", icon: "Globe", createdAt: new Date().toISOString() },
];

const defaultTasks: Task[] = [
    { id: "t1", title: "Define MVP scope", description: "Outline all MVP features and requirements", stage: "planning", priority: "high", assignee: "Aria Chen", tags: ["docs"], createdAt: new Date().toISOString(), projectId: "p1" },
    { id: "t2", title: "Wireframe dashboard", description: "Create UX wireframes for main dashboard", stage: "design", priority: "high", assignee: "Mia Rossi", tags: ["design"], createdAt: new Date().toISOString(), projectId: "p1" },
    { id: "t3", title: "Auth API endpoints", description: "Implement JWT auth flow", stage: "development", priority: "high", assignee: "Noah Patel", tags: ["feat", "api"], createdAt: new Date().toISOString(), projectId: "p1" },
    { id: "t4", title: "Smoke tests for checkout", description: "End-to-end checkout flow testing", stage: "testing", priority: "medium", assignee: "Leo Wang", tags: ["qa"], createdAt: new Date().toISOString(), projectId: "p1" },
    { id: "t5", title: "Deploy v0.9 to staging", description: "Staging environment deployment", stage: "staging", priority: "medium", assignee: "Sara Khan", tags: ["infra"], createdAt: new Date().toISOString(), projectId: "p1" },
    { id: "t6", title: "Onboarding flow live", description: "Launch onboarding to production", stage: "production", priority: "low", assignee: "Aria Chen", tags: ["launch"], createdAt: new Date().toISOString(), projectId: "p1" },
];

const defaultApiEndpoints: ApiEndpoint[] = [
    { id: "ae1", projectId: "p1", method: "GET", path: "/api/v1/users", summary: "List users", description: "Returns all users in the project.", requestBody: "", responseBody: '{\n  "data": [{ "id": "u1", "name": "Aria Chen" }],\n  "total": 1\n}', auth: true, tags: ["users"], createdAt: new Date().toISOString() },
    { id: "ae2", projectId: "p1", method: "POST", path: "/api/v1/users", summary: "Create user", description: "Add a new user to the project.", requestBody: '{\n  "name": "New User",\n  "email": "user@example.com",\n  "role": "developer"\n}', responseBody: '{\n  "id": "u2",\n  "name": "New User",\n  "createdAt": "2026-06-17T10:00:00Z"\n}', auth: true, tags: ["users"], createdAt: new Date().toISOString() },
    { id: "ae3", projectId: "p1", method: "DELETE", path: "/api/v1/users/{id}", summary: "Delete user", description: "Remove a user from the project.", requestBody: "", responseBody: '{\n  "deleted": true\n}', auth: true, tags: ["users"], createdAt: new Date().toISOString() },
    { id: "ae4", projectId: "p2", method: "GET", path: "/api/v1/pages", summary: "List pages", description: "Returns all marketing pages.", requestBody: "", responseBody: '{\n  "data": [{ "id": "pg1", "slug": "home", "title": "Home" }]\n}', auth: false, tags: ["pages"], createdAt: new Date().toISOString() },
    { id: "ae5", projectId: "p2", method: "POST", path: "/api/v1/pages", summary: "Create page", description: "Create a new marketing page.", requestBody: '{\n  "slug": "about",\n  "title": "About Us",\n  "content": "..."\n}', responseBody: '{\n  "id": "pg2",\n  "slug": "about"\n}', auth: true, tags: ["pages"], createdAt: new Date().toISOString() },
];

const defaultMessages: Record<number, Message[]> = {
    1: [
        { id: "m1", contactId: 1, from: "Aria Chen", text: "Hey! Did you push the MVP scope doc?", time: "10:21", isMe: false },
        { id: "m2", contactId: 1, from: "You", text: "Yes — moved it to Design column.", time: "10:22", isMe: true },
        { id: "m3", contactId: 1, from: "Aria Chen", text: "Perfect, thanks!", time: "10:23", isMe: false },
    ],
    2: [{ id: "m4", contactId: 2, from: "Noah Patel", text: "Wireframes are ready for review 🎨", time: "09:45", isMe: false }],
    3: [{ id: "m5", contactId: 3, from: "Mia Rossi", text: "Also updating the deploying notes...", time: "Yesterday", isMe: false }],
    4: [{ id: "m6", contactId: 4, from: "Leo Wang", text: "Ok lads", time: "1h ago", isMe: false }],
    5: [{ id: "m7", contactId: 5, from: "Sara Khan", text: "Deployment ready", time: "2h ago", isMe: false }],
};
const defaultFeedbacks: Feedback[] = [
    { id: "fb1", userId: "u1", userName: "Aria Chen", userEmail: "aria@example.com", type: "bug", subject: "Drag & drop breaks on mobile", message: "When I try to drag a card on my iPhone, the card disappears and doesn't land in the target column.", status: "open", createdAt: "2026-06-15T09:00:00Z" },
    { id: "fb2", userId: "u2", userName: "Noah Patel", userEmail: "noah@example.com", type: "feature", subject: "Add due-date reminders", message: "It would be great to get an email/push reminder a day before a task is due.", status: "in-progress", createdAt: "2026-06-14T11:30:00Z" },
    { id: "fb3", userId: "u3", userName: "Mia Rossi", userEmail: "mia@example.com", type: "praise", subject: "Love the new API docs page!", message: "The interactive explorer is super clean. Makes testing endpoints so much faster.", status: "resolved", createdAt: "2026-06-13T14:00:00Z", resolvedAt: "2026-06-14T09:00:00Z" },
    { id: "fb4", userId: "u4", userName: "Leo Wang", userEmail: "leo@example.com", type: "complaint", subject: "App is slow on Firefox", message: "The kanban board takes about 3 seconds to become interactive on Firefox 125.", status: "open", createdAt: "2026-06-16T08:20:00Z" },
    { id: "fb5", userId: "u5", userName: "Sara Khan", userEmail: "sara@example.com", type: "feature", subject: "Dark/light mode per project", message: "Allow setting different color themes per project for easier visual separation.", status: "open", createdAt: "2026-06-17T16:45:00Z" },
    { id: "fb6", userId: "u2", userName: "Noah Patel", userEmail: "noah@example.com", type: "bug", subject: "Notifications badge not clearing", message: "The red badge on the bell icon stays even after reading all notifications.", status: "in-progress", createdAt: "2026-06-18T07:10:00Z" },
];

const defaultAdminUsers: AdminUser[] = [
    { id: "u1", name: "Aria Chen", email: "aria@example.com", role: "Product Manager", avatar: "AC", status: "active", joinedAt: "2024-01-10", lastSeen: "2026-06-18", projectCount: 3, taskCount: 12 },
    { id: "u2", name: "Noah Patel", email: "noah@example.com", role: "Engineer", avatar: "NP", status: "active", joinedAt: "2024-02-05", lastSeen: "2026-06-18", projectCount: 2, taskCount: 19 },
    { id: "u3", name: "Mia Rossi", email: "mia@example.com", role: "Designer", avatar: "MR", status: "active", joinedAt: "2024-03-12", lastSeen: "2026-06-17", projectCount: 2, taskCount: 8 },
    { id: "u4", name: "Leo Wang", email: "leo@example.com", role: "UI Lead", avatar: "LW", status: "inactive", joinedAt: "2024-01-20", lastSeen: "2026-06-10", projectCount: 1, taskCount: 5 },
    { id: "u5", name: "Sara Khan", email: "sara@example.com", role: "DevOps", avatar: "SK", status: "active", joinedAt: "2024-04-01", lastSeen: "2026-06-18", projectCount: 2, taskCount: 7 },
    { id: "u6", name: "James Okafor", email: "james@example.com", role: "QA Engineer", avatar: "JO", status: "banned", joinedAt: "2024-05-15", lastSeen: "2026-05-30", projectCount: 0, taskCount: 2 },
];

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            projects: defaultProjects,
            tasks: defaultTasks,
            apiEndpoints: defaultApiEndpoints,
            messages: defaultMessages,
            feedbacks: defaultFeedbacks,
            adminUsers: defaultAdminUsers,
            activeProjectId: "p1",
            chatOpen: false,
            theme: "dark",
            activeCall: null,

            login: (user) => set({ user }),
            logout: () => set({ user: null }),

            addProject: (p) => set((s) => ({
                projects: [...s.projects, { ...p, id: `p${Date.now()}`, createdAt: new Date().toISOString() }],
            })),
            updateProject: (id, p) => set((s) => ({
                projects: s.projects.map((proj) => proj.id === id ? { ...proj, ...p } : proj),
            })),
            deleteProject: (id) => set((s) => ({
                projects: s.projects.filter((p) => p.id !== id),
                apiEndpoints: s.apiEndpoints.filter((e) => e.projectId !== id),
                activeProjectId: s.activeProjectId === id ? (s.projects.find((p) => p.id !== id)?.id || null) : s.activeProjectId,
            })),
            setActiveProject: (id) => set({ activeProjectId: id }),

            addTask: (t) => set((s) => ({
                tasks: [...s.tasks, { ...t, id: `t${Date.now()}`, createdAt: new Date().toISOString() }],
            })),
            updateTask: (id, t) => set((s) => ({
                tasks: s.tasks.map((task) => task.id === id ? { ...task, ...t } : task),
            })),
            deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
            moveTask: (taskId, stage) => set((s) => ({
                tasks: s.tasks.map((t) => t.id === taskId ? { ...t, stage } : t),
            })),
            reorderTasks: (stage, oldIndex, newIndex) => set((s) => {
                const stageTasks = s.tasks.filter((t) => t.stage === stage);
                const otherTasks = s.tasks.filter((t) => t.stage !== stage);
                const moved = stageTasks.splice(oldIndex, 1)[0];
                stageTasks.splice(newIndex, 0, moved);
                return { tasks: [...otherTasks, ...stageTasks] };
            }),

            addApiEndpoint: (e) => set((s) => ({
                apiEndpoints: [...s.apiEndpoints, { ...e, id: `ae${Date.now()}`, createdAt: new Date().toISOString() }],
            })),
            updateApiEndpoint: (id, e) => set((s) => ({
                apiEndpoints: s.apiEndpoints.map((ep) => ep.id === id ? { ...ep, ...e } : ep),
            })),
            deleteApiEndpoint: (id) => set((s) => ({
                apiEndpoints: s.apiEndpoints.filter((e) => e.id !== id),
            })),

            sendMessage: (contactId, text) => set((s) => ({
                messages: {
                    ...s.messages,
                    [contactId]: [
                        ...(s.messages[contactId] || []),
                        { id: `msg${Date.now()}`, contactId, from: "You", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isMe: true },
                    ],
                },
            })),

            addFeedback: (f) => set((s) => ({
                feedbacks: [...s.feedbacks, { ...f, id: `fb${Date.now()}`, createdAt: new Date().toISOString() }],
            })),
            updateFeedbackStatus: (id, status) => set((s) => ({
                feedbacks: s.feedbacks.map((f) => f.id === id ? { ...f, status, resolvedAt: status === "resolved" ? new Date().toISOString() : f.resolvedAt } : f),
            })),
            deleteFeedback: (id) => set((s) => ({
                feedbacks: s.feedbacks.filter((f) => f.id !== id),
            })),

            updateAdminUser: (id, u) => set((s) => ({
                adminUsers: s.adminUsers.map((user) => user.id === id ? { ...user, ...u } : user),
            })),
            deleteAdminUser: (id) => set((s) => ({
                adminUsers: s.adminUsers.filter((u) => u.id !== id),
            })),

            toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
            setTheme: (theme) => set({ theme }),
            setActiveCall: (activeCall) => set({ activeCall }),
        }),
        {
            name: "pp-store",
            partialize: (s) => ({
                projects: s.projects,
                tasks: s.tasks,
                apiEndpoints: s.apiEndpoints,
                messages: s.messages,
                feedbacks: s.feedbacks,
                adminUsers: s.adminUsers,
                theme: s.theme,
                user: s.user,
                activeProjectId: s.activeProjectId,
            }),
        }
    )
);

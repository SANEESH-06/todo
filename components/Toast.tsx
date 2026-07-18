"use client";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, X, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
    id: string;
    message: string;
    sub?: string;
    type?: ToastType;
    duration?: number;
}

// ── singleton event bus ───────────────────────────────────────────────────────
type Listener = (t: ToastItem) => void;
const listeners: Listener[] = [];

export function toast(
    message: string,
    options?: { sub?: string; type?: ToastType; duration?: number },
) {
    const item: ToastItem = {
        id: `toast_${Date.now()}_${Math.random()}`,
        message,
        sub: options?.sub,
        type: options?.type ?? "success",
        duration: options?.duration ?? 3000,
    };
    listeners.forEach((fn) => fn(item));
}

// ── individual toast ──────────────────────────────────────────────────────────
const ICONS: Record<ToastType, React.ElementType> = {
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
    error: AlertTriangle,
};

const COLORS: Record<ToastType, string> = {
    success: "var(--green)",
    info: "var(--blue)",
    warning: "var(--yellow)",
    error: "var(--red)",
};

function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
    const [visible, setVisible] = useState(false);
    const type = item.type ?? "success";
    const Icon = ICONS[type];
    const color = COLORS[type];

    useEffect(() => {
        // mount → slide in
        const raf = requestAnimationFrame(() => setVisible(true));
        // auto-dismiss
        const t = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(item.id), 300);
        }, item.duration ?? 3000);
        return () => { cancelAnimationFrame(raf); clearTimeout(t); };
    }, [item.id, item.duration, onRemove]);

    return (
        <div
            style={{
                background: "var(--bg-secondary)",
                borderColor: color,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                transform: visible ? "translateX(0)" : "translateX(120%)",
                opacity: visible ? 1 : 0,
                transition: "transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s ease",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: 12,
                minWidth: 240,
                maxWidth: 320,
                padding: "10px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
            }}
        >
            {/* left accent bar */}
            <div style={{ width: 3, borderRadius: 4, background: color, alignSelf: "stretch", flexShrink: 0 }} />

            <Icon size={15} style={{ color, flexShrink: 0, marginTop: 2 }} />

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                    {item.message}
                </p>
                {item.sub && (
                    <p style={{ color: "var(--text-secondary)", fontSize: 11, margin: "3px 0 0", lineHeight: 1.3 }}>
                        {item.sub}
                    </p>
                )}
            </div>

            <button
                onClick={() => { setVisible(false); setTimeout(() => onRemove(item.id), 300); }}
                style={{ color: "var(--text-secondary)", flexShrink: 0, padding: 2, background: "none", border: "none", cursor: "pointer" }}
            >
                <X size={13} />
            </button>
        </div>
    );
}

// ── container (mount once in layout or ClientRoot) ────────────────────────────
export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((item: ToastItem) => {
        setToasts((prev) => [...prev, item]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        listeners.push(addToast);
        return () => {
            const idx = listeners.indexOf(addToast);
            if (idx !== -1) listeners.splice(idx, 1);
        };
    }, [addToast]);

    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                pointerEvents: "none",
            }}
        >
            {toasts.map((t) => (
                <div key={t.id} style={{ pointerEvents: "auto" }}>
                    <ToastCard item={t} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
}

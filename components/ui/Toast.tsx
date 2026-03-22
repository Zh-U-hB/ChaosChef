"use client";

import { useToastStore } from "@/store/toastStore";

const TYPE_STYLES = {
  error:   "bg-red-900/90 border-red-700 text-red-100",
  info:    "bg-stone-800/90 border-stone-600 text-stone-100",
  success: "bg-green-900/90 border-green-700 text-green-100",
};

const TYPE_ICON = {
  error:   "✕",
  info:    "ℹ",
  success: "✓",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${TYPE_STYLES[t.type]}`}
        >
          <span className="mt-0.5 shrink-0 font-bold">{TYPE_ICON[t.type]}</span>
          <span className="flex-1 leading-relaxed">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

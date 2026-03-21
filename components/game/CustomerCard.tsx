"use client";

import { useGameStore } from "@/store/gameStore";

export function CustomerCard() {
  const { customer, dish, orderDialogue, phase } = useGameStore();

  if (!customer || !dish) return null;

  return (
    <div className="rounded-2xl border border-amber-800/40 bg-amber-950/30 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-100">{customer.name}</h2>
          <p className="text-sm text-amber-400">📍 {customer.region}</p>
        </div>
        <span className="rounded-full bg-amber-800/40 px-3 py-1 text-xs text-amber-300">
          {dish.cuisine}菜系
        </span>
      </div>

      {customer.dietaryRestrictions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {customer.dietaryRestrictions.map((r) => (
            <span key={r} className="rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-300">
              ⚠️ {r}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-black/30 p-3 text-sm text-amber-100/90 italic border-l-2 border-amber-600">
        &ldquo;{orderDialogue}&rdquo;
      </div>

      <div className="text-center">
        <span className="text-xs text-amber-500">点单：</span>
        <span className="text-base font-semibold text-amber-200"> {dish.name}</span>
      </div>

      {phase === "ordering" && (
        <p className="text-xs text-amber-600/70 text-center">你的助手正在取食材…</p>
      )}
    </div>
  );
}

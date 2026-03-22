"use client";

import { useGameStore } from "@/store/gameStore";

const CHAOS_COLORS: Record<string, string> = {
  oven_broken:        "border-orange-700/60 bg-orange-950/40 text-orange-300",
  mystery_ingredient: "border-purple-700/60 bg-purple-950/40 text-purple-300",
  picky_customer:     "border-red-700/60 bg-red-950/40 text-red-300",
  inspiration:        "border-yellow-600/60 bg-yellow-950/40 text-yellow-300",
};

const CHAOS_EMOJI: Record<string, string> = {
  oven_broken:        "🔥",
  mystery_ingredient: "🎁",
  picky_customer:     "😤",
  inspiration:        "✨",
};

export function CustomerCard() {
  const { customer, dish, orderDialogue, assistantQuote, chaosEvent, phase } = useGameStore();

  if (!customer || !dish) return null;

  return (
    <div className="space-y-3">
      {/* Chaos event banner */}
      {chaosEvent && (
        <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${CHAOS_COLORS[chaosEvent.type] ?? "border-stone-700 bg-stone-900/40 text-stone-300"}`}>
          <span className="text-xl shrink-0">{CHAOS_EMOJI[chaosEvent.type]}</span>
          <div>
            <p className="font-semibold text-sm">{chaosEvent.title}</p>
            <p className="text-xs opacity-80 mt-0.5">{chaosEvent.description}</p>
          </div>
        </div>
      )}

      {/* Customer info card */}
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
      </div>

      {/* Assistant quote — shown when ingredients arrive */}
      {(phase === "cooking" || phase === "plating") && assistantQuote && (
        <div className="rounded-xl border border-stone-700/50 bg-stone-900/50 px-4 py-3 flex items-start gap-3">
          <span className="text-xl shrink-0">🤦</span>
          <div>
            <p className="text-xs text-stone-500 mb-1">你的助手说：</p>
            <p className="text-sm text-stone-300 italic">&ldquo;{assistantQuote}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  );
}

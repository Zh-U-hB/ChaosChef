"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import type { CookingAction } from "@/types/game";

const ACTIONS: { value: CookingAction; label: string; emoji: string }[] = [
  { value: "steam", label: "蒸", emoji: "♨️" },
  { value: "fry", label: "炒/炸", emoji: "🔥" },
  { value: "bake", label: "烤", emoji: "🟠" },
  { value: "boil", label: "煮", emoji: "🫕" },
  { value: "raw", label: "生食", emoji: "🌿" },
  { value: "mix", label: "混合", emoji: "🥄" },
  { value: "cut", label: "切", emoji: "🔪" },
];

export function Inventory() {
  const { ingredients, operationLog, addOperation, removeOperation, setPhase } =
    useGameStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<CookingAction>("fry");
  const [duration, setDuration] = useState("");

  const toggle = (ing: string) => {
    setSelected((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const addStep = () => {
    if (selected.length === 0) return;
    addOperation({
      step: operationLog.length + 1,
      action,
      ingredients: selected,
      duration: duration || undefined,
    });
    setSelected([]);
    setDuration("");
  };

  return (
    <div className="space-y-4">
      {/* Ingredient grid */}
      <div>
        <p className="mb-2 text-xs text-amber-500/80">助手带来的食材（选择要处理的）</p>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing) => (
            <button
              key={ing}
              onClick={() => toggle(ing)}
              className={`rounded-full border px-3 py-1 text-sm transition-all ${
                selected.includes(ing)
                  ? "border-amber-400 bg-amber-800/60 text-amber-100"
                  : "border-amber-800/40 bg-amber-950/30 text-amber-400 hover:border-amber-600"
              }`}
            >
              {ing}
            </button>
          ))}
        </div>
      </div>

      {/* Action selector */}
      <div>
        <p className="mb-2 text-xs text-amber-500/80">烹饪方式</p>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => (
            <button
              key={a.value}
              onClick={() => setAction(a.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                action === a.value
                  ? "border-orange-500 bg-orange-900/50 text-orange-200"
                  : "border-amber-800/30 bg-amber-950/20 text-amber-500 hover:border-amber-700"
              }`}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="时长（可选，如 5min）"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="flex-1 rounded-lg border border-amber-800/30 bg-black/30 px-3 py-1.5 text-sm text-amber-200 placeholder-amber-800 focus:border-amber-600 focus:outline-none"
        />
        <button
          onClick={addStep}
          disabled={selected.length === 0}
          className="rounded-lg bg-amber-700 px-4 py-1.5 text-sm font-medium text-amber-100 hover:bg-amber-600 disabled:opacity-30 transition-colors"
        >
          添加步骤
        </button>
      </div>

      {/* Operation log */}
      {operationLog.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-amber-500/80">操作记录</p>
          {operationLog.map((op, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-black/20 px-3 py-2 text-sm"
            >
              <span className="text-amber-300">
                步骤{op.step}：
                <span className="text-amber-500">
                  {ACTIONS.find((a) => a.value === op.action)?.emoji}
                  {ACTIONS.find((a) => a.value === op.action)?.label}
                </span>{" "}
                {op.ingredients.join("、")}
                {op.duration && <span className="text-amber-700"> ({op.duration})</span>}
              </span>
              <button
                onClick={() => removeOperation(i)}
                className="text-red-700 hover:text-red-500 text-xs ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Go to plating */}
      {operationLog.length > 0 && (
        <button
          onClick={() => setPhase("plating")}
          className="w-full rounded-xl bg-amber-600 py-2.5 font-semibold text-amber-50 hover:bg-amber-500 transition-colors"
        >
          去拼盘 →
        </button>
      )}
    </div>
  );
}

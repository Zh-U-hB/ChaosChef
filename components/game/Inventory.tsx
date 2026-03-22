"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { getIngredientEmoji } from "@/lib/ingredientEmoji";
import type { CookingAction, CookingIntensity } from "@/types/game";

const ACTIONS: { value: CookingAction; label: string; emoji: string }[] = [
  { value: "steam", label: "蒸", emoji: "♨️" },
  { value: "fry", label: "炒/炸", emoji: "🔥" },
  { value: "bake", label: "烤", emoji: "🟠" },
  { value: "boil", label: "煮", emoji: "🫕" },
  { value: "raw", label: "生食", emoji: "🌿" },
  { value: "mix", label: "混合", emoji: "🥄" },
  { value: "cut", label: "切", emoji: "🔪" },
];

const INTENSITIES: { value: CookingIntensity; label: string; color: string }[] = [
  { value: "light",  label: "轻度", color: "border-sky-700 bg-sky-900/40 text-sky-300" },
  { value: "normal", label: "标准", color: "border-amber-700 bg-amber-900/40 text-amber-300" },
  { value: "heavy",  label: "过火", color: "border-red-700 bg-red-900/40 text-red-300" },
];

export function Inventory() {
  const { ingredients, operationLog, chaosEvent, addOperation, removeOperation, setPhase } =
    useGameStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<CookingAction>("fry");
  const [intensity, setIntensity] = useState<CookingIntensity>("normal");
  const [duration, setDuration] = useState("");

  const bannedAction = chaosEvent?.bannedAction;

  const toggle = (ing: string) => {
    setSelected((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const addStep = () => {
    if (selected.length === 0) return;
    if (action === bannedAction) return;
    addOperation({
      step: operationLog.length + 1,
      action,
      intensity,
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
          {(ingredients ?? []).map((ing) => (
            <button
              key={ing}
              onClick={() => toggle(ing)}
              className={`rounded-full border px-3 py-1 text-sm transition-all flex items-center gap-1.5 ${
                selected.includes(ing)
                  ? "border-amber-400 bg-amber-800/60 text-amber-100"
                  : "border-amber-800/40 bg-amber-950/30 text-amber-400 hover:border-amber-600"
              }`}
            >
              <span>{getIngredientEmoji(ing)}</span>
              <span>{ing}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action selector */}
      <div>
        <p className="mb-2 text-xs text-amber-500/80">烹饪方式</p>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => {
            const isBanned = a.value === bannedAction;
            return (
              <button
                key={a.value}
                onClick={() => !isBanned && setAction(a.value)}
                disabled={isBanned}
                title={isBanned ? `本轮禁用（${chaosEvent?.title}）` : undefined}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  isBanned
                    ? "border-red-900/40 bg-red-950/20 text-red-800 line-through cursor-not-allowed"
                    : action === a.value
                    ? "border-orange-500 bg-orange-900/50 text-orange-200"
                    : "border-amber-800/30 bg-amber-950/20 text-amber-500 hover:border-amber-700"
                }`}
              >
                {a.emoji} {a.label}
                {isBanned && " 🚫"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensity selector */}
      <div>
        <p className="mb-2 text-xs text-amber-500/80">火候强度</p>
        <div className="flex gap-2">
          {INTENSITIES.map((i) => (
            <button
              key={i.value}
              onClick={() => setIntensity(i.value)}
              className={`flex-1 rounded-lg border py-1.5 text-sm font-medium transition-all ${
                intensity === i.value
                  ? i.color
                  : "border-stone-700 bg-stone-900/30 text-stone-500 hover:border-stone-600"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration + Add button */}
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
          disabled={selected.length === 0 || action === bannedAction}
          className="rounded-lg bg-amber-700 px-4 py-1.5 text-sm font-medium text-amber-100 hover:bg-amber-600 disabled:opacity-30 transition-colors"
        >
          添加步骤
        </button>
      </div>

      {/* Operation log */}
      {operationLog.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-amber-500/80">操作记录</p>
          {operationLog.map((op, i) => {
            const intensityLabel = INTENSITIES.find((x) => x.value === op.intensity)?.label ?? "标准";
            const actionInfo = ACTIONS.find((a) => a.value === op.action);
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-black/20 px-3 py-2 text-sm"
              >
                <span className="text-amber-300 flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-600">步骤{op.step}：</span>
                  <span className="text-amber-400">
                    {actionInfo?.emoji} {actionInfo?.label}
                  </span>
                  <span className="rounded-full bg-stone-800 px-1.5 py-0.5 text-xs text-stone-400">{intensityLabel}</span>
                  <span>{op.ingredients.map((ing) => `${getIngredientEmoji(ing)}${ing}`).join("、")}</span>
                  {op.duration && <span className="text-amber-700">({op.duration})</span>}
                </span>
                <button
                  onClick={() => removeOperation(i)}
                  className="text-red-700 hover:text-red-500 text-xs ml-2 shrink-0"
                >
                  ✕
                </button>
              </div>
            );
          })}
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

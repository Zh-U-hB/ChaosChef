"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";

export function Plating() {
  const { operationLog, ingredients, setPlating, setPhase } = useGameStore();
  const [platings, setPlatings] = useState<string[]>([]);

  // All cooked results + raw ingredients available to plate
  const cookedItems = operationLog.map(
    (op) => `${op.action === "raw" ? "" : op.action + "的"}${op.ingredients.join("+")}`.trim()
  );
  const allOptions = [...cookedItems, ...ingredients];
  const uniqueOptions = [...new Set(allOptions)];

  const toggle = (item: string) => {
    setPlatings((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    if (platings.length === 0) return;
    setPlating(platings);
    setPhase("judging");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-amber-400">选择最终摆盘的内容：</p>
      <div className="flex flex-wrap gap-2">
        {uniqueOptions.map((item) => (
          <button
            key={item}
            onClick={() => toggle(item)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
              platings.includes(item)
                ? "border-green-500 bg-green-900/40 text-green-200"
                : "border-amber-800/40 bg-amber-950/30 text-amber-400 hover:border-amber-600"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {platings.length > 0 && (
        <div className="rounded-xl border border-green-900/40 bg-green-950/20 p-3 text-sm text-green-300">
          🍽️ 摆盘：{platings.join(" · ")}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setPhase("cooking")}
          className="flex-1 rounded-xl border border-amber-800/40 py-2.5 text-sm text-amber-500 hover:border-amber-600 transition-colors"
        >
          ← 返回厨房
        </button>
        <button
          onClick={handleSubmit}
          disabled={platings.length === 0}
          className="flex-1 rounded-xl bg-green-700 py-2.5 font-semibold text-green-50 hover:bg-green-600 disabled:opacity-30 transition-colors"
        >
          上菜！
        </button>
      </div>
    </div>
  );
}

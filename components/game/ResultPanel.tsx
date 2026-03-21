"use client";

import Image from "next/image";
import { useGameStore } from "@/store/gameStore";

const RATING_CONFIG = {
  disaster:    { label: "灾难", color: "text-red-400",    bg: "bg-red-950/40",    emoji: "💀" },
  poor:        { label: "糟糕", color: "text-orange-400", bg: "bg-orange-950/40", emoji: "😖" },
  acceptable:  { label: "凑合", color: "text-yellow-400", bg: "bg-yellow-950/40", emoji: "😐" },
  good:        { label: "不错", color: "text-lime-400",   bg: "bg-lime-950/40",   emoji: "😊" },
  excellent:   { label: "出色", color: "text-green-400",  bg: "bg-green-950/40",  emoji: "🤩" },
  masterpiece: { label: "神作", color: "text-amber-300",  bg: "bg-amber-900/40",  emoji: "👑" },
};

export function ResultPanel() {
  const { result, streamedFeedback, customer, dish, resetRound } = useGameStore();

  const feedbackText = result?.feedback ?? streamedFeedback;
  const displayText = feedbackText
    .replace(/<think>[\s\S]*?<\/think>/g, "")          // strip reasoning blocks
    .replace(/\{[^{}]*"ingredientScore"[^{}]*\}/, "")  // strip score JSON
    .trim();

  const cfg = result ? RATING_CONFIG[result.score.rating] : null;

  return (
    <div className="space-y-5">
      {/* Dish image */}
      {result && (
        result.imageUrl ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-amber-800/30">
            <Image
              src={result.imageUrl}
              alt={dish?.name ?? "菜品"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center aspect-square w-full rounded-2xl border border-stone-800 bg-stone-900/40 text-stone-600 text-sm">
            图片生成失败，请检查图像 AI 配置（URL / Key / 模型）
          </div>
        )
      )}

      {/* Customer feedback */}
      <div className="rounded-2xl border border-amber-800/30 bg-black/30 p-4">
        <p className="mb-2 text-xs text-amber-600">{customer?.name} 说：</p>
        <p className="text-sm leading-relaxed text-amber-100 whitespace-pre-wrap">
          {displayText}
          {!result && <span className="animate-pulse">▌</span>}
        </p>
      </div>

      {/* Score */}
      {result && cfg && (
        <div className={`rounded-2xl border border-amber-800/20 ${cfg.bg} p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <span className="text-amber-300 font-mono text-lg">
              {result.score.totalScore} / 30
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { label: "食材合理性", val: result.score.ingredientScore },
              { label: "文化契合度", val: result.score.culturalScore },
              { label: "创意加分",   val: result.score.creativityScore },
            ].map(({ label, val }) => (
              <div key={label} className="rounded-lg bg-black/20 py-2">
                <div className="text-lg font-bold text-amber-200">{val}</div>
                <div className="text-amber-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next round */}
      {result && (
        <button
          onClick={resetRound}
          className="w-full rounded-xl bg-amber-700 py-3 font-semibold text-amber-50 hover:bg-amber-600 transition-colors"
        >
          下一位客人 →
        </button>
      )}
    </div>
  );
}

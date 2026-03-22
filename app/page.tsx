"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useToastStore } from "@/store/toastStore";
import { useScoreStore, bestScore } from "@/store/scoreStore";
import { CustomerCard } from "@/components/game/CustomerCard";
import { Inventory } from "@/components/game/Inventory";
import { Plating } from "@/components/game/Plating";
import { ResultPanel } from "@/components/game/ResultPanel";
import { SettingsModal } from "@/components/game/SettingsModal";
import { ToastContainer } from "@/components/ui/Toast";
import type { RoundStartResponse, SubmitResult } from "@/types/game";

const RATING_LABELS: Record<string, string> = {
  disaster: "灾难💀", poor: "糟糕😖", acceptable: "凑合😐",
  good: "不错😊", excellent: "出色🤩", masterpiece: "神作👑",
};

export default function GamePage() {
  const {
    phase,
    customer,
    dish,
    chaosEvent,
    operationLog,
    plating,
    setRoundData,
    setPhase,
    appendFeedback,
    setResult,
    resetRound,
  } = useGameStore();

  const textAI = useSettingsStore(useShallow((s) => s.textAI));
  const imageAI = useSettingsStore(useShallow((s) => s.imageAI));
  const [showSettings, setShowSettings] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const { history, addRecord } = useScoreStore();
  const best = bestScore(history);

  // Load a new round whenever phase is "loading"
  useEffect(() => {
    if (phase !== "loading") return;
    let cancelled = false;

    fetch("/api/round/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ textConfig: textAI }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok || data.error || !data.ingredients) {
          const msg = data.error ?? `请求失败 (HTTP ${r.status})`;
          addToast(`开局失败：${msg}`);
          setPhase("start");
          return;
        }
        setRoundData(data as RoundStartResponse);
      })
      .catch((e) => {
        if (!cancelled) {
          addToast(`网络错误：${e?.message ?? "无法连接服务器"}`);
          setPhase("start");
        }
      });

    return () => { cancelled = true; };
  }, [phase, textAI, setRoundData, setPhase, addToast]);

  // Submit dish when phase becomes "judging"
  useEffect(() => {
    if (phase !== "judging" || !customer || !dish) return;
    let cancelled = false;

    const run = async () => {
      const res = await fetch("/api/dish/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          dish,
          submission: {
            customerId: customer.id,
            dishName: dish.name,
            operationLog,
            plating,
          },
          textConfig: textAI,
          imageConfig: imageAI,
          chaosEvent,
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelled) break;
        buf += dec.decode(value, { stream: true });

        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.trim().split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine  = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace("event:", "").trim();
          const data  = JSON.parse(dataLine.replace("data:", "").trim());

          if (event === "feedback") appendFeedback((data as { chunk: string }).chunk);
          if (event === "result") {
            const r = data as SubmitResult;
            setResult(r);
            // Save to score history
            addRecord({
              customerName: customer.name,
              dishName: dish.name,
              totalScore: r.score.totalScore,
              rating: r.score.rating,
              chaosEventTitle: chaosEvent?.title,
            });
          }
          if (event === "imageError") {
            addToast(`图片生成失败：${(data as { message: string }).message}`, "info");
          }
          if (event === "error") {
            addToast(`评价生成失败：${(data as { message: string }).message}`);
          }
        }
      }
    };

    run().catch((e) => addToast(`提交失败：${e?.message ?? "未知错误"}`));
    return () => { cancelled = true; };
  }, [phase, customer, dish, operationLog, plating, textAI, imageAI, chaosEvent, appendFeedback, setResult, addRecord, addToast]);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-amber-300">
          🍳 Chaos Chef
        </h1>
        <p className="mt-1 text-sm text-amber-700">用错误的食材，做出对的感觉</p>
      </header>

      {/* Start Screen */}
      {phase === "start" && (
        <div className="flex items-center justify-center py-8">
          <div className="space-y-8 max-w-sm w-full mx-auto">
            <div className="text-center space-y-2">
              <div className="text-7xl">🍽️</div>
              <p className="text-stone-400 text-sm leading-relaxed">
                你的助手又拿错食材了。<br />
                用手边的一切，凑出一道菜。
              </p>
            </div>

            {/* Best score badge */}
            {best && (
              <div className="rounded-xl border border-amber-800/30 bg-amber-950/20 px-4 py-3 text-center">
                <p className="text-xs text-amber-600 mb-1">历史最佳</p>
                <p className="text-amber-300 font-semibold">
                  {best.dishName} · {best.totalScore}/30 · {RATING_LABELS[best.rating] ?? best.rating}
                </p>
                <p className="text-xs text-stone-600 mt-0.5">{best.customerName}</p>
              </div>
            )}

            {/* Recent history */}
            {history.length > 0 && (
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-3 space-y-2">
                <p className="text-xs text-stone-500">最近记录</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {history.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-xs">
                      <span className="text-stone-400 truncate flex-1 mr-2">{r.dishName}</span>
                      <span className="text-stone-500">{r.totalScore}/30</span>
                      <span className="ml-2 text-stone-500">{RATING_LABELS[r.rating]?.slice(-1) ?? ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setPhase("loading")}
                className="w-full rounded-xl bg-amber-700 px-8 py-3 font-semibold text-amber-50 hover:bg-amber-600 transition-colors text-base"
              >
                开始游戏 🔪
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-full rounded-xl border border-stone-700 px-8 py-3 font-semibold text-stone-300 hover:bg-stone-800 transition-colors text-base"
              >
                ⚙️ 设置
              </button>
              <button
                onClick={() => window.close()}
                className="w-full rounded-xl px-8 py-2 text-sm text-stone-600 hover:text-stone-400 transition-colors"
              >
                退出游戏
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {phase === "loading" && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <div className="text-4xl animate-bounce">🍽️</div>
            <p className="text-amber-600">助手正在拿错食材中…</p>
          </div>
        </div>
      )}

      {(phase === "ordering" || phase === "cooking" || phase === "plating") && (
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
            >
              ⚙️ 设置
            </button>
          </div>
          <CustomerCard />

          {phase === "ordering" && (
            <div className="text-center">
              <button
                onClick={() => setPhase("cooking")}
                className="rounded-xl bg-amber-700 px-8 py-3 font-semibold text-amber-50 hover:bg-amber-600 transition-colors"
              >
                进厨房开始处理食材 🔪
              </button>
            </div>
          )}

          {phase === "cooking" && (
            <div className="rounded-2xl border border-amber-800/30 bg-stone-900/60 p-5">
              <h2 className="mb-4 text-sm font-semibold text-amber-400 uppercase tracking-wide">
                厨房操作台
              </h2>
              <Inventory />
            </div>
          )}

          {phase === "plating" && (
            <div className="rounded-2xl border border-green-900/30 bg-stone-900/60 p-5">
              <h2 className="mb-4 text-sm font-semibold text-green-400 uppercase tracking-wide">
                拼盘区
              </h2>
              <Plating />
            </div>
          )}
        </div>
      )}

      {(phase === "judging" || phase === "result") && (
        <div className="mx-auto max-w-lg space-y-5">
          <CustomerCard />
          <div className="rounded-2xl border border-amber-800/30 bg-stone-900/60 p-5">
            <h2 className="mb-4 text-sm font-semibold text-amber-400 uppercase tracking-wide">
              {phase === "judging" ? "食客正在品尝…" : "评价结果"}
            </h2>
            <ResultPanel />
          </div>
          {phase === "result" && (
            <div className="flex gap-3">
              <button
                onClick={resetRound}
                className="flex-1 rounded-xl bg-amber-700 px-6 py-3 font-semibold text-amber-50 hover:bg-amber-600 transition-colors"
              >
                再来一局 🍳
              </button>
              <button
                onClick={resetRound}
                className="rounded-xl border border-stone-700 px-6 py-3 text-sm text-stone-300 hover:bg-stone-800 transition-colors"
              >
                返回主页
              </button>
            </div>
          )}
        </div>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <ToastContainer />
    </main>
  );
}

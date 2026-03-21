"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { CustomerCard } from "@/components/game/CustomerCard";
import { Inventory } from "@/components/game/Inventory";
import { Plating } from "@/components/game/Plating";
import { ResultPanel } from "@/components/game/ResultPanel";
import { SettingsModal } from "@/components/game/SettingsModal";
import type { RoundStartResponse, SubmitResult } from "@/types/game";

export default function GamePage() {
  const {
    phase,
    customer,
    dish,
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
          console.error(`[round/start] HTTP ${r.status}`, data.error ?? data);
          setPhase("start");
          return;
        }
        setRoundData(data as RoundStartResponse);
      })
      .catch((e) => { console.error("[round/start] network error:", e); if (!cancelled) setPhase("start"); });

    return () => { cancelled = true; };
  }, [phase, textAI, setRoundData]);

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

          if (event === "feedback")   appendFeedback((data as { chunk: string }).chunk);
          if (event === "result")     setResult(data as SubmitResult);
          if (event === "imageError") console.warn("[图片生成失败]", (data as { message: string }).message);
        }
      }
    };

    run().catch(console.error);
    return () => { cancelled = true; };
  }, [phase, customer, dish, operationLog, plating, textAI, imageAI, appendFeedback, setResult]);

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
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-8 max-w-sm w-full mx-auto">
            <div className="space-y-2">
              <div className="text-7xl">🍽️</div>
              <p className="text-stone-400 text-sm leading-relaxed">
                你的助手又拿错食材了。<br />
                用手边的一切，凑出一道菜。
              </p>
            </div>
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
                onClick={() => { resetRound(); }}
                className="rounded-xl border border-stone-700 px-6 py-3 text-sm text-stone-300 hover:bg-stone-800 transition-colors"
              >
                返回主页
              </button>
            </div>
          )}
        </div>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </main>
  );
}

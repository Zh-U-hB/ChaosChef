"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { CustomerCard } from "@/components/game/CustomerCard";
import { Inventory } from "@/components/game/Inventory";
import { Plating } from "@/components/game/Plating";
import { ResultPanel } from "@/components/game/ResultPanel";
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
  } = useGameStore();

  // Load a new round whenever phase is "loading"
  useEffect(() => {
    if (phase !== "loading") return;
    let cancelled = false;

    fetch("/api/round/start")
      .then((r) => r.json())
      .then((data: RoundStartResponse) => {
        if (!cancelled) setRoundData(data);
      })
      .catch(console.error);

    return () => { cancelled = true; };
  }, [phase, setRoundData, setPhase]);

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
          if (event === "result")   setResult(data as SubmitResult);
        }
      }
    };

    run().catch(console.error);
    return () => { cancelled = true; };
  }, [phase, customer, dish, operationLog, plating, appendFeedback, setResult]);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-amber-300">
          🍳 Chaos Chef
        </h1>
        <p className="mt-1 text-sm text-amber-700">用错误的食材，做出对的感觉</p>
      </header>

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
        </div>
      )}
    </main>
  );
}

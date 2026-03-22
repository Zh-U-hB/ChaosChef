"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ScoreRecord {
  id: string;
  date: string;         // ISO string
  customerName: string;
  dishName: string;
  totalScore: number;
  rating: string;
  chaosEventTitle?: string;
}

interface ScoreState {
  history: ScoreRecord[];
  addRecord: (record: Omit<ScoreRecord, "id" | "date">) => void;
  clearHistory: () => void;
}

export const useScoreStore = create<ScoreState>()(
  persist(
    (set) => ({
      history: [],
      addRecord: (record) =>
        set((s) => ({
          history: [
            {
              ...record,
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
            },
            ...s.history,
          ].slice(0, 30), // keep last 30
        })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: "chaos-chef-scores" }
  )
);

export function bestScore(history: ScoreRecord[]): ScoreRecord | undefined {
  return history.reduce<ScoreRecord | undefined>(
    (best, r) => (!best || r.totalScore > best.totalScore ? r : best),
    undefined
  );
}

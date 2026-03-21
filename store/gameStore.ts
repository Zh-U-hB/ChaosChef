"use client";

import { create } from "zustand";
import type {
  CustomerData,
  DishData,
  GamePhase,
  OperationStep,
  SubmitResult,
} from "@/types/game";

interface GameState {
  phase: GamePhase;
  customer: CustomerData | null;
  dish: DishData | null;
  orderDialogue: string;
  ingredients: string[];        // what the assistant brought
  operationLog: OperationStep[];
  plating: string[];            // final plated items
  result: SubmitResult | null;
  streamedFeedback: string;     // accumulates during SSE stream

  // actions
  setRoundData: (data: {
    customer: CustomerData;
    dish: DishData;
    orderDialogue: string;
    ingredients: string[];
  }) => void;
  addOperation: (step: OperationStep) => void;
  removeOperation: (stepIndex: number) => void;
  setPlating: (plating: string[]) => void;
  setPhase: (phase: GamePhase) => void;
  appendFeedback: (chunk: string) => void;
  setResult: (result: SubmitResult) => void;
  resetRound: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "start",
  customer: null,
  dish: null,
  orderDialogue: "",
  ingredients: [],
  operationLog: [],
  plating: [],
  result: null,
  streamedFeedback: "",

  setRoundData: (data) =>
    set({
      customer: data.customer,
      dish: data.dish,
      orderDialogue: data.orderDialogue,
      ingredients: data.ingredients ?? [],
      operationLog: [],
      plating: [],
      result: null,
      streamedFeedback: "",
      phase: "ordering",
    }),

  addOperation: (step) =>
    set((s) => ({ operationLog: [...s.operationLog, step] })),

  removeOperation: (stepIndex) =>
    set((s) => ({
      operationLog: s.operationLog
        .filter((_, i) => i !== stepIndex)
        .map((op, i) => ({ ...op, step: i + 1 })),
    })),

  setPlating: (plating) => set({ plating }),

  setPhase: (phase) => set({ phase }),

  appendFeedback: (chunk) =>
    set((s) => ({ streamedFeedback: s.streamedFeedback + chunk })),

  setResult: (result) => set({ result, phase: "result" }),

  resetRound: () =>
    set({
      phase: "start",
      customer: null,
      dish: null,
      orderDialogue: "",
      ingredients: [],
      operationLog: [],
      plating: [],
      result: null,
      streamedFeedback: "",
    }),
}));

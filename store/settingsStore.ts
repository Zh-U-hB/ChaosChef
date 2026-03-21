"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, AIModelConfig } from "@/types/game";

const DEFAULT_TEXT_AI: AIModelConfig = {
  baseUrl: "",
  apiKey: "",
  model: "gpt-4o-mini",
};

const DEFAULT_IMAGE_AI: AIModelConfig = {
  baseUrl: "",
  apiKey: "",
  model: "dall-e-3",
};

interface SettingsState extends AppSettings {
  setTextAI: (config: Partial<AIModelConfig>) => void;
  setImageAI: (config: Partial<AIModelConfig>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      textAI: { ...DEFAULT_TEXT_AI },
      imageAI: { ...DEFAULT_IMAGE_AI },

      setTextAI: (config) =>
        set((s) => ({ textAI: { ...s.textAI, ...config } })),

      setImageAI: (config) =>
        set((s) => ({ imageAI: { ...s.imageAI, ...config } })),
    }),
    { name: "chaos-chef-settings" }
  )
);

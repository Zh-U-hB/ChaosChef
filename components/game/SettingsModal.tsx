"use client";

import { useSettingsStore } from "@/store/settingsStore";

interface Props {
  onClose: () => void;
}

function AIConfigSection({
  title,
  icon,
  values,
  onChange,
  modelPlaceholder,
}: {
  title: string;
  icon: string;
  values: { baseUrl: string; apiKey: string; model: string };
  onChange: (key: "baseUrl" | "apiKey" | "model", val: string) => void;
  modelPlaceholder: string;
}) {
  return (
    <div className="rounded-xl border border-stone-700 bg-stone-900 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
        {icon} {title}
      </h3>
      <div className="space-y-2">
        <div>
          <label className="block text-xs text-stone-400 mb-1">Base URL（留空使用默认）</label>
          <input
            type="text"
            className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600"
            placeholder="https://api.example.com"
            value={values.baseUrl}
            onChange={(e) => onChange("baseUrl", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-stone-400 mb-1">API Key</label>
          <input
            type="password"
            className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600"
            placeholder="sk-..."
            value={values.apiKey}
            onChange={(e) => onChange("apiKey", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-stone-400 mb-1">模型</label>
          <input
            type="text"
            className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600"
            placeholder={modelPlaceholder}
            value={values.model}
            onChange={(e) => onChange("model", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export function SettingsModal({ onClose }: Props) {
  const { textAI, imageAI, setTextAI, setImageAI } = useSettingsStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <h2 className="font-bold text-amber-300 text-lg">⚙️ AI 设置</h2>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <AIConfigSection
            title="文本 AI（对话 / 评价）"
            icon="💬"
            values={textAI}
            onChange={(k, v) => setTextAI({ [k]: v })}
            modelPlaceholder="gpt-4o-mini"
          />
          <AIConfigSection
            title="图像 AI（菜品图片）"
            icon="🖼️"
            values={imageAI}
            onChange={(k, v) => setImageAI({ [k]: v })}
            modelPlaceholder="dall-e-3"
          />
        </div>

        <div className="px-5 py-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-700 px-6 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-600 transition-colors"
          >
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  );
}

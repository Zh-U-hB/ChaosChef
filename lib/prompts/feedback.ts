import type { ChaosEvent, CustomerData, DishData, OperationStep } from "@/types/game";

const INTENSITY_LABEL: Record<string, string> = {
  light: "轻度",
  normal: "标准",
  heavy: "过火",
};

export function buildFeedbackPrompt(
  customer: CustomerData,
  dish: DishData,
  operationLog: OperationStep[],
  plating: string[],
  chaosEvent?: ChaosEvent
): string {
  const steps = operationLog
    .map(
      (s) =>
        `步骤${s.step}：${s.action}（${INTENSITY_LABEL[s.intensity ?? "normal"]}）${s.ingredients.join("、")}${s.duration ? `（${s.duration}）` : ""}${s.note ? ` —— ${s.note}` : ""}`
    )
    .join("\n");

  const restrictions =
    customer.dietaryRestrictions.length > 0
      ? `饮食禁忌：${customer.dietaryRestrictions.join("、")}`
      : "无饮食禁忌";

  const chaosContext = chaosEvent
    ? `\n本轮特殊事件：${chaosEvent.title} — ${chaosEvent.description}${
        chaosEvent.type === "picky_customer" ? "\n注意：你今天特别挑剔，评分比平时严格一倍，要在评价中体现出来。" : ""
      }${
        chaosEvent.type === "inspiration" ? "\n注意：厨师发挥超常，创意分加倍（creativityScore 至少 8 分）。" : ""
      }`
    : "";

  return `你是餐厅里的食客 ${customer.name}，来自 ${customer.region}，性格是：${customer.personality}。
${restrictions}${chaosContext}

你点了：${dish.name}（${dish.cuisine}菜系）

厨师的制作过程（括号内是火候强度：轻度/标准/过火）：
${steps}

最终端上来的拼盘：${plating.join("、")}

请用第一人称，以 ${customer.name} 的口吻和性格，给出你对这道菜的真实反应和评价。
要求：
- 评价要反映你的文化背景和性格特点
- 如果有违反饮食禁忌，必须强烈反应
- 评价要具体，提到实际用了哪些食材/操作和火候
- 语气和情绪要鲜明（惊喜/困惑/感动/愤怒/若有所思等）
- 150-200字
- 在评价的最后换行，用 JSON 格式附上分数（不要有 markdown 代码块，直接写 JSON）：
{"ingredientScore":分数,"culturalScore":分数,"creativityScore":分数}
分数范围 0-10，ingredientScore=食材合理性，culturalScore=文化契合度，creativityScore=创意加分`;
}

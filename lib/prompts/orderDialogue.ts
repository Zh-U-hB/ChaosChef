import type { CustomerData, DishData } from "@/types/game";

export function buildOrderDialoguePrompt(customer: CustomerData, dish: DishData): string {
  const restrictions =
    customer.dietaryRestrictions.length > 0
      ? `饮食禁忌：${customer.dietaryRestrictions.join("、")}`
      : "无饮食禁忌";

  return `你是一个餐厅点餐场景的角色扮演生成器。

食客信息：
- 姓名：${customer.name}
- 来自：${customer.region}
- 性格：${customer.personality}
- ${restrictions}

食客想点的菜：${dish.name}（${dish.cuisine}菜系）

你的任务：
1. 用第一人称写出这位食客点餐时说的话（1-3句，要体现该地区口音特色和性格特征）
2. 生成一份助手去采购时带回来的食材列表（6-8种食材）。
   注意：这个助手非常不靠谱，他总是搞错食材——可能听错了名字、认错了标签，或者觉得"这个看起来差不多"。
   食材应该与正确食谱有明显偏差，但又不是完全不沾边（要有那种"我能理解他为什么拿这个"的感觉）。
   食材用中文名称。
3. 写一句助手交货时说的话——他要用充满自信的语气解释为什么拿了这些食材，语气越自信越好，内容越离谱越好（1句话，幽默感强）。

以 JSON 格式返回，不要有任何其他文字：
{
  "orderDialogue": "食客说话的原文",
  "assistantQuote": "助手交货时说的一句话",
  "ingredients": ["食材1", "食材2", ...]
}`;
}

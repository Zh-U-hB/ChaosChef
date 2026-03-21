import type { DishData, OperationStep } from "@/types/game";

export function buildImagePrompt(
  dish: DishData,
  operationLog: OperationStep[],
  plating: string[]
): string {
  const cookingMethods = [...new Set(operationLog.map((s) => s.action))].join(", ");
  const allIngredients = [...new Set(operationLog.flatMap((s) => s.ingredients))];

  return `A professional food photography shot of a creative dish inspired by ${dish.name} (${dish.cuisine} cuisine).
The dish was made using: ${allIngredients.slice(0, 6).join(", ")}.
Cooking methods used: ${cookingMethods}.
Plated with: ${plating.slice(0, 4).join(", ")}.
Style: top-down overhead shot on a white ceramic plate, restaurant lighting, slightly chaotic but artistic plating, photorealistic, 4k food photography.
The dish looks like an unconventional interpretation — creative but questionable, like a well-meaning but misguided chef tried their best.`;
}

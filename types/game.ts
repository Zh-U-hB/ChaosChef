export type CookingAction = 'steam' | 'fry' | 'bake' | 'boil' | 'raw' | 'mix' | 'cut';
export type CookingIntensity = 'light' | 'normal' | 'heavy';

export interface OperationStep {
  step: number;
  action: CookingAction;
  intensity?: CookingIntensity;
  ingredients: string[];
  duration?: string;
  note?: string;
}

export type ChaosEventType = 'oven_broken' | 'mystery_ingredient' | 'picky_customer' | 'inspiration';

export interface ChaosEvent {
  type: ChaosEventType;
  title: string;
  description: string;
  bannedAction?: CookingAction;
  bonusIngredient?: string;
}

export interface DishSubmission {
  customerId: string;
  dishName: string;
  operationLog: OperationStep[];
  plating: string[];
}

export interface CustomerData {
  id: string;
  name: string;
  region: string;
  personality: string;
  dietaryRestrictions: string[]; // parsed from JSON string in DB
}

export interface DishData {
  id: string;
  name: string;
  cuisine: string;
}

export interface RoundStartResponse {
  customer: CustomerData;
  dish: DishData;
  orderDialogue: string;
  assistantQuote: string;
  ingredients: string[];
  chaosEvent?: ChaosEvent;
}

export interface JudgeScore {
  ingredientScore: number;  // 0-10
  culturalScore: number;    // 0-10
  creativityScore: number;  // 0-10
  totalScore: number;       // 0-30
  rating: 'disaster' | 'poor' | 'acceptable' | 'good' | 'excellent' | 'masterpiece';
}

export interface SubmitResult {
  feedback: string;       // streamed then complete
  imageUrl: string;
  score: JudgeScore;
}

export type GamePhase = 'start' | 'loading' | 'ordering' | 'cooking' | 'plating' | 'judging' | 'result';

export interface AIModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AppSettings {
  textAI: AIModelConfig;
  imageAI: AIModelConfig;
}

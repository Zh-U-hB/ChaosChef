export type CookingAction = 'steam' | 'fry' | 'bake' | 'boil' | 'raw' | 'mix' | 'cut';

export interface OperationStep {
  step: number;
  action: CookingAction;
  ingredients: string[];
  duration?: string;
  note?: string;
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
  ingredients: string[];
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

export type GamePhase = 'loading' | 'ordering' | 'cooking' | 'plating' | 'judging' | 'result';

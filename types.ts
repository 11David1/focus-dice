export enum Category {
  MOVEMENT = 'MOVEMENT',
  BREATHING = 'BREATHING',
  FOCUS = 'FOCUS',
  JOURNALING = 'JOURNALING',
  TIDYING = 'TIDYING'
}

export interface Challenge {
  id: string;
  text: string;
  description?: string;
  durationSeconds: number; // 0 means no timer needed
  category: Category;
  isAiGenerated?: boolean;
  isCustom?: boolean;
}

export interface Completion {
  id: string;
  timestamp: number;
  challengeId: string;
  category: Category;
  note?: string; // New field for journal entries
}

export interface AppState {
  currentChallenge: Challenge | null;
  history: Challenge[];
  isRolling: boolean;
  showTimer: boolean;
  timerActive: boolean;
  timeLeft: number;
  useAi: boolean;
  darkMode: boolean;
}
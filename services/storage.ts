import { Completion, Challenge } from '../types';

const STORAGE_KEY_HISTORY = 'focus_dice_history_v1';
const STORAGE_KEY_CUSTOM = 'focus_dice_custom_challenges_v1';
const STORAGE_KEY_SETTINGS = 'focus_dice_settings_v1';

// Generate a stable ID even if crypto.randomUUID is unavailable
const generateId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }
};

// History / Completions
export const saveCompletion = (challenge: Challenge, note?: string): Completion[] => {
  const completion: Completion = {
    id: generateId(),
    timestamp: Date.now(),
    challengeId: challenge.id,
    category: challenge.category,
    note: note
  };

  const existing = getCompletions();
  const updated = [completion, ...existing].slice(0, 1000);

  // Persist best-effort; return in-memory result even if storage fails
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to persist completion history', e);
  }

  return updated;
};

export const getCompletions = (): Completion[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const getStreak = (completions: Completion[]): number => {
  if (completions.length === 0) return 0;
  const days = new Set(completions.map(c => new Date(c.timestamp).toDateString()));
  let streak = 0;
  const today = new Date();
  
  if (days.has(today.toDateString())) streak++;
  
  for (let i = 1; i < 365; i++) {
    const prevDate = new Date();
    prevDate.setDate(today.getDate() - i);
    
    if (days.has(prevDate.toDateString())) {
      streak++;
    } else {
      if (i === 1 && streak === 0 && days.has(prevDate.toDateString())) {
         streak++;
         continue;
      }
      if (streak > 0 && !days.has(prevDate.toDateString())) break;
    }
  }
  return streak;
};

// Custom Challenges
export const saveCustomChallenge = (challenge: Challenge): Challenge[] => {
  const current = getCustomChallenges();
  const updated = [...current, challenge];
  localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(updated));
  return updated;
};

export const deleteCustomChallenge = (id: string): Challenge[] => {
  const current = getCustomChallenges();
  const updated = current.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(updated));
  return updated;
};

export const getCustomChallenges = (): Challenge[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CUSTOM);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// Settings (Dark Mode)
export const saveSettings = (settings: { darkMode: boolean, useAi: boolean }) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};

export const getSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return data ? JSON.parse(data) : { darkMode: false, useAi: false };
  } catch (e) {
    return { darkMode: false, useAi: false };
  }
};

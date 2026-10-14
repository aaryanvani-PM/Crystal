import { MinimalInfographicData } from '../types/infographic';

export const STORAGE_KEYS = {
  CURRENT_INFOGRAPHIC: 'visualizerai_current_infographic',
  CURRENT_PROMPT: 'visualizerai_current_prompt',
  LAST_SAVED_AT: 'visualizerai_last_saved_at',
  STORAGE_VERSION: 'visualizerai_storage_version',
  ONBOARDING_COMPLETED: 'visualizerai_onboarding_completed',
} as const;

export const CURRENT_STORAGE_VERSION = '1.0';

/**
 * Validates whether an object fits the MinimalInfographicData schema
 */
export function isValidInfographicData(obj: any): obj is MinimalInfographicData {
  if (!obj || typeof obj !== 'object') return false;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.subtitle === 'string' &&
    typeof obj.cardType === 'string'
  );
}

/**
 * Loads current infographic data from local storage
 */
export function loadPersistedInfographic(): MinimalInfographicData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_INFOGRAPHIC);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidInfographicData(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('[VisualizerAI] Error reading infographic from localStorage:', error);
  }
  return null;
}

/**
 * Persists the current infographic data to localStorage
 */
export function persistInfographic(data: MinimalInfographicData): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_INFOGRAPHIC, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED_AT, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
    return true;
  } catch (error) {
    console.warn('[VisualizerAI] Error writing infographic to localStorage:', error);
    return false;
  }
}

/**
 * Loads the last persisted prompt
 */
export function loadPersistedPrompt(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROMPT);
  } catch {
    return null;
  }
}

/**
 * Persists the current prompt
 */
export function persistPrompt(prompt: string): void {
  try {
    if (prompt && prompt.trim()) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROMPT, prompt.trim());
    }
  } catch (error) {
    console.warn('[VisualizerAI] Error saving prompt to localStorage:', error);
  }
}

/**
 * Returns timestamp ISO string of last local save
 */
export function getLastSavedTimestamp(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED_AT);
  } catch {
    return null;
  }
}

/**
 * Clears saved infographic from local storage
 */
export function clearPersistedInfographic(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_INFOGRAPHIC);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED_AT);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROMPT);
  } catch (error) {
    console.warn('[VisualizerAI] Error clearing localStorage:', error);
  }
}

/**
 * Returns whether there is saved infographic data in local storage
 */
export function hasPersistedData(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEYS.CURRENT_INFOGRAPHIC);
  } catch {
    return false;
  }
}

"use client";

export interface CardPosition {
  x: number;
  y: number;
}

const STORAGE_PREFIX = "portfolio-card-position-";
const STORAGE_INITIALIZED = "portfolio-initialized";

export function saveCardPosition(cardId: string, position: CardPosition) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${cardId}`,
      JSON.stringify(position)
    );
  } catch (error) {
    console.warn("Failed to save card position:", error);
  }
}

export function loadCardPosition(cardId: string): CardPosition | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${cardId}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn("Failed to load card position:", error);
  }

  return null;
}

export function clearAllPositions() {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem(STORAGE_INITIALIZED);
  } catch (error) {
    console.warn("Failed to clear positions:", error);
  }
}

export function hasCustomPositions(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const keys = Object.keys(localStorage);
    return keys.some((key) => key.startsWith(STORAGE_PREFIX));
  } catch (error) {
    return false;
  }
}

export function markInitialized() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_INITIALIZED, "true");
  } catch (error) {
    console.warn("Failed to mark initialized:", error);
  }
}

export function isInitialized(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_INITIALIZED) === "true";
  } catch (error) {
    return false;
  }
}

// Debounced save (avoid saving on every drag frame)
let saveTimeout: NodeJS.Timeout | null = null;

export function debouncedSavePosition(
  cardId: string,
  position: CardPosition,
  delay: number = 500
) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveCardPosition(cardId, position);
  }, delay);
}

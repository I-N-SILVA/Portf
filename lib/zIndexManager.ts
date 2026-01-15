"use client";

export class ZIndexManager {
  private currentMax: number = 10;
  private cardZIndexes: Map<string, number> = new Map();

  // Bring a card to front
  bringToFront(cardId: string): number {
    this.currentMax += 1;
    this.cardZIndexes.set(cardId, this.currentMax);
    return this.currentMax;
  }

  // Get current z-index for a card
  getZIndex(cardId: string): number {
    return this.cardZIndexes.get(cardId) || 10;
  }

  // Reset all z-indexes
  reset() {
    this.currentMax = 10;
    this.cardZIndexes.clear();
  }
}

// Singleton instance
let zIndexManagerInstance: ZIndexManager | null = null;

export function getZIndexManager(): ZIndexManager {
  if (!zIndexManagerInstance) {
    zIndexManagerInstance = new ZIndexManager();
  }
  return zIndexManagerInstance;
}

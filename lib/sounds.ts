"use client";

type SoundType = "pickup" | "drop" | "flip" | "hover";

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private volume: number = 0.3;
  private muted: boolean = false;
  private initialized: boolean = false;

  // Initialize sound system (call on user interaction)
  async initialize() {
    if (this.initialized || typeof window === "undefined") return;

    const soundFiles: Record<SoundType, string> = {
      pickup: "/sounds/pickup.mp3",
      drop: "/sounds/drop.mp3",
      flip: "/sounds/flip.mp3",
      hover: "/sounds/hover.mp3",
    };

    // Preload all sounds
    for (const [type, path] of Object.entries(soundFiles)) {
      try {
        const audio = new Audio(path);
        audio.volume = this.volume;
        audio.preload = "auto";

        // Handle loading
        await new Promise<void>((resolve) => {
          audio.addEventListener("canplaythrough", () => resolve(), { once: true });
          audio.addEventListener("error", () => {
            console.warn(`Failed to load sound: ${path}`);
            resolve();
          }, { once: true });
        });

        this.sounds.set(type as SoundType, audio);
      } catch (error) {
        console.warn(`Error initializing sound ${type}:`, error);
      }
    }

    this.initialized = true;
  }

  // Play a sound
  play(type: SoundType) {
    if (!this.initialized || this.muted || typeof window === "undefined") return;

    const sound = this.sounds.get(type);
    if (!sound) return;

    // Clone and play to allow overlapping sounds
    const clone = sound.cloneNode() as HTMLAudioElement;
    clone.volume = this.volume;
    clone.play().catch((err) => {
      // Autoplay policy might block this
      console.warn("Sound playback failed:", err);
    });
  }

  // Toggle mute
  toggleMute() {
    this.muted = !this.muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("sound-muted", this.muted.toString());
    }
    return this.muted;
  }

  // Set mute state
  setMuted(muted: boolean) {
    this.muted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("sound-muted", muted.toString());
    }
  }

  // Get mute state
  isMuted() {
    return this.muted;
  }

  // Set volume (0-1)
  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
  }

  // Load mute preference from localStorage
  loadPreferences() {
    if (typeof window === "undefined") return;

    const savedMuted = localStorage.getItem("sound-muted");
    if (savedMuted !== null) {
      this.muted = savedMuted === "true";
    }
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
    soundManagerInstance.loadPreferences();
  }
  return soundManagerInstance;
}

// Convenience function
export function playSound(type: SoundType) {
  getSoundManager().play(type);
}

// Initialize sounds on first user interaction
export function initializeSounds() {
  return getSoundManager().initialize();
}

// Toggle mute
export function toggleMute() {
  return getSoundManager().toggleMute();
}

// Check if muted
export function isMuted() {
  return getSoundManager().isMuted();
}

import { useCallback } from "react";

// Define sound effect types
type SoundEffect =
  | "Castle"
  | "Capture"
  | "Check"
  | "Checkmate"
  | "Confirmation"
  | "Defeat"
  | "Draw"
  | "Error"
  | "Move"
  | "Select"
  | "Victory";

// Sound format configuration
interface SoundFormat {
  extension: string;
  mimeType: string;
}

// Audio player options
interface AudioOptions {
  volume?: number;
  loop?: boolean;
}

// Constants
const SOUND_FORMAT: SoundFormat = {
  extension: ".mp3",
  mimeType: "audio/mpeg",
};

/**
 * Gets the URL for a sound effect
 */
export const getSoundUrl = (theme: string = "standard", effect: SoundEffect): string => {
  return `/sounds/${theme}/${effect}${SOUND_FORMAT.extension}`;
};

/**
 * Plays a sound effect with specified options
 */
export const playSound = async (
    theme: string = "standard",
  effect: SoundEffect,
  options: AudioOptions = {}
): Promise<HTMLAudioElement> => {
  const audio = new Audio(getSoundUrl(theme, effect));
  audio.volume = options.volume ?? 1.0;
  audio.loop = options.loop ?? false;

  try {
    await audio.play();
    return audio;
  } catch (error) {
    console.error(`Error playing sound effect ${effect}:`, error);
    throw error;
  }
};

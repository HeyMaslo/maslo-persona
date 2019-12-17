import { Moods } from './moods';

export { Moods };

export type MoodModifier = { timeInc?: number, modifierTimestep?: number };
export type MoodModifierMap = Partial<{[key in Moods]: MoodModifier}>;
export type MoodIntensityMap = Partial<{[key in Moods]: number}>;

const GlobalModifiers: MoodModifierMap = {
  joy: {
    timeInc: 0.15,
  },
  love: {
    timeInc: 0.15,
    modifierTimestep: 0.003,
  },
  surprise: {
    timeInc: 0.05,
  },
  terror: {
    timeInc: 0.1,
    modifierTimestep: 0.03,
  },
  anger: {
    timeInc: 0.3,
    modifierTimestep: 0.05,
  },
  sadness: {
    timeInc: -0.004,
  },
  sleepy: {
    modifierTimestep: 0.001,
  },
  calm: {
    modifierTimestep: 0.001,
  },
};

export function getGlobalMoodModifier(mood: Moods) {
  const res = GlobalModifiers[mood];
  return res;
}

export function getMoodModifiers(intensities: MoodIntensityMap) {
  const result: MoodModifier = {};

  Object.keys(intensities).forEach((mood: Moods) => {
    const intensity = intensities[mood];
    const globalModifier = getGlobalMoodModifier(mood);
    if (globalModifier) {
      Object.keys(globalModifier).forEach((mod: keyof MoodModifier) => {
        if (!result[mod]) {
          result[mod] = 0;
        }
        result[mod] += globalModifier[mod] * intensity;
      });
    }
  });

  return result;
}
const EmptyRingModifiers = {
  gaussIt: 0,
  weightIn: 0,
  intensity: 0,
  theta: 0,
  osc: 0,
  scaleInc: 0,
  positionX: 0,
  positionY: 0,
};

export type RingMoodModifiers = typeof EmptyRingModifiers;

export type RingModifiersByMood = { [key in Moods]: Partial<RingMoodModifiers> };

export function getRingMoodModifiers(ringModifiers: RingModifiersByMood, intensities: MoodIntensityMap) {
  const result = { ...EmptyRingModifiers };
  Object.keys(intensities).forEach((mood: Moods) => {
    const ringMod = ringModifiers[mood];
    if (ringMod) {
      Object.keys(ringMod).forEach((modifier: keyof RingMoodModifiers) => {
        if (!result[modifier]) {
          result[modifier] = 0;
        }
        result[modifier] += ringMod[modifier] * intensities[mood];
      });
    }
  });

  return result;
}

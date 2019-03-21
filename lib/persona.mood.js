import * as Moods from './moods';

/** @typedef {typeof Moods} MoodsEnum */
/** @typedef {MoodsEnum[keyof MoodsEnum]} MoodTypes */

/** @typedef {{timeInc?:number,modifierTimestep?:number}} MoodModifer */
/** @typedef {Partial<{[key in MoodTypes]: MoodModifer}>} MoodModifiersMap */

/** @typedef {Partial<{[key in MoodTypes]: number}>} MoodIntensitysMap */

export { Moods };

/** @type {string[]} */
export const AllMoods = Object.keys(Moods).map(key => Moods[key]);

/** @type {MoodModifiersMap} */
const GlobalModifiers = {
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

/**
 * @param {MoodTypes} mood
 * @returns {MoodModifer=}
*/
export function getGlobalMoodModifier(mood) {
    const res = GlobalModifiers[mood];
    return res; // || { timeInc: 0, modifierTimestep: 0 };
}

/**
 * @param {MoodIntensitysMap} intensities
 * @returns {MoodModifer}
 * */
export function getMoodModifiers(intensities) {
    /** @type {MoodModifer} */
    const result = {};

    Object.keys(intensities).forEach(/** @param {MoodTypes} mood */mood => {
        const intensity = intensities[mood];
        const globalModifier = getGlobalMoodModifier(mood);
        if (globalModifier) {
            Object.keys(globalModifier).forEach(mod => {
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

/** @typedef {typeof EmptyRingModifiers} RingMoodModifiers */

/**
 * @param {{ [key in MoodTypes]: Partial<RingMoodModifiers>}} ringModifiers
 * @param {MoodIntensitysMap} intensities
 */
export function getRingMoodModifiers(ringModifiers, intensities) {
    const result = { ...EmptyRingModifiers };
    Object.keys(intensities).forEach(/** @param {MoodTypes} mood */mood => {
        const ringMod = ringModifiers[mood];
        if (ringMod) {
            Object.keys(ringMod).forEach(/** @param {keyof RingMoodModifiers} modifier */modifier => {
                if (!result[modifier]) {
                    result[modifier] = 0;
                }
                result[modifier] += ringMod[modifier] * intensities[mood];
            });
        }
    });

    return result;
}

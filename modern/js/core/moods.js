// Mood types for Maslo Persona
export const Moods = {
    JOY: 'joy',
    LOVE: 'love',
    SURPRISE: 'surprise',
    TERROR: 'terror',
    ANGER: 'anger',
    SADNESS: 'sadness',
    SLEEPY: 'sleepy',
    CALM: 'calm'
};

// Mood modifiers affect animation speed and intensity
export const MoodModifiers = {
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

// Calculate combined mood modifiers from intensity map
export function getMoodModifiers(intensities) {
    const result = {};

    Object.keys(intensities).forEach(mood => {
        const intensity = intensities[mood];
        const globalModifier = MoodModifiers[mood];

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

// Ring mood modifiers for each mood type
export function getRingMoodModifiers(ringModifiers, intensities) {
    const result = {
        gaussIt: 0,
        weightIn: 0,
        intensity: 0,
        theta: 0,
        osc: 0,
        scaleInc: 0,
        positionX: 0,
        positionY: 0,
    };

    Object.keys(intensities).forEach(mood => {
        const ringMod = ringModifiers[mood];
        if (ringMod) {
            const intensity = intensities[mood];
            Object.keys(ringMod).forEach(key => {
                result[key] += ringMod[key] * intensity;
            });
        }
    });

    return result;
}

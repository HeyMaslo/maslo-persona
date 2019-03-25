import * as SimplexNoise from 'simplex-noise';

export const DefaultSettings = {
    ringCount: 8,
    ringRes: 256,
    radius: 300,
    simplex: new SimplexNoise(Math.random),
    glow: false,
};

/** @typedef {typeof DefaultSettings} MasloPersonaSettings */

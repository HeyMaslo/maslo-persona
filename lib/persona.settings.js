import * as SimplexNoise from 'simplex-noise';

export const DefaultSettings = {
    ringRes: 256,
    radius: 300,
}

export const DefaultInternalSettings = {
    ringCount: 8,
    simplex: new SimplexNoise(Math.random),
    glow: false,
};

/** @typedef {typeof DefaultSettings} PersonaSettings */
/** @typedef {typeof DefaultInternalSettings} PersonaInternalSettings */
/** @typedef {PersonaSettings & PersonaInternalSettings} PersonaConfig */

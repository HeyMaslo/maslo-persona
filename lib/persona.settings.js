import * as SimplexNoise from 'simplex-noise';

export const DefaultSettings = {
  ringRes: 256,
  radius: 300,
  colors: [
    '#9c08af',
    '#bd0ad5',
    '#ee95fa',
    '#ee95fa',
    '#ee95fa',
    '#ee95fa',
    '#ee95fa',
    '#ee95fa',
  ],
};

export const DefaultInternalSettings = {
  ringCount: 8,
  simplex: new SimplexNoise(Math.random),
  glow: false,
};

/** @typedef {typeof DefaultSettings} PersonaSettings */
/** @typedef {typeof DefaultInternalSettings} PersonaInternalSettings */
/** @typedef {PersonaSettings & PersonaInternalSettings} PersonaConfig */

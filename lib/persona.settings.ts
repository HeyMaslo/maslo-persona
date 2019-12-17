import SimplexNoise from 'simplex-noise';
import { IAudioPlayer } from './abstractions';

export const DefaultSettings = {
  ringRes: 256,
  radius: 300,
  colors: [
    '#C3C3C3',
    '#DADADA',
    '#FDFDFD',
    '#9E9EFF',
    '#A9A9FF',
    '#B9B9FF',
    '#DCDCFF',
    '#DCFFFF',
  ],
  audio: {
    play() { /* do nothing */ },
  } as IAudioPlayer,
};

export const DefaultInternalSettings = {
  ringCount: 8,
  simplex: new SimplexNoise(Math.random),
  glow: false,
};

export type PersonaSettings = typeof DefaultSettings & { audio: IAudioPlayer };
export type PersonaInternalSettings = typeof DefaultInternalSettings;
export type PersonaConfig = PersonaSettings & PersonaInternalSettings;

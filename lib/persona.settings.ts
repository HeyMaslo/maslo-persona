import SimplexNoise from 'simplex-noise';
import { IAudioPlayer } from './abstractions';

export type PersonaSettings = {
  ringRes: number,
  radius: number,
  colors: string[],
  audio?: IAudioPlayer,
  glow?: boolean,
  skipTextures: false | 'all' | 'background',
  disableSound: boolean,
};

export const DefaultSettings: PersonaSettings = {
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
  glow: false,
  skipTextures: false,
  disableSound: false,
};

export const DefaultInternalSettings = {
  ringsCount: 8,
  simplex: new SimplexNoise(Math.random),
};

export type PersonaInternalSettings = typeof DefaultInternalSettings;
export type PersonaConfig = PersonaSettings & PersonaInternalSettings;

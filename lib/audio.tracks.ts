import { EnumStringHelper } from './utils/enumHelper';

export enum AudioTracks {
  Hey = 'hey',
  Joy = 'joy',
  No = 'no',
  Open = 'open',
  Pinch = 'pinch',
  Shake = 'shake',
  Surprise = 'surprise',
  Swipe = 'swipe',
  Tap = 'tap',
  Upset = 'upset',
  Yes = 'yes',
  Question = 'question',
}

export namespace AudioTracks {
  export const Helper = new EnumStringHelper<AudioTracks>(AudioTracks);
}

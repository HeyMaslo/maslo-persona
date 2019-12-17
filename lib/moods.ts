import { EnumStringHelper } from './utils/enumHelper';

export enum Moods {
  Joy = 'joy',
  Love = 'love',
  Surprise = 'surprise',
  Terror = 'terror',
  Anger = 'anger',
  Sadness = 'sadness',
  Sleepy = 'sleepy',
  Calm = 'calm',
}

export namespace Moods {
  export const Helper = new EnumStringHelper<Moods>(Moods);
}

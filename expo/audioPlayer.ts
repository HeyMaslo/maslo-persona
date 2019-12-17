import { Audio } from 'expo-av';
import { IAudioPlayer, AudioTracks, IResourcesProvider } from '../lib';

export class AudioPlayer implements IAudioPlayer {
  private sound = new Audio.Sound();

  constructor(readonly resources: IResourcesProvider) { }

  async play(track: AudioTracks): Promise<void> {
    const url = this.resources.audio[track];

    try {
      await this.sound.loadAsync(url);
      await this.sound.playAsync();
    } finally {
      // do nothing basically
    }
  }
}

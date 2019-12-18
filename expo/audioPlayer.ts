import { Audio } from 'expo-av';
import { IAudioPlayer, AudioTracks, IResourcesProvider } from '../lib';

export class AudioPlayer implements IAudioPlayer {
  private sound = new Audio.Sound();

  constructor(readonly resources: IResourcesProvider) { }

  async play(track: AudioTracks): Promise<void> {
    try {
      await this.stop();

      const resource = this.resources.audio[track];

      await this.sound.loadAsync(resource.url);
      await this.sound.playAsync();
    } catch (err) {
      console.warn('ExpoAudioPlayer: audio play error:', err);
    }
  }

  async stop() {
    if (this.sound._loaded) {
      await this.sound.stopAsync();
    }
  }
}

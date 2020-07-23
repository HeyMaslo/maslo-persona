import { Audio, AVPlaybackStatus } from 'expo-av';
import { IAudioPlayer, AudioTracks, IResourcesProvider } from '@persona-core';

export class AudioPlayer implements IAudioPlayer {
  private sound: Audio.Sound;

  constructor(readonly resources: IResourcesProvider) {
  }

  async play(track: AudioTracks): Promise<void> {
    try {
      await this.stop();

      const resource = this.resources.audio[track];

      this.sound = new Audio.Sound();
      const cb = async (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish)  {
          const s = this.sound;
          this.sound = null;
          await AudioPlayer.disposeSound(s);
        }
      };

      this.sound.setOnPlaybackStatusUpdate(cb);

      const loadStatus = await this.sound.loadAsync(resource.url);
      if (loadStatus.isLoaded === true) {
        await this.sound.playAsync();
      }
    } catch (err) {
      console.log('ExpoAudioPlayer: audio play error:');
      console.error(err);
    }
  }

  private static async disposeSound(s: Audio.Sound) {
    if (s && s._loaded) {
      s.setOnPlaybackStatusUpdate(null);
      await s.stopAsync();
      await s.unloadAsync();
    }
  }

  async stop() {
    const s = this.sound;
    this.sound = null;
    if (s && s._loaded) {
      await AudioPlayer.disposeSound(s);
    }
  }
}

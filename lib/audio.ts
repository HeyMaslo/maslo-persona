import { AudioTracks } from './audio.tracks';
import { IAudioPlayer, IResourcesProvider } from './abstractions';
import logger from './utils/logger';

export {
  AudioTracks,
};

export class HtmlAudioPlayer implements IAudioPlayer {

    currentTrack: string;
    tracks: { [track: string]: HTMLAudioElement } = {};

    constructor(resources: IResourcesProvider) {

      AudioTracks.Helper.Values.forEach(p => {
        const res = resources.audio[p];
        const path = res.url;

        this.tracks[p] = new Audio(path);
      });
    }

    play(track: AudioTracks) {

      if (this.currentTrack) {
        const t = this.tracks[this.currentTrack];
        t.pause();
      }

      const nextTrack = this.tracks[track];
      if (nextTrack) {
        this.currentTrack = track;
        nextTrack.currentTime = 0;
        const pr = nextTrack.play();
        if (pr.catch) {
          pr.catch((err) => {
            logger.warn('audio catch', err, err && err.message);
            const nt = nextTrack;
            const cb = () => {
              nt.play();
              nt.removeEventListener('load', cb);
            };
            nt.addEventListener('load', cb);
          });
        }
      }
    }
}

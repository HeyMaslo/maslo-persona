import * as AudioTracks from './audio.tracks';
import ResourcesManager from './resources';
import logger from './utils/logger';

export {
    AudioTracks,
};

/** @typedef {typeof AudioTracks} TracksList */
/** @typedef {TracksList[keyof TracksList]} AudioTracksValues */


export class AudioPlayer {

    /** @type {string} */
    currentTrack;

    constructor() {
        /** @type {{ [track:string]: HTMLAudioElement }} */
        this.tracks = {};

        Object.keys(AudioTracks).forEach(k => {
            /** @type {AudioTracksValues} */
            const p = AudioTracks[k];
            const res = ResourcesManager.Current.audio[p];
            const path = res.url;

            this.tracks[p] = new Audio(path);
        });
    }

    /** @param {AudioTracksValues} track */
    play(track) {

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
                pr.catch(err => {
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

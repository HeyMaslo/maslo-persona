import * as AudioTracks from './audio.tracks';

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

        Object.keys(AudioTracks).map(k => AudioTracks[k])
            .forEach(track => {
                this.tracks[track] = new Audio(`audio/${track}.mp3`);
            });
    }

    /** @param {AudioTracksValues} track */
    play(track) {

        if (this.currentTrack) {
            const t = this.tracks[this.currentTrack];
            t.pause();
            t.currentTime = 0;
        }

        const nextTrack = this.tracks[track];
        if (nextTrack) {
            this.currentTrack = track;
            nextTrack.play();
        }
    }
}

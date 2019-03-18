import * as AudioTracks from './audio.tracks';

export {
    AudioTracks,
};

/** @typedef {typeof AudioTracks} TracksList */
/** @typedef {TracksList[keyof TracksList]} AudioTracksValues */

const Paths = Object.keys(AudioTracks).map(k => {
    const p = AudioTracks[k];
    return {
        track: p,
        path: require(`./assets/audio/${p}.mp3`),
    };
})

export class AudioPlayer {

    /** @type {string} */
    currentTrack;

    constructor() {
        /** @type {{ [track:string]: HTMLAudioElement }} */
        this.tracks = {};

        console.log('AUDIO:', Paths);

        Paths.forEach(t => {
            this.tracks[t.track] = new Audio(t.path);
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
            // console.log('next track', track, nextTrack.readyState);
            nextTrack.currentTime = 0;
            const pr = nextTrack.play();
            if (pr.catch) {
                pr.catch(() => {
                    const nt = nextTrack;
                    const cb = () => {
                        nt.play();
                        nt.removeEventListener('load', cb);
                    }
                    nt.addEventListener('load', cb);
                });
            }
        }
    }
}

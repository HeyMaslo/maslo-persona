/* eslint-disable global-require */

/** @typedef {(import ('./audio').AudioTracksValues)} AudioTracksValues */

/** @typedef {{url: string}} ResourceUrl */
/** @typedef {{raw: string}} ResourceRaw */

/** @typedef {{ [key in AudioTracksValues]: ResourceUrl }} AudioTracksUrls */

export function getDefaultResources() {
    return {
        /** @type {AudioTracksUrls} */
        audio: {
            hey: { url: require('./assets/audio/hey.mp3') },
            joy: { url: require('./assets/audio/joy.mp3') },
            no: { url: require('./assets/audio/no.mp3') },
            open: { url: require('./assets/audio/open.mp3') },
            pinch: { url: require('./assets/audio/pinch.mp3') },
            shake: { url: require('./assets/audio/shake.mp3') },
            surprise: { url: require('./assets/audio/surprise.mp3') },
            swipe: { url: require('./assets/audio/swipe.mp3') },
            tap: { url: require('./assets/audio/tap.mp3') },
            upset: { url: require('./assets/audio/upset.mp3') },
            yes: { url: require('./assets/audio/yes.mp3') },
            question: { url: require('./assets/audio/question.mp3') },
        },
        textures: {
            noise: { url: require('./assets/img/noise.png') },
        },
        shaders: {
            PersonaVertex: { raw: require('./assets/shaders/ringVertex.glsl') },
            PersonaFragment: { raw: require('./assets/shaders/ringFragment.glsl') },
        },
    };
}

/** @template T extends (...args: any[]) => any
 * @typedef {(import ("./utils/returnType").ReturnType<T>)} ReturnType */

/** @typedef {ReturnType<typeof getDefaultResources>} ResourcesData */

/** @type {ResourcesData} */
let _current;

const Manager = {
    get Current() { return _current; },
};

/** @param {ResourcesData=} resources */
export function initializeResources(resources = null) {
    _current = resources || getDefaultResources();
}

export default Manager;

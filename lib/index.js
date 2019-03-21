import { MasloPersona } from './persona';
import { initializeResources } from './resources';

/** @typedef {(import ('./persona').MasloPersonaSettings)} MasloPersonaSettings */

/** @typedef {(import ('./resources').ResourcesData)} ResourcesData */

/** @param {ResourcesData=} resources */
export function UseResources(resources = null) {
    initializeResources(resources);
}

export {
    MasloPersona,
};

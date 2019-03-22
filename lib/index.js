import { MasloPersona } from './persona';
import { initializeResources } from './resources';
import { States, AllStates } from './persona.states';

/** @typedef {(import ('./persona').MasloPersonaSettings)} MasloPersonaSettings */

/** @typedef {(import ('./resources').ResourcesData)} ResourcesData */

/** @param {ResourcesData=} resources */
export function UseResources(resources = null) {
    initializeResources(resources);
}

export {
    MasloPersona,
    States,
    AllStates,
};

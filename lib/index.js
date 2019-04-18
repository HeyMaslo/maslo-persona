import { PersonaCore } from './persona';
import { initializeResources } from './resources';
import { States, AllStates } from './persona.states';

/** @typedef {(import ('./persona').PersonaSettings)} PersonaSettings */

/** @typedef {(import ('./resources').ResourcesData)} ResourcesData */

/** @typedef {import ('./analytics').AnalyticsConfig} AnalyticsConfig */

/** @param {ResourcesData=} resources */
export function UseResources(resources = null) {
  initializeResources(resources);
}

export {
  PersonaCore,
  States,
  AllStates,
};

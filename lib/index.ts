import { PersonaCore } from './persona';
import { initializeResources } from './resources';
import { States } from './persona.states';
import { IResourcesProvider } from './abstractions';
import { PersonaSettings } from './persona.settings';
import { IAudioPlayer } from './abstractions';
import { AnalyticsConfig, AnalyticsManager } from './analytics';

export function UseResources(resources: IResourcesProvider = null) {
  initializeResources(resources);
}

export {
  PersonaSettings,
  PersonaCore,
  States,
  IResourcesProvider,
  IAudioPlayer,

  AnalyticsConfig,
  AnalyticsManager,
};

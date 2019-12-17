import * as THREE from 'three';
import { PersonaCore } from './persona';
import ResourceManager, { initializeResources } from './resources';
import { States } from './persona.states';
import { IResourcesProvider } from './abstractions';
import { getRequireResources } from './resources.require';
import { PersonaSettings } from './persona.settings';
import { IAudioPlayer } from './abstractions';
import { AnalyticsConfig, AnalyticsManager } from './analytics';
import { AudioTracks } from './audio.tracks';

export function UseResources(resources: IResourcesProvider = null) {
  initializeResources(resources);
}

export {
  THREE,

  PersonaSettings,
  PersonaCore,
  States,

  ResourceManager,
  IResourcesProvider,
  getRequireResources,

  AudioTracks,
  IAudioPlayer,

  AnalyticsConfig,
  AnalyticsManager,
};

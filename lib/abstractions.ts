import { AudioTracks } from './audio';
import { States } from './persona.states';
import { PersonaRingData } from './ring.data';

export interface IAudioPlayer {
  play(track: AudioTracks): void | Promise<void>;
}

export type ResourceUrl = { url: string };
export type ResourceRaw = { raw: string };

export type AudioTracksUrls = { [key in AudioTracks]: ResourceUrl };

export interface IResourcesProvider {
  readonly audio: AudioTracksUrls,
  readonly textures: {
    noise: ResourceUrl,
  },
  shaders: {
    PersonaVertex: ResourceRaw,
    PersonaFragment: ResourceRaw,
  },
}

export interface IPersonaRing {
  readonly data: PersonaRingData;
}

export type PersonCoreAnimationData = {
  timeInc: number,
  hsl: THREE.Vector3,
  rotation: number,
};

export interface IPersonaCore {
  readonly audio: IAudioPlayer;
  readonly rings: ReadonlyArray<IPersonaRing>;

  readonly animationData: PersonCoreAnimationData;

  setState(state: States): void;

}

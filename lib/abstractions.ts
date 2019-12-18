import { AudioTracks } from './audio';
import { States } from './persona.states';
import { PersonaRingData } from './ring.data';

export interface IAudioPlayer {
  play(track: AudioTracks): void | Promise<void>;
}

export type ResourceUrl = { url: any };
export type ResourceRaw<T = any> = { raw: T };
export type ResourceRawOrUrl = Partial<ResourceUrl & ResourceRaw>;
export type AudioTracksUrls = { [key in AudioTracks]: ResourceUrl };

export function isRawResource<T = any>(res: ResourceRaw<T> | ResourceUrl): res is ResourceRaw<T> {
  return (res as ResourceRaw<T>).raw !== undefined;
}

export function isUrlResource<T = any>(res: ResourceRaw<T> | ResourceUrl): res is ResourceUrl {
  return (res as ResourceUrl).url !== undefined;
}

export interface IResourcesProvider {
  readonly audio: AudioTracksUrls,
  readonly textures: {
    noise: ResourceRaw<THREE.Texture> | ResourceUrl,
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

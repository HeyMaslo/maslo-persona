import {
  States,
  PersonaViewState as PersonaViewStateInternal,
  PersonaSettings,
} from '../../lib/index';

export type PersonaViewState = PersonaViewStateInternal<string | number>;

export type CurrentPersonaSettings = Readonly<{ radius: number, resultScale: number }>;

export interface IPersonaContext {
  state: States;
  view: PersonaViewState;

  currentSettings?: CurrentPersonaSettings;
}

export { PersonaSettings };

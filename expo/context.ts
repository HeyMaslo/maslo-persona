import {
  States,
  PersonaViewState as PersonaViewStateInternal,
} from '../lib';

export type PersonaViewState = PersonaViewStateInternal<string | number>;

export interface IPersonaContext {
  state: States;
  view: PersonaViewState;
}

import {
  States,
  PersonaViewState,
} from '../lib';

export interface IPersonaContext {
  state: States;
  view: PersonaViewState<string | number>;
}

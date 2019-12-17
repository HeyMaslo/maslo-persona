import { IResourcesProvider } from './abstractions';

let _current: IResourcesProvider;

const Manager = {
  get Current() { return _current; },
};

export function initializeResources(resources?: IResourcesProvider) {
  _current = resources;
}

export default Manager;

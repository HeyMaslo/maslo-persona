
export type PersonaViewState<TPosType = number> = {
  scale: number,
  position: {
    x: TPosType,
    y: TPosType,
  },
  achorPoint: {
    x: number,
    y: number,
  },
  rotation: number,
};

export function createEmptyViewState(): PersonaViewState {
  return {
    achorPoint: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  };
}

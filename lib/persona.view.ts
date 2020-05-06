
export type PersonaViewState<TPosType = number> = {
  scale: number,
  position: {
    x: TPosType,
    y: TPosType,
  },
  anchorPoint: {
    x: number,
    y: number,
  },
  rotation: number,
  transparency?: number,

  transition?: {
    /** `'power4.inOut'` will be used by default */
    ease?: string,
    /** 0 by default */
    delay?: number,
    /** 0 by default */
    duration?: number,
  },

  debugName?: string,
};

export namespace PersonaViewState {
  export function createEmptyViewState(): PersonaViewState {
    return {
      anchorPoint: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
      transparency: 0,
    };
  }
}

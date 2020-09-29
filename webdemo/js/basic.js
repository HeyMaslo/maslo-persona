import { Persona } from '../../web';

export class Basic {

  constructor() {
    this.element = document.getElementById('main');

    // persona instance example
    this._persona = new Persona({
      // target HTML container that will hold WebGL canvas
      element: this.element,

      // size of the canvas, in pixels. Recommended is `persona.radius` multiplied by 3
      size: 900,

      persona: {
        // amount of vertices per ring. Bigger value increases quality, smaller increases performance
        ringRes: 100,

        // radius of Persona view, in pixels
        radius: 300,
      },

      analytics: {
        appName: '@heymaslo/basic',
        dataSource: 'DemoUI',
        ignoreMood: true,
      },
    });
  }

  run = () => {
    this._persona.run();

    // overrides the persona mood
    // Moods = "joy" | "love" | "surprise" | "terror" | "anger" | "sadness" | "sleepy" | "calm";

    // this._persona.core.mood.joy = 1;
  }
}

import { IResourcesProvider } from './abstractions';

export function getRequireResources(): IResourcesProvider {
  return {
    audio: {
      hey: { url: require('./assets/audio/hey.mp3') },
      joy: { url: require('./assets/audio/joy.mp3') },
      no: { url: require('./assets/audio/no.mp3') },
      open: { url: require('./assets/audio/open.mp3') },
      pinch: { url: require('./assets/audio/pinch.mp3') },
      shake: { url: require('./assets/audio/shake.mp3') },
      surprise: { url: require('./assets/audio/surprise.mp3') },
      swipe: { url: require('./assets/audio/swipe.mp3') },
      tap: { url: require('./assets/audio/tap.mp3') },
      upset: { url: require('./assets/audio/upset.mp3') },
      yes: { url: require('./assets/audio/yes.mp3') },
      question: { url: require('./assets/audio/question.mp3') },
    },
    textures: {
      noise: { url: require('./assets/img/noise.png') },
    },
    shaders: {
      PersonaVertex: { raw: require('./assets/shaders/ringVertex.glsl') },
      PersonaFragment: { raw: require('./assets/shaders/ringFragment.glsl') },
    },
  };
}

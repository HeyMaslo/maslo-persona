import React from 'react';
import ExpoTHREE from 'expo-three';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { StyleSheet, Dimensions } from 'react-native';
import {
  PersonaCore,
  THREE,
  States,
  getRequireResources,
  UseResources,
  ResourceManager,
} from '../lib';
import { AudioPlayer } from './audioPlayer';

const { height, width } = Dimensions.get('window');
const aspectRatio = height / width;

const Device = {
  isSmall() {
    return (width <= 320) || aspectRatio < 1.6;
  },
};

export type Props = {
  state: States,
};

export class MasloPersonaExpo extends React.Component<Props> {

  private _gl: ExpoWebGLRenderingContext = null;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;
  private _renderer: ExpoTHREE.Renderer;
  private _persona: PersonaCore;

  private _rafId: number;

  componentDidMount() {
    UseResources(getRequireResources());
  }

  onGLContextCreate: ((gl: ExpoWebGLRenderingContext) => void) = async (gl) => {
    this._gl = gl;

    // THREE scene
    this._scene = new THREE.Scene();

    // THREE camera
    this._camera = new THREE.OrthographicCamera(gl.drawingBufferWidth / - 2, gl.drawingBufferWidth / 2, gl.drawingBufferHeight / 2, gl.drawingBufferHeight / - 2, 1, 1000);
    this._camera.position.z = 100;

    // THREE renderer and dimensions
    this._renderer = new ExpoTHREE.Renderer({ gl: this._gl as WebGLRenderingContext });
    this._renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const vector = new THREE.Vector2(0, 0);
    const stageDimensions = this._renderer.getSize(vector);
    const radius = Math.min(stageDimensions.width, stageDimensions.height) * (Device.isSmall() ? 0.34 : 0.38); // !Important : Sets the size of the rings !

    // Load THREE texture
    // const texture = await ExpoTHREE.loadTextureAsync({ asset: require('./../../assets/images/noise.png') });

    // position persona on screen
    this._persona = new PersonaCore(this._scene, {
      ringRes: 128,
      radius,
      glow: false,
      audio: new AudioPlayer(ResourceManager.Current),
    });

    // init animation
    // personaStore.mood = MOODS.INIT;

    this.step();
  }

  step = (time?: number) => {
    this._rafId = requestAnimationFrame(this.step);

    try {
      this._persona.step();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Persona step error', err);
    }

    // render scene
    this._renderer.render(this._scene, this._camera);
    this._gl.endFrameEXP();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._rafId);
  }

  render() {
    if (this._persona) {
      this._persona.setState(this.props.state);
    }

    return (
      <GLView
          style={styles.container}
          onContextCreate={this.onGLContextCreate}
      />
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
      flex: 1,
  },
  container: {
      flex: 1,
      top: Device.isSmall() ? '-18%' : '-20%',
      opacity: 0.8,
  },
});

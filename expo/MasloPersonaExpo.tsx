import React from 'react';
import ExpoTHREE from 'expo-three';
import suppressExpoWarnings from 'expo-three/build/suppressWarnings';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { StyleSheet, Dimensions, View, PixelRatio, Text, LayoutChangeEvent } from 'react-native';
import Constants from 'expo-constants';
import {
  PersonaCore,
  THREE,
  States,
  UseResources,
  ResourceManager,
  PersonaSettings,
} from '../lib';
import { AudioPlayer } from './audioPlayer';
import { getExpoAssetsAsync } from './resources';
import { createLogger } from '../lib/utils/logger';
import { reaction } from 'mobx';

const logger = createLogger('[MasloPersonaExpo]');

const Device = function() {
  const { height, width } = Dimensions.get('window');
  const aspectRatio = height / width;
  return {
    width, height, aspectRatio,
    pixelRatio: PixelRatio.get(),
    enableGL: Constants.isDevice,
    isSmall() {
      return (width <= 320) || aspectRatio < 1.6;
    },
  };
}();

export interface IPersonaContext {
  state: States;
}

export type Props = {
  context: IPersonaContext,
  disabled?: boolean,
  personaSettings?: Partial<PersonaSettings>,
};

type CompState = {
  resourcesLoaded: boolean,
  personStateStub: string,
};

export class MasloPersonaExpo extends React.Component<Props, CompState> {

  state = {
    resourcesLoaded: false,
    personStateStub: '<no persona>',
  };

  private _gl: ExpoWebGLRenderingContext = null;
  private _scene: THREE.Scene;
  private _camera: THREE.OrthographicCamera;
  private _renderer: ExpoTHREE.Renderer;
  private _persona: PersonaCore;

  private _rafId: number;

  private _observerDispose: () => void = null;

  componentDidMount() {
    suppressExpoWarnings(true);
    console.ignoredYellowBox = [
      'THREE.WebGLRenderer',
    ];

    this.loadResources()
      .then(() => {
        if (!Device.enableGL) {
          this._persona = new PersonaCore(new THREE.Scene(), {
            ringRes: 16, radius: 100,
            audio: new AudioPlayer(ResourceManager.Current),
            ...this.props.personaSettings,
          });

          this.setupObserver();
          this.step();
        }
      });
  }

  componentWillUnmount() {
    this.cleanup(true);
  }

  async loadResources() {
    const resources = await getExpoAssetsAsync();
    // console.log('RESOURCES:', resources);
    UseResources(resources);
    this.setState({ resourcesLoaded: true });
  }

  cleanup(disposePersona = false) {
    if (disposePersona && this._persona) {
      this._persona.dispose();
    }
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    this.cleanupObserver();
  }

  private cleanupObserver() {
    if (this._observerDispose) {
      this._observerDispose();
      this._observerDispose = null;
    }
  }

  private setupObserver() {
    this.cleanupObserver();

    if (this.props.context && this._persona) {
      this._persona.setState(this.props.context.state);
      this._updatePersonState();
      const o1 = reaction(_ => this.props.context.state, s => {
        this._persona.setState(s);
        this._updatePersonState();
      });
      const o2 = reaction(_ => this._persona.state, s => {
        this.props.context.state = s;
        this._updatePersonState();
      });
      this._observerDispose = () => {
        o1();
        o2();
      };
    }
  }

  private calcPersonaSize(pixelWidth: number, pixelHeight: number) {
    const pixelRadius = Math.min(pixelWidth, pixelHeight);
    const radius = Math.max(pixelRadius, 10) / Device.pixelRatio;
    const ringRes = Math.round(pixelRadius / 100) * 10 + 16;
    return { radius, ringRes };
  }

  onGLContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    this.cleanup(true);

    this._gl = gl;

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    logger.log('Initializing with GL context:', { width, height });

    // THREE scene
    this._scene = new THREE.Scene();

    // THREE camera
    this._camera = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, -10, 1000);
    this._camera.position.z = 100;

    // THREE renderer and dimensions
    this._renderer = new ExpoTHREE.Renderer({ gl: this._gl as WebGLRenderingContext });
    this._renderer.setSize(width, height);

    // position persona on screen
    this._persona = new PersonaCore(this._scene, {
      ...this.calcPersonaSize(width, height),
      glow: false,
      audio: new AudioPlayer(ResourceManager.Current),
      ...this.props.personaSettings,
    });

    this.setupObserver();

    this.step();
  }

  private onGLResize = (e: LayoutChangeEvent) => {
    if (!e || !e.nativeEvent || !e.nativeEvent.layout) {
      return;
    }

    logger.log('GLVIEW RESIZE!!!', e.nativeEvent.layout);
    if (!this._gl || !this._renderer || !this._camera) {
      return;
    }

    let { width, height } = e.nativeEvent.layout;
    width *= Device.pixelRatio;
    height *= Device.pixelRatio;

    this._renderer.setSize(width, height);

    // resize camera
    this._camera.left = -width / 2;
    this._camera.right = width / 2;
    this._camera.top = height / 2;
    this._camera.bottom = -height / 2;
    this._camera.updateProjectionMatrix();

    // resize persona
    const { radius } = this.calcPersonaSize(width, height);
    this._persona.radius = radius;

    // apply stuff
    this.step();
  }

  step = () => {
    // avoid accidental multiple subscribtions
    cancelAnimationFrame(this._rafId);

    try {
      this._persona.step();
    } catch (err) {
      console.error(err);
      return;
    }

    this._rafId = requestAnimationFrame(this.step);

    // render scene
    if (this._renderer) {
      this._renderer.render(this._scene, this._camera);
      this._gl.endFrameEXP();
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (this.props.disabled !== prevProps.disabled) {
      if (this.props.disabled) {
        this.cleanup();
      } else {
        this.step();
      }
    }

    if (this.props.context !== prevProps.context) {
      this.setupObserver();
    }
  }

  private _updatePersonState() {
    this.setState({
      personStateStub: this._persona ? this._persona.state : '<no persona>',
    });
  }

  render() {
    if (!this.state.resourcesLoaded) {
      return null;
    }

    return (
      <View style={styles.wrapper}>
        {Device.enableGL ? (
          <GLView
            onLayout={this.onGLResize}
            style={styles.container}
            onContextCreate={this.onGLContextCreate}
          />
        ) : (
          <View style={styles.stub}>
            <Text style={styles.stubTitle}>Persona State:</Text>
            <Text style={styles.stubText}>
              {this.state.personStateStub}
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
      flex: 1,
      backgroundColor: 'transparent',
  },
  container: {
      flex: 1,
  },
  stub: {
    position: 'absolute',
    left: 0,
    top: '50%',
    backgroundColor: '#0099FFAA',
    alignContent: 'center',
    width: '100%',
  },
  stubTitle: {
    textAlign: 'center',
  },
  stubText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'brown',
  },
});

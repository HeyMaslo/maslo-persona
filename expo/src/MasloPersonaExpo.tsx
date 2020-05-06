import React from 'react';
import ExpoTHREE from 'expo-three';
import suppressExpoWarnings from 'expo-three/build/suppressWarnings';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { StyleSheet, Dimensions, View, PixelRatio, Text, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Constants from 'expo-constants';
import { reaction, toJS } from 'mobx';
import {
  PersonaCore,
  THREE,
  UseResources,
  ResourceManager,
  PersonaSettings,
  PersonaViewState,
} from '@persona-core';
import { AudioPlayer } from './audioPlayer';
import { getExpoAssetsAsync } from './resources';
import { createLogger } from '../../lib/utils/logger';
import { IPersonaContext, CurrentPersonaSettings } from './context';

const logger = createLogger('[MasloPersonaExpo]');

const PersonaBaseScale = 1;

export const convertPercent = (s: string | number, multiplier = 1 / 100) => typeof s === 'string' ? (+s.replace('%', '') * multiplier) : s;

const Device = function() {
  const { height, width } = Dimensions.get('window');
  const aspectRatio = height / width;
  return {
    width, height, aspectRatio,
    pixelRatio: PixelRatio.get(),
    enableGL: Constants.isDevice,
  };
}();

export type Props = {
  context: IPersonaContext,
  disabled?: boolean,
  personaSettings?: Partial<PersonaSettings>,
  staticScale: number,
};

type CompState = {
  resourcesLoaded: boolean,
  personStateStub: string,
  viewStub: PersonaViewState,
};

export class MasloPersonaExpo extends React.Component<Props, CompState> {

  state = {
    resourcesLoaded: false,
    personStateStub: '<no persona>',
    viewStub: null as PersonaViewState,
  };

  private _gl: ExpoWebGLRenderingContext = null;
  private _scene: THREE.Scene;
  private _camera: THREE.OrthographicCamera;
  private _renderer: ExpoTHREE.Renderer;
  private _persona: PersonaCore;

  private _rafId: number;
  private _layout: { w: number, h: number } = null;

  private _contextObserverDispose: () => void = null;

  private readonly _currentSettings: CurrentPersonaSettings;

  constructor(props: any, ctx: any) {
    super(props, ctx);

    const self = this;
    this._currentSettings = {
      get radius() { return self._persona?.settings.radius; },
      get resultScale() { return self._persona?.scale.x; },
    };
  }

  componentDidMount() {
    suppressExpoWarnings(true);
    console.ignoredYellowBox = [
      'THREE.WebGLRenderer',
    ];

    this.loadResources()
      .then(() => {
        if (!Device.enableGL) {
          const { radius } = this.calcPersonaSize(Device.width * Device.pixelRatio, Device.height * Device.pixelRatio);
          this._persona = new PersonaCore(new THREE.Scene(), {
            ringRes: 2,
            radius,
            audio: new AudioPlayer(ResourceManager.Current),
            ...this.props.personaSettings,
          });

          this.props.context.currentSettings = this._currentSettings;

          this.setupContextObserver();
          this.step();
        }
      });
  }

  componentWillUnmount() {
    this.cleanup(true);
  }

  async loadResources() {
    try {
      const resources = await getExpoAssetsAsync();
      UseResources(resources);
      this.setState({ resourcesLoaded: true });
    } catch (err) {
      console.error('loadResources ERROR');
      console.error(err);
    }
  }

  cleanup(disposePersona = false) {
    if (disposePersona && this._persona) {
      this._persona.dispose();
    }
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    this.cleanupContextObserver();
  }

  private cleanupContextObserver() {
    if (this._contextObserverDispose) {
      this._contextObserverDispose();
      this._contextObserverDispose = null;
    }
  }

  private setupContextObserver() {
    this.cleanupContextObserver();

    if (this.props.context && this._persona) {
      this._persona.setState(this.props.context.state, true);
      this._updatePersonaTextState();
      this._updatePersonViewState(this.props.context.view, 0);
      const disposers = [
        reaction(_ => this.props.context.state, s => {
          this._persona.setState(s, true);
          this._updatePersonaTextState();
        }),
        reaction(_ => this._persona.state, s => {
          this.props.context.state = s;
          this._updatePersonaTextState();
        }),
        reaction(_ => this.props.context.view, v => {
          this._updatePersonViewState(v);
        }),
      ];
      this._contextObserverDispose = () => {
        disposers.forEach(d => d());
      };
    }
  }

  private calcPersonaSize(pixelWidth: number, pixelHeight: number) {
    let radius = (this.props.staticScale || 1) * PersonaBaseScale * Math.min(pixelWidth, pixelHeight) / 2;
    radius = Math.max(radius, 10);

    let ringRes = Math.round(2 * radius / 9);
    ringRes = Math.max(40, Math.min(120, ringRes));
    return { radius, ringRes };
  }

  onGLContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    this.cleanup(true);

    this._gl = gl;

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    this._layout = { w: width, h: height };

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
      skipTextures: 'background',
      audio: new AudioPlayer(ResourceManager.Current),
      ...this.props.personaSettings,
    });

    this.props.context.currentSettings = this._currentSettings;

    this.setupContextObserver();
    this.step();
  }

  private onGLResize = (e: LayoutChangeEvent) => {
    if (!e || !e.nativeEvent || !e.nativeEvent.layout) {
      return;
    }

    if (!this._gl || !this._renderer || !this._camera) {
      return;
    }

    logger.log('GLVIEW RESIZE!!!', e && e.nativeEvent && e.nativeEvent.layout, this._layout);

    let { width, height } = e.nativeEvent.layout;
    width *= Device.pixelRatio;
    height *= Device.pixelRatio;

    this._layout = { w: width, h: height };

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
      if (!this._persona) {
        throw new ReferenceError('persona is not initialized!');
      }

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
      } else if (prevProps.disabled === true) {
        this.setupContextObserver();
        this.step();
      }
    }

    if (this.props.context !== prevProps.context) {
      this.setupContextObserver();
    }
  }

  private _updatePersonViewState(v: PersonaViewState<string | number>, duration?: number) {
    const vv = toJS(v as PersonaViewState);

    if (duration) {
      if (!vv.transition) {
        vv.transition = {};
      }
      vv.transition.duration = duration;
    }

    const width = this._layout ? this._layout.w : (Device.width * Device.pixelRatio);
    const height = this._layout ? this._layout.h : (Device.height * Device.pixelRatio);

    if (v.position) {
      vv.position.x = convertPercent(v.position.x || 0, width / 100);
      vv.position.y = convertPercent(v.position.y || 0, height / 100);
    }

    if (v.debugName) {
      logger.log('updatePersonViewState ', v.debugName, ' : ', width, height, vv.position?.x, vv.position?.y, vv.anchorPoint?.x, vv.anchorPoint?.y);
    }

    this._persona.setViewState(vv);
    if (!Device.enableGL) {
      this.setState({ viewStub: vv });
    }
  }

  private _updatePersonaTextState() {
    this.setState({
      personStateStub: this._persona ? this._persona.state : '<no persona>',
    });
  }

  private getStubStyle(): StyleProp<ViewStyle> {
    const view = this.state.viewStub || PersonaViewState.createEmptyViewState();

    const w = Device.width,
      h = Device.height;

    let { radius } = this.calcPersonaSize(w, h);

    radius *= view.scale;

    const xx = (view.position?.x || 0) / Device.pixelRatio,
      yy = (view.position?.y || 0) / Device.pixelRatio;

    const ax = (view.anchorPoint?.x || 0) - 1,
      ay = (view.anchorPoint?.y || 0) + 1;

    const x = w / 2 + xx + ax * radius;
    const y = h / 2 - yy - ay * radius;

    return {
      opacity: (1 - (view.transparency || 0)),
      left: x,
      top: y,
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
    };
  }

  render() {
    if (!this.state.resourcesLoaded) {
      logger.log('Skipping render – waiting for resources');
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
          <View style={[styles.stub, this.getStubStyle()]}>
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
    backgroundColor: 'rgba(0, 0, 200, 0.5)',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stubText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'brown',
  },
});

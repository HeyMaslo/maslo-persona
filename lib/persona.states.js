import {
    TimelineMax,
    Back,
    Elastic,
    Power0,
    Power2,
    Power3,
    Power4,
    RoughEase,
} from 'gsap';
import { AudioTracks } from './audio';
import * as StatesConsts from './states';

/** @typedef {(import ('./persona').MasloPersona)} MasloPersona */
/** @typedef {{started:boolean,timelines:TimelineMax[],tl2:TimelineMax}} PersonaListeningState */

/** @typedef {(import ('./gsap.extensions'))} GsapExtensions */

/** @typedef {typeof StatesConsts} StatesConstsType */
/** @typedef {StatesConstsType[keyof StatesConstsType]} StateTypes */

/** @typedef {{finishPromise?: Promise<any>, used?: boolean}} StateRunnerArgs */

/** @type {StateTypes[]} */
const AllStates = Object.keys(StatesConsts).map(key => StatesConsts[key]);

/** @typedef {StatesConstsType['Listen'] | StatesConstsType['Idle']} ContinualStatesType */

export {
    StatesConsts as States,
    AllStates,
};

/**
 * @param {MasloPersona} persona
 * @returns {{ [key in StateTypes]: (args?:StateRunnerArgs) => TimelineMax }}
*/
export function createStates(persona) {
    const goToIdle = () => persona.setState('idle');
    const createTimeline = () => new TimelineMax({ onComplete: goToIdle });

    return {
        init() {
            const timeline = createTimeline();
            persona.audio.play(AudioTracks.Open);

            for (let i = 0; i < persona.rings.length; i++) {
                const ring = persona.rings[i];
                ring.data.theta = 3 * ring.data.seed.z;
                const startScale =  1 - (i + 2) * 0.1;
                const delay = (i / persona.rings.length) / 2;

                timeline
                    .fromTo(ring.data.scale, 2.3, {
                        x: startScale,
                        y: startScale,
                    }, {
                        x: 1,
                        y: 1,
                        ease: Elastic.easeOut.config(1, 0.3),
                        delay: delay,
                    }, 0)
                    .to(ring.data, 0.2, {
                        opacity: 1,
                        delay: delay,
                    }, 0)
                    .to(ring.data, 2, {
                        theta: i * 0.01,
                        ease: Elastic.easeOut.config(1, 0.6),
                    }, 0.8)
                    .to(ring.data, 2, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        intensity: 0.21,
                        osc: 0.06,
                        ease: Power4.easeOut,
                    }, 0.8)
                    .to(ring.data.hsl, 0.1, {
                        x: ring.data.originalColor.x,
                        y: ring.data.originalColor.y,
                        z: ring.data.originalColor.z,
                        ease: Power3.easeOut,
                    }, 2);
            }

            return timeline;
        },

        idle() {
            return new TimelineMax();
        },

        joy() {
            const timeline = createTimeline();

            persona.audio.play(AudioTracks.Joy);
            const expandTimeOn = 0.5;
            const expandTimeOff = 0.5;
            const expandSpread = 0.2;
            const expandScale = 0.9;
            const returnDelay = 0.4;

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;
                const theta = (Math.sign(ringData.seed.z) > 0) ? (2 + i * 0.01) : (-2 + i * 0.01);

                timeline.add(new TimelineMax()
                    .to(ringData.position, expandTimeOn, {
                        x: expandSpread,
                        y: expandSpread,
                        ease: Power2.easeOut,
                    })
                    .to(ringData.position, expandTimeOff, {
                        x: 0,
                        y: 0,
                        delay: returnDelay + ((persona.rings.length - i) / persona.rings.length) / 2,
                        ease: Power2.easeOut,
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .fromTo(ringData.scale, expandTimeOn, {
                        x: ringData.scale.x,
                        y: ringData.scale.y,
                    }, {
                        x: expandScale,
                        y: expandScale,
                        ease: Back.easeOut.config(1.7),
                    })
                    .to(ringData.scale, expandTimeOff, {
                        x: 1,
                        y: 1,
                        delay: returnDelay + ((persona.rings.length - i) / persona.rings.length) / 2,
                        ease: Back.easeOut.config(1.7),
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ringData, 2, {
                        theta: theta,
                        ease: Power4.easeOut,
                        delay: ((persona.rings.length - i) / persona.rings.length) / 2,
                    })
                    .to(ringData, 0, {
                        theta: i * 0.01,
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ringData, 0.6, {
                        gaussIt: 0.5,
                        weightIn: 0.2,
                        intensity: 0.6,
                        osc: 0.36,
                        ease: Power4.easeOut,
                    })
                    .to(ringData, 0.6, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        intensity: 0.21,
                        osc: 0.06,
                        ease: Power4.easeOut,
                    }),
                 0);
            }

            return timeline;
        },

        surprise() {
            const timeline = createTimeline();
            persona.audio.play(AudioTracks.Surprise);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                timeline.add(new TimelineMax()
                    .to(ringData, 2, {
                        gaussIt: 0,
                        weightIn: 0.3,
                        osc: 0.2,
                        // @ts-ignore
                        ease: RoughEase.ease.config({
                            template: Power0.easeNone,
                            strength: 0.3,
                            points: 3,
                            taper: 'none',
                            randomize: true,
                            clamp: false,
                        }),
                    })
                    .to(ringData, 2, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        osc: 0.06,
                        ease: Power4.easeOut,
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ringData.scale, 0.3, {
                        x: 1.1 + (persona.rings.length - i) / 500,
                        y: 1.1 + (persona.rings.length - i) / 500,
                        delay: ((i) / persona.rings.length) / 2 / 2,
                        ease: Back.easeOut.config(1.7),
                    })
                    .to(ringData.scale, 0.3, {
                        x: 1,
                        y: 1,
                        delay: 1.6 + ((persona.rings.length - i) / persona.rings.length) / 2 / 2,
                        ease: Back.easeOut.config(1.7),
                    }),
                 0);
            }

            timeline.add(new TimelineMax()
                .fromTo(persona._data, 0.3, { timeInc: persona._data.timeInc }, { timeInc: 0.3, ease: Power3.easeOut })
                .to(persona._data, 0.2, { timeInc: 0.01, delay: 1.65, ease: Power3.easeIn }),
             0);

            return timeline;
        },

        upset() {
            const timeline = createTimeline();

            persona.audio.play(AudioTracks.Upset);
            const timeIn = 1.5;
            const timeOut = 1;
            const delayInOut = 1;

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                timeline.add(new TimelineMax()
                    .to(ringData.scale, timeIn, {
                        x: 0.8 + (-i) * 0.03,
                        y: 0.8 + (-i) * 0.03,
                        ease: Elastic.easeOut.config(1, 0.3),
                        delay: (1 - (i / persona.rings.length)) / 2,
                    })
                    .to(ringData.scale, timeOut, {
                        x: 1,
                        y: 1,
                        delay: delayInOut,
                        ease: Power4.easeOut,
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ringData, timeIn, {
                        gaussIt: 0.2,
                        theta: 0,
                        ease: Elastic.easeOut.config(1, 0.3),
                    })
                    .to(ringData, timeOut, {
                        gaussIt: 0.98,
                        theta: i * 0.01,
                        delay: delayInOut,
                        ease: Elastic.easeOut.config(1, 0.3),
                    }),
                 0);
            }

            timeline.add(new TimelineMax()
                .to(persona._settings.hsl, timeIn, { y: 0.2, ease: Power3.easeOut  })
                .to(persona._settings.hsl, timeOut, { y: 0.73, delay: delayInOut, ease: Power3.easeOut  }),
             0);

            timeline.add(new TimelineMax()
                .to(persona._settings, timeIn, { rotation: 1.5 + Math.random(), ease: Power3.easeOut  })
                .to(persona._settings, timeOut, { rotation: 3, delay: delayInOut, ease: Power3.easeOut  })
                .add(() => { persona._settings.rotation = 0; }),
             0);

            timeline.add(new TimelineMax()
                .to(persona._data, timeIn, { timeInc: 0.002, ease: Power3.easeOut })
                .to(persona._data, timeOut, { timeInc: 0.01, ease: Power3.easeOut }),
             0);

            return timeline;
        },

        yes() {
            const timeline = createTimeline();

            persona.audio.play(AudioTracks.Yes);
            for (let i = 0; i < persona.rings.length; i++) {

                const ringData = persona.rings[i].data;

                timeline.add(new TimelineMax()
                    .to(ringData.scale, 0.2, {
                        x: 1.1,
                        y: 1.1,
                        ease: Power3.easeOut,
                    })
                    .to(ringData.scale, 1.2, {
                        x: 1,
                        y: 1,
                        delay: 1.57,
                        ease: Elastic.easeOut.config(1, 0.4),
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ringData.position, 0.2, {
                        x: 0.05 * Math.cos(Math.random() * 2 * Math.PI),
                        y: 0.05 * Math.sin(Math.random() * 2 * Math.PI),
                        ease: Power3.easeOut,
                    })
                    .to(ringData.position, 1.2, {
                        x: 0,
                        y: 0,
                        delay: 1.57,
                        ease: Elastic.easeOut.config(1, 0.4),
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ringData, 0.1, {
                        gaussIt: 0.1,
                        weightIn: 0.5,
                        intensity: 1,
                        osc: 0.1,
                        theta: Math.random() * ringData.seed.z,
                        ease: Power3.easeOut,
                    })
                    .to(ringData, 1.2, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        intensity: 0.21,
                        osc: 0.06,
                        theta: i * 0.01,
                        ease: Power3.easeOut,
                        delay: 1.55,
                    }),
                 0);
            }

            timeline.add(new TimelineMax()
                .to(persona._settings, 2.4, { rotation: -1, ease: Power3.easeOut  })
                .to(persona._settings, 0.8, { rotation: 0, ease: Power3.easeOut  })
                .add(() => { persona._settings.rotation = 0; }),
             0);

            timeline.add(new TimelineMax()
                .to(persona._data, 0.2, { timeInc: 0.1, ease: Power3.easeOut })
                .to(persona._data, 1, { timeInc: 0.01, delay: 3, ease: Power3.easeOut }),
             0);

            return timeline;
        },

        no() {
            const timeline = createTimeline();
            persona.audio.play(AudioTracks.No);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                timeline.add(new TimelineMax()
                    .to(ringData, 2, {
                        gaussIt: 0.1,
                        weightIn: 0.8,
                        shadowSpread: 0.03,
                        theta: Math.random() * ringData.seed.z,
                        ease: Power3.easeOut,
                    })
                    .to(ringData, 2, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        shadowSpread: 0.01,
                        theta: i * 0.01,
                        ease: Power3.easeOut,
                        delay: 1,
                    }),
                 0);
            }

            timeline.add(new TimelineMax()
                .to(persona._settings.hsl, 2, {
                    z: 0.2,
                    ease: Power3.easeOut,
                })
                .to(persona._settings.hsl, 2, {
                    z: 0.47,
                    delay: 1,
                    ease: Power3.easeOut,
                }),
             0);

            timeline.add(new TimelineMax()
                .to(persona._data, 0.5, {
                    timeInc: 0,
                    ease: Power3.easeOut,
                })
                .to(persona._data, 2, {
                    timeInc: 0.01,
                    delay: 1.5,
                    ease: Power3.easeOut,
                }),
             0);

            return timeline;
        },

        hey() {
            const timeline = createTimeline();
            persona.audio.play(AudioTracks.Hey);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                timeline.add(new TimelineMax()
                    .to(ringData, 0.5, {
                        gaussIt: 0.83,
                        weightIn: 0.03,
                        intensity: 0.45,
                        osc: 0.34,
                        theta: Math.random() / 2,
                        ease: Power3.easeOut,
                    })
                    .to(ringData, 0.6, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        intensity: 0.21,
                        osc: 0.06,
                        theta: i * 0.01,
                        ease: Power3.easeOut,
                    }),
                 0);
            }

            timeline.add(new TimelineMax()
                .to(persona._data, 1, {
                    timeInc: 0.1,
                    ease: Power3.easeOut,
                })
                .to(persona._data, 1, {
                    timeInc: 0.01,
                    delay: 0.5,
                    ease: Power3.easeOut,
                }),
             0);

            return timeline;
        },

        shake() {
            const timeline = createTimeline();
            persona.audio.play(AudioTracks.Shake);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                timeline.add(new TimelineMax()
                    .to(ringData, 0.6, {
                        gaussIt: 0,
                        weightIn: 0.1,
                        intensity: 3,
                        osc: 0.1,
                        theta: Math.random() / 2,
                        ease: Power3.easeOut,
                    })
                    .to(ringData, 0.3, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        intensity: 0.05,
                        osc: 0.06,
                        theta: i * 0.01,
                        delay: 0.3,
                        ease: Power3.easeOut,
                    }),
                 0);
            }

            timeline.add(new TimelineMax()
                .to(persona._data, 1, {
                    timeInc: 0.5,
                    ease: Power3.easeOut,
                })
                .to(persona._data, 1, {
                    timeInc: 0.01,
                    delay: 0,
                    ease: Power3.easeOut,
                }),
             0);

            return timeline;
        },

        tap() {
            const timeline = createTimeline();
            persona.audio.play(AudioTracks.Tap);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                timeline.add(new TimelineMax()
                    .to(ringData.scale, 0.1, {
                        x: 0.9,
                        y: 0.9,
                        ease: Elastic.easeOut.config(1, 0.3),
                        delay: ((persona.rings.length - i) / persona.rings.length) / 20,
                    })
                    .to(ringData.scale, 0.1, {
                        x: 0.8,
                        y: 0.8,
                        ease: Elastic.easeOut.config(1, 0.3),
                        delay: ((persona.rings.length - i) / persona.rings.length) / 20,
                    })
                    .to(ringData.scale, 0.15, {
                        x: 0.75,
                        y: 0.75,
                    })
                    .to(ringData.scale, 1.1, {
                        x: 1,
                        y: 1,
                        ease: Elastic.easeOut.config(1, 0.3),
                        delay: (i / persona.rings.length) / 5,
                    }),
                 0);
            }

            return timeline;
        },

        /** @param {StateRunnerArgs=} args */
        listen(args) {
            const finishPromise = args && args.finishPromise;
            if (finishPromise) {
                args.used = true;
                let timeline = new TimelineMax();

                for (let i = 0; i < persona.rings.length; i++) {
                    const ring = persona.rings[i];
                    const ringData = ring.data;
                    const theta = -Math.PI / 12 - i * 0.001;

                    timeline.add(new TimelineMax()
                        .to(ringData, 1, {
                            theta: theta,
                            gaussIt: 0.8,
                            weightIn: 0.6,
                            intensity: 0.3,
                            osc: 0.14,
                            ease: Power4.easeOut,
                            delay: ((persona.rings.length - i) / persona.rings.length) / 2,
                        }),
                     0);
                }

                timeline.add(new TimelineMax()
                    .to(persona._data, 1, {
                        timeInc: 0.05,
                        ease: Power3.easeOut,
                    }),
                 0);

                finishPromise
                    .then(() => {
                        timeline.kill();
                        timeline.clear();
                        timeline = createTimeline();

                        for (let i = 0; i < persona.rings.length; i++) {
                            const ring = persona.rings[i];
                            timeline.add(new TimelineMax()
                                .to(ring.data, 0.4, {
                                    gaussIt: 0.98,
                                    weightIn: 1,
                                    intensity: 0.21,
                                    osc: 0.06,
                                    delay: ((persona.rings.length - i) / persona.rings.length) / 20,
                                }),
                             0);

                            timeline.add(new TimelineMax()
                                .to(ring.data, 1, {
                                    theta: i * 0.01,
                                    delay: ((persona.rings.length - i) / persona.rings.length) / 20,
                                    ease: Elastic.easeOut.config(1, 0.8),
                                }),
                             0);
                        }

                        timeline.add(new TimelineMax()
                            .to(persona._data, 0.4, {
                                timeInc: 0.01,
                                ease: Power3.easeOut,
                            }),
                         0);
                    });

                return timeline;
            }

            const timeline = createTimeline();

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;
                const theta = -Math.PI / 12 - i * 0.001;

                timeline.add(new TimelineMax()
                    .to(ringData, 1, {
                        theta: theta,
                        gaussIt: 0.8,
                        weightIn: 0.6,
                        intensity: 0.3,
                        osc: 0.14,
                        ease: Power4.easeOut,
                        delay: ((persona.rings.length - i) / persona.rings.length) / 2,
                    })
                    .to(ringData, 0.4, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        intensity: 0.21,
                        osc: 0.06,
                        theta: i * 0.01,
                        delay: 4 + ((persona.rings.length - i) / persona.rings.length) / 20,
                    }),
                 0);
            }

            timeline.add(new TimelineMax()
                .to(persona._data, 1, {
                    timeInc: 0.05,
                    ease: Power3.easeOut,
                })
                .to(persona._data, 0.4, {
                    timeInc: 0.01,
                    delay: 4,
                    ease: Power3.easeOut,
                }),
             0);

            return timeline;
        },

        question() {
            const timeline = createTimeline();
            persona.audio.play('question');

            const timeIn = 0.4;
            const delay = 0.4;
            const timeOut = 0.6;

            for (let i = 0; i < persona.rings.length; i++) {
                const ring = persona.rings[i];
                timeline.add(new TimelineMax()
                    .to(ring.data.scale, timeIn, {
                        x: 1 + (i - persona.rings.length) * 0.01,
                        y: 1 + (i - persona.rings.length) * 0.01,
                        ease: Power3.easeOut,
                    })
                    .to(ring.data.scale, timeOut, {
                        x: 1,
                        y: 1,
                        delay: delay,
                        ease: Elastic.easeOut.config(1, 0.4),
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ring.data.position, timeIn, {
                        x: 0 * Math.cos(Math.random() * 2 * Math.PI),
                        y: 0.1 * Math.sin(Math.random() * 2 * Math.PI),
                        ease: Power3.easeOut,
                    })
                    .to(ring.data.position, timeOut, {
                        x: 0,
                        y: 0,
                        delay: delay,
                        ease: Elastic.easeOut.config(1, 0.4),
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ring.data, timeIn, {
                        gaussIt: 0.1,
                        weightIn: 0.5,
                        intensity: 1,
                        osc: 0.1,
                        ease: Power3.easeOut,
                    })
                    .to(ring.data, timeOut, {
                        gaussIt: 0.98,
                        weightIn: 1,
                        intensity: 0.21,
                        osc: 0.06,
                        ease: Power3.easeOut,
                        delay: delay,
                    }),
                 0);

                timeline.add(new TimelineMax()
                    .to(ring.data, timeIn, {
                        theta: Math.random(),
                        ease: Power3.easeOut,
                    })
                    .to(ring.data, timeOut, {
                        theta: i * 0.01,
                        delay: delay,
                        ease: Power3.easeOut,
                    }),
                 0);
            }

            timeline.add(new TimelineMax()
                .to(persona._data, timeIn, {
                    timeInc: 0.1,
                    ease: Power3.easeOut,
                })
                .to(persona._data, timeOut, {
                    timeInc: 0.01,
                    delay: delay,
                    ease: Power3.easeOut,
                }),
             0);

            return timeline;
        },
    };
}

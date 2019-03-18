import * as THREE from 'three';
import {
    TimelineMax,
    TweenMax,
    Back,
    Elastic,
    Power0,
    Power2,
    Power3,
    Power4,
    RoughEase,
} from 'gsap';
import { AudioTracks } from './audio';

/** @typedef {(import ('./persona').MasloPersona)} MasloPersona */
/** @typedef {{started:boolean,timelines:TimelineMax[],tl2:TimelineMax}} PersonaListeningState */

const GlobalModifiers = {
    joy: {
        timeInc: 0.15,
    },
    love: {
        timeInc: 0.15,
        modifierTimestep: 0.003,
    },
    surprise: {
        timeInc: 0.05,
    },
    terror: {
        timeInc: 0.1,
        modifierTimestep: 0.03,
    },
    anger: {
        timeInc: 0.3,
        modifierTimestep: 0.05,
    },
    sadness: {
        timeStep: -0.004,
    },
    sleepy: {
        modifierTimestep: 0.001,
    },
    calm: {
        modifierTimestep: 0.001,
    },
};

/** @param {MasloPersona} persona */
export default function createStates(persona) {
    return {
        init() {
            persona.audio.play(AudioTracks.Open);
            for (let i = 0; i < persona.rings.length; i++) {
                const ring = persona.rings[i];
                ring.data.theta = 3 * ring.data.seed.z;
                const startScale =  1 - (i + 2) * 0.1;

                TweenMax.fromTo(ring.data.scale, 2.3, {
                    x: startScale,
                    y: startScale,
                }, {
                    x: 1,
                    y: 1,
                    ease: Elastic.easeOut.config(1, 0.3),
                    delay: (i / persona.rings.length) / 2,
                });
                TweenMax.to(ring.data, 0.2, { opacity: 1, delay: (i / persona.rings.length) / 2 });
                TweenMax.to(ring.data, 2, { theta: i * 0.01, delay: 0.8, ease: Elastic.easeOut.config(1, 0.6) });
                TweenMax.to(ring.data, 2, {
                    gaussIt: 0.98,
                    weightIn: 1,
                    intensity: 0.21,
                    osc: 0.06,
                    delay: 0.8,
                    ease: Power4.easeOut,
                    onComplete: () => persona.setState('idle'),
                });
            }
        },

        idle() {
            const moods = persona.mood;

            const globalMods = {};

            Object.keys(moods).forEach(mood => {
                const globalModifier = GlobalModifiers[mood];
                if (globalModifier) {
                    Object.keys(globalModifier).forEach(modifier => {
                        if (!globalMods[modifier]) {
                            globalMods[modifier] = 0;
                        }
                        globalMods[modifier] += globalModifier[modifier] * moods[mood];
                    });
                }
            });

            const { modifierTime, simplex } = persona._settings;

            for (let i = 0; i < persona.rings.length; i++) {
                const n = simplex.noise2D(i / 8 * 10, modifierTime);
                const n2 = simplex.noise2D(modifierTime, i / 8 * 10);

                const ringModifiers = {
                    joy: {
                        gaussIt: -0.98,
                        weightIn: -0.9,
                        theta: i / 8,
                        intensity: 2,
                        osc: 0.04,
                    },
                    love: {
                        gaussIt: -0.98,
                        weightIn: -0.9,
                        theta: i / 8,
                        intensity: 1,
                        osc: 0.04,
                        scaleInc: 0,
                        positionX: 0.2 + 0.01 * i * Math.sin(Math.PI * 2 * modifierTime),
                        positionY: 0.2 + 0.01 * i * Math.cos(Math.PI * 2 * modifierTime),
                    },
                    surprise: {
                        gaussIt: -0.98,
                        weightIn: -0.3,
                        intensity: 2,
                        theta: i / 8,
                        osc: 0.03,
                        scaleInc: 0.15 * ((8 - i) / 8),
                    },
                    terror: {
                        gaussIt: -0.98,
                        weightIn: -0.9,
                        rotation: i / 8,
                        intensity: 0.8,
                        osc: 0.1,
                        scaleInc: 0.1 * ((8 - i) / 16),
                        positionX: n * 0.1,
                        positionY: n2 * 0.1,
                    },
                    anger: {
                        gaussIt: -0.98,
                        weightIn: -0.9,
                        intensity: 2,
                        theta: i / 8,
                        osc: 0.1,
                        scaleInc: ((i) / 32),
                        positionX: n * 0.1 * ((8 - i) / 4),
                        positionY: n2 * 0.1 * ((8 - i) / 4),
                    },
                    sadness: {
                        gaussIt: -0.8,
                        weightIn: -0.2,
                        osc: 0.04,
                    },
                    sleepy: {
                        theta: i / 8,
                        scaleInc: 0.15 * ((8 - i) / 8) * Math.cos(Math.PI * 2 * modifierTime),
                    },
                    calm: {
                        gaussIt: -0.6,
                        weightIn: -0.5,
                        scaleInc: 0.15 * ((i) / 8) * Math.cos(Math.PI * 2 * modifierTime),
                    },

                };

                const ringMods = {
                    gaussIt: 0,
                    weightIn: 0,
                    intensity: 0,
                    theta: 0,
                    osc: 0,
                    scaleInc: 0,
                    positionX: 0,
                    positionY: 0,
                };

                Object.keys(moods).forEach(mood => {
                    const ringMod = ringModifiers[mood];
                    if (ringMod) {
                        Object.keys(ringMod).forEach(modifier => {
                            if (!ringMods[modifier]) {
                                ringMods[modifier] = 0;
                            }
                            ringMods[modifier] += ringMod[modifier] * moods[mood];
                        });
                    }
                });

                const ringData = persona.rings[i].data;

                ringData.gaussIt = 0.98 + ringMods.gaussIt;
                ringData.weightIn = 1 + ringMods.weightIn;
                ringData.intensity = 0.21 + ringMods.intensity;
                ringData.theta = i * 0.01 + ringMods.theta;
                ringData.osc = 0.06 + ringMods.osc;
                ringData.scaleInc = new THREE.Vector3(ringMods.scaleInc, ringMods.scaleInc, 0);
                ringData.position.x = ringMods.positionX;
                ringData.position.y = ringMods.positionY;
            }

            persona._timeInc = 0.005 + globalMods.timeInc;
            persona._modifierTimestep = globalMods.modifierTimestep;
        },

        joy() {
            persona.audio.play(AudioTracks.Joy);
            const expandTimeOn = 0.5;
            const expandTimeOff = 0.5;
            const expandSpread = 0.2;
            const expandScale = 0.9;
            const returnDelay = 0.4;

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;
                const theta = (Math.sign(ringData.seed.z) > 0) ? (2 + i * 0.01) : (-2 + i * 0.01);
                const tl = new TimelineMax();
                tl
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
                    });

                const tl2 = new TimelineMax();
                tl2
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
                    });

                const tl3 = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl3
                    .to(ringData, 2, {
                        theta: theta,
                        ease: Power4.easeOut,
                        delay: ((persona.rings.length - i) / persona.rings.length) / 2,
                    })
                    .to(ringData, 0, {
                        theta: i * 0.01,
                    });

                const tl4 = new TimelineMax();
                tl4
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
                    });
            }
        },

        surprise() {
            persona.audio.play(AudioTracks.Surprise);
            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                const tl0 = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl0
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
                    });

                const tl2 = new TimelineMax();
                tl2
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
                    });
            }

            const tl1 = new TimelineMax();
            tl1
                .fromTo(persona, 0.3, { _timeInc: persona._timeInc }, { _timeInc: 0.3, ease: Power3.easeOut })
                .to(persona, 0.2, { _timeInc: 0.01, delay: 1.65, ease: Power3.easeIn });
        },

        upset() {
            persona.audio.play(AudioTracks.Upset);
            const timeIn = 1.5;
            const timeOut = 1;
            const delayInOut = 1;

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                const tl0 = new TimelineMax();
                tl0
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
                    });

                const tl1 = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl1
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
                    });
            }

            const tl2 = new TimelineMax();
            tl2
                .to(persona._settings.hsl, timeIn, { y: 0.2, ease: Power3.easeOut  })
                .to(persona._settings.hsl, timeOut, { y: 0.73, delay: delayInOut, ease: Power3.easeOut  });

            const tl3 = new TimelineMax({ onComplete: () => { persona._settings.rotation = 0; } });
            tl3
                .to(persona._settings, timeIn, { rotation: 1.5 + Math.random(), ease: Power3.easeOut  })
                .to(persona._settings, timeOut, { rotation: 3, delay: delayInOut, ease: Power3.easeOut  });

            const tl4 = new TimelineMax();
            tl4
                .to(persona, timeIn, { _timeInc: 0.002, ease: Power3.easeOut })
                .to(persona, timeOut, { _timeInc: 0.01, ease: Power3.easeOut });
        },

        yes() {
            persona.audio.play(AudioTracks.Yes);
            for (let i = 0; i < persona.rings.length; i++) {

                const ringData = persona.rings[i].data;

                const tl0 = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl0
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
                    });

                const tl5 = new TimelineMax();
                tl5
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
                    });

                const tl1 = new TimelineMax();
                tl1
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
                    });
            }

            const tl3 = new TimelineMax({ onComplete: () => { persona._settings.rotation = 0; } });
            tl3.to(persona._settings, 2.4, { rotation: -1, ease: Power3.easeOut  });
            tl3.to(persona._settings, 0.8, { rotation: 0, ease: Power3.easeOut  });

            const tl4 = new TimelineMax();
            tl4
                .to(persona, 0.2, { _timeInc: 0.1, ease: Power3.easeOut })
                .to(persona, 1, { _timeInc: 0.01, delay: 3, ease: Power3.easeOut });
        },

        no() {
            persona.audio.play(AudioTracks.No);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                const tl1 = new TimelineMax();
                tl1
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
                    });
            }

            const tl2 = new TimelineMax({ onComplete: () => persona.setState('idle') });
            tl2
                .to(persona._settings.hsl, 2, {
                    z: 0.2,
                    ease: Power3.easeOut,
                })
                .to(persona._settings.hsl, 2, {
                    z: 0.47,
                    delay: 1,
                    ease: Power3.easeOut,
                });

            const tl4 = new TimelineMax();
            tl4
                .to(persona, 0.5, {
                    _timeInc: 0,
                    ease: Power3.easeOut,
                })
                .to(persona, 2, {
                    _timeInc: 0.01,
                    delay: 1.5,
                    ease: Power3.easeOut,
                });

        },

        hey() {
            persona.audio.play(AudioTracks.Hey);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                const tl1 = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl1
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
                    });
            }
            const tl4 = new TimelineMax();
            tl4
                .to(persona, 1, {
                    _timeInc: 0.1,
                    ease: Power3.easeOut,
                })
                .to(persona, 1, {
                    _timeInc: 0.01,
                    delay: 0.5,
                    ease: Power3.easeOut,
                });
        },

        shake() {
            persona.audio.play(AudioTracks.Shake);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                const tl1 = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl1
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
                    });
            }

            const tl4 = new TimelineMax();
            tl4
                .to(persona, 1, {
                    _timeInc: 0.5,
                    ease: Power3.easeOut,
                })
                .to(persona, 1, {
                    _timeInc: 0.01,
                    delay: 0,
                    ease: Power3.easeOut,
                });
        },

        tap() {
            persona.audio.play(AudioTracks.Tap);

            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;

                const tl1 = new TimelineMax({ onComplete: () => persona.setState('idle') });

                tl1
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
                    });
            }
        },

        listen() {
            for (let i = 0; i < persona.rings.length; i++) {
                const ringData = persona.rings[i].data;
                const theta = -Math.PI / 12 - i * 0.001;

                const tl = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl
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
                    });
            }

            const tl2 = new TimelineMax();
            tl2
                .to(persona, 1, {
                    _timeInc: 0.05,
                    ease: Power3.easeOut,
                })
                .to(persona, 0.4, {
                    _timeInc: 0.01,
                    delay: 4,
                    ease: Power3.easeOut,
                });
        },

        listenStart() {
            const { _listening: listening } = persona;
            listening.started = true;
            listening.timelines = [];

            for (let i = 0; i < persona.rings.length; i++) {
                const ring = persona.rings[i];
                const theta = -Math.PI / 12 - i * 0.001;

                listening.timelines[i] = new TimelineMax();
                listening.timelines[i].to(ring.data, 1, {
                    theta: theta,
                    gaussIt: 0.8,
                    weightIn: 0.6,
                    intensity: 0.3,
                    osc: 0.14,
                    ease: Power4.easeOut,
                    delay: ((persona.rings.length - i) / persona.rings.length) / 2,
                });
            }

            listening.tl2 = new TimelineMax({ onComplete: () => { listening.started = false; } });
            listening.tl2.to(persona, 1, {
                _timeInc: 0.05,
                ease: Power3.easeOut,
            });
        },

        listenEnd() {
            const { _listening: listening } = persona;
            if (listening.started) {
                for (let i = 0; i < persona.rings.length; i++) {
                    const tl = listening.timelines[i];
                    tl.pause(0);
                    tl.clear();
                    // persona.listenTls[i].stop();
                }
                listening.tl2.pause(0);
                listening.tl2.clear();
                // persona.listenTl2.stop();
                listening.started = false;
                // persona.listeningStarted = false;
            }
            for (let i = 0; i < persona.rings.length; i++) {
                const ring = persona.rings[i];
                const tl = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl.to(ring.data, 0.4, {
                    gaussIt: 0.98,
                    weightIn: 1,
                    intensity: 0.21,
                    osc: 0.06,
                    delay: ((persona.rings.length - i) / persona.rings.length) / 20,
                });

                const tl2 = new TimelineMax();
                tl2.to(ring.data, 1, {
                    theta: i * 0.01,
                    delay: ((persona.rings.length - i) / persona.rings.length) / 20,
                    ease: Elastic.easeOut.config(1, 0.8),
                });

            }
            const tl2 = new TimelineMax();
            tl2.to(persona, 0.4, {
                _timeInc: 0.01,
                ease: Power3.easeOut,
            });
        },

        question() {
            persona.audio.play('question');

            const timeIn = 0.4;
            const delay = 0.4;
            const timeOut = 0.6;

            for (let i = 0; i < persona.rings.length; i++) {
                const ring = persona.rings[i];
                const tl = new TimelineMax({ onComplete: () => persona.setState('idle') });
                tl
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
                    });

                const tl2 = new TimelineMax();
                tl2
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
                    });


                const tl3 = new TimelineMax();
                tl3
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
                    });


                const tl4 = new TimelineMax();
                tl4
                    .to(ring.data, timeIn, {
                        theta: Math.random(),
                        ease: Power3.easeOut,
                    })
                    .to(ring.data, timeOut, {
                        theta: i * 0.01,
                        delay: delay,
                        ease: Power3.easeOut,
                    });
            }

            const tl5 = new TimelineMax();
            tl5
                .to(persona, timeIn, {
                    _timeInc: 0.1,
                    ease: Power3.easeOut,
                })
                .to(persona, timeOut, {
                    _timeInc: 0.01,
                    delay: delay,
                    ease: Power3.easeOut,
                });
        },
    };
}

/** @template T extends (...args: any[]) => any
 * @typedef {T extends (...args: any[]) => infer R ? R : never} ReturnType<T extends (...args: any[]) => any> */

/** @typedef {ReturnType<typeof createStates>} StatesActions */
/** @typedef {keyof StatesActions} States */

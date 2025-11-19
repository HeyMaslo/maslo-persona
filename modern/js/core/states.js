// State types for Maslo Persona
export const States = {
    INIT: 'init',
    IDLE: 'idle',
    JOY: 'joy',
    SURPRISE: 'surprise',
    UPSET: 'upset',
    YES: 'yes',
    NO: 'no',
    HEY: 'hey',
    SHAKE: 'shake',
    TAP: 'tap',
    LISTEN: 'listen',
    QUESTION: 'question'
};

// Audio track mappings for each state
export const AudioTracks = {
    Open: 'open.mp3',
    Joy: 'joy.mp3',
    Surprise: 'surprise.mp3',
    Upset: 'upset.mp3',
    Yes: 'yes.mp3',
    No: 'no.mp3',
    Hey: 'hey.mp3',
    Shake: 'shake.mp3',
    Tap: 'tap.mp3',
    Listen: 'listen.mp3',
    Question: 'question.mp3'
};

// State animations using GSAP
export function createStateAnimations(persona) {
    const goToIdle = () => persona.setState(States.IDLE);

    const createTimeline = () => {
        return gsap.timeline({
            onComplete: goToIdle
        });
    };

    return {
        [States.INIT]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Open);

            persona.rings.forEach((ring, i) => {
                const delay = (i / persona.rings.length) / 2;
                const startScale = 1 - (i + 2) * 0.1;

                ring.data.theta = 3 * ring.data.seed.z;

                timeline
                    .fromTo(ring.data.scale, {
                        x: startScale,
                        y: startScale,
                    }, {
                        x: 1,
                        y: 1,
                        duration: 2.3,
                        ease: 'elastic.out(1, 0.3)',
                    }, delay)
                    .to(ring.data, {
                        opacity: 1,
                        duration: 0.2,
                    }, delay)
                    .to(ring.data, {
                        theta: i * 0.01,
                        gaussIt: 0.98,
                        weightIn: 1,
                        intensity: 0.21,
                        osc: 0.06,
                        duration: 2,
                        ease: 'power4.out',
                    }, 0.8);
            });

            return timeline;
        },

        [States.IDLE]() {
            return gsap.timeline();
        },

        [States.JOY]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Joy);

            const expandScale = 0.9;
            const expandSpread = 0.2;

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;
                const theta = (Math.sign(ringData.seed.z) > 0) ? (2 + i * 0.01) : (-2 + i * 0.01);
                const delay = ((persona.rings.length - i) / persona.rings.length) / 2;

                timeline.to(ringData.position, {
                    x: expandSpread,
                    y: expandSpread,
                    duration: 0.5,
                    ease: 'power2.out',
                }, 0);

                timeline.to(ringData.position, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    delay: 0.4 + delay,
                    ease: 'power2.out',
                }, 0.5);

                timeline.to(ringData.scale, {
                    x: expandScale,
                    y: expandScale,
                    duration: 0.5,
                    ease: 'back.out(1.7)',
                }, 0);

                timeline.to(ringData.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.5,
                    delay: 0.4 + delay,
                    ease: 'back.out(1.7)',
                }, 0.5);

                timeline.to(ringData, {
                    theta: theta,
                    duration: 2,
                    delay: delay,
                    ease: 'power4.out',
                }, 0);
            });

            return timeline;
        },

        [States.SURPRISE]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Surprise);

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;
                const delay = (i / persona.rings.length) / 4;

                timeline.to(ringData.scale, {
                    x: 1.3,
                    y: 1.3,
                    duration: 0.2,
                    ease: 'power2.out',
                }, delay);

                timeline.to(ringData.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.3,
                    ease: 'elastic.out(1, 0.5)',
                }, delay + 0.2);
            });

            return timeline;
        },

        [States.UPSET]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Upset);

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;

                timeline.to(ringData, {
                    theta: Math.PI * 2,
                    duration: 0.3,
                    ease: 'power2.inOut',
                }, 0);

                timeline.to(ringData.scale, {
                    x: 0.8,
                    y: 0.8,
                    duration: 0.2,
                    ease: 'power2.out',
                }, 0);

                timeline.to(ringData.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.3,
                    ease: 'elastic.out(1, 0.3)',
                }, 0.2);
            });

            return timeline;
        },

        [States.YES]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Yes);

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;
                const delay = (i / persona.rings.length) / 3;

                timeline.to(ringData.position, {
                    y: -0.1,
                    duration: 0.2,
                    ease: 'power2.out',
                }, delay);

                timeline.to(ringData.position, {
                    y: 0.1,
                    duration: 0.2,
                    ease: 'power2.inOut',
                }, delay + 0.2);

                timeline.to(ringData.position, {
                    y: 0,
                    duration: 0.2,
                    ease: 'power2.out',
                }, delay + 0.4);
            });

            return timeline;
        },

        [States.NO]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.No);

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;
                const delay = (i / persona.rings.length) / 3;

                timeline.to(ringData.position, {
                    x: -0.1,
                    duration: 0.15,
                    ease: 'power2.inOut',
                }, delay);

                timeline.to(ringData.position, {
                    x: 0.1,
                    duration: 0.15,
                    ease: 'power2.inOut',
                }, delay + 0.15);

                timeline.to(ringData.position, {
                    x: 0,
                    duration: 0.15,
                    ease: 'power2.out',
                }, delay + 0.3);
            });

            return timeline;
        },

        [States.HEY]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Hey);

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;
                const delay = (i / persona.rings.length) / 4;

                timeline.to(ringData.scale, {
                    x: 1.1,
                    y: 1.1,
                    duration: 0.3,
                    ease: 'back.out(2)',
                }, delay);

                timeline.to(ringData.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.4,
                    ease: 'elastic.out(1, 0.5)',
                }, delay + 0.3);
            });

            return timeline;
        },

        [States.SHAKE]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Shake);

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;

                for (let j = 0; j < 4; j++) {
                    timeline.to(ringData.position, {
                        x: j % 2 === 0 ? 0.05 : -0.05,
                        duration: 0.05,
                        ease: 'none',
                    }, j * 0.05);
                }

                timeline.to(ringData.position, {
                    x: 0,
                    duration: 0.1,
                    ease: 'power2.out',
                }, 0.2);
            });

            return timeline;
        },

        [States.TAP]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Tap);

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;
                const delay = (i / persona.rings.length) / 4;

                timeline.to(ringData.scale, {
                    x: 1.05,
                    y: 1.05,
                    duration: 0.1,
                    ease: 'power2.out',
                }, delay);

                timeline.to(ringData.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.2,
                    ease: 'power2.out',
                }, delay + 0.1);
            });

            return timeline;
        },

        [States.LISTEN]() {
            return gsap.timeline();
        },

        [States.QUESTION]() {
            const timeline = createTimeline();
            persona.playAudio(AudioTracks.Question);

            persona.rings.forEach((ring, i) => {
                const ringData = ring.data;
                const delay = (i / persona.rings.length) / 4;

                timeline.to(ringData.position, {
                    y: 0.05,
                    duration: 0.3,
                    ease: 'power2.out',
                }, delay);

                timeline.to(ringData.position, {
                    y: 0,
                    duration: 0.4,
                    ease: 'elastic.out(1, 0.5)',
                }, delay + 0.3);
            });

            return timeline;
        },
    };
}

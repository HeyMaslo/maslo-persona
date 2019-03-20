import { MasloPersona } from 'web';

export class Main {
    constructor() {

        const element = document.getElementById('main');

        const personaRenderer = new MasloPersona({
            element,
            persona: {
                ringRes: 80,
                radius: 200,
                glow: false,
            },
        });
    }

    run() {

    }
}

import '@babel/polyfill';

import { MasloPersona } from '../web';

const element = document.getElementById('root');

const personaRenderer = new MasloPersona({
    element,
    persona: {
        ringRes: 80,
        radius: 200,
        glow: false,
    },
});


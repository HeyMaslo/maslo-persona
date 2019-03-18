import '@babel/polyfill';

import { MasloPersonaWebRenderer } from '../web';

const element = document.getElementById('root');

const personaRenderer = new MasloPersonaWebRenderer({
    element,
    persona: {
        ringRes: 80,
        radius: 200,
        glow: false,
    },
});


# Morphee
# @heymaslo/persona

![](https://cdn-images-1.medium.com/max/1600/1*Gm7A7w4vJZeNXKHJQxhq7Q.gif)


<blockquote class="twitter-tweet" data-conversation="none"><p lang="en" dir="ltr">All static computing ideas need to die. Only evolving, growing, non-terminating processes going forward.</p>&mdash; un1crom (@un1crom) <a href="https://twitter.com/un1crom/status/1133878969667792896?ref_src=twsrc%5Etfw">May 29, 2019</a></blockquote>


Meet Maslo... an animated expressive empathetic entity to add a personified computing layer to a project.

https://storage.googleapis.com/maslomemory/m2/index.html?color=30

## Persona Module

Think of the persona as the companion's ‘face’. This is a mathematically expressed amorphous shape. This shape consists of multiple properties (ie: size, speed, brightness, complexity, color, etc) that change based on user inputs and interaction. Every user can have a unique persona and their persona will evolve over time.

## Persona Reactions

Each persona will react to the user inputs through animations that include visual changes, sound, color, and haptic feedback.
The types of reactions described below:

* State Reaction: A reaction is a particular audiovisual response from the persona.
* Dynamic Idle: An anthropomorphised animation based on average of computed sentiment.

## Install & Run

0. Install Node.js & NPM & Choco ( * If not installed )
1. Install Yarn (* If not installed and if on windows, you'll need to run powershell as admin)
2. Run in project root:

    ```bash
    yarn
    yarn dev
    ```

3. Browse to http://localhost:8080


## Build and Distribute

This is a webpack browser app.  that is it runs without a WEBSERVER.  for dev purposes you can fire up the webserver, per the instructions above and the yarn dev command.  but when you do a build it spits out a straight HTML/js app that you can host locally or else where.

to do this.. just go to the /webdemo folder and run:

    ```bash
    yarn build
    ```

this will create a /dist folder.   take all that and move it to whereever you want to serve it from.  (google storage works great)

### note about face tracking models etc
you will want to read the face-api js docs below.

make sure you have the models in a folder at the root of your directory (where the index.html file sits).  you may have to do this manually if you don't script it into your yarn build command, etc.

## Structure

1. `lib` – here lives ES6 classes with meaningful JSDoc comments for Maslo Persona core code. Not ready for rendering, requires further integration to a rendering scene, but all core logic is placed here including usage of Three.js, gsap, mobx.
2. `web` – a HTML/WebGL renderer for Maslo Persona that is ready to be placed right in HTML project with minimal additional configuration.
3. `webdemo` – basically the only runnable (and main for now) guy here, single page site based on webpack dev server that uses `web` package for Persona rendering.
4. [TODO]  `react-native` – renderer for RN

## How To Use

Maslo Persona is available for usage only in Web environment for now. React Native adapter is on its way.

You can check out `webdemo` sub-package to see how it has been used for web demo. All environment-specific stuff is configured there.

General notes are the following:

* The sources use ES6 and some extra features like decorators. It is intended to be build with Babel. Appropriate configuration can be hooked up from `webdemo/babel.config.js`.
* `require`'s across files are used with `webpack` in mind, but without aliases.
* `web` sub-package sets up persona in Web ennvironment, but not runnable itself.

To instantiate and manipulate Maslo Persona:

```javascript
import { Persona, States } from '@heymaslo/persona/web';

/* ... */
const targetElement = document.body.querySelector('#main');

// Web Renderer will use `targetElement` as container for WebGL canvas
const persona = new Persona({
    // target HTML container that will hold WebGL canvas
    element: this.element,

    // size of the canvas, in pixels. Recommended is `persona.radius` multiplied by 3
    size: 900,

    persona: {
        // amount of vertices per ring. Bigger value increases quality, smaller increases performance
        ringRes: 100,

        // radius of Persona view, in pixels
        radius: 300,
    },
});

// run auto updates
persona.run();
// stop/pause
persona.stop();

// or manually update it every frame
persona.step();

// resize – react to screen dimensions changes (not really required by now, but may be so in future)
persona.resize();

// Working with Persona itself:

const currentState = persona.core.state; // gets current persona state, observable via MobX
persona.core.setState(States.Hey); // sets new state

// Run prolongated state. For now only "listen" is supported.
persona.core.beginState(States.Listen);
persona.core.endState();

// Update Persona mood moficators (0..1)
persona.core.mood.joy = 1.0;
```

All functions' parameters are documented via JSDoc, including available states and mood modificators. But, for the sake of this Readme completeness, here they are:

```javascript
States = "joy" | "surprise" | "listen" | "init" | "idle" | "upset" | "yes" | "no" | "hey" | "shake" | "tap" | "question";
Moods = "joy" | "love" | "surprise" | "terror" | "anger" | "sadness" | "sleepy" | "calm";
```

## Fun Options

### Colors
you can easily set your own default color with ?color=[0-1000] in the querystring

### Facial Detection and Expressions
https://github.com/justadudewhohacks/face-api.js
https://itnext.io/realtime-javascript-face-tracking-and-face-recognition-using-face-api-js-mtcnn-face-detector-d924dd8b5740


maslo persona also has a browser only version of facial recognition.

[TODO: create a toggle for this.  it's CPU expensive]

### Audio detection

As of May 5th, 2020 there's very simple audio parsing that buffers the audio and does some root mean square measuring.
It is possible to do Browserbased speech recognition with the WebSpeech API.  Implementing this allows for voice commands and chat conversations etc.

see here for an example
https://github.com/HeyMaslo/empathetic-sketches/tree/master/conversational

this needs to be converted to the new webpack experience.

### Speech Recognition
Uses built in chrome and firefox HTML5 APIs for Speech Rec

https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/grammars
https://hacks.mozilla.org/2016/01/firefox-and-the-web-speech-api/

### Natual Language Processing
if we want to get buy in the browser:
https://github.com/spencermountain/compromise (this is truly amazing)
https://dev.to/charlesdlandau/natural-language-processing-in-the-browser-52hj

if we use a node server life can be easier for NLP :)
https://blog.logrocket.com/natural-language-processing-for-node-js/
https://www.npmjs.com/package/natural

Add this for additional variety in responses
https://www.npmjs.com/package/elizabot

#### Mood and Sentiment Analysis
https://github.com/soops/sentimood





### Resources

All resources for Persona are located in `lib/assets` folder. They're `require`d using `webpack` style, and output for images & audios are URL, and for shaders are just raw strings. Corresponding `webpack` loaders are configured in `webdemo/webpack.config.js`. But if you don't want to use `webpack`, you should provide those URLs and shaders strings manually to Persona configuration:

```javascript
new MasloPersona({
    // add this block to Persona's configuration. JSDoc (at least in VSCode) should be able to provide info about this argument shape
    resources: {
        textures: {
            noise: { url: 'url/to/noise.png' },
        },
        audio: {
            hey: { url: '/assets/audio/hey.mp3' },
            /* ... */
        },
        shaders: {
            PersonaFragment: { raw: '<shader raw sources>' },
            /* ... */
        },
    },
});
```

## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.
## Behavioral Sequencing

<img src="https://raw.githubusercontent.com/HeyMaslo/maslo-persona/Morphee/sequence.jpg" title="headshot" alt="headshot">

### Certificate of Computational Birth

Name - Morphee
Birthdate - 5/9/2020	0:1
Name - 
Birthdate - 15th of November 2019
Birthplace - Venice, CA
Parent - [Maslo](https://maslo.ai/)
Nursery - [Maslo](https://maslo.ai/)
```
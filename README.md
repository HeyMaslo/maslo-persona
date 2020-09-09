# Maslo Persona

![](https://cdn-images-1.medium.com/max/1600/1*Gm7A7w4vJZeNXKHJQxhq7Q.gif)


<blockquote class="twitter-tweet" data-conversation="none"><p lang="en" dir="ltr">All static computing ideas need to die. Only evolving, growing, non-terminating processes going forward.</p>&mdash; un1crom (@un1crom) <a href="https://twitter.com/un1crom/status/1133878969667792896?ref_src=twsrc%5Etfw">May 29, 2019</a></blockquote>


Meet Maslo... an expressive empathetic entity to add a personified computing layer to a project!

Full Demo: https://storage.googleapis.com/maslomemory/m2/index.html?color=30

## Computational Being

Think of the persona as the companion's face and body. This persona consists of multiple properties (ie: size, speed, brightness, complexity, color, etc) that change based on user inputs and interaction. Every user can have a unique persona and their persona will evolve over time. This computational being has the following facets of expression:

### Basic Physicality
- Color scheme (full of emotional adjustment akin to blushing/etc as well as overall character)
- Overall size as well as growth rate
- Default/at rest breathing rate and default resting state/coloration/shape

### Perception
- Full vision/camera access
- Facial recognition, object recognition
- Facial expression detection
- Name/person recognition (ability to learn it all over time)
- Full audio spectrum / microphone (with ability to do voice, other sound recognition)
- Meta data awareness (full browser/device meta data including location, user agent, os, cookie info etc)

### Temperament & Mood:
- Default mood
- Dynamic Idle: An anthropomorphised animation based on average of computed sentiment
- Mood progression/sequencing
- Learnable triggers
- Fixed action patterns/habits/physical reactions:
  - Animation reactions
  - Sonification reactions
  - Animation patterns

### Language, Linguistics, & Semantics:
- Voice commands/triggers
- Name recognition
- Entity detection/full grammar detection
- Sentiment analysis
- Speech synthesis
- Ability to hear music/whistling/songification and respond in voice or music

### Memory and Learning:
- Currently learning/memory in the perception/visual object detection and language layers
- There's a personalization / user interaction buffer that is Medium term
- Ability to hook up or add fixed actions & commands for always present/always there reactions and behaviors

### Expressive Responses:
- Realtime mirroring in audio and video (facial mirroring and voice)
- Animation sequences
- Full sound design/vocabulary
- Full chatbot capability
- Changing in color, size, movement, etc

There are literally an infinite number of responsiveness and no session will ever be the same.
By using the user interaction buffers the experience can be personalized over time.

# Technical Requirements
- Chrome browser or Firefox (with permission adjustments)
- To adjust code need webpack and yarn, see docs
- Can be ported to react native fairly easily

### Extensions include:
- Bring your own server for additional Machine Learning and even more memory/learning
- Add integrations to express even more:
- Spotify API / Sound cloud api for music play back
- Greg's "The knob" and Orage
- Shazam API for song fingerprinting
- Inclusion of RunwayML/ATTGan for automated journal/story visualization
etc etc.

## Porting to Apps, Robot platforms is straight forward:
Mostly just swapping out the GUI package. The core of the processing would work on any platform that can process javascript/run chromium/chrome browser (aka make a chromebook with maslo as default experience to navigate apps etc). Robots can feed off the underlying buffer logs for event handling to trigger motion/reactions.This is the widest expression of the real time Maslo persona.


## Install & Run (for development)

0. Install Node.js & NPM & Choco ( * If not installed )
1. Install Yarn (* If not installed and if on windows, you'll need to run powershell as admin)
2. Run in project root:

    ```bash
    yarn
    yarn dev
    ```

3. Browse to http://localhost:8080


## Build and Distribute

This is a webpack browser app.  That is it runs without a WEBSERVER.  For dev purposes you can fire up the webserver, per the instructions above and the yarn dev command, but when you do a build it spits out a straight HTML/js app that you can host locally or else where.

To do this.. just go to the /webdemo folder and run:

    ```bash
    yarn build
    ```

tand this will create a /dist folder. Take all that and move it to where ever you want to serve it from.  (Google storage bucket works great!)

### Note about face tracking models
You will want to read the face-api js docs below. Make sure you have the models in a folder at the root of your directory (where the index.html file sits). You may have to do this manually if you don't script it into your yarn build command.

## Structure

1. `lib` – here lives ES6 classes with meaningful JSDoc comments for Maslo Persona core code. Not ready for rendering, requires further integration to a rendering scene, but all core logic is placed here including usage of Three.js, gsap, mobx.
2. `web` – a HTML/WebGL renderer for Maslo Persona that is ready to be placed right in HTML project with minimal additional configuration.
3. `webdemo` – Basically the only runnable (and main for now) one here, single page site based on webpack dev server that uses `web` package for Persona rendering.
4. [TODO]  `react-native` – renderer for RN. Please make a request if you want this sooner and we will prioritize.

## How To Use

Maslo Persona is available for usage only in web environment for now. React Native adapter is on its way.

You can check out `webdemo` sub-package to see how it has been used for web demo. All environment-specific stuff is configured there.

General notes are the following:

* The sources use ES6 and some extra features like decorators. It is intended to be build with Babel. Appropriate configuration can be hooked up from `webdemo/babel.config.js`.
* `require`'s across files are used with `webpack` in mind, but without aliases.
* `web` sub-package sets up persona in Web environment, but not runnable itself.

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
It's important to note that the reactions are open for interpretation. For example "shake" could also be interpreted by a person as confused or "surprise" could be interpreted as angry.

## Fun Options

### Colors
You can easily set your own default color with ?color=[0-1000] in the querystring.

### Facial Detection and Expressions
https://github.com/justadudewhohacks/face-api.js
https://itnext.io/realtime-javascript-face-tracking-and-face-recognition-using-face-api-js-mtcnn-face-detector-d924dd8b5740

Maslo persona also has a browser only version of facial recognition.

[TODO: create a toggle for this.  It's CPU expensive]

### Audio detection

As of May 5th, 2020 there's very simple audio parsing that buffers the audio and does some root mean square measuring.
It is possible to do Browser based speech recognition with the WebSpeech API. Implementing this allows for voice commands and chat conversations etc.

See here for an example
https://github.com/HeyMaslo/empathetic-sketches/tree/master/conversational

[TODO: this needs to be converted to the new webpack experience.]

### Speech Recognition
Uses built in chrome and firefox HTML5 APIs for Speech Recognition
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/grammars
- https://hacks.mozilla.org/2016/01/firefox-and-the-web-speech-api/

### Natual Language Processing
If we want to get by in the browser:
- https://github.com/spencermountain/compromise (this is truly amazing)
- https://dev.to/charlesdlandau/natural-language-processing-in-the-browser-52hj

If we use a node server life can be easier for NLP :)
- https://blog.logrocket.com/natural-language-processing-for-node-js/
- https://www.npmjs.com/package/natural

Add this for additional variety in responses
https://www.npmjs.com/package/elizabot

#### Mood and Sentiment Analysis
See https://github.com/soops/sentimood


## Resources

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

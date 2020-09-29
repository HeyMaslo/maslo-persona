/* eslint-disable no-console */
/* eslint-disable max-len */
import { autorun } from 'mobx';

import * as faceapi from 'face-api.js';

import nlp from 'compromise';

import { Persona, States, AllStates } from '../../web';
import { LineController } from './lineController';
import { CircleController } from './circleController';
import { VoiceChat } from './voice';

import { Sentimood } from './sentimood';

import chitChat from './chitchat.json';

nlp.extend(require('compromise-numbers').default);
nlp.extend(require('compromise-dates').default);
nlp.extend(require('compromise-adjectives').default);
nlp.extend(require('compromise-sentences').default);
nlp.extend(require('compromise-paragraphs').default);


export class Companion {

  // Let's do some facial recognition
  // here are some params to use in the face function
  VVVmtcnnForwardParams = {
    // number of scaled versions of the input image passed through the CNN
    // of the first stage, lower numbers will result in lower inference time,
    // but will also be less accurate
    maxNumScales: 10,
    // scale factor used to calculate the scale steps of the image
    // pyramid used in stage 1
    scaleFactor: 0.709,
    // the score threshold values used to filter the bounding
    // boxes of stage 1, 2 and 3
    scoreThresholds: [0.6, 0.7, 0.7],
    // mininum face size to expect, the higher the faster processing will be,
    // but smaller faces won't be detected
    minFaceSize: 20,
  }

  moodBoost = {
    joyBoost: 0,
    sadnessBoost: 0,
    terrorBoost: 0,
    angerBoost: 0,
    sleepyBoost: 0,
    calmBoost: 0,
    surpriseBoost: 0,
    loveBoost: 0,
  }

  mtcnnForwardParams = {
    // limiting the search space to larger faces for webcam detection
    minFaceSize: 200,
  }

  // create a command json object, will later put in a standalone file that can be picked up
  chitChatLocal = {
    version: 1.1,
    commands: {
      hey: {
        tag: 'hey',
        outchatter: 'hey there!',
        animation: 'hey',
        mood: 'love',
      },
      go: {
        tag: 'go',
        outchatter: 'go there!',
        animation: 'yes',
        mood: 'love',
      },
    },
  }

  // dummy object for russ reference
  myObj = {
    name: 'John',
    age: 30,
    cars: {
      car1: 'Ford',
      car2: 'BMW',
      car3: 'Fiat',
    },
  }

  constructor() {
    this.element = document.getElementById('main');
    this.debugBut = document.getElementById('debugBut');
    this.debugEl = document.getElementById('debug');
    this.listeningBut = document.getElementById('listeningBut');
    this.controls = document.getElementsByClassName('controlBut');
    this.docs = [];
    this.chitChat = chitChat;

    this.mouseIsDown = false;
    this.startAngle = 0;
    this.angleSpeed = 0;
    this.debugActive = false;
    this.rAudio = '';

    this.circleController = new CircleController();
    this.lineController = new LineController();

    // persona instance example
    this._persona = new Persona({
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

      analytics: {
        appName: '@heymaslo/webdemo',
        dataSource: 'DemoUI',
        ignoreMood: true,
      },
    });

    // kick off the speech recognition
    this.voiceChatter = new VoiceChat();

    autorun(() => {
      const { state } = this._persona.core;
      for (let i = 0; i < this.controls.length; i++) {
        const control = this.controls[i];
        control.classList.remove('active');
        if (control.getAttribute('data-reaction') === state) {
          control.classList.add('active');
        }
      }
    });

    this._subscribe();
  }

  _subscribe = () => {
    window.addEventListener('resize', this.resize);
    this.element.addEventListener('mousedown', this.onMouseDown);
    this.element.addEventListener('mouseup', this.onMouseUp);
    this.element.addEventListener('mousemove', this.onMouseMove);

    if (this.debugBut) {
      this.debugBut.addEventListener('mousedown', this.debugToggle);
    }

    for (let i = 0; i < this.controls.length; i++) {
      const control = this.controls[i];
      if (control.getAttribute('id') !== 'listeningBut') {
        control.addEventListener('click', this.controlClicked);
      }
    }

    if (this.listeningBut) {
      this.listeningBut.addEventListener('mousedown', this.questionMouseDown);
      this.listeningBut.addEventListener('mouseup', this.questionMouseUp);
      this.listeningBut.addEventListener('mouseleave', this.questionMouseUp);
    }
  }

  _unsubscribe = () => {
    window.removeEventListener('resize', this.resize);
    this.element.removeEventListener('mousedown', this.onMouseDown);
    this.element.removeEventListener('mouseup', this.onMouseUp);
    this.element.removeEventListener('mousemove', this.onMouseMove);

    if (this.debugBut) {
      this.debugBut.removeEventListener('mousedown', this.debugToggle);
    }

    for (let i = 0; i < this.controls.length; i++) {
      const control = this.controls[i];
      if (control.getAttribute('id') !== 'listeningBut') {
        control.removeEventListener('click', this.controlClicked);
      }
    }

    if (this.listeningBut) {
      this.listeningBut.removeEventListener('mousedown', this.questionMouseDown);
      this.listeningBut.removeEventListener('mouseup', this.questionMouseUp);
      this.listeningBut.removeEventListener('mouseleave', this.questionMouseUp);
    }
  }

  run = () => {
    this.resize();
    this.captureCamera();
    this.step();
  }

  questionMouseDown = (e) => {
    e.preventDefault();
    this._persona.core.beginState('listen');
  }

  questionMouseUp = () => {
    this._persona.core.endState();
  }

  debugToggle = () => {
    this.debugActive = !this.debugActive;
    if (this.debugActive) {
      this.debugEl.classList.add('active');
    } else {
      this.debugEl.classList.remove('active');
    }
    this._persona.core.activateRenderingDebug(this.debugActive);
  }

  captureFaces = async () => {
    const input = document.getElementById('inputVideo');

    /* Display face expression results */
    const detectionsWithExpressions = await faceapi
      // @ts-ignore
      .detectSingleFace(input)
      .withFaceLandmarks(true)
      .withFaceExpressions();

    const weightingFactor = 1.1;
    const dampingFactor = 2;

    try {

      this.moodBoost.joyBoost = Math.log2(1 + detectionsWithExpressions.expressions.happy * weightingFactor + this.moodBoost.joyBoost) / dampingFactor;
      this.moodBoost.sadnessBoost = Math.log2(1 + detectionsWithExpressions.expressions.sad * weightingFactor + this.moodBoost.sadnessBoost) / dampingFactor;
      this.moodBoost.terrorBoost = Math.log2(1 + detectionsWithExpressions.expressions.fearful * weightingFactor + this.moodBoost.terrorBoost) / dampingFactor;
      this.moodBoost.angerBoost = Math.log2(1 + detectionsWithExpressions.expressions.angry * weightingFactor + this.moodBoost.angerBoost) / dampingFactor;
      this.moodBoost.sleepyBoost = Math.log2(1 + detectionsWithExpressions.expressions.disgusted * weightingFactor + this.moodBoost.sleepyBoost) / dampingFactor;
      this.moodBoost.calmBoost = Math.log2(1 + detectionsWithExpressions.expressions.neutral * weightingFactor + this.moodBoost.calmBoost) / dampingFactor;
      this.moodBoost.surpriseBoost = Math.log2(1 + detectionsWithExpressions.expressions.surprised * weightingFactor + this.moodBoost.surpriseBoost) / dampingFactor;
      this.moodBoost.loveBoost = Math.log2(1 + detectionsWithExpressions.expressions.happy * weightingFactor + this.moodBoost.joyBoost) / dampingFactor;

      document.getElementById('inputVideo').style.opacity = detectionsWithExpressions.expressions.happy.toString();
    } catch (error) {
      console.error('error on facedetection', error);
    }

    // now deal with audio
    // bubble up a reaction from audio
    if (this.rAudio !== '') {
      console.log(this.rAudio);
      this.randomState();
      this.rAudio = '';
    }
  }

  // get the camera and microphone in active mode
  captureCamera = async () => {

    // load the models
    await faceapi.loadMtcnnModel('models');
    await faceapi.nets.faceExpressionNet.loadFromUri('models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('models');
    await faceapi.loadSsdMobilenetv1Model('models');
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri('models');

    // try to access users webcam and stream the images
    // to the video element

    const videoEl = document.getElementById('inputVideo');
    let frameCount = 0;

    // turn speach recognition on
    this.voiceChatter.recorder.start();

    const handleSuccess = (stream) => {
      if (window.URL) {
        // @ts-ignore
        videoEl.srcObject = stream;
      } else {
        // @ts-ignore
        videoEl.src = stream;
      }

      // just process the root mean square of the audio and randomly sample it.
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(1024, 1, 1);

      source.connect(processor);
      processor.connect(context.destination);
      this.rAudio = 'joy';
      processor.onaudioprocess = (e) => {
        // Do something with the data, e.g. convert it to WAV
        // console.log(e.inputBuffer);
        //  console.log(e.inputBuffer.getChannelData(0)[1]);
        const input = e.inputBuffer.getChannelData(0);
        const len = input.length;
        let total = 0;
        let i = 0;
        let rms = 0;

        while (i < len) total += Math.abs(input[i++]);

        rms = Math.sqrt(total / len);

        if (frameCount % Math.round(Math.random() * 10000)) {
          if (rms > 0.7) {
            this.rAudio = 'joy';
          }
        }
        frameCount++;
      };
    };


    navigator.mediaDevices.getUserMedia(
      { audio: true, video: true },
    ).then(handleSuccess).catch((e) => {
      // eslint-disable-next-line no-throw-literal
      throw `Microphone: ${e.name}. ${e.message}`;
    });
  }

  setStateFromAudio = async (reactAudio) => {
    this._persona.core.setState(reactAudio);
  }

  onMouseDown = (e) => {
    this.mouseIsDown = true;
    this.tapTimeout = setTimeout(() => {
      this._persona.core.setState(States.Tap);
    }, 100);

    console.log(faceapi.nets);

    this.captureFaces();
    const personaPos = this._persona.core.position;
    this.startAngle = Math.atan2(
      e.clientY - (this.element.offsetHeight / 2 + personaPos.y),
      e.clientX - (this.element.offsetWidth / 2 + personaPos.x),
    ) / (Math.PI * 2);
    this.lastAngle = this.startAngle;
  }

  onMouseUp = () => {
    this.mouseIsDown = false;
    if (Math.abs(this.angleSpeed) > 0.01) {
      this._persona.core.audio.play('swipe');
    }
  }

  onMouseMove = (e) => {
    if (this.mouseIsDown) {
      clearInterval(this.tapTimeout);
    }

    const personaPos = this._persona.core.position;
    const angle = Math.atan2(
      e.clientY - (this.element.offsetHeight / 2 + personaPos.y),
      e.clientX - (this.element.offsetWidth / 2 + personaPos.x),
    ) / (Math.PI * 2);

    if (this.mouseIsDown) {
      this.angleSpeed += (Math.min(Math.max(-0.05, this.lastAngle - angle), 0.05) - this.angleSpeed) * 0.15;
      this._persona.core.rotation += this.angleSpeed;
      this.lastAngle = angle;
    }
  }

  controlClicked = (e) => {
    const nextState = e.target.dataset.reaction;
    if (nextState) {
      this._persona.core.setState(nextState);
    }
  }

  resize = () => {
    this._persona.resize();
  }

  step = () => {
    this.rafId = window.requestAnimationFrame(this.step);

    this.angleSpeed -= this.angleSpeed * 0.05;
    this._persona.core.rotation += this.angleSpeed;

    this.circleController.step();
    this.lineController.step();

    Object.keys(this.circleController.vals).forEach((key) => {
      let val = this.circleController.vals[key] + this.lineController.vals[key];

      val = Math.round(val * 10000) / 10000;

      if (key === 'joy') {
        this._persona.core.mood[key] = this.moodBoost.joyBoost;
      } else if (key === 'sadness') {
        this._persona.core.mood[key] = val + this.moodBoost.sadnessBoost;
      } else if (key === 'terror') {
        this._persona.core.mood[key] = val + this.moodBoost.terrorBoost;
      } else if (key === 'sleepy') {
        this._persona.core.mood[key] = val + this.moodBoost.sleepyBoost;
      } else if (key === 'calm') {
        this._persona.core.mood[key] = val + this.moodBoost.calmBoost;
      } else if (key === 'surprise') {
        this._persona.core.mood[key] = val + this.moodBoost.surpriseBoost;
      } else if (key === 'love') {
        this._persona.core.mood[key] = val + this.moodBoost.joyBoost;
      } else if (key === 'anger') {
        this._persona.core.mood[key] = val + this.moodBoost.angerBoost;
      } else {
        this._persona.core.mood[key] = val;
      }
    });

    // here we trigger facial recognition functions
    if (this.rafId % 10 === 0) {
      // this.voiceChatter.chatBuffer[].toString
      this.chatterResponse(this.voiceChatter.chatBuffer[this.voiceChatter.chatBuffer.length - 1]);
    }

    this.captureFaces();
    this._persona.step();
  }

  getChatterResponse = (reaction) => {

    // we may want to do some "search" at some point but for now we're just going to do exact matches
    // here the reaction string becomes the name of a command... if it's nmot found then what?
    try {

      // wanna get the voice/command decision tree loaded and then access the right command.
      // you can effectively decide if you want to look things up straight by command or if you want to parse things into something simpler.
      let cmd = '';
      const trycommand = nlp(reaction).toLowerCase().text();

      // you get a higher level decision try first to normalize / condition anything
      // here we use sentiment and presence of words to give us commands so we don't have to do exact look ups...
      // this can be advanced in all sorts of ways
      // but also is meant to give us a lot of flexibility
      const sentiment = new Sentimood();

      if (trycommand.includes('hey')) {
        // @ts-ignore
        cmd = this.chitChat.commands.hey;
      } else if (reaction.includes('happy') || sentiment.analyze(reaction).score > 3) {
        // @ts-ignore
        cmd = this.chitChat.commands.go;
      } else if (reaction.includes('wow') || sentiment.analyze(reaction).score > 5) {
        // @ts-ignore
        cmd = this.chitChat.commands.hey;
      } else if (sentiment.analyze(reaction).score < -6) {
        // @ts-ignore
        cmd = this.chitChat.commands.upset;
      } else if (sentiment.analyze(reaction).score < -6 && sentiment.analyze(reaction).score > -8) {
        // @ts-ignore
        cmd = this.chitChat.commands.hey;
      } else if (reaction.includes('bored')) {
        // @ts-ignore
        cmd = this.chitChat.commands['good bye friend!'];
      } else {
        cmd = this.chitChat.commands['sdafasdf!'];
        // this.randomState();
      }
      console.log(trycommand);

      if (cmd === undefined) {
        console.log('didn\'t find a voice command');
      } else {

        // this sets the animation from the chat file
        // @ts-ignore
        if (!cmd.animation) {
          // @ts-ignore
          this._persona.core.setState(cmd.animation);
        }

        // @ts-ignore
        this.voiceChatter.botVoice(cmd.outchatter);
        // you have to keep track of the template/div tags and stuff.
        // it's kind of messy and should probably be cleaned up.  but it's a single page app so not too bad
        const element = document.getElementById('container');
        // @ts-ignore
        element.appendChild(this.voiceChatter.addBotText(cmd.actionURL.toString()));

        // finally push an end state into the buffer so we don't get hung up in a loop
        this.voiceChatter.chatBuffer.push(' ');
        this.voiceChatter.masloResponseBuffer.push(' ');
      }

    } catch (e) {
      // this adds a non response to the chat buffer
      this.voiceChatter.chatBuffer.push(' ');
      this.voiceChatter.masloResponseBuffer.push(' ');
    }


    // having fun figuring out dumb js search speed: https://stackoverflow.com/questions/19253753/javascript-find-json-value


    /*
    // extremely compact
    var data=[this.chitChat.commands["hey"]];


    let cmd = data.find(el => el.commands === reactionString);
    // => {name: "Albania", code: "AL"}
    console.log(data);

    */

    /* brute force look up
    var obj = this.chitChat;

    // the code you're looking for
    var needle = 'hey';
    needle = reactionString;

    // iterate over each element in the array  (this will get slow for very large jsons but may not be better way... shard the json in some way)
    for (var i = 0; i < obj.length; i++){
      // look for the entry with a matching `code` value
      if (obj[i].commands == needle){
         // we found it
        // obj[i].name is the matched result


      }
    }

    */

  }

  // NLP parsing for general use
  chatterResponse = (reaction) => {
    this.getChatterResponse(reaction);
    // TODO: extend with intelligence...
  }

  // Takes a document and N occurrences of a term
  // Returns the term frequency (tf)
  // tf = (occurrences of search term/N terms)
  tf = (d, occ) => (occ / nlp(d).terms().out('array').length);

  idf = (t) => {
    // Takes a term
    // Returns the inverse document frequency (idf)
    // idf = log_e(N documents/N documents containing
    // the search term)
    const nDocs = this.docs.length;
    const nMatches = this.docs.filter(
      (doc) => {
        const matched = doc.match(t);
        if (matched) {
          return true;
        }
        return false;
      },
    ).length;

    const result = nDocs / nMatches;
    // eslint-disable-next-line no-restricted-globals
    if (!isFinite(result)) {
      return 0;
    }
    return Math.log(result);

  }

  tfIdf = (doc) => {
    // Takes a document from this.docs
    // Returns a sorted array of objects in the form:
    // {term:<String>, weight:<Float>}
    // This is a vector of terms and Tf-Idf weights

    // @ts-ignore
    const tfIdfVector = nlp(doc).terms().out('freq').map((d) => {
      // @ts-ignore
      const t = d.normal;

      // @ts-ignore
      const tf = this.tf(doc, d.count);
      const idf = this.idf(t);

      return { term: t, weight: tf * idf };
    });

    const sortedTfIdfVector = tfIdfVector.sort((obj0, obj1) => {
      const w0 = obj0.weight;
      const w1 = obj1.weight;
      if (w0 < w1) {
        return 1;
      }
      if (w0 > w1) {
        return -1;
      }
      return 0;
    });

    return sortedTfIdfVector;
  }

  randomTfIdf = () => {
    // see: https://stackoverflow.com/questions/4550505/
    // /getting-a-random-value-from-a-javascript-array
    const rand = this.docs[Math.floor(Math.random() * this.docs.length)];
    return this.tfIdf(rand);
  }

  getDocs = () => {
    this.docs = this.voiceChatter.chatBuffer;
    this.mergedDocs = nlp(
      this.docs.map(obj => obj).join(),
    );

    return this.docs;
  }

  mergedTokensDoc = (opts) => {
    // TODO: filter opt to only get texts e.g. for a given set of user

    // Pass an opt to the nlp.out method, else 'text'
    // @ts-ignore
    try { return this.mergedDocs.out(`${opts.out}`); } catch (error) {
      return this.mergedDocs.out('text');
    }
  }

  /** Sets random state of Persona */
  randomState = () => {
    const randomIndex = Math.floor(Math.random() * AllStates.length);
    const randomState = AllStates[randomIndex] || States.Idle;
    // this._persona.setState(randomState);
    this._persona.core.setState(randomState);
  }

  dispose = () => {
    window.cancelAnimationFrame(this.rafId);
    this._unsubscribe();

    this.circleController.dispose();
    this.lineController.dispose();
    this._persona.dispose();
  }
}

import { autorun } from 'mobx';
import * as THREE from 'three';
import { Persona, States, AllStates } from '../../web';
import { LineController } from './lineController';
import { CircleController } from './circleController';
import * as Chroma from 'chroma-js';
import * as faceapi from 'face-api.js';
import { VoiceChat } from './voice';
import nlp from 'compromise';
//import * as nlpadj from 'compromise-adjectives';
//import * as nlpdates from 'compromise-dates';
//import * as nlpnumbers from 'compromise-numbers';
nlp.extend(require("compromise-numbers").default);
nlp.extend(require("compromise-dates").default);
nlp.extend(require("compromise-adjectives").default);
nlp.extend(require("compromise-sentences").default);
nlp.extend(require("compromise-paragraphs").default);
import { Sentimood } from './sentimood.js';


export class Companion {
  constructor() {

    this.element = document.getElementById('main');
    this.debugBut = document.getElementById('debugBut');
    this.debugEl = document.getElementById('debug');
    this.listeningBut = document.getElementById('listeningBut');
    this.controls = document.getElementsByClassName('controlBut');
    this.docs = [];

    this.mouseIsDown = false;
    this.startAngle = 0;
    this.angleSpeed = 0;
    this.debugActive = false;
    this.rAudio = "";

    this.circleController = new CircleController();
    this.lineController = new LineController();




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

    //kick off the speech recognition
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

    // this._addBackground();
  }

  _subscribe() {
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

  _unsubscribe() {
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

  _addBackground() {
    const { scene } = this._persona;
    {
      const geometry = new THREE.PlaneBufferGeometry(1, 1);

      // if (window.pageMode) fs = 'varying vec2 vUv; void main() { gl_FragColor = vec4( 0.37, 0.73, 0.98, 1.0 ); }';

      const material = new THREE.ShaderMaterial({
        vertexShader: `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
        // flat background
        fragmentShader: `
varying vec2 vUv;

void main() {
    float intensity = smoothstep( 0.0, 0.3, vUv.x * vUv.y );
    float r = 0.215686274509804 * (1.0 - intensity) + 0.6352941176 * intensity;
    float g = 0.733333333333333 * (1.0-intensity) + 0.43921568627451 * intensity;
    float b = 1.0 * (1.0-intensity) + 1.0 * intensity;

    gl_FragColor = vec4(r, g, b, 1.0);
}`,
      });

      material.transparent = true;
      material.blending = THREE.MultiplyBlending;
      this.plane = new THREE.Mesh(geometry, material);
      this.plane.position.z = -10;
      scene.add(this.plane);
    }

    {
      const geometry = new THREE.PlaneBufferGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this.background = new THREE.Mesh(geometry, material);
      this.background.position.z = -100;
      scene.add(this.background);
    }
  }

  run() {
    this.resize();
    console.log("slow stepping");
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

  // changeColor = e => {
  //     this.colorScheme = e.target.getAttribute('color-scheme');
  //     for(var i = 0 ; i < this.colorButs.length ; i++) this.colorButs[i].classList.remove('active')
  //     e.target.classList.add('active');
  // }

  //Let's do some facial recognition

  //here are some params to use in the face function
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
    minFaceSize: 20
  }

  moodBoost={
    joyBoost:0,
    sadnessBoost:0,
    terrorBoost:0,
    angerBoost:0,
    sleepyBoost:0,
    calmBoost:0,
    surpriseBoost:0,
    loveBoost:0
  }


mtcnnForwardParams = {
  // limiting the search space to larger faces for webcam detection
  minFaceSize: 200
}


//neeed to remove this it does nothing
onPlay(videoEl) {
  // run face detection & recognition
  // ...

  setTimeout(() => onPlay(videoEl))
}



async captureFaces(){
  //const videoEl = document.getElementById('inputVideo');
 // var mtcnnResults = faceapi.mtcnn(videoEl, this.mtcnnForwardParams);
  //console.log(mtcnnResults);
 //faceapi.draw.drawDetections('overlay', mtcnnResults.map(res => res.faceDetection), { withScore: false });
 //faceapi.draw.drawFaceLandmarks('overlay', mtcnnResults.map(res => res.faceLandmarks), { lineWidth: 4, color: 'red' });

//const options = new faceapi.MtcnnOptions(this.mtcnnForwardParams);

const input = document.getElementById('inputVideo');

const displaySize = { width: input.width, height: input.height }

// resize the overlay canvas to the input dimensions

const canvas = document.getElementById('overlay');


/* Display face expression results */
const detectionsWithExpressions =  await faceapi
  .detectSingleFace(input)
  //.withFaceLandmarks();
  //.detectAllFaces(input)
  .withFaceLandmarks(true)
 .withFaceExpressions();

  //console.log(detectionsWithExpressions);


// resize the detected boxes and landmarks in case your displayed image has a different size than the original
//const resizedResults = faceapi.resizeResults(detectionsWithExpressions, displaySize)
// draw detections into the canvas
//await faceapi.draw.drawDetections(canvas,detectionsWithExpressions);
// draw a textbox displaying the face expressions with minimum probability into the canvas
const minProbability = 0.05
//await faceapi.draw.drawFaceExpressions(canvas, detectionsWithExpressions, minProbability)
//const box = await detectionsWithExpressions.detection.box;
 //console.log(detectionsWithExpressions.expressions);
//const drawBox = new faceapi.draw.DrawBox(box, { label: Math.random() });
  //drawBox.draw(canvas);

  //set the mood  Moods = "joy" | "love" | "surprise" | "terror" | "anger" | "sadness" | "sleepy" | "calm";
  //Math.round(val * 10000) / 10000
  const weightingFactor = 1.1;
  const dampingFactor = 2;
  try {

    this.moodBoost.joyBoost = Math.log2(1+detectionsWithExpressions.expressions.happy*weightingFactor + this.moodBoost.joyBoost)/dampingFactor;
    this.moodBoost.sadnessBoost = Math.log2(1+detectionsWithExpressions.expressions.sad*weightingFactor + this.moodBoost.sadnessBoost)/dampingFactor;
    this.moodBoost.terrorBoost = Math.log2(1+detectionsWithExpressions.expressions.fearful*weightingFactor + this.moodBoost.terrorBoost)/dampingFactor;
    this.moodBoost.angerBoost = Math.log2(1+detectionsWithExpressions.expressions.angry*weightingFactor + this.moodBoost.angerBoost)/dampingFactor;
    this.moodBoost.sleepyBoost = Math.log2(1+detectionsWithExpressions.expressions.disgusted*weightingFactor + this.moodBoost.sleepyBoost)/dampingFactor;
    this.moodBoost.calmBoost = Math.log2(1+detectionsWithExpressions.expressions.neutral*weightingFactor + this.moodBoost.calmBoost)/dampingFactor;
    this.moodBoost.surpriseBoost = Math.log2(1+detectionsWithExpressions.expressions.surprised*weightingFactor + this.moodBoost.surpriseBoost)/dampingFactor;
    this.moodBoost.loveBoost = Math.log2(1+detectionsWithExpressions.expressions.happy*weightingFactor + this.moodBoost.joyBoost)/dampingFactor;

    document.getElementById('inputVideo').style.opacity=detectionsWithExpressions.expressions.happy.toString();
    // console.log(this.moodBoost)
  } catch (error) {
    //console.log("dang no face")
  }

  if(this.rAudio=="joy")
  {
    //document.getElementById('inputVideo').style.opacity=".1";

  }

/*
 this._persona.core.mood["joy"] = detectionsWithExpressions.expressions.happy - this.moodBoost.joyBoost;
    this._persona.core.mood["sadness"] = detectionsWithExpressions.expressions.sad;
    this._persona.core.mood["terror"] = detectionsWithExpressions.expressions.fearful;
    this._persona.core.mood["anger"] = detectionsWithExpressions.expressions.angry;
    this._persona.core.mood["sleepy"] = detectionsWithExpressions.expressions.disgusted;
    this._persona.core.mood["calm"] = detectionsWithExpressions.expressions.neutral;
    this._persona.core.mood["surprise"] = detectionsWithExpressions.expressions.surpised;
    this._persona.core.mood["love"] = detectionsWithExpressions.expressions.happy;

bad function for selecting states, it's a bad switch statement
  angry: 0.037408437579870224
disgusted: 0.004691769368946552
fearful: 0.00001738914397719782
happy: 0.000012005403732473496
neutral: 0.5266447067260742
sad: 0.4279022812843323
surprised: 0.003323477692902088


  var exp = detectionsWithExpressions.expressions;
  switch(exp) {
    case exp.angry > .3:
      // code block
      this._persona.core.setState("upset");
      break;

    case exp.fearful > .3:
      // code block
      this._persona.core.setState("hey");
      break;

    case exp.happy > .3:
      this._persona.core.setState("joy");
      // code block
      break;

    case exp.sad > .3:
      this._persona.core.setState("upset");
      // code block
      break;
    case exp.suprised > .3:
      this._persona.core.setState("surprise");
      // code block
      break;

    case exp.disgusted > .3:
      this._persona.core.setState("no");
        // code block
        break;
    default:
      console.log(exp)
      //this._persona.core.setState("question");
     // this.randomState();
      // code block
  }
  */

  /*

  States = "joy" | "surprise" | "listen" | "init" | "idle" | "upset" | "yes" | "no" | "hey" | "shake" | "tap" | "question";
Moods = "joy" | "love" | "surprise" | "terror" | "anger" | "sadness" | "sleepy" | "calm";


  angry: 0.037408437579870224
disgusted: 0.004691769368946552
fearful: 0.00001738914397719782
happy: 0.000012005403732473496
neutral: 0.5266447067260742
sad: 0.4279022812843323
surprised: 0.003323477692902088
*/

//now deal with audio
        //bubble up a reaction from audio
        if (this.rAudio!=""){
          console.log(this.rAudio);
          this.randomState();
         this.rAudio="";
          // this.setStateFromAudio(rAudio);
        }

       // console.log(this.voiceChatter.chatBuffer[0]);

}

//get the camera and microphone in active mode
 async captureCamera(){

            // load the models
       await faceapi.loadMtcnnModel('models')
       await faceapi.nets.faceExpressionNet.loadFromUri('models')
       await faceapi.nets.faceRecognitionNet.loadFromUri('models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('models')
       await faceapi.loadSsdMobilenetv1Model('models')
       await faceapi.nets.faceLandmark68TinyNet.loadFromUri('models')

        // try to access users webcam and stream the images
        // to the video element

        const videoEl = document.getElementById('inputVideo');
        var frameCount =0;

        //turn speach recognition on
        this.voiceChatter.recorder.start();

        const handleSuccess = (stream)=> {
          if (window.URL) {
            videoEl.srcObject = stream;
          } else {
            videoEl.src = stream;
          }



          // just process the root mean square of the audio and randomly sample it.
          const context = new AudioContext();
          const source = context.createMediaStreamSource(stream);
          const processor = context.createScriptProcessor(1024, 1, 1);

          source.connect(processor);
          processor.connect(context.destination);
          this.rAudio="joy";
          processor.onaudioprocess = (e)=> {
            // Do something with the data, e.g. convert it to WAV
           // console.log(e.inputBuffer);
         //  console.log(e.inputBuffer.getChannelData(0)[1]);
         var input = e.inputBuffer.getChannelData(0);
         var len = input.length;
         var total = 0;
         var i = 0;
         var rms;
         //this.rAudio = "joy";
       while ( i < len ) total += Math.abs( input[i++] );
       rms = Math.sqrt( total / len );
          //  console.log(frameCount);

          if(frameCount % Math.round(Math.random()*10000)){
                    if (rms > .7) {
                    this.rAudio="joy";
                    //console.log(this.rAudio);
                    } else {
                     // this.rAudio="";

                    }
                      //console.log(rms);
               }
            frameCount++;
          };

         //console.log(processor.onaudioprocess.)



        };


        navigator.mediaDevices.getUserMedia(
          { audio: true, video: true }).then(handleSuccess).catch ((e) => {
            throw "Microphone: " + e.name + ". " + e.message;
          });


  }

 async setStateFromAudio(reactAudio){
  this._persona.core.setState(reactAudio);

  }



  onMouseDown = (e) => {
    this.mouseIsDown = true;
    this.tapTimeout = setTimeout(() => {
      this._persona.core.setState(States.Tap);
    }, 100);

    console.log(faceapi.nets);
     //faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
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
    // const angle = Math.atan2(
    //   e.clientY - (this.element.offsetHeight / 2 + this._persona.core.position.y),
    //   e.clientX - (this.element.offsetWidth / 2 + this._persona.core.position.x),
    // ) / (Math.PI * 2);
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
    const width = this.element.offsetWidth;
    const height = this.element.offsetHeight;

    if (this.background) {
      this.background.scale.set(width, height, 1);
    }
    if (this.plane) {
      this.plane.scale.set(this.element.offsetWidth, this.element.offsetHeight, 1);
    }
    this._persona.resize();
  }

  step = () => {
    this.rafId = window.requestAnimationFrame(this.step);

    this.angleSpeed -= this.angleSpeed * 0.05;
    this._persona.core.rotation += this.angleSpeed;

    // this.debug && this.debug.step(time);
    this.circleController.step();
    this.lineController.step();


    Object.keys(this.circleController.vals).forEach((key) => {
      let val = this.circleController.vals[key] + this.lineController.vals[key];

      val = Math.round(val * 10000) / 10000;
     //console.log("reset mood");
     //"joy" | "love" | "surprise" | "terror" | "anger" | "sadness" | "sleepy" | "calm";

     if (key == "joy"){
     this.moodBoost.joyBoost
     }
     else if (key == "sadness"){
      this._persona.core.mood[key] = val + this.moodBoost.sadnessBoost;
     }
     else if (key == "terror"){
      this._persona.core.mood[key] = val + this.moodBoost.terrorBoost;
     }
     else if (key == "sleepy"){
      this._persona.core.mood[key] = val +  this.moodBoost.sleepyBoost;
     }
     else if (key == "calm"){
      this._persona.core.mood[key] = val + this.moodBoost.calmBoost;
     }
     else if (key == "surprise"){
      this._persona.core.mood[key] = val +  this.moodBoost.surpriseBoost;
     }
     else if (key == "love"){
      this._persona.core.mood[key] = val + this.moodBoost.joyBoost;
     }
     else if (key == "anger"){
      this._persona.core.mood[key] = val +  this.moodBoost.angerBoost;
     }
     else{
      this._persona.core.mood[key] = val;
     }



    });

   // console.log(this.voiceChatter.chatBuffer);
        //here we trigger facial recognition functions
    if (this.rafId % 10==0){
      //this.voiceChatter.chatBuffer[].toString
      this.chatterResponse(this.voiceChatter.chatBuffer[this.voiceChatter.chatBuffer.length - 1]);
      //this.voiceChatter.chatBuffer.forEach(element => console.log(element));
    }

    //here we trigger facial recognition functions
    //if (this.rafId % 10==0){
      this.captureFaces();
    //}
    //this.randomState();
   // console.log(this.rafId);
    this._persona.step();
  }

  //NLP parsing for general use
  chatterResponse(reaction){
    this.docs = this.voiceChatter.chatBuffer;
    this.mergedDocs = nlp(
        this.docs.map(obj => obj).join()
    )
   //console.log(this.docs[this.docs.length-1]);
   //console.log(this.mergedDocs.sentences().text())
        // States = "joy" | "surprise" | "listen" | "init" | "idle" | "upset" | "yes" | "no" | "hey" | "shake" | "tap" | "question";

        var voiceOut = "I feel you.";


        //this is our decision tree for responses. pretty simple right now.

        //TODO: extend with intelligence...

                //
                var sentiment = new Sentimood();

                //console.log(sentiment.analyze(reaction));


        if (reaction.includes('hey')) {
          voiceOut = "Hey there! How are you?";
          this.voiceChatter.masloResponseBuffer.push(voiceOut);
          this.voiceChatter.botVoice(voiceOut);
          this._persona.core.setState("hey");
        }

        else if (reaction.includes('happy') || sentiment.analyze(reaction).score>3) {
          voiceOut = "let's do the happy dance!";
          this.voiceChatter.masloResponseBuffer.push(voiceOut);
          this.voiceChatter.botVoice(voiceOut);
          this._persona.core.setState("joy");
        }

        else if (reaction.includes('wow')  || sentiment.analyze(reaction).score>5) {
          voiceOut = "crazy eh?";
          this.voiceChatter.masloResponseBuffer.push(voiceOut);
          this.voiceChatter.botVoice(voiceOut);
          this._persona.core.setState("surprise");
        }
        else if (sentiment.analyze(reaction).score<-6) {
          voiceOut = "oh no!";
          this.voiceChatter.masloResponseBuffer.push(voiceOut);
          this.voiceChatter.botVoice(voiceOut);
          this._persona.core.setState("upset");
        }
        else if (sentiment.analyze(reaction).score<-6 && sentiment.analyze(reaction).score>-8) {
          voiceOut = "argh!";
          this.voiceChatter.masloResponseBuffer.push(voiceOut);
          this.voiceChatter.botVoice(voiceOut);
          this._persona.core.setState("surprise");
        }
        else if (reaction.includes('bord')) {
          voiceOut = "tell me something fun!";
          this.voiceChatter.masloResponseBuffer.push(voiceOut);
          this.voiceChatter.botVoice(voiceOut);
          this._persona.core.setState("surprise");
        }
        else{

          //this.randomState();
        }


        //this adds a non response to the chat buffer
        this.voiceChatter.chatBuffer.push(" ");
        this.voiceChatter.masloResponseBuffer.push(" ");

  }

  tf(d, occ){
    // Takes a document and N occurrences of a term
    // Returns the term frequency (tf)
    // tf = (occurrences of search term/N terms)
    return (occ/nlp(d).terms().out('array').length)
  }

  idf(t){
    // Takes a term
    // Returns the inverse document frequency (idf)
    // idf = log_e(N documents/N documents containing
    // the search term)

    var nDocs = this.docs.length
    var nMatches = this.docs.filter(
      doc=>{
        var matched = doc.match(t)
        if(matched){
          return true}
        else{
          return false}
        }
    ).length

    var result = nDocs / nMatches
    if (!isFinite(result)){
      return 0
    }else{
    return Math.log(result)
    }
  }

  tfIdf(doc){
    // Takes a document from this.docs
    // Returns a sorted array of objects in the form:
    // {term:<String>, weight:<Float>}
    // This is a vector of terms and Tf-Idf weights



    var tfIdfVector = nlp(doc).terms().out('freq').map((d)=>{
      var t = d['normal']


      var tf = this.tf(doc, d['count'])

      var idf = this.idf(t)

      return {term: t, weight:tf*idf}
      }
    )

    var sortedTfIdfVector = tfIdfVector.sort((obj0, obj1)=>{
      var w0 = obj0.weight
      var w1 = obj1.weight
      if (w0 < w1){
        return 1
      }
      if (w0 > w1){
        return -1
      }
      return 0
    })

    return sortedTfIdfVector

  }

	randomTfIdf(){
		// see: https://stackoverflow.com/questions/4550505/
		// /getting-a-random-value-from-a-javascript-array
		var rand = this.docs[Math.floor(Math.random() * this.docs.length)];

		return this.tfIdf(rand)
	}

	getDocs(){
		return this.docs
	}

	mergedTokensDoc(opts){
		// TODO: filter opt to only get texts e.g. for a given set of user

		// Pass an opt to the nlp.out method, else 'text'
		try{return this.mergedDocs.out(`${opts.out}`)}catch(error){
			return this.mergedDocs.out('text')
		}
	}



    /** Sets random state of Persona */
  randomState() {
      const randomIndex = Math.floor(Math.random() * AllStates.length);
      const randomState = AllStates[randomIndex] || States.Idle;
      //this._persona.setState(randomState);
      this._persona.core.setState(randomState);
    }

  dispose() {
    window.cancelAnimationFrame(this.rafId);
    this._unsubscribe();

    this.circleController.dispose();
    this.lineController.dispose();
    this._persona.dispose();
  }
}

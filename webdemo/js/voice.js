export class VoiceChat {

  constructor() {

    this.voice = document.querySelector(".voice");
    this.voice2text = document.querySelector(".voice2text");


    //this.SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
    this.recorder =new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition);
    this.recorder.continuous = true;
    //console.log(this.recorder);
    this.chatBuffer=["Hello Friend!"];
    this.masloResponseBuffer=["Hey!"];

    this._subscribe();
  }

  step = () => {}

  addHumanText(text) {
    const chatContainer = document.createElement("div");
    chatContainer.classList.add("chat-container");
    const chatBox = document.createElement("p");
    chatBox.classList.add("voice2text");
    const chatText = document.createTextNode(text);
    chatBox.appendChild(chatText);
    chatContainer.appendChild(chatBox);
    return chatContainer;
  }

  addBotText(text) {
    const chatContainer1 = document.createElement("div");
    chatContainer1.classList.add("chat-container");
    chatContainer1.classList.add("darker");
    const chatBox1 = document.createElement("p");
    chatBox1.classList.add("voice2text");
    const chatText1 = document.createTextNode(text);
    chatBox1.appendChild(chatText1);
    chatContainer1.appendChild(chatBox1);
    return chatContainer1;
  }

  botVoice(message) {
    //console.log(message);
      const speech = new SpeechSynthesisUtterance();
      speech.text = message;

      speech.volume = 1;
      speech.rate = 1.3;
      speech.pitch = 3;
      if (!speech.text.includes('Sorry, I did not understand that')) {
        window.speechSynthesis.speak(speech);
      }

      var element = document.getElementById("container");
      element.appendChild(this.addBotText(speech.text));
  }





    _subscribe(){

      this.recorder.onstart = () => {
        console.log('Voice activated');
      };

      this.voice.addEventListener('click', () =>{
        this.recorder.start();


      });

      this.recorder.onresult = (event) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        var element = document.getElementById("container");
        element.appendChild(this.addHumanText(transcript));

        //console.log(transcript);
        this.chatBuffer.push(transcript.trim());
        //this.botVoice(transcript);
      };

    }






}
## Amplify Predictions example

To get started, create a new React project and add the necessary dependencies:

```sh
$ npx create-react-app predictions-app

$ cd predictions-app

$ npm install aws-amplify aws-amplify-react
```

Next, initialize a new Amplify project:

```sh
$ amplify init
```

Because Predictions needs the Auth category to authorize requests, go ahead and add it now:

```sh
$ amplify add auth
```

Finally, configure the React app to use the Amplify project:

```js
// src/index.js
import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)
```

## Identifying text

The first example we'll initialize is identifying text from an image. To create the service, run the following command:

```sh
$ amplify add predictions
? Please select from one of the categories below Identify
? What would you like to identify? Identify Text
? Provide a friendly name for your resource: <your_resource_name>
? Would you also like to identify documents? Y
? Who should have access? Auth and Guest users
```

Next, deploy the service:

```sh
$ amplify push
```

Next, we'll create a basic React app that will allow us to upload an image and display the text from the image:

```js
import React, { useState } from 'react'

import Amplify, { Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions'
Amplify.addPluggable(new AmazonAIPredictionsProvider())

function TextIdentification() {
  const [response, setResponse] = useState("You can add a photo by uploading direcly from the app ")

  function identifyFromFile(event) {
    setResponse('identifiying text...');
    const { target: { files } } = event;
    const [file,] = files || [];

    if (!file) {
      return;
    }
    Predictions.identify({
      text: {
        source: {
          file,
        },
        format: "PLAIN", // Available options "PLAIN", "FORM", "TABLE", "ALL"
      }
    }).then(({text: { fullText }}) => {
      setResponse(fullText)
    })
      .catch(err => setResponse(JSON.stringify(err, null, 2)))
  }

  return (
    <div className="Text">
      <div style={{padding: 50}}>
        <h3>Text identification</h3>
        <input type="file" onChange={identifyFromFile}></input>
        <p style={{
          backgroundColor: 'black', color: 'white', padding: 20
        }}>{response}</p>
      </div>
    </div>
  );
}

export default TextIdentification
```

## Translating Text

In the next example we'll create a service that translates text from a given language to a target language.

To create the service, run the following command:

```sh
$ amplify add predictions
? Please select from one of the categories below: Convert
? What would you like to convert? Translate text into a different language
? Provide a friendly name for your resource: <your_service_name>
? What is the source language? English
? What is the target language? Russian <or any language>
? Who should have access? Auth and Guest users
```

```js
import React, { useState } from 'react'

import Amplify, { Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions'
Amplify.addPluggable(new AmazonAIPredictionsProvider())

function TextTranslation() {
  const [response, setResponse] = useState("Input some text and click enter to test")
  const [textToTranslate, setTextToTranslate] = useState("write to translate");
  const [targetLang, setTargetLang] = useState('es')
  function translate() {
    Predictions.convert({
      translateText: {
        source: {
          text: textToTranslate,
          // supported languages https://docs.aws.amazon.com/translate/latest/dg/how-it-works.html#how-it-works-language-codes
        },
        targetLanguage: targetLang
      }
    }).then(result => setResponse(JSON.stringify(result, null, 2)))
      .catch(err => setResponse(JSON.stringify(err, null, 2)))
  }

  function setText(event) {
    setTextToTranslate(event.target.value);
  }

  function onChange(event) {
    setTargetLang(event.target.value)
  }

  return (
    <div className="Text">
      <div style={{ padding: 50 }}>
        <h3>Text Translation</h3>
        <input value={textToTranslate} onChange={setText}></input>
        <button onClick={translate}>Translate</button>
        <p>{response}</p>
        Target Language
        <select value={targetLang} onChange={onChange}>
          <option value='es'>Spanish</option>
          <option value='ar'>Arabic</option>
          <option value='zh'>Chinese</option>
          <option value='nl'>Dutch</option>
          <option value='el'>Greek</option>
          <option value='he'>Hebrew</option>
          <option value='pl'>Polish</option>
        </select>
      </div>
    </div>
  );
}

export default TextTranslation
```

## Speech Generation

The next example will use Amazon Polly to synthesize speech from text. Using Polly we can pass in a string and get audio returned with speech synthesization.

To add the service, run the following command:

```sh
$ amplify add predictions
? Please select from one of the categories below: Convert
? What would you like to convert? Generate speech audio from text
? Provide a friendly name for your resource: <your_service_name>
? What is the source language? US English
? Select a speaker: <your_speaker>
? Who should have access? Auth and Guest users
```

Next, update the React app with the following:

```js
import React, { useState } from 'react'

import Amplify, { Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions'
Amplify.addPluggable(new AmazonAIPredictionsProvider())

function TextToSpeech() {
  const [response, setResponse] = useState("...")
  const [textToGenerateSpeech, setTextToGenerateSpeech] = useState("write to speech");

  function generateTextToSpeech() {
    setResponse('Generating audio...');
    Predictions.convert({
      textToSpeech: {
        source: {
          text: textToGenerateSpeech,
        },
        voiceId: "Amy" // default configured on aws-exports.js 
        // list of different options are here https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
      }
    }).then(result => {
      let AudioContext = window.AudioContext || window.webkitAudioContext;
      console.log({ AudioContext });
      const audioCtx = new AudioContext(); 
      const source = audioCtx.createBufferSource();
      audioCtx.decodeAudioData(result.audioStream, (buffer) => {
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
      }, (err) => console.log({err}));
      
      setResponse(`Generation completed, press play`);
    })
      .catch(err => setResponse(err))
  }

  function setText(event) {
    setTextToGenerateSpeech(event.target.value);
  }

  return (
    <div className="Text">
      <div style={{padding: 50}}>
        <h3>Text To Speech</h3>
        <input value={textToGenerateSpeech} onChange={setText}></input>
        <button onClick={generateTextToSpeech}>Text to Speech</button>
        <h3>{response}</h3>
      </div>
    </div>
  );
}

export default TextToSpeech
```

## Label Real world objects

The next example we will do is showing how to identify objects in a photo. In this example we will upload an image and get a response with information about the objects in the photo.

To add the service, run the following command

```sh
$ amplify add predictions
? Please select from one of the categories below: Identify
? What would you like to identify? Identify Labels
? Provide a friendly name for your resource: <your_service_name>
? Would you like use the default configuration? Default Configuration
? Who should have access? Auth and Guest Users
```

Next, update App.js with the following:

```js
import React, { useState } from 'react'

import Amplify, { Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions'
Amplify.addPluggable(new AmazonAIPredictionsProvider())

function LabelsIdentification() {
  const [response, setResponse] = useState([])

  function identifyFromFile(event) {
    const { target: { files } } = event;
    const [file,] = files || [];

    if (!file) {
      return;
    }
    Predictions.identify({
      labels: {
        source: {
          file,
        },
        type: "ALL" // "LABELS" will detect objects , "UNSAFE" will detect if content is not safe, "ALL" will do both default on aws-exports.js
      }
    }).then(result => {
      console.log('result: ', result)
      const labels = result.labels.map(l => l.name)
      console.log('labels: ', labels)
      setResponse(labels)
    })
      .catch(err => setResponse(JSON.stringify(err, null, 2)))
  }

  return (
    <div className="Text">
      <div style={{padding: 50}}>
        <h3>Labels identification</h3>
        <input type="file" onChange={identifyFromFile}></input>
        {
          response.map((r, i) => (
          <h3 key={i}>{r}</h3>
          ))
        }
      </div>
    </div>
  );
}

export default LabelsIdentification
```
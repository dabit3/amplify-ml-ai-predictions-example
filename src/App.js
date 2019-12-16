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
import React, { useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { diffWords } from 'diff';

const article = 'Dark theme is one of the most requested features over the past few years. Both Apple and Google made a dark theme an essential part of UI. Dark theme’s reduced luminance provides safety in dark environments and can minimize eye strain.';

const Text = ({correct, interim, final, children}) => {
  useEffect(() => {
    if (correct && final) {
      console.log('correct', children)
    }
  }, [correct, children, interim, final])
  return (
    <span className={correct ? 'correct' : ''}>{children}</span>
  )
}

const Dictaphone = () => {
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const diff = useMemo(() => {
    return diffWords(article, transcript, {
      ignoreCase: true,
    });
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>;
  }

  const start = () => {
    SpeechRecognition.startListening({ language: 'en-US', continuous: true })
  }

  // console.log('DIFF', diff)

  return (
    <div>
      {
        diff.map((d, i) => {
          {/*const color = d.*/}
          return !d.added && (<Text key={i} interim={interimTranscript} final={finalTranscript} correct={!d.removed}>{d.value}</Text>)
        })
      }
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={start}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>
    </div>
  );
};

export default function Home() {
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  if (!ready) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Nggremeng</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Dictaphone/>
    </>
  )
}

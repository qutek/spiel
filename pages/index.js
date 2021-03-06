import React, { useMemo, useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import classnames from 'classnames';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { diffWords } from 'diff';

import quotes from '@data/quotes';

const Text = ({type, isFinal, children}) => {
  useEffect(() => {
    if ('correct' === type && isFinal) {
      console.log('correct', children);
    }
  }, [type, isFinal, children]);

  const classNames = useMemo(() => {
    let classes = ['text'];

    if ('correct' === type) {
      classes.push(type);
    }

    if (isFinal) {
      classes.push(type);
    }

    return classes.join(' ');
  }, [type, isFinal])

  return (
    <span className={classNames}>{children}</span>
  )
}

const Article = ({
  finalTranscript,
  transcript,
  quote
}) => {

  const diff = useMemo(() => {
    if (!quote) {
      return [];
    }

    return diffWords(quote.content, transcript, {
      ignoreCase: true,
    });
  }, [quote.content, transcript]);

  if (!quote) {
    return <div>Loading...</div>
  }

  return (
    <div className='quote'>
      <blockquote className="quote-card">
        <p>
          {
            diff.map((d, i) => {
              const isUnprocessed = diff.map((dt, index) => (dt.removed && index + 1)).filter(Boolean).pop() - 1 === i;
              const type = d.removed ? (isUnprocessed ? 'unprocessed' : 'missed') : 'correct';
              return !d.added && (<Text key={i} isFinal={!!finalTranscript} type={type}>{d.value}</Text>)
            })
          }
        </p>
        <cite>
          { quote.author }
        </cite>
      </blockquote>
      <hr/>
      <div className='transcript'>
        <p>{transcript}</p>
      </div>
    </div>
  )
}

const Dictaphone = ({quotes}) => {
  const [quote, setQuote] = useState(false);
  const [continues, setContinues] = useState(true);
  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const start = () => SpeechRecognition.startListening({ language: 'en-US', continuous: continues });
  const stop = () => SpeechRecognition.stopListening();

  const generateArticle = useCallback(() => {
    resetTranscript();
    const quote = quotes[Math.random() * quotes.length | 0];
    console.log('quote', quote)
    setQuote(quote);
  }, []);

  const toggleMic = useCallback(() => {
    listening ? stop() : start();
  }, [listening, start, stop])

  useEffect(generateArticle, []);

  const micClasses = useMemo(() => {
    const baseIcon = continues ? 'fa-microphone-lines' : 'fa-microphone';
    return classnames('fas mic-icon', {
      [`${baseIcon}-slash`]: !listening,
      [baseIcon]: listening
    })
  }, [continues, listening])

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>;
  }

  return (
    <div className="wrapper">
      <Article transcript={transcript} quote={quote} finalTranscript={finalTranscript} />
      <div className="navbar">
        <i onClick={resetTranscript} className="fas fa-delete-left action-icon"></i>
        <i onClick={generateArticle} className="fas fa-diagram-next action-icon"></i>

        <div className={classnames('circle', { listening, options: false })}>
          <i onClick={toggleMic} className={micClasses}></i>
          <i onClick={() => start(false)} className="fas fa-microphone mic"></i>
          <i onClick={() => start(true)} className="fas fa-microphone-lines mic"></i>
        </div>
        <div className="circle-padding"></div>
      </div>
    </div>
  );
};

export default function Home({quotes}) {
  const [ready, setReady] = useState(false);
  // prevent render on server.
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
      <Dictaphone quotes={quotes} />
    </>
  )
}

export const getStaticProps = async () => {
  return {
    props: {
      quotes
    }
  }
}
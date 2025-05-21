import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/Button'
import Sidebar from './components/Sidebar'
import { useNavigate } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './index.css' // Tailwind styles
import logo from './assets/logos.png'
function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [textToSpeak, setTextToSpeak] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural')
  const [pitch, setPitch] = useState(1)
  const [rate, setRate] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    AOS.init({ once: true, duration: 1000 })
  }, [])

  useEffect(() => {
    const playHTVoices = [
      { name: 'en-US-JennyNeural', label: 'Jenny (English US)' },
      { name: 'en-GB-OliverNeural', label: 'Oliver (English UK)' },
      { name: 'es-ES-ElviraNeural', label: 'Elvira (Spanish)' },
      { name: 'fr-FR-DeniseNeural', label: 'Denise (French)' },
    ]
    setVoices(playHTVoices)
    setSelectedVoice(playHTVoices[0].name)
  }, [])

  useEffect(() => {
    if (
      !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      setErrorMessage('Speech recognition is not supported in your browser.')
      return
    }

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      if (result.isFinal) {
        setTranscript((prev) => prev + result[0].transcript + ' ')
        setErrorMessage('')
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
      setErrorMessage(
        `Error: ${event.error}. Please check microphone permissions.`
      )
    }

    if (isRecording) {
      recognition.start()
    } else {
      recognition.stop()
    }

    return () => recognition.stop()
  }, [isRecording])

  const handleTextToSpeech = async () => {
    if (!textToSpeak.trim() || isSpeaking) return

    setIsSpeaking(true)
    try {
      const response = await fetch('https://api.play.ht/api/v2/tts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_PLAYHT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToSpeak,
          voice: selectedVoice,
          output_format: 'mp3',
          speed: rate,
          ssml: `<speak><prosody pitch="${pitch}x">${textToSpeak}</prosody></speak>`,
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch audio from PlayHT')

      const data = await response.json()
      const audio = new Audio(data.audio_url)
      audio.onended = () => setIsSpeaking(false)
      audio.onerror = () => {
        setIsSpeaking(false)
        setErrorMessage('Error playing audio. Please try again.')
      }
      audio.play()
    } catch (error) {
      console.error('TTS Error:', error)
      setErrorMessage('Error converting text to speech. Please try again.')
      setIsSpeaking(false)
    }
  }

  return (
    <>
      {/* 🌊 Full-Screen Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col justify-center items-center px-4 text-center overflow-hidden mt-16">
        <div
          className="z-10  max-w-3xl backdrop-blur-md bg-white/5 p-8 rounded-xl -mt-30 "
          data-aos="fade-down"
        >
          {/* Logo */}
          <img
            src={logo}
            alt="Speechiit Logo"
            className="mx-auto w-20 h-20 mb-6 animate-pulse"
          />
          {/* Headings */}
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
            Welcome to Speechiit
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300">
            Turn your voice into text and your ideas into speech — all in one
            powerful platform.
          </p>
          <button
            onClick={() =>
              document
                .getElementById('main-content')
                .scrollIntoView({ behavior: 'smooth' })
            }
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition duration-300"
          >
            Get Started
          </button>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[150px]"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M0,0V46.29c47.65,22,103.3,29.05,158,17.39C230.69,50.58,284,24.75,339,22.31c54.69-2.43,104.21,18.46,158,26.88C562,59.23,612.32,51.52,667,41.13c57.83-11.06,112.2-16.88,171-7.09C890.74,43.82,944,63.86,1000,65.34c59.76,1.61,113.1-17.42,171-35.41V0Z"
              fill="#1f2937"
            ></path>
          </svg>
        </div>
      </section>

      {/* 🎯 Main Content */}
      <div
        id="main-content"
        className="w-full max-w-4xl mx-auto space-y-8 px-4 pb-12"
      >
        {errorMessage && (
          <div className="bg-red-600 text-white p-4 rounded-lg text-center animate-fade-in">
            {errorMessage}
          </div>
        )}
        <br></br>
        <br></br>

        {/* 🎤 Speech to Text */}
        <div
          className="bg-gray-800 p-6 rounded-xl shadow-lg card-hover"
          data-aos="fade-up"
        >
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H12m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Speech to Text
          </h3>
          <p className="text-gray-400 mb-4">
            Click below to start recording your speech.
          </p>
          <Button
            variant="default"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 mb-4"
            onClick={() => setIsRecording(!isRecording)}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          <textarea
            className="w-full p-4 bg-gray-700 text-gray-300 rounded-lg focus:outline-none resize-none"
            rows="5"
            value={transcript}
            readOnly
            placeholder="Your speech will appear here..."
          />
        </div>

        {/* 🔊 Text to Speech */}
        <div
          className="bg-gray-800 p-6 rounded-xl shadow-lg card-hover"
          data-aos="fade-up"
        >
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.536 8.464a5 5 0 010 7.072m-7.072-7.072a5 5 0 117.072 7.072m-7.072-7.072L5 5m14 14l-2.464-2.464m-.707-.707L5 5"
              />
            </svg>
            Text to Speech
          </h3>
          <p className="text-gray-400 mb-4">
            Enter text below to convert it to speech.
          </p>
          <textarea
            className="w-full p-4 bg-gray-700 text-gray-300 rounded-lg mb-4 resize-none"
            rows="5"
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            placeholder="Type text to convert to speech..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 mb-2">Select Voice:</label>
              <select
                className="w-full p-2 bg-gray-700 text-gray-300 rounded-lg"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">
                Pitch: <span>{pitch.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">
                Rate: <span>{rate.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-green-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="default"
                className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
                onClick={handleTextToSpeech}
                disabled={isSpeaking || !textToSpeak.trim()}
              >
                {isSpeaking ? 'Speaking...' : 'Play'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home

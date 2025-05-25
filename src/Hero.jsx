import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/Button'
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
  const [link, setLink] = useState('') // For YouTube link or file upload
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

  const handleTranscribe = () => {
    if (link) {
      navigate('/transcribe', { state: { youtubeLink: link } })
    } else {
      setErrorMessage('Please enter a YouTube link to transcribe.')
    }
  }

  return (
    <div className="min-h-screen bg-black-50">
      {/* Hero Section */}
      <section className="container mx-auto py-16 text-center">
        <div data-aos="fade-down">
          <h2 className="text-4xl font-bold text-white-800 mb-4">
            Transcribe Audio & Video with Speechiit
          </h2>
          <p className="text-lg text-white-600 mb-8">
            Convert your audio, video, or YouTube links to text with high
            accuracy. Supports multiple languages and speaker recognition.
          </p>
          {/* <div className="flex justify-center mb-4">
            <input
              type="text"
              placeholder="Paste YouTube Link to Transcribe"
              className="w-full max-w-lg p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <Button
              onClick={handleTranscribe}
              className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 transition"
            >
              Transcribe
            </Button>
          </div> */}
          <p className="text-sm text-white-500">
            Supports MP3, MP4, WAV, and YouTube links. Export as TXT, SRT, and
            more.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="text-center" data-aos="fade-up">
            <h3 className="text-xl font-semibold text-white-800 mb-2">
              High Accuracy
            </h3>
            <p className="text-white-600">
              Achieve up to 99% accuracy with our AI-powered transcription
              engine.
            </p>
          </div>
          <div className="text-center" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-xl font-semibold text-white-800 mb-2">
              Speaker Recognition
            </h3>
            <p className="text-white-600">
              Identify multiple speakers in podcasts, interviews, and lectures.
            </p>
          </div>
          <div className="text-center" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-xl font-semibold text-white-800 mb-2">
              Multilingual Support
            </h3>
            <p className="text-white-600">
              Transcribe and translate into 100+ languages effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Speech-to-Text and Text-to-Speech Section */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-white-800 mb-12">
          Explore More Features
        </h2>
        {errorMessage && (
          <div className="bg-red-600 text-white p-4 rounded-lg text-center mb-8 animate-fade-in">
            {errorMessage}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Speech to Text */}
          <div
            className="bg-blue-100 p-6 rounded-xl shadow-lg"
            data-aos="fade-up"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-600"
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
            <p className="text-gray-600 mb-4">
              Record your voice and convert it to text instantly.
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
              className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none resize-none"
              rows="5"
              value={transcript}
              readOnly
              placeholder="Your speech will appear here..."
            />
          </div>

          {/* Text to Speech */}
          <div
            className="bg-blue-100 p-6 rounded-xl shadow-lg"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-green-600"
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
            <p className="text-gray-600 mb-4">
              Convert your text to speech with customizable voices.
            </p>
            <textarea
              className="w-full p-4 bg-white border border-gray-300 rounded-lg mb-4 resize-none"
              rows="5"
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              placeholder="Type text to convert to speech..."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-600 mb-2">
                  Select Voice:
                </label>
                <select
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg"
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
                <label className="block text-gray-600 mb-2">
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
                <label className="block text-gray-600 mb-2">
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
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-white-800 mb-12">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-md"
            data-aos="fade-up"
          >
            <p className="text-white-600 italic">
              "Speechiit has made transcribing my lectures so easy. The accuracy
              is incredible!"
            </p>
            <p className="text-right text-white-800 font-semibold mt-4">
              - Priya Sharma, Student
            </p>
          </div>
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-md"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <p className="text-white-600 italic">
              "I use Speechiit for my podcast transcriptions. The speaker
              recognition feature is a game-changer!"
            </p>
            <p className="text-right text-white-800 font-semibold mt-4">
              - Arjun Patel, Podcaster
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

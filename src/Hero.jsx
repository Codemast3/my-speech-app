import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/Button'
import Sidebar from './components/Sidebar'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [textToSpeak, setTextToSpeak] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  // Speech-to-Text
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
        setErrorMessage('') // Clear error on successful recognition
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

  // Text-to-Speech
  const handleTextToSpeech = () => {
    if (!isSpeaking && textToSpeak.trim()) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = 'en-US'
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-900 p-4 shadow-md w-full fixed top-0 left-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <h1 className="text-white text-2xl font-semibold">Speechit</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 pt-16 p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Welcome to Speechit
            </h2>
            <p className="text-lg text-gray-600">
              Transform your voice into text and text into speech with ease!
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
              {errorMessage}
            </div>
          )}

          {/* Speech-to-Text Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
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
              Speak, and we’ll convert your words to text.
            </p>
            <Button
              variant="default"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300 mb-4"
              onClick={() => setIsRecording(!isRecording)}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md text-gray-500 italic"
              rows="4"
              value={transcript}
              readOnly
              placeholder="Your speech will appear here..."
            />
          </div>

          {/* Text-to-Speech Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
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
              Enter text, and we’ll convert it to speech.
            </p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              rows="4"
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              placeholder="Type text to convert to speech..."
            />
            <Button
              variant="default"
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-300"
              onClick={handleTextToSpeech}
              disabled={isSpeaking || !textToSpeak.trim()}
              aria-label={isSpeaking ? 'Speaking' : 'Play text to speech'}
            >
              {isSpeaking ? 'Speaking...' : 'Play'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right-Side Drawer (Sidebar) */}
      <Sidebar />
    </div>
  )
}

export default Home

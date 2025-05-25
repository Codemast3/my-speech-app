import React, { useState } from 'react'
import '../index.css' // Assuming Tailwind is imported here via index.css

function Upload({ user }) {
  const [file, setFile] = useState(null)
  const [transcription, setTranscription] = useState('')
  const [sentiment, setSentiment] = useState([])
  const [entities, setEntities] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return alert('Please select an audio file.')
    if (!file.type.startsWith('audio/'))
      return alert('Only audio files are allowed.')

    setLoading(true)
    const formData = new FormData()
    formData.append('audio', file)
    formData.append('userId', user?.id)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transcription`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()
      if (response.ok) {
        setTranscription(data.transcription)
        setSentiment(data.intelligence?.sentiment || []) // Updated to match backend response
        setEntities(data.intelligence?.entities || [])
        setTopics(Object.keys(data.intelligence?.topics?.summary || {})) // Extract topic keys
        setFile(null)
      } else {
        throw new Error(data.error || 'Failed to transcribe.')
      }
    } catch (error) {
      console.error('Upload error:', error.message)
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-start justify-center pt-20 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 max-w-2xl w-full transition-all duration-300 transform hover:shadow-3xl">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center tracking-tight">
          Upload & Transcribe Audio
        </h2>

        {/* File Input */}
        <div className="mb-8">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-600 dark:text-gray-300 
                       file:mr-4 file:py-3 file:px-5 
                       file:rounded-full file:border-0 
                       file:text-sm file:font-medium 
                       file:bg-blue-600 file:text-white 
                       hover:file:bg-blue-700 
                       dark:file:bg-blue-500 dark:hover:file:bg-blue-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
                       transition-all duration-200"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg 
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
                     focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 
                     shadow-md hover:shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Transcribing...
            </div>
          ) : (
            'Upload & Transcribe'
          )}
        </button>

        {/* Transcription Result */}
        {transcription && (
          <div className="mt-10 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-600">
              Transcription Result:
            </h3>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed">
              {transcription}
            </p>
          </div>
        )}

        {/* Audio Intelligence Section */}
        {(sentiment.length > 0 || entities.length > 0 || topics.length > 0) && (
          <div className="mt-10 space-y-8">
            {/* Sentiment Analysis */}
            {sentiment.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-600">
                  Sentiment Analysis
                </h4>
                <ul className="space-y-3">
                  {sentiment.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-gray-700 dark:text-gray-200 flex flex-col p-3 rounded-md bg-white dark:bg-gray-600 shadow-sm"
                    >
                      <span>
                        <strong>Text:</strong> {item.text}
                      </span>
                      <span>
                        <strong>Sentiment:</strong>{' '}
                        <span
                          className={`${
                            item.sentiment === 'POSITIVE'
                              ? 'text-green-600'
                              : item.sentiment === 'NEGATIVE'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          } font-medium`}
                        >
                          {item.sentiment}
                        </span>{' '}
                        (Confidence: {Math.round(item.confidence * 100)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Entities Detected */}
            {entities.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-600">
                  Entities Detected
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-200">
                  {entities.map((ent, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{ent.entity_type}:</span>{' '}
                      {ent.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Topics */}
            {topics.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-600">
                  Topics
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-200">
                  {topics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Upload

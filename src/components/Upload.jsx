import React, { useState } from 'react'
import '../index.css'

function Upload({ user }) {
  const [file, setFile] = useState(null)
  const [transcription, setTranscription] = useState('')
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-xl w-full transition-colors duration-300">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Upload & Transcribe Audio
        </h2>

        <div className="mb-4">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-700 dark:text-gray-200
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100 dark:file:bg-blue-800 dark:file:text-white dark:hover:file:bg-blue-700"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Transcribing...' : 'Upload & Transcribe'}
        </button>

        {transcription && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
              Transcription Result:
            </h3>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 rounded-lg resize-none"
              value={transcription}
              readOnly
              rows={6}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Upload

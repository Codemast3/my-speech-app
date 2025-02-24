import React, { useState } from 'react'
import '../index.css'
function Upload({ user }) {
  const [file, setFile] = useState(null)
  const [transcription, setTranscription] = useState('')

  const handleUpload = async () => {
    if (!file) return alert('Please select an audio file.')

    const formData = new FormData()
    formData.append('audio', file)
    formData.append('userId', user?.id)

    try {
      const response = await fetch(
        'https://my-speech-app-2.onrender.com/transcription',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()
      if (response.ok) {
        setTranscription(data.transcription)
      } else {
        throw new Error(data.error || 'Failed to transcribe.')
      }
    } catch (error) {
      console.error('Upload error:', error.message)
    }
  }

  return (
    <div className="p-4">
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 mt-2"
      >
        Upload & Transcribe
      </button>
      {transcription && <p className="mt-4">Transcription: {transcription}</p>}
    </div>
  )
}

export default Upload

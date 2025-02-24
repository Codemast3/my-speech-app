import React, { useState } from 'react'
import axios from 'axios'

const Upload = () => {
  const [file, setFile] = useState(null)
  const [transcription, setTranscription] = useState('')

  const handleUpload = async () => {
    const formData = new FormData()
    formData.append('audio', file)

    const { data } = await axios.post('/transcribe', formData)
    setTranscription(data.transcription)
  }

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>
      <p>{transcription}</p>
    </div>
  )
}

export default Upload

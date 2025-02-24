import React, { useEffect, useState } from 'react'
import '../index.css'
function Transcriptions({ user }) {
  const [transcriptions, setTranscriptions] = useState([])

  useEffect(() => {
    const fetchTranscriptions = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/transcriptions?userId=${user?.id}`
      )
      const data = await res.json()
      setTranscriptions(data)
    }
    if (user) fetchTranscriptions()
  }, [user])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Your Transcriptions</h2>
      {transcriptions.map((t) => (
        <div key={t.id} className="p-2 border rounded mt-2">
          <p>
            <strong>Audio:</strong> {t.audio_url}
          </p>
          <p>
            <strong>Transcription:</strong> {t.transcription}
          </p>
        </div>
      ))}
    </div>
  )
}
export default Transcriptions

import React, { useEffect, useState } from 'react'
import '../index.css'
import axios from 'axios'

const fetchUserTranscriptions = async (userId) => {
  console.log('Fetching transcriptions for user:', userId)
  console.log('API URL:', import.meta.env.VITE_API_URL)

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/user-transcriptions?userId=${userId}`
    )
    return response.data || []
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
    return []
  }
}

const Transcriptions = ({ userId }) => {
  const [transcriptions, setTranscriptions] = useState([])

  useEffect(() => {
    if (!userId) {
      console.warn('No user ID provided')
      return
    }
    fetchUserTranscriptions(userId).then(setTranscriptions)
  }, [userId])

  return (
    <div>
      <h2>Your Transcriptions</h2>
      {transcriptions.length > 0 ? (
        <ul>
          {transcriptions.map((item, index) => (
            <li key={index}>
              <p>
                <strong>Transcription:</strong> {item.transcription}
              </p>
              <audio controls>
                <source
                  src={`${import.meta.env.VITE_API_URL}/uploads/${
                    item.audio_url
                  }`}
                  type="audio/mp3"
                />
                Your browser does not support the audio tag.
              </audio>
            </li>
          ))}
        </ul>
      ) : (
        <p>No transcriptions found.</p>
      )}
    </div>
  )
}

export default Transcriptions

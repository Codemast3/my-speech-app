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
      <div className="max-h-125 overflow-y-auto border rounded-lg p-3 bg-gray-50 mt-10">
        {transcriptions.length > 0 ? (
          <ul className="space-y-4">
            {transcriptions.map((item, index) => (
              <li key={index} className="p-3 bg-white rounded-lg shadow">
                <p className="text-sm font-medium text-gray-800">
                  {item.transcription}
                </p>
                <audio controls className="mt-2 w-full">
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
          <p className="text-gray-600">No transcriptions found.</p>
        )}
      </div>
    </div>
  )
}

export default Transcriptions

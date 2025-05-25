import React, { useEffect, useState } from 'react'
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

  // Function to aggregate sentiment
  const getDominantSentiment = (sentimentArray) => {
    if (!sentimentArray || sentimentArray.length === 0) return null

    // Count frequency of each sentiment
    const sentimentCounts = sentimentArray.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1
      return acc
    }, {})
    const mostFrequentSentiment = Object.keys(sentimentCounts).reduce((a, b) =>
      sentimentCounts[a] > sentimentCounts[b] ? a : b
    )

    // Calculate average confidence for the most frequent sentiment
    const filteredSentiments = sentimentArray.filter(
      (s) => s.sentiment === mostFrequentSentiment
    )
    const averageConfidence =
      filteredSentiments.reduce((sum, s) => sum + s.confidence, 0) /
      filteredSentiments.length

    return { sentiment: mostFrequentSentiment, confidence: averageConfidence }
  }

  useEffect(() => {
    if (!userId) {
      console.warn('No user ID provided')
      return
    }
    fetchUserTranscriptions(userId).then(setTranscriptions)
  }, [userId])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <br></br>
      <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Your Transcriptions
      </h2>

      <div className="max-h-[500px] overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 shadow-sm">
        {transcriptions.length > 0 ? (
          <ul className="space-y-8">
            {transcriptions.map((item, index) => {
              console.log('Transcription item:', item)

              // Get the dominant sentiment
              const dominantSentiment = getDominantSentiment(item.sentiment)

              return (
                <li
                  key={index}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-600"
                >
                  <p className="text-gray-900 dark:text-gray-200 text-base font-medium mb-4 whitespace-pre-line">
                    {item.transcription}
                  </p>

                  <audio
                    controls
                    className="w-full rounded-md mb-6 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <source
                      src={`${import.meta.env.VITE_API_URL}${item.audio_url}`}
                      type="audio/mp3"
                    />
                    Your browser does not support the audio tag.
                  </audio>

                  {/* Sentiment */}
                  {dominantSentiment && (
                    <div className="mb-4">
                      <strong className="text-gray-700 dark:text-gray-300">
                        Sentiment:
                      </strong>{' '}
                      <span
                        className={`font-semibold ${
                          dominantSentiment.sentiment === 'POSITIVE'
                            ? 'text-green-600'
                            : dominantSentiment.sentiment === 'NEGATIVE'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        {dominantSentiment.sentiment}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                        (Confidence:{' '}
                        {Math.round(dominantSentiment.confidence * 100)}%)
                      </span>
                    </div>
                  )}

                  {/* Entities */}
                  {item.entities?.length > 0 && (
                    <div className="mb-4">
                      <strong className="text-gray-700 dark:text-gray-300">
                        Entities Detected:
                      </strong>
                      <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-gray-700 dark:text-gray-200">
                        {item.entities.map((ent, idx) => (
                          <li key={idx}>
                            <strong>{ent.entity_type}:</strong> {ent.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Topics */}
                  {Object.keys(item.topics?.summary || {}).length > 0 && (
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300">
                        Topics:
                      </strong>
                      <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-gray-700 dark:text-gray-200">
                        {Object.keys(item.topics.summary).map((label, idx) => (
                          <li key={idx}>{label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No transcriptions found.
          </p>
        )}
      </div>
    </div>
  )
}

export default Transcriptions

import React from 'react'

function Documentation() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-300 mt-10 ml-5">
      <h1 className="text-4xl font-bold text-white mb-6">Documentation</h1>
      <p className="mb-4">
        Speechiit uses <strong>AssemblyAI</strong> for speech-to-text
        transcription. It provides real-time recognition, support for multiple
        languages, and advanced analysis.
      </p>
      <a
        href="https://www.assemblyai.com/docs/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        Explore AssemblyAI Docs →
      </a>
    </div>
  )
}

export default Documentation

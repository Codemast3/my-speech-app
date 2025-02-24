import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Upload from './components/Upload'
import Transcriptions from './components/Transcriptionns'

function App() {
  const [user, setUser] = useState(null)

  // Check for active session on page load
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) setUser(session.user)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    )

    return () => authListener.subscription.unsubscribe()
  }, [])

  return user ? (
    <div className="bg-gray-100 min-h-screen">
      {/* Navbar */}
      <nav className="bg-blue-900 p-4 shadow-md">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-semibold">Speechiit</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              setUser(null)
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Upload user={user} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Transcriptions user={user} />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Login setUser={setUser} />
  )
}

export default App

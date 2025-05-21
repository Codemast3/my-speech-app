import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Upload from './components/Upload'
import Transcriptions from './components/Transcriptions'
import Sidebar from './components/Sidebar'
import Footer from './components/ui/Trade'
import Documentation from './components/ui/Documentation'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Home from './Hero'
import Profile from './Profile'

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

  if (!user) {
    return <Login setUser={setUser} />
  }

  return (
    <>
      <Router>
        <div className="min-h-screen bg-gray-900 flex">
          {/* Sidebar remains static */}
          <Sidebar />

          <div className="flex-1 min-h-screen bg-gray-900">
            {/* Navbar */}
            <nav className="bg-gray-900 p-4 shadow-md fixed top-0 w-full z-30">
              <div className="max-w-screen-xl mx-auto flex justify-between items-center">
                <h1 className="text-white text-2xl font-semibold">Speechiit</h1>
              </div>
            </nav>

            {/* Dynamic Routing Content */}
            <div className="p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/upload" />} />
                <Route path="/upload" element={<Upload user={user} />} />
                <Route
                  path="/transcriptions"
                  element={<Transcriptions userId={user.id} />}
                />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/documentation" element={<Documentation />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
      <Footer />
    </>
  )
}

export default App

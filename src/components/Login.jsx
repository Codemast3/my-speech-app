import React, { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../supabaseClient'
import '../index.css'

function Login({ setUser }) {
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  return (
    <>
      <nav className="bg-blue-900 p-4 shadow-md">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-semibold">Speechiit</h1>
        </div>
      </nav>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    </>
  )
}
export default Login

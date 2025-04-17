import { Button } from './components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function Profile() {
  const navigate = useNavigate()

  const handleSignOut = () => {
    // Add your sign-out logic here (e.g., clear auth token, reset state)
    console.log('Signing out...')
    // Redirect to the home or login page after signing out
    navigate('/')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <p className="mb-4">Welcome to your profile page!</p>
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
  )
}

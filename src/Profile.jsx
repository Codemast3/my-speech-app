import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function Profile() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 dark:bg-gray-900 px-5 pt-16">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Welcome back! Here’s your profile summary.
        </p>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white text-2xl font-semibold">
            U
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 space-y-2">
          {/* <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Email:</strong> user@example.com
          </div> */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Selected Plan:</strong> Free Tier
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Status:</strong> Active
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

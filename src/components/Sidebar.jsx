import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/Sheet'
import { Link } from 'react-router-dom'

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex">
      {/* Toggle Button */}
      <Button
        variant="outline"
        className="fixed top-5 left-4 bg-gray-700 text-white p-1 rounded-md shadow-md z-50"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation drawer"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right" // Explicitly enforce right side
          className="bg-gray-900 text-white w-64 p-5 pt-16 transform transition-transform duration-300"
          style={{ transform: open ? 'translate-x-0' : 'translate-x-full' }} // Force right-side animation
        >
          <nav className="space-y-4">
            <Link to="/home" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full text-left hover:bg-gray-800 transition duration-300"
              >
                Home
              </Button>
            </Link>
            <Link to="/" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full text-left hover:bg-gray-800 transition duration-300"
              >
                Upload Transcription
              </Button>
            </Link>
            <Link to="/transcriptions" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full text-left hover:bg-gray-800 transition duration-300"
              >
                Saved Transcriptions
              </Button>
            </Link>
            <Link to="/profile" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full text-left hover:bg-gray-800 transition duration-300"
              >
                My Profile
              </Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          open ? 'md:mr-64' : 'md:mr-0'
        }`}
      >
        {/* Content here */}
      </div>
    </div>
  )
}

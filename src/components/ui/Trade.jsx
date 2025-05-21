import React from 'react'

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-center py-4 ">
      <p>
        © {new Date().getFullYear()} Speechiit
        <span className="align-super text-sm">™</span>. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer

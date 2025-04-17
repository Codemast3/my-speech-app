import React from 'react'

export function Sheet({ open, onOpenChange, children, side = 'left' }) {
  return (
    <div
      className={`fixed top-0 ${
        side === 'left' ? 'left-0' : 'right-0'
      } h-full w-64 bg-gray-900 text-white shadow-lg z-50 transform ${
        open
          ? 'translate-x-0'
          : side === 'left'
          ? '-translate-x-full'
          : 'translate-x-full'
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="p-5">{children}</div>

      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-white"
        onClick={() => onOpenChange(false)}
      >
        ✕
      </button>
    </div>
  )
}

export function SheetTrigger({ asChild, children, onClick }) {
  return React.cloneElement(children, {
    onClick: () => onClick && onClick(),
  })
}

export function SheetContent({ children }) {
  return <div className="p-5">{children}</div>
}

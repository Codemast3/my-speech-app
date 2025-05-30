import React from 'react'

export function Button({ variant = 'default', className = '', ...props }) {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition duration-300'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    ghost: 'text-gray-600 hover:bg-gray-200',
  }

  return (
    <button
      className={`${baseStyles} ${
        variants[variant] || variants.default
      } ${className}`}
      {...props}
    />
  )
}

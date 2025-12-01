import React from 'react'
import { Link } from 'react-router-dom'

export const RichText = ({ text }: { text: string }) => {
  if (!text) return null

  // Hada Regex kay-ferre9 text finma l9a # awla @
  const parts = text.split(/((?:#|@)\w+)/g)

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('#')) {
          return (
            <span key={i} className="text-blue-500 font-bold hover:underline cursor-pointer">
              {part}
            </span>
          )
        }
        if (part.startsWith('@')) {
          // Mli tcliki 3la mention, ydik l profile (ex: @Hamza -> /profile/ID_DYAL_HAMZA ?)
          // Hna s3ib n3rfo ID mn Smiya bla backend s7i7, donc ghir ndirouha couleur zer9a décor.
          return (
            <span key={i} className="text-blue-500 font-bold cursor-pointer">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

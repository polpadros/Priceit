'use client'
import { useState } from 'react'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const initial = name?.[0]?.toUpperCase() ?? '?'
  const showImg = src && !imgError

  return (
    <div className={`${SIZES[size]} rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center ${className}`}>
      {showImg ? (
        <img
          src={src}
          alt={name ?? ''}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-black text-white leading-none">{initial}</span>
      )}
    </div>
  )
}

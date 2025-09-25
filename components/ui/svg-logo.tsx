"use client"

import React from "react"

interface SVGLogoProps {
  size?: number
  className?: string
  variant?: "full" | "icon" | "horizontal"
}

export function CivicPulseSVGLogo({ size = 32, className = "", variant = "full" }: SVGLogoProps) {
  const IconSVG = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle with tricolor gradient */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#tricolorGradient)"
        stroke="url(#strokeGradient)"
        strokeWidth="2"
      />
      
      {/* Inner white circle */}
      <circle cx="32" cy="32" r="22" fill="white" />
      
      {/* Ashoka Chakra inspired pattern */}
      <circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke="#1E40AF"
        strokeWidth="1"
        opacity="0.3"
      />
      
      {/* Central building/civic icon */}
      <g transform="translate(20, 18)">
        {/* Building base */}
        <rect x="4" y="20" width="16" height="8" fill="#F97316" rx="1" />
        
        {/* Building columns */}
        <rect x="6" y="12" width="2" height="8" fill="#EA580C" />
        <rect x="10" y="12" width="2" height="8" fill="#EA580C" />
        <rect x="14" y="12" width="2" height="8" fill="#EA580C" />
        <rect x="18" y="12" width="2" height="8" fill="#EA580C" />
        
        {/* Roof/dome */}
        <path d="M4 12 L12 4 L20 12 Z" fill="#DC2626" />
        
        {/* Flag on top */}
        <rect x="11" y="4" width="2" height="8" fill="#92400E" />
        <rect x="13" y="4" width="6" height="3" fill="#F97316" />
      </g>
      
      {/* Decorative dots inspired by rangoli */}
      <circle cx="12" cy="20" r="1.5" fill="#F97316" opacity="0.6" />
      <circle cx="52" cy="20" r="1.5" fill="#F97316" opacity="0.6" />
      <circle cx="12" cy="44" r="1.5" fill="#F97316" opacity="0.6" />
      <circle cx="52" cy="44" r="1.5" fill="#F97316" opacity="0.6" />
      
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="tricolorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="33%" stopColor="#FFFFFF" />
          <stop offset="66%" stopColor="#138808" />
          <stop offset="100%" stopColor="#000080" />
        </linearGradient>
        
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
    </svg>
  )

  const TextLogo = () => (
    <div className="flex flex-col items-start">
      <div className="flex items-baseline">
        <span 
          style={{ fontSize: size * 0.6 }}
          className="font-black text-orange-600 leading-none"
        >
          Civic
        </span>
        <span 
          style={{ fontSize: size * 0.6 }}
          className="font-light text-blue-700 leading-none ml-1"
        >
          Pulse
        </span>
      </div>
      <span 
        style={{ fontSize: size * 0.25 }}
        className="text-green-600 font-medium tracking-wide mt-0.5 devanagari-font"
      >
        नागरिक सेवा
      </span>
    </div>
  )

  if (variant === "icon") {
    return <IconSVG />
  }

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <IconSVG />
        <TextLogo />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconSVG />
      <TextLogo />
    </div>
  )
}

// Minimalist version for small spaces
export function CivicPulseMinimal({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded square background */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="6"
        fill="url(#orangeGradient)"
      />
      
      {/* Geometric pattern inspired by Indian art */}
      <g transform="translate(8, 8)">
        {/* Central diamond */}
        <rect x="6" y="6" width="4" height="4" fill="white" transform="rotate(45 8 8)" />
        
        {/* Corner elements */}
        <circle cx="4" cy="4" r="1.5" fill="white" opacity="0.8" />
        <circle cx="12" cy="4" r="1.5" fill="white" opacity="0.8" />
        <circle cx="4" cy="12" r="1.5" fill="white" opacity="0.8" />
        <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.8" />
        
        {/* Central icon */}
        <text x="8" y="10" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
          🏛️
        </text>
      </g>
      
      <defs>
        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
    </svg>
  )
}
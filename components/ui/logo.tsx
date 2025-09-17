"use client"

import React from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "full" | "icon" | "text"
  className?: string
}

export function Logo({ size = "md", variant = "full", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl", 
    xl: "text-4xl"
  }

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg ${className}`}>
      {/* Geometric Indian-inspired pattern */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Main lotus-inspired center with civic elements */}
        <div className="absolute inset-1 bg-white rounded-md flex items-center justify-center">
          <div className="text-orange-600 font-bold text-xs">
            {size === "sm" ? "🏛️" : size === "md" ? "🏛️" : "🏛️"}
          </div>
        </div>
        
        {/* Corner decorative elements inspired by Indian motifs */}
        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
        <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
        <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
      </div>
    </div>
  )

  const LogoText = () => (
    <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent`}>
      CivicSense
    </span>
  )

  if (variant === "icon") {
    return <LogoIcon />
  }

  if (variant === "text") {
    return <LogoText />
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon />
      <LogoText />
    </div>
  )
}

// Alternative Creative Logo Component with Indian Elements
export function LogoCreative({ size = "md", variant = "full", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12", 
    xl: "h-16 w-16"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl"
  }

  const CreativeIcon = () => (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {/* Circular background with tricolor inspiration */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 via-white to-green-600 p-0.5">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          {/* Ashoka Chakra inspired center with civic symbol */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-2 border-blue-600 opacity-30"></div>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">🏛️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const CreativeText = () => (
    <div className="flex flex-col leading-none">
      <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent`}>
        CivicSense
      </span>
      {size !== "sm" && (
        <span className="text-xs text-gray-600 font-medium tracking-wide">
          नागरिक सेवा
        </span>
      )}
    </div>
  )

  if (variant === "icon") {
    return <CreativeIcon />
  }

  if (variant === "text") {
    return <CreativeText />
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CreativeIcon />
      <CreativeText />
    </div>
  )
}

// Minimalist Logo with Indian Typography
export function LogoMinimal({ size = "md", variant = "full", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl", 
    lg: "text-2xl",
    xl: "text-4xl"
  }

  const MinimalIcon = () => (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md ${className}`}>
      <div className="text-white font-black text-sm">
        CS
      </div>
    </div>
  )

  const MinimalText = () => (
    <div className="flex items-baseline gap-1">
      <span className={`font-black ${textSizeClasses[size]} text-orange-600`}>
        Civic
      </span>
      <span className={`font-light ${textSizeClasses[size]} text-gray-700`}>
        Sense
      </span>
    </div>
  )

  if (variant === "icon") {
    return <MinimalIcon />
  }

  if (variant === "text") {
    return <MinimalText />
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MinimalIcon />
      <MinimalText />
    </div>
  )
}
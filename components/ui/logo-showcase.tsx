"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CivicPulseSVGLogo, CivicPulseMinimal } from "@/components/ui/svg-logo"
import { Logo, LogoCreative, LogoMinimal } from "@/components/ui/logo"

export function LogoShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">CivicPulse Logo Variations</h1>
          <p className="text-lg text-gray-600">Creative logos designed for Indian audience with cultural elements</p>
        </div>

        {/* Primary SVG Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-orange-600">Primary SVG Logo (Recommended)</CardTitle>
            <CardDescription>Beautiful SVG logo with Indian tricolor inspiration and civic elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-24">
                  <CivicPulseSVGLogo size={64} variant="icon" />
                </div>
                <p className="text-sm font-medium">Icon Only</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-24">
                  <CivicPulseSVGLogo size={48} variant="full" />
                </div>
                <p className="text-sm font-medium">Full Logo</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-24">
                  <CivicPulseSVGLogo size={40} variant="horizontal" />
                </div>
                <p className="text-sm font-medium">Horizontal Layout</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Logos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Alternative Logo Styles</CardTitle>
            <CardDescription>Various creative interpretations with Indian cultural elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Creative Logo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Creative Logo with Tricolor Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <LogoCreative size="sm" variant="icon" />
                  </div>
                  <p className="text-xs">Small Icon</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <LogoCreative size="md" variant="icon" />
                  </div>
                  <p className="text-xs">Medium Icon</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <LogoCreative size="md" variant="text" />
                  </div>
                  <p className="text-xs">Text with Hindi</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <LogoCreative size="md" variant="full" />
                  </div>
                  <p className="text-xs">Full Logo</p>
                </div>
              </div>
            </div>

            {/* Minimalist Logo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Minimalist Design</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <LogoMinimal size="sm" variant="icon" />
                  </div>
                  <p className="text-xs">Small Icon</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <LogoMinimal size="md" variant="icon" />
                  </div>
                  <p className="text-xs">Medium Icon</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <LogoMinimal size="md" variant="text" />
                  </div>
                  <p className="text-xs">Text Only</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <LogoMinimal size="md" variant="full" />
                  </div>
                  <p className="text-xs">Full Logo</p>
                </div>
              </div>
            </div>

            {/* Minimal SVG */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Compact Minimal SVG</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <CivicPulseMinimal size={20} />
                  </div>
                  <p className="text-xs">Size 20px</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <CivicPulseMinimal size={24} />
                  </div>
                  <p className="text-xs">Size 24px</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <CivicPulseMinimal size={32} />
                  </div>
                  <p className="text-xs">Size 32px</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center h-16">
                    <CivicPulseMinimal size={40} />
                  </div>
                  <p className="text-xs">Size 40px</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dark Background Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-purple-600">Dark Background Examples</CardTitle>
            <CardDescription>How the logos look on dark backgrounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="bg-gray-900 p-6 rounded-lg flex items-center justify-center h-24">
                  <CivicPulseSVGLogo size={48} variant="horizontal" />
                </div>
                <p className="text-sm font-medium">Primary on Dark</p>
              </div>
              <div className="text-center space-y-2">
                <div className="bg-blue-900 p-6 rounded-lg flex items-center justify-center h-24">
                  <LogoCreative size="md" variant="full" />
                </div>
                <p className="text-sm font-medium">Creative on Blue</p>
              </div>
              <div className="text-center space-y-2">
                <div className="bg-green-900 p-6 rounded-lg flex items-center justify-center h-24">
                  <CivicPulseMinimal size={40} />
                </div>
                <p className="text-sm font-medium">Minimal on Green</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">Usage Guidelines</CardTitle>
            <CardDescription>Best practices for using the CivicPulse logos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">✅ Recommended Uses:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Primary SVG logo for main navigation</li>
                  <li>• Creative logo for marketing materials</li>
                  <li>• Minimal SVG for favicons and small spaces</li>
                  <li>• Horizontal layout for headers</li>
                  <li>• Include Hindi text for Indian audience</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">⚠️ Design Notes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Colors inspired by Indian tricolor</li>
                  <li>• Building/temple icon represents civic duty</li>
                  <li>• Devanagari text: "नागरिक सेवा" (Civic Service)</li>
                  <li>• Gradients work well on light backgrounds</li>
                  <li>• Scalable vector graphics for all sizes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
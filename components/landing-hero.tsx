"use client"

import { ReportButton } from "./report-button"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CameraIcon, Users, MapPin, CheckCircle, Heart, ArrowRight, Shield, Zap, Globe } from "lucide-react"
import { CommunityImpact } from "./community-impact"

export function LandingHero() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3B18A] via-[#8f9c7d] to-[#588157] flex flex-col items-center justify-center px-4 md:pl-20 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-3/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1500"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white mb-6" role="banner">
            <Shield className="h-4 w-4" aria-hidden="true" />
            <span>Trusted by 10,000+ community members</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl">
            {t("landing.title")}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto drop-shadow-lg">
            {t("landing.subtitle")}
          </p>
        </div>

        {/* Enhanced Motivational Message */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto animate-bounce-subtle border border-white/10 shadow-xl" role="complementary">
          <div className="flex items-center justify-center gap-3">
            <Heart className="h-6 w-6 text-red-300 animate-pulse" aria-hidden="true" />
            <p className="text-white font-medium">Join thousands of community members making a difference</p>
            <Heart className="h-6 w-6 text-red-300 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center items-center">
          <ReportButton />
          <Button 
            className="px-8 py-4 bg-white text-[#3A4750] rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 civic-transition flex items-center gap-2"
            onClick={() => window.location.href = '/admin'}
            aria-label="Access admin panel"
          >
            Admin Access
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Enhanced Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-5xl mx-auto">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:bg-white/25 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl civic-transition group border border-white/10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md group-hover:shadow-lg transition-all duration-300 civic-transition">
              <CameraIcon className="text-[#3A4750] text-2xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-white text-xl">{t("landing.features.photo.title")}</h3>
            <p className="text-white/90">{t("landing.features.photo.description")}</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:bg-white/25 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl civic-transition group border border-white/10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md group-hover:shadow-lg transition-all duration-300 civic-transition">
              <MapPin className="text-[#3A4750] text-2xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-white text-xl">{t("landing.features.location.title")}</h3>
            <p className="text-white/90">{t("landing.features.location.description")}</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:bg-white/25 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl civic-transition group border border-white/10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md group-hover:shadow-lg transition-all duration-300 civic-transition">
              <CheckCircle className="text-[#3A4750] text-2xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-white text-xl">{t("landing.features.updates.title")}</h3>
            <p className="text-white/90">{t("landing.features.updates.description")}</p>
          </div>
        </div>

        {/* New Value Proposition Section */}
        <section className="pt-16 max-w-6xl mx-auto" aria-labelledby="why-choose-heading">
          <h2 id="why-choose-heading" className="text-3xl font-bold text-white text-center mb-12">Why Choose CivicPulse?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#588157] rounded-lg" aria-hidden="true">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Fast Response</h3>
              </div>
              <p className="text-white/80">Get your community issues addressed quickly with our streamlined reporting system.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#588157] rounded-lg" aria-hidden="true">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Secure & Private</h3>
              </div>
              <p className="text-white/80">Your reports are handled with the utmost security and privacy protection.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#588157] rounded-lg" aria-hidden="true">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Community Focused</h3>
              </div>
              <p className="text-white/80">Built by the community, for the community to improve your neighborhood.</p>
            </div>
          </div>
        </section>

        {/* Community Impact Stats */}
        <section className="pt-16 max-w-4xl mx-auto" aria-labelledby="community-impact-heading">
          <h2 id="community-impact-heading" className="text-2xl font-bold text-white text-center mb-8">Community Impact</h2>
          <CommunityImpact />
        </section>
      </div>
      
      {/* Custom styles for animations */}
    </div>
  )
}
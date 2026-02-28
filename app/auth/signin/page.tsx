"use client"

import { GlassBackground } from "@/components/auth/GlassBackground"
import { GlassCard } from "@/components/auth/GlassCard"
import { SignInForm } from "@/components/auth/SignInForm"

export default function SignInPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background */}
      <GlassBackground />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Glass Card Container - Centered */}
        <div className="w-full flex items-center justify-center flex-1">
          <GlassCard>
            <SignInForm />
          </GlassCard>
        </div>

        {/* Footer - Minimal and Elegant */}
        <div className="w-full flex items-center justify-center py-8">
          <div className="text-center space-y-1">
            <p className="text-white/40 text-xs font-medium tracking-wide">
              © 2026 JobTracker. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Accessibility: Reduce motion support */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}

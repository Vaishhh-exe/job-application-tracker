"use client"

import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
}

export function GlassCard({ children }: GlassCardProps) {
  return (
    <>
      <style>{`
        @keyframes slideUpFadeIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .glass-card {
          animation: slideUpFadeIn 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .glass-card-inner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
          pointer-events: none;
        }

        .glass-card-inner::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.5' numOctaves='2' type='fractalNoise'/%3E%3C/filter%3E%3Crect fill='%23fff' width='200' height='200' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
        }
      `}</style>

      <div className="relative w-full max-w-4xl">
        {/* Soft Radial Glow Behind Card */}
        <div
          className="absolute inset-0 -z-10 rounded-3xl"
          style={{
            background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Glass Card Container */}
        <div className="glass-card glass-card-inner relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-12 overflow-hidden">
          {children}
        </div>
      </div>
    </>
  )
}

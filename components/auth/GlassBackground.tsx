"use client"

export function GlassBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(30px, -30px);
          }
          66% {
            transform: translate(-20px, 20px);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(-30px, 30px);
          }
          66% {
            transform: translate(20px, -20px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-40px, 40px);
          }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 18s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
      `}</style>

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/signin-bg.jpg)',
        }}
      />

      {/* Dark Translucent Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />

      {/* Floating Gradient Blob 1 - Pink/Purple (Top Right) */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl animate-float"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(168, 85, 247, 0.4) 70%, rgba(168, 85, 247, 0) 100%)",
          top: "10%",
          right: "-5%",
        }}
      />

      {/* Floating Gradient Blob 2 - Blue/Cyan (Bottom Left) */}
      <div
        className="absolute w-80 h-80 rounded-full opacity-25 blur-3xl animate-float-reverse"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.6) 0%, rgba(6, 182, 212, 0.3) 70%, rgba(6, 182, 212, 0) 100%)",
          bottom: "10%",
          left: "-10%",
        }}
      />

      {/* Floating Gradient Blob 3 - Yellow/Amber (Center) */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl animate-float-slow"
        style={{
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.5) 0%, rgba(217, 119, 6, 0.2) 70%, rgba(217, 119, 6, 0) 100%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none" />
    </div>
  )
}

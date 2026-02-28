"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useSession } from "next-auth/react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200/50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Meridian
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {session?.user ? (
              <Link
                href="/applications"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Go to App
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex flex-col gap-4 p-4">
              <Link href="/" className="text-gray-600 font-medium hover:text-gray-900">
                Home
              </Link>
              <Link href="/pricing" className="text-gray-600 font-medium hover:text-gray-900">
                Pricing
              </Link>
              <a href="#features" className="text-gray-600 font-medium hover:text-gray-900">
                Features
              </a>
              <div className="border-t pt-4 flex flex-col gap-3">
                {session?.user ? (
                  <Link
                    href="/applications"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium text-center"
                  >
                    Go to App
                  </Link>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

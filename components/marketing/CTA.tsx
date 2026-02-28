"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
      <div className="max-w-4xl mx-auto text-center text-white space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold">Ready to simplify your job search?</h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Join thousands of job seekers using Meridian to organize, track, and ace their job search.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
        >
          Get Started for Free
          <ArrowRight size={20} />
        </Link>
        <p className="text-sm opacity-75">No credit card required. Start tracking immediately.</p>
      </div>
    </section>
  )
}

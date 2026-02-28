"use client"

import { Navbar } from "@/components/marketing/Navbar"
import { Footer } from "@/components/marketing/Footer"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { SessionProvider } from "next-auth/react"

const pricingTiers = [
  {
    name: "Starter",
    price: 0,
    period: "forever free",
    description: "Perfect for getting started with your job search",
    cta: "Get Started",
    ctaHref: "/auth/signup",
    highlighted: false,
    features: [
      { text: "Track up to 50 applications", included: true },
      { text: "Basic dashboard", included: true },
      { text: "Email reminders", included: true },
      { text: "Basic analytics", included: true },
      { text: "Unlimited applications", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Bulk import/export", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Professional",
    price: 49,
    period: "per month",
    description: "For serious job seekers who want all features",
    cta: "Start Free Trial",
    ctaHref: "/auth/signup",
    highlighted: true,
    features: [
      { text: "Unlimited applications", included: true },
      { text: "Basic dashboard", included: true },
      { text: "Email reminders", included: true },
      { text: "Basic analytics", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Bulk import/export", included: true },
      { text: "Priority support", included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <SessionProvider>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Header */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Pricing That Scales With You
            </h1>
            <p className="text-xl text-gray-600">
              Simple, transparent pricing. No hidden fees. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`rounded-2xl transition-all ${
                    tier.highlighted
                      ? "border-2 border-blue-600 shadow-xl scale-105"
                      : "border border-gray-200 hover:shadow-lg"
                  } p-8`}
                >
                  {/* Badge */}
                  {tier.highlighted && (
                    <div className="mb-4 inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  {/* Tier Name & Price */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tier.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-5xl font-bold text-gray-900">₹{tier.price}</span>
                      <span className="text-gray-600">{tier.period}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={tier.ctaHref}
                    className={`w-full py-3 font-semibold rounded-lg text-center block mb-8 transition-all ${
                      tier.highlighted
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                        : "border border-gray-900 text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tier.cta}
                  </Link>

                  {/* Features List */}
                  <div className="space-y-4">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check size={20} className="text-green-600 flex-shrink-0" />
                        ) : (
                          <X size={20} className="text-gray-300 flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included ? "text-gray-700" : "text-gray-400 line-through"
                          }
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold">Ready to simplify your job search?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                href="/"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </SessionProvider>
  )
}

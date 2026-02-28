"use client"

import Link from "next/link"
import { Check } from "lucide-react"

export function PricingPreview() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Simple Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for your job search
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Basic Plan */}
          <div className="p-8 border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-4">Perfect for your first job search</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">Free</span>
              </div>
            </div>

            <Link
              href="/auth/signup"
              className="w-full py-3 border border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center block mb-8"
            >
              Get Started
            </Link>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Track up to 50 applications</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Basic dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Email reminders</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Basic analytics</span>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="p-8 border-2 border-blue-600 rounded-2xl shadow-lg relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Recommended
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <p className="text-gray-600 mb-4">For serious job seekers</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">₹49</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
            </div>

            <Link
              href="/auth/signup"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all text-center block mb-8"
            >
              Start Free Trial
            </Link>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Unlimited applications</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Smart reminders</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Bulk import/export</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-gray-700">Priority support</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Full Pricing */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            View full pricing details →
          </Link>
        </div>
      </div>
    </section>
  )
}

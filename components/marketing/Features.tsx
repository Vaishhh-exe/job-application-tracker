"use client"

import { Kanban, BarChart3, Bell, Zap, Users, Lock } from "lucide-react"

const features = [
  {
    icon: Kanban,
    title: "Kanban Board",
    description: "Drag-and-drop organization for your applications across multiple pipeline stages.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights into your job search success rates and trends.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss a follow-up with intelligent reminder notifications.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Enterprise-grade security to protect your sensitive job data.",
    color: "from-red-500 to-red-600",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your job search like a pro
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-8 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-gray-300 transition-all hover:scale-105 group"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

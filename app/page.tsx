import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { PricingPreview } from "@/components/marketing/PricingPreview"
import { Footer } from "@/components/marketing/Footer"
import { SessionProvider } from "next-auth/react"

export const metadata = {
  title: "Meridian - Land Your Dream Job",
  description:
    "Simplify your job search with Meridian. Organize, track, and manage all your job applications in one beautiful dashboard.",
}

export default function HomePage() {
  return (
    <SessionProvider>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <PricingPreview />
      </main>
      <Footer />
    </SessionProvider>
  )
}

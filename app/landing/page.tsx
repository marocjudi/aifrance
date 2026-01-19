import HeroSection from '@/components/landing/HeroSection'
import ProblemSelector from '@/components/landing/ProblemSelector'
import TrustSection from '@/components/landing/TrustSection'
import PricingSection from '@/components/landing/PricingSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSelector />
      <TrustSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}

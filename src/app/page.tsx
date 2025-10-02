import { ModalProvider } from './LandingPageClient'
import AnimatedHeader from '../components/AnimatedHeader'
import AnimatedHero from '../components/AnimatedHero'
import AnimatedPainSection from '../components/AnimatedPainSection'
import AnimatedSolutionSection from '../components/AnimatedSolutionSection'
import AnimatedBenefitsSection from '../components/AnimatedBenefitsSection'
import AnimatedComparisonSection from '../components/AnimatedComparisonSection'
import AnimatedFinalCTA from '../components/AnimatedFinalCTA'

export default function Home() {
  return (
    <ModalProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#f1f4f6' }}>
        <AnimatedHeader />

        <AnimatedHero />

        <AnimatedPainSection />

        <AnimatedSolutionSection />

        <AnimatedBenefitsSection />

        <AnimatedComparisonSection />

        <AnimatedFinalCTA />

      </div>
    </ModalProvider>
  )
}
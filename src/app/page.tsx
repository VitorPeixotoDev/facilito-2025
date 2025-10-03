import { ModalProvider } from './LandingPageClient'
import AnimatedHeader from '../components/AnimatedHeader'
import AnimatedHero from '../components/AnimatedHero'
import AnimatedPainSection from '../components/AnimatedPainSection'
import AnimatedSolutionSection from '../components/AnimatedSolutionSection'
import AnimatedBenefitsSection from '../components/AnimatedBenefitsSection'
import AnimatedComparisonSection from '../components/AnimatedComparisonSection'
import AnimatedFinalCTA from '../components/AnimatedFinalCTA'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Se há um usuário autenticado, redirecionar para dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Se há parâmetros de autenticação na URL, processar
  const hasAuthParams = searchParams.code || searchParams.access_token

  if (hasAuthParams) {
    // Redirecionar para o callback para processar a autenticação
    const callbackUrl = new URL('/auth/callback', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

    // Preservar todos os parâmetros de query
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        callbackUrl.searchParams.set(key, Array.isArray(value) ? value[0] : value)
      }
    })

    redirect(callbackUrl.toString())
  }

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
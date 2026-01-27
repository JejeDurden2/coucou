import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Check,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Plan, PLAN_PRICING } from '@coucou-ia/shared';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { ProblemSection } from '@/components/features/landing/problem-section';
import { FeaturesSection } from '@/components/features/landing/features-section';
import { HowItWorksSection } from '@/components/features/landing/how-it-works-section';
import { DashboardMockup } from '@/components/landing/dashboard-mockup';
import { faqs } from '@/components/landing/faq-data';
import { FAQSection } from '@/components/landing/faq-section';
import { MidPageCTA } from '@/components/landing/mid-page-cta';

const plans = [
  {
    name: 'Free',
    price: PLAN_PRICING[Plan.FREE].price.toString(),
    description: PLAN_PRICING[Plan.FREE].description,
    features: PLAN_PRICING[Plan.FREE].features,
    cta: 'Commencer gratuitement',
    popular: false,
    reassurance: 'Commencer sans engagement',
  },
  {
    name: 'Solo',
    price: PLAN_PRICING[Plan.SOLO].price.toString(),
    description: PLAN_PRICING[Plan.SOLO].description,
    features: PLAN_PRICING[Plan.SOLO].features,
    cta: 'Choisir Solo',
    popular: true,
    reassurance: 'Annulable à tout moment',
  },
  {
    name: 'Pro',
    price: PLAN_PRICING[Plan.PRO].price.toString(),
    description: PLAN_PRICING[Plan.PRO].description,
    features: PLAN_PRICING[Plan.PRO].features,
    cta: 'Choisir Pro',
    popular: false,
    reassurance: 'Support prioritaire inclus',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 px-4 overflow-hidden grid-pattern lg:pt-32">
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left column - Text */}
              <div className="text-center lg:text-left">
                <Badge className="mb-6" variant="outline">
                  <Sparkles className="mr-1 size-3" aria-hidden="true" />
                  Nouveau : Support GPT-5.2 et Claude Opus 4.5
                </Badge>

                <h1 className="font-display text-4xl font-bold mb-6 text-balance md:text-5xl lg:text-6xl">
                  L&apos;outil <span className="text-primary">GEO</span> pour surveiller votre
                  visibilité IA
                </h1>

                <p className="text-lg text-muted-foreground mx-auto mb-8 max-w-lg text-pretty lg:mx-0 lg:text-xl">
                  Mesurez si <span className="text-foreground font-medium">ChatGPT</span> et{' '}
                  <span className="text-foreground font-medium">Claude</span> recommandent votre
                  marque — ou vos concurrents.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-start mb-6">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Analyser ma marque gratuitement
                      <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Sans carte bancaire · Résultat en 2 minutes · RGPD compliant
                </p>
              </div>

              {/* Right column - Dashboard Mockup */}
              <div>
                <DashboardMockup />
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Banner */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Conçu pour les équipes qui veulent prendre de l&apos;avance
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Rocket, label: 'Startups Tech' },
                { icon: Search, label: 'Experts SEO' },
                { icon: ShoppingBag, label: 'E-commerce' },
                { icon: Building2, label: 'Agences Marketing' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-muted-foreground"
                >
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <ProblemSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How it works */}
        <HowItWorksSection />

        {/* Mid-Page CTA */}
        <MidPageCTA />

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 scroll-mt-20">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4">Tarifs</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Un plan pour chaque besoin
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                Commencez gratuitement, évoluez selon vos besoins.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.popular
                      ? 'border-primary ring-1 ring-primary/20 relative order-first md:order-none'
                      : ''
                  }
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground border-primary shadow-sm">
                        Recommandé
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-display font-bold tabular-nums">
                        {plan.price}€
                      </span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-pretty">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="size-4 text-success" aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/register">{plan.cta}</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {plan.reassurance}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA Section */}
        <section className="bg-primary/5 border-t border-primary/10 py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Découvrez ce que l&apos;IA dit de votre marque
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Première analyse gratuite, sans carte bancaire.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">
                Analyser ma marque maintenant
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-zinc-800 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/">
                <Logo size="sm" />
              </Link>
              <p className="text-sm text-muted-foreground mt-2 text-pretty">
                Surveillez votre visibilité dans la recherche IA.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    CGU
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Coucou IA. Made in France 🇫🇷</p>
            <Badge variant="outline">
              <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
              RGPD
            </Badge>
          </div>
        </div>
      </footer>

      {/* JSON-LD Schema - Software Application */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Coucou IA',
            applicationCategory: 'BusinessApplication',
            description: 'Plateforme de surveillance de visibilité dans la recherche IA',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '127',
            },
          }),
        }}
      />
      {/* JSON-LD Schema - FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      {/* JSON-LD Schema - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Coucou IA',
            url: 'https://coucou-ia.com',
            logo: 'https://coucou-ia.com/logo.png',
            description:
              'Outil GEO français pour surveiller et améliorer la visibilité de votre marque dans ChatGPT et Claude.',
            foundingDate: '2024',
            sameAs: ['https://twitter.com/coucouia', 'https://linkedin.com/company/coucouia'],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              email: 'contact@coucou-ia.com',
              availableLanguage: ['French'],
            },
          }),
        }}
      />
    </div>
  );
}

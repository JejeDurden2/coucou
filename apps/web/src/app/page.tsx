import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  Check,
  Eye,
  Rocket,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Plan, PLAN_PRICING } from '@coucou-ia/shared';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { ProblemSection } from '@/components/features/landing/problem-section';
import { DashboardMockup } from '@/components/landing/dashboard-mockup';
import { MidPageCTA } from '@/components/landing/mid-page-cta';

const features = [
  {
    icon: Eye,
    title: 'Surveillance multi-plateformes',
    description:
      "Analysez vos mentions sur ChatGPT, Claude et Gemini. Découvrez si l'IA recommande votre marque.",
  },
  {
    icon: BarChart3,
    title: 'Benchmark concurrentiel',
    description:
      'Identifiez les marques qui vous devancent dans la recherche IA et leur fréquence.',
  },
  {
    icon: TrendingUp,
    title: 'Évolution de votre visibilité',
    description:
      "Visualisez l'évolution de votre score de visibilité au fil du temps avec des rapports détaillés.",
  },
];

const steps = [
  {
    number: '1',
    title: 'Configurez votre marque',
    description: 'Entrez le nom de votre marque et ses variantes pour une surveillance précise.',
  },
  {
    number: '2',
    title: 'Définissez vos prompts',
    description:
      "Créez les questions que vos clients posent à l'IA pour trouver vos produits/services.",
  },
  {
    number: '3',
    title: 'Analysez vos résultats',
    description:
      'Consultez votre score de visibilité et les recommandations pour améliorer votre présence.',
  },
];

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

const faqs = [
  {
    question: "Qu'est-ce que la visibilité IA ou GEO ?",
    answer:
      "Le GEO (Generative Engine Optimization) consiste à optimiser la présence de votre marque dans les réponses générées par les IA comme ChatGPT ou Claude. C'est le nouveau SEO pour l'ère de l'intelligence artificielle.",
  },
  {
    question: "Qu'est-ce que la recherche IA ?",
    answer:
      "La recherche IA désigne l'utilisation d'assistants conversationnels comme ChatGPT, Claude ou Gemini pour trouver des informations. Contrairement à Google qui affiche des liens, ces IA synthétisent l'information et recommandent directement des solutions.",
  },
  {
    question: 'Comment Coucou IA détecte les mentions de ma marque ?',
    answer:
      'Notre système interroge les principaux moteurs IA (ChatGPT, Claude) avec vos prompts personnalisés et analyse les réponses pour détecter si votre marque est citée, sa position dans les recommandations, et quels concurrents sont mentionnés.',
  },
  {
    question: 'Pourquoi est-ce important pour mon business ?',
    answer:
      "De plus en plus d'utilisateurs utilisent l'IA pour rechercher des produits et services. Si votre marque n'apparaît pas dans les réponses, vous perdez des clients potentiels. Coucou IA vous aide à mesurer et améliorer cette visibilité.",
  },
  {
    question: 'À quelle fréquence les analyses sont-elles effectuées ?',
    answer:
      'La fréquence dépend de votre plan : manuellement pour le plan gratuit, hebdomadairement pour Solo, et quotidiennement pour Pro. Vous pouvez aussi lancer des analyses manuelles à tout moment.',
  },
  {
    question: 'Comment améliorer ma visibilité dans les réponses IA ?',
    answer:
      'Plusieurs facteurs influencent la visibilité IA : la présence sur les sources citées par les LLM, la notoriété de marque, le SEO traditionnel, et la qualité du contenu. Nos rapports vous guident sur les axes prioritaires.',
  },
  {
    question: 'Quels moteurs IA sont supportés par Coucou IA ?',
    answer:
      "Nous supportons actuellement ChatGPT (OpenAI) et Claude (Anthropic), les deux leaders du marché. D'autres moteurs IA seront ajoutés prochainement (Gemini, Mistral, Llama).",
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

        {/* GEO Educational Section */}
        <section id="geo" className="py-20 px-4 scroll-mt-20">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <Badge className="mb-4">Le GEO expliqué</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Qu&apos;est-ce que le GEO ?
              </h2>
            </div>

            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-lg text-muted-foreground mb-6 text-pretty">
                Le <strong className="text-foreground">GEO (Generative Engine Optimization)</strong>{' '}
                est l&apos;optimisation de la visibilité de votre marque dans les réponses générées
                par les intelligences artificielles comme ChatGPT, Claude, Gemini ou Perplexity.
                C&apos;est l&apos;équivalent du SEO pour l&apos;ère de l&apos;IA conversationnelle.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-zinc-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">SEO traditionnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-pretty">
                      Optimise votre position dans les résultats de recherche Google.
                      L&apos;utilisateur voit une liste de liens et choisit lequel visiter.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">GEO (nouveau)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-pretty">
                      Optimise si et comment votre marque est mentionnée dans les réponses IA.
                      L&apos;utilisateur reçoit une recommandation directe.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-xl font-semibold mb-4 text-balance">
                Pourquoi le GEO est crucial en 2025
              </h3>

              <p className="text-muted-foreground mb-4 text-pretty">
                Les utilisateurs changent leur façon de chercher de l&apos;information. Au lieu de
                taper des mots-clés dans Google, ils posent des questions à ChatGPT : &quot;Quel est
                le meilleur outil pour gérer mes factures ?&quot;, &quot;Quelle marque de chaussures
                de running me recommandes-tu ?&quot;
              </p>

              <p className="text-muted-foreground mb-4 text-pretty">
                Si votre marque n&apos;apparaît pas dans ces réponses, vous êtes invisible pour une
                part croissante de vos clients potentiels. Les LLM ne fonctionnent pas comme Google
                : ils synthétisent l&apos;information et recommandent directement des solutions.
                Être cité en premier peut générer{' '}
                <strong className="text-foreground">+40% de conversions</strong>.
              </p>

              <h3 className="text-xl font-semibold mb-4 mt-8 text-balance">
                Comment améliorer votre GEO
              </h3>

              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-foreground">Mesurez votre visibilité actuelle</strong> —
                    Avant d&apos;optimiser, il faut savoir où vous en êtes. Coucou IA interroge les
                    LLM avec vos prompts métier.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-foreground">
                      Renforcez votre présence sur les sources citées
                    </strong>{' '}
                    — Les LLM puisent dans des sources indexées. Soyez présent sur Wikipedia, les
                    sites d&apos;autorité, et les annuaires de votre secteur.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-foreground">
                      Créez du contenu structuré et factuel
                    </strong>{' '}
                    — Les IA privilégient les informations claires, chiffrées et bien organisées.
                    Utilisez des listes, des tableaux comparatifs, des données vérifiables.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-foreground">Analysez vos concurrents</strong> —
                    Identifiez qui est cité à votre place et comprenez pourquoi. Coucou IA détecte
                    automatiquement les marques concurrentes mentionnées.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4">Fonctionnalités</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Tout ce qu&apos;il faut pour dominer le GEO
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                Coucou IA vous donne les outils pour comprendre et améliorer votre présence dans les
                réponses des intelligences artificielles.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="size-6 text-primary" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 bg-zinc-900/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4">Comment ça marche</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">3 étapes simples</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                Configurez votre surveillance en quelques minutes et commencez à suivre votre
                visibilité IA.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary tabular-nums">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-balance">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{step.description}</p>
                </div>
              ))}
              <div
                aria-hidden="true"
                className="hidden md:block absolute top-8 h-[2px] bg-zinc-700"
                style={{ left: 'calc(33.333% + 2rem)', right: 'calc(66.666% + 2rem)' }}
              />
              <div
                aria-hidden="true"
                className="hidden md:block absolute top-8 h-[2px] bg-zinc-700"
                style={{ left: 'calc(66.666% + 2rem)', right: 'calc(33.333% + 2rem)' }}
              />
            </div>
          </div>
        </section>

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
                      <Badge>Recommandé</Badge>
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
        <section id="faq" className="py-20 px-4 bg-zinc-900/50 scroll-mt-20">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <Badge className="mb-4">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Questions fréquentes
              </h2>
              <p className="text-muted-foreground text-pretty">
                Tout ce que vous devez savoir sur Coucou IA et la visibilité IA.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-pretty">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="rounded-3xl bg-primary/5 p-12 border border-primary/20">
              <Bot className="size-12 mx-auto mb-6 text-primary" aria-hidden="true" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Prêt à être visible par l&apos;IA ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-pretty">
                Rejoignez les 500+ marques qui utilisent Coucou IA pour surveiller et améliorer leur
                présence dans les réponses de ChatGPT et Claude.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Créer mon compte gratuitement
                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-pretty">
                Pas de carte bancaire requise. Annulable à tout moment.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/">
                <Logo size="sm" />
              </Link>
              <p className="text-sm text-muted-foreground mt-2 text-pretty">
                Surveillez et améliorez la visibilité de votre marque dans les réponses IA.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-balance">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-foreground">
                    FAQ
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
              <h4 className="font-medium mb-4 text-balance">Légal</h4>
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
            <p className="text-sm text-muted-foreground text-pretty">
              © 2026 Coucou IA. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://twitter.com/coucouia"
                className="text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </Link>
              <Link
                href="https://linkedin.com/company/coucou-ia"
                className="text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </Link>
            </div>
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

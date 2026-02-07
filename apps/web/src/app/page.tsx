import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { SocialProofBanner } from '@/components/landing/social-proof-banner';
import { ProblemSection } from '@/components/features/landing/problem-section';
import { FeaturesSection } from '@/components/features/landing/features-section';
import { HowItWorksSection } from '@/components/features/landing/how-it-works-section';
import { MidPageCTA } from '@/components/landing/mid-page-cta';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQSection } from '@/components/landing/faq-section';
import { FinalCTA } from '@/components/landing/final-cta';
import { SupportedEnginesSection } from '@/components/landing/supported-engines-section';
import { JsonLd } from '@/components/seo/json-ld';
import { faqs } from '@/components/landing/faq-data';

const SOFTWARE_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Coucou IA',
  applicationCategory: 'BusinessApplication',
  description: 'Plateforme de surveillance de visibilité dans la recherche IA',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: 'https://coucou-ia.com/#pricing',
      description: '1 marque, 2 prompts, analyse hebdomadaire sur Mistral',
    },
    {
      '@type': 'Offer',
      name: 'Solo',
      price: '39',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: 'https://coucou-ia.com/#pricing',
      description:
        '5 marques, 10 prompts par marque, analyses bi-hebdomadaires sur Mistral, ChatGPT et Claude',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '99',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: 'https://coucou-ia.com/#pricing',
      description: '15 marques, 50 prompts par marque, analyses quotidiennes, support prioritaire',
    },
  ],
};

const FAQ_SCHEMA = {
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
};

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Coucou IA',
  url: 'https://coucou-ia.com',
  logo: 'https://coucou-ia.com/logo.svg',
  description:
    'Outil GEO français pour surveiller et améliorer la visibilité de votre marque dans ChatGPT, Claude et Mistral.',
  foundingDate: '2024',
  sameAs: ['https://twitter.com/coucouia', 'https://linkedin.com/company/coucouia'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'contact@coucou-ia.com',
    availableLanguage: ['French'],
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main>
        <HeroSection />
        <SocialProofBanner />
        <ProblemSection />
        <FeaturesSection />
        <SupportedEnginesSection />
        <HowItWorksSection />
        <MidPageCTA />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <Footer />

      <JsonLd data={SOFTWARE_APP_SCHEMA} />
      <JsonLd data={FAQ_SCHEMA} />
      <JsonLd data={ORG_SCHEMA} />
    </div>
  );
}

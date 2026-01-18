import { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation - Coucou IA',
  description: 'Conditions générales d\'utilisation du service Coucou IA.',
};

export default function TermsPage(): React.ReactNode {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-zinc-800 py-4">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Conditions Générales d&apos;Utilisation</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <p className="text-muted-foreground">
            Dernière mise à jour : 18 janvier 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Objet</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;utilisation
              du service Coucou IA, plateforme de monitoring de visibilité de marque dans les réponses
              des intelligences artificielles génératives.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Acceptation des CGU</h2>
            <p className="text-muted-foreground">
              En créant un compte sur Coucou IA, vous acceptez sans réserve les présentes CGU
              ainsi que notre{' '}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                Politique de confidentialité
              </Link>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Description du service</h2>
            <p className="text-muted-foreground">Coucou IA permet de :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Configurer des prompts de recherche liés à votre marque</li>
              <li>Scanner les réponses de ChatGPT et Claude pour détecter les mentions de votre marque</li>
              <li>Suivre l&apos;évolution de votre score de visibilité IA</li>
              <li>Identifier les marques concurrentes citées par les IA</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Inscription et compte</h2>
            <p className="text-muted-foreground">
              Pour utiliser Coucou IA, vous devez créer un compte avec une adresse email valide.
              Vous êtes responsable de la confidentialité de vos identifiants et de toute activité
              sur votre compte.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Plans et tarification</h2>
            <p className="text-muted-foreground">
              Coucou IA propose plusieurs plans (Free, Solo, Pro) avec des fonctionnalités
              et limites différentes. Les tarifs sont indiqués en euros TTC sur la page{' '}
              <Link href="/#pricing" className="text-cyan-400 hover:underline">
                Tarifs
              </Link>.
            </p>
            <p className="text-muted-foreground">
              Les abonnements payants sont facturés mensuellement via Stripe. Vous pouvez
              annuler à tout moment depuis votre espace client.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Utilisation acceptable</h2>
            <p className="text-muted-foreground">Vous vous engagez à :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Utiliser le service conformément à sa destination</li>
              <li>Ne pas tenter de contourner les limites de votre plan</li>
              <li>Ne pas utiliser le service à des fins illégales</li>
              <li>Ne pas surcharger intentionnellement nos serveurs</li>
              <li>Respecter les conditions d&apos;utilisation d&apos;OpenAI et Anthropic</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              Coucou IA et son contenu (logo, interface, code) sont protégés par le droit
              de la propriété intellectuelle. Vous conservez la propriété de vos données
              (projets, prompts).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Limitation de responsabilité</h2>
            <p className="text-muted-foreground">
              Coucou IA est fourni &quot;en l&apos;état&quot;. Nous ne garantissons pas l&apos;exactitude
              des résultats de scan, qui dépendent des réponses des LLM tiers. Nous ne sommes
              pas responsables des décisions commerciales basées sur ces résultats.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Disponibilité du service</h2>
            <p className="text-muted-foreground">
              Nous nous efforçons d&apos;assurer une disponibilité maximale du service mais ne
              garantissons pas une disponibilité ininterrompue. Des maintenances peuvent
              être effectuées avec un préavis raisonnable.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. Résiliation</h2>
            <p className="text-muted-foreground">
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres.
              Nous nous réservons le droit de suspendre ou résilier votre compte en cas
              de violation des présentes CGU.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">11. Modification des CGU</h2>
            <p className="text-muted-foreground">
              Nous pouvons modifier ces CGU à tout moment. Les modifications significatives
              seront notifiées par email. La poursuite de l&apos;utilisation du service vaut
              acceptation des nouvelles CGU.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">12. Droit applicable</h2>
            <p className="text-muted-foreground">
              Les présentes CGU sont soumises au droit français. Tout litige sera soumis
              aux tribunaux compétents de Paris.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">13. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative aux présentes CGU :{' '}
              <a href="mailto:contact@coucou-ia.com" className="text-cyan-400 hover:underline">
                contact@coucou-ia.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

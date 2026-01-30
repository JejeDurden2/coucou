import { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Politique de confidentialité - Coucou IA',
  description: 'Politique de confidentialité et protection des données personnelles de Coucou IA.',
};

export default function PrivacyPage(): React.ReactNode {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-balance">Politique de confidentialité</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <p className="text-muted-foreground">Dernière mise à jour : 18 janvier 2026</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">1. Responsable du traitement</h2>
            <p className="text-muted-foreground">
              Coucou IA, société par actions simplifiée à associé unique (SASU) au capital de 500
              euros, immatriculée au RCS de Nice sous le numéro 100 498 070, dont le siège social
              est situé 460 Avenue de Pessicart, 06100 Nice, France.
              <br />
              Représentée par Monsieur Jérôme Desmares, Président.
              <br />
              Email : privacy@coucou-ia.com
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">2. Données collectées</h2>
            <p className="text-muted-foreground">Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>Données d&apos;identification :</strong> nom, adresse email
              </li>
              <li>
                <strong>Données de connexion :</strong> logs de connexion, tokens
                d&apos;authentification
              </li>
              <li>
                <strong>Données d&apos;utilisation :</strong> projets créés, requêtes configurées,
                résultats d&apos;analyses
              </li>
              <li>
                <strong>Données de facturation :</strong> identifiant client Stripe (les données
                bancaires sont gérées directement par Stripe)
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">3. Finalités du traitement</h2>
            <p className="text-muted-foreground">Vos données sont traitées pour :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Fournir et améliorer nos services de tracking de visibilité IA</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Traiter vos paiements via Stripe</li>
              <li>Vous envoyer des communications relatives à votre compte</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">4. Base légale du traitement</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>Exécution du contrat :</strong> fourniture des services
              </li>
              <li>
                <strong>Consentement :</strong> création de compte et acceptation des CGU
              </li>
              <li>
                <strong>Intérêt légitime :</strong> amélioration des services, sécurité
              </li>
              <li>
                <strong>Obligation légale :</strong> conservation des données de facturation
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">5. Destinataires des données</h2>
            <p className="text-muted-foreground">Vos données peuvent être partagées avec :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>Stripe :</strong> traitement des paiements (certifié PCI-DSS)
              </li>
              <li>
                <strong>OpenAI :</strong> exécution des analyses ChatGPT
              </li>
              <li>
                <strong>Anthropic :</strong> exécution des analyses Claude
              </li>
              <li>
                <strong>Hébergeurs :</strong> Railway (API), Vercel (Frontend), Neon (Base de
                données)
              </li>
            </ul>
            <p className="text-muted-foreground">
              Ces prestataires sont soumis à des accords de traitement des données (DPA) conformes
              au RGPD.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">6. Durée de conservation</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>Données de compte :</strong> durée de l&apos;abonnement + 3 ans
              </li>
              <li>
                <strong>Données d&apos;analyse :</strong> selon votre plan (30 jours à illimité)
              </li>
              <li>
                <strong>Données de facturation :</strong> 10 ans (obligation légale)
              </li>
              <li>
                <strong>Logs de connexion :</strong> 1 an
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">7. Vos droits</h2>
            <p className="text-muted-foreground">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>Droit d&apos;accès :</strong> obtenir une copie de vos données
              </li>
              <li>
                <strong>Droit de rectification :</strong> corriger vos données inexactes
              </li>
              <li>
                <strong>Droit à l&apos;effacement :</strong> supprimer votre compte et vos données
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> recevoir vos données dans un format
                structuré
              </li>
              <li>
                <strong>Droit d&apos;opposition :</strong> vous opposer à certains traitements
              </li>
              <li>
                <strong>Droit à la limitation :</strong> limiter le traitement de vos données
              </li>
            </ul>
            <p className="text-muted-foreground">
              Pour exercer ces droits, rendez-vous dans{' '}
              <Link href="/settings" className="text-primary hover:underline">
                Paramètres
              </Link>{' '}
              ou contactez-nous à privacy@coucou-ia.com.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">8. Sécurité</h2>
            <p className="text-muted-foreground">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
              protéger vos données : chiffrement des mots de passe (bcrypt), connexions HTTPS,
              tokens JWT à courte durée de vie, accès restreint aux données.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">9. Cookies</h2>
            <p className="text-muted-foreground">
              Nous utilisons uniquement des cookies essentiels au fonctionnement du service
              (authentification). Aucun cookie de tracking ou publicitaire n&apos;est utilisé.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">10. Transferts internationaux</h2>
            <p className="text-muted-foreground">
              Certains de nos prestataires (OpenAI, Anthropic, Stripe, Vercel, Railway, Neon) sont
              situés aux États-Unis. Ces transferts sont encadrés par des clauses contractuelles
              types (CCT) approuvées par la Commission européenne et/ou le Data Privacy Framework
              UE-USA.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">11. Contact et réclamation</h2>
            <p className="text-muted-foreground">
              Pour toute question relative à cette politique ou pour exercer vos droits :{' '}
              <a href="mailto:privacy@coucou-ia.com" className="text-primary hover:underline">
                privacy@coucou-ia.com
              </a>
            </p>
            <p className="text-muted-foreground">
              Vous pouvez également introduire une réclamation auprès de la CNIL :{' '}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.cnil.fr
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    "Mentions légales du site coucou-ia.com : informations sur l'éditeur, l'hébergeur, la propriété intellectuelle et la protection des données.",
  openGraph: {
    title: 'Mentions légales | Coucou IA',
    description:
      "Mentions légales du site coucou-ia.com : informations sur l'éditeur, l'hébergeur et la propriété intellectuelle.",
    type: 'website',
    url: 'https://coucou-ia.com/mentions-legales',
  },
  alternates: {
    canonical: 'https://coucou-ia.com/mentions-legales',
    languages: {
      fr: 'https://coucou-ia.com/mentions-legales',
      'x-default': 'https://coucou-ia.com/mentions-legales',
    },
  },
};

export default function MentionsLegalesPage(): React.ReactNode {
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
        <h1 className="text-3xl font-bold mb-8 text-balance">Mentions légales</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <p className="text-muted-foreground">En vigueur au 30 janvier 2026</p>
          <p className="text-muted-foreground">
            Conformément aux dispositions des Articles 6-III et 19 de la Loi n°2004-575 du 21 juin
            2004 pour la Confiance dans l&apos;économie numérique, dite L.C.E.N., il est porté à la
            connaissance des utilisateurs et visiteurs du site coucou-ia.com les présentes mentions
            légales.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">Article 1 – Éditeur du site</h2>
            <p className="text-muted-foreground">Le site coucou-ia.com est édité par :</p>
            <ul className="list-none text-muted-foreground space-y-1">
              <li>
                <strong>Dénomination sociale :</strong> Coucou IA
              </li>
              <li>
                <strong>Forme juridique :</strong> Société par actions simplifiée à associé unique
                (SASU)
              </li>
              <li>
                <strong>Capital social :</strong> 500,00 euros
              </li>
              <li>
                <strong>Siège social :</strong> 460 Avenue de Pessicart, 06100 Nice, France
              </li>
              <li>
                <strong>SIREN :</strong> 100 498 070
              </li>
              <li>
                <strong>RCS :</strong> Nice B 100 498 070
              </li>
              <li>
                <strong>Numéro de TVA intracommunautaire :</strong> FR83100498070
              </li>
              <li>
                <strong>Adresse e-mail :</strong>{' '}
                <a href="mailto:contact@coucou-ia.com" className="text-primary hover:underline">
                  contact@coucou-ia.com
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">
              Article 2 – Directeur de la publication
            </h2>
            <p className="text-muted-foreground">
              Le Directeur de la publication du site coucou-ia.com est Monsieur Jérôme Desmares, en
              sa qualité de Président de la société Coucou IA.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">Article 3 – Hébergeurs</h2>
            <p className="text-muted-foreground">Le site coucou-ia.com est hébergé par :</p>
            <div className="text-muted-foreground space-y-4">
              <div>
                <p className="font-medium text-foreground">Application web (front-end) :</p>
                <p>
                  Vercel Inc.
                  <br />
                  440 N Barranca Ave #4133
                  <br />
                  Covina, CA 91723, États-Unis
                  <br />
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://vercel.com
                  </a>
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Interface de programmation (API) :</p>
                <p>
                  Railway Corporation
                  <br />
                  548 Market St, PMB 68956
                  <br />
                  San Francisco, CA 94104, États-Unis
                  <br />
                  <a
                    href="https://railway.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://railway.app
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">Article 4 – Accès au site</h2>
            <p className="text-muted-foreground">
              Le site coucou-ia.com est accessible 24 heures sur 24 et 7 jours sur 7, sous réserve
              des opérations de maintenance et des pannes éventuelles. En cas d&apos;impossibilité
              d&apos;accès au site, Coucou IA s&apos;engage à faire son maximum afin de rétablir
              l&apos;accès et s&apos;efforcera de communiquer préalablement aux utilisateurs les
              dates et heures de l&apos;intervention. N&apos;étant soumise qu&apos;à une obligation
              de moyens, Coucou IA ne saurait être tenue pour responsable de tout dommage, quelle
              qu&apos;en soit la nature, résultant d&apos;une indisponibilité du site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">
              Article 5 – Propriété intellectuelle
            </h2>
            <p className="text-muted-foreground">
              L&apos;ensemble du contenu du site coucou-ia.com (textes, images, vidéos, logos,
              icônes, sons, logiciels, base de données, etc.) est protégé par le droit d&apos;auteur
              et le droit des marques, conformément aux dispositions du Code de la propriété
              intellectuelle. Toute reproduction, représentation, modification, publication,
              transmission, dénaturation, totale ou partielle du site ou de son contenu, par quelque
              procédé que ce soit, et sur quelque support que ce soit, est interdite sans
              l&apos;autorisation écrite préalable de Coucou IA. Toute exploitation non autorisée du
              site ou de son contenu serait constitutive d&apos;une contrefaçon sanctionnée par les
              articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">
              Article 6 – Protection des données personnelles
            </h2>
            <p className="text-muted-foreground">
              Conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27
              avril 2016 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée relative à
              l&apos;informatique, aux fichiers et aux libertés, Coucou IA s&apos;engage à assurer
              la protection des données personnelles collectées sur le site coucou-ia.com.
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li>
                <strong>Responsable du traitement :</strong> Coucou IA, représentée par Monsieur
                Jérôme Desmares.
              </li>
              <li>
                <strong>Finalités du traitement :</strong> Les données collectées sont destinées à
                la gestion des demandes de contact, à la fourniture des services proposés et, le cas
                échéant, à l&apos;envoi d&apos;informations commerciales avec le consentement
                préalable de l&apos;utilisateur.
              </li>
              <li>
                <strong>Droits des utilisateurs :</strong> Conformément à la réglementation en
                vigueur, vous disposez d&apos;un droit d&apos;accès, de rectification, de
                suppression, de limitation, de portabilité et d&apos;opposition au traitement de vos
                données personnelles. Vous pouvez exercer ces droits en adressant un courrier
                électronique à{' '}
                <a href="mailto:support@coucou-ia.com" className="text-primary hover:underline">
                  support@coucou-ia.com
                </a>{' '}
                ou par courrier postal à l&apos;adresse du siège social.
              </li>
              <li>
                <strong>Réclamation :</strong> En cas de réclamation, vous pouvez saisir la
                Commission Nationale de l&apos;Informatique et des Libertés (CNIL) :{' '}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.cnil.fr
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">Article 7 – Cookies</h2>
            <p className="text-muted-foreground">
              Le site coucou-ia.com peut être amené à utiliser des cookies. L&apos;utilisateur est
              informé que lors de ses visites sur le site, des cookies peuvent s&apos;installer
              automatiquement sur son logiciel de navigation. Un cookie est un élément qui ne permet
              pas d&apos;identifier l&apos;utilisateur mais sert à enregistrer des informations
              relatives à la navigation de celui-ci sur le site. L&apos;utilisateur peut désactiver
              les cookies par l&apos;intermédiaire des paramètres de son navigateur. Pour plus
              d&apos;informations sur les cookies et leur gestion, l&apos;utilisateur peut consulter
              le site de la CNIL :{' '}
              <a
                href="https://www.cnil.fr/fr/cookies-et-autres-traceurs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.cnil.fr/fr/cookies-et-autres-traceurs
              </a>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">
              Article 8 – Limitation de responsabilité
            </h2>
            <p className="text-muted-foreground">
              Coucou IA ne pourra être tenue responsable des dommages directs ou indirects causés au
              matériel de l&apos;utilisateur lors de l&apos;accès au site coucou-ia.com, résultant
              soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications
              techniques requises, soit de l&apos;apparition d&apos;un bug ou d&apos;une
              incompatibilité. Coucou IA ne pourra également être tenue responsable des dommages
              indirects consécutifs à l&apos;utilisation du site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-balance">
              Article 9 – Droit applicable et juridiction compétente
            </h2>
            <p className="text-muted-foreground">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, et
              à défaut de résolution amiable, les tribunaux français seront seuls compétents pour
              connaître de ce litige.
            </p>
          </section>

          <p className="text-muted-foreground text-sm border-t border-border pt-8 mt-8">
            Dernière mise à jour : 30 janvier 2026
          </p>

          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-primary hover:underline">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="text-primary hover:underline">
              Conditions générales
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

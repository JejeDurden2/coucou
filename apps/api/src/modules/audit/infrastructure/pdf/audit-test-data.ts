import type { AuditAnalysis } from '@coucou-ia/shared';

export const testAuditAnalysis: AuditAnalysis = {
  executiveSummary: {
    headline:
      'Votre présence en ligne manque de visibilité face aux moteurs IA',
    context:
      "Menuiserie Dubois dispose d'un site web fonctionnel mais insuffisamment optimisé pour être référencé par les moteurs de recherche basés sur l'IA (ChatGPT, Perplexity, Google AI Overviews). Les données structurées sont quasi absentes, le contenu manque de profondeur sémantique et la présence sur les plateformes tierces reste très limitée.",
    keyFindings: [
      "Absence totale de données structurées (Schema.org) sur l'ensemble du site, ce qui empêche les IA de comprendre votre activité.",
      'Présence externe très faible : aucune page Wikipedia, absent des Pages Jaunes et de Crunchbase, seulement 2 mentions presse.',
      "Le contenu des pages services manque de profondeur : descriptions trop courtes, pas de FAQ, pas de témoignages intégrés.",
    ],
    verdict: 'insuffisante',
  },

  geoScore: {
    overall: 42,
    structure: 55,
    content: 38,
    technical: 62,
    externalPresence: 22,
    structureExplanation:
      "La structure du site est correcte avec une navigation claire, mais les données structurées Schema.org sont absentes. Les balises Hn sont utilisées de manière incohérente sur plusieurs pages, ce qui nuit à la compréhension sémantique par les IA.",
    contentExplanation:
      "Le contenu est trop succinct sur les pages services (moins de 300 mots en moyenne). Il manque des éléments de preuve sociale, des FAQ détaillées et du contenu expert qui permettrait aux IA de vous identifier comme une référence dans votre domaine.",
    technicalExplanation:
      "Les performances techniques sont correctes : temps de chargement acceptable, site responsive, HTTPS activé. Cependant, le sitemap XML est incomplet et le fichier robots.txt ne référence pas le sitemap, ce qui limite le crawl par les IA.",
    externalPresenceExplanation:
      "Votre présence sur les plateformes tierces est très insuffisante. L'absence de page Wikipedia et de profil sur les annuaires clés prive les IA de sources de corroboration. Seuls Google Business et Trustpilot apportent des signaux positifs.",
  },

  siteAudit: {
    pages: [
      {
        url: 'https://menuiserie-dubois.fr/',
        type: 'homepage',
        strengths: [
          'Temps de chargement rapide (1.2s)',
          'Design professionnel et responsive',
        ],
        findings: [
          {
            category: 'structure',
            severity: 'critical',
            title: 'Aucune donnée structurée Schema.org',
            detail:
              "La page d'accueil ne contient aucun balisage JSON-LD. Les IA ne peuvent pas identifier votre entreprise, vos services ni votre zone géographique.",
            recommendation:
              'Ajouter un schema LocalBusiness avec les informations complètes : nom, adresse, téléphone, horaires, zone desservie et services proposés.',
          },
          {
            category: 'content',
            severity: 'critical',
            title: 'Contenu trop générique et peu différenciant',
            detail:
              "Le texte de la page d'accueil est constitué de phrases génériques (\"artisan passionné\", \"savoir-faire unique\") sans mention de spécialités concrètes, de chiffres ou de réalisations.",
            recommendation:
              'Réécrire le contenu en intégrant des données factuelles : nombre de réalisations, années d\'expérience, certifications, spécialités techniques (ex: "Plus de 450 cuisines sur mesure installées depuis 2008").',
          },
          {
            category: 'technical',
            severity: 'warning',
            title: 'Balises meta description absentes ou dupliquées',
            detail:
              "La meta description de la page d'accueil est identique à celle de la page À propos, ce qui crée de la confusion pour les moteurs de recherche et les IA.",
            recommendation:
              'Rédiger une meta description unique et descriptive pour chaque page, incluant les mots-clés principaux et la proposition de valeur.',
          },
        ],
      },
      {
        url: 'https://menuiserie-dubois.fr/a-propos',
        type: 'about',
        strengths: [
          "Historique de l'entreprise bien raconté avec des dates clés",
        ],
        findings: [
          {
            category: 'content',
            severity: 'info',
            title: 'Pas de certifications ni labels mentionnés',
            detail:
              "La page ne mentionne aucune certification professionnelle (RGE, Qualibat) ni label, alors que ces éléments sont des signaux de confiance importants pour les IA.",
            recommendation:
              'Ajouter une section dédiée aux certifications et labels avec les logos correspondants.',
          },
        ],
      },
      {
        url: 'https://menuiserie-dubois.fr/cuisines-sur-mesure',
        type: 'service',
        strengths: ['Galerie photo de qualité avec 12 réalisations'],
        findings: [
          {
            category: 'structure',
            severity: 'critical',
            title: 'Pas de FAQ sur la page service',
            detail:
              "Aucune section FAQ n'est présente alors que les IA utilisent massivement les questions-réponses pour générer des recommandations.",
            recommendation:
              'Ajouter une FAQ de 5-8 questions couvrant les prix, délais, matériaux, processus de commande et garanties.',
          },
          {
            category: 'content',
            severity: 'warning',
            title: 'Description du service insuffisante',
            detail:
              "La description du service cuisines sur mesure fait seulement 150 mots. C'est insuffisant pour que les IA comprennent l'étendue de votre offre.",
            recommendation:
              'Développer le contenu à 600-800 mots minimum en détaillant les étapes du projet, les matériaux utilisés, les styles proposés et les fourchettes de prix.',
          },
        ],
      },
      {
        url: 'https://menuiserie-dubois.fr/escaliers-bois',
        type: 'service',
        strengths: ['Témoignage client intégré à la page'],
        findings: [
          {
            category: 'content',
            severity: 'warning',
            title: 'Un seul témoignage présent',
            detail:
              "La page ne contient qu'un seul témoignage client, ce qui est insuffisant pour établir une preuve sociale convaincante.",
            recommendation:
              'Intégrer 3-5 témoignages clients avec prénom, ville et type de projet réalisé. Utiliser le balisage Review Schema.',
          },
          {
            category: 'technical',
            severity: 'info',
            title: 'Images sans attribut alt descriptif',
            detail:
              "Les images de la galerie utilisent des alt génériques (\"photo-1\", \"photo-2\") au lieu de descriptions contextuelles.",
            recommendation:
              'Rédiger des attributs alt descriptifs incluant le type de réalisation et les matériaux (ex: "Escalier hélicoïdal en chêne massif avec garde-corps en verre").',
          },
        ],
      },
      {
        url: 'https://menuiserie-dubois.fr/renovation-parquet',
        type: 'service',
        strengths: [],
        findings: [
          {
            category: 'structure',
            severity: 'critical',
            title: 'Page très pauvre en contenu structuré',
            detail:
              "La page ne contient qu'un paragraphe de 80 mots, aucune liste, aucun sous-titre, aucun visuel. Les IA ignorent ce type de page faute de substance.",
            recommendation:
              'Restructurer la page avec des sous-sections (types de parquets, techniques de rénovation, tarifs indicatifs), ajouter des visuels avant/après et une FAQ.',
          },
        ],
      },
      {
        url: 'https://menuiserie-dubois.fr/blog/tendances-2025',
        type: 'blog',
        strengths: [
          'Article bien structuré avec des sous-titres pertinents',
        ],
        findings: [
          {
            category: 'content',
            severity: 'warning',
            title: 'Pas de liens internes vers les pages services',
            detail:
              "L'article mentionne plusieurs services proposés par l'entreprise mais ne contient aucun lien interne vers les pages correspondantes.",
            recommendation:
              'Ajouter 3-5 liens contextuels vers les pages services concernées pour renforcer le maillage interne.',
          },
          {
            category: 'technical',
            severity: 'info',
            title: 'Article non balisé en Article Schema',
            detail:
              "L'article de blog n'utilise pas le balisage Article/BlogPosting de Schema.org.",
            recommendation:
              'Ajouter le balisage BlogPosting avec auteur, date de publication, image et description.',
          },
        ],
      },
      {
        url: 'https://menuiserie-dubois.fr/blog/entretien-bois',
        type: 'blog',
        strengths: [
          'Contenu expert de qualité avec des conseils pratiques',
          'Bon maillage avec des produits recommandés',
        ],
        findings: [
          {
            category: 'content',
            severity: 'info',
            title: 'Pas de mise à jour depuis 18 mois',
            detail:
              "L'article date de septembre 2024. Les IA privilégient le contenu récent, surtout pour les conseils pratiques.",
            recommendation:
              "Mettre à jour l'article avec les nouvelles tendances et produits, et modifier la date de dernière mise à jour.",
          },
        ],
      },
      {
        url: 'https://menuiserie-dubois.fr/faq',
        type: 'faq',
        strengths: ['12 questions couvrant les sujets essentiels'],
        findings: [
          {
            category: 'structure',
            severity: 'warning',
            title: 'FAQ non balisée en FAQPage Schema',
            detail:
              'La page FAQ existe mais ne contient pas le balisage FAQPage de Schema.org, ce qui empêche les IA d\'identifier directement les questions-réponses.',
            recommendation:
              'Ajouter le balisage FAQPage Schema.org sur chaque paire question-réponse pour maximiser les chances d\'apparaître dans les résultats enrichis.',
          },
        ],
      },
    ],
    globalFindings: [
      {
        category: 'structure',
        severity: 'critical',
        title: 'Aucune donnée structurée sur l\'ensemble du site',
        detail:
          'Le site ne contient aucun balisage Schema.org (LocalBusiness, Service, FAQ, Article, Review). C\'est le facteur le plus pénalisant pour la visibilité auprès des IA.',
        recommendation:
          'Implémenter un plan de balisage Schema.org complet : LocalBusiness sur toutes les pages, Service sur les pages dédiées, FAQPage sur la FAQ, BlogPosting sur les articles.',
      },
      {
        category: 'content',
        severity: 'warning',
        title: 'Manque de contenu expert et de preuve sociale',
        detail:
          'Le site manque globalement de contenu approfondi, de cas clients détaillés et de témoignages. Les IA privilégient les sources qui démontrent une expertise avérée.',
        recommendation:
          'Créer une stratégie de contenu incluant des études de cas détaillées, des guides techniques et des témoignages structurés sur chaque page service.',
      },
      {
        category: 'technical',
        severity: 'info',
        title: 'Sitemap XML incomplet',
        detail:
          'Le sitemap.xml ne référence que 6 pages sur les 12 existantes. Les pages blog et la FAQ sont absentes du sitemap.',
        recommendation:
          'Mettre à jour le sitemap.xml pour inclure toutes les pages du site et le référencer dans le fichier robots.txt.',
      },
    ],
  },

  externalPresence: {
    score: 22,
    platforms: [
      {
        platform: 'Wikipedia',
        found: false,
        status: 'Aucune page dédiée',
        impact: 'high',
        recommendation:
          "Créer une ébauche d'article Wikipedia avec des sources vérifiables (articles de presse, récompenses, historique de l'entreprise).",
      },
      {
        platform: 'Trustpilot',
        found: true,
        status: '4.2/5 — 128 avis',
        impact: 'high',
        recommendation:
          'Continuer à collecter des avis et répondre systématiquement aux avis négatifs. Viser 200 avis pour renforcer la crédibilité.',
      },
      {
        platform: 'Google Business Profile',
        found: true,
        status: '4.5/5 — 340 avis',
        impact: 'high',
        recommendation:
          'Excellent score. Maintenir le rythme de collecte et publier des Google Posts régulièrement pour maintenir l\'activité du profil.',
      },
      {
        platform: 'LinkedIn',
        found: true,
        status: 'Page entreprise — 2 400 abonnés',
        impact: 'medium',
        recommendation:
          'Publier du contenu régulier (1-2 posts/semaine) pour augmenter l\'engagement et la visibilité de la page.',
      },
      {
        platform: 'Pages Jaunes',
        found: false,
        status: 'Non référencé',
        impact: 'medium',
        recommendation:
          'Créer une fiche complète sur Pages Jaunes avec photos, description détaillée et lien vers le site web.',
      },
      {
        platform: 'Société.com',
        found: true,
        status: 'Fiche présente, informations à jour',
        impact: 'low',
        recommendation:
          'Fiche à jour. Vérifier périodiquement que les informations restent correctes.',
      },
      {
        platform: 'Crunchbase',
        found: false,
        status: 'Aucun profil',
        impact: 'low',
        recommendation:
          'Créer un profil Crunchbase avec les informations de l\'entreprise, le secteur d\'activité et les chiffres clés.',
      },
      {
        platform: 'Presse en ligne',
        found: true,
        status: '2 mentions dans la presse locale',
        impact: 'medium',
        recommendation:
          'Développer une stratégie RP locale : communiqués de presse pour les projets remarquables, partenariats avec les médias régionaux.',
      },
    ],
    summary:
      "La présence externe de Menuiserie Dubois est très limitée. Seuls Google Business Profile et Trustpilot fournissent des signaux positifs aux IA. L'absence de page Wikipedia et de référencement sur les annuaires clés est un handicap majeur.",
    gaps: [
      'Aucune page Wikipedia',
      'Absent des Pages Jaunes',
      'Pas de profil Crunchbase',
    ],
  },

  competitorBenchmark: {
    competitors: [
      {
        name: 'Atelier Boisé',
        domain: 'atelier-boise.fr',
        estimatedGeoScore: 68,
        factualData: {
          hasSchemaOrg: true,
          hasFAQSchema: true,
          hasAuthorInfo: true,
          wikipediaFound: true,
          trustpilotRating: 4.8,
          trustpilotReviewCount: 450,
          citationRate: 0.65,
        },
        strengths: [
          'Balisage Schema.org complet (LocalBusiness, Service, FAQ)',
          'Blog actif avec 2-3 articles par mois',
          'Page Wikipedia existante avec sources vérifiables',
          '15 études de cas détaillées avec photos avant/après',
        ],
        clientGaps: [
          'Données structurées absentes chez Menuiserie Dubois',
          'Fréquence de publication blog beaucoup plus faible',
          'Pas de page Wikipedia contrairement au concurrent',
        ],
        externalPresenceAdvantage: [
          'Page Wikipedia avec 8 sources',
          'Profil Crunchbase actif',
          'Présent sur Pages Jaunes avec fiche premium',
        ],
      },
      {
        name: 'Menuiserie Martin',
        domain: 'menuiserie-martin.fr',
        estimatedGeoScore: 55,
        factualData: {
          hasSchemaOrg: true,
          hasFAQSchema: true,
          hasAuthorInfo: false,
          wikipediaFound: false,
          trustpilotRating: 3.9,
          trustpilotReviewCount: 85,
          citationRate: 0.35,
        },
        strengths: [
          'Présence active sur 6 plateformes externes',
          'Contenu service détaillé avec FAQ intégrées',
          '380 avis Google avec réponses systématiques',
        ],
        clientGaps: [
          'Contenu services moins détaillé chez Menuiserie Dubois',
          'Moins d\'avis Google et taux de réponse plus faible',
        ],
        externalPresenceAdvantage: [
          'Présent sur Pages Jaunes et Houzz',
          'Mentionné dans 5 articles de presse',
          'Profil LinkedIn plus actif (3 posts/semaine)',
        ],
      },
    ],
    clientFactualData: {
      hasSchemaOrg: false,
      hasFAQSchema: false,
      hasAuthorInfo: false,
      wikipediaFound: false,
      trustpilotRating: 4.2,
      trustpilotReviewCount: 128,
      citationRate: 0.35,
    },
    summary:
      "Menuiserie Dubois est en retard sur ses deux principaux concurrents. Atelier Boisé domine grâce à une stratégie de contenu structuré et une présence Wikipedia. Menuiserie Martin compense un contenu moyen par une forte présence sur les plateformes tierces. Le principal levier d'amélioration pour Menuiserie Dubois est l'implémentation des données structurées et le renforcement de la présence externe.",
    keyGaps: [
      'Données structurées Schema.org inexistantes (vs. complètes chez Atelier Boisé)',
      'Aucune page Wikipedia (vs. page existante chez Atelier Boisé)',
      'Présence limitée à 4 plateformes (vs. 6-8 chez les concurrents)',
    ],
  },

  actionPlan: {
    quickWins: [
      {
        title: 'Ajouter le balisage LocalBusiness Schema.org',
        description:
          "Implémenter le JSON-LD LocalBusiness sur toutes les pages du site avec nom, adresse, téléphone, horaires d'ouverture et zone desservie.",
        targetUrl: 'https://menuiserie-dubois.fr/',
        impact: 5,
        effort: 1,
        category: 'structure',
      },
      {
        title: 'Baliser la FAQ en FAQPage Schema',
        description:
          'Ajouter le balisage FAQPage Schema.org sur la page FAQ existante pour que les IA puissent extraire directement les questions-réponses.',
        targetUrl: 'https://menuiserie-dubois.fr/faq',
        impact: 4,
        effort: 1,
        category: 'structure',
      },
      {
        title: 'Corriger les meta descriptions dupliquées',
        description:
          'Rédiger une meta description unique pour chaque page du site, incluant les mots-clés principaux et la proposition de valeur spécifique.',
        targetUrl: null,
        impact: 4,
        effort: 1,
        category: 'technical',
      },
      {
        title: 'Créer une fiche Pages Jaunes',
        description:
          'Créer une fiche complète sur Pages Jaunes avec photos, description détaillée des services, horaires et lien vers le site web.',
        targetUrl: null,
        impact: 4,
        effort: 2,
        category: 'external_presence',
      },
    ],
    shortTerm: [
      {
        title: 'Enrichir le contenu de la page Cuisines sur mesure',
        description:
          'Développer le contenu à 600-800 mots avec détails sur les étapes du projet, matériaux, styles proposés et fourchettes de prix. Ajouter une FAQ de 5-8 questions.',
        targetUrl: 'https://menuiserie-dubois.fr/cuisines-sur-mesure',
        impact: 4,
        effort: 2,
        category: 'content',
      },
      {
        title: 'Refondre la page Rénovation parquet',
        description:
          'Restructurer complètement la page avec sous-sections, visuels avant/après, FAQ et au moins 500 mots de contenu expert.',
        targetUrl: 'https://menuiserie-dubois.fr/renovation-parquet',
        impact: 4,
        effort: 3,
        category: 'content',
      },
      {
        title: 'Ajouter le balisage Service Schema sur les pages dédiées',
        description:
          'Implémenter le JSON-LD Service sur chaque page service avec description, zone géographique et fourchette de prix.',
        targetUrl: null,
        impact: 3,
        effort: 2,
        category: 'structure',
      },
      {
        title: 'Intégrer 3-5 témoignages clients par page service',
        description:
          'Collecter et intégrer des témoignages clients avec prénom, ville et type de projet. Utiliser le balisage Review Schema.',
        targetUrl: null,
        impact: 3,
        effort: 3,
        category: 'content',
      },
      {
        title: 'Mettre à jour le sitemap XML',
        description:
          'Inclure toutes les pages du site dans le sitemap.xml (y compris blog et FAQ) et le référencer dans robots.txt.',
        targetUrl: null,
        impact: 3,
        effort: 1,
        category: 'technical',
      },
      {
        title: 'Optimiser les attributs alt des images',
        description:
          'Rédiger des attributs alt descriptifs pour toutes les images du site, incluant le type de réalisation et les matériaux.',
        targetUrl: null,
        impact: 3,
        effort: 2,
        category: 'technical',
      },
    ],
    mediumTerm: [
      {
        title: 'Créer 5 études de cas détaillées',
        description:
          'Rédiger des études de cas complètes avec contexte client, problématique, solution, photos avant/après et témoignage. Cibler les projets les plus représentatifs.',
        targetUrl: null,
        impact: 5,
        effort: 4,
        category: 'content',
      },
      {
        title: 'Développer une stratégie de contenu blog',
        description:
          'Planifier et publier 2 articles par mois couvrant les tendances, guides techniques et conseils pratiques. Chaque article doit être balisé en BlogPosting Schema.',
        targetUrl: null,
        impact: 4,
        effort: 4,
        category: 'content',
      },
      {
        title: 'Travailler la présence Wikipedia',
        description:
          "Rassembler les sources vérifiables (articles de presse, récompenses, historique) et proposer une ébauche d'article Wikipedia respectant les critères d'admissibilité.",
        targetUrl: null,
        impact: 5,
        effort: 5,
        category: 'external_presence',
      },
      {
        title: 'Mettre en place une stratégie RP locale',
        description:
          'Développer des relations avec les médias régionaux : communiqués de presse pour les projets remarquables, interviews, partenariats éditoriaux.',
        targetUrl: null,
        impact: 3,
        effort: 4,
        category: 'external_presence',
      },
      {
        title: 'Créer des profils sur les plateformes manquantes',
        description:
          'Créer et optimiser les profils sur Crunchbase et Houzz avec des informations complètes, photos et liens vers le site.',
        targetUrl: null,
        impact: 3,
        effort: 3,
        category: 'external_presence',
      },
    ],
    totalActions: 15,
  },
};

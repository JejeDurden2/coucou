# Frontend Architecture - React

This document describes the **actual** frontend architecture as implemented in `/apps/web`.

---

## Tech Stack

- **Framework**: Next.js 16.1 (App Router) + React 19
- **State Management**: TanStack Query v5 (server state) + React Context (auth)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Forms**: Vanilla React state + manual validation (no form library)
- **Notifications**: Sonner toasts
- **Charts**: Recharts
- **Validation**: Zod (API layer only)
- **Language**: French-first UI

---

## Folder Structure

```
apps/web/src/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Auth layout group (no nav)
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/              # Protected dashboard layout group
│   │   ├── projects/[id]/        # Main project dashboard (600+ lines)
│   │   ├── projects/new/
│   │   ├── billing/
│   │   ├── settings/
│   │   └── onboarding/
│   ├── (legal)/                  # Legal pages
│   ├── auth/callback/            # OAuth callback
│   ├── blog/[slug]/              # Dynamic blog
│   ├── lexique/[slug]/           # Dynamic glossary
│   ├── geo-pour/[slug]/          # Dynamic persona pages
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (GTM, AuthProvider)
│   ├── providers.tsx             # QueryClientProvider wrapper
│   ├── globals.css               # Tailwind + CSS variables
│   ├── sitemap.ts                # Dynamic sitemap generation
│   └── robots.ts                 # Search engine directives
│
├── components/
│   ├── ui/                       # shadcn/ui base (25 components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── kpi-card.tsx          # Custom KPI card
│   │   ├── insight-card.tsx      # Custom insight card
│   │   ├── password-input.tsx    # Custom password input
│   │   ├── pulsing-dot.tsx       # Loading indicator
│   │   └── sparkline.tsx         # Inline chart
│   ├── landing/                  # Landing page sections
│   ├── blog/                     # Blog components (post-card, post-content)
│   ├── lexique/                  # Glossary components
│   ├── geo-pour/                 # Persona components
│   ├── dashboard/                # Dashboard-specific UI
│   ├── layout/                   # Header, Footer
│   ├── features/                 # Feature-specific containers
│   │   ├── billing/              # Subscription UI, downgrade modal
│   │   ├── competitors/          # Competitor charts + tables
│   │   ├── dashboard/            # Dashboard KPIs, prompt tables
│   │   ├── recommendations/      # Recommendation cards
│   │   ├── settings/             # Delete account modal
│   │   ├── stats/                # Charts (citation rate, rank trend)
│   │   └── landing/              # Problem, how-it-works sections
│   ├── upgrade/                  # Upgrade modal + feature locking
│   └── seo/                      # JSON-LD helper component
│
├── features/                     # Feature domain modules
│   └── sentiment/                # Sentiment analysis feature
│       ├── components/           # Sentiment-specific UI
│       │   ├── sentiment-chart.tsx
│       │   ├── keywords-list.tsx
│       │   └── themes-badges.tsx
│       ├── lib/                  # Sentiment utilities
│       │   └── sentiment-variant.ts
│       └── index.ts              # Public API
│
├── hooks/                        # Custom React hooks (13 files)
│   ├── use-projects.ts           # useQuery + useMutation wrappers
│   ├── use-dashboard.ts
│   ├── use-user.ts
│   ├── use-billing.ts
│   ├── use-sentiment.ts
│   ├── use-scan-job-polling.ts   # Polling hook for job status
│   ├── use-onboarding.ts
│   ├── use-prompts.ts
│   ├── use-historical-stats.ts
│   ├── use-upgrade.ts
│   ├── use-support.ts
│   └── use-delete-account.ts
│
└── lib/                          # Core utilities (11 files)
    ├── api-client.ts             # Fetch wrapper with auto token refresh
    ├── auth-context.tsx          # Auth state (React Context)
    ├── query-provider.tsx        # TanStack Query config
    ├── blog.ts                   # Blog markdown parsing
    ├── glossary.ts               # Glossary utilities
    ├── geo-pour.ts               # Persona utilities
    ├── cross-links.ts            # Internal linking logic
    ├── format.ts                 # Date/number formatting
    ├── utils.ts                  # cn() utility
    ├── email-errors.ts           # Email validation errors
    └── podium-style.ts           # Ranking styles
```

**Key insight**: Uses Next.js route groups (parentheses) for layout isolation - auth pages have no nav, dashboard has sidebar.

---

## State Management

### Server State: TanStack Query v5

**Configuration** (`/lib/query-provider.tsx`):

```tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});
```

**Pattern**: Custom hooks wrap `useQuery` and `useMutation`:

```tsx
// hooks/use-projects.ts
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) => apiClient.createProject(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet créé', { description: `"${project.name}" créé.` });
    },
    onError: (error: ApiClientError) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}
```

**All mutations include**:

- Automatic cache invalidation
- Toast notifications (success + error)
- Optimistic updates where appropriate

---

### Client State: React Context

**Auth Context** (`/lib/auth-context.tsx`):

```tsx
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, acceptTerms: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}
```

**How it works**:

1. Wraps app in `<AuthProvider>` at root layout
2. `useEffect` calls `loadUser()` on mount
3. Attempts `getMe()`, falls back to `refreshToken()` on 401
4. Updates context state
5. Exposes `useAuth()` hook for components

**No Zustand** - React Context is sufficient for auth state.

---

### Upgrade Modal Context

Located in `/components/upgrade/`:

- Feature locking logic
- Upgrade modal state
- Usage tracking for locked features

---

### Notifications: Sonner

```tsx
// Toast usage
toast.success('Projet créé', { description: 'Mon Projet créé avec succès.' });
toast.error('Erreur', { description: error.message });
toast.warning('Attention', { description: '...' });
toast.info('Info', { description: '...' });
```

**Config** (in `layout.tsx`):

- Dark theme
- Position: top-right
- Custom styling with Tailwind

---

## API Client

### Structure (`/lib/api-client.ts`)

**Features**:

- Singleton instance: `apiClient`
- Automatic token refresh on 401
- Deduplication of concurrent refresh attempts
- Credentials included in all requests
- Custom error class: `ApiClientError`

```tsx
class ApiClientError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;
  private refreshPromise: Promise<void> | null = null;

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Important: sends cookies
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (response.status === 401) {
        await this.refreshToken();
        // Retry original request
        const retryResponse = await fetch(url, { ...options, credentials: 'include' });
        if (!retryResponse.ok) throw new Error();
        return retryResponse.json();
      }

      if (!response.ok) {
        const error = await response.json();
        throw new ApiClientError(error.message, response.status, error.code);
      }

      return response.json();
    } catch (error) {
      throw new ApiClientError('Une erreur est survenue', 500);
    }
  }

  private async refreshToken(): Promise<void> {
    // Deduplicate concurrent refresh attempts
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Refresh failed');
    })();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  // Auth endpoints
  login(email: string, password: string) { ... }
  register(email: string, password: string, name: string, acceptTerms: boolean) { ... }
  getMe() { ... }

  // Project endpoints
  getProjects() { ... }
  createProject(data: CreateProjectInput) { ... }

  // ... 30+ endpoint methods
}

export const apiClient = new ApiClient();
```

**All endpoints organized as methods**:

- `Auth`: login, register, getMe, updateProfile, deleteAccount
- `Projects`: getProjects, createProject, updateProject, deleteProject
- `Prompts`: getPrompts, createPrompt, updatePrompt, deletePrompt
- `Scans`: triggerScan, getScanJobStatus
- `Dashboard`: getDashboardStats, getRecommendations
- `Sentiment`: getLatestSentiment, getSentimentHistory
- `Billing`: getSubscription, createCheckout, downgradeSubscription

---

## Component Patterns

### shadcn/ui Base Components

Located in `/components/ui/` (25 files):

- **Form inputs**: `input.tsx`, `password-input.tsx`
- **Containers**: `card.tsx`, `dialog.tsx`, `accordion.tsx`
- **Selectors**: `dropdown-menu.tsx`, `tabs.tsx`, `switch.tsx`
- **Feedback**: `badge.tsx`, `alert-dialog.tsx`, `tooltip.tsx`
- **Data**: `table.tsx`, `sparkline.tsx`
- **Custom**: `kpi-card.tsx`, `insight-card.tsx`, `pulsing-dot.tsx`

**Style approach**: Radix UI primitives + Tailwind CSS + `cn()` utility

```tsx
// Example: Button component
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
```

---

### Feature Container Pattern

Located in `/components/features/`:

**Structure**:

- Large containers that orchestrate multiple smaller components
- All containers are `'use client'` (interactive)
- Fetch data via custom hooks
- Handle loading/error states
- Pass data down to child components

**Example**: `CompetitorsContainer`

```tsx
'use client';

export function CompetitorsContainer({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useCompetitors(projectId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <CompetitorChart data={data.chartData} />
      <CompetitorRankingTable competitors={data.rankings} />
      <UserRankingCard userRank={data.userRank} />
    </div>
  );
}
```

**Composition over inheritance** - no class components, only functional composition.

---

### Memoization Pattern

Uses `React.memo()` for expensive components:

```tsx
// features/sentiment/components/sentiment-chart.tsx
export const SentimentBentoCard = memo(function SentimentBentoCard({
  projectId,
}: {
  projectId: string;
}) {
  const { data, isLoading } = useSentiment(projectId);
  // ... render logic
});
```

**When to use**:

- KPI cards that render frequently
- Chart components with complex data
- Lists with many items

---

### Modal Pattern

Controlled via `useState`:

```tsx
// Usage in parent component
const [isOpen, setIsOpen] = useState(false);
const { mutate, isPending } = useCreatePrompt();

function handleSubmit(content: string, category?: PromptCategory) {
  mutate(
    { projectId, content, category },
    {
      onSuccess: () => setIsOpen(false),
    },
  );
}

return (
  <>
    <Button onClick={() => setIsOpen(true)}>Add Prompt</Button>
    <AddPromptModal
      open={isOpen}
      onOpenChange={setIsOpen}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  </>
);
```

**Modal component**:

```tsx
// components/features/dashboard/add-prompt-modal.tsx
interface AddPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string, category?: PromptCategory) => void;
  isPending: boolean;
}

export function AddPromptModal({ open, onOpenChange, onSubmit, isPending }: AddPromptModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PromptCategory>();

  const isValidLength = content.length >= MIN_CHARS && content.length <= MAX_CHARS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidLength || isPending) return;
    await onSubmit(content.trim(), category);
    setContent('');
    setCategory(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <Button type="submit" disabled={!isValidLength || isPending}>
            {isPending ? 'Ajout en cours...' : 'Ajouter'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Forms - Vanilla React Pattern

**No form library** (React Hook Form, Formik, etc.) - uses vanilla React state + manual validation.

### Login/Register Form Pattern

```tsx
'use client';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Error state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    // Manual validation
    let hasFieldError = false;

    if (!email.trim()) {
      setEmailError('Veuillez saisir votre adresse email.');
      hasFieldError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("L'adresse email n'est pas valide.");
      hasFieldError = true;
    }

    if (!password) {
      setPasswordError('Veuillez saisir votre mot de passe.');
      hasFieldError = true;
    }

    if (hasFieldError) return;

    try {
      setIsLoading(true);
      await login(email, password);
      router.push('/projects');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(''); // Clear error on change
          }}
          placeholder="Email"
        />
        {emailError && <p className="text-sm text-destructive">{emailError}</p>}
      </div>

      <div>
        <PasswordInput
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
          placeholder="Mot de passe"
        />
        {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  );
}
```

### Dialog Form Pattern

```tsx
// Character counting validation
const MIN_CHARS = 10;
const MAX_CHARS = 500;

const [content, setContent] = useState('');
const isValidLength = content.length >= MIN_CHARS && content.length <= MAX_CHARS;

<Textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  placeholder="Décrivez votre prompt..."
/>
<p className="text-sm text-muted-foreground">
  {content.length}/{MAX_CHARS} caractères
</p>
<Button disabled={!isValidLength}>Ajouter</Button>
```

**Validation patterns**:

- Email: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Length: `value.length >= min && value.length <= max`
- Required: `!value.trim()`
- Custom: Function checks (e.g., password strength)

**Why no form library?**

- Simple forms (1-5 fields)
- Manual control preferred
- No complex validation schemas needed
- Lighter bundle size

---

## Authentication Flow

### 1. Initial Load

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**AuthProvider behavior**:

```tsx
// lib/auth-context.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (error) {
      // Attempt token refresh
      try {
        await apiClient.refreshToken();
        const userData = await apiClient.getMe();
        setUser(userData);
      } catch {
        setUser(null); // Logged out
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ... login, register, logout methods

  return <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, ... }}>{children}</AuthContext.Provider>;
}
```

### 2. Login/Register

- Direct API call via `login()` or `register()`
- Updates React Context state
- No token stored in localStorage (cookie-based via `credentials: 'include'`)
- Redirects to `/projects` on success

### 3. Token Refresh

- Automatic in API client on 401
- Deduplicates concurrent refresh attempts
- If refresh fails, user set to `null` (logged out)
- Retry original request after refresh

### 4. OAuth (Google)

- OAuth button: `/components/ui/google-button.tsx`
- Redirects to backend `/auth/google`
- Backend redirects to Google OAuth
- Callback: `/auth/callback` - sets cookie and redirects to `/projects`

### 5. Route Protection

- No visible middleware in code
- Dashboard pages are `'use client'` and likely check `useAuth().isAuthenticated`
- Redirect logic probably in individual pages or layout

---

## SEO Implementation

### 1. Metadata (Next.js built-in)

**Root layout** (`app/layout.tsx`):

```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://coucou-ia.com'),
  title: {
    default: 'Coucou IA - Suivi SEO pour moteurs de recherche IA',
    template: '%s | Coucou IA',
  },
  description: 'Optimisez votre visibilité sur ChatGPT, Claude et Perplexity...',
  keywords: ['SEO IA', 'GEO', 'ChatGPT SEO', ...],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://coucou-ia.com',
    siteName: 'Coucou IA',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Coucou IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@coucou_ia',
    creator: '@coucou_ia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
};
```

**Page-level overrides**:

```tsx
// app/blog/page.tsx
export const metadata: Metadata = {
  title: 'Blog GEO & Recherche IA',
  description: 'Articles sur le SEO pour moteurs IA...',
  openGraph: {
    title: 'Blog GEO',
    description: '...',
    images: [{ url: '/blog-og.png' }],
  },
  alternates: {
    canonical: 'https://coucou-ia.com/blog',
  },
};
```

### 2. JSON-LD Structured Data

**Component** (`components/seo/json-ld.tsx`):

```tsx
interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
```

**Usage**:

```tsx
// In page component
<JsonLd
  data={{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SEO pour ChatGPT',
    datePublished: '2024-01-15',
    author: {
      '@type': 'Person',
      name: 'Julien Demares',
    },
  }}
/>
```

### 3. Sitemap & Robots

**Sitemap** (`app/sitemap.ts`):

```tsx
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();
  const glossaryTerms = await getGlossaryTerms();

  return [
    {
      url: 'https://coucou-ia.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://coucou-ia.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `https://coucou-ia.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...glossaryTerms.map((term) => ({
      url: `https://coucou-ia.com/lexique/${term.slug}`,
      lastModified: term.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
```

**Robots** (`app/robots.ts`):

```tsx
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://coucou-ia.com/sitemap.xml',
  };
}
```

### 4. Google Tag Manager

**Injected in root layout**:

```tsx
<Script id="google-tag-manager" strategy="afterInteractive">
  {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-K7Z65296');`}
</Script>
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K7Z65296" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
</noscript>
```

### 5. Dynamic Metadata

**Blog posts** (`app/blog/[slug]/page.tsx`):

```tsx
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.ogImage }],
    },
    alternates: {
      canonical: `https://coucou-ia.com/blog/${params.slug}`,
    },
  };
}
```

### 6. Internationalization

- Site-wide French: `<html lang="fr">`
- French locale in OpenGraph: `locale: 'fr_FR'`
- French validation messages
- French date formatting

---

## Styling & Theming

### Tailwind + CSS Variables (Dark Mode Only)

**Colors** (`globals.css`):

```css
@layer base {
  :root {
    --background: 0 0% 7%; /* Deep zinc */
    --foreground: 0 0% 98%; /* Near white */
    --card: 0 0% 10%; /* Lighter zinc */
    --primary: 139 92 246; /* Violet #8B5CF6 */
    --success: 34 197 94; /* Green */
    --warning: 250 204 21; /* Yellow */
    --destructive: 239 68 68; /* Red */
    --radius: 0.5rem; /* 8px border-radius */
  }
}
```

**Custom colors for LLMs**:

```css
--chatgpt: 113 113 122; /* Gray for ChatGPT */
--claude: 113 113 122; /* Gray for Claude */
```

**Fonts** (Google Fonts):

```css
--font-sans: 'Inter', sans-serif; /* Primary UI */
--font-display: 'Space Grotesk', sans-serif; /* Headings */
--font-mono: 'JetBrains Mono', monospace; /* Code/data */
```

**Animations**:

```css
@keyframes wave {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes count-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-wave {
  animation: wave 2s ease-in-out infinite;
}
.animate-count-up {
  animation: count-up 0.5s ease-out forwards;
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
```

**Custom utilities**:

```css
.status-success {
  @apply text-success border-success/20 bg-success/10;
}
.status-error {
  @apply text-destructive border-destructive/20 bg-destructive/10;
}
.status-warning {
  @apply text-warning border-warning/20 bg-warning/10;
}
.status-neutral {
  @apply text-muted-foreground border-border bg-muted;
}
```

**Responsive design**:

- Mobile-first: Base styles, then `sm:`, `md:`, `lg:`, `xl:`
- Grid: `grid grid-cols-1 md:grid-cols-3`
- Flex: `flex flex-col md:flex-row`

**No light mode** - Hard-coded dark mode design with violet accent.

---

## Performance Optimizations

1. **Next.js optimized package imports** (in `next.config.js`):

   ```js
   optimizePackageImports: ['lucide-react', 'recharts'];
   ```

2. **React.memo()** on expensive components:
   - KPI cards
   - Sentiment cards
   - Chart components

3. **TanStack Query cache**:
   - 1-minute stale time
   - Automatic background refetching
   - Optimistic updates

4. **Image optimization**:
   - Next.js `<Image>` component
   - Automatic WebP conversion
   - Lazy loading

5. **Code splitting**:
   - App Router automatic splitting
   - Dynamic imports for heavy components
   - Route-based splitting

---

## Conventions & Patterns

1. **Component naming**: PascalCase for all components
2. **File organization**: Feature-based in `/components/features`, domain-based in `/features`
3. **Type safety**: TypeScript strict mode
4. **Export pattern**: Named exports (seen in `/components/*/index.ts`)
5. **Client boundaries**: `'use client'` on interactive pages, hooks
6. **Error handling**:
   - Custom `ApiClientError` class
   - Toast notifications for all mutations
   - Manual error state in forms
7. **Loading states**:
   - `isLoading` from queries
   - `isPending` from mutations
   - Skeleton/spinner UI (`pulsing-dot` component)
8. **Accessibility**:
   - `aria-label`, `aria-hidden` on icons
   - Focus visible rings configured
   - Color contrast with semantic utilities
   - `motion-reduce:animate-none` for animations
9. **Mobile-first**: Base styles mobile, scale up with breakpoints
10. **Colocation**: Tests and styles close to components

---

## Key Differences from Initial Documentation

| Feature          | Initial Doc                  | Actual Implementation                             |
| ---------------- | ---------------------------- | ------------------------------------------------- |
| State Management | Zustand for client state     | React Context for auth, TanStack Query for server |
| Forms            | React Hook Form + Zod        | Vanilla React state + manual validation           |
| Error Handling   | Result pattern + DomainError | ApiClientError class + toast notifications        |
| Authentication   | Not detailed                 | Cookie-based with auto token refresh              |
| SEO              | Metadata + sitemap           | Metadata + sitemap + JSON-LD + GTM                |
| Styling          | Tailwind CSS                 | Tailwind + CSS variables + dark-only mode         |

---

## Testing Strategy

- **Unit tests**: Vitest + Testing Library
- **Test location**: Colocated with components (`.test.tsx` files)
- **Coverage**: Run `pnpm test:coverage`
- **Pattern**: Test user interactions, not implementation details

```tsx
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Key Rules

### ALWAYS

1. Use `'use client'` for interactive components/pages
2. Wrap API calls in TanStack Query hooks
3. Add toast notifications for mutations
4. Invalidate cache on mutations
5. Mobile-first responsive design
6. Explicit TypeScript types with return types
7. Named exports over default exports
8. Early returns over nested conditions
9. `cn()` utility for class merging
10. Accessibility attributes (`aria-label`, `aria-hidden`)

### NEVER

1. Use `any` type - use `unknown` + type guards
2. Put API logic in components - use hooks
3. Skip loading/error states
4. Hardcode values - use constants or env vars
5. Use light mode styles (dark-only design)
6. Skip cache invalidation on mutations
7. Forget toast notifications
8. Use default exports (prefer named exports)

### PREFER

1. Composition over inheritance
2. Small, focused components (< 200 lines)
3. Feature containers over page-level data fetching
4. Manual validation over form libraries (for simple forms)
5. React Context over Zustand (when state is simple)
6. `memo()` for expensive components
7. Early returns over nested conditionals
8. Explicit over implicit

---

## Common Patterns

### Polling Pattern

```tsx
// hooks/use-scan-job-polling.ts
export function useScanJobPolling(projectId: string, jobId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['scanJob', projectId, jobId],
    queryFn: () => apiClient.getScanJobStatus(projectId, jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'pending' || status === 'running' ? 2000 : false;
    },
  });
}
```

### Conditional Rendering

```tsx
// Loading state
if (isLoading)
  return (
    <div className="flex items-center gap-2">
      <PulsingDot />
      Chargement...
    </div>
  );

// Error state
if (error) return <Alert variant="destructive">{error.message}</Alert>;

// Empty state
if (!data || data.length === 0) return <EmptyState />;

// Data state
return <DataView data={data} />;
```

### Feature Locking

```tsx
// components/upgrade/use-upgrade.tsx
export function useUpgrade() {
  const { user } = useAuth();
  const { showUpgradeModal } = useUpgradeModal();

  function lockFeature(feature: string) {
    if (!user || user.plan === 'free') {
      showUpgradeModal(feature);
      return true; // Locked
    }
    return false; // Unlocked
  }

  return { lockFeature };
}

// Usage in component
function handleTabClick(tab: string) {
  const { lockFeature } = useUpgrade();
  if (lockFeature('competitor-analysis')) return; // Show upgrade modal
  setActiveTab(tab);
}
```

---

## File Counts

- **Pages**: ~23 route segments
- **Components**: ~120 files (ui + landing + dashboard + features + blog + seo)
- **Hooks**: 13 custom hooks
- **Utilities**: 11 lib files
- **Features**: 1 feature module (sentiment) with room for more

---

## Summary

This is a **production-ready Next.js 16 frontend** with:

✅ Proper separation of concerns (features/components/hooks/lib)
✅ Scalable API client with automatic auth refresh
✅ Performant state management (TanStack Query + Context)
✅ Comprehensive SEO (metadata + sitemap + JSON-LD + GTM)
✅ Accessible component library (shadcn/ui + Radix)
✅ Type-safe throughout
✅ French-first UI with i18n metadata
✅ Dark-mode-only design with violet accent
✅ Mobile-first responsive design

**Architecture is pragmatic**: Vanilla forms for simplicity, TanStack Query for server state, React Context for auth. No over-engineering - just what's needed.

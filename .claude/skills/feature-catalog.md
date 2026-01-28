# Feature Catalog — Coucou IA

> AI brand monitoring platform that tracks how LLMs (GPT, Claude) mention, rank, and perceive your brand across conversational AI responses.

---

## 1. Authentication & User Management

| Feature                | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| Email/password auth    | Registration with auto-login, login, password reset via token |
| Google OAuth           | One-click sign-in with Google                                 |
| JWT session management | Access + refresh tokens stored in HttpOnly cookies            |
| Profile management     | Update name and personal details                              |
| Data export (GDPR)     | Download all personal data                                    |
| Account deletion       | Full cascade delete with confirmation                         |
| Consent tracking       | Logs ToS/Privacy Policy acceptance with IP and user agent     |
| Email preferences      | Opt-in/out of notification categories                         |
| Security               | Throttled auth endpoints, email enumeration prevention        |

---

## 2. Subscription & Billing

### Plans

|                        | Free        | Solo (€39/mo)               | Pro (€99/mo)               |
| ---------------------- | ----------- | --------------------------- | -------------------------- |
| **Brands**             | 1           | 5                           | 15                         |
| **Prompts/brand**      | 2           | 10                          | 50                         |
| **AI models**          | GPT-4o-mini | + GPT-4o, Claude Sonnet 4.5 | + GPT-5.2, Claude Opus 4.5 |
| **Scan frequency**     | Weekly      | Weekly                      | Daily                      |
| **Data retention**     | 30 days     | 180 days                    | Unlimited                  |
| **Sentiment analysis** | —           | Yes                         | Yes                        |

### Billing Operations

| Feature                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| Stripe checkout        | Session creation for plan upgrades                 |
| Customer portal        | Stripe-hosted subscription management              |
| Subscription lifecycle | Active, Past Due, Canceled, Trialing states        |
| Downgrade handling     | Future-dated cancellation with reactivation option |
| Webhook processing     | Automated subscription event handling              |
| Quota enforcement      | Dynamic limits based on current plan               |

---

## 3. Project Management

| Feature                | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| CRUD operations        | Create, list, view, update, delete brand projects                 |
| Brand identity         | Name, domain, variants (alternative names to monitor)             |
| Brand context          | Structured metadata: business type, locality, offerings, audience |
| Auto-scan scheduling   | Automated scans at plan-defined frequency                         |
| Plan limit enforcement | Project count validated against subscription tier                 |

---

## 4. Prompt Management

| Feature                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| CRUD operations         | Create, list, update, delete prompts             |
| Categories              | Discovery, Comparison, Purchase Intent, Local    |
| Active/inactive toggle  | Enable or disable individual prompts             |
| Auto-generation         | Parse brand website to generate relevant prompts |
| Plan-limited generation | 2–5 auto-generated prompts depending on tier     |

---

## 5. Scanning & Analysis

### Scan Types

| Type           | Description                                       |
| -------------- | ------------------------------------------------- |
| Prompt scan    | Single prompt tested across all enabled AI models |
| Project scan   | All active prompts scanned across all models      |
| Sentiment scan | Brand perception analysis across models           |

### Per-Model Results

- **Citation detection** — whether the brand is mentioned (boolean)
- **Position/rank** — where the brand appears in the response
- **Brand keywords** — detected brand-related terms
- **Query keywords** — matched search terms
- **Competitor mentions** — name, position, keywords for each competitor found
- **Latency** — response time per model (ms)
- **Raw response** — full AI response stored as JSON

### Execution

- BullMQ-based async job queue
- Job statuses: Pending → Processing → Completed / Partial / Failed
- Rate-limited: 20 prompt scans/hr, 10 project scans/hr per user
- Paginated scan history with date range filtering

---

## 6. Dashboard & Analytics

### Current Metrics

| Metric                | Description                                             |
| --------------------- | ------------------------------------------------------- |
| Global citation score | Aggregate brand mention rate across all models          |
| Average rank          | Mean position across all models                         |
| Provider breakdown    | Citation rate and rank per provider (OpenAI, Anthropic) |
| Model breakdown       | Citation rate and rank per individual model             |
| Top competitors       | Most frequently mentioned competitors                   |
| Prompt-level stats    | Per-prompt, per-model scan results                      |

### Historical Analysis

| Feature                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| Date range filtering    | Bounded by plan retention limits                      |
| Time series aggregation | Day/week/month granularity based on range             |
| Trend detection         | Current vs. previous period with delta %              |
| Citation rate trends    | Over time, per model, per prompt                      |
| Competitor trends       | Up, down, stable, or new entrant detection            |
| Actionable insights     | Auto-generated positive, warning, and neutral signals |

---

## 7. Sentiment Analysis

| Feature           | Description                      |
| ----------------- | -------------------------------- |
| Sentiment score   | 0–100 per AI model               |
| Themes/attributes | 3–5 brand perception descriptors |
| Positive keywords | Favorable terms detected         |
| Negative keywords | Unfavorable terms detected       |
| History tracking  | Sentiment trends over time       |
| Availability      | Solo and Pro plans only          |

---

## 8. Recommendations Engine

| Type                 | Severity | Description                            |
| -------------------- | -------- | -------------------------------------- |
| Low citation rate    | Critical | Brand rarely mentioned                 |
| Competitor dominance | Warning  | Competitors ranking higher             |
| Prompt weakness      | Warning  | Specific prompts underperforming       |
| Keyword gap          | Info     | Missing important keywords             |
| Model disparity      | Warning  | Inconsistent performance across models |
| Position drop        | Warning  | Declining rank trend                   |
| Emerging competitor  | Info     | New competitor detected                |
| Improvement          | Info     | Positive trend detected                |

Each recommendation includes title, description, action items, and related prompt context.

---

## 9. Onboarding Flow

| Step                 | Description                                            |
| -------------------- | ------------------------------------------------------ |
| 1. Plan selection    | Choose Free, Solo, or Pro (Stripe checkout for paid)   |
| 2. Brand creation    | Enter name, domain, variants                           |
| 3. Prompt generation | Auto-generate from website analysis or create manually |

- Website parsing extracts business type, locality, offerings, and audience
- Async job polling for prompt generation progress
- Skip option for manual setup

---

## 10. Email Sequences & Notifications

### Onboarding (5 emails)

Welcome → Create brand nudge → First scan prompt → Competitor FOMO → Last chance

### Post-Scan (3 emails)

First analysis → Post-scan summary → Sentiment ready

### Upgrade Campaign (5 emails)

Plan upsell → Multi-model comparison → Auto-scan feature → Post-upgrade welcome → Solo-to-Pro nudge

### Engagement (6 emails)

Weekly report → Inactivity reminder → Paid inactivity alert → Milestones (first citation, scan count) → NPS survey → Founder outreach

### Churn Prevention (7 emails)

Dunning (first → urgent → final) → Cancellation survey → Win-back (check-in → value reminder → discount offer)

### Transactional

Password reset, account deleted, subscription ended, plan limit reached, plan approaching limit, plan downgrade, support request confirmation

### Email Infrastructure

- Queue-based delivery (BullMQ)
- HTML + plain text
- Personalization (name, brand, plan)
- Unsubscribe management with token-based links
- Throttling to prevent spam

---

## 11. Support

| Feature            | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| Request submission | Category (bug, question, billing, other), subject, message |
| Screenshot upload  | Up to 5 MB                                                 |
| Project context    | Optional project association                               |
| Rate limiting      | 5 requests/minute                                          |

---

## 12. Public Pages & SEO

| Page             | Description                           |
| ---------------- | ------------------------------------- |
| Landing page     | Hero, features, pricing, FAQ sections |
| Blog             | Index + dynamic slug-based posts      |
| Pricing          | Plan comparison                       |
| Privacy policy   | GDPR-compliant                        |
| Terms of service | Legal terms                           |
| Product Hunt     | Launch page                           |

**SEO:** JSON-LD (SoftwareApplication, FAQ, Organization), sitemap, OG/Twitter meta tags, canonical URLs.

---

## 13. Data Privacy & Compliance

| Feature                | Description                       |
| ---------------------- | --------------------------------- |
| GDPR compliance        | EU data hosting (Neon PostgreSQL) |
| Consent audit trail    | Action, IP, user agent, timestamp |
| Data export            | Full personal data download       |
| Account deletion       | Cascading delete of all user data |
| Unsubscribe management | Per-email token-based opt-out     |

---

## 14. Infrastructure

| Component    | Technology                                                                            |
| ------------ | ------------------------------------------------------------------------------------- |
| Frontend     | Next.js 16+, React 18+, TypeScript, Tailwind CSS, shadcn/ui                           |
| Backend      | NestJS, TypeScript, Hexagonal Architecture                                            |
| Database     | PostgreSQL (Neon production, Docker local)                                            |
| ORM          | Prisma                                                                                |
| Job queue    | BullMQ + Redis                                                                        |
| Auth         | JWT (access + refresh), Google OAuth                                                  |
| Payments     | Stripe (Checkout, Customer Portal, Webhooks)                                          |
| Hosting      | Vercel (frontend), Railway (backend)                                                  |
| AI providers | OpenAI (GPT-4o-mini, GPT-4o, GPT-5.2), Anthropic (Claude Sonnet 4.5, Claude Opus 4.5) |

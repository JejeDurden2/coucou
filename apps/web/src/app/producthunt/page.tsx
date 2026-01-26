'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { Plan, PLAN_PRICING } from '@coucou-ia/shared';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

const PROMO_CODE = 'PRODUCTHUNT50';
const DEADLINE = new Date('2026-02-23T23:59:59+01:00');
const PH_URL = 'https://www.producthunt.com/products/coucou-ia';

const PROMO_PLANS = [
  {
    name: 'Solo',
    plan: Plan.SOLO,
    originalPrice: PLAN_PRICING[Plan.SOLO].price,
    discountedPrice: PLAN_PRICING[Plan.SOLO].price / 2,
    savings: (PLAN_PRICING[Plan.SOLO].price / 2) * 12,
  },
  {
    name: 'Pro',
    plan: Plan.PRO,
    originalPrice: PLAN_PRICING[Plan.PRO].price,
    discountedPrice: PLAN_PRICING[Plan.PRO].price / 2,
    savings: (PLAN_PRICING[Plan.PRO].price / 2) * 12,
  },
];

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(deadline: Date): TimeLeft | null {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? price.toString() : price.toFixed(2).replace('.', ',');
}

export default function ProductHuntPage() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [copied, setCopied] = useState(false);

  const isExpired = mounted && timeLeft === null;

  useEffect(() => {
    setTimeLeft(getTimeLeft(DEADLINE));
    setMounted(true);

    const interval = setInterval(() => {
      const tl = getTimeLeft(DEADLINE);
      setTimeLeft(tl);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      toast.success('Code copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le code');
    }
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Retour
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4">
        {/* Hero */}
        <section className="py-16 text-center md:py-20">
          <a
            href={PH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Voir sur Product Hunt
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
          <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">
            Offre exclusive Product Hunt
          </h1>
          <p className="text-xl text-muted-foreground md:text-2xl">
            <span className="text-primary font-semibold">-50%</span> sur votre première année
          </p>
        </section>

        {/* Promo Code */}
        <section className="mx-auto mb-12 max-w-md">
          <div
            className={`flex items-center justify-between rounded-lg border bg-card p-4 ${
              isExpired ? 'border-border opacity-50' : 'border-primary/20'
            }`}
          >
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Code promo</p>
              <p className="font-mono text-xl font-bold tracking-wider">{PROMO_CODE}</p>
              {isExpired && <p className="mt-1 text-xs text-destructive">Expiré</p>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isExpired}
              className="gap-2"
            >
              {copied ? (
                <Check className="size-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied ? 'Copié' : 'Copier'}
            </Button>
          </div>
        </section>

        {/* Countdown */}
        <section className="mb-16 text-center">
          {!mounted ? (
            <div className="h-12" />
          ) : isExpired ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="size-5" aria-hidden="true" />
              <p className="text-lg font-medium">Cette offre a expiré</p>
            </div>
          ) : timeLeft ? (
            <div>
              <div className="flex items-center justify-center gap-3 font-mono text-2xl font-bold tabular-nums md:text-3xl">
                <span>{timeLeft.days}j</span>
                <span className="text-muted-foreground">:</span>
                <span>{timeLeft.hours}h</span>
                <span className="text-muted-foreground">:</span>
                <span>{timeLeft.minutes}m</span>
                <span className="text-muted-foreground">:</span>
                <span>{timeLeft.seconds}s</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">restants</p>
            </div>
          ) : null}
        </section>

        {/* Pricing */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-2">
            {PROMO_PLANS.map((promoPlan) => (
              <Card key={promoPlan.name} className="relative border-primary/50">
                <div className="absolute -top-3 right-4">
                  <Badge>-50%</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{promoPlan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {PLAN_PRICING[promoPlan.plan].description}
                  </p>
                  <div className="mt-3">
                    <span className="text-lg text-muted-foreground line-through">
                      {promoPlan.originalPrice}€
                    </span>
                    <span className="ml-2 text-4xl font-bold tabular-nums text-primary">
                      {formatPrice(promoPlan.discountedPrice)}€
                    </span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <p className="mt-1 text-sm text-success">
                    Économisez {promoPlan.savings}€ sur 12 mois
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 space-y-3">
                    {PLAN_PRICING[promoPlan.plan].features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-12 text-center">
          <Button size="lg" asChild>
            {isExpired ? (
              <Link href="/">Découvrir Coucou IA</Link>
            ) : (
              <Link href="/register?ref=producthunt">Commencer gratuitement</Link>
            )}
          </Button>
        </section>

        {/* Footer note */}
        <section className="mb-16 text-center">
          <p className="text-sm text-muted-foreground">
            Le code <span className="font-mono font-medium text-foreground">{PROMO_CODE}</span> sera
            appliqué automatiquement lors de votre upgrade
          </p>
        </section>
      </main>
    </div>
  );
}

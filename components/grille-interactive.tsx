"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { grille } from "@/content/grille";
import { bookingUrl, ctaLabel } from "@/content/site";

// Seul leaf client de la grille interactive. La page serveur lui passe les
// secteurs (issus de content/ressources.ts, aucune duplication) ; toute la copie
// vient de content/grille.ts. Trois étapes, état local, zéro backend.

export type GrilleSector = {
  slug: string;
  name: string;
  useCases: {
    title: string;
    problem: string;
    order: string;
    questions: readonly string[];
  }[];
};

type Answer = "oui" | "non" | "nsp";
type Step = "sector" | "useCase" | "questions" | "verdict";

const ANSWERS: { value: Answer; label: string }[] = [
  { value: "oui", label: grille.answerYes },
  { value: "non", label: grille.answerNo },
  { value: "nsp", label: grille.answerUnsure },
];

const STEP_META = [
  { key: "sector", label: grille.steps.sector },
  { key: "useCase", label: grille.steps.useCase },
  { key: "answers", label: grille.steps.answers },
];

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const textLink = cn(
  "rounded-sm text-primary underline-offset-4 transition-colors hover:underline",
  focusRing
);

// Bouton-option (secteur, cas d'usage) : carte cliquable, accent bleu quand choisi.
function optionClasses(selected: boolean) {
  return cn(
    "group flex min-h-11 items-center gap-3 rounded-lg border p-4 text-left transition",
    focusRing,
    selected
      ? "border-primary bg-primary/5"
      : "border-border bg-card hover:border-input"
  );
}

// Réponse Oui / Non / Je ne sais pas : nuance par l'intensité du bleu, pas de feu tricolore.
function answerClasses(selected: boolean) {
  return cn(
    "flex min-h-11 items-center justify-center rounded-lg border px-2 py-2 text-center text-sm font-medium leading-tight transition",
    focusRing,
    selected
      ? "border-primary bg-primary/10 text-foreground"
      : "border-border bg-card text-muted-foreground hover:border-input hover:text-foreground"
  );
}

// Action secondaire discrète (retour, recommencer) : vrai bouton, focus visible.
function MiniButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm py-1 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground",
        focusRing
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {label}
    </button>
  );
}

export function GrilleInteractive({ sectors }: { sectors: GrilleSector[] }) {
  const reduce = useReducedMotion();

  const [step, setStep] = useState<Step>("sector");
  const [sectorSlug, setSectorSlug] = useState<string | null>(null);
  const [useCaseIndex, setUseCaseIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(Answer | null)[]>([]);

  const sector = sectors.find((s) => s.slug === sectorSlug) ?? null;
  const useCase =
    sector && useCaseIndex !== null ? (sector.useCases[useCaseIndex] ?? null) : null;

  const ouiCount = answers.filter((a) => a === "oui").length;
  const hasUnsure = answers.some((a) => a === "nsp");
  const allAnswered = answers.length > 0 && answers.every((a) => a !== null);
  const tier: keyof typeof grille.verdicts =
    ouiCount === 3 ? "strong" : ouiCount >= 1 ? "medium" : "soft";

  const activeStepIdx = step === "sector" ? 0 : step === "useCase" ? 1 : 2;

  function chooseSector(slug: string) {
    setSectorSlug(slug);
    setUseCaseIndex(null);
    setAnswers([]);
    setStep("useCase");
  }

  function chooseUseCase(index: number) {
    const uc = sector?.useCases[index];
    setUseCaseIndex(index);
    setAnswers(uc ? uc.questions.map(() => null) : []);
    setStep("questions");
  }

  function setAnswer(qIndex: number, value: Answer) {
    setAnswers((prev) => prev.map((a, i) => (i === qIndex ? value : a)));
  }

  function retry() {
    setUseCaseIndex(null);
    setAnswers([]);
    setStep("useCase");
  }

  function restart() {
    setSectorSlug(null);
    setUseCaseIndex(null);
    setAnswers([]);
    setStep("sector");
  }

  const content = renderStep();

  return (
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
      {/* Indicateur d'étape : orientation visuelle, décoratif (les titres portent le sens). */}
      <ol
        aria-hidden
        className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs tracking-[0.12em] uppercase"
      >
        {STEP_META.map((s, i) => {
          const state = i < activeStepIdx ? "done" : i === activeStepIdx ? "active" : "todo";
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border text-[10px] tabular-nums",
                  state === "active" && "border-primary bg-primary text-primary-foreground",
                  state === "done" && "border-primary text-primary",
                  state === "todo" && "border-border text-foreground-dim"
                )}
              >
                {state === "done" ? <Check className="size-3" /> : i + 1}
              </span>
              <span
                className={cn(
                  state === "active" ? "text-foreground" : "text-foreground-dim",
                  // Sur mobile, on ne montre que le libellé de l'étape en cours.
                  state === "active" ? "inline" : "hidden sm:inline"
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {reduce ? (
          <div key={step}>{content}</div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {content}
          </motion.div>
        )}
      </div>
    </div>
  );

  function renderStep() {
    if (step === "sector") {
      return (
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-2xl leading-snug font-medium tracking-[-0.01em]">
            {grille.sectorHeading}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sectors.map((s) => (
              <button
                key={s.slug}
                type="button"
                aria-pressed={sectorSlug === s.slug}
                onClick={() => chooseSector(s.slug)}
                className={optionClasses(sectorSlug === s.slug)}
              >
                <span className="flex flex-col gap-1">
                  <span className="font-display text-lg font-medium tracking-[-0.01em] text-foreground">
                    {s.name}
                  </span>
                  <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                    {s.useCases.length} {grille.sectorCountLabel}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </button>
            ))}
          </div>
          {/* Porte de sortie discrète. */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {grille.escapeQuestion}{" "}
            <Link href="/cas-usage" className={textLink}>
              {grille.escapeCasUsageLabel}
            </Link>
            {". Ou "}
            <a href={bookingUrl("grille-sortie")} className={textLink}>
              {ctaLabel}
            </a>
            {", on en parle."}
          </p>
        </div>
      );
    }

    if (step === "useCase" && sector) {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              {sector.name}
            </span>
            <h2 className="font-display text-2xl leading-snug font-medium tracking-[-0.01em]">
              {grille.useCaseHeading}
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {sector.useCases.map((u, i) => (
              <button
                key={u.title}
                type="button"
                aria-pressed={useCaseIndex === i}
                onClick={() => chooseUseCase(i)}
                className={optionClasses(useCaseIndex === i)}
              >
                <span className="flex flex-col gap-1">
                  <span className="font-display text-base font-medium text-foreground">
                    {u.title}
                  </span>
                  <span className="line-clamp-1 text-sm text-muted-foreground">
                    {u.problem}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </button>
            ))}
          </div>
          <MiniButton icon={ArrowLeft} label={grille.useCaseBack} onClick={() => setStep("sector")} />
        </div>
      );
    }

    if (step === "questions" && sector && useCase) {
      return (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              {sector.name}
            </span>
            <h2 className="font-display text-xl leading-snug font-medium tracking-[-0.01em]">
              {useCase.title}
            </h2>
            <p className="text-sm text-muted-foreground">{grille.questionsIntro}</p>
          </div>

          <ol className="flex flex-col gap-6">
            {useCase.questions.map((q, qi) => (
              <li key={q} className="flex flex-col gap-3">
                <p id={`grille-q-${qi}`} className="text-pretty leading-relaxed text-foreground">
                  <span className="mr-2 font-mono text-sm tabular-nums text-primary">
                    {qi + 1}.
                  </span>
                  {q}
                </p>
                <div
                  role="group"
                  aria-labelledby={`grille-q-${qi}`}
                  className="grid grid-cols-3 gap-2"
                >
                  {ANSWERS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={answers[qi] === opt.value}
                      onClick={() => setAnswer(qi, opt.value)}
                      className={answerClasses(answers[qi] === opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button type="button" size="lg" disabled={!allAnswered} onClick={() => setStep("verdict")}>
                {grille.submitVerdict}
                <ArrowRight data-icon="inline-end" />
              </Button>
              {!allAnswered ? (
                <p className="text-sm text-muted-foreground">{grille.questionsHint}</p>
              ) : null}
            </div>
            <MiniButton icon={ArrowLeft} label={grille.questionsBack} onClick={() => setStep("useCase")} />
          </div>
        </div>
      );
    }

    if (step === "verdict" && sector && useCase) {
      const verdict = grille.verdicts[tier];
      const cartePath = `/ressources/${sector.slug}`;
      return (
        <div role="status" aria-live="polite" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.12em] text-primary uppercase">
              {grille.verdictEyebrow}
            </span>
            <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              {sector.name} · {useCase.title}
            </span>
          </div>

          {/* Ordre de grandeur : signal bleu (filet gauche + chiffre), étiqueté illustration. */}
          <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
            <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {grille.orderEyebrow}
            </span>
            <span className="font-display text-2xl leading-tight font-bold tracking-[-0.02em] tabular-nums text-primary">
              {useCase.order}
            </span>
            <span className="font-mono text-[10px] tracking-[0.12em] text-foreground-dim uppercase">
              {grille.illustrationLabel}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-balance font-display text-2xl leading-snug font-bold tracking-[-0.02em] sm:text-3xl">
              {verdict.title}
            </h2>
            <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
              {verdict.body}
            </p>
            {hasUnsure ? (
              <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
                {grille.nuanceUnsure}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            {/* Actions selon le nombre de oui. */}
            {tier === "strong" ? (
              <div>
                <Button nativeButton={false} render={<a href={bookingUrl("grille-3oui")} />} size="lg">
                  {ctaLabel}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            ) : null}

            {tier === "medium" ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  nativeButton={false}
                  render={<a href={bookingUrl("grille-a-regarder")} />}
                  variant="secondary"
                  size="lg"
                >
                  {ctaLabel}
                </Button>
                <Button nativeButton={false} render={<Link href={cartePath} />} variant="ghost" size="lg">
                  {grille.carteLinkLabel}
                </Button>
              </div>
            ) : null}

            {tier === "soft" ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" size="lg" onClick={retry}>
                  {grille.retryLabel}
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button nativeButton={false} render={<Link href={cartePath} />} variant="ghost" size="lg">
                  {grille.carteLinkLabel}
                </Button>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
              {tier !== "soft" ? (
                <MiniButton icon={ArrowRight} label={grille.retryLabel} onClick={retry} />
              ) : null}
              <MiniButton icon={RotateCcw} label={grille.restartLabel} onClick={restart} />
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

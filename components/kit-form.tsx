"use client";

import { useActionState, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookingUrl, ctaLabel } from "@/content/site";
import {
  buildKitPrompt,
  hasHighVolume,
  hasPersonalData,
  isAutomation,
  kit,
  kitCostsFor,
  kitGateLine,
  kitLeadFields,
  kitVerdictBricks,
  kitRgpd,
  kitStepsFor,
  kitWatchPointsFor,
  visibleQuestions,
  type KitDraft,
} from "@/content/kit";
import { subscribeKit } from "@/app/outils/kit-de-demarrage/actions";
import type { SubscribeState } from "@/lib/brevo";

// Seul leaf client du kit de démarrage. Tout l'arbre de décision vit dans
// content/kit.ts : ici, l'état local (réponses, étape, presse-papiers) et la
// server action de capture. Aucun appel modèle, aucune route entre les étapes.

const initialState: SubscribeState = { status: "idle" };

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const inputClasses = cn(
  "h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none",
  "placeholder:text-muted-foreground",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
);

const sectionTitle = "type-h4";
const monoLabel = "type-label";

function optionClasses(selected: boolean) {
  return cn(
    "group flex min-h-11 w-full items-center gap-3 rounded-lg border p-4 text-left transition",
    focusRing,
    selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-input"
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
        "inline-flex items-center gap-1.5 rounded-sm py-1 type-label text-muted-foreground transition-colors hover:text-foreground",
        focusRing
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {label}
    </button>
  );
}

function openerFor(draft: KitDraft): string | null {
  const avancement = draft.avancement;
  if (avancement === "idee" || avancement === "prototype" || avancement === "en-ligne") {
    return kit.verdictOpeners[avancement];
  }
  return null;
}

// Deuxième lecture du verdict : ce que ce type de projet exige en priorité.
function readingFor(draft: KitDraft): string | null {
  const projet = draft.projet;
  if (projet === "outil-interne" || projet === "produit" || projet === "espace-client") {
    return kit.projetReadings[projet];
  }
  return null;
}

// Bloc encadré à puces : le RGPD et les points de vigilance partagent le dessin.
function PointPanel({
  icon: Icon,
  title,
  intro,
  points,
  note,
}: {
  icon: LucideIcon;
  title: string;
  intro?: string;
  points: readonly string[];
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6">
      <h3 className={sectionTitle}>{title}</h3>
      {intro ? (
        <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 text-pretty text-sm leading-relaxed text-muted-foreground"
          >
            <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      {note ? <p className="text-sm leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function KitForm() {
  const reduce = useReducedMotion();

  const [draft, setDraft] = useState<KitDraft>({});
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [state, formAction, isPending] = useActionState(subscribeKit, initialState);

  const questions = visibleQuestions(draft);
  const question = questions[index];
  const done = index >= questions.length;
  const unlocked = state.status === "success";

  function restart() {
    setDraft({});
    setIndex(0);
    setCopied(false);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(buildKitPrompt(draft));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ponytail: presse-papiers refusé (navigateur ancien, page non sécurisée) :
      // le prompt reste sélectionnable à la main juste au-dessus.
      setCopied(false);
    }
  }

  const content = renderPhase();

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8">
      {/* Une nappe d'ambiance bleue (.trace-glow), jamais sur une action ni
          un texte (§5 du design system). */}
      <div
        aria-hidden
        className="trace-glow pointer-events-none absolute -top-44 -right-44 h-100 w-120 opacity-50"
      />
      {!done ? (
        <p className={cn(monoLabel, "text-muted-foreground")}>
          {kit.progressLabel}{" "}
          <span className="tabular-nums text-foreground">{index + 1}</span> {kit.progressJoin}{" "}
          <span className="tabular-nums">{questions.length}</span>
        </p>
      ) : null}

      <div className={done ? undefined : "mt-6"}>
        <motion.div
          key={question?.id ?? "verdict"}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          {content}
        </motion.div>
      </div>
    </div>
  );

  function renderPhase() {
    if (!done && question) {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className={sectionTitle}>{question.label}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{question.help}</p>
          </div>

          <div className="flex flex-col gap-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={draft[question.id] === option.value}
                onClick={() => {
                  setDraft({ ...draft, [question.id]: option.value });
                  setIndex(index + 1);
                }}
                className={optionClasses(draft[question.id] === option.value)}
              >
                <span className="type-h5 text-foreground">
                  {option.label}
                </span>
                <ArrowRight
                  aria-hidden
                  className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </button>
            ))}
          </div>

          {index > 0 ? (
            <MiniButton icon={ArrowLeft} label={kit.backLabel} onClick={() => setIndex(index - 1)} />
          ) : null}
        </div>
      );
    }

    // Automatisation entre logiciels : ce kit ne sert à rien, on le dit.
    if (isAutomation(draft)) {
      return (
        <div role="status" aria-live="polite" className="flex flex-col gap-6">
          <h2 className="type-h2">
            {kit.automationTitle}
          </h2>
          <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
            {kit.automationBody}
          </p>
          <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
            {kit.automationBodySecond}
          </p>
          <div className="flex flex-col gap-4">
            <h3 className={sectionTitle}>{kit.automationQuestionsTitle}</h3>
            <ol className="flex flex-col gap-3">
              {kit.automationQuestions.map((question, position) => (
                <li
                  key={question}
                  className="flex max-w-[62ch] gap-3 text-pretty text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="font-mono tabular-nums text-primary">{position + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Button
              nativeButton={false}
              render={<a href={bookingUrl("kit-demarrage-automatisation")} />}
              size="lg"
            >
              {ctaLabel}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
          <div className="border-t border-border pt-6">
            <MiniButton icon={RotateCcw} label={kit.restartLabel} onClick={restart} />
          </div>
        </div>
      );
    }

    const opener = openerFor(draft);
    const reading = readingFor(draft);
    // Avant l'email : le langage et une seule brique inconnue, le reste flouté.
    const { teaser, locked } = kitVerdictBricks(draft);
    const bricks = [...teaser, ...locked];

    return (
      <div className="flex flex-col gap-10">
        {/* Le verdict et le kit sont annoncés séparément : le formulaire de la
            porte email ne vit jamais dans une zone live. */}
        <div role="status" aria-live="polite" className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 className="type-h2">
              {kit.verdictTitle}
            </h2>
            {opener ? (
              <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
                {opener}
              </p>
            ) : null}
            {reading ? (
              <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
                {reading}
              </p>
            ) : null}
          </div>

          {/* Une brique par ligne, séparées par des filets : le seul signal bleu du
              verdict reste le sourtitre, jamais six barres d'accent. */}
          <ul className="divide-y divide-border">
            {bricks.map((brick, position) => {
              const masked = !unlocked && position >= teaser.length;
              return (
                <li
                  key={brick.name}
                  aria-hidden={masked || undefined}
                  className={cn(
                    "flex flex-col gap-1 py-5 first:pt-0 last:pb-0",
                    masked && "pointer-events-none blur-sm select-none"
                  )}
                >
                  <span className="type-h5 text-foreground">
                    {brick.name}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {kit.stackPlainPrefix} {brick.plain}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">{brick.reason}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {unlocked ? renderKit() : renderGate(bricks.length)}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
          <MiniButton
            icon={ArrowLeft}
            label={kit.editLabel}
            onClick={() => setIndex(questions.length - 1)}
          />
          <MiniButton icon={RotateCcw} label={kit.restartLabel} onClick={restart} />
        </div>
      </div>
    );
  }

  function renderGate(brickCount: number) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6">
        <h3 className={sectionTitle}>{kit.gateTitle}</h3>
        <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
          {kit.gateBody}
        </p>
        {/* La taille de ce qui est encore fermé, chiffrée pour ces réponses-là. */}
        <p className="max-w-[54ch] text-pretty tabular-nums leading-relaxed text-foreground">
          {kitGateLine(kitStepsFor(draft).length, brickCount)}
        </p>

        <form action={formAction} className="mt-2 flex max-w-md flex-col gap-4">
          {/* Les réponses partent regroupées dans l'attribut NOTES Brevo : le lead arrive qualifié. */}
          {kitLeadFields(draft).map((field) => (
            <input key={field.name} type="hidden" name={field.name} value={field.value} />
          ))}

          {/* Honeypot : hors ecran via sr-only (jamais display:none, un bot basique
              l'ignorerait), et aria-hidden pour qu'un lecteur d'ecran ne s'y arrete
              jamais. Un humain ne le voit ni ne le remplit. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor="kit-website">Site web</label>
            <input id="kit-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="kit-firstname" className="text-sm font-medium text-foreground">
              {kit.gateFirstNameLabel}
            </label>
            <input
              id="kit-firstname"
              type="text"
              name="firstName"
              autoComplete="given-name"
              placeholder={kit.gateFirstNamePlaceholder}
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="kit-email" className="text-sm font-medium text-foreground">
              {kit.gateEmailLabel}
            </label>
            <input
              id="kit-email"
              type="email"
              inputMode="email"
              name="email"
              autoComplete="email"
              required
              placeholder={kit.gateEmailPlaceholder}
              aria-invalid={state.status === "error" || undefined}
              className={inputClasses}
            />
            {state.status === "error" ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error === "invalid" ? kit.gateErrorInvalid : kit.gateErrorServer}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? kit.gatePendingLabel : kit.gateSubmitLabel}
          </Button>
          <p className="text-sm leading-relaxed text-muted-foreground">{kit.gatePrivacyNote}</p>
        </form>
      </div>
    );
  }

  function renderKit() {
    const watchPoints = kitWatchPointsFor(draft);

    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h3 className={sectionTitle}>{kit.checklistTitle}</h3>
          <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
            {kit.checklistIntro}
          </p>
        </div>

        <ol className="flex flex-col gap-8">
          {kitStepsFor(draft).map((step, position) => (
            <li key={step.title} className="flex flex-col gap-3">
              <h4 className="flex items-baseline gap-3 text-base font-semibold text-foreground">
                <span className="font-mono text-sm tabular-nums text-primary">{position + 1}.</span>
                {step.title}
              </h4>
              <p className="max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
                {step.what}
              </p>
              <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div className="flex items-baseline gap-2">
                  <dt className={cn(monoLabel, "text-muted-foreground")}>{kit.stepWhereLabel}</dt>
                  <dd className="text-foreground">{step.where}</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className={cn(monoLabel, "text-muted-foreground")}>{kit.stepTimeLabel}</dt>
                  <dd className="tabular-nums text-foreground">{step.time}</dd>
                </div>
              </dl>
              <p className="max-w-[62ch] border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground">
                <span className={cn(monoLabel, "mr-2 text-foreground")}>{kit.stepPiegeLabel}</span>
                {step.piege}
              </p>
            </li>
          ))}
        </ol>

        {/* La facture du mois, brique par brique, pour cette pile-là seulement. */}
        <div className="flex flex-col gap-4">
          <h3 className={sectionTitle}>{kit.costsTitle}</h3>
          <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
            {kit.costsNote}
          </p>
          <ul className="divide-y divide-border">
            {kitCostsFor(draft).map((line) => (
              <li
                key={line.name}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-foreground">{line.name}</span>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {line.cost}
                </span>
              </li>
            ))}
          </ul>
          <p className="max-w-[54ch] text-pretty tabular-nums leading-relaxed text-foreground">
            {kit.costsTotal}
          </p>
          {hasHighVolume(draft) ? (
            <p className="max-w-[54ch] text-pretty tabular-nums text-sm leading-relaxed text-muted-foreground">
              {kit.costsVolumeNote}
            </p>
          ) : null}
        </div>

        {watchPoints.length > 0 ? (
          <PointPanel icon={AlertTriangle} title={kit.watchTitle} points={watchPoints} />
        ) : null}

        {hasPersonalData(draft) ? (
          <PointPanel
            icon={Check}
            title={kitRgpd.title}
            intro={kitRgpd.intro}
            points={kitRgpd.points}
            note={kitRgpd.note}
          />
        ) : null}

        <div className="flex flex-col gap-4">
          <h3 className={sectionTitle}>{kit.promptTitle}</h3>
          <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
            {kit.promptIntro}
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-background p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
            {buildKitPrompt(draft)}
          </pre>
          <div>
            <Button type="button" variant="secondary" onClick={copyPrompt}>
              {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
              <span aria-live="polite">
                {copied ? kit.promptCopiedLabel : kit.promptCopyLabel}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-8">
          <h3 className={sectionTitle}>{kit.closingTitle}</h3>
          <p className="max-w-[54ch] text-pretty leading-relaxed text-muted-foreground">
            {kit.closingBody}
          </p>
          <div>
            <Button nativeButton={false} render={<a href={bookingUrl("kit-demarrage")} />} size="lg">
              {ctaLabel}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

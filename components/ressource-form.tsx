"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookingUrl, ctaLabel } from "@/content/site";
import { ressourcesShared } from "@/content/ressources";
import { subscribeRessource, type SubscribeState } from "@/app/ressources/actions";

// Seul leaf client de tout le lead magnet : useActionState (React 19) branche
// sur la server action. Le slug voyage via un champ cache (l'action attend la
// signature standard (prevState, formData), pas d'argument lie).
const initialState: SubscribeState = { status: "idle" };

const inputClasses = cn(
  "h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none",
  "placeholder:text-muted-foreground",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
);

export function RessourceForm({ slug }: { slug: string }) {
  const [state, formAction, isPending] = useActionState(subscribeRessource, initialState);

  if (state.status === "success") {
    return (
      <div
        aria-live="polite"
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
      >
        <h2 className="font-display text-xl leading-snug font-medium tracking-[-0.01em]">
          {ressourcesShared.successTitle}
        </h2>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          {ressourcesShared.successBody}{" "}
          <a
            href={`/ressources/${slug}/carte`}
            className="rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {ressourcesShared.successCarteLabel}
          </a>
        </p>
        <div>
          <Button nativeButton={false} render={<a href={bookingUrl("ressource-success")} />} size="lg">
            {ctaLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />

      {/* Honeypot : hors ecran via sr-only (jamais display:none, un bot basique
          l'ignorerait), et aria-hidden pour qu'un lecteur d'ecran ne s'y arrete
          jamais. Un humain ne le voit ni ne le remplit. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="ressource-website">Site web</label>
        <input
          id="ressource-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="ressource-email" className="text-sm font-medium text-foreground">
          {ressourcesShared.formEmailLabel}
        </label>
        <input
          id="ressource-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder={ressourcesShared.formEmailPlaceholder}
          aria-invalid={state.status === "error" || undefined}
          className={inputClasses}
        />
        {state.status === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error === "invalid"
              ? ressourcesShared.formErrorInvalid
              : ressourcesShared.formErrorServer}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending} size="lg">
        {ressourcesShared.formSubmitLabel}
      </Button>
    </form>
  );
}

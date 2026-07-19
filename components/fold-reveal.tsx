"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo-mark";

// « Le pli » (section services) : les deux volets se déplient depuis la
// charnière centrale pendant que la marque origami se plie en place au centre.
// Séquence jouée une fois à l’entrée dans le viewport, jamais en boucle.
// Reduced-motion : état final statique, aucun transform (design-system §6).

const viewport = { once: true, margin: "0px 0px -18% 0px" } as const;

export function FoldPanel({
  side,
  children,
  className,
}: {
  side: "left" | "right";
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{
        transformPerspective: 1200,
        transformOrigin: side === "left" ? "right center" : "left center",
      }}
      initial={{ opacity: 0, rotateY: side === "left" ? -10 : 10 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={viewport}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function FoldMark({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, viewport);
  const reducedMotion = useReducedMotion();

  return (
    <div ref={ref} className={className}>
      <LogoMark
        animated={!reducedMotion && inView}
        className={cn(
          "size-8 text-primary",
          !reducedMotion && !inView && "opacity-0"
        )}
      />
    </div>
  );
}

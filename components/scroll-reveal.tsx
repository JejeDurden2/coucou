"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// The only motion abstraction on the page (design-system §6). Opacity + y
// entrance on scroll-into-view, once. In the hero, several instances with an
// incremented `delay` produce the load stagger (they are all in view at load).
// Reduced-motion renders the final state with no transform.

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

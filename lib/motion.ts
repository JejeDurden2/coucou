import type { Transition } from "motion/react";

// Literal mirrors of the motion tokens in app/globals.css. Motion reads
// numbers, never var(--…), so keep these in sync with the :root scale.

/** Page slide (step 1 ↔ step 2): --duration-fast + --ease-smooth-out. */
export const pageSlide: Transition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] };

/** --duration-micro, in seconds: stagger offset for a few large items. */
export const staggerLarge = 0.08;

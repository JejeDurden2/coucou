import { Button } from "@/components/ui/button";
import { bookingUrl, ctaLabel } from "@/content/site";

// Sous 640 px, le CTA du header ne tient pas à côté du logo et du menu : cette
// barre le remplace. Posée en fin de body en sticky bottom : collée au bas du
// viewport pendant la lecture, elle reprend sa place naturelle sous le footer
// en fin de page, sans jamais le recouvrir.
export function MobileCtaBar() {
  return (
    <div className="sticky bottom-0 z-40 border-t border-border bg-background/90 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
      <Button
        nativeButton={false}
        render={<a href={bookingUrl("mobile-bar")} />}
        className="w-full"
      >
        {ctaLabel}
      </Button>
    </div>
  );
}

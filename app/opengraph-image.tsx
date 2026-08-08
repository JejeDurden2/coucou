import { tagline } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt =
  "Coucou IA : conseil et développement IA pour PME et ETI. On sait par où commencer.";

export default function OpengraphImage() {
  return ogImage(tagline);
}

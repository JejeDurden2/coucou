import { tagline } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt =
  "Coucou IA : conseil et développement IA pour les PME. On met l’IA au travail chez vous.";

export default function OpengraphImage() {
  return ogImage(tagline);
}

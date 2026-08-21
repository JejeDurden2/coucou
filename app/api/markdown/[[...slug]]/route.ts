import { markdownDocument, notFoundMarkdown } from "@/lib/markdown/pages";
import { normalizePath } from "@/lib/accept";

// La représentation markdown des pages. proxy.ts réécrit ici quand le client
// demande « Accept: text/markdown », et pour les URL suffixées « .md ».
// Le client voit toujours son URL d'origine : cette route n'est jamais
// atteinte directement en navigation.

const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  // Indispensable derrière un CDN : sans ça, la variante HTML mise en cache
  // en premier est resservie à l'agent qui demande du markdown.
  Vary: "Accept",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await params;
  const path = normalizePath(`/${slug.join("/")}`);

  const doc = markdownDocument(path);
  if (!doc) {
    return new Response(`${notFoundMarkdown(path)}\n`, {
      status: 404,
      headers: MARKDOWN_HEADERS,
    });
  }

  return new Response(`${doc.body}\n`, { headers: MARKDOWN_HEADERS });
}

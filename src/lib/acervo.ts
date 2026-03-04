// acervo.ts — thin adapter over api.ts for the Acervo pages
// The pages use AcervoArea ("artigos" | "noticias" | "midias") to filter by kind groups.

export type { AcervoItem, AcervoKind, ListAcervoParams } from "./api";
export { listAcervoItems, getAcervoBySlug } from "./api";

import type { AcervoKind } from "./api";

export type AcervoArea = "artigos" | "noticias" | "midias";

// Map UI area → DB kind values
export const AREA_KINDS: Record<AcervoArea, AcervoKind[]> = {
    artigos: ["paper", "report"],
    noticias: ["news", "link"],
    midias: ["video", "photo"]
};

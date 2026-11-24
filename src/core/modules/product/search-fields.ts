import { normalizeSearchText } from "@/utils/formatter/search-text";
import { slugify } from "@/utils/formatter/slugify";

export type ProductSearchFields = { searchText: string; developerSlug: string | null };

/** Colunas derivadas do título e da desenvolvedora, usadas pela busca e pelo filtro do catálogo. */
export function productSearchFields(
    title: string,
    developer: string | null | undefined,
): ProductSearchFields {
    return {
        searchText: normalizeSearchText(`${title} ${developer ?? ""}`),
        developerSlug: (developer && slugify(developer)) || null,
    };
}

/**
 * Hosts de imagem que o `next/image` aceita. Usada pelo `images.remotePatterns` do
 * next.config.ts e pela validação do schema de produto: uma URL que passa no schema
 * sempre pode ser exibida, e uma imagem de outro host é recusada já no cadastro.
 */
export const REMOTE_IMAGE_PATTERNS = [
  // Fotos de exemplo usadas na home, no admin e nos mocks de carrinho, cofre e pedidos.
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  // Miniaturas dos trailers do YouTube na galeria do produto.
  { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
  // Capas e screenshots do IGDB (ex: /igdb/image/upload/t_1080p/<image_id>.jpg).
  { protocol: "https", hostname: "images.igdb.com", pathname: "/igdb/image/upload/**" },
  // Capsules e screenshots da loja Steam.
  {
    protocol: "https",
    hostname: "shared.akamai.steamstatic.com",
    pathname: "/store_item_assets/steam/apps/**",
  },
] as const;

export function isAllowedRemoteImage(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  return REMOTE_IMAGE_PATTERNS.some(
    ({ protocol, hostname, pathname }) =>
      url.protocol === `${protocol}:` &&
      url.hostname === hostname &&
      // `/**` no fim do padrão aceita qualquer caminho abaixo do prefixo.
      url.pathname.startsWith(pathname.slice(0, -"**".length)),
  );
}

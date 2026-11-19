"use client";

import { useLayoutEffect, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { GalleryItemView } from "../types";
import styles from "./ProductGallery.module.css";

type Media =
  | { kind: "video"; key: string; youtubeId: string; thumbnail: string }
  | { kind: "image"; key: string; src: string };

interface ProductGalleryProps {
  title: string;
  trailerYoutubeId: string | null;
  /** Já ordenada por `position`. */
  gallery: GalleryItemView[];
  /** Usada quando o produto não tem trailer nem imagens na galeria. */
  coverPath: string | null;
}

function buildMedia({ trailerYoutubeId, gallery, coverPath }: ProductGalleryProps): Media[] {
  const media: Media[] = [];

  if (trailerYoutubeId) {
    media.push({
      kind: "video",
      key: `video-${trailerYoutubeId}`,
      youtubeId: trailerYoutubeId,
      thumbnail: `https://i.ytimg.com/vi/${trailerYoutubeId}/hqdefault.jpg`,
    });
  }

  for (const item of gallery) {
    media.push({ kind: "image", key: item.id, src: item.path });
  }

  if (media.length === 0 && coverPath) {
    media.push({ kind: "image", key: "cover", src: coverPath });
  }

  return media;
}

const thumbnailSrc = (item: Media) => (item.kind === "video" ? item.thumbnail : item.src);

export function ProductGallery(props: ProductGalleryProps) {
  const { title } = props;
  const media = buildMedia(props);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Com cacheComponents, sair da página não a desmonta: o Next só a esconde com <Activity>
  // e o <iframe> continuaria tocando. O cleanup roda ao esconder e remove o player.
  useLayoutEffect(() => {
    return () => setPlaying(false);
  }, []);

  if (media.length === 0) {
    return <div className={styles.stage} aria-hidden="true" />;
  }

  // O índice sobrevive à navegação (Activity) e pode passar do fim se a galeria encolher.
  const currentIndex = Math.min(selected, media.length - 1);
  const current = media[currentIndex];
  const imageCount = media.filter((item) => item.kind === "image").length;

  function select(index: number) {
    setSelected(index);
    setPlaying(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();

    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (currentIndex + step + media.length) % media.length;
    select(next);
    event.currentTarget.querySelectorAll("button")[next]?.focus();
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        {current.kind === "video" && playing ? (
          <iframe
            className={styles.player}
            src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1`}
            title={`Trailer de ${title}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <>
            <Image
              key={current.key}
              src={thumbnailSrc(current)}
              alt={current.kind === "video" ? `Trailer de ${title}` : `Imagem de ${title}`}
              fill
              preload={currentIndex === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className={styles.image}
            />

            {current.kind === "video" && (
              <>
                <button
                  type="button"
                  className={styles.play}
                  onClick={() => setPlaying(true)}
                  aria-label={`Assistir ao trailer de ${title}`}
                >
                  <Play size={36} aria-hidden="true" />
                </button>
                <span className={styles.label}>Trailer</span>
              </>
            )}
          </>
        )}
      </div>

      {media.length > 1 && (
        <div
          className={styles.thumbnails}
          role="group"
          aria-label="Mídias do produto"
          onKeyDown={handleKeyDown}
        >
          {media.map((item, index) => {
            const active = index === currentIndex;
            const imageNumber = index - (media.length - imageCount) + 1;

            return (
              <button
                key={item.key}
                type="button"
                className={`${styles.thumbnail} ${active ? styles.thumbnailActive : ""}`}
                onClick={() => select(index)}
                aria-pressed={active}
                aria-label={item.kind === "video" ? "Ver trailer" : `Ver imagem ${imageNumber}`}
                tabIndex={active ? 0 : -1}
              >
                <Image
                  src={thumbnailSrc(item)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 15vw, 25vw"
                  className={styles.image}
                />
                {item.kind === "video" && (
                  <span className={styles.thumbnailPlay} aria-hidden="true">
                    <Play size={24} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

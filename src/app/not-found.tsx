import type { Metadata } from "next";
import { ContentNotFound } from "@/components/ContentNotFound/ContentNotFound";

export const metadata: Metadata = {
  title: "Página Não Encontrada (404) | KeyStation",
  description: "Oops! Game Over. Esta página não foi encontrada no KeyStation.",
};

export default function NotFound() {
  return <ContentNotFound />;
}

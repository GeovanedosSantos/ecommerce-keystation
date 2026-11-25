import type { Metadata } from "next";
import { GamesContent } from "./GamesContent";

export const metadata: Metadata = {
  title: "Jogos | Administração | KeyStation",
  description: "Cadastro e gerenciamento de jogos da KeyStation.",
};

export default function AdminGamesPage() {
  return <GamesContent />;
}

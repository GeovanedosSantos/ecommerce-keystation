import type { Metadata } from "next";
import { VaultMyKeys } from "./VaultMyKeys";

export const metadata: Metadata = {
  title: "Minhas Chaves (Cofre) | KeyStation",
  description: "Seus jogos, chaves protegidas e prontas para a próxima aventura no KeyStation.",
};

export default function VaultPage() {
  return <VaultMyKeys />;
}

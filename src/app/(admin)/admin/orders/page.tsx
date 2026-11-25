import type { Metadata } from "next";
import { OrdersContent } from "./OrdersContent";

export const metadata: Metadata = {
  title: "Pedidos | Administração | KeyStation",
  description: "Gerenciamento de pedidos realizados na KeyStation.",
};

export default function AdminOrdersPage() {
  return <OrdersContent />;
}

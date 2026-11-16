import type { Metadata } from "next";
import { OrdersContent } from "./OrdersContent";

export const metadata: Metadata = {
  title: "Meus Pedidos | KeyStation",
  description: "Acompanhe suas compras e acesse os detalhes de cada pedido no KeyStation.",
};

export default function OrdersPage() {
  return <OrdersContent />;
}

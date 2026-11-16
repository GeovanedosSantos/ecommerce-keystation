import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SidebarProvider } from "@/components/sidebar/SidebarProvider";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider header={<Header />}>
      <main>{children}</main>
      <Footer />
    </SidebarProvider>
  );
}

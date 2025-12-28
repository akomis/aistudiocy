import CartProvider from "@/providers/cart";
import { ReactQueryProvider } from "@/providers/react-query";

export default function CatalogueLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <CartProvider>{children}</CartProvider>
    </ReactQueryProvider>
  );
}

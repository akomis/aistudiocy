import CartProvider from "@/providers/cart";
import { FilterProvider } from "@/providers/filter";
import { ReactQueryProvider } from "@/providers/react-query";

export default function CatalogueLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <CartProvider>
        <FilterProvider>{children}</FilterProvider>
      </CartProvider>
    </ReactQueryProvider>
  );
}

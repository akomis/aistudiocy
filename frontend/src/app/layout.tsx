import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query";

const ceraPro = localFont({
  src: "./fonts/cera-pro/CeraPro-Black.woff",
  variable: "--font-cera-pro",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ai studio",
  description:
    "Jewellery Handmade Brand / Silver art. Based in CY / Shipping Worldwide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="en" className={ceraPro.className}>
        <body className={`antialiased bg-black text-white`}>{children}</body>
      </html>
    </ReactQueryProvider>
  );
}

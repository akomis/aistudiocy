import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query";

const ceraPro = localFont({
  src: [
    {
      path: "../fonts/CeraPro-Light.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/CeraPro-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/CeraPro-Black.woff2",
      weight: "900",
      style: "bold",
    },
  ],
  variable: "--font-primary",
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
      <html lang="en">
        <body className={`${ceraPro.variable} antialiased bg-black text-white`}>
          {children}
        </body>
      </html>
    </ReactQueryProvider>
  );
}

import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";

// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

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
    <html lang="en">
      <body className={`antialiased bg-black text-white`}>{children}</body>
    </html>
  );
}

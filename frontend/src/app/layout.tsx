import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/theme";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ceraPro = localFont({
  src: [
    {
      path: "../fonts/CeraPro-Light.woff2",
      weight: "100",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${ceraPro.variable} antialiased bg-black`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

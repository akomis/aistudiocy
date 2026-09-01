import CookieConsent from "@/components/CookieConsent";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/theme";
import localFont from "next/font/local";
import "./globals.css";
import "yet-another-react-lightbox/styles.css";

const ceraPro = localFont({
  src: [
    {
      path: "../../fonts/CeraProLight.otf",
      style: "light",
    },
    {
      path: "../../fonts/CeraProMedium.otf",
      style: "medium",
    },
    {
      path: "../../fonts/CeraProRegular.otf",
      style: "regular",
    },
    {
      path: "../../fonts/CeraProBlack.otf",
      style: "normal",
    },
    {
      path: "../../fonts/CeraProBold.otf",
      style: "bold",
    },
  ],
  variable: "--font-primary",
});

export const metadata = {
  title: "φως",
  description: "Jewellery Handmade Brand / Silver Art",
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The UI is English-only; the legal pages that also exist in Greek set
    // their own `lang` on the article element.
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
          {/* Loads Google Analytics, but only after the visitor consents. */}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}

import CookieConsent from "@/components/CookieConsent";
import { Toaster } from "@/components/ui/toaster";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/providers/theme";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function FrontendLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${ceraPro.variable} antialiased bg-black`}>
        <NextIntlClientProvider>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

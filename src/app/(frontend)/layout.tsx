import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/theme";
import localFont from "next/font/local";
import "./globals.css";

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

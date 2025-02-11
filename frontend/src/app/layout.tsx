import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/theme";
import {
  ErrorBoundary as HighlightErrorBoundary,
  HighlightInit,
} from "@highlight-run/next/client";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ceraPro = localFont({
  src: [
    {
      path: "../fonts/CeraProLight.otf",
      style: "light",
    },
    {
      path: "../fonts/CeraProMedium.otf",
      style: "medium",
    },
    {
      path: "../fonts/CeraProRegular.otf",
      style: "regular",
    },
    {
      path: "../fonts/CeraProBlack.otf",
      style: "normal",
    },
    {
      path: "../fonts/CeraProBold.otf",
      style: "bold",
    },
  ],
  variable: "--font-primary",
});

export const metadata: Metadata = {
  title: "ai studio",
  description: "Jewellery Handmade Brand / Silver Art",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const highlightProjectId = process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID;
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  if (!highlightProjectId?.length) {
    throw new Error("Missing Highlight project ID");
  }

  return (
    <>
      <HighlightInit
        excludedHostnames={["localhost"]}
        projectId={highlightProjectId}
        serviceName="aistudiocy"
        inlineImages={false}
        tracingOrigins
        disableSessionRecording // respect user's privacy
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [],
        }}
      />

      {gaId && <GoogleAnalytics gaId={gaId} />}

      <html lang="en" suppressHydrationWarning>
        <body className={`${ceraPro.variable} antialiased bg-black`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <HighlightErrorBoundary showDialog>
              {children}
            </HighlightErrorBoundary>

            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/theme";
import {
  ErrorBoundary as HighlightErrorBoundary,
  HighlightInit,
} from "@highlight-run/next/client";
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
  const highlightProjectId = process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID;

  if (!highlightProjectId?.length) {
    throw new Error("Missing Highlight project ID");
  }

  return (
    <>
      <HighlightInit
        excludedHostnames={["localhost"]}
        projectId={highlightProjectId}
        serviceName="aistudiocy"
        tracingOrigins
        disableSessionRecording // respect user's privacy
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [],
        }}
      />

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

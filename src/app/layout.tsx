import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "./frontend/hooks/use-toast";
import { Toaster } from "./frontend/components/ui/toaster";
import { ThemeProvider } from "./frontend/lib/theme-provider";

export const metadata: Metadata = {
  title: "Nolte | Events",
  description: "Professional event management platform with AI-powered summaries",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-secondary antialiased">
        <ThemeProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

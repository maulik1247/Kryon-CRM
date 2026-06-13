import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { RouteChangeGuard } from "@/components/route-change-guard";
import { AuthProvider } from "@/lib/auth-provider";
import { CrmDataProvider } from "@/lib/crm-data-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kryon CRM",
  description: "CRM proof-of-concept for Kryon BLDC motor controllers",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kryon CRM",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#00b4e6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${dmSans.variable}`}>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <CrmDataProvider>
              <TooltipProvider delayDuration={200}>
                <RouteChangeGuard />
                {children}
                <Toaster position="top-center" richColors closeButton />
              </TooltipProvider>
            </CrmDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

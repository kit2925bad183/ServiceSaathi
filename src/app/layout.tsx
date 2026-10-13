import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";

export const metadata: Metadata = {
  title: "ServiceSaathi | Field Service Management SaaS for India",
  description:
    "Multi-business service-management platform for local AC, appliance repair, electrical, plumbing, and home service companies in India.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-navy-50 text-navy-900 antialiased selection:bg-brand-500 selection:text-white">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

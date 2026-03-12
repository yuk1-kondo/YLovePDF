import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Tools",
  description: "Privacy-first PDF toolkit running fully in your browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} min-h-screen antialiased`}>
        <LanguageProvider>
          <div className="app-bg">
            <div className="fixed right-4 top-4 z-50">
              <LanguageToggle />
            </div>
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}

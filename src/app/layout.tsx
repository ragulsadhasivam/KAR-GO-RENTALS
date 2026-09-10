import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { BootSplash } from "@/components/layout/BootSplash";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KAR GO RENTALS",
  description: "Fleet management for KAR GO RENTALS",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-base text-ink-1">
        <BootSplash />
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(24,24,30,0.92)",
              border: "1px solid var(--color-border)",
              color: "var(--color-ink-1)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}

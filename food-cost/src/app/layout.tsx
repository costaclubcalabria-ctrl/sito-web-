import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Food cost", description: "Controllo del food cost" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2f5d50" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}

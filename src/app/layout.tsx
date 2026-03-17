import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { AdminPanel } from "@/components/ui/AdminPanel";

export const metadata: Metadata = {
  title: "FootyEdge | Football Betting Intelligence",
  description: "Advanced football analytics and value bet identification for English leagues",
  keywords: ["football", "betting", "analytics", "Premier League", "value bets", "predictions"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <AdminPanel />
      </body>
    </html>
  );
}

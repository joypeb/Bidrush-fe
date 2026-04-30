import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BidRush | Night Vintage Drop",
  description: "One scheduled 30-minute vintage live auction drop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

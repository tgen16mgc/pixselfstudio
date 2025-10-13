import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/meta-pixel";
import { CartProvider } from "@/contexts/cart-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixself: The Studio",
  description: "Create your unique pixel character with Pixself Studio - the ultimate pixel art character creator",
  icons: {
    icon: [
      { url: "/favicon-32x32.svg?v=2", sizes: "32x32", type: "image/svg+xml" },
      { url: "/favicon-16x16.svg?v=2", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-touch-icon.svg?v=2", sizes: "180x180", type: "image/svg+xml" },
    shortcut: "/favicon.ico?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <MetaPixel />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

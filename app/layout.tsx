import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: [
    {
      path: "../node_modules/next/dist/client/components/react-dev-overlay/font/geist-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

const geistMono = localFont({
  src: [
    {
      path: "../node_modules/next/dist/client/components/react-dev-overlay/font/geist-mono-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
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
        {children}
      </body>
    </html>
  );
}

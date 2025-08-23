import type { Metadata } from "next";
import "./globals.css";

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
        className="antialiased"
        suppressHydrationWarning={true}
        style={{
          "--font-geist-sans": "'Inter', 'system-ui', 'sans-serif'",
          "--font-geist-mono": "'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'"
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}

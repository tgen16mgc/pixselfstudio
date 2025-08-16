import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
      { url: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/my-app/public/image/logo.png", sizes: "32x32", type: "image/png" },
      { url: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/my-app/public/image/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/my-app/public/image/logo.png", sizes: "180x180", type: "image/png" },
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

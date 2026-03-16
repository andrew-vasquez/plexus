import type { Metadata } from "next";
import {
  Public_Sans,
  IBM_Plex_Mono,
  Syne,
} from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-plexus-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const plexSans = Public_Sans({
  variable: "--font-plexus-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plexus-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Plexus",
    template: "%s | Plexus",
  },
  description:
    "Plexus turns raw guitar audio into editable tabs with a premium browser-based review workflow.",
  metadataBase: new URL("https://plexus.local"),
  applicationName: "Plexus",
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/apple-icon",
  },
  keywords: [
    "Plexus",
    "guitar tab transcription",
    "guitar pro",
    "audio to tabs",
    "music transcription",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Press_Start_2P, Space_Grotesk } from "next/font/google";
import { QueryProvider } from "@/app/_components/query-provider";
import { ThemeProvider } from "@/app/_components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "Neural Link",
  description: "Cyber learning terminal implemented from Figma designs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

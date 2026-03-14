import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth";
import { ThemeProvider } from "@/providers/theme";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PairTrading Panel",
  description: "PairTrading dashboard",
  viewport: { width: "device-width", initialScale: 1, maximumScale: 5 },
  icons: {
    icon: "/logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("pairtrading-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else if(window.matchMedia("(prefers-color-scheme: light)").matches)document.documentElement.setAttribute("data-theme","light");else document.documentElement.setAttribute("data-theme","dark");})();`,
          }}
        />
      </head>
      <body className={`${poppins.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

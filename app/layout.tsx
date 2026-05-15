import type { Metadata } from "next";
import { AuthProvider } from "@/providers/auth";
import { ThemeProvider } from "@/providers/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lyrae Labs",
  description: "Lyrae Labs algorithmic trading platform",
  icons: {
    icon: "/image-4.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
      <body className="antialiased overflow-x-hidden">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

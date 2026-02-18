import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";
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
  title: "MotoHelp | Servicios Mecánicos a Domicilio",
  description: "Plataforma que conecta clientes con mecánicos profesionales a domicilio. Solicita servicios de mantenimiento y reparación de vehículos en tiempo real.",
  keywords: [
    "mecánico a domicilio",
    "servicio mecánico",
    "reparación de vehículos",
    "mantenimiento automotriz",
    "mecánico online",
    "servicios de auto",
  ],
  authors: [{ name: "MotoHelp Team" }],
  creator: "MotoHelp",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://motohelp-iota.vercel.app/",
    siteName: "MotoHelp",
    title: "MotoHelp | Servicios Mecánicos a Domicilio",
    description: "Plataforma que conecta clientes con mecánicos profesionales. Solicita servicios de mantenimiento y reparación en tiempo real.",
    images: [
      {
        url: "https://motohelp-iota.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "MotoHelp - Servicios Mecánicos a Domicilio",
        type: "image/png",
      },
    ],
  },

  // Twitter/X Card
  twitter: {
    card: "summary_large_image",
    title: "MotoHelp | Servicios Mecánicos a Domicilio",
    description: "Conecta con mecánicos profesionales a domicilio. Solicita servicios en tiempo real.",
    images: ["https://motohelp.vercel.app/og-image.png"],
    creator: "@MotoHelp",
  },

  // Additional Meta Tags
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  
  // Icons and App Meta
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MotoHelp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Canonical URL */}
        <link rel="canonical" href="https://motohelp-iota.vercel.app/" />
        
        {/* Additional Security and Performance Headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#ea580c" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Big_Shoulders, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Asfalto° — Motos nuevas y seminuevas",
  description:
    "Concesionario de motos nuevas y seminuevas. Ficha técnica real y un asistente que responde al instante en la web o por WhatsApp.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${bigShoulders.variable} ${manrope.variable} ${jetbrains.variable} antialiased bg-ivory text-ink`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./nucasa.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nu-casa-bucaramanga.universoinvicto.chatgpt.site"),
  title: "nu casa — Espacios que se sienten tuyos",
  description: "Remodelaciones de cocinas, baños y espacios completos en Bucaramanga. Diseño, materiales y una nueva forma de vivir tu casa.",
  openGraph: {
    title: "nu casa — Otra forma de vivir tu espacio",
    description: "Diseño y remodelaciones en Bucaramanga.",
    locale: "es_CO",
    type: "website",
    images: [{ url: "/media/recorrido-poster.jpg", width: 1600, height: 900 }],
  },
  icons: {
    icon: "/brand/simbolo.svg",
    shortcut: "/brand/simbolo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}

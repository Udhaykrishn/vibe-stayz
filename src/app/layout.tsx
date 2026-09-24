import type { Metadata, Viewport } from "next";
import "@/styles/global.css";
import "@/styles/next.css";
import "@/styles/refinement.css";
import "@/styles/brand.css";
import "@/styles/customer.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Vibe Stayz",
  icons: { icon: "/images/favicon.svg" },
  description: "Private villas and beautiful Kerala escapes.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#203403",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

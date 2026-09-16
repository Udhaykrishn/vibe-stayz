import type { Metadata, Viewport } from "next";
import "@/styles/global.css";
import "@/styles/next.css";
import "@/styles/refinement.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Vibe Stayz",
  description: "Private villas and beautiful Kerala escapes.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071f15",
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

import type { Metadata } from "next";
import "@/styles/admin.css";
export const metadata: Metadata = {
  title: { default: "Vibe Stayz Admin", template: "%s · Vibe Stayz Admin" },
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="admin-body">{children}</div>;
}

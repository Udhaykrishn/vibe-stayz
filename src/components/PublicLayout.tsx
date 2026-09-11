import type { SiteData } from "@/types";
import PublicChrome from "./PublicChrome";
export default function PublicLayout({
  data,
  transparent = false,
  detail = false,
  children,
}: {
  data: SiteData;
  transparent?: boolean;
  detail?: boolean;
  children: React.ReactNode;
}) {
  return (
    <PublicChrome data={data} transparent={transparent} detail={detail}>
      {children}
    </PublicChrome>
  );
}

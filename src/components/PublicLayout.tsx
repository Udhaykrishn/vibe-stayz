import type { SiteData } from "@/types";
import PublicChrome from "./PublicChrome";
import PreviewBanner from "./PreviewBanner";
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
    <>
      <PublicChrome data={{settings:data.settings,navigation:data.navigation,locations:data.locations.map(({id,name,slug})=>({id,name,slug}))}} transparent={transparent} detail={detail}>
        {children}
      </PublicChrome>
      <PreviewBanner />
    </>
  );
}

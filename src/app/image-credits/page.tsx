import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import { publicData } from "@/services/data";
import { pageMetadata } from "@/lib/metadata";
import credits from "../../../public/images/credits.json";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await publicData(), {
    title: "Image credits",
    path: "/image-credits",
  });
}
export default async function Credits() {
  const data = await publicData();
  return (
    <PublicLayout data={data}>
      <div className="container section">
        <p className="eyebrow">WITH THANKS</p>
        <h1>Photography & image credits</h1>
        <div className="credits-list">
          {credits.map((c) => (
            <div key={c.sourceUrl}>
              <h2 style={{ fontSize: 28 }}>{c.destination}</h2>
              <p>
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {c.title}
                </a>{" "}
                by {c.author} ·{" "}
                <a
                  href={c.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {c.license}
                </a>
              </p>
              <p>
                Resized and converted to WebP. Display crops may vary. Adapted
                images retain their original licence.
              </p>
            </div>
          ))}
          <p>
            Vibe Stayz branding was provided by the project owner. Sample
            property images are original AI-generated illustrations for this
            preview and do not represent existing accommodation.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

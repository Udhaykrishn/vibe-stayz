import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import Photo from "@/components/Photo";
import { CTA, Trust } from "@/components/Cards";
import { publicData } from "@/services/data";
import { content, paragraphs } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  const data = await publicData();
  const hero = content(data.content, "about", "hero");
  return pageMetadata(data, {
    title: "Our story",
    description: hero?.body,
    path: "/about",
  });
}
export default async function About() {
  const data = await publicData();
  const hero = content(data.content, "about", "hero");
  const story = content(data.content, "about", "story");
  const mission = content(data.content, "about", "mission");
  return (
    <PublicLayout data={data}>
      <section className="about-hero">
        <div className="page-heading">
          <p className="eyebrow">{hero?.eyebrow}</p>
          <h1>{hero?.title}</h1>
          <p className="lede">{hero?.body}</p>
        </div>
        <Photo
          src={hero?.image || ""}
          alt="Vibe Stayz identity, inspired by nature"
          eager
          sizes="(max-width:767px) 100vw, 50vw"
        />
      </section>
      <section className="section container two-column">
        <Photo
          src={story?.image || ""}
          alt="A quiet cabin surrounded by tea hills"
          sizes="(max-width:767px) 100vw, 50vw"
        />
        <div>
          <p className="eyebrow">{story?.eyebrow}</p>
          <h2>{story?.title}</h2>
          <div className="prose">
            {paragraphs(story?.body || "").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="container philosophy">
        <p className="eyebrow">{mission?.eyebrow}</p>
        <h2>{mission?.title}</h2>
        <p>{mission?.body}</p>
        <a className="button button-dark" href={mission?.cta_url}>
          {mission?.cta_label}
        </a>
      </section>
      <Trust />
      <CTA data={data} />
    </PublicLayout>
  );
}

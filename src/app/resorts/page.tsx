import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import Icon from "@/components/Icon";
import SortSelect from "@/components/SortSelect";
import { CTA, ResortCard } from "@/components/Cards";
import { siteData } from "@/services/data";
import { content } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : value || "";
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const data = await siteData();
  const c = content(data.content, "resorts", "hero");
  return pageMetadata(data, {
    title: "Explore resorts & private stays",
    description: c?.body,
    path: "/resorts",
    noindex: Object.values(params).some(Boolean),
  });
}
export default async function Resorts({ searchParams }: Props) {
  const data = await siteData();
  const c = content(data.content, "resorts", "hero");
  const params = await searchParams;
  const q = one(params.q).trim();
  const location = one(params.location);
  const type = one(params.type);
  const guests = Math.max(0, Number(one(params.guests)) || 0);
  const selectedAmenities = Array.isArray(params.amenity)
    ? params.amenity
    : params.amenity
      ? [params.amenity]
      : [];
  const sort = one(params.sort) || "recommended";
  let results = data.resorts.filter(
    (r) =>
      (!q ||
        `${r.name} ${r.location.name} ${r.subtitle}`
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (!location || r.location.slug === location) &&
      (!type || r.property_type === type) &&
      r.max_guests >= guests &&
      selectedAmenities.every((a) => r.amenities.some((x) => x.id === a)),
  );
  if (sort === "price-low")
    results.sort(
      (a, b) => (a.starting_price ?? Infinity) - (b.starting_price ?? Infinity),
    );
  if (sort === "price-high")
    results.sort((a, b) => (b.starting_price ?? 0) - (a.starting_price ?? 0));
  const types = [...new Set(data.resorts.map((r) => r.property_type))];
  const hasFilter =
    !!q || !!location || !!type || !!guests || !!selectedAmenities.length;
  return (
    <PublicLayout data={data}>
      <div className="container">
        <section className="page-heading">
          <p className="eyebrow">{c?.eyebrow}</p>
          <h1>{c?.title}</h1>
          <p className="lede">{c?.body}</p>
        </section>
        <form id="resort-filters" action="/resorts" role="search">
          <div className="filter-form">
            <div className="filter-search">
              <label htmlFor="q">Search stays or destinations</label>
              <input
                type="search"
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Where would you like to escape?"
              />
            </div>
            <div>
              <label htmlFor="location">Destination</label>
              <select name="location" id="location" defaultValue={location}>
                <option value="">All destinations</option>
                {data.locations.map((l) => (
                  <option key={l.id} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="type">Your kind of stay</label>
              <select name="type" id="type" defaultValue={type}>
                <option value="">All stay types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="guests">Group size</label>
              <select id="guests" name="guests" defaultValue={guests || ""}>
                <option value="">Any group size</option>
                {[2, 4, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}+ guests
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="button button-dark">
              <Icon name="search" size={18} />
              Find stays
            </button>
          </div>
          <div className="filter-extras">
            <span className="filter-label">THE LITTLE EXTRAS</span>
            {data.amenities
              .filter(
                (a) =>
                  ["pool", "pets", "breakfast", "mountain"].includes(a.id) ||
                  selectedAmenities.includes(a.id),
              )
              .slice(0, 6)
              .map((a) => (
                <label key={a.id}>
                  <input
                    type="checkbox"
                    name="amenity"
                    value={a.id}
                    defaultChecked={selectedAmenities.includes(a.id)}
                  />
                  {a.name}
                </label>
              ))}
            {hasFilter && (
              <a href="/resorts" className="text-link">
                Clear filters
                <Icon name="close" size={14} />
              </a>
            )}
          </div>
          <div className="results-head">
            <p aria-live="polite">
              <strong>{results.length}</strong>{" "}
              {results.length === 1 ? "beautiful stay" : "beautiful stays"}
              {location
                ? " in " +
                  (data.locations.find((l) => l.slug === location)?.name ||
                    location)
                : " to make your own"}
            </p>
            <label htmlFor="sort" className="sort-label">
              Sort by <SortSelect value={sort} />
            </label>
          </div>
        </form>
        <section className="results-section" aria-label="Resort results">
          <div className="stays-grid">
            {results.map((r) => (
              <ResortCard key={r.id} resort={r} />
            ))}
            {!results.length && (
              <div className="empty-state">
                <Icon name="search" size={30} />
                <h2>A different path to your perfect stay.</h2>
                <p>
                  We couldn’t find a stay matching these filters. Try another
                  destination or a smaller group size.
                </p>
                <a href="/resorts" className="button button-dark">
                  Explore all stays
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
      <CTA data={data} />
    </PublicLayout>
  );
}

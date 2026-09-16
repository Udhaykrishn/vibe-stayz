"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import SelectControl from "./SelectControl";
import type { FilterValues } from "./StayFilters";

type SearchValues = { q: string; location: string; guests: string };
export default function StaySearch({ locations, values, instant = false }: {
  locations: { slug: string; name: string }[];
  values?: FilterValues;
  instant?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState<SearchValues>({ q: values?.q || "", location: values?.location || "", guests: values?.guests || "" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    setSearch({ q: values?.q || "", location: values?.location || "", guests: values?.guests || "" });
  }, [values?.q, values?.location, values?.guests]);
  function navigate(next: SearchValues) {
    if (timer.current) clearTimeout(timer.current);
    const params = new URLSearchParams();
    Object.entries({ ...values, ...next }).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach(v => params.append(key, v));
      else if (value) params.set(key, value.trim());
    });
    startTransition(() => router.push(`/resorts?${params}`, { scroll: !instant }));
  }
  function update(key: keyof SearchValues, value: string) {
    const next = { ...search, [key]: value };
    setSearch(next);
    if (timer.current) clearTimeout(timer.current);
    if (instant) timer.current = setTimeout(() => navigate(next), key === "q" ? 350 : 0);
  }
  return <form action="/resorts" className={`hero-finder ${instant ? "listing-search" : "container"}`} role="search" aria-label="Find a stay" aria-busy={pending} onSubmit={e => { e.preventDefault(); navigate(search); }}>
    <label className="finder-search"><span className="control-label">Your next escape</span><span><Icon name="search" size={20}/><input name="q" type="search" placeholder="A stay or destination" value={search.q} onChange={e => update("q", e.target.value)}/></span></label>
    <SelectControl name="location" label="Destination" value={search.location} onChange={v => update("location", v)} options={[{ value: "", label: "Anywhere in Kerala" }, ...locations.map(l => ({ value: l.slug, label: l.name }))]}/>
    <SelectControl name="guests" label="Guests" value={search.guests} onChange={v => update("guests", v)} options={[{ value: "", label: "Room for everyone" }, ...[2,4,6,8,10,12,16,20].map(n => ({ value: String(n), label: `${n}+ guests` }))]}/>
    <button type="submit" className="button button-dark"><Icon name="search" size={19}/>{pending ? "Finding stays…" : "Find your stay"}</button>
    <span className="sr-only" role="status">{pending ? "Updating stays" : ""}</span>
  </form>;
}

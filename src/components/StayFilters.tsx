"use client";
import { useRef } from "react";
import type { Amenity, Location } from "@/types";
import Icon from "./Icon";
import SelectControl from "./SelectControl";
export type FilterValues = { q: string; location: string; type: string; guests: string; bedrooms: string; maxPrice: string; amenity: string[]; sort: string };
export default function StayFilters({ locations, amenities, types, values }: { locations: Pick<Location, "slug" | "name">[]; amenities: Pick<Amenity,"id"|"name">[]; types: string[]; values: FilterValues }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const controls = (prefix: string) => <form action="/resorts" className="stay-filter-form" role="search" aria-label="Filter stays">
    <div className="filter-title"><h2>Make it your stay</h2><a href="/resorts">Clear all</a></div>
    <input type="hidden" name="q" value={values.q}/><input type="hidden" name="location" value={values.location}/><input type="hidden" name="guests" value={values.guests}/>
    <SelectControl name="type" label="Your kind of stay" value={values.type} options={[{value:"",label:"All stay types"},...types.map(t=>({value:t,label:t}))]}/>

    <fieldset className="bedroom-filter"><legend>Minimum bedrooms</legend>{[0,1,2,3,4,5].map(n=><label key={n}><input type="radio" name="bedrooms" value={n || ""} defaultChecked={String(n || "")===values.bedrooms}/><span>{n || "Any"}{n===5?"+":""}</span></label>)}</fieldset>
    <label className="control-label" htmlFor={`${prefix}-price`}>Maximum nightly price (₹)</label><input className="price-filter" type="number" min="0" step="500" name="maxPrice" id={`${prefix}-price`} placeholder="No limit" defaultValue={values.maxPrice}/>
    <fieldset className="amenity-filter"><legend>The little extras</legend>{amenities.map(a=><label key={a.id}><input type="checkbox" name="amenity" value={a.id} defaultChecked={values.amenity.includes(a.id)}/>{a.name}</label>)}</fieldset>
    <input type="hidden" name="sort" value={values.sort}/><button className="button button-dark" type="submit">Apply filters<Icon name="arrow" size={18}/></button>
  </form>;
  return <><button className="button button-outline mobile-filter-button" onClick={()=>dialog.current?.showModal()}><Icon name="sliders" size={18}/>Filters</button><aside className="desktop-filters">{controls("desktop")}</aside><dialog ref={dialog} className="filter-drawer" onClick={e=>{if(e.target===dialog.current)dialog.current.close();}} aria-label="Stay filters"><div className="drawer-heading"><span>Find your escape</span><button type="button" className="icon-button" aria-label="Close filters" onClick={()=>dialog.current?.close()}><Icon name="close"/></button></div>{controls("mobile")}</dialog></>;
}

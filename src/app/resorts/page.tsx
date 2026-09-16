import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import Icon from "@/components/Icon";
import StaySearch from "@/components/StaySearch";
import SortSelect from "@/components/SortSelect";
import StayFilters, { type FilterValues } from "@/components/StayFilters";
import { CTA, ResortCard } from "@/components/Cards";
import { publicData } from "@/services/data";
import { pageMetadata } from "@/lib/metadata";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] || "" : v || "";
export async function generateMetadata({searchParams}:Props):Promise<Metadata> {
 return pageMetadata(await publicData(),{title:"Get Your Stay",path:"/resorts",noindex:Object.values(await searchParams).some(Boolean)});
}
export default async function Resorts({searchParams}:Props) {
 const data=await publicData(); const params=await searchParams;
 const values:FilterValues={q:one(params.q).trim(),location:one(params.location),type:one(params.type),guests:one(params.guests),bedrooms:one(params.bedrooms),maxPrice:one(params.maxPrice),sort:one(params.sort)||"recommended",amenity:Array.isArray(params.amenity)?params.amenity:params.amenity?[params.amenity]:[]};
 const price=(r: typeof data.resorts[number])=>r.promotion?.price??r.starting_price;
 const results=data.resorts.filter(r=>(!values.q||`${r.name} ${r.location.name} ${r.subtitle}`.toLowerCase().includes(values.q.toLowerCase()))&&(!values.location||r.location.slug===values.location)&&(!values.type||r.property_type===values.type)&&r.max_guests>=(Number(values.guests)||0)&&(r.bedrooms||0)>=(Number(values.bedrooms)||0)&&(!values.maxPrice||(price(r)!==null&&price(r)!<=Number(values.maxPrice)))&&values.amenity.every(a=>r.amenities.some(x=>x.id===a)));
 if(values.sort==="price-low")results.sort((a,b)=>(price(a)??Infinity)-(price(b)??Infinity));
 if(values.sort==="price-high")results.sort((a,b)=>(price(b)??-1)-(price(a)??-1));
 if(values.sort==="newest")results.sort((a,b)=>(b.created_at||b.updated_at).localeCompare(a.created_at||a.updated_at) || a.id.localeCompare(b.id));
 const chips:[string,string,string?][]=[];
 for(const key of ["q","location","type","guests","bedrooms","maxPrice"] as const)if(values[key])chips.push([key,key==="location"?data.locations.find(l=>l.slug===values.location)?.name||values.location:key==="guests"?values[key]+"+ guests":key==="bedrooms"?values[key]+"+ bedrooms":key==="maxPrice"?"Under ₹"+values[key]:values[key]]);
 values.amenity.forEach(a=>chips.push(["amenity",data.amenities.find(x=>x.id===a)?.name||a,a]));
 const remove=(key:string,value?:string)=>{const p=new URLSearchParams();Object.entries(values).forEach(([k,v])=>{if(Array.isArray(v))v.filter(x=>!(k===key&&x===value)).forEach(x=>p.append(k,x));else if(v&&k!==key)p.set(k,v);});return "/resorts?"+p.toString();};
 return <PublicLayout data={data}><div className="listing-container">
  <h1 className="sr-only">Find your stay in Kerala</h1>

  <div className="discovery-layout"><StayFilters locations={data.locations.map(({slug,name})=>({slug,name}))} amenities={data.amenities.map(({id,name})=>({id,name}))} types={[...new Set(data.resorts.map(r=>r.property_type))]} values={values}/>
  <StaySearch locations={data.locations.map(({slug,name})=>({slug,name}))} values={values} instant/>
  <section className="listing-results" aria-label="Stay results"><div className="results-head"><p role="status" aria-live="polite"><strong>{results.length}</strong> {results.length===1?"stay":"stays"} to make your own</p><SortSelect value={values.sort}/></div>
  {chips.length>0&&<div className="active-filters" aria-label="Active filters">{chips.map(([key,label,value])=><a key={key+(value||"")} href={remove(key,value)}>{label}<Icon name="close" size={14}/><span className="sr-only">Remove filter</span></a>)}<a href="/resorts">Clear all</a></div>}
  <div className="stays-grid">{results.map(r=><ResortCard key={r.id} resort={r}/>)}</div>
  {!results.length&&<div className="empty-state"><Icon name="search" size={32}/><h2>A little more room to explore.</h2><p>Try fewer filters or a different destination.<br/>Our team can also help you find a stay for your group.</p><a className="button button-dark" href="/resorts">Clear filters</a><a className="text-link" href="/contact">Ask our team</a></div>}
  </section></div></div>
  <CTA data={data}/></PublicLayout>;
}

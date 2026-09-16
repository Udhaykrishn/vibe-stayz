import { notFound } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { OfferCard, ResortCard } from "@/components/Cards";
import { siteData } from "@/services/data";
import { effectivePromotion } from "@/lib/offers";
export default async function OfferPreview({searchParams}:{searchParams:Promise<{offer?:string}>}) {
 const data=await siteData("admin");const id=(await searchParams).offer;const o=data.offers.find(o=>o.id===id);if(!o)notFound();
 const stays=o.resorts.map(r=>({...r,promotion:effectivePromotion(r,[{...o,active:1,start_date:"",end_date:""}],data.offerLinks)}));
 return <AdminLayout title="Campaign preview" description="Preview only. Scheduled and disabled campaigns remain hidden from the public site."><OfferCard offer={{...o,resorts:stays}} settings={data.settings}/><div className="section stays-grid">{stays.map(r=><ResortCard key={r.id} resort={r}/>)}</div></AdminLayout>;
}

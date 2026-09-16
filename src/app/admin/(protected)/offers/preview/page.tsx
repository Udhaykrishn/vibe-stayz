import { notFound } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import PromotionHero from "@/components/PromotionHero";
import { ResortCard } from "@/components/Cards";
import { siteData } from "@/services/data";
import { effectivePromotion } from "@/lib/offers";
import { money } from "@/utils/format";
export default async function OfferPreview({searchParams}:{searchParams:Promise<{offer?:string}>}) {
 const data=await siteData("admin");const id=(await searchParams).offer;const o=data.offers.find(o=>o.id===id);if(!o)notFound();
 const stays=o.resorts.map(r=>({...r,promotion:effectivePromotion(r,[{...o,active:1,start_date:"",end_date:""}],data.offerLinks)}));
 const p=stays.find(r=>r.promotion)?.promotion;
 return <AdminLayout title="Campaign preview" description="Preview only. Scheduled and disabled campaigns remain hidden from the public site."><PromotionHero locations={[]} slides={[{id:o.id,title:o.title,subtitle:o.promotional_text,image:o.image||stays[0]?.cover_image||"/images/hero-1680.webp",mobileImage:o.mobile_image,badge:o.badge,href:stays[0]?`/resorts/${stays[0].slug}`:"/resorts",cta:o.cta_label||"Explore stays",savings:p?`${money(p.base-p.price)} OFF`:undefined}]}/><div className="section stays-grid">{stays.map(r=><ResortCard key={r.id} resort={r}/>)}</div></AdminLayout>;
}

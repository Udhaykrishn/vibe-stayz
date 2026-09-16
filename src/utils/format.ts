import type {Settings,ResortView,PageContent} from '../types';
export const money=(n:number|null)=>n===null?'Price on enquiry':new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
export const paragraphs=(s:string)=>s.split(/\n\s*\n/).map(t=>t.trim()).filter(Boolean);
export const content=(all:PageContent[],page:string,section:string)=>all.find(c=>c.page===page&&c.section===section);
export const digits=(s:string)=>s.replace(/\D/g,'');
export function whatsappLink(settings:Settings,property?:ResortView,url='') {
 const number=digits(property?.whatsapp_override||settings.whatsapp);
 if(!number) return '/contact?enquiry=whatsapp';
 const values:Record<string,string>={greeting:settings.greeting,property:property?.name||'',location:property?.location.name||'',url};
 const message=property?.promotion?`${settings.greeting}\nI'm interested in ${property.promotion.title} for ${property.name} in ${property.location.name}. Could you confirm availability and the current ${money(property.promotion.price)} offer?\n${url}`:property?settings.property_template.replace(/\{(greeting|property|location|url)\}/g,(_,k:string)=>values[k]||''):`${settings.greeting}\n${settings.enquiry_message}`;
 return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
export function imageSet(url:string){return /-(640|1080|1680)\.webp$/.test(url)?[640,1080,1680].map(w=>`${url.replace(/-(640|1080|1680)\.webp$/,`-${w}.webp`)} ${w}w`).join(', '):undefined;}
export const safeJson=(o:unknown)=>JSON.stringify(o).replace(/</g,'\\u003c');
/** Fill {placeholders} in an editor-written template. Unknown keys resolve to nothing. */
export const fill=(template:string,values:Record<string,string>)=>template.replace(/\{(\w+)\}/g,(_,key:string)=>values[key]??'').replace(/\s+·\s+$|^\s+·\s+/,'').trim();

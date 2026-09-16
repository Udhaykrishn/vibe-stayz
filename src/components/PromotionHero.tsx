"use client";
import { useEffect, useRef, useState } from "react";
import type { PageContent } from "@/types";
import Icon from "./Icon";
import Photo from "./Photo";
import StaySearch from "./StaySearch";
export type HeroSlide = { id: string; title: string; subtitle: string; image: string; mobileImage?: string; badge: string; href: string; cta: string; savings?: string; detail?: string; ends?: string; starts?: string };
export default function PromotionHero({ slides, hero, fallback: fallbackCopy, locations }: { slides: HeroSlide[]; hero?: PageContent; fallback?: PageContent; locations: {slug:string;name:string}[] }) {
 const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const [hovered,setHovered]=useState(false);const [focused,setFocused]=useState(false);const [touching,setTouching]=useState(false);const [previous,setPrevious]=useState<number|null>(null);const [direction,setDirection]=useState(1);const movingUntil=useRef(0);const [reduced,setReduced]=useState(false);const [visible,setVisible]=useState(true);const [today,setToday]=useState("");const touch=useRef<{x:number;y:number}|null>(null);
 useEffect(()=>{const mq=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReduced(mq.matches);update();mq.addEventListener("change",update);const state=()=>{setVisible(!document.hidden);setToday(new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()));};state();document.addEventListener("visibilitychange",state);const timer=setInterval(state,30000);return()=>{mq.removeEventListener("change",update);document.removeEventListener("visibilitychange",state);clearInterval(timer);};},[]);
 const currentSlides=slides.filter(s=>!today||(!s.ends||s.ends>=today)&&(!s.starts||s.starts<=today));
 const fallback:HeroSlide={id:"default",title:hero?.title||"Find a stay that feels like yours.",subtitle:hero?.body||"Private villas, cabins and beautiful Kerala escapes.",image:hero?.image||"/images/hero-1680.webp",badge:hero?.eyebrow||"STAY · ESCAPE · EXPERIENCE",href:hero?.cta_url||"/resorts",cta:hero?.cta_label||"Explore stays"};
 // Both standby slides are editable from Site content: home/hero leads, home/carousel_fallback follows.
 const standby:HeroSlide={...fallback,id:"escape",title:fallbackCopy?.title||"A little closer to nature.",subtitle:fallbackCopy?.body||fallback.subtitle,image:fallbackCopy?.image||"/images/cabin-1680.webp",badge:fallbackCopy?.eyebrow||"YOUR NEXT KERALA ESCAPE",href:fallbackCopy?.cta_url||fallback.href,cta:fallbackCopy?.cta_label||fallback.cta};
 const items=currentSlides.length?currentSlides:[fallback,standby];const active=index%items.length;
 const move=(n:number)=>{
   if(items.length<2||Date.now()<movingUntil.current)return;
   movingUntil.current=Date.now()+800;
   setPrevious(active);setDirection(n>0?1:-1);setIndex((active+n+items.length)%items.length);
 };
 useEffect(()=>{
   if(paused||hovered||focused||touching||reduced||!visible||items.length<2)return;
   const timer=setTimeout(()=>{
     setPrevious(active);setDirection(1);setIndex((active+1)%items.length);
     movingUntil.current=Date.now()+800;
   },20000);
   return()=>clearTimeout(timer);
 },[paused,hovered,focused,touching,reduced,visible,items.length,active]);
 return <section className={`promotion-hero${previous!==null?" has-transition":""}${direction<0?" slides-backward":""}`} aria-label="Featured escapes" aria-roledescription="carousel"
   onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
   onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}}
   onTouchStart={e=>{
     setTouching(true);
     if((e.target as HTMLElement).closest("form, button, a")){touch.current=null;return;}
     touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};
   }}
   onTouchCancel={()=>{touch.current=null;setTouching(false);}}
   onTouchEnd={e=>{
     if(touch.current){const dx=e.changedTouches[0].clientX-touch.current.x;const dy=e.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))move(dx>0?-1:1);}
     touch.current=null;setTouching(false);
   }}>

  <div className="hero-slides">{items.map((s,i)=><div key={s.id} className={`hero-slide${i===active?" is-active":i===previous?" is-outgoing":""}`} aria-hidden={i!==active} inert={i!==active} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${items.length}`}>
   <picture>{s.mobileImage&&<source media="(max-width: 767px)" srcSet={s.mobileImage}/>}<Photo className="promotion-image" src={s.image} alt={s.title} eager={i===0} sizes="100vw"/></picture><div className="promotion-shade"/>
   <div className="hero-slide-content container"><p className="eyebrow">{s.badge}</p>{i===active?<h1>{s.title}</h1>:<h2>{s.title}</h2>}<p className="hero-slide-subtitle">{s.subtitle}</p>{s.detail&&<p className="hero-offer-detail">{s.detail}</p>}{s.savings&&<p className="hero-offer-saving">{s.savings}</p>}<a href={s.href} className="button button-lime">{s.cta}<Icon name="arrow" size={19}/></a></div>
  </div>)}</div>
  {items.length>1&&<><button className="hero-prev icon-button" aria-label="Previous promotion" onClick={()=>move(-1)}><Icon name="arrow"/></button><button className="hero-next icon-button" aria-label="Next promotion" onClick={()=>move(1)}><Icon name="arrow"/></button><div className="hero-pagination">{items.map((s,i)=><button key={s.id} aria-label={`Show promotion ${i+1}`} aria-pressed={i===active} onClick={()=>{if(i!==active)move(i-active);}}><span/></button>)}<button aria-label={paused?"Play promotions":"Pause promotions"} onClick={()=>setPaused(!paused)}><Icon name={paused?"play":"pause"} size={16}/></button></div></>}
  <StaySearch locations={locations}/>
 </section>;
}

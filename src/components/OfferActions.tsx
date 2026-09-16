"use client";
import { useState } from "react";
export default function OfferActions({ id, active }: { id:string; active:number }) {
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const act=async(remove=false)=>{if(remove&&!window.confirm("Delete this campaign and its stay prices?"))return;setBusy(true);setError("");try{const csrf=document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content||"";const res=await fetch("/api/admin/offers",{method:remove?"DELETE":"POST",headers:{"Content-Type":"application/json","x-csrf-token":csrf},body:JSON.stringify(remove?{id}:{id,fields:{active:active?0:1}})});if(!res.ok)throw new Error((await res.json()).error||"Could not update campaign.");window.location.reload();}catch(e){setError((e as Error).message);setBusy(false);}};
 return <><button className="button button-outline" disabled={busy} onClick={()=>act()}>{active?"Disable":"Enable"}</button><button className="danger-button" disabled={busy} onClick={()=>act(true)}>Delete</button>{error&&<p role="alert">{error}</p>}</>;
}

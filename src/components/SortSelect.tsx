"use client";
import SelectControl from "./SelectControl";
export default function SortSelect({ value }: { value: string }) {
  return (
    <SelectControl name="sort" label="Sort by" value={value} options={[{value:"recommended",label:"Recommended"},{value:"price-low",label:"Price: low to high"},{value:"price-high",label:"Price: high to low"},{value:"newest",label:"Newest first"}]} onChange={v=>{const url=new URL(window.location.href);url.searchParams.set("sort",v);window.location.assign(url.href);}}/>
  );
}

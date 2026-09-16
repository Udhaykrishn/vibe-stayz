"use client";
import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";
type Option = { value: string; label: string };
export default function SelectControl({ name, label, options, value = "", onChange }: { name: string; label: string; options: Option[]; value?: string; onChange?: (value: string) => void }) {
  const id = useId(); const root = useRef<HTMLDivElement>(null); const button = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState(value); const [open, setOpen] = useState(false); const [focus, setFocus] = useState(0);
  useEffect(() => setSelected(value), [value]);
  useEffect(() => { const close = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, []);
  const choose = (v: string) => { setSelected(v); onChange?.(v); setOpen(false); button.current?.focus(); };
  return <div className="select-control" ref={root} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <span id={`${id}-label`} className="control-label">{label}</span><input type="hidden" name={name} value={selected}/>
    <button type="button" ref={button} role="combobox" aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-controls={`${id}-list`} aria-haspopup="listbox" aria-activedescendant={open ? `${id}-${focus}` : undefined} onClick={() => { setOpen(!open); setFocus(Math.max(0, options.findIndex(o => o.value === selected))); }} onKeyDown={e => {
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) { e.preventDefault(); setOpen(true); setFocus(i => e.key === "Home" ? 0 : e.key === "End" ? options.length - 1 : Math.max(0, Math.min(options.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))); }
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (open) choose(options[focus].value); else setOpen(true); }
      if (e.key.length === 1 && e.key !== " ") { const i = options.findIndex(o => o.label.toLowerCase().startsWith(e.key.toLowerCase())); if (i >= 0) { setOpen(true); setFocus(i); } }
    }}><span id={`${id}-value`}>{options.find(o => o.value === selected)?.label || options[0]?.label}</span><Icon name="down" size={17}/></button>
    {open && <ul role="listbox" id={`${id}-list`} aria-labelledby={`${id}-label`}>{options.map((o, i) => <li role="option" aria-selected={o.value === selected} id={`${id}-${i}`} key={o.value} className={focus === i ? "focused" : ""} onMouseDown={e => e.preventDefault()} onClick={() => choose(o.value)}>{o.label}{o.value === selected && <Icon name="check" size={16}/>}</li>)}</ul>}
  </div>;
}

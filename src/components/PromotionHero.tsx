"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HeroBanner } from "@/types";
import Icon from "./Icon";
import Photo from "./Photo";

const SLIDE_INTERVAL = 9000;
const TRANSITION_DURATION = 800;

/** Banner content is independent of the search form supplied through children. */
export default function PromotionHero({ banners, children }: { banners: HeroBanner[]; children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const movingUntil = useRef(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const active = banners.length ? index % banners.length : 0;
  const autoPlaying = !paused && !hovered && !focused && !touching && !reduced && visible;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(mq.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    mq.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      mq.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  function move(offset: number) {
    if (banners.length < 2 || Date.now() < movingUntil.current) return;
    movingUntil.current = Date.now() + (reduced ? 0 : TRANSITION_DURATION);
    setPrevious(active);
    setDirection(offset > 0 ? 1 : -1);
    setIndex((active + offset + banners.length) % banners.length);
  }

  useEffect(() => {
    if (!autoPlaying || banners.length < 2) return;
    const timer = setTimeout(() => {
      setPrevious(active);
      setDirection(1);
      setIndex((active + 1) % banners.length);
      movingUntil.current = Date.now() + TRANSITION_DURATION;
    }, SLIDE_INTERVAL);
    return () => clearTimeout(timer);
  }, [autoPlaying, banners.length, active]);

  return (
    <section
      className={`promotion-hero${previous !== null ? " has-transition" : ""}${direction < 0 ? " slides-backward" : ""}`}
      aria-label="Featured escapes"
      aria-roledescription={banners.length ? "carousel" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => {
        if ((event.target as HTMLElement).closest("form")) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onTouchStart={event => {
        setTouching(true);
        if ((event.target as HTMLElement).closest("form, button, a")) { touch.current = null; return; }
        touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }}
      onTouchCancel={() => { touch.current = null; setTouching(false); }}
      onTouchEnd={event => {
        if (touch.current) {
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? -1 : 1);
        }
        touch.current = null;
        setTouching(false);
      }}
    >
      <div className="hero-slides">
        {banners.map((banner, i) => (
          <div key={banner.id} className={`hero-slide${i === active ? " is-active" : i === previous ? " is-outgoing" : ""}`}
            aria-hidden={i !== active} inert={i !== active} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${banners.length}`}>
            <Photo className="promotion-image" src={banner.image} alt={banner.title} eager={i === 0} sizes="100vw" />
            <div className="promotion-shade" />
            <div className="hero-slide-content container">
              {banner.label && <p className="eyebrow">{banner.label}</p>}
              {i === active ? <h1>{banner.title}</h1> : <h2>{banner.title}</h2>}
              {banner.subtitle && <p className="hero-slide-subtitle">{banner.subtitle}</p>}
              <a href={banner.cta_url} className="button button-lime">{banner.cta_label}<Icon name="arrow" size={19} /></a>
            </div>
          </div>
        ))}
      </div>
      {!banners.length && <div className="hero-slide-content container"><h1>Find your next escape.</h1><p className="hero-slide-subtitle">Explore our collection of beautiful stays.</p><a href="/resorts" className="button button-lime">Explore resorts<Icon name="arrow" size={19} /></a></div>}
      {banners.length > 1 && <>
        <button type="button" className="hero-prev icon-button" aria-label="Previous banner" onClick={() => move(-1)}><Icon name="arrow" /></button>
        <button type="button" className="hero-next icon-button" aria-label="Next banner" onClick={() => move(1)}><Icon name="arrow" /></button>
        <div className="hero-pagination">
          <div className="hero-dots" aria-label="Choose a banner">{banners.map((banner, i) => <button type="button" key={banner.id} aria-label={`Show banner ${i + 1}`} aria-pressed={i === active} onClick={() => { if (i !== active) move(i - active); }}><span /></button>)}</div>
          {!reduced && <button type="button" aria-label={paused ? "Play banners" : "Pause banners"} onClick={() => setPaused(!paused)}><Icon name={paused ? "play" : "pause"} size={16} /></button>}
        </div>
        <p className="sr-only" aria-live={autoPlaying ? "off" : "polite"} aria-atomic="true">Banner {active + 1} of {banners.length}: {banners[active].title}</p>
      </>}
      {children}
    </section>
  );
}

"use client";
import { useRef, useState } from "react";
import type { GalleryImage } from "@/types";
import Photo from "./Photo";
import Icon from "./Icon";
export default function Gallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const touch = useRef(0);
  const show = (next: number) =>
    setIndex((next + images.length) % images.length);
  const open = () => {
    if (typeof dialog.current?.showModal === "function") dialog.current.showModal();
    else dialog.current?.setAttribute("open", "");
  };
  const close = () => {
    if (typeof dialog.current?.close === "function") dialog.current.close();
    else dialog.current?.removeAttribute("open");
  };
  return (
    <>
      <div
        className={`property-gallery${images.length < 3 ? " gallery-small" : ""}`}
        aria-label={`${name} photos`}
        tabIndex={0}
      >
        {images.slice(0, 5).map((image, i) => (
          <button
            key={image.id}
            className={`gallery-photo gallery-photo-${i}`}
            onClick={() => {
              show(i);
                open();
            }}
            aria-label={`View photo ${i + 1}: ${image.alt}`}
          >
            <Photo
              src={image.url}
              alt={image.alt}
              eager={i === 0}
              sizes={
                i === 0
                  ? "(max-width:767px) 100vw, 60vw"
                  : "(max-width:767px) 100vw, 25vw"
              }
            />
          </button>
        ))}
        <button
          className="gallery-all"
          onClick={() => {
            show(0);
            open();
          }}
        >
          <Icon name="grid" size={17} />
          View all {images.length} photos
        </button>
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        onTouchStart={e=>{touch.current=e.touches[0].clientX;}}
        onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touch.current;if(Math.abs(dx)>60)show(index+(dx<0?1:-1));}}
        id="photo-lightbox"
        aria-labelledby="gallery-title"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") show(index + 1);
          if (event.key === "ArrowLeft") show(index - 1);
        }}
      >
        <div className="lightbox-top">
          <h2 id="gallery-title">{name}</h2>
          <p aria-live="polite">
            {index + 1} / {images.length}
          </p>
          <button
              onClick={close}
            className="icon-button"
            aria-label="Close gallery"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="lightbox-stage">
          <button
            className="gallery-prev icon-button"
            aria-label="Previous photo"
            onClick={() => show(index - 1)}
          >
            <Icon name="arrow" />
          </button>
          <figure>
            <img src={images[index]?.url} alt={images[index]?.alt} />
            <figcaption>{images[index]?.alt}</figcaption>
          </figure>
          <button
            className="gallery-next icon-button"
            aria-label="Next photo"
            onClick={() => show(index + 1)}
          >
            <Icon name="arrow" />
          </button>
        </div>
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => show(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === index}
            >
              <img
                src={img.url}
                alt=""
                loading="lazy"
                width="100"
                height="70"
              />
            </button>
          ))}
        </div>
      </dialog>
    </>
  );
}

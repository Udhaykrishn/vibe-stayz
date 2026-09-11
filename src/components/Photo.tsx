import { imageSet } from "@/utils/format";

export default function Photo({
  src,
  alt,
  className = "",
  eager = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  return (
    <img
      src={src || "/images/heritage-640.webp"}
      srcSet={imageSet(src)}
      sizes={sizes}
      alt={alt}
      className={className}
      width="1680"
      height="1120"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      data-photo
    />
  );
}

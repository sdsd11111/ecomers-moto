"use client";

import { useState, useEffect } from "react";

const CATEGORY_IMAGES: Record<string, string> = {
  adventure: "/motos/adventure.png",
  touring: "/motos/adventure.png",
  cruiser: "/motos/cruiser.png",
  sport: "/motos/default.png",
  naked: "/motos/default.png",
  scooter: "/motos/default.png",
  urbana: "/motos/default.png",
};

const DEFAULT_IMAGE = "/motos/default.png";

export default function MotoThumb({
  src,
  categoria,
  alt = "Fotografía de motocicleta",
  seed,
  className = "",
}: {
  src?: string;
  categoria?: string;
  alt?: string;
  seed?: string;
  className?: string;
}) {
  // Use category image as primary since individual moto images don't exist yet
  const categoryImage = categoria ? CATEGORY_IMAGES[categoria] : undefined;
  const resolvedSrc = categoryImage || src || DEFAULT_IMAGE;
  const [imgSrc, setImgSrc] = useState(resolvedSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(resolvedSrc);
    setHasError(false);
  }, [resolvedSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_IMAGE);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-[#18181a] ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
    </div>
  );
}


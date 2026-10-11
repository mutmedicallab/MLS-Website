import { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function Slideshow({ photos, seed = 0, interactive = false, natural = false, objectPosition = "center" }) {
  const [index, setIndex] = useState(0);

  const normalized = photos.map((p) =>
    typeof p === "string" ? { src: p, label: null } : p
  );

  useEffect(() => {
    if (normalized.length <= 1) return;
    const offset = (seed * 900) % 3200;
    let interval;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % normalized.length);
      }, 3400);
    }, offset);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [normalized.length, seed]);

  const current = normalized[index];

  return (
    <div className={natural ? "relative w-full" : "relative h-full w-full"}>
      {normalized.map((p, i) => (
        <motion.div
          key={p.src}
          style={
            natural
              ? { position: i === index ? "relative" : "absolute", top: 0, left: 0, width: "100%" }
              : { position: "absolute", inset: 0 }
          }
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {natural ? (
            <ZoomableImage
              src={p.src}
              alt={p.label || ""}
              className="max-h-[75vh] w-full object-contain"
            />
          ) : (
            <img
              src={p.src}
              alt={p.label || ""}
              className="h-full w-full object-cover"
              style={{ objectPosition: objectPosition || "center" }}
            />
          )}
        </motion.div>
      ))}

      {current?.label && (
        <div className="absolute bottom-7 left-1/2 max-w-[90%] -translate-x-1/2 rounded-sm bg-lab-900/80 px-3 py-1.5 text-center text-xs font-semibold text-paper backdrop-blur-sm">
          {current.label}
        </div>
      )}

      {normalized.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {normalized.map((_, i) =>
            interactive ? (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-colors ${
                  i === index ? "bg-paper" : "bg-paper/30"
                }`}
              />
            ) : (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-paper" : "bg-paper/30"
                }`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function ZoomableImage({ src, alt, className }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-transform duration-200 ${
        zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
      }`}
      onMouseDown={() => setZoomed(true)}
      onMouseUp={() => setZoomed(false)}
      onMouseLeave={() => setZoomed(false)}
      onTouchStart={() => setZoomed(true)}
      onTouchEnd={() => setZoomed(false)}
      draggable={false}
    />
  );
}
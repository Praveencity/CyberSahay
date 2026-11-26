"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal(pageKey) {
  const region = useRef(null);

  useEffect(() => {
    const container = region.current;
    if (!container || !("IntersectionObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const observer = new IntersectionObserver((entries) => {
      if (!motion.matches) return;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.dataset.revealed = "";
          observer.unobserve(entry.target);
        }
      }
    });

    function watchSections() {
      observer.disconnect();
      if (!motion.matches) return;
      for (const section of container.querySelectorAll("[data-scroll-reveal]:not([data-revealed])")) {
        observer.observe(section);
      }
    }

    watchSections();
    motion.addEventListener?.("change", watchSections);
    return () => {
      motion.removeEventListener?.("change", watchSections);
      observer.disconnect();
    };
  }, [pageKey]);

  return region;
}

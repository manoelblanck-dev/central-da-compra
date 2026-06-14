"use client";

import { useEffect, useRef, useState } from "react";

// Anima a entrada de um elemento (fade + leve subida) quando ele aparece
// na tela ao rolar a página. Usado para dar uma sensação mais "premium".
export default function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visivel ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${
        visivel ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

import { useEffect, useState } from "react";
import { HERO_SLIDES } from "./data.ts";

const SLIDE_MS = 6500;

type HeroProps = {
  hold: boolean;
  onBook: () => void;
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export default function Hero({ hold, onBook }: HeroProps) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const reduced = useReducedMotion();
  const count = HERO_SLIDES.length;
  const still = hold || hidden || reduced;

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (still) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, still, count]);

  return (
    <section className="hero" id="top" aria-roledescription="karusell" aria-label="Face & Body Sweden">
      <div className="hero__track" style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}>
        {HERO_SLIDES.map((slide, slideIndex) => {
          const active = slideIndex === index;
          return (
            <article
              key={slide.id}
              className={`hero__slide ${slide.tone === "light" ? "is-light" : "is-dark"} ${slide.image ? "" : "is-poster"}`}
              aria-hidden={!active}
              inert={!active}
            >
              {slide.image && (
                <img
                  className="hero__photo"
                  src={slide.image}
                  alt={slide.alt ?? ""}
                  style={{ objectPosition: slide.position ?? "center" }}
                />
              )}
              <div className="hero__scrim" />
              <div className="hero__copy">
                <div className="wrap">
                  <p className="eyebrow">{slide.kicker}</p>
                  <p className="hero__title">
                    {slide.title}
                    {slide.emphasis && (
                      <>
                        <br />
                        <em>{slide.emphasis}</em>
                      </>
                    )}
                  </p>
                  <p className="hero__text">{slide.text}</p>
                  <button type="button" className="hero__cta" onClick={onBook}>
                    Boka tid
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

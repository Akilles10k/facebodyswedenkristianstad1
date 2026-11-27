import { useEffect, useMemo, useState } from "react";
import BookingPanel from "./Booking.tsx";
import {
  CATEGORIES,
  FEATURED,
  HOURS_SUMMARY,
  SERVICES,
  SITE,
  serviceById,
  type CategoryId,
} from "./data.ts";
import { formatDuration, formatPrice, sumMinutes, sumPrice } from "./format.ts";
import Hero from "./Hero.tsx";
import { loadCart, saveCart } from "./storage.ts";

export default function App() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(() => loadCart().filter((id) => serviceById(id)));

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const chosen = useMemo(
    () =>
      selected
        .map((id) => serviceById(id))
        .filter((service): service is NonNullable<ReturnType<typeof serviceById>> => Boolean(service)),
    [selected],
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen || bookingOpen ? "hidden" : "";
    document.body.classList.toggle("has-cart", chosen.length > 0 && !bookingOpen && !menuOpen);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("has-cart");
    };
  }, [menuOpen, bookingOpen, chosen.length]);

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      saveCart(next);
      return next;
    });
  };

  const openBooking = (id?: string) => {
    if (id) {
      setSelected((current) => {
        const next = current.includes(id) ? current : [...current, id];
        saveCart(next);
        return next;
      });
    }
    setMenuOpen(false);
    setBookingOpen(true);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip" href="#innehall">
        Hoppa till innehåll
      </a>
      <header className={`nav ${solid || menuOpen ? "is-solid" : ""}`}>
        <div className="wrap nav__row">
          <a className="nav__logo" href="#top" onClick={closeMenu}>
            Face & Body
            <span>Sweden</span>
          </a>
          <nav className={menuOpen ? "is-open" : ""} aria-label="Sidor">
            <a href="#behandlingar" onClick={closeMenu}>
              Behandlingar
            </a>
            <a href="#besok" onClick={closeMenu}>
              Besök
            </a>
            <a href="#omdomen" onClick={closeMenu}>
              Omdöme
            </a>
            <a href={SITE.phoneHref}>Ring</a>
            <button type="button" className="btn btn--ink nav__sheet-book" onClick={() => openBooking()}>
              Boka tid
            </button>
          </nav>
          <button type="button" className="btn btn--ink nav__cta" onClick={() => openBooking()}>
            Boka tid
          </button>
          <button
            type="button"
            className="nav__burger"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Stäng menyn" : "Öppna menyn"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="innehall">
        <Hero hold={menuOpen || bookingOpen} onBook={() => openBooking()} />

        <section className="intro">
          <div className="wrap intro__grid">
            <div>
              <p className="eyebrow">Välkommen</p>
              <h1>Kliniken ligger vid 24/7-gymmet vid Högskolan i Kristianstad.</h1>
            </div>
            <div>
              <p>
                Ni är varmt välkomna. Här finns fillers, botox, laser, massage, tandblekning, tandsmycke och hudvård.
                Kompetens, professionalism och kvalitet är ledorden.
              </p>
              <p>Stridsvagnsvägen 10A · öppet alla dagar.</p>
            </div>
          </div>
          <div className="wrap principles">
            <article>
              <h2>Kompetens</h2>
              <p>Lama är legitimerad sjuksköterska och tandhygienist. Anders tar hand om massagen.</p>
            </article>
            <article>
              <h2>Professionalism</h2>
              <p>Tydliga priser, lediga tider och ett val mellan att swisha nu eller betala på plats.</p>
            </article>
            <article>
              <h2>Kvalitet</h2>
              <p>Soprano Ice Titanium, ledljus och behandlingar som får ta den tid de behöver.</p>
            </article>
          </div>
        </section>

        <section className="features" aria-label="Utvalda behandlingar">
          <div className="wrap">
            <p className="eyebrow">Just nu</p>
            <div className="features__grid">
              {FEATURED.map((id, index) => {
                const service = serviceById(id);
                if (!service) return null;
                return (
                  <article key={id} className="feature">
                    <p className="feature__index">0{index + 1}</p>
                    <h2>{service.name}</h2>
                    <p>
                      {formatDuration(service.minutes)} · {formatPrice(service.price)}
                    </p>
                    <button type="button" onClick={() => openBooking(id)}>
                      Boka
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="menu" id="behandlingar">
          <div className="wrap">
            <div className="menu__head">
              <p className="eyebrow">Prislista</p>
              <h2>Behandlingar</h2>
            </div>
            <nav className="menu__jump" aria-label="Hoppa i prislistan">
              {CATEGORIES.map((category) => (
                <a key={category.id} href={`#cat-${category.id}`}>
                  {category.label}
                </a>
              ))}
            </nav>
            {CATEGORIES.map((category) => (
              <MenuGroup
                key={category.id}
                id={category.id}
                label={category.label}
                intro={category.intro}
                selected={selected}
                onToggle={toggle}
              />
            ))}
          </div>
        </section>

        <section className="visit" id="besok">
          <div className="wrap visit__grid">
            <div>
              <p className="eyebrow">Besök</p>
              <h2>
                {SITE.address}
                <br />
                {SITE.postal}
              </h2>
              <p>Kliniken ligger vid 24/7-gymmet vid Högskolan. Ni är varmt välkomna.</p>
              <p>
                <a href={SITE.phoneHref}>{SITE.phone}</a>
                <br />
                <a href={SITE.emailHref}>{SITE.email}</a>
              </p>
              <p>
                <a href={SITE.instagramHref} target="_blank" rel="noreferrer">
                  {SITE.instagram}
                </a>
                <br />
                <a href={SITE.mapHref} target="_blank" rel="noreferrer">
                  Öppna karta
                </a>
              </p>
            </div>
            <div>
              <p className="eyebrow">Öppet</p>
              <dl className="hours">
                {HOURS_SUMMARY.map(([day, hours]) => (
                  <div key={day}>
                    <dt>{day}</dt>
                    <dd>{hours}</dd>
                  </div>
                ))}
              </dl>
              <div className="team">
                <article>
                  <h3>Lama</h3>
                  <p>Leg. sjuksköterska och tandhygienist</p>
                </article>
                <article>
                  <h3>Anders</h3>
                  <p>Massage</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="quote" id="omdomen">
          <div className="wrap">
            <p className="eyebrow eyebrow--light">Kunderna</p>
            <blockquote>
              <p>
                Ni är verkligen jätteduktiga på tandsmycken! Jag gjorde mina hos er för tre år sedan och jag blev så
                nöjd. Det gick jättebra och de är fortfarande lika fina efter tre år. Jag rekommenderar er varmt!
              </p>
              <footer>Qalbi Wanag</footer>
            </blockquote>
            <p className="quote__meta">
              <a href={SITE.googleReviewsHref} target="_blank" rel="noreferrer">
                Omdömen på Google
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__grid">
          <div className="footer__brand">
            <p className="footer__logo">
              Face <span className="footer__amp">&</span> Body
              <span>Sweden</span>
            </p>
            <p>Klinik för ansikte, kropp och leende. Vid 24/7-gymmet, Högskolan i Kristianstad.</p>
          </div>
          <div>
            <p className="footer__label">Snabblänkar</p>
            <ul>
              <li>
                <a href="#behandlingar">Behandlingar</a>
              </li>
              <li>
                <a href="#besok">Besök oss</a>
              </li>
              <li>
                <a href="#omdomen">Omdöme</a>
              </li>
              <li>
                <button type="button" onClick={() => openBooking()}>
                  Boka tid
                </button>
              </li>
              <li>
                <a href={SITE.phoneHref}>Ring {SITE.phone}</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="footer__label">Behandlingar</p>
            <ul>
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <a href={`#cat-${category.id}`}>{category.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer__label">Kontakt</p>
            <ul>
              <li>
                {SITE.address}
                <br />
                {SITE.postal}
              </li>
              <li>
                <a href={SITE.emailHref}>{SITE.email}</a>
              </li>
              <li>
                <a href={SITE.instagramHref} target="_blank" rel="noreferrer">
                  {SITE.instagram}
                </a>
              </li>
              <li>
                <a href={SITE.mapHref} target="_blank" rel="noreferrer">
                  Öppna karta
                </a>
              </li>
              <li>Måndag–fredag 10–19</li>
              <li>Lördag–söndag 12–16</li>
            </ul>
          </div>
        </div>
        <div className="wrap footer__legal">
          <p>© 2026 {SITE.name}</p>
          <p>Skapad av Webbolt. Alla rättigheter förbehållna.</p>
        </div>
      </footer>

      {chosen.length > 0 && !bookingOpen && (
        <div className="cart">
          <p>
            {chosen.length === 1 ? "1 behandling" : `${chosen.length} behandlingar`}
            <span>
              {formatPrice(sumPrice(chosen))} · {formatDuration(sumMinutes(chosen))}
            </span>
          </p>
          <button type="button" className="btn btn--ink" onClick={() => openBooking()}>
            Boka
          </button>
        </div>
      )}

      <BookingPanel
        open={bookingOpen}
        selectedIds={selected}
        onToggle={toggle}
        onConfirmed={() => {
          setSelected([]);
          saveCart([]);
        }}
        onClose={() => setBookingOpen(false)}
      />
    </>
  );
}

function MenuGroup({
  id,
  label,
  intro,
  selected,
  onToggle,
}: {
  id: CategoryId;
  label: string;
  intro: string;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const services = SERVICES.filter((service) => service.category === id);
  return (
    <section className="menu__group" id={`cat-${id}`} aria-labelledby={`label-${id}`}>
      <header>
        <h3 id={`label-${id}`}>{label}</h3>
        <p>{intro}</p>
      </header>
      <ul>
        {services.map((service) => {
          const on = selected.includes(service.id);
          return (
            <li key={service.id}>
              <div>
                <p>{service.name}</p>
                <small>{formatDuration(service.minutes)}</small>
              </div>
              <div className="menu__end">
                <span>{formatPrice(service.price)}</span>
                <button type="button" aria-pressed={on} onClick={() => onToggle(service.id)}>
                  {on ? "Tillagd" : "Lägg till"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

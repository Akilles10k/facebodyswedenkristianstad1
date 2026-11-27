import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, OPENING, SERVICES, type Service } from "./data.ts";
import { formatDay, formatDuration, formatMonth, formatPrice, sumMinutes, sumPrice } from "./format.ts";
import {
  WEEKDAYS,
  dateKey,
  isBookableDay,
  monthCells,
  slotsForDate,
  startOfDay,
  MAX_DAYS_AHEAD,
  fromMinutes,
  toMinutes,
} from "./slots.ts";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  loadBookings,
  makeReference,
  saveBooking,
  type Booking,
  type PaymentChoice,
} from "./storage.ts";

const STEPS = ["Tjänst", "Datum", "Tid", "Uppgifter", "Betalning"] as const;

type BookingPanelProps = {
  open: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onConfirmed: () => void;
  onClose: () => void;
};

function chosenServices(ids: string[]): Service[] {
  return ids
    .map((id) => SERVICES.find((service) => service.id === id))
    .filter((service): service is Service => Boolean(service));
}

export default function BookingPanel({
  open,
  selectedIds,
  onToggle,
  onConfirmed,
  onClose,
}: BookingPanelProps) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"flow" | "saved">("flow");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [today, setToday] = useState(() => startOfDay(new Date()));
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentChoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const chosen = useMemo(() => chosenServices(selectedIds), [selectedIds]);
  const total = sumPrice(chosen);
  const duration = sumMinutes(chosen);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setToday(startOfDay(new Date()));
      setBookings(loadBookings());
      setError(null);
      const first = chosenServices(selectedIds)[0];
      if (first) setCategory(first.category);
      panelRef.current?.querySelector<HTMLElement>(".book__close")?.focus();
    }
    wasOpen.current = open;
  }, [open, selectedIds]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (selectedIds.length === 0 && step > 1 && !success) setStep(1);
  }, [selectedIds.length, step, success]);

  const taken = useMemo(() => {
    if (!date) return [];
    const key = dateKey(date);
    return bookings
      .filter((booking) => booking.date === key)
      .map((booking) => ({ time: booking.time, minutes: booking.minutes }));
  }, [bookings, date]);

  const slots = useMemo(
    () => (date && duration > 0 ? slotsForDate(date, duration, taken) : []),
    [date, duration, taken],
  );

  useEffect(() => {
    if (time && date && !slots.includes(time)) setTime("");
  }, [time, date, slots]);

  useEffect(() => {
    if (step === 5 && total === 0 && payment !== "plats") setPayment("plats");
  }, [step, total, payment]);

  if (!open) return null;

  const maxDay = new Date(today);
  maxDay.setDate(maxDay.getDate() + MAX_DAYS_AHEAD);
  const canPrev =
    viewMonth.getFullYear() > today.getFullYear() || viewMonth.getMonth() > today.getMonth();
  const canNext = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) <= maxDay;
  const cells = monthCells(viewMonth.getFullYear(), viewMonth.getMonth());
  const visible = SERVICES.filter((service) => service.category === category);

  const canContinue = (() => {
    if (step === 1) return chosen.length > 0;
    if (step === 2) return date !== null && isBookableDay(date, today);
    if (step === 3) return time !== "" && slots.includes(time);
    if (step === 4) return isValidName(name) && isValidEmail(email) && isValidPhone(phone);
    if (step === 5) return payment !== null;
    return false;
  })();

  const confirm = () => {
    if (!date || !time || !payment) return;
    const fresh = loadBookings();
    const stillFree = slotsForDate(
      date,
      duration,
      fresh
        .filter((booking) => booking.date === dateKey(date))
        .map((booking) => ({ time: booking.time, minutes: booking.minutes })),
    );
    if (!stillFree.includes(time)) {
      setError("Den tiden hann bli upptagen. Välj en annan.");
      setTime("");
      setStep(3);
      setBookings(fresh);
      return;
    }
    const booking: Booking = {
      id: makeReference(fresh),
      createdAt: new Date().toISOString(),
      services: chosen.map((service) => ({
        id: service.id,
        name: service.name,
        minutes: service.minutes,
        price: service.price,
      })),
      date: dateKey(date),
      time,
      minutes: duration,
      total,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      note: note.trim().slice(0, 400),
      payment,
    };
    setBookings(saveBooking(booking));
    setSuccess(booking);
    setError(null);
    onConfirmed();
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canContinue) return;
    if (step < 5) {
      setStep((current) => current + 1);
      return;
    }
    confirm();
  };

  const receipt = success
    ? success.services
    : chosen.map((service) => ({
        id: service.id,
        name: service.name,
        price: service.price,
        minutes: service.minutes,
      }));
  const receiptTotal = success ? success.total : total;
  const receiptMinutes = success ? success.minutes : duration;
  const endLabel =
    time && duration > 0 ? fromMinutes(toMinutes(time) + duration) : "";

  return (
    <div className="book" role="dialog" aria-modal="true" aria-labelledby="book-title" ref={panelRef}>
      <aside className="book__aside">
        <p className="eyebrow eyebrow--light">Face & Body Sweden</p>
        <h2 id="book-title">{success ? "Tack." : "Boka tid"}</h2>
        <p className="book__aside-lead">
          {success
            ? `${success.name.split(" ")[0]}, din tid är sparad.`
            : "Välj behandling, tid och hur du vill betala."}
        </p>
        <div className="book__aside-details">
          {receipt.length === 0 ? (
            <p className="book__empty">Ingen behandling vald ännu.</p>
          ) : (
            <ul className="book__lines">
              {receipt.map((service) => (
                <li key={service.id}>
                  <span>
                    {service.name}
                    <small>{formatDuration(service.minutes)}</small>
                  </span>
                  <span>{formatPrice(service.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="book__facts">
            <div>
              <dt>Datum</dt>
              <dd>{success ? formatDay(parseStored(success.date)) : date ? formatDay(date) : "—"}</dd>
            </div>
            <div>
              <dt>Tid</dt>
              <dd>
                {success
                  ? `${success.time}–${fromMinutes(toMinutes(success.time) + success.minutes)}`
                  : time
                    ? `${time}${endLabel ? `–${endLabel}` : ""}`
                    : "—"}
              </dd>
            </div>
            <div>
              <dt>Att betala</dt>
              <dd>{receipt.length ? formatPrice(receiptTotal) : "—"}</dd>
            </div>
          </dl>
          {receiptMinutes > 0 && <p className="book__dur">{formatDuration(receiptMinutes)} på kliniken.</p>}
        </div>
        <p className="book__aside-compact">
          {receipt.length === 0
            ? "Välj en behandling"
            : `${receipt.length} ${receipt.length === 1 ? "behandling" : "behandlingar"} · ${formatPrice(receiptTotal)}`}
        </p>
        <div className="book__aside-foot">
          {bookings.length > 0 && !success && (
            <button
              type="button"
              className="text-btn text-btn--light"
              onClick={() => setMode((current) => (current === "saved" ? "flow" : "saved"))}
            >
              {mode === "saved" ? "Tillbaka till bokningen" : `Sparade demotider (${bookings.length})`}
            </button>
          )}
          <a href="tel:+46762265476">076-226 54 76</a>
        </div>
      </aside>

      <div className="book__main">
        <button type="button" className="book__close" onClick={onClose} aria-label="Stäng bokningen">
          Stäng
        </button>

        {success ? (
          <div className="done">
            <p className="eyebrow">Bokningsnummer</p>
            <p className="done__ref">{success.id}</p>
            <h3>
              {formatDay(parseStored(success.date))} · {success.time}
            </h3>
            <ul>
              {success.services.map((service) => (
                <li key={service.id}>
                  {service.name}
                  <span>{formatPrice(service.price)}</span>
                </li>
              ))}
            </ul>
            <p>
              {success.payment === "swish"
                ? "Markerad som swishad. I den färdiga sajten öppnas Swish till klinikens företagskonto. Här dras ingen betalning."
                : success.total === 0
                  ? "Ingen avgift i förväg. Konsultationen betalas bara om tiden uteblir, 300 kr."
                  : "Betalas på plats. Swish, kort eller friskvård via Epassi."}
            </p>
            <p>En bekräftelse till {success.email} skickas när mejlen är inkopplad. Vi ses på Stridsvagnsvägen 10A.</p>
            <button type="button" className="btn btn--ink" onClick={onClose}>
              Stäng
            </button>
          </div>
        ) : mode === "saved" ? (
          <div className="saved">
            <p className="eyebrow">I den här webbläsaren</p>
            <h3>Sparade demotider</h3>
            <ul>
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <strong>{booking.id}</strong>
                  <span>
                    {formatDay(parseStored(booking.date))} · {booking.time}
                  </span>
                  <span>{booking.name}</span>
                  <span>{booking.services.map((service) => service.name).join(", ")}</span>
                  <span>
                    {formatPrice(booking.total)} · {booking.payment === "swish" ? "Swish, demo" : "På plats"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <form className="book__form" onSubmit={onSubmit}>
            <div className="book__body">
            <div className="steps" aria-hidden>
              {STEPS.map((label, index) => (
                <span key={label} className={index < step ? "is-on" : ""} />
              ))}
            </div>
            <p className="steps__label">
              Steg {step} av {STEPS.length} · {STEPS[step - 1]}
            </p>

            {step === 1 && (
              <div>
                <h3>Välj behandling</h3>
                <div className="pills" role="tablist" aria-label="Kategorier">
                  {CATEGORIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={item.id === category ? "is-on" : ""}
                      aria-pressed={item.id === category}
                      onClick={() => setCategory(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <ul className="pick__list">
                  {visible.map((service) => {
                    const on = selectedIds.includes(service.id);
                    return (
                      <li key={service.id}>
                        <button
                          type="button"
                          className={on ? "is-on" : ""}
                          aria-pressed={on}
                          onClick={() => onToggle(service.id)}
                        >
                          <span>
                            <strong>{service.name}</strong>
                            <small>{formatDuration(service.minutes)}</small>
                          </span>
                          <em>{on ? "Tillagd" : formatPrice(service.price)}</em>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3>Välj datum</h3>
                <p className="lede">
                  Måndag–fredag 10–19. Lördag och söndag 12–16. Samma dag går bra om det finns en tid minst 45 minuter
                  fram.
                </p>
                <div className="cal">
                  <div className="cal__nav">
                    <button type="button" onClick={() => shift(setViewMonth, -1)} disabled={!canPrev} aria-label="Föregående månad">
                      ‹
                    </button>
                    <span>{formatMonth(viewMonth)}</span>
                    <button type="button" onClick={() => shift(setViewMonth, 1)} disabled={!canNext} aria-label="Nästa månad">
                      ›
                    </button>
                  </div>
                  <div className="cal__week" aria-hidden>
                    {WEEKDAYS.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className="cal__grid" role="grid" aria-label="Kalender">
                    {cells.map((day, index) => {
                      if (!day) return <span key={`e-${index}`} />;
                      const bookable = isBookableDay(day, today);
                      const selected = date ? dateKey(date) === dateKey(day) : false;
                      const isToday = dateKey(day) === dateKey(today);
                      return (
                        <button
                          key={dateKey(day)}
                          type="button"
                          role="gridcell"
                          disabled={!bookable}
                          aria-pressed={selected}
                          aria-label={formatDay(day)}
                          className={[selected ? "is-on" : "", isToday ? "is-today" : ""].filter(Boolean).join(" ")}
                          onClick={() => {
                            setDate(day);
                            setTime("");
                          }}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {date && (
                  <p className="lede">
                    Öppet {OPENING[date.getDay()].start}–{OPENING[date.getDay()].end}.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h3>Välj tid</h3>
                {date && <p className="lede">{formatDay(date)}. Behandlingen tar {formatDuration(duration)}.</p>}
                {slots.length === 0 ? (
                  <p className="lede">
                    Inga tider rymmer hela besöket den här dagen. Välj ett annat datum
                    {duration >= 240 ? " eller ta bort en behandling" : ""}.
                  </p>
                ) : (
                  <div className="times">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={time === slot ? "is-on" : ""}
                        aria-pressed={time === slot}
                        onClick={() => setTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="fields">
                <h3>Dina uppgifter</h3>
                <label>
                  Namn
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    maxLength={80}
                    required
                  />
                  {name.length > 0 && !isValidName(name) && <span className="hint">Ange för- och efternamn.</span>}
                </label>
                <label>
                  Telefon
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={18}
                    required
                  />
                  {phone.length > 0 && !isValidPhone(phone) && (
                    <span className="hint">Ange ett svenskt nummer, till exempel 070 123 45 67.</span>
                  )}
                </label>
                <label>
                  E-post
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    required
                  />
                  {email.length > 0 && !isValidEmail(email) && <span className="hint">Ange en giltig e-postadress.</span>}
                </label>
                <label>
                  Önskemål, valfritt
                  <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={400} rows={3} />
                </label>
              </div>
            )}

            {step === 5 && (
              <div>
                <h3>Hur vill du betala?</h3>
                <p className="lede">
                  {formatDay(date ?? today)} · {time}
                  {endLabel ? `–${endLabel}` : ""} · {formatPrice(total)}
                </p>
                <div className="pay">
                  <button
                    type="button"
                    className={payment === "swish" ? "is-on" : ""}
                    aria-pressed={payment === "swish"}
                    disabled={total === 0}
                    onClick={() => setPayment("swish")}
                  >
                    <strong>Swisha nu</strong>
                    <span>{total === 0 ? "Ingen avgift att swisha." : `${formatPrice(total)} innan besöket.`}</span>
                  </button>
                  <button
                    type="button"
                    className={payment === "plats" ? "is-on" : ""}
                    aria-pressed={payment === "plats"}
                    onClick={() => setPayment("plats")}
                  >
                    <strong>Betala på plats</strong>
                    <span>Swish, kort eller friskvård när du kommer.</span>
                  </button>
                </div>
                <p className="demo-note">
                  Prototyp: bokningen sparas bara i den här webbläsaren. Swish öppnas inte och ingen betalning dras.
                </p>
              </div>
            )}

            {error && (
              <p className="hint" role="alert">
                {error}
              </p>
            )}
            </div>

            <div className="book__actions">
              {step > 1 && (
                <button type="button" className="btn btn--ghost" onClick={() => setStep((current) => current - 1)}>
                  Tillbaka
                </button>
              )}
              <button type="submit" className="btn btn--ink" disabled={!canContinue}>
                {step === 5 ? "Bekräfta bokning" : "Nästa"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function shift(setViewMonth: React.Dispatch<React.SetStateAction<Date>>, delta: number) {
  setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
}

function parseStored(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

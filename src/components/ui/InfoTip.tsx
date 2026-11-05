import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

interface InfoTipProps {
  /** The button's accessible name, e.g. "About Parent Relief". */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * A small "i" button with a note behind it, for an explanation that would crowd a list.
 * The note opens while a mouse hovers over the button (or the note itself), and a click or
 * tap pins it open until it is clicked again, Escape is pressed or the reader taps elsewhere.
 * Touch never "hovers", so a tap opens it rather than flashing it open and shut.
 */
export function InfoTip({ label, children, className = '' }: InfoTipProps) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef(0);
  const noteId = useId();
  const open = hovered || pinned;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setPinned(false);
        setHovered(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setPinned(false);
      setHovered(false);
      if (wrapRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  // Keep the note on screen: on a phone the button can sit nearer the edge than the note is wide.
  useLayoutEffect(() => {
    const note = noteRef.current;
    if (!open || !note) return;
    note.style.transform = '';
    const { left, right } = note.getBoundingClientRect();
    const edge = 12;
    const dx = left < edge ? edge - left : right > window.innerWidth - edge ? window.innerWidth - edge - right : 0;
    if (dx) note.style.transform = `translateX(${Math.round(dx)}px)`;
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        window.clearTimeout(leaveTimer.current);
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return;
        // A moment's grace, so the pointer can cross from the button into the note.
        leaveTimer.current = window.setTimeout(() => setHovered(false), 150);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={noteId}
        onClick={() => setPinned((p) => !p)}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${open ? 'bg-sage-100 text-sage-800' : 'text-ink-faint hover:bg-stone-200 hover:text-sage-800'}`}
      >
        <Icon name="info" size={17} aria-hidden />
      </button>
      {/* Padding, not margin, above the card: the gap still counts as hovering the note. */}
      <div ref={noteRef} id={noteId} hidden={!open} className="absolute right-0 top-full z-20 w-[min(22rem,calc(100vw-2.5rem))] pt-1.5">
        <div className="rounded-lg border border-stone-300 bg-stone-50 p-4 text-[13px] leading-5 text-ink-muted shadow-soft">{children}</div>
      </div>
    </div>
  );
}

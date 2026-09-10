"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface IntakeOption {
  /**
   * The value reported by `onChange`. Also the option's DOM id suffix, so
   * keep it slug-shaped.
   */
  value: string;
  /** What the option offers. One line — this is a menu, not a paragraph. */
  label: string;
  /**
   * The character that picks this option from the keyboard. Case-insensitive,
   * and shown in the bracket. Defaults to A, B, C… by position.
   */
  hotkey?: string;
}

export interface IntakeTerminalProps {
  /** The question, printed after the caret. */
  prompt: string;
  options: IntakeOption[];
  /** Controlled selection. Pass `null` for "nothing picked yet". */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /**
   * Type the prompt out on first view, one character at a time. Skipped for
   * anyone who asked for reduced motion — they get the finished line.
   */
  typewriter?: boolean;
  /** Milliseconds per character while typing. */
  typeSpeed?: number;
  /** Shown under the options before anything is picked. */
  hint?: string;
  /**
   * Once answered, print the question and the chosen answer as one settled
   * line and stop offering the list. A terminal keeps what you typed; this
   * is what lets a caller stack several of these into a transcript.
   */
  collapseOnAnswer?: boolean;
  /** Label for the control that clears the selection. */
  resetLabel?: string;
  /**
   * Listen for hotkeys on the whole document rather than only while the list
   * has focus. Off by default: a page with two of these, or with a text
   * input, would fight over the same letters.
   */
  globalHotkeys?: boolean;
  className?: string;
  optionClassName?: string;
}

/**
 * A keyboard-first menu that reads like a terminal prompt.
 *
 *     > WHAT'S EATING YOUR TIME?
 *
 *       [ A ]  A process my team repeats every week
 *       [ B ]  An idea nobody can try yet
 *
 * The point is triage: the caller renders everything it has, and this narrows
 * it to what the reader just said they wanted. It reports a value and holds
 * no opinion about what happens next.
 *
 * Interaction is the whole component, so all three ways in work: click, the
 * hotkey in the bracket, or arrows plus Enter once the list has focus. The
 * list is a real radiogroup, so a screen reader announces it as one and
 * arrow keys behave the way that role promises.
 *
 * The caret does not blink. A blinking block is the obvious terminal
 * signature and it is also a permanent flicker on a page that has to be read.
 */
export function IntakeTerminal({
  prompt,
  options,
  value,
  defaultValue = null,
  onChange,
  typewriter = true,
  typeSpeed = 22,
  hint,
  collapseOnAnswer = false,
  resetLabel,
  globalHotkeys = false,
  className,
  optionClassName,
}: IntakeTerminalProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : uncontrolled;

  const select = React.useCallback(
    (next: string | null) => {
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    },
    [onChange, value],
  );

  const keyed = React.useMemo(
    () =>
      options.map((option, index) => ({
        ...option,
        hotkey: (option.hotkey ?? String.fromCharCode(65 + index)).toUpperCase(),
      })),
    [options],
  );

  // ── the prompt types itself ────────────────────────────────────────────
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [typed, setTyped] = React.useState(typewriter ? 0 : prompt.length);

  React.useEffect(() => {
    if (!typewriter) {
      setTyped(prompt.length);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(prompt.length);
      return;
    }
    const node = rootRef.current;
    if (!node) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    // Start on view, not on mount: typed out above the fold and finished
    // before anyone scrolls down to it, the effect never happened.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || timer) return;
        timer = setInterval(() => {
          setTyped((n) => {
            if (n >= prompt.length) {
              if (timer) clearInterval(timer);
              return n;
            }
            return n + 1;
          });
        }, typeSpeed);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [prompt, typeSpeed, typewriter]);

  // ── keyboard ───────────────────────────────────────────────────────────
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleHotkey = React.useCallback(
    (event: KeyboardEvent | React.KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return false;
      const pressed = event.key.toUpperCase();
      if (pressed === "ESCAPE") {
        select(null);
        return true;
      }
      const match = keyed.findIndex((option) => option.hotkey === pressed);
      if (match === -1) return false;
      select(keyed[match].value);
      itemRefs.current[match]?.focus();
      return true;
    },
    [keyed, select],
  );

  React.useEffect(() => {
    if (!globalHotkeys) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Never steal a letter someone is typing into a field.
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      )
        return;
      if (handleHotkey(event)) event.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [globalHotkeys, handleHotkey]);

  const onListKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = keyed.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next !== null) {
      event.preventDefault();
      // A radiogroup selects as it moves; that is the role's contract.
      select(keyed[next].value);
      itemRefs.current[next]?.focus();
      return;
    }
    if (handleHotkey(event)) event.preventDefault();
  };

  const caret = (
    <span aria-hidden="true" className="mr-3 inline-block">
      &gt;
    </span>
  );

  const chosen = keyed.find((option) => option.value === selected);

  // ── the settled line ───────────────────────────────────────────────────
  if (collapseOnAnswer && chosen) {
    return (
      <div className={cn("font-space-mono", className)}>
        <p
          data-part="prompt"
          className="flex flex-wrap items-baseline gap-x-3 text-[11px] uppercase tracking-[0.28em] md:text-[13px]"
        >
          {caret}
          <span>{prompt}</span>
          <span aria-hidden="true" data-part="arrow">
            →
          </span>
          <span data-part="answer" className="normal-case tracking-[0.08em]">
            {chosen.label}
          </span>
        </p>
        {resetLabel && (
          <button
            type="button"
            data-part="reset"
            onClick={() => select(null)}
            className="mt-4 min-h-11 text-[9px] uppercase tracking-[0.35em] underline-offset-4 hover:underline"
          >
            {resetLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("font-space-mono", className)}>
      <p
        data-part="prompt"
        className="text-[11px] uppercase tracking-[0.28em] md:text-[13px]"
      >
        {/*
          The typed halves are decoration: mid-animation they read as a
          truncated sentence, and once finished they would be read a second
          time alongside the sr-only copy below. Assistive tech gets the
          whole prompt, once, from that copy.
        */}
        <span aria-hidden="true">
          {caret}
          <span>{prompt.slice(0, typed)}</span>
          {/* Reserves the rest of the line so nothing reflows as it types. */}
          <span className="opacity-0">{prompt.slice(typed)}</span>
        </span>
        <span className="sr-only">{prompt}</span>
      </p>

      <div
        role="radiogroup"
        aria-label={prompt}
        className="mt-7 flex flex-col items-start gap-1"
      >
        {keyed.map((option, index) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              style={{ position: "relative" }}
              aria-checked={active}
              // One stop for the whole group: arrows move within it.
              tabIndex={active || (!selected && index === 0) ? 0 : -1}
              onClick={() => select(active ? null : option.value)}
              onKeyDown={(event) => onListKeyDown(event, index)}
              className={cn(
                "group flex min-h-11 max-w-full items-baseline gap-4 py-1.5 pl-4 text-left text-[12px] tracking-[0.08em] transition-all md:text-[13px]",
                optionClassName,
              )}
              data-active={active}
            >
              {/*
                A filing tab down the left edge. `aria-checked` already tells
                assistive tech which option is chosen; this is what tells
                everyone else, and unlike a focus ring it survives a mouse
                click.
              */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-1/2 h-full w-0.5 -translate-y-1/2 transition-transform duration-300",
                  active ? "scale-y-100" : "scale-y-0",
                )}
                data-tab=""
              />
              <span className="shrink-0 tabular-nums">
                [&nbsp;{option.hotkey}&nbsp;]
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {selected === null && hint && (
        <p
          data-part="hint"
          className="mt-6 text-[9px] uppercase tracking-[0.35em]"
        >
          {hint}
        </p>
      )}

      {selected !== null && resetLabel && (
        <button
          type="button"
          onClick={() => select(null)}
          className="mt-6 min-h-11 text-[9px] uppercase tracking-[0.35em] underline-offset-4 hover:underline"
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}

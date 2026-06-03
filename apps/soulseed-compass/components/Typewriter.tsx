"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  /** ms per character. */
  speed?: number;
  className?: string;
}

/** Reveals REZZIE's words one character at a time. Presentation only. */
export function Typewriter({ text, speed = 18, className }: TypewriterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  const done = count >= text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      {!done && <span className="ml-0.5 inline-block w-[2px] animate-caret text-gold">▍</span>}
    </span>
  );
}

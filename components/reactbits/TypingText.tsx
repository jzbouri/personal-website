"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface TypingTextProps {
  text: string;
  typingSpeed?: number;
  backspaceSpeed?: number;
  pauseBeforeBackspace?: number;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string | React.ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
}

export default function TypingText({
  text,
  typingSpeed = 80,
  backspaceSpeed = 40,
  pauseBeforeBackspace = 0,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorBlinkDuration = 0.4,
  cursorClassName = "",
}: TypingTextProps) {
  const [displayed, setDisplayed] = useState<string>("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">(
    pauseBeforeBackspace > 0 ? "typing" : "typing"
  );
  const [pendingText, setPendingText] = useState<string | null>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const displayedLengthRef = useRef<number>(0);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return;
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
    return () => { tween.kill(); };
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    displayedLengthRef.current = displayed.length;
  }, [displayed.length]);

  useEffect(() => {
    if (displayedLengthRef.current === 0) {
      setPhase("typing");
      setPendingText(null);
    } else {
      setPendingText(text);
      setPhase("deleting");
    }
  }, [text]);

  useEffect(() => {
    if (phase === "typing") {
      if (displayed === text) {
        if (pauseBeforeBackspace > 0) {
          const t = setTimeout(() => setPhase("deleting"), pauseBeforeBackspace);
          return () => clearTimeout(t);
        }
        return;
      }
      const t = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, typingSpeed);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (displayed.length === 0) {
        if (pendingText !== null) {
          setPendingText(null);
        }
        setPhase("typing");
        return;
      }
      const t = setTimeout(() => {
        setDisplayed(displayed.slice(0, displayed.length - 1));
      }, backspaceSpeed);
      return () => clearTimeout(t);
    }
  }, [phase, displayed, text, typingSpeed, backspaceSpeed, pauseBeforeBackspace, pendingText]);

  const shouldHideCursor =
    hideCursorWhileTyping && (phase === "typing" || phase === "deleting");

  return (
    <span className={className} aria-live="polite" aria-atomic="true">
      {displayed}
      {showCursor && (
        <span
          ref={cursorRef}
          className={`ml-0.5 inline-block opacity-100 align-baseline ${
            shouldHideCursor ? "hidden" : ""
          } ${cursorClassName}`}
        >
          {cursorCharacter}
        </span>
      )}
    </span>
  );
}



"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useInView } from "framer-motion";

// Counts up from 0 to the target value once, when the number first
// scrolls into view. Falls back to displaying the final value instantly
// under reduced motion (the spring settles immediately since its
// stiffness/damping still run, but MotionConfig's reducedMotion="user"
// disables the underlying animation loop for motion values driven by
// useSpring too, per framer-motion's documented behavior).
export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20 });
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = Math.round(latest).toString();
    });
  }, [spring]);

  return <span ref={ref}>0</span>;
}

import { useEffect, useRef, type JSX } from 'react';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Soft radial highlight that follows the pointer. Off on touch and reduced-motion. */
export const CursorGlow = (): JSX.Element | null => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia(FINE_POINTER).matches || window.matchMedia(REDUCED_MOTION).matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--glow-x', `${event.clientX}px`);
        el.style.setProperty('--glow-y', `${event.clientY}px`);
        el.dataset.active = 'true';
      });
    };
    const onLeave = (): void => {
      delete el.dataset.active;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
};

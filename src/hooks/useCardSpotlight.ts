import { useEffect } from 'react';

/**
 * Tracks the pointer over any `.card` and exposes its position as `--spot-x/--spot-y`
 * so CSS can paint a faint radial highlight under the cursor. One delegated listener.
 */
export const useCardSpotlight = (): void => {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (event: PointerEvent): void => {
      const card = (event.target as Element | null)?.closest<HTMLElement>('.card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
};

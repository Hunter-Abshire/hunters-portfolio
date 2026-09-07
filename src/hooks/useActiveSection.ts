import { useEffect, useState } from 'react';

/** Tracks which section id is currently most in view, for nav highlighting. */
export const useActiveSection = (ids: readonly string[]): string | null => {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const sections = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
};

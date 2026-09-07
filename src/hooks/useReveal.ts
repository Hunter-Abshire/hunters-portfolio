import { useEffect } from 'react';

/** Adds `.is-visible` to `.reveal` elements as they scroll into view. */
export const useReveal = (): void => {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

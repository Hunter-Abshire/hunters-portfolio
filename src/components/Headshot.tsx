import type { JSX } from 'react';
import { PROFILE } from '../data/profile';

const SIZES = [320, 640, 960] as const;

const srcSet = (ext: 'webp' | 'jpg'): string =>
  SIZES.map(size => `/images/headshot-${size}.${ext} ${size}w`).join(', ');

/** Square headshot with a thin accent ring; sized by CSS (`.headshot`). */
export const Headshot = (): JSX.Element => (
  <picture className="headshot">
    <source type="image/webp" srcSet={srcSet('webp')} sizes="(min-width: 1024px) 160px, 112px" />
    <img
      src="/images/headshot-640.jpg"
      srcSet={srcSet('jpg')}
      sizes="(min-width: 1024px) 160px, 112px"
      width={640}
      height={640}
      alt={`Portrait of ${PROFILE.name}`}
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  </picture>
);

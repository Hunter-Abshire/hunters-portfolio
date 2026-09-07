import type { JSX } from 'react';

export const Tags = ({ items }: { readonly items: readonly string[] }): JSX.Element => (
  <ul className="tags" aria-label="Technologies">
    {items.map(item => (
      <li key={item} className="tag mono">
        {item}
      </li>
    ))}
  </ul>
);

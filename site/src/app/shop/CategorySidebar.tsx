import Link from 'next/link';
import type { CategorySummary } from '@/lib/catalog/queries';

interface CategorySidebarProps {
  categories: CategorySummary[];
  activeSlug: string | null;
}

export function CategorySidebar({ categories, activeSlug }: CategorySidebarProps) {
  return (
    <aside>
      <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
        Categories
      </h2>
      <ul className="mt-4 space-y-2">
        <li>
          <Link
            href="/shop"
            className={`block py-1.5 font-serif text-lg italic transition-colors ${
              activeSlug === null ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900'
            }`}
          >
            All pieces
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/shop/${c.slug}`}
              className={`block py-1.5 font-serif text-lg italic transition-colors ${
                activeSlug === c.slug ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

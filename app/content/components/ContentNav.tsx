'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Calendar', href: '/content' },
  { label: 'Board',    href: '/content/board' },
];

export function ContentNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-zinc-200 px-4 dark:border-zinc-800">
      {TABS.map(({ label, href }) => {
        const isActive = href === '/content' ? pathname === '/content' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {label}
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

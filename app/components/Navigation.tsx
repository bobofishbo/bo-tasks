'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/today', label: 'Today' },
    { href: '/week', label: 'This Week' },
    { href: '/history', label: 'Past History' },
  ];

  return (
    <nav className="mb-8 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 font-medium transition-colors ${
              isActive
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}


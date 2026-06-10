'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSwitcher() {
  const pathname = usePathname();
  const inContent = pathname.startsWith('/content');

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-full items-center gap-1 px-6">
        <span className="mr-4 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Bo&rsquo;s Space
        </span>

        <Link
          href="/today"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !inContent
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          Tasks
        </Link>

        <Link
          href="/content"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            inContent
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          Content
        </Link>
      </div>
    </header>
  );
}

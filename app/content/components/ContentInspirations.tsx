'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DbInspiration, DbContentItem, InspirationStatus } from '@/lib/db/interface';
import { ContentItemModal } from './ContentItemModal';

// ── platform config ───────────────────────────────────────────────────────────

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', bg: 'bg-rose-500',  text: 'text-white' },
  tiktok:    { label: 'TikTok',    bg: 'bg-zinc-900',  text: 'text-white' },
} as const;

// ── status filter tabs ────────────────────────────────────────────────────────

const FILTERS: { label: string; value: InspirationStatus | 'all' }[] = [
  { label: 'All',      value: 'all' },
  { label: 'New',      value: 'new' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Saved',    value: 'saved' },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, '');
    const parts = path.split('/').filter(Boolean);
    return u.hostname.replace('www.', '') + '/' + parts.slice(0, 2).join('/');
  } catch {
    return url.slice(0, 48);
  }
}

function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return `${diff}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── card ──────────────────────────────────────────────────────────────────────

function InspirationCard({
  item,
  onDismiss,
  onPromote,
}: {
  item: DbInspiration;
  onDismiss: () => void;
  onPromote: () => void;
}) {
  const p = PLATFORM_CONFIG[item.platform];

  return (
    <div className={`flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${
      item.status === 'saved' ? 'opacity-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${p.bg} ${p.text}`}>
          {p.label}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{relativeDate(item.created_at)}</span>
      </div>

      {/* Title */}
      {item.title && (
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</p>
      )}

      {/* URL */}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline dark:text-blue-400"
      >
        <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span className="truncate">{shortUrl(item.url)}</span>
      </a>

      {/* Notes */}
      {item.notes && (
        <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {item.notes}
        </p>
      )}

      {/* Actions */}
      {item.status !== 'saved' && (
        <div className="flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {item.status === 'new' && (
            <button
              onClick={onDismiss}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              Dismiss
            </button>
          )}
          <button
            onClick={onPromote}
            className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 dark:bg-blue-500"
          >
            → Add to Board
          </button>
        </div>
      )}

      {item.status === 'saved' && (
        <div className="flex items-center gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[11px] text-zinc-400">Added to board</span>
        </div>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export function ContentInspirations() {
  const [inspirations, setInspirations] = useState<DbInspiration[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<InspirationStatus | 'all'>('all');
  const [promoting,    setPromoting]    = useState<DbInspiration | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inspirations');
      if (res.ok) setInspirations(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateStatus = async (id: string, status: InspirationStatus) => {
    setInspirations((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    await fetch('/api/inspirations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
  };

  // After promoting to a content_item, mark the inspiration as saved
  const handlePromoteSave = async (data: Omit<DbContentItem, 'id' | 'created_at'>) => {
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create content item');
    if (promoting) await updateStatus(promoting.id, 'saved');
  };

  const visible = filter === 'all' ? inspirations : inspirations.filter((i) => i.status === filter);
  const newCount = inspirations.filter((i) => i.status === 'new').length;

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Saved inspirations</h2>
            {newCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white">
                {newCount} new
              </span>
            )}
          </div>
          {loading && <span className="text-xs text-zinc-400">Loading…</span>}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-zinc-200 px-6 dark:border-zinc-800">
          {FILTERS.map(({ label, value }) => {
            const isActive = filter === value;
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`relative px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {visible.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-sm font-medium text-zinc-400">
                {filter === 'all' ? 'No inspirations saved yet' : `No ${filter} inspirations`}
              </p>
              <p className="text-xs text-zinc-300 dark:text-zinc-700">
                Save reels from Instagram or TikTok using the iOS share sheet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((item) => (
                <InspirationCard
                  key={item.id}
                  item={item}
                  onDismiss={() => updateStatus(item.id, 'reviewed')}
                  onPromote={() => setPromoting(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promote modal — pre-fills reference_videos and script from the inspiration */}
      {promoting && (
        <ContentItemModal
          defaultStatus="idea"
          onSave={handlePromoteSave}
          onClose={() => setPromoting(null)}
          // Pass URL as reference video and notes as script seed
          item={{
            id: '',
            title: promoting.title,
            status: 'idea',
            scheduled_date: new Date().toISOString().split('T')[0],
            scheduled_time: null,
            duration_minutes: 60,
            platform: promoting.platform,
            reference_videos: promoting.url,
            script: promoting.notes,
            created_at: '',
          }}
        />
      )}
    </>
  );
}

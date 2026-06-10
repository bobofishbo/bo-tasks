'use client';

import { useState } from 'react';
import type { DbBannerEvent } from '@/lib/db/interface';
import { BANNER_COLORS } from '../config';

interface Props {
  defaultStart?: string;
  defaultEnd?: string;
  banner?: DbBannerEvent;
  onSave: (data: Omit<DbBannerEvent, 'id' | 'created_at'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

export function BannerEventModal({ defaultStart, defaultEnd, banner, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(banner?.title ?? '');
  const [color, setColor] = useState(banner?.color ?? 'basil');
  const [startDate, setStartDate] = useState(banner?.start_date ?? defaultStart ?? '');
  const [endDate, setEndDate] = useState(banner?.end_date ?? defaultEnd ?? '');
  const [saving, setSaving] = useState(false);

  const isEdit = !!banner;
  const isValid = title.trim() && startDate && endDate && endDate >= startDate;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({ title: title.trim(), color, start_date: startDate, end_date: endDate });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {isEdit ? 'Edit week event' : 'New week event'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Label</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. US Open Week, Holiday Season…"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Color</label>
            <div className="flex flex-wrap gap-2">
              {BANNER_COLORS.map((c) => (
                <button
                  key={c.id}
                  title={c.label}
                  onClick={() => setColor(c.id)}
                  className={`h-6 w-6 rounded-full ${c.bg} transition-transform ${
                    color === c.id ? 'ring-2 ring-zinc-900 ring-offset-2 dark:ring-zinc-100' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">End</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <div>
            {isEdit && onDelete && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isValid}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500"
            >
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

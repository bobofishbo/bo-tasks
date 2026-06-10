'use client';

import { useState } from 'react';
import type { DbContentItem } from '@/lib/db/interface';
import { STATUS_CONFIG, STATUSES } from '../config';

interface Props {
  date?: string;
  time?: string;
  defaultStatus?: DbContentItem['status'];
  item?: DbContentItem;
  onSave: (data: Omit<DbContentItem, 'id' | 'created_at'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr',   value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr',   value: 120 },
  { label: '3 hr',   value: 180 },
];

export function ContentItemModal({ date, time, defaultStatus, item, onSave, onDelete, onClose }: Props) {
  const [title,           setTitle]           = useState(item?.title ?? '');
  const [status,          setStatus]          = useState<DbContentItem['status']>(item?.status ?? defaultStatus ?? 'idea');
  const [scheduledDate,   setScheduledDate]   = useState(item?.scheduled_date ?? date ?? '');
  const [scheduledTime,   setScheduledTime]   = useState(item?.scheduled_time ?? time ?? '09:00');
  const [durationMinutes, setDurationMinutes] = useState(item?.duration_minutes ?? 60);
  const [platform,        setPlatform]        = useState(item?.platform ?? '');
  const [referenceVideos, setReferenceVideos] = useState(item?.reference_videos ?? '');
  const [script,          setScript]          = useState(item?.script ?? '');
  const [saving,          setSaving]          = useState(false);

  const isEdit  = !!item;
  const isValid = title.trim() && scheduledDate;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        status,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime || null,
        duration_minutes: durationMinutes,
        platform: platform.trim() || null,
        reference_videos: referenceVideos.trim(),
        script: script.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    try { await onDelete(); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {isEdit ? 'Edit content block' : 'New content block'}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">✕</button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you creating?"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    status === s
                      ? 'border-transparent bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Date / Time / Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                {DURATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Platform (optional) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Platform <span className="font-normal text-zinc-400">(optional — for posting later)</span>
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Instagram, YouTube, Twitter…"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Reference Videos */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Reference Videos <span className="font-normal text-zinc-400">(one URL per line)</span>
            </label>
            <textarea
              value={referenceVideos}
              onChange={(e) => setReferenceVideos(e.target.value)}
              placeholder={"https://youtube.com/watch?v=...\nhttps://youtube.com/watch?v=..."}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          {/* Script */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Script / Notes</label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Hook, talking points, CTA…"
              rows={6}
              className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <div>
            {isEdit && onDelete && (
              <button onClick={handleDelete} disabled={saving} className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50">
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose} disabled={saving}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave} disabled={saving || !isValid}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500"
            >
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

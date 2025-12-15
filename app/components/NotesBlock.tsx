'use client';

import { useState, useEffect } from 'react';

export function NotesBlock() {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data.content || '');
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: notes }),
      });

      if (!response.ok) throw new Error('Failed to save notes');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    await fetchNotes(); // Reload from server
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading notes...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Notes & Goals
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your quotes, seasonal goals, or any notes here..."
          className="w-full min-h-[120px] rounded-lg border border-zinc-300 px-4 py-3 text-sm leading-relaxed text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
          autoFocus
          disabled={saving}
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Your notes are saved to the database when you click Save
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          Notes & Goals
        </h2>
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {notes ? 'Edit' : 'Add Notes'}
        </button>
      </div>
      {notes ? (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {notes}
          </p>
        </div>
      ) : (
        <p className="text-sm italic text-zinc-400 dark:text-zinc-500">
          Click "Add Notes" to write quotes, seasonal goals, or any thoughts...
        </p>
      )}
    </div>
  );
}

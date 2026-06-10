'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { DbContentItem, Status } from '@/lib/db/interface';
import { STATUSES, STATUS_CONFIG } from '../config';
import { ContentItemModal } from './ContentItemModal';

// ── column chrome ─────────────────────────────────────────────────────────────

const COLUMN_CONFIG: Record<Status, { bg: string; headerText: string; countBg: string }> = {
  idea:      { bg: 'bg-zinc-50 dark:bg-zinc-900',   headerText: 'text-zinc-600 dark:text-zinc-400',  countBg: 'bg-zinc-200 dark:bg-zinc-700' },
  draft:     { bg: 'bg-amber-50 dark:bg-zinc-900',  headerText: 'text-amber-700 dark:text-amber-400', countBg: 'bg-amber-200 dark:bg-amber-900' },
  scheduled: { bg: 'bg-blue-50 dark:bg-zinc-900',   headerText: 'text-blue-700 dark:text-blue-400',  countBg: 'bg-blue-200 dark:bg-blue-900' },
  published: { bg: 'bg-green-50 dark:bg-zinc-900',  headerText: 'text-green-700 dark:text-green-400', countBg: 'bg-green-200 dark:bg-green-900' },
};

// ── card ──────────────────────────────────────────────────────────────────────

function KanbanCard({ item, onClick }: { item: DbContentItem; onClick: () => void }) {
  const videoCount    = item.reference_videos.split('\n').filter(Boolean).length;
  const scriptPreview = item.script.split('\n').find((l) => l.trim()) ?? '';

  const fmt = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${Number(m)}/${Number(day)}/${y.slice(2)}`;
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
    >
      <p className="text-sm font-medium leading-snug text-zinc-900 line-clamp-2 dark:text-zinc-50">
        {item.title}
      </p>

      {scriptPreview && (
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 line-clamp-2 dark:text-zinc-500">
          {scriptPreview}
        </p>
      )}

      <div className="mt-2.5 flex items-center gap-1.5">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
          {fmt(item.scheduled_date)}
          {item.scheduled_time && ` · ${item.scheduled_time}`}
        </span>

        <div className="flex-1" />

        {item.platform && (
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
            {item.platform}
          </span>
        )}

        {videoCount > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.882V15.118a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {videoCount}
          </span>
        )}
      </div>
    </div>
  );
}

// ── board ─────────────────────────────────────────────────────────────────────

export function ContentBoard() {
  const [items,           setItems]           = useState<DbContentItem[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [editItem,        setEditItem]        = useState<DbContentItem | null>(null);
  const [newItemStatus,   setNewItemStatus]   = useState<Status | null>(null);

  // fetch all items (no date range — board shows everything)
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // group by status, stable order within each column
  const byStatus = STATUSES.reduce<Record<Status, DbContentItem[]>>(
    (acc, s) => {
      acc[s] = items
        .filter((i) => i.status === s)
        .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
      return acc;
    },
    {} as Record<Status, DbContentItem[]>,
  );

  // drag end — optimistic update + persist
  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    const newStatus = destination.droppableId as Status;
    if (source.droppableId === newStatus) return;

    const prev = items.find((i) => i.id === draggableId);
    if (!prev) return;

    setItems((all) => all.map((i) => (i.id === draggableId ? { ...i, status: newStatus } : i)));

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggableId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // revert on failure
      setItems((all) => all.map((i) => (i.id === draggableId ? { ...i, status: prev.status } : i)));
    }
  };

  // CRUD
  const handleCreate = async (data: Omit<DbContentItem, 'id' | 'created_at'>) => {
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create');
    const created: DbContentItem = await res.json();
    setItems((prev) => [...prev, created]);
  };

  const handleUpdate = async (data: Omit<DbContentItem, 'id' | 'created_at'>) => {
    if (!editItem) return;
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editItem.id, ...data }),
    });
    if (!res.ok) throw new Error('Failed to update');
    const updated: DbContentItem = await res.json();
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleDelete = async () => {
    if (!editItem) return;
    await fetch(`/api/content?id=${editItem.id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== editItem.id));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full gap-3 overflow-x-auto p-4">
          {STATUSES.map((status) => {
            const col    = COLUMN_CONFIG[status];
            const cards  = byStatus[status];

            return (
              <div key={status} className="flex w-64 shrink-0 flex-col">
                {/* Column header */}
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${col.headerText}`}>
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 ${col.countBg}`}>
                    {cards.length}
                  </span>
                </div>

                {/* Drop zone */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl p-2 transition-colors ${col.bg} ${
                        snapshot.isDraggingOver ? 'ring-2 ring-blue-400/50' : ''
                      }`}
                    >
                      {cards.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.85 : 1,
                              }}
                            >
                              <KanbanCard item={item} onClick={() => setEditItem(item)} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Empty state */}
                      {cards.length === 0 && !snapshot.isDraggingOver && (
                        <p className="py-4 text-center text-xs text-zinc-300 dark:text-zinc-700">
                          No items
                        </p>
                      )}
                    </div>
                  )}
                </Droppable>

                {/* Add button */}
                <button
                  onClick={() => setNewItemStatus(status)}
                  className="mt-2 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                >
                  <span className="text-base leading-none">+</span> Add
                </button>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create modal */}
      {newItemStatus && !editItem && (
        <ContentItemModal
          defaultStatus={newItemStatus}
          onSave={handleCreate}
          onClose={() => setNewItemStatus(null)}
        />
      )}

      {/* Edit modal */}
      {editItem && (
        <ContentItemModal
          item={editItem}
          onSave={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setEditItem(null)}
        />
      )}
    </>
  );
}

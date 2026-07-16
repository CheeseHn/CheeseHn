import { useCallback, useMemo } from 'react';
import type { CalendarEvent } from '../types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'calendario.eventos.v1';

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useEvents() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>(STORAGE_KEY, []);

  const addEvent = useCallback(
    (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
      const event: CalendarEvent = {
        ...data,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, event]);
      return event;
    },
    [setEvents]
  );

  const updateEvent = useCallback(
    (id: string, data: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    },
    [setEvents]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    },
    [setEvents]
  );

  const exportEvents = useCallback(() => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendario-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const importEvents = useCallback(
    (file: File) => {
      return file.text().then((text) => {
        const parsed = JSON.parse(text) as CalendarEvent[];
        if (!Array.isArray(parsed)) throw new Error('Formato inválido');
        setEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const merged = [...prev];
          for (const item of parsed) {
            if (!existingIds.has(item.id)) merged.push(item);
          }
          return merged;
        });
      });
    },
    [setEvents]
  );

  return useMemo(
    () => ({ events, addEvent, updateEvent, deleteEvent, exportEvents, importEvents }),
    [events, addEvent, updateEvent, deleteEvent, exportEvents, importEvents]
  );
}

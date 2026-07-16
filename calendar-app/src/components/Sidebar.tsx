import { useMemo, useRef, useState } from 'react';
import type { CalendarEvent } from '../types';
import { EVENT_TYPES } from '../types';
import { addDays, formatShortDate, todayKey } from '../utils/date';
import { getOccurrencesInRange, nextYearlyOccurrence } from '../utils/occurrences';

interface Props {
  events: CalendarEvent[];
  notificationPermission: 'unsupported' | 'default' | 'granted' | 'denied';
  onRequestNotifications: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onJumpToDate: (dateKey: string) => void;
}

const UPCOMING_WINDOW_DAYS = 14;

export function Sidebar({
  events,
  notificationPermission,
  onRequestNotifications,
  onExport,
  onImport,
  onJumpToDate,
}: Props) {
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upcoming = useMemo(() => {
    const from = todayKey();
    const to = addDays(from, UPCOMING_WINDOW_DAYS);
    return getOccurrencesInRange(events, from, to)
      .filter((occ) => occ.event.type !== 'cumpleanos')
      .sort((a, b) => (a.date + (a.event.time ?? '')).localeCompare(b.date + (b.event.time ?? '')))
      .slice(0, 8);
  }, [events]);

  const birthdays = useMemo(() => {
    const today = todayKey();
    return events
      .filter((e) => e.type === 'cumpleanos')
      .map((event) => ({ event, next: nextYearlyOccurrence(event, today) }))
      .filter((b): b is { event: CalendarEvent; next: string } => b.next !== null)
      .sort((a, b) => a.next.localeCompare(b.next))
      .slice(0, 6);
  }, [events]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return events
      .filter((e) => e.title.toLowerCase().includes(q))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [events, search]);

  function daysAway(dateKey: string): string {
    const diff = Math.round(
      (new Date(dateKey).getTime() - new Date(todayKey()).getTime()) / 86400000
    );
    if (diff === 0) return 'hoy';
    if (diff === 1) return 'mañana';
    return `en ${diff} días`;
  }

  return (
    <aside className="sidebar">
      <section className="sidebar-section">
        <h3>Buscar</h3>
        <input
          type="search"
          placeholder="Buscar eventos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search.trim() && (
          <ul className="sidebar-list">
            {searchResults.length === 0 && <li className="empty-hint">Sin resultados</li>}
            {searchResults.map((event) => (
              <li key={event.id} className="sidebar-list-item" onClick={() => onJumpToDate(event.date)}>
                <span aria-hidden="true">{EVENT_TYPES[event.type].icon}</span>
                <span className="sidebar-list-title">{event.title}</span>
                <span className="sidebar-list-date">{formatShortDate(event.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sidebar-section">
        <h3>Próximos {UPCOMING_WINDOW_DAYS} días</h3>
        {upcoming.length === 0 && <p className="empty-hint">Nada por ahora.</p>}
        <ul className="sidebar-list">
          {upcoming.map((occ) => (
            <li
              key={`${occ.event.id}-${occ.date}`}
              className="sidebar-list-item"
              onClick={() => onJumpToDate(occ.date)}
            >
              <span aria-hidden="true">{EVENT_TYPES[occ.event.type].icon}</span>
              <span className="sidebar-list-title">
                {occ.event.title}
                {occ.event.time && <span className="sidebar-list-time"> {occ.event.time}</span>}
              </span>
              <span className="sidebar-list-date">{formatShortDate(occ.date)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sidebar-section">
        <h3>🎂 Próximos cumpleaños</h3>
        {birthdays.length === 0 && <p className="empty-hint">Aún no agregaste cumpleaños.</p>}
        <ul className="sidebar-list">
          {birthdays.map(({ event, next }) => (
            <li key={event.id} className="sidebar-list-item" onClick={() => onJumpToDate(next)}>
              <span aria-hidden="true">🎂</span>
              <span className="sidebar-list-title">{event.title}</span>
              <span className="sidebar-list-date">{daysAway(next)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sidebar-section">
        <h3>Notificaciones</h3>
        {notificationPermission === 'unsupported' && (
          <p className="empty-hint">Tu navegador no soporta notificaciones.</p>
        )}
        {notificationPermission === 'granted' && <p className="empty-hint">Activadas ✓</p>}
        {notificationPermission === 'denied' && (
          <p className="empty-hint">Bloqueadas. Actívalas desde la configuración del navegador.</p>
        )}
        {notificationPermission === 'default' && (
          <button type="button" className="btn btn-ghost btn-block" onClick={onRequestNotifications}>
            Activar notificaciones
          </button>
        )}
      </section>

      <section className="sidebar-section">
        <h3>Copia de seguridad</h3>
        <div className="backup-actions">
          <button type="button" className="btn btn-ghost" onClick={onExport}>
            Exportar
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
            Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.target.value = '';
            }}
          />
        </div>
      </section>
    </aside>
  );
}

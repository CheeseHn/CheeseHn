import type React from 'react';
import { useEffect, useState } from 'react';
import type { CalendarEvent, Occurrence } from '../types';
import { EVENT_TYPES } from '../types';
import { formatFriendlyDate } from '../utils/date';
import { EventForm } from './EventForm';

interface Props {
  dateKey: string;
  occurrences: Occurrence[];
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, data: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export function DayPanel({ dateKey, occurrences, onClose, onSave, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<'list' | 'form'>(occurrences.length === 0 ? 'form' : 'list');
  const [editing, setEditing] = useState<CalendarEvent | undefined>(undefined);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function startCreate() {
    setEditing(undefined);
    setMode('form');
  }

  function startEdit(event: CalendarEvent) {
    setEditing(event);
    setMode('form');
  }

  function handleSave(data: Omit<CalendarEvent, 'id' | 'createdAt'>) {
    if (editing) {
      onUpdate(editing.id, data);
    } else {
      onSave(data);
    }
    setMode('list');
    setEditing(undefined);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{formatFriendlyDate(dateKey)}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {mode === 'list' && (
          <div className="modal-body">
            {occurrences.length === 0 && <p className="empty-hint">No hay nada planeado este día.</p>}
            <ul className="day-event-list">
              {occurrences.map((occ) => {
                const meta = EVENT_TYPES[occ.event.type];
                return (
                  <li key={occ.event.id} className="day-event-item" style={{ '--chip-color': meta.color } as React.CSSProperties}>
                    <div className="day-event-info">
                      <span className="day-event-icon" aria-hidden="true">
                        {meta.icon}
                      </span>
                      <div>
                        <div className="day-event-title">
                          {occ.event.title}
                          {occ.event.time && <span className="day-event-time"> · {occ.event.time}</span>}
                        </div>
                        <div className="day-event-meta">
                          {meta.label}
                          {occ.event.recurrence !== 'none' && ' · se repite'}
                        </div>
                        {occ.event.notes && <div className="day-event-notes">{occ.event.notes}</div>}
                      </div>
                    </div>
                    <div className="day-event-actions">
                      <button type="button" className="btn-icon" onClick={() => startEdit(occ.event)} aria-label="Editar">
                        ✎
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => {
                          if (confirm(`¿Eliminar "${occ.event.title}"?`)) onDelete(occ.event.id);
                        }}
                        aria-label="Eliminar"
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="btn btn-primary btn-block" onClick={startCreate}>
              + Agregar algo este día
            </button>
          </div>
        )}

        {mode === 'form' && (
          <div className="modal-body">
            <EventForm
              dateKey={dateKey}
              initial={editing}
              onSave={handleSave}
              onCancel={() => (occurrences.length > 0 ? setMode('list') : onClose())}
            />
          </div>
        )}
      </div>
    </div>
  );
}

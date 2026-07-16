import type React from 'react';
import { useState } from 'react';
import type { CalendarEvent, EventType, Recurrence } from '../types';
import { EVENT_TYPE_ORDER, EVENT_TYPES } from '../types';

interface Props {
  dateKey: string;
  initial?: CalendarEvent;
  onSave: (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: 'No se repite',
  weekly: 'Cada semana',
  monthly: 'Cada mes',
  yearly: 'Cada año',
};

export function EventForm({ dateKey, initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<EventType>(initial?.type ?? 'reunion');
  const [date, setDate] = useState(initial?.date ?? dateKey);
  const [time, setTime] = useState(initial?.time ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>(
    initial?.recurrence ?? (initial ? 'none' : 'none')
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [notify, setNotify] = useState(initial?.notify ?? false);
  const [notifyMinutesBefore, setNotifyMinutesBefore] = useState(
    initial?.notifyMinutesBefore ?? 10
  );

  function handleTypeChange(next: EventType) {
    setType(next);
    if (next === 'cumpleanos' && recurrence === 'none') {
      setRecurrence('yearly');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      type,
      date,
      time: time || undefined,
      recurrence,
      notes: notes.trim() || undefined,
      notify: notify && Boolean(time),
      notifyMinutesBefore,
    });
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Título</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Reunión con el equipo"
          autoFocus
          required
        />
      </label>

      <label className="field">
        <span>Tipo</span>
        <div className="type-picker">
          {EVENT_TYPE_ORDER.map((t) => {
            const meta = EVENT_TYPES[t];
            return (
              <button
                type="button"
                key={t}
                className={`type-option ${type === t ? 'type-option-active' : ''}`}
                style={{ '--chip-color': meta.color } as React.CSSProperties}
                onClick={() => handleTypeChange(t)}
              >
                <span aria-hidden="true">{meta.icon}</span> {meta.label}
              </button>
            );
          })}
        </div>
      </label>

      <div className="field-row">
        <label className="field">
          <span>Fecha</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="field">
          <span>Hora (opcional)</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Repetición</span>
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
          {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((r) => (
            <option key={r} value={r}>
              {RECURRENCE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Notas (opcional)</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </label>

      <div className="field field-notify">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notify}
            disabled={!time}
            onChange={(e) => setNotify(e.target.checked)}
          />
          <span>Avisarme con notificación {!time && '(elige una hora primero)'}</span>
        </label>
        {notify && time && (
          <label className="field">
            <span>Avisar con anticipación (minutos)</span>
            <input
              type="number"
              min={0}
              max={1440}
              value={notifyMinutesBefore}
              onChange={(e) => setNotifyMinutesBefore(Number(e.target.value))}
            />
          </label>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}

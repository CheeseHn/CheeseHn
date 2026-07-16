export type EventType =
  | 'reunion'
  | 'cita'
  | 'alarma'
  | 'cumpleanos'
  | 'tarea'
  | 'nota';

export type Recurrence = 'none' | 'weekly' | 'monthly' | 'yearly';

export type ViewMode = 'month' | 'week';

export interface CalendarEvent {
  id: string;
  title: string;
  /** Anchor date in YYYY-MM-DD. For recurring events this is the first occurrence. */
  date: string;
  /** Optional time in HH:MM (24h). */
  time?: string;
  type: EventType;
  notes?: string;
  recurrence: Recurrence;
  notify: boolean;
  notifyMinutesBefore: number;
  createdAt: string;
}

export interface EventTypeMeta {
  label: string;
  color: string;
  icon: string;
}

export const EVENT_TYPES: Record<EventType, EventTypeMeta> = {
  reunion: { label: 'Reunión', color: '#3b82f6', icon: '👥' },
  cita: { label: 'Cita', color: '#8b5cf6', icon: '📌' },
  alarma: { label: 'Alarma', color: '#ef4444', icon: '⏰' },
  cumpleanos: { label: 'Cumpleaños', color: '#f59e0b', icon: '🎂' },
  tarea: { label: 'Tarea', color: '#10b981', icon: '✅' },
  nota: { label: 'Nota', color: '#6b7280', icon: '📝' },
};

export const EVENT_TYPE_ORDER: EventType[] = [
  'reunion',
  'cita',
  'alarma',
  'cumpleanos',
  'tarea',
  'nota',
];

/** A specific calendar-day occurrence of an event (recurring events expand into many). */
export interface Occurrence {
  event: CalendarEvent;
  date: string; // YYYY-MM-DD of this specific occurrence
}

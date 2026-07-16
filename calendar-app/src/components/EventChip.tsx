import type React from 'react';
import { EVENT_TYPES } from '../types';
import type { CalendarEvent } from '../types';

interface Props {
  event: CalendarEvent;
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
}

export function EventChip({ event, onClick, showTime = true }: Props) {
  const meta = EVENT_TYPES[event.type];
  return (
    <button
      type="button"
      className="event-chip"
      style={{ '--chip-color': meta.color } as React.CSSProperties}
      onClick={onClick}
      title={event.title}
    >
      <span className="event-chip-icon" aria-hidden="true">
        {meta.icon}
      </span>
      {showTime && event.time && <span className="event-chip-time">{event.time}</span>}
      <span className="event-chip-title">{event.title}</span>
    </button>
  );
}

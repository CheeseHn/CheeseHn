import type { Occurrence } from '../types';
import { WEEKDAY_NAMES_SHORT, parseDateKey, todayKey } from '../utils/date';
import { EventChip } from './EventChip';

interface Props {
  weekDates: string[];
  occurrencesByDate: Map<string, Occurrence[]>;
  onSelectDay: (dateKey: string) => void;
}

export function WeekGrid({ weekDates, occurrencesByDate, onSelectDay }: Props) {
  const today = todayKey();

  return (
    <div className="calendar-grid week-grid">
      <div className="calendar-week week-row">
        {weekDates.map((dateKey, i) => {
          const isToday = dateKey === today;
          const dayOccurrences = occurrencesByDate.get(dateKey) ?? [];
          const dayNumber = parseDateKey(dateKey).getDate();

          return (
            <div
              role="button"
              tabIndex={0}
              key={dateKey}
              className={['calendar-day', 'week-day', isToday ? 'calendar-day-today' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectDay(dateKey)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectDay(dateKey);
              }}
            >
              <div className="week-day-header">
                <span className="week-day-name">{WEEKDAY_NAMES_SHORT[i]}</span>
                <span className="calendar-day-number">{dayNumber}</span>
              </div>
              <span className="calendar-day-events week-day-events">
                {dayOccurrences.length === 0 && <span className="empty-hint">Sin planes</span>}
                {dayOccurrences.map((occ) => (
                  <EventChip
                    key={`${occ.event.id}-${occ.date}`}
                    event={occ.event}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDay(dateKey);
                    }}
                  />
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import type { Occurrence } from '../types';
import { WEEKDAY_NAMES_SHORT, getMonthMatrix, isSameMonth, todayKey } from '../utils/date';
import { EventChip } from './EventChip';

interface Props {
  year: number;
  month: number;
  occurrencesByDate: Map<string, Occurrence[]>;
  onSelectDay: (dateKey: string) => void;
}

const MAX_VISIBLE = 3;

export function CalendarGrid({ year, month, occurrencesByDate, onSelectDay }: Props) {
  const weeks = getMonthMatrix(year, month);
  const today = todayKey();

  return (
    <div className="calendar-grid">
      <div className="calendar-weekdays">
        {WEEKDAY_NAMES_SHORT.map((name) => (
          <div key={name} className="calendar-weekday">
            {name}
          </div>
        ))}
      </div>
      <div className="calendar-weeks">
        {weeks.map((week) => (
          <div className="calendar-week" key={week[0]}>
            {week.map((dateKey) => {
              const inMonth = isSameMonth(dateKey, year, month);
              const isToday = dateKey === today;
              const dayOccurrences = occurrencesByDate.get(dateKey) ?? [];
              const visible = dayOccurrences.slice(0, MAX_VISIBLE);
              const overflow = dayOccurrences.length - visible.length;
              const dayNumber = Number(dateKey.slice(-2));

              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={dateKey}
                  className={[
                    'calendar-day',
                    inMonth ? '' : 'calendar-day-outside',
                    isToday ? 'calendar-day-today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectDay(dateKey)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelectDay(dateKey);
                  }}
                >
                  <span className="calendar-day-number">{dayNumber}</span>
                  <span className="calendar-day-events">
                    {visible.map((occ) => (
                      <EventChip
                        key={`${occ.event.id}-${occ.date}`}
                        event={occ.event}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDay(dateKey);
                        }}
                      />
                    ))}
                    {overflow > 0 && <span className="calendar-day-more">+{overflow} más</span>}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

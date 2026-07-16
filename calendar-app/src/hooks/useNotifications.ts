import { useCallback, useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '../types';
import { EVENT_TYPES } from '../types';
import { addDays, todayKey } from '../utils/date';
import { getOccurrencesInRange } from '../utils/occurrences';
import { useLocalStorage } from './useLocalStorage';

const FIRED_KEY = 'calendario.notificaciones.disparadas.v1';
const CHECK_INTERVAL_MS = 20_000;

type Support = 'unsupported' | 'default' | 'granted' | 'denied';

export function useNotifications(events: CalendarEvent[]) {
  const [permission, setPermission] = useState<Support>(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission as Support;
  });
  const [fired, setFired] = useLocalStorage<string[]>(FIRED_KEY, []);
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const firedRef = useRef(fired);
  firedRef.current = fired;

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result as Support);
  }, []);

  useEffect(() => {
    // Prune fired-markers older than 3 days so the list doesn't grow forever.
    const cutoff = addDays(todayKey(), -3);
    setFired((prev) => prev.filter((entry) => entry.split('|')[1] >= cutoff));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;

    const check = () => {
      const now = new Date();
      const from = addDays(todayKey(), -1);
      const to = addDays(todayKey(), 1);
      const occurrences = getOccurrencesInRange(eventsRef.current, from, to);
      const toFire: string[] = [];

      for (const occ of occurrences) {
        const { event, date } = occ;
        if (!event.notify || !event.time) continue;
        const key = `${event.id}|${date}`;
        if (firedRef.current.includes(key)) continue;

        const [h, m] = event.time.split(':').map(Number);
        const target = new Date(date + 'T00:00:00');
        target.setHours(h, m, 0, 0);
        target.setMinutes(target.getMinutes() - event.notifyMinutesBefore);

        const diffMs = now.getTime() - target.getTime();
        // Fire once the trigger time has passed, within a 2-minute catch-up window.
        if (diffMs >= 0 && diffMs <= 2 * 60_000) {
          const meta = EVENT_TYPES[event.type];
          const body =
            event.notifyMinutesBefore > 0
              ? `${meta.label} a las ${event.time} (en ${event.notifyMinutesBefore} min)`
              : `${meta.label} a las ${event.time}`;
          new Notification(`${meta.icon} ${event.title}`, { body, tag: key });
          toFire.push(key);
        }
      }

      if (toFire.length > 0) {
        setFired((prev) => [...prev, ...toFire]);
      }
    };

    check();
    const id = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [permission, setFired]);

  return { permission, requestPermission };
}

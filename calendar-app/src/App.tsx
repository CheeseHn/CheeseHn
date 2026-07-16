import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { CalendarGrid } from './components/CalendarGrid';
import { DayPanel } from './components/DayPanel';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WeekGrid } from './components/WeekGrid';
import { useEvents } from './hooks/useEvents';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import type { ViewMode } from './types';
import { MONTH_NAMES, addDays, formatWeekRangeLabel, getMonthMatrix, getWeekDates, todayKey } from './utils/date';
import { groupOccurrencesByDate, getOccurrencesInRange } from './utils/occurrences';

function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [weekAnchor, setWeekAnchor] = useState(todayKey());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useLocalStorage('calendario.tema.oscuro', false);

  const { events, addEvent, updateEvent, deleteEvent, exportEvents, importEvents } = useEvents();
  const { permission, requestPermission } = useNotifications(events);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);

  const occurrencesByDate = useMemo(() => {
    let start: string;
    let end: string;
    if (viewMode === 'week') {
      start = weekDates[0];
      end = weekDates[6];
    } else {
      const weeks = getMonthMatrix(year, month);
      start = weeks[0][0];
      end = weeks[weeks.length - 1][6];
    }
    return groupOccurrencesByDate(getOccurrencesInRange(events, start, end));
  }, [events, year, month, viewMode, weekDates]);

  function goToPrevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToPrev() {
    if (viewMode === 'week') {
      setWeekAnchor((d) => addDays(d, -7));
    } else {
      goToPrevMonth();
    }
  }

  function goToNext() {
    if (viewMode === 'week') {
      setWeekAnchor((d) => addDays(d, 7));
    } else {
      goToNextMonth();
    }
  }

  function goToToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setWeekAnchor(todayKey());
  }

  function changeViewMode(next: ViewMode) {
    if (next === viewMode) return;
    if (next === 'week') {
      // Keep today's date if we're already looking at the current month, otherwise
      // land on the 1st of whichever month was showing.
      const now = new Date();
      const anchor =
        now.getFullYear() === year && now.getMonth() === month ? todayKey() : `${year}-${String(month + 1).padStart(2, '0')}-01`;
      setWeekAnchor(anchor);
    } else {
      const d = new Date(weekAnchor);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    }
    setViewMode(next);
  }

  function jumpToDate(dateKey: string) {
    const d = new Date(dateKey);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setWeekAnchor(dateKey);
    setSelectedDate(dateKey);
  }

  const selectedOccurrences = selectedDate ? occurrencesByDate.get(selectedDate) ?? [] : [];
  const periodLabel = viewMode === 'week' ? formatWeekRangeLabel(weekDates) : `${MONTH_NAMES[month]} ${year}`;

  return (
    <div className="app">
      <Header
        periodLabel={periodLabel}
        viewMode={viewMode}
        onChangeViewMode={changeViewMode}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
        onAddEvent={() => setSelectedDate(todayKey())}
      />

      <div className="app-body">
        {viewMode === 'month' ? (
          <CalendarGrid
            year={year}
            month={month}
            occurrencesByDate={occurrencesByDate}
            onSelectDay={setSelectedDate}
          />
        ) : (
          <WeekGrid weekDates={weekDates} occurrencesByDate={occurrencesByDate} onSelectDay={setSelectedDate} />
        )}
        <Sidebar
          events={events}
          notificationPermission={permission}
          onRequestNotifications={requestPermission}
          onExport={exportEvents}
          onImport={importEvents}
          onJumpToDate={jumpToDate}
        />
      </div>

      {selectedDate && (
        <DayPanel
          dateKey={selectedDate}
          occurrences={selectedOccurrences}
          onClose={() => setSelectedDate(null)}
          onSave={(data) => addEvent(data)}
          onUpdate={(id, data) => updateEvent(id, data)}
          onDelete={(id) => deleteEvent(id)}
        />
      )}
    </div>
  );
}

export default App;

import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { CalendarGrid } from './components/CalendarGrid';
import { DayPanel } from './components/DayPanel';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { useEvents } from './hooks/useEvents';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { getMonthMatrix, todayKey } from './utils/date';
import { groupOccurrencesByDate, getOccurrencesInRange } from './utils/occurrences';

function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useLocalStorage('calendario.tema.oscuro', false);

  const { events, addEvent, updateEvent, deleteEvent, exportEvents, importEvents } = useEvents();
  const { permission, requestPermission } = useNotifications(events);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const occurrencesByDate = useMemo(() => {
    const weeks = getMonthMatrix(year, month);
    const start = weeks[0][0];
    const end = weeks[weeks.length - 1][6];
    return groupOccurrencesByDate(getOccurrencesInRange(events, start, end));
  }, [events, year, month]);

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

  function goToToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  function jumpToDate(dateKey: string) {
    const d = new Date(dateKey);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelectedDate(dateKey);
  }

  const selectedOccurrences = selectedDate ? occurrencesByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="app">
      <Header
        year={year}
        month={month}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
        onAddEvent={() => setSelectedDate(todayKey())}
      />

      <div className="app-body">
        <CalendarGrid
          year={year}
          month={month}
          occurrencesByDate={occurrencesByDate}
          onSelectDay={setSelectedDate}
        />
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

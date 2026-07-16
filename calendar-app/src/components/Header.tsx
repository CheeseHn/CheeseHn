import { MONTH_NAMES } from '../utils/date';

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onAddEvent: () => void;
}

export function Header({ year, month, onPrev, onNext, onToday, darkMode, onToggleDarkMode, onAddEvent }: Props) {
  return (
    <header className="app-header">
      <div className="app-header-title">
        <span className="app-logo" aria-hidden="true">
          🗓️
        </span>
        <h1>Mi Calendario</h1>
      </div>

      <div className="month-nav">
        <button type="button" className="btn-icon" onClick={onPrev} aria-label="Mes anterior">
          ‹
        </button>
        <span className="month-nav-label">
          {MONTH_NAMES[month]} {year}
        </span>
        <button type="button" className="btn-icon" onClick={onNext} aria-label="Mes siguiente">
          ›
        </button>
        <button type="button" className="btn btn-ghost" onClick={onToday}>
          Hoy
        </button>
      </div>

      <div className="app-header-actions">
        <button type="button" className="btn btn-primary" onClick={onAddEvent}>
          + Nuevo
        </button>
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleDarkMode}
          aria-label="Cambiar tema"
          title="Cambiar tema claro/oscuro"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

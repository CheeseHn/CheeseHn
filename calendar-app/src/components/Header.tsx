import type { ViewMode } from '../types';

interface Props {
  periodLabel: string;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onAddEvent: () => void;
}

export function Header({
  periodLabel,
  viewMode,
  onChangeViewMode,
  onPrev,
  onNext,
  onToday,
  darkMode,
  onToggleDarkMode,
  onAddEvent,
}: Props) {
  const prevLabel = viewMode === 'week' ? 'Semana anterior' : 'Mes anterior';
  const nextLabel = viewMode === 'week' ? 'Semana siguiente' : 'Mes siguiente';

  return (
    <header className="app-header">
      <div className="app-header-title">
        <span className="app-logo" aria-hidden="true">
          🗓️
        </span>
        <h1>Mi Calendario</h1>
      </div>

      <div className="month-nav">
        <button type="button" className="btn-icon" onClick={onPrev} aria-label={prevLabel}>
          ‹
        </button>
        <span className="month-nav-label">{periodLabel}</span>
        <button type="button" className="btn-icon" onClick={onNext} aria-label={nextLabel}>
          ›
        </button>
        <button type="button" className="btn btn-ghost" onClick={onToday}>
          Hoy
        </button>
      </div>

      <div className="view-toggle" role="group" aria-label="Cambiar vista">
        <button
          type="button"
          className={`view-toggle-option ${viewMode === 'month' ? 'view-toggle-active' : ''}`}
          onClick={() => onChangeViewMode('month')}
        >
          Mes
        </button>
        <button
          type="button"
          className={`view-toggle-option ${viewMode === 'week' ? 'view-toggle-active' : ''}`}
          onClick={() => onChangeViewMode('week')}
        >
          Semana
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

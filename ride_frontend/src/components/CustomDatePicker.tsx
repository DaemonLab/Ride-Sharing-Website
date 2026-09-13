import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  minDate?: string; // YYYY-MM-DD
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function CustomDatePicker({
  value,
  onChange,
  minDate,
  placeholder = "Select Date",
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial selected date or current date for month view
  const getInitialDate = () => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(getInitialDate());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDisplay = (val: string) => {
    if (!val) return "";
    const d = new Date(val + "T00:00:00");
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate days grid for currentMonth
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Helper to format Date -> "YYYY-MM-DD"
  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-input flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 group ${
          isOpen ? "border-primary/60 shadow-glow" : "hover:border-primary/40"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <CalendarIcon className="w-5 h-5 text-primary shrink-0 transition-transform group-hover:scale-110" />
          <span
            className={`text-sm truncate font-medium ${
              value ? "text-ink" : "text-ink-variant/50"
            }`}
          >
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-ink-variant/50 hover:text-ink hover:bg-surface-low transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Opaque Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white border border-outline-variant/40 rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="font-display font-bold text-sm text-ink">
              {monthNames[month]} {year}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-surface-container text-ink-variant hover:text-ink transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-surface-container text-ink-variant hover:text-ink transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {dayNames.map((day) => (
              <span key={day} className="text-[11px] font-semibold text-outline font-display py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
            {/* Previous Month Padding Days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
              return (
                <span
                  key={`prev-${i}`}
                  className="py-2 text-outline-variant/40 pointer-events-none select-none"
                >
                  {dayNum}
                </span>
              );
            })}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDateString(year, month, dayNum);
              const isSelected = value === dateStr;
              const isToday = todayStr === dateStr;
              const isDisabled = minDate ? dateStr < minDate : false;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDate(dateStr)}
                  className={`py-2 rounded-xl transition-all duration-150 relative ${
                    isSelected
                      ? "bg-primary text-white font-bold shadow-glow scale-105 z-10"
                      : isDisabled
                      ? "text-outline-variant/30 cursor-not-allowed"
                      : "text-ink hover:bg-primary/15 hover:text-primary font-medium"
                  }`}
                >
                  {dayNum}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-outline-variant/30 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSelectDate(todayStr)}
              className="text-primary hover:underline"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => handleSelectDate("")}
                className="text-ink-variant hover:text-danger"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

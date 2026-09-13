import React, { useRef } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";

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
  required = false,
}: CustomDatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
    e.preventDefault();
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const triggerPicker = () => {
    try {
      inputRef.current?.showPicker?.();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <div
      onClick={triggerPicker}
      className={`glass-input relative flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all hover:border-primary/50 group ${className}`}
    >
      <div className="flex items-center gap-3 overflow-hidden pointer-events-none">
        <CalendarIcon className="w-5 h-5 text-primary shrink-0 transition-transform group-hover:scale-110" />
        <span
          className={`text-sm truncate select-none ${
            value ? "text-ink font-medium" : "text-ink-variant/50"
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
            className="relative z-20 p-1 rounded-full text-ink-variant/50 hover:text-ink hover:bg-ink/10 transition-colors"
            title="Clear date"
            aria-label="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Transparent native HTML5 date input capturing clicks, keyboard, and OS pickers */}
      <input
        ref={inputRef}
        type="date"
        value={value || ""}
        min={minDate}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker?.();
          } catch {}
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            try {
              e.currentTarget.showPicker?.();
            } catch {}
          }
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
    </div>
  );
}

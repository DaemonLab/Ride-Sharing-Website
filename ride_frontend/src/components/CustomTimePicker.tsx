import React, { useState, useRef, useEffect } from "react";
import { Clock as ClockIcon, X, Check } from "lucide-react";

interface CustomTimePickerProps {
  value: string; // HH:mm (24-hour format)
  onChange: (timeStr: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function CustomTimePicker({
  value,
  onChange,
  placeholder = "Select Time",
  className = "",
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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
    const parts = val.split(":");
    if (parts.length < 2) return val;
    const h = parseInt(parts[0], 10);
    const m = parts[1].slice(0, 2);
    if (Number.isNaN(h)) return val;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${m} ${period}`;
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  // Helper to parse 24h string to 12h parts
  const parseTimeParts = (val: string) => {
    if (!val) return { hour: 9, minute: "00", period: "AM" };
    const parts = val.split(":");
    if (parts.length < 2) return { hour: 9, minute: "00", period: "AM" };
    let h = parseInt(parts[0], 10) || 0;
    const m = parts[1].slice(0, 2);
    const period = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return { hour: h, minute: m, period };
  };

  const { hour: selHour, minute: selMin, period: selPeriod } = parseTimeParts(value);

  const applyTime = (h12: number, min: string, period: string) => {
    let h24 = h12;
    if (period === "PM" && h12 !== 12) h24 += 12;
    if (period === "AM" && h12 === 12) h24 = 0;
    const formatted = `${String(h24).padStart(2, "0")}:${min}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const presetTimes = [
    { label: "Morning", time: "09:00", display: "9:00 AM" },
    { label: "Noon", time: "12:00", display: "12:00 PM" },
    { label: "Afternoon", time: "15:00", display: "3:00 PM" },
    { label: "Evening", time: "18:00", display: "6:00 PM" },
    { label: "Night", time: "21:00", display: "9:00 PM" },
  ];

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = ["00", "15", "30", "45"];

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
          <ClockIcon className="w-5 h-5 text-primary shrink-0 transition-transform group-hover:scale-110" />
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
              title="Clear time"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Opaque Time Picker Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white border border-outline-variant/40 rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Presets */}
          <div className="mb-3.5">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block mb-2 px-1">
              Quick Select
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetTimes.map((preset) => (
                <button
                  key={preset.time}
                  type="button"
                  onClick={() => {
                    onChange(preset.time);
                    setIsOpen(false);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    value === preset.time
                      ? "bg-primary text-white border-primary font-bold shadow-sm"
                      : "glass-input text-ink-variant hover:text-ink hover:border-primary/40"
                  }`}
                >
                  {preset.display}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-3">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block mb-2 px-1">
              Custom Time
            </span>

            {/* Hours Grid */}
            <div className="grid grid-cols-4 gap-1 text-center text-xs mb-2">
              {hoursList.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => applyTime(h, selMin, selPeriod)}
                  className={`py-1.5 rounded-lg transition-all ${
                    selHour === h
                      ? "bg-primary text-white font-bold shadow-sm"
                      : "text-ink hover:bg-primary/15 hover:text-primary"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Minutes & AM/PM Controls */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/20">
              <div className="flex gap-1">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => applyTime(selHour, m, selPeriod)}
                    className={`text-xs px-2 py-1 rounded-md transition-all ${
                      selMin === m
                        ? "bg-primary text-white font-bold"
                        : "bg-surface-low text-ink-variant hover:text-ink"
                    }`}
                  >
                    :{m}
                  </button>
                ))}
              </div>

              <div className="flex bg-surface-low rounded-lg p-0.5 border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => applyTime(selHour, selMin, "AM")}
                  className={`text-xs px-2 py-0.5 rounded-md font-bold transition-all ${
                    selPeriod === "AM" ? "bg-primary text-white" : "text-ink-variant hover:text-ink"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => applyTime(selHour, selMin, "PM")}
                  className={`text-xs px-2 py-0.5 rounded-md font-bold transition-all ${
                    selPeriod === "PM" ? "bg-primary text-white" : "text-ink-variant hover:text-ink"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

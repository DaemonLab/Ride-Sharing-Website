import { useState, useRef, useEffect } from "react";
import { Car, ChevronDown, Check } from "lucide-react";

interface VehicleOption {
  id: "rickshaw" | "cab" | "other";
  name: string;
  description: string;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: "rickshaw",
    name: "Rickshaw / Auto",
    description: "Compact 3-wheeler for quick city trips (up to 3 seats)",
  },
  {
    id: "cab",
    name: "Cab / Car",
    description: "Sedan or hatchback for comfort and luggage (up to 6 seats)",
  },
  {
    id: "other",
    name: "Other",
    description: "Other vehicle type or custom ride sharing arrangement",
  },
];

interface CustomVehicleSelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomVehicleSelect({
  value,
  onChange,
  placeholder = "Select Vehicle Type",
  className = "",
}: CustomVehicleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = VEHICLE_OPTIONS.find((v) => v.id === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200 cursor-pointer select-none ${
          value
            ? "bg-white/80 border border-primary/30 shadow-[0_2px_16px_rgba(46,123,255,0.08)] hover:border-primary/60 hover:bg-white"
            : "bg-white/55 border border-white/80 shadow-[0_2px_12px_rgba(46,123,255,0.04)] hover:bg-white/80 hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(46,123,255,0.1)]"
        } backdrop-blur-md hover:border-primary/50`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
              value
                ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-sm shadow-primary/30 scale-100"
                : "bg-primary/10 text-primary border border-primary/15 group-hover:scale-105 group-hover:bg-primary/15"
            }`}
          >
            <Car className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span
              className={`text-sm font-semibold truncate ${
                selectedOption ? "text-ink capitalize" : "text-ink-variant/60 font-medium"
              }`}
            >
              {selectedOption ? selectedOption.name : placeholder}
            </span>
            <span className="text-[11px] text-ink-variant/50 leading-tight">
              {selectedOption ? "Selected vehicle type" : "Select vehicle type"}
            </span>
          </div>
        </div>
        <div className="p-1 text-ink-variant/40 group-hover:text-primary transition-colors">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : "group-hover:translate-y-0.5"
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 left-0 right-0 rounded-2xl bg-white border border-outline-variant/40 p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-1"
          style={{
            boxShadow: "0 20px 48px rgba(46, 123, 255, 0.18), 0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          {VEHICLE_OPTIONS.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`flex items-start justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-ink/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-ink/5 text-ink-variant"
                    }`}
                  >
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-ink"}`}>
                      {opt.name}
                    </p>
                    <p className="text-xs text-ink-variant mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

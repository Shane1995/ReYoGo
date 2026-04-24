import { useState, useRef } from "react";
import { format, parse, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DISPLAY_FORMAT = "dd/MM/yyyy";
const STORE_FORMAT = "yyyy-MM-dd";

const PARSE_FORMATS = [
  "dd/MM/yyyy",
  "d/M/yyyy",
  "dd-MM-yyyy",
  "d-M-yyyy",
  "yyyy-MM-dd",
  "dd MMM yyyy",
  "d MMM yyyy",
];

function tryParse(raw: string): Date | null {
  const trimmed = raw.trim();
  for (const fmt of PARSE_FORMATS) {
    const d = parse(trimmed, fmt, new Date());
    if (isValid(d) && d.getFullYear() > 1900) return d;
  }
  return null;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "dd/mm/yyyy", className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(() => {
    if (!value) return "";
    const d = parseISO(value);
    return isValid(d) ? format(d, DISPLAY_FORMAT) : value;
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value ? parseISO(value) : undefined;
  const validSelected = selected && isValid(selected) ? selected : undefined;

  function commitText(raw: string) {
    if (!raw.trim()) {
      onChange("");
      return;
    }
    const d = tryParse(raw);
    if (d) {
      onChange(format(d, STORE_FORMAT));
      setInputText(format(d, DISPLAY_FORMAT));
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        placeholder={placeholder}
        onChange={(e) => setInputText(e.target.value)}
        onBlur={(e) => commitText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitText(inputText);
            e.currentTarget.blur();
          }
        }}
        className="h-8 w-28 rounded-l-md rounded-r-none border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-8 items-center rounded-l-none rounded-r-md border border-l-0 border-input bg-background px-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            aria-label="Open calendar"
          >
            <CalendarIcon className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={validSelected}
            onSelect={(date) => {
              if (date) {
                const formatted = format(date, DISPLAY_FORMAT);
                setInputText(formatted);
                onChange(format(date, STORE_FORMAT));
              }
              setOpen(false);
              inputRef.current?.focus();
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

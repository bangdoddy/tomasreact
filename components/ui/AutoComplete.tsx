
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from './input';

type Option = { id: string; label: string };

interface Props {
  options: Option[];
  onSelect?: (option: Option) => void;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
}

export default function AutoComplete({ options, onSelect, placeholder, value,disabled }: Props) {
  const [query, setQuery] = useState(value?value:"");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => o.label?.toLowerCase().includes(q)).slice(0, 5)
      : options.slice(0, 5);
  }, [options, query]);

  useEffect(() => {
    setActiveIndex(filtered.length ? 0 : -1);
  }, [filtered.length]);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const handleSelect = (opt: Option) => {
    setQuery(opt.label);
    setOpen(false);
    onSelect?.(opt);
    // Kembalikan fokus ke input
    //inputRef.current?.focus();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }; 
  return (
    <div
      className="autocomplete"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-owns="ac-listbox"
    >
      <Input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder ?? "Cari"}
        aria-autocomplete="list"
        aria-controls="ac-listbox"
      />

      {open && filtered.length > 0 && (
        <ul id="ac-listbox" role="listbox" className="dropdown">
          {filtered.map((opt, idx) => {
            const isActive = idx === activeIndex;
            return (
              <li
                key={opt.id}
                role="option"
                aria-selected={isActive}
                className={` option-item ${isActive ? "active" : ""}`}
                onMouseDown={(e) => e.preventDefault()} // cegah blur
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

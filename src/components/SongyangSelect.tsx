'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconCheck } from './icons/index.tsx';

export interface SelectOption<T = string | number | null> {
  value: T;
  label: string;
  badge?: string | number;
  group?: string;
  icon?: React.ReactNode;
}

interface SongyangSelectProps<T = string | number | null> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  icon?: React.ReactNode;
}

export function SongyangSelect<T = string | number | null>({
  value,
  onChange,
  options,
  placeholder = 'เลือกรายการ',
  ariaLabel,
  className = '',
  dropdownClassName = '',
  disabled = false,
  align = 'left',
  icon,
}: SongyangSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue: T) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const isSelectedActive = value !== null && value !== '' && value !== undefined;

  return (
    <div ref={containerRef} className="relative inline-block text-left w-full sm:w-auto">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel || placeholder}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full btn-tactile flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none outline-none focus:ring-2 focus:ring-sky-500/40 ${
          isSelectedActive
            ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-600/80 text-sky-800 dark:text-sky-200 shadow-xs'
            : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {icon && <span className="shrink-0 text-slate-400 dark:text-slate-500">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge !== undefined && (
            <span className="shrink-0 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-sky-200/80 dark:bg-sky-900 text-sky-900 dark:text-sky-100">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <IconChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-250 ease-out ${
            isOpen ? 'rotate-180 text-sky-500' : ''
          }`}
        />
      </button>

      {/* Floating Popover Options List */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel || placeholder}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 z-50 min-w-[200px] max-w-[340px] max-h-64 overflow-y-auto rounded-2xl bg-white/98 dark:bg-[#0c1222]/98 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] shadow-2xl p-1.5 space-y-0.5 custom-scroll animate-in fade-in-0 zoom-in-[0.97] slide-in-from-top-1.5 duration-180 ease-out ${dropdownClassName}`}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={idx}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all duration-140 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-200 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {opt.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <IconCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

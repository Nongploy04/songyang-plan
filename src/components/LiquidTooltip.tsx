'use client';

import React from 'react';

export interface LiquidTooltipProps {
  title: string;
  description?: string;
  badge?: string;
  placement?: 'bottom' | 'top';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * LiquidTooltip - Premium iOS Frosted Glass Hover Tooltip
 * Conforms to Songyang Workspace Rules:
 * - Rule 6: Zero System Emojis 100%
 * - Rule 7: Reduce Motion support
 * - Rule 8: Frosted Glass Deep-Blur 28px & Calibrated Anti-Bleed Opacity 95%
 */
export const LiquidTooltip = React.memo(function LiquidTooltip({
  title,
  description,
  badge,
  placement = 'bottom',
  align = 'left',
  children,
  className = '',
  disabled = false,
}: LiquidTooltipProps) {
  const isTop = placement === 'top';

  const alignClasses = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'left-0 right-auto translate-x-0',
    right: 'right-0 left-auto translate-x-0',
  }[align] || 'left-0 right-auto translate-x-0';

  const arrowAlignClasses = {
    center: 'mx-auto',
    left: 'ml-5 mr-auto',
    right: 'mr-5 ml-auto',
  }[align] || 'ml-5 mr-auto';

  return (
    <div className={`group/tooltip relative inline-flex ${className}`}>
      {children}

      {!disabled && (
        <div
          className={`pointer-events-none absolute z-[100] hidden sm:block w-max max-w-[420px] lg:max-w-[480px] opacity-0 transition-all duration-200 ease-out group-hover/tooltip:opacity-100 motion-reduce:transition-none motion-reduce:group-hover/tooltip:transform-none ${alignClasses} ${
            isTop
              ? 'bottom-full mb-2 group-hover/tooltip:-translate-y-1'
              : 'top-full mt-2 group-hover/tooltip:translate-y-1'
          }`}
          role="tooltip"
        >
          {!isTop && (
            <div
              className={`size-2.5 translate-y-1.5 rotate-45 border-l border-t border-black/[0.08] bg-white/95 dark:border-white/[0.12] dark:bg-[#0c1222]/95 ${arrowAlignClasses}`}
            />
          )}

          <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white/95 dark:border-white/[0.12] dark:bg-[#0c1222]/95 p-3.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_-10px_rgba(0,0,0,0.7)] [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] motion-reduce:[backdrop-filter:none] motion-reduce:bg-white motion-reduce:dark:bg-[#0c1222]">
            <div className="flex items-start justify-between gap-2.5 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
                {title}
              </span>
              {badge && (
                <span className="inline-flex shrink-0 items-center rounded-md bg-sky-500/10 dark:bg-sky-400/20 px-2 py-0.5 text-[10.5px] font-bold text-sky-700 dark:text-sky-300 border border-sky-500/20">
                  {badge}
                </span>
              )}
            </div>

            {description && (
              <p className="m-0 mt-2 text-left text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          {isTop && (
            <div
              className={`size-2.5 -translate-y-1.5 rotate-45 border-b border-r border-black/[0.08] bg-white/95 dark:border-white/[0.12] dark:bg-[#0c1222]/95 ${arrowAlignClasses}`}
            />
          )}
        </div>
      )}
    </div>
  );
});

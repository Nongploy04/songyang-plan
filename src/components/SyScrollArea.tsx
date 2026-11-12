'use client';

import {
  createElement,
  useEffect,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';

export interface ScrollPalette {
  thumb: string;
  thumbActive: string;
  groove: string;
  grooveBorder: string;
}

export interface SyGlobalScrollRailProps {
  lightPalette?: ScrollPalette;
  darkPalette?: ScrollPalette;
  autoHideDelay?: number;
}

export interface SyScrollAreaProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  as?: ElementType;
  viewportRef?: RefObject<HTMLDivElement | null>;
}

interface AxisMetrics {
  railStart: number;
  railLen: number;
  thumbLen: number;
  maxThumbPos: number;
  maxScroll: number;
}

interface AxisState {
  el: Element | null;
  visible: boolean;
  active: boolean;
  timerId: number;
  startClient: number;
  startScroll: number;
  metrics: AxisMetrics | null;
}

const DEFAULT_LIGHT_PALETTE: ScrollPalette = {
  thumb: 'rgba(51, 65, 85, 0.34)',
  thumbActive: 'rgba(30, 41, 59, 0.56)',
  groove: 'transparent',
  grooveBorder: 'transparent',
};

const DEFAULT_DARK_PALETTE: ScrollPalette = {
  thumb: 'rgba(255, 255, 255, 0.22)',
  thumbActive: 'rgba(255, 255, 255, 0.38)',
  groove: 'transparent',
  grooveBorder: 'transparent',
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function parseColorRgba(color: string): [number, number, number, number] | null {
  if (!color || color === 'transparent') return null;
  const rgbMatch = color.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+%?))?\s*\)$/i,
  );
  if (rgbMatch) {
    const rawA = rgbMatch[4];
    const a = rawA ? (rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA)) : 1;
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]), a];
  }
  const oklchMatch = color.match(
    /^oklch\(\s*([\d.]+%?)\s+[\d.]+\s+(?:[\d.]+|none)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (oklchMatch) {
    const rawL = oklchMatch[1];
    const l = rawL.endsWith('%') ? parseFloat(rawL) / 100 : parseFloat(rawL);
    const lum = Math.max(0, Math.min(255, l * 255));
    const rawA = oklchMatch[2];
    const a = rawA ? (rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA)) : 1;
    return [lum, lum, lum, a];
  }
  const oklabMatch = color.match(
    /^oklab\(\s*([\d.]+%?)\s+[-+\d.]+\s+[-+\d.]+(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (oklabMatch) {
    const rawL = oklabMatch[1];
    const l = rawL.endsWith('%') ? parseFloat(rawL) / 100 : parseFloat(rawL);
    const lum = Math.max(0, Math.min(255, l * 255));
    const rawA = oklabMatch[2];
    const a = rawA ? (rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA)) : 1;
    return [lum, lum, lum, a];
  }
  const srgbMatch = color.match(
    /^color\(\s*(?:srgb|display-p3|srgb-linear)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (srgbMatch) {
    const rawA = srgbMatch[4];
    const a = rawA ? (rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA)) : 1;
    return [Number(srgbMatch[1]) * 255, Number(srgbMatch[2]) * 255, Number(srgbMatch[3]) * 255, a];
  }
  return null;
}

function isDarkSurface(el: Element | null): boolean {
  if (typeof window === 'undefined' || !el) return false;
  const docEl = document.scrollingElement || document.documentElement;
  let cur: Element | null = el === docEl ? document.body : el;
  while (cur && cur.nodeType === 1) {
    const bg = getComputedStyle(cur).backgroundColor;
    const rgba = parseColorRgba(bg);
    if (rgba && rgba[3] >= 0.35) {
      const lum = 0.299 * rgba[0] + 0.587 * rgba[1] + 0.114 * rgba[2];
      return lum < 128;
    }
    if (cur === document.documentElement) break;
    cur = cur.parentElement;
  }
  const html = document.documentElement;
  const body = document.body;
  return (
    html.getAttribute('data-theme') === 'dark' ||
    html.classList.contains('dark') ||
    html.classList.contains('dark-theme') ||
    Boolean(
      body &&
        (body.classList.contains('dark-theme') ||
          body.classList.contains('dark-mode') ||
          body.classList.contains('dark')),
    )
  );
}

function readScrollPalette(
  el: Element,
  defaultLight: ScrollPalette,
  defaultDark: ScrollPalette,
): ScrollPalette {
  const dark = isDarkSurface(el);
  const fb = dark ? defaultDark : defaultLight;
  if (typeof window === 'undefined') return fb;
  const cs = getComputedStyle(document.documentElement);
  const suffix = dark ? 'dark' : 'light';
  return {
    thumb: cs.getPropertyValue(`--sy-scroll-thumb-${suffix}`).trim() || fb.thumb,
    thumbActive: cs.getPropertyValue(`--sy-scroll-thumb-active-${suffix}`).trim() || fb.thumbActive,
    groove: cs.getPropertyValue(`--sy-scroll-groove-${suffix}`).trim() || fb.groove,
    grooveBorder: cs.getPropertyValue(`--sy-scroll-groove-border-${suffix}`).trim() || fb.grooveBorder,
  };
}

function isSkippedElement(el: Element | null): boolean {
  if (!el || !el.isConnected || el.nodeType !== 1) return true;
  if (el.hasAttribute('data-sy-local-rail')) return true;
  if (el.tagName === 'INPUT' || el.tagName === 'SELECT') return true;
  if (el.closest('[data-sy-global-rail]')) return true;
  if (el.hasAttribute('data-radix-scroll-area-viewport')) return true;
  if (el.classList.contains('leaflet-container') || el.classList.contains('leaflet-pane')) return true;
  return false;
}

function isElementRenderedVisible(el: Element): boolean {
  if (!el.isConnected) return false;
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return false;
  if (parseFloat(cs.opacity) < 0.05) return false;
  return true;
}

function canScrollY(el: Element | null): boolean {
  if (!el || isSkippedElement(el)) return false;
  const docEl = document.scrollingElement || document.documentElement;
  if (el === docEl || el === document.documentElement) {
    const htmlStyle = getComputedStyle(document.documentElement);
    const bodyStyle = document.body ? getComputedStyle(document.body) : null;
    if (htmlStyle.overflowY === 'hidden' || bodyStyle?.overflowY === 'hidden') return false;
    return docEl.scrollHeight > window.innerHeight + 4;
  }
  if (el === document.body) {
    const cs = getComputedStyle(el);
    if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll' && cs.overflowY !== 'overlay') return false;
    return el.scrollHeight > el.clientHeight + 4;
  }
  if (!isElementRenderedVisible(el)) return false;
  const cs = getComputedStyle(el);
  if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll' && cs.overflowY !== 'overlay') return false;
  return el.clientHeight >= 36 && el.clientWidth >= 32 && el.scrollHeight > el.clientHeight + 4;
}

function canScrollX(el: Element | null): boolean {
  if (!el || isSkippedElement(el) || el.tagName === 'TEXTAREA') return false;
  const docEl = document.scrollingElement || document.documentElement;
  if (el === docEl || el === document.documentElement || el === document.body) return false;
  const cls = typeof el.className === 'string' ? el.className : '';
  if (/(\bscrollbar-none\b|\[scrollbar-width:none\]|\[&::-webkit-scrollbar\]:hidden)/.test(cls)) return false;
  if (!isElementRenderedVisible(el)) return false;
  const cs = getComputedStyle(el);
  if (cs.overflowX !== 'auto' && cs.overflowX !== 'scroll' && cs.overflowX !== 'overlay') return false;
  return el.clientWidth >= 48 && el.clientHeight >= 24 && el.scrollWidth > el.clientWidth + 4;
}

function getContainerRect(el: Element, docEl: Element) {
  if (el === docEl) {
    return {
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  return el.getBoundingClientRect();
}

function getScrollOffset(el: Element, axis: 'x' | 'y', docEl: Element): number {
  if (el === docEl) {
    return axis === 'y' ? (window.scrollY ?? docEl.scrollTop ?? 0) : (window.scrollX ?? docEl.scrollLeft ?? 0);
  }
  return axis === 'y' ? el.scrollTop : el.scrollLeft;
}

function setScrollInstant(el: Element, axis: 'x' | 'y', value: number, docEl: Element) {
  try {
    if (el === docEl) {
      if (axis === 'y') window.scrollTo({ top: value, behavior: 'instant' });
      else window.scrollTo({ left: value, behavior: 'instant' });
      return;
    }
    if (axis === 'y') el.scrollTo({ top: value, behavior: 'instant' });
    else el.scrollTo({ left: value, behavior: 'instant' });
  } catch {
    if (axis === 'y') el.scrollTop = value;
    else el.scrollLeft = value;
  }
}

function computeCornerInsets(el: Element, r: ReturnType<typeof getContainerRect>, docEl: Element, hasBoth: boolean) {
  if (el === docEl) {
    return { top: 6, bottom: hasBoth ? 18 : 6, left: 6, right: hasBoth ? 18 : 6 };
  }
  const cs = getComputedStyle(el);
  let rTR = parseFloat(cs.borderTopRightRadius) || 0;
  let rBR = parseFloat(cs.borderBottomRightRadius) || 0;
  let rBL = parseFloat(cs.borderBottomLeftRadius) || 0;
  const parent = el.parentElement;
  if (parent) {
    const pr = parent.getBoundingClientRect();
    const pcs = getComputedStyle(parent);
    if (Math.abs(r.right - pr.right) <= 3 && Math.abs(r.top - pr.top) <= 3) {
      rTR = Math.max(rTR, parseFloat(pcs.borderTopRightRadius) || 0);
    }
    if (Math.abs(r.right - pr.right) <= 3 && Math.abs(r.bottom - pr.bottom) <= 3) {
      rBR = Math.max(rBR, parseFloat(pcs.borderBottomRightRadius) || 0);
    }
    if (Math.abs(r.left - pr.left) <= 3 && Math.abs(r.bottom - pr.bottom) <= 3) {
      rBL = Math.max(rBL, parseFloat(pcs.borderBottomLeftRadius) || 0);
    }
  }
  return {
    top: Math.max(4, Math.min(20, Math.round(rTR * 0.45))),
    bottom: Math.max(hasBoth ? 16 : 4, Math.min(22, Math.round(rBR * 0.45))),
    left: Math.max(4, Math.min(20, Math.round(rBL * 0.45))),
    right: Math.max(hasBoth ? 16 : 4, Math.min(22, Math.round(rBR * 0.45))),
  };
}

function isFullscreenScrim(node: Element): boolean {
  if (node === document.body || node === document.documentElement) return false;
  const cs = getComputedStyle(node);
  if (cs.position !== 'fixed') return false;
  if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') return false;
  const r = node.getBoundingClientRect();
  return r.width >= window.innerWidth * 0.9 && r.height >= window.innerHeight * 0.9;
}

/**
 * SyGlobalScrollRail: Viewport-level LINE PC Overlay Scrollbar Manager.
 */
export function SyGlobalScrollRail({
  lightPalette = DEFAULT_LIGHT_PALETTE,
  darkPalette = DEFAULT_DARK_PALETTE,
  autoHideDelay = 2600,
}: SyGlobalScrollRailProps) {
  const wrapperYRef = useRef<HTMLDivElement | null>(null);
  const grooveYRef = useRef<HTMLDivElement | null>(null);
  const thumbYRef = useRef<HTMLDivElement | null>(null);
  const wrapperXRef = useRef<HTMLDivElement | null>(null);
  const grooveXRef = useRef<HTMLDivElement | null>(null);
  const thumbXRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-sy-scroll', 'ready');

    const axisState: Record<'y' | 'x', AxisState> = {
      y: { el: null, visible: false, active: false, timerId: 0, startClient: 0, startScroll: 0, metrics: null },
      x: { el: null, visible: false, active: false, timerId: 0, startClient: 0, startScroll: 0, metrics: null },
    };
    let dragAxis: 'y' | 'x' | null = null;
    let rafMoveId = 0;
    let lastClientX = -1;
    let lastClientY = -1;
    const lastYPos = new WeakMap<Element, number>();
    const lastXPos = new WeakMap<Element, number>();
    let resizeObs: ResizeObserver | null = null;

    const parkTimers: Record<'y' | 'x', number> = { y: 0, x: 0 };
    const hoverIntentTimers: Record<'y' | 'x', number> = { y: 0, x: 0 };

    const parkRail = (axis: 'y' | 'x') => {
      const wrap = axis === 'y' ? wrapperYRef.current : wrapperXRef.current;
      const groove = axis === 'y' ? grooveYRef.current : grooveXRef.current;
      const thumb = axis === 'y' ? thumbYRef.current : thumbXRef.current;
      if (!wrap || !groove || !thumb) return;
      const reduce = prefersReducedMotion();
      window.clearTimeout(parkTimers[axis]);
      wrap.style.transition = reduce ? 'none' : 'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)';
      wrap.style.opacity = '0';
      wrap.style.pointerEvents = 'none';
      groove.style.opacity = '0';
      if (axis === 'y') thumb.style.width = '5px';
      else thumb.style.height = '5px';
      thumb.style.opacity = '0';
      if (reduce) {
        wrap.style.width = '0px';
        wrap.style.height = '0px';
        wrap.style.top = '0px';
        wrap.style.left = '0px';
      } else {
        parkTimers[axis] = window.setTimeout(() => {
          if (!axisState[axis].visible) {
            wrap.style.width = '0px';
            wrap.style.height = '0px';
            wrap.style.top = '0px';
            wrap.style.left = '0px';
          }
        }, 440);
      }
    };

    const hideAxis = (axis: 'y' | 'x') => {
      const st = axisState[axis];
      window.clearTimeout(st.timerId);
      st.visible = false;
      st.active = false;
      st.el = null;
      st.metrics = null;
      parkRail(axis);
    };

    const paintAxis = (axis: 'y' | 'x') => {
      const st = axisState[axis];
      const el = st.el;
      const wrap = axis === 'y' ? wrapperYRef.current : wrapperXRef.current;
      const groove = axis === 'y' ? grooveYRef.current : grooveXRef.current;
      const thumb = axis === 'y' ? thumbYRef.current : thumbXRef.current;
      if (!wrap || !groove || !thumb || !el || !st.visible) {
        parkRail(axis);
        return;
      }

      const docEl = document.scrollingElement || document.documentElement;
      const isOk = axis === 'y' ? canScrollY(el) : canScrollX(el);
      if (!isOk) {
        hideAxis(axis);
        return;
      }

      const rect = getContainerRect(el, docEl);
      const visH = Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top);
      const visW = Math.min(window.innerWidth, rect.right) - Math.max(0, rect.left);
      if (visH < 24 || visW < 24) {
        hideAxis(axis);
        return;
      }

      const hasBoth = axis === 'y' ? canScrollX(el) : canScrollY(el);
      const insets = computeCornerInsets(el, rect, docEl, hasBoth);
      const reduce = prefersReducedMotion();
      const palette = readScrollPalette(el, lightPalette, darkPalette);

      if (axis === 'y') {
        const topEdge = Math.max(2, rect.top) + insets.top;
        const bottomEdge = Math.min(window.innerHeight - 2, rect.bottom) - insets.bottom;
        const railLen = Math.max(24, bottomEdge - topEdge);
        const clientLen = el === docEl ? window.innerHeight : el.clientHeight;
        const totalLen = el.scrollHeight;
        const maxScroll = Math.max(1, totalLen - clientLen);
        const thumbLen = Math.max(36, Math.min(railLen, (clientLen / totalLen) * railLen));
        const maxThumbPos = Math.max(0, railLen - thumbLen);
        const scrollPos = getScrollOffset(el, 'y', docEl);
        const thumbPos = Math.max(0, Math.min(maxThumbPos, (scrollPos / maxScroll) * maxThumbPos));

        st.metrics = { railStart: topEdge, railLen, thumbLen, maxThumbPos, maxScroll };

        window.clearTimeout(parkTimers.y);
        const wasHidden = wrap.style.opacity === '0' || thumb.style.opacity === '0';
        wrap.style.transition = reduce ? 'none' : 'opacity 180ms cubic-bezier(0.22, 1, 0.36, 1)';
        wrap.style.top = `${topEdge}px`;
        wrap.style.left = `${Math.max(0, rect.right - 14)}px`;
        wrap.style.width = '14px';
        wrap.style.height = `${railLen}px`;
        wrap.style.opacity = '1';
        wrap.style.pointerEvents = st.active ? 'auto' : 'none';

        groove.style.transition = 'none';
        groove.style.top = '0px';
        groove.style.bottom = '0px';
        groove.style.right = '3px';
        groove.style.left = 'auto';
        groove.style.width = '10px';
        groove.style.height = 'auto';
        groove.style.backgroundColor = 'transparent';
        groove.style.border = 'none';
        groove.style.boxShadow = 'none';
        groove.style.opacity = '0';

        if (!reduce && st.active && wasHidden) {
          thumb.style.transition = 'none';
          thumb.style.top = `${thumbPos}px`;
          thumb.style.height = `${thumbLen}px`;
          thumb.style.width = '5px';
          thumb.style.right = '3px';
          thumb.style.backgroundColor = palette.thumb;
          thumb.style.opacity = '1';
          void thumb.offsetWidth;
        }

        thumb.style.transition = reduce
          ? 'none'
          : 'width 220ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease';
        thumb.style.top = `${thumbPos}px`;
        thumb.style.height = `${thumbLen}px`;
        thumb.style.width = st.active ? '10px' : '5px';
        thumb.style.right = '3px';
        thumb.style.left = 'auto';
        thumb.style.bottom = 'auto';
        thumb.style.backgroundColor = st.active ? palette.thumbActive : palette.thumb;
        thumb.style.boxShadow = 'none';
        thumb.style.opacity = '1';
      } else {
        const leftEdge = Math.max(2, rect.left) + insets.left;
        const rightEdge = Math.min(window.innerWidth - 2, rect.right) - insets.right;
        const railLen = Math.max(24, rightEdge - leftEdge);
        const clientLen = el.clientWidth;
        const totalLen = el.scrollWidth;
        const maxScroll = Math.max(1, totalLen - clientLen);
        const thumbLen = Math.max(36, Math.min(railLen, (clientLen / totalLen) * railLen));
        const maxThumbPos = Math.max(0, railLen - thumbLen);
        const scrollPos = getScrollOffset(el, 'x', docEl);
        const thumbPos = Math.max(0, Math.min(maxThumbPos, (scrollPos / maxScroll) * maxThumbPos));

        st.metrics = { railStart: leftEdge, railLen, thumbLen, maxThumbPos, maxScroll };

        window.clearTimeout(parkTimers.x);
        const wasHidden = wrap.style.opacity === '0' || thumb.style.opacity === '0';
        wrap.style.transition = reduce ? 'none' : 'opacity 180ms cubic-bezier(0.22, 1, 0.36, 1)';
        wrap.style.left = `${leftEdge}px`;
        wrap.style.top = `${Math.max(0, rect.bottom - 14)}px`;
        wrap.style.height = '14px';
        wrap.style.width = `${railLen}px`;
        wrap.style.opacity = '1';
        wrap.style.pointerEvents = st.active ? 'auto' : 'none';

        groove.style.transition = 'none';
        groove.style.left = '0px';
        groove.style.right = '0px';
        groove.style.bottom = '3px';
        groove.style.top = 'auto';
        groove.style.height = '10px';
        groove.style.width = 'auto';
        groove.style.backgroundColor = 'transparent';
        groove.style.border = 'none';
        groove.style.boxShadow = 'none';
        groove.style.opacity = '0';

        if (!reduce && st.active && wasHidden) {
          thumb.style.transition = 'none';
          thumb.style.left = `${thumbPos}px`;
          thumb.style.width = `${thumbLen}px`;
          thumb.style.height = '5px';
          thumb.style.bottom = '3px';
          thumb.style.backgroundColor = palette.thumb;
          thumb.style.opacity = '1';
          void thumb.offsetHeight;
        }

        thumb.style.transition = reduce
          ? 'none'
          : 'height 220ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease';
        thumb.style.left = `${thumbPos}px`;
        thumb.style.width = `${thumbLen}px`;
        thumb.style.height = st.active ? '10px' : '5px';
        thumb.style.bottom = '3px';
        thumb.style.top = 'auto';
        thumb.style.right = 'auto';
        thumb.style.backgroundColor = st.active ? palette.thumbActive : palette.thumb;
        thumb.style.boxShadow = 'none';
        thumb.style.opacity = '1';
      }
    };

    const scheduleHide = (axis: 'y' | 'x', customDelay?: number) => {
      const st = axisState[axis];
      window.clearTimeout(st.timerId);
      st.timerId = window.setTimeout(() => {
        if (!st.active && dragAxis !== axis) {
          hideAxis(axis);
        }
      }, customDelay ?? autoHideDelay);
    };

    const bindResizeTarget = () => {
      if (resizeObs) resizeObs.disconnect();
      if (typeof ResizeObserver === 'undefined' || !resizeObs) return;
      if (axisState.y.el && axisState.y.el !== document.scrollingElement) {
        resizeObs.observe(axisState.y.el);
      }
      if (axisState.x.el && axisState.x.el !== axisState.y.el) {
        resizeObs.observe(axisState.x.el);
      }
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(() => {
        if (axisState.y.visible) paintAxis('y');
        if (axisState.x.visible) paintAxis('x');
      });
    }

    const onScrollCapture = (e: Event) => {
      const docEl = document.scrollingElement || document.documentElement;
      const raw = e.target;
      if (!raw) return;
      const target: Element | null =
        raw === window || raw === document || raw === document.documentElement || raw === docEl
          ? docEl
          : raw instanceof Element
            ? raw
            : null;
      if (!target) return;

      const curY = getScrollOffset(target, 'y', docEl);
      const curX = getScrollOffset(target, 'x', docEl);
      const prevY = lastYPos.get(target) ?? 0;
      const prevX = lastXPos.get(target) ?? 0;
      const movedY = Math.abs(curY - prevY) > 0.5;
      const movedX = Math.abs(curX - prevX) > 0.5;
      lastYPos.set(target, curY);
      lastXPos.set(target, curX);

      if (movedY && canScrollY(target)) {
        const st = axisState.y;
        const hoveringSame = st.active && st.el === target;
        st.el = target;
        st.visible = true;
        st.active = hoveringSame || dragAxis === 'y';
        paintAxis('y');
        bindResizeTarget();
        if (!st.active) scheduleHide('y');
      }

      if (movedX && canScrollX(target)) {
        const st = axisState.x;
        const hoveringSame = st.active && st.el === target;
        st.el = target;
        st.visible = true;
        st.active = hoveringSame || dragAxis === 'x';
        paintAxis('x');
        bindResizeTarget();
        if (!st.active) scheduleHide('x');
      }
    };

    const hitTestEdge = (mx: number, my: number) => {
      if (dragAxis) return;
      const docEl = document.scrollingElement || document.documentElement;
      const stack = document.elementsFromPoint(mx, my);
      const topEl = stack[0];

      if (topEl && !topEl.closest('[data-sy-global-rail]')) {
        if (topEl.closest('button, a, input, select, [role="button"], [role="slider"], .leaflet-control')) {
          if (axisState.y.active) hideAxis('y');
          if (axisState.x.active) hideAxis('x');
          return;
        }
        if (topEl.tagName === 'TEXTAREA') {
          const tr = topEl.getBoundingClientRect();
          if (mx >= tr.right - 18 && my >= tr.bottom - 18) {
            if (axisState.y.active) hideAxis('y');
            return;
          }
        }
      }

      let foundY: Element | null = null;
      let foundX: Element | null = null;

      if (axisState.y.active && axisState.y.el && canScrollY(axisState.y.el)) {
        const r = getContainerRect(axisState.y.el, docEl);
        if (
          mx >= r.right - 14 &&
          mx <= r.right + 2 &&
          my >= Math.max(0, r.top) + 2 &&
          my <= Math.min(window.innerHeight, r.bottom) - 2
        ) {
          foundY = axisState.y.el;
        }
      }
      if (axisState.x.active && axisState.x.el && canScrollX(axisState.x.el)) {
        const r = getContainerRect(axisState.x.el, docEl);
        if (
          my >= r.bottom - 14 &&
          my <= r.bottom + 2 &&
          mx >= Math.max(0, r.left) + 2 &&
          mx <= Math.min(window.innerWidth, r.right) - 2
        ) {
          foundX = axisState.x.el;
        }
      }

      if (!foundY || !foundX) {
        for (const node of stack) {
          if (node.closest('[data-sy-global-rail]')) continue;
          if (!foundY && canScrollY(node)) {
            const r = getContainerRect(node, docEl);
            if (
              mx >= r.right - 14 &&
              mx <= r.right + 2 &&
              my >= Math.max(0, r.top) + 4 &&
              my <= Math.min(window.innerHeight, r.bottom) - 4
            ) {
              foundY = node;
            }
          }
          if (!foundX && canScrollX(node)) {
            const r = getContainerRect(node, docEl);
            if (
              my >= r.bottom - 14 &&
              my <= r.bottom + 2 &&
              mx >= Math.max(0, r.left) + 4 &&
              mx <= Math.min(window.innerWidth, r.right) - 4
            ) {
              foundX = node;
            }
          }
          if (foundY && foundX) break;
          if (isFullscreenScrim(node)) break;
        }
      }

      if (foundY) {
        const st = axisState.y;
        window.clearTimeout(st.timerId);
        if (st.visible && st.el === foundY) {
          window.clearTimeout(hoverIntentTimers.y);
          st.active = true;
          paintAxis('y');
          bindResizeTarget();
        } else {
          window.clearTimeout(hoverIntentTimers.y);
          hoverIntentTimers.y = window.setTimeout(() => {
            st.el = foundY;
            st.visible = true;
            st.active = true;
            paintAxis('y');
            bindResizeTarget();
          }, 75);
        }
      } else {
        window.clearTimeout(hoverIntentTimers.y);
        if (axisState.y.active) {
          axisState.y.active = false;
          paintAxis('y');
          scheduleHide('y', 1200);
        }
      }

      if (foundX) {
        const st = axisState.x;
        window.clearTimeout(st.timerId);
        if (st.visible && st.el === foundX) {
          window.clearTimeout(hoverIntentTimers.x);
          st.active = true;
          paintAxis('x');
          bindResizeTarget();
        } else {
          window.clearTimeout(hoverIntentTimers.x);
          hoverIntentTimers.x = window.setTimeout(() => {
            st.el = foundX;
            st.visible = true;
            st.active = true;
            paintAxis('x');
            bindResizeTarget();
          }, 75);
        }
      } else {
        window.clearTimeout(hoverIntentTimers.x);
        if (axisState.x.active) {
          axisState.x.active = false;
          paintAxis('x');
          scheduleHide('x', 1200);
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (dragAxis) {
        const docEl = document.scrollingElement || document.documentElement;
        const st = axisState[dragAxis];
        if (!st.el || !st.metrics) return;
        const { maxThumbPos, maxScroll } = st.metrics;
        if (maxThumbPos <= 0) return;
        const delta = (dragAxis === 'y' ? e.clientY : e.clientX) - st.startClient;
        const nextScroll = Math.max(0, Math.min(maxScroll, st.startScroll + (delta / maxThumbPos) * maxScroll));
        setScrollInstant(st.el, dragAxis, nextScroll, docEl);
        if (dragAxis === 'y') lastYPos.set(st.el, nextScroll);
        else lastXPos.set(st.el, nextScroll);
        paintAxis(dragAxis);
        return;
      }

      lastClientX = e.clientX;
      lastClientY = e.clientY;
      if (rafMoveId) return;
      rafMoveId = requestAnimationFrame(() => {
        rafMoveId = 0;
        if (lastClientX >= 0 && lastClientY >= 0) {
          hitTestEdge(lastClientX, lastClientY);
        }
      });
    };

    const onMouseUp = () => {
      if (!dragAxis) return;
      const finishedAxis = dragAxis;
      dragAxis = null;
      document.body.style.userSelect = '';
      if (lastClientX >= 0 && lastClientY >= 0) {
        hitTestEdge(lastClientX, lastClientY);
      } else {
        hideAxis(finishedAxis);
      }
    };

    const startMouseDown = (axis: 'y' | 'x') => (e: MouseEvent) => {
      if (e.button !== 0) return;
      const st = axisState[axis];
      const thumb = axis === 'y' ? thumbYRef.current : thumbXRef.current;
      const docEl = document.scrollingElement || document.documentElement;
      if (!st.el || !st.metrics) return;

      if (e.target === thumb) {
        dragAxis = axis;
        st.startClient = axis === 'y' ? e.clientY : e.clientX;
        st.startScroll = getScrollOffset(st.el, axis, docEl);
        document.body.style.userSelect = 'none';
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const { railStart, thumbLen, maxThumbPos, maxScroll } = st.metrics;
      if (maxThumbPos <= 0) return;
      const clickPos = (axis === 'y' ? e.clientY : e.clientX) - railStart - thumbLen / 2;
      const ratio = Math.max(0, Math.min(1, clickPos / maxThumbPos));
      const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
      const dest = ratio * maxScroll;
      if (st.el === docEl) {
        if (axis === 'y') window.scrollTo({ top: dest, behavior });
        else window.scrollTo({ left: dest, behavior });
      } else {
        if (axis === 'y') st.el.scrollTo({ top: dest, behavior });
        else st.el.scrollTo({ left: dest, behavior });
      }
      e.preventDefault();
      e.stopPropagation();
    };

    const onWindowResize = () => {
      if (axisState.y.visible) paintAxis('y');
      if (axisState.x.visible) paintAxis('x');
    };

    const onDocMouseLeave = () => {
      lastClientX = -1;
      lastClientY = -1;
      if (!dragAxis) {
        if (axisState.y.active) hideAxis('y');
        if (axisState.x.active) hideAxis('x');
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        requestAnimationFrame(() => {
          if (axisState.y.visible && (!axisState.y.el || !canScrollY(axisState.y.el))) hideAxis('y');
          if (axisState.x.visible && (!axisState.x.el || !canScrollX(axisState.x.el))) hideAxis('x');
        });
      }
    };

    const wrapY = wrapperYRef.current;
    const wrapX = wrapperXRef.current;
    const onDownY = startMouseDown('y');
    const onDownX = startMouseDown('x');

    document.addEventListener('scroll', onScrollCapture, { capture: true, passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
    window.addEventListener('resize', onWindowResize, { passive: true });
    document.addEventListener('mouseleave', onDocMouseLeave);
    window.addEventListener('keydown', onKeyDown);
    if (wrapY) wrapY.addEventListener('mousedown', onDownY);
    if (wrapX) wrapX.addEventListener('mousedown', onDownX);

    return () => {
      document.removeEventListener('scroll', onScrollCapture, { capture: true });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mouseleave', onDocMouseLeave);
      window.removeEventListener('keydown', onKeyDown);
      if (wrapY) wrapY.removeEventListener('mousedown', onDownY);
      if (wrapX) wrapX.removeEventListener('mousedown', onDownX);
      if (rafMoveId) cancelAnimationFrame(rafMoveId);
      if (resizeObs) resizeObs.disconnect();
      window.clearTimeout(axisState.y.timerId);
      window.clearTimeout(axisState.x.timerId);
      window.clearTimeout(parkTimers.y);
      window.clearTimeout(parkTimers.x);
      window.clearTimeout(hoverIntentTimers.y);
      window.clearTimeout(hoverIntentTimers.x);
      document.body.style.userSelect = '';
      html.removeAttribute('data-sy-scroll');
    };
  }, [lightPalette, darkPalette, autoHideDelay]);

  return (
    <>
      <div
        ref={wrapperYRef}
        data-sy-global-rail="y"
        aria-hidden="true"
        className="print:hidden cursor-pointer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 99999,
        }}
      >
        <div
          ref={grooveYRef}
          aria-hidden="true"
          style={{ position: 'absolute', borderRadius: 9999, pointerEvents: 'none', opacity: 0 }}
        />
        <div
          ref={thumbYRef}
          aria-hidden="true"
          style={{ position: 'absolute', borderRadius: 9999, pointerEvents: 'auto', opacity: 0, cursor: 'pointer' }}
        />
      </div>
      <div
        ref={wrapperXRef}
        data-sy-global-rail="x"
        aria-hidden="true"
        className="print:hidden cursor-pointer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 99999,
        }}
      >
        <div
          ref={grooveXRef}
          aria-hidden="true"
          style={{ position: 'absolute', borderRadius: 9999, pointerEvents: 'none', opacity: 0 }}
        />
        <div
          ref={thumbXRef}
          aria-hidden="true"
          style={{ position: 'absolute', borderRadius: 9999, pointerEvents: 'auto', opacity: 0, cursor: 'pointer' }}
        />
      </div>
    </>
  );
}

export function SyScrollRail() {
  return null;
}

export function SyScrollArea({
  children,
  className = '',
  contentClassName = '',
  as = 'div',
  viewportRef,
  ...rest
}: SyScrollAreaProps) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = viewportRef || localRef;

  return createElement(
    as,
    {
      className: `relative overflow-hidden ${className}`,
      ...rest,
    },
    <div
      ref={scrollRef}
      className="h-full w-full overflow-y-auto [-webkit-overflow-scrolling:touch]"
    >
      <div className={contentClassName}>{children}</div>
    </div>,
  );
}

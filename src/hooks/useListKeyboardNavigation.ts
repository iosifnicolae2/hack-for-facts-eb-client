import { useCallback, useState } from "react";

interface UseListKeyboardNavigationOptions {
  loop?: boolean;
}

export function useListKeyboardNavigation(options: UseListKeyboardNavigationOptions = {}) {
  const { loop = false } = options;
  const [activeDescendant, setActiveDescendant] = useState<string | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const setActiveByIndex = useCallback((container: HTMLDivElement, index: number) => {
    const optionNodes = container.querySelectorAll<HTMLElement>('[data-list-option]');
    if (!optionNodes || optionNodes.length === 0) return;
    const maxIdx = optionNodes.length - 1;
    let targetIndex = Math.max(0, Math.min(index, maxIdx));
    if (loop) {
      if (index > maxIdx) targetIndex = 0;
      if (index < 0) targetIndex = maxIdx;
    }
    const el = optionNodes[targetIndex] as HTMLElement | undefined;
    if (!el) return;
    optionNodes.forEach(n => n.removeAttribute('data-active'));
    el.setAttribute('data-active', 'true');
    setActiveIndex(targetIndex);
    setActiveDescendant(el.id || undefined);
    el.scrollIntoView({ block: 'nearest' });
  }, [loop]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback((e) => {
    const container = e.currentTarget as HTMLDivElement;
    const optionNodes = container.querySelectorAll<HTMLElement>('[data-list-option]');
    if (!optionNodes || optionNodes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveByIndex(container, (activeIndex === -1 ? 0 : activeIndex + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveByIndex(container, activeIndex === -1 ? optionNodes.length - 1 : activeIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        setActiveByIndex(container, 0);
        break;
      case 'End':
        e.preventDefault();
        setActiveByIndex(container, optionNodes.length - 1);
        break;
      case ' ': // Space
      case 'Enter':
        e.preventDefault();
        {
          const idx = activeIndex === -1 ? 0 : activeIndex;
          const el = optionNodes[idx];
          if (el) {
            setActiveByIndex(container, idx);
            (el as HTMLElement).click();
          }
        }
        break;
    }
  }, [activeIndex, setActiveByIndex]);

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    const container = e.currentTarget as HTMLDivElement;
    if (container !== document.activeElement) {
      container.focus();
    }
    const optionNodes = container.querySelectorAll<HTMLElement>('[data-list-option]');
    const target = (e.target as HTMLElement)?.closest('[data-list-option]') as HTMLElement | null;
    if (target && optionNodes.length) {
      const idx = Array.prototype.indexOf.call(optionNodes, target);
      if (idx >= 0) {
        optionNodes.forEach(n => n.removeAttribute('data-active'));
        target.setAttribute('data-active', 'true');
        setActiveIndex(idx);
        setActiveDescendant(target.id || undefined);
      }
    }
  }, []);

  return {
    activeDescendant,
    handleKeyDown,
    handleMouseDown,
  };
}


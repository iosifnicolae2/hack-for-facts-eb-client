import { ResponsiveContainer, type ResponsiveContainerProps } from 'recharts';
import { useEffect, useMemo, useRef, useState } from 'react';

type ContainerSize = {
  width: number;
  height: number;
};

const getNumericSize = (value?: number | string) => (typeof value === 'number' ? value : undefined);

const getMinThreshold = (value?: number) => Math.max(value ?? 0, 1);

export function SafeResponsiveContainer({
  width = '100%',
  height = '100%',
  minWidth,
  minHeight,
  maxHeight,
  className,
  style,
  id,
  children,
  initialDimension: _initialDimension,
  ...responsiveProps
}: ResponsiveContainerProps) {
  const minWidthValue = getNumericSize(minWidth);
  const minHeightValue = getNumericSize(minHeight);
  const minWidthThreshold = getMinThreshold(minWidthValue);
  const minHeightThreshold = getMinThreshold(minHeightValue);

  const [containerSize, setContainerSize] = useState<ContainerSize | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    if (typeof ResizeObserver === 'undefined') {
      return { width: minWidthThreshold, height: minHeightThreshold };
    }
    return null;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    const updateSize = (nextWidth: number, nextHeight: number) => {
      const roundedWidth = Math.round(nextWidth);
      const roundedHeight = Math.round(nextHeight);
      setContainerSize((prev) => {
        if (prev?.width === roundedWidth && prev?.height === roundedHeight) {
          return prev;
        }
        return { width: roundedWidth, height: roundedHeight };
      });
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateSize(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(node);
    const rect = node.getBoundingClientRect();
    updateSize(rect.width, rect.height);

    return () => observer.disconnect();
  }, []);

  const shouldRender =
    !!containerSize &&
    containerSize.width >= minWidthThreshold &&
    containerSize.height >= minHeightThreshold;

  const containerStyle = useMemo(
    () => ({
      width,
      height,
      minWidth,
      minHeight,
      maxHeight,
    }),
    [width, height, minWidth, minHeight, maxHeight]
  );

  return (
    <div ref={containerRef} style={containerStyle}>
      {shouldRender && (
        <ResponsiveContainer
          {...responsiveProps}
          width="100%"
          height="100%"
          className={className}
          style={style}
          id={id ? `${id}` : undefined}
          initialDimension={containerSize}
        >
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}

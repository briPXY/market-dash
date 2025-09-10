import { useState, useEffect } from "react";

export function useElementSizeThrottled(ref, delay = 1000) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    let timeoutId;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;

        // Clear any pending update
        clearTimeout(timeoutId);

        // Wait until "settled" for `delay` ms before committing size
        timeoutId = setTimeout(() => {
          setSize({ width, height });
        }, delay);
      }
    });

    observer.observe(ref.current);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [ref, delay]);

  return size;
}

export function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}

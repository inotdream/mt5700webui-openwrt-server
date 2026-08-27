import { useCallback, useRef, useState } from 'react';

export function useCommandQueue() {
  const queue = useRef<Array<() => Promise<void>>>([]);
  const processing = useRef(false);
  const [busy, setBusy] = useState(false);

  const pump = useCallback(async () => {
    if (processing.current) return;
    processing.current = true;
    setBusy(true);
    while (queue.current.length) {
      const fn = queue.current.shift();
      if (!fn) continue;
      try {
        await fn();
      } catch (error) {
        console.error('AT 队列任务失败:', error);
      }
    }
    processing.current = false;
    setBusy(false);
  }, []);

  const enqueue = useCallback(
    (fn: () => Promise<void>) => {
      queue.current.push(fn);
      pump();
    },
    [pump],
  );

  return { enqueue, busy };
}

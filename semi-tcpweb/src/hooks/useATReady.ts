import { useEffect, useRef } from 'react';
import { ATService } from '@/services/at';

export function useATReady(onReady: () => void) {
  const cb = useRef(onReady);
  cb.current = onReady;

  useEffect(() => {
    const at = ATService.getInstance();
    let ran = false;
    const run = () => {
      if (ran) return;
      ran = true;
      cb.current();
    };
    const off = at.onConnectSuccess(run);
    at.connect()
      .then((ok) => {
        if (ok) run();
      })
      .catch((error) => {
        if ((error as Error).message !== 'REQUIRE_AUTH_KEY') {
          console.error('AT 连接失败:', error);
        }
      });
    return () => {
      off();
    };
  }, []);
}

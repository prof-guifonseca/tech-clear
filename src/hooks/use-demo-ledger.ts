'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  DEMO_LEDGER_EVENT,
  DEMO_LEDGER_STORAGE_KEY,
  readDemoLedger,
  resetDemoLedger,
  seedDemoLedger,
  type DisposalEvent,
} from '@/lib/demo-ledger';

export function useDemoLedger() {
  const [events, setEvents] = useState<DisposalEvent[]>(() => seedDemoLedger());

  const refresh = useCallback(() => {
    setEvents(readDemoLedger());
  }, []);

  const reset = useCallback(() => {
    setEvents(resetDemoLedger());
  }, []);

  useEffect(() => {
    refresh();

    const onStorage = (event: StorageEvent) => {
      if (event.key === DEMO_LEDGER_STORAGE_KEY) refresh();
    };

    window.addEventListener(DEMO_LEDGER_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(DEMO_LEDGER_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return { events, refresh, reset };
}

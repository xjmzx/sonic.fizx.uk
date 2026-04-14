import { useEffect, useRef, useState } from 'react';
import { useNostr } from '@nostrify/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

const AUDIO_PREFIXES = ['audio/'];

export function isAudioEvent(ev: NostrEvent): boolean {
  const m = ev.tags.find(([k]) => k === 'm')?.[1] ?? '';
  return AUDIO_PREFIXES.some(p => m.startsWith(p));
}

export function getTag(ev: NostrEvent, key: string): string | undefined {
  return ev.tags.find(([k]) => k === key)?.[1];
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Historical query — last 30 days, up to 200 kind 1063 audio events. */
export function useAudioFeed() {
  const { nostr } = useNostr();
  const queryClient = useQueryClient();

  // Historical batch
  const query = useQuery<NostrEvent[]>({
    queryKey: ['sonic-feed'],
    queryFn: async ({ signal }) => {
      const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
      const events = await nostr.query(
        [{ kinds: [1063], since, limit: 200 }],
        { signal: signal ?? AbortSignal.timeout(12000) }
      );
      return events
        .filter(isAudioEvent)
        .sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 3 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  // Live subscription — prepend new events into cache
  const seenRef = useRef(new Set<string>());
  useEffect(() => {
    const ac = new AbortController();
    const since = Math.floor(Date.now() / 1000);

    (async () => {
      try {
        for await (const msg of nostr.req([{ kinds: [1063], since }], { signal: ac.signal })) {
          if (msg[0] === 'CLOSED') break;
          if (msg[0] !== 'EVENT') continue;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ev = (msg as any)[2] as NostrEvent;
          if (!isAudioEvent(ev) || seenRef.current.has(ev.id)) continue;
          seenRef.current.add(ev.id);
          queryClient.setQueryData<NostrEvent[]>(['sonic-feed'], prev =>
            prev ? [ev, ...prev] : [ev]
          );
        }
      } catch (e) {
        if (!ac.signal.aborted) console.warn('sonic feed sub error', e);
      }
    })();

    return () => ac.abort();
  }, [nostr, queryClient]);

  return query;
}

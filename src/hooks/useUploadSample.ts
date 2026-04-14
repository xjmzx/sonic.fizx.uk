import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BlossomUploader } from '@nostrify/nostrify/uploaders';
import { useCurrentUser } from './useCurrentUser';
import { useNostrPublish } from './useNostrPublish';
import type { NostrEvent } from '@nostrify/nostrify';

export const BLOSSOM_SERVERS = [
  'https://blossom.primal.net/',
  'https://blossom.band/',
];

export const ACCEPTED_AUDIO = [
  'audio/wav', 'audio/x-wav',
  'audio/mpeg', 'audio/mp3',
  'audio/flac', 'audio/x-flac',
  'audio/ogg',  'audio/aac',
  'audio/m4a',  'audio/mp4',
  'audio/webm',
];

export interface UploadOptions {
  file: File;
  title?: string;
  description?: string;
  extraTags?: string[];   // extra #t hashtags e.g. ['drums', 'loop']
  bpm?: string;
  musicalKey?: string;
}

/**
 * Upload an audio file to Blossom, then publish a NIP-94 kind 1063 event.
 * Returns the published event on success.
 */
export function useUploadSample() {
  const { user } = useCurrentUser();
  const { mutateAsync: publish } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation<NostrEvent, Error, UploadOptions>({
    mutationFn: async ({ file, title, description, extraTags = [], bpm, musicalKey }) => {
      if (!user) throw new Error('Log in to upload samples');

      // ── 1. Upload to Blossom ──────────────────────────────────────────────
      const uploader = new BlossomUploader({
        servers: BLOSSOM_SERVERS,
        signer: user.signer,
      });

      // BlossomUploader.upload() returns NIP-94 compatible tags:
      // [['url', '...'], ['x', '<sha256>'], ['m', '<mime>'], ['size', '<bytes>']]
      const uploadedTags = await uploader.upload(file);

      // ── 2. Build kind 1063 tags ───────────────────────────────────────────
      const tags: string[][] = [...uploadedTags];

      // Always tag as 'sonic' so our feed can filter by it
      tags.push(['t', 'sonic']);
      for (const t of extraTags) {
        if (t.trim()) tags.push(['t', t.trim().toLowerCase()]);
      }

      const displayTitle = title?.trim() || file.name.replace(/\.[^.]+$/, '');
      tags.push(['title', displayTitle]);

      if (bpm?.trim())        tags.push(['bpm', bpm.trim()]);
      if (musicalKey?.trim()) tags.push(['key', musicalKey.trim()]);

      // ── 3. Publish kind 1063 ─────────────────────────────────────────────
      const event = await publish({
        kind: 1063,
        content: description?.trim() || displayTitle,
        tags,
      });

      return event;
    },

    onSuccess: (event) => {
      // Prepend the new event to the feed cache immediately
      queryClient.setQueryData<NostrEvent[]>(['sonic-feed'], prev =>
        prev ? [event, ...prev] : [event]
      );
    },
  });
}

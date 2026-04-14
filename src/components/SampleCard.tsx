import { Download, ExternalLink } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';
import { formatDistanceToNowStrict } from 'date-fns';
import { AudioPlayer } from './AudioPlayer';
import { getTag, formatBytes } from '@/hooks/useAudioFeed';

interface SampleCardProps {
  event: NostrEvent;
}

const FORMAT_LABELS: Record<string, string> = {
  'audio/wav': 'WAV', 'audio/x-wav': 'WAV',
  'audio/mpeg': 'MP3', 'audio/mp3': 'MP3',
  'audio/flac': 'FLAC', 'audio/x-flac': 'FLAC',
  'audio/ogg': 'OGG',
  'audio/aac': 'AAC',
  'audio/mp4': 'M4A', 'audio/m4a': 'M4A',
  'audio/webm': 'WEBM',
};

export function SampleCard({ event }: SampleCardProps) {
  const url     = getTag(event, 'url');
  const mime    = getTag(event, 'm') ?? '';
  const title   = getTag(event, 'title') || event.content || 'Untitled sample';
  const sizeRaw = getTag(event, 'size');
  const bpm     = getTag(event, 'bpm');
  const key     = getTag(event, 'key');
  const hashtags = event.tags.filter(([k]) => k === 't').map(([, v]) => v).filter(t => t !== 'sonic');

  const fmt     = FORMAT_LABELS[mime] ?? mime.split('/')[1]?.toUpperCase() ?? '?';
  const size    = sizeRaw ? formatBytes(parseInt(sizeRaw, 10)) : null;
  const ago     = formatDistanceToNowStrict(new Date(event.created_at * 1000));
  const author  = `${event.pubkey.slice(0, 8)}…${event.pubkey.slice(-4)}`;

  if (!url) return null;

  return (
    <div className="bg-card border border-border p-4 flex flex-col gap-3 group hover:border-primary/30 transition-colors">

      {/* Title row */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">{title}</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
            {author} · {ago}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <a
            href={url}
            download
            title="Download"
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <Download className="w-3.5 h-3.5" />
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="p-1.5 text-muted-foreground hover:text-accent transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Player */}
      <AudioPlayer url={url} mime={mime} />

      {/* Meta badges */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-primary/40 text-primary/80">
          {fmt}
        </span>
        {size && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground">
            {size}
          </span>
        )}
        {bpm && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-accent/40 text-accent/80">
            {bpm} BPM
          </span>
        )}
        {key && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-accent/40 text-accent/80">
            {key}
          </span>
        )}
        {hashtags.slice(0, 4).map(t => (
          <span key={t} className="text-[9px] font-mono text-muted-foreground/60">
            #{t}
          </span>
        ))}
      </div>
    </div>
  );
}

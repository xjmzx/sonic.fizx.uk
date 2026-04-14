import { Loader2, Radio } from 'lucide-react';
import { LoginArea } from '@/components/auth/LoginArea';
import { RelaySelector } from '@/components/RelaySelector';
import { UploadArea } from '@/components/UploadArea';
import { SampleCard } from '@/components/SampleCard';
import { useAudioFeed } from '@/hooks/useAudioFeed';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// ── fizx 4×4 favicon block ────────────────────────────────────────────────────
const FizxLogo = () => (
  <svg width="16" height="16" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect x="0" y="0" width="1" height="1" fill="#34d399"/>
    <rect x="1" y="0" width="1" height="1" fill="#a78bfa"/>
    <rect x="2" y="0" width="1" height="1" fill="#34d399"/>
    <rect x="3" y="0" width="1" height="1" fill="#a78bfa"/>
    <rect x="0" y="1" width="1" height="1" fill="#a78bfa"/>
    <rect x="1" y="1" width="1" height="1" fill="#34d399"/>
    <rect x="2" y="1" width="1" height="1" fill="#a78bfa"/>
    <rect x="3" y="1" width="1" height="1" fill="#34d399"/>
    <rect x="0" y="2" width="1" height="1" fill="#34d399"/>
    <rect x="1" y="2" width="1" height="1" fill="#a78bfa"/>
    <rect x="2" y="2" width="1" height="1" fill="#34d399"/>
    <rect x="3" y="2" width="1" height="1" fill="#a78bfa"/>
    <rect x="0" y="3" width="1" height="1" fill="#a78bfa"/>
    <rect x="1" y="3" width="1" height="1" fill="#34d399"/>
    <rect x="2" y="3" width="1" height="1" fill="#a78bfa"/>
    <rect x="3" y="3" width="1" height="1" fill="#34d399"/>
  </svg>
);

// ── Subdomain footer links ────────────────────────────────────────────────────
const SUBDOMAINS: [string, string][] = [
  ['https://fizx.uk',         'fizx.uk'],
  ['https://glimpse.fizx.uk', 'glimpse'],
  ['https://pulse.fizx.uk',   'pulse'],
  ['https://ln.fizx.uk',      'ln'],
  ['https://stakes.fizx.uk',  'stakes'],
  ['https://sonic.fizx.uk',   'sonic'],
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index() {
  const { user } = useCurrentUser();
  const { data: samples = [], isLoading, isError } = useAudioFeed();

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Nav */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="https://fizx.uk" className="flex items-center gap-2" aria-label="fizx.uk">
            <FizxLogo />
            <span className="font-mono text-sm">
              <span className="bg-gradient-to-r from-[#34d399] via-[#a78bfa] to-[#34d399] bg-clip-text text-transparent font-bold">fizx</span>
              <span className="text-muted-foreground">.uk</span>
              <span className="text-muted-foreground/40 ml-1">/ sonic</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <RelaySelector />
            <LoginArea className="max-w-48" />
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#34d399] via-[#a78bfa] to-[#34d399] bg-clip-text text-transparent">
              sonic
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Share short audio samples on Nostr — upload, play, download, collaborate.
          </p>
        </div>

        {/* Upload */}
        <section>
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Upload
          </h2>
          {user ? (
            <UploadArea />
          ) : (
            <div className="border border-dashed border-border/60 p-8 text-center">
              <p className="text-xs font-mono text-muted-foreground/60">
                Log in with Nostr to upload samples
              </p>
            </div>
          )}
        </section>

        {/* Feed */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Samples
            </h2>
            {!isLoading && samples.length > 0 && (
              <span className="text-[9px] font-mono text-muted-foreground/50">
                {samples.length}
              </span>
            )}
            {isLoading && <Radio className="w-3 h-3 text-primary animate-pulse" />}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 py-12 justify-center">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Connecting to relay…</span>
            </div>
          )}

          {isError && (
            <p className="text-xs font-mono text-red-400/60 py-8 text-center">
              Could not load samples — relay may be unreachable.
            </p>
          )}

          {!isLoading && !isError && samples.length === 0 && (
            <p className="text-xs font-mono text-muted-foreground/50 py-12 text-center">
              No audio samples found yet. Be the first to upload one.
            </p>
          )}

          {samples.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {samples.map(ev => (
                <SampleCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-y-2 text-xs text-muted-foreground font-mono">
          <span>sonic.fizx.uk</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {SUBDOMAINS.map(([href, label]) => (
              <a key={href} href={href} className="hover:text-primary transition-colors">{label}</a>
            ))}
            <span className="text-primary/60 ml-1">✦ built with claude</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

import React, { useCallback, useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Music } from 'lucide-react';
import { useUploadSample, ACCEPTED_AUDIO } from '@/hooks/useUploadSample';
import { Input } from '@/components/ui/input';

const ACCEPT = ACCEPTED_AUDIO.join(',');

type Stage = 'idle' | 'form' | 'uploading' | 'done' | 'error';

export function UploadArea() {
  const { mutate: upload, isPending } = useUploadSample();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bpm, setBpm] = useState('');
  const [musicalKey, setMusicalKey] = useState('');
  const [tags, setTags] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const acceptFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setErrorMsg('Only audio files are accepted.');
      setStage('error');
      return;
    }
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^.]+$/, ''));
    setStage('form');
    setErrorMsg('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) acceptFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setStage('uploading');
    const extraTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    upload(
      { file: selectedFile, title, description, bpm, musicalKey, extraTags },
      {
        onSuccess: () => {
          setStage('done');
          setTimeout(() => {
            setStage('idle');
            setSelectedFile(null);
            setTitle(''); setDescription(''); setBpm(''); setMusicalKey(''); setTags('');
          }, 3000);
        },
        onError: (err) => {
          setErrorMsg(err.message);
          setStage('error');
        },
      }
    );
  };

  const reset = () => { setStage('idle'); setSelectedFile(null); setErrorMsg(''); };

  // ── Idle / drop zone ────────────────────────────────────────────────────────
  if (stage === 'idle' || stage === 'error') {
    return (
      <div className="space-y-2">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-border/60 hover:border-primary/40 hover:bg-card/60'
          }`}
        >
          <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-mono text-muted-foreground">
            Drop an audio file here, or <span className="text-primary">click to browse</span>
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/50 mt-1">
            WAV · MP3 · FLAC · OGG · AAC · M4A
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {stage === 'error' && (
          <div className="flex items-center gap-2 text-xs font-mono text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMsg}
            <button onClick={reset} className="ml-auto hover:text-red-300">retry</button>
          </div>
        )}
      </div>
    );
  }

  // ── Metadata form ───────────────────────────────────────────────────────────
  if (stage === 'form') {
    return (
      <form onSubmit={handleSubmit} className="border border-border bg-card/60 p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
          <Music className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-mono text-foreground truncate">{selectedFile?.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Title</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Sample title"
              className="rounded-none text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Tags</label>
            <Input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="drums, loop, ambient"
              className="rounded-none text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">BPM</label>
            <Input
              value={bpm}
              onChange={e => setBpm(e.target.value)}
              placeholder="128"
              className="rounded-none text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Key</label>
            <Input
              value={musicalKey}
              onChange={e => setMusicalKey(e.target.value)}
              placeholder="C minor"
              className="rounded-none text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Description</label>
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short description…"
            className="rounded-none text-xs font-mono"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="font-mono text-xs px-4 py-2 border border-primary/60 text-primary hover:bg-primary/10 transition-colors"
          >
            Upload to Nostr
          </button>
          <button
            type="button"
            onClick={reset}
            className="font-mono text-xs px-4 py-2 border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // ── Uploading ───────────────────────────────────────────────────────────────
  if (stage === 'uploading') {
    return (
      <div className="border border-border p-8 flex items-center justify-center gap-3">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <span className="text-xs font-mono text-muted-foreground">
          Uploading to Blossom · publishing to Nostr…
        </span>
      </div>
    );
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  return (
    <div className="border border-primary/30 bg-primary/5 p-6 flex items-center justify-center gap-2">
      <CheckCircle className="w-4 h-4 text-primary" />
      <span className="text-xs font-mono text-primary">Sample published to Nostr ✓</span>
    </div>
  );
}

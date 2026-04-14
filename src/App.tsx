import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { InferSeoMetaPlugin } from '@unhead/addons';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import NostrProvider from '@/components/NostrProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NostrLoginProvider } from '@nostrify/react/login';
import { AppProvider } from '@/components/AppProvider';
import { AppConfig } from '@/contexts/AppContext';
import { useAppContext } from '@/hooks/useAppContext';
import Index from '@/pages/Index';

const head = createHead({ plugins: [InferSeoMetaPlugin()] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 60000, gcTime: Infinity },
  },
});

const defaultConfig: AppConfig = {
  theme: 'dark',
  relayUrl: 'wss://relay.fizx.uk',
};

const presetRelays = [
  { url: 'wss://relay.fizx.uk',    name: 'fizx' },
  { url: 'wss://relay.nostr.band', name: 'Nostr.Band' },
  { url: 'wss://relay.damus.io',   name: 'Damus' },
  { url: 'wss://relay.primal.net', name: 'Primal' },
];

function AppInner() {
  const { config } = useAppContext();
  return (
    <QueryClientProvider client={queryClient}>
      <NostrLoginProvider storageKey="nostr:login">
        <NostrProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense>
              <div className={config.theme === 'dark' ? 'dark' : ''}>
                <BrowserRouter>
                  <Index />
                </BrowserRouter>
              </div>
            </Suspense>
          </TooltipProvider>
        </NostrProvider>
      </NostrLoginProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <UnheadProvider head={head}>
      <AppProvider
        storageKey="sonic:app-config"
        defaultConfig={defaultConfig}
        presetRelays={presetRelays}
      >
        <AppInner />
      </AppProvider>
    </UnheadProvider>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import InfraMap from '@/components/infra-map';
import ApiKeyInputForm from '@/components/api-key-input-form';

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check for env variable first.
    const envApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
  };
  
  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="h-dvh w-screen">
      <Header />
      <main className="pt-16 h-full w-full">
        {apiKey ? (
          <InfraMap apiKey={apiKey} />
        ) : (
          <ApiKeyInputForm onSubmit={handleApiKeySubmit} />
        )}
      </main>
    </div>
  );
}

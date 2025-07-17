
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import InfraMap from '@/components/infra-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Note: This is a public key, so it's safe to be exposed in the browser.
    const envApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
    }
  }, []);
  
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
           <div className="flex h-full items-center justify-center bg-background p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-primary" />
                    <span>Google Maps API Key Missing</span>
                  </CardTitle>
                  <CardDescription>
                    The Google Maps API key is not configured. Please add it to your <code>.env</code> file to continue.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <code className="text-sm">
                      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}
      </main>
    </div>
  );
}

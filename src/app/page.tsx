import { Header } from '@/components/layout/header';
import InfraMap from '@/components/infra-map';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function Home() {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>API Key Missing</AlertTitle>
          <AlertDescription>
            Please set the <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable in a <code>.env.local</code> file to use the map.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-dvh w-screen">
      <Header />
      <main className="pt-16 h-full w-full">
        <InfraMap apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} />
      </main>
    </div>
  );
}

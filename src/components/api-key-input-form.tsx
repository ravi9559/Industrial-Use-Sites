
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface ApiKeyInputFormProps {
  onSubmit: (apiKey: string) => void;
}

export default function ApiKeyInputForm({ onSubmit }: ApiKeyInputFormProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('API key cannot be empty.');
      return;
    }
    setError('');
    onSubmit(key.trim());
  };

  return (
    <div className="flex h-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              <span>Google Maps API Key Required</span>
            </CardTitle>
            <CardDescription>
              Please provide your Google Maps API key to view the map. You can get one from the Google Cloud Console.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="text"
                placeholder="Enter your API key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className={error ? 'border-destructive' : ''}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Load Map
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

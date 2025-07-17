import { MapPinned } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <MapPinned className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              InfraMapper
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}

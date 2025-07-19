import { MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/button';

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M16.6,14.2l-1.5-0.8c-0.5-0.2-0.8-0.1-1.2,0.3l-0.6,0.8c-0.2,0.2-0.5,0.3-0.7,0.2c-1.4-0.6-2.5-1.7-3.2-3.2
	c-0.1-0.2,0-0.5,0.2-0.7l0.8-0.6c0.4-0.4,0.5-0.7,0.3-1.2l-0.8-1.5c-0.2-0.5-0.6-0.6-1.1-0.6H7.1C6.6,6,6.2,6.4,6.3,6.9
	c0.2,1.6,0.8,3.1,1.8,4.5c1.2,1.6,2.8,2.9,4.6,3.7c0.5,0.2,1,0.3,1.5,0.3c0.7,0,1.3-0.2,1.8-0.7c0.5-0.5,0.6-1.1,0.5-1.8
	C17.2,14.9,17,14.4,16.6,14.2z M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10c5.5,0,10-4.5,10-10S17.5,2,12,2z M12,20.5
	c-4.7,0-8.5-3.8-8.5-8.5S7.3,3.5,12,3.5s8.5,3.8,8.5,8.5S16.7,20.5,12,20.5z"
      ></path>
    </svg>
  );
}


export function Header() {
  const whatsappUrl = "https://wa.me/919841098170?text=Hi! I'm interested in learning more about the properties on Industrial Use Sites.";

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <MapPinned className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Industrial Use Sites
            </h1>
          </div>
           <div className="flex items-center">
            <Button asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="h-5 w-5" />
                <span>WhatsApp <b className="font-bold">O2O</b></span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

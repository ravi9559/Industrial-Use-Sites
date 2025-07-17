
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker
} from '@vis.gl/react-google-maps';
import { ROADS, CHENNAI_CENTER, PORTS, AIRPORTS, CHENNAI_BENGALURU_EXPRESSWAY_COORDS, CHENNAI_CHITHOOR_EXPRESSWAY_COORDS, SIDCO_PARKS, SIPCOT_PARKS } from '@/lib/constants';
import { Ship, Plane, Building2 } from 'lucide-react';
import { getPointsAtIntervals } from '@/lib/utils';
import type { IntervalPoint } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DistanceCalculator } from './distance-calculator';

const RoadPolyline = ({ coords, color }: { coords: { lat: number, lng: number }[], color: string }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const polyline = new google.maps.Polyline({
      path: coords,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeWeight: 6,
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, coords, color]);

  return null;
}

const ParkMarker = ({ park, color }: { park: { name: string; coords: { lat: number, lng: number } }, color: string }) => {
    const [open, setOpen] = useState(false);
  
    return (
      <AdvancedMarker
        position={park.coords}
        onClick={() => setOpen(true)}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className={`p-2 ${color} rounded-full shadow-lg cursor-pointer`}>
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto max-w-xs">
            <Card className="border-none shadow-none">
              <CardHeader className="p-2">
                <CardTitle className="text-base">{park.name}</CardTitle>
              </CardHeader>
            </Card>
          </PopoverContent>
        </Popover>
      </AdvancedMarker>
    );
  };

export default function InfraMap({ apiKey }: { apiKey: string }) {
  const mapId = 'a12a325a741369e5';
  
  const expresswayIntervalPoints: IntervalPoint[] = useMemo(() => 
    getPointsAtIntervals(CHENNAI_BENGALURU_EXPRESSWAY_COORDS, 10, 100), 
    []
  );

  const chithoorExpresswayIntervalPoints: IntervalPoint[] = useMemo(() => 
    getPointsAtIntervals(CHENNAI_CHITHOOR_EXPRESSWAY_COORDS, 10, 100), 
    []
  );

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'routes']}>
      <div className="relative h-full w-full">
        <Map
          defaultCenter={CHENNAI_CENTER}
          defaultZoom={10}
          mapId={mapId}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          className="h-full w-full"
        >
          {Object.values(ROADS).map(road => (
            <RoadPolyline key={road.name} coords={road.coords} color={road.color} />
          ))}
          {Object.values(PORTS).map(port => (
            <AdvancedMarker key={port.name} position={port.coords}>
              <div className="p-2 bg-primary rounded-full shadow-lg">
                <Ship className="h-6 w-6 text-primary-foreground" />
              </div>
            </AdvancedMarker>
          ))}
          {Object.values(AIRPORTS).map(airport => (
            <AdvancedMarker key={airport.name} position={airport.coords}>
              <div className="p-2 bg-accent rounded-full shadow-lg">
                <Plane className="h-6 w-6 text-accent-foreground" />
              </div>
            </AdvancedMarker>
          ))}
          {Object.values(SIDCO_PARKS).map(park => (
            <ParkMarker key={park.name} park={park} color="bg-green-500" />
          ))}
          {Object.values(SIPCOT_PARKS).map(park => (
            <ParkMarker key={park.name} park={park} color="bg-orange-500" />
          ))}
           {expresswayIntervalPoints.map((point, index) => (
            <AdvancedMarker key={`nh48-pt-${index}`} position={point}>
              <div className="flex items-center justify-center h-8 w-8 bg-destructive text-destructive-foreground rounded-full shadow-md text-xs font-bold">
                {point.distance}
              </div>
            </AdvancedMarker>
          ))}
          {chithoorExpresswayIntervalPoints.map((point, index) => (
            <AdvancedMarker key={`nh38-pt-${index}`} position={point}>
              <div className="flex items-center justify-center h-8 w-8 bg-destructive text-destructive-foreground rounded-full shadow-md text-xs font-bold">
                {point.distance}
              </div>
            </AdvancedMarker>
          ))}
        </Map>
        <DistanceCalculator />
      </div>
    </APIProvider>
  );
}

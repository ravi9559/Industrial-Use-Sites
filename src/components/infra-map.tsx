
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker
} from '@vis.gl/react-google-maps';
import { ROADS, CHENNAI_CENTER, PORTS, AIRPORTS, SIDCO_PARKS, SIPCOT_PARKS, NH48_CHENNAI_KRISHNAGIRI_COORDS } from '@/lib/constants';
import { Ship, Plane, Building2 } from 'lucide-react';
import { getPointsAtIntervals } from '@/lib/utils';
import type { IntervalPoint } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { DistanceCalculator } from './distance-calculator';
import { RadiusCalculator } from './radius-calculator';
import { Route, CircleDot } from 'lucide-react';

const RoadPolyline = ({ coords, color, opacity = 0.9, weight = 6 }: { coords: { lat: number, lng: number }[], color: string, opacity?: number, weight?: number }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    const roadPath = new google.maps.Polyline({
        path: coords,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: opacity,
        strokeWeight: weight,
    });
    
    roadPath.setMap(map);

    return () => {
      roadPath.setMap(null);
    };
  }, [map, coords, color, opacity, weight]);

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

const InfraMapContent = () => {
  const geometry = useMapsLibrary('geometry');
  const [nh48_100km_coords, setNh48_100km_coords] = useState<({ lat: number; lng: number; }[])>([]);

  const nh48IntervalPoints: IntervalPoint[] = useMemo(() =>
    getPointsAtIntervals(NH48_CHENNAI_KRISHNAGIRI_COORDS, 10, 100),
    []
  );

  useEffect(() => {
    if (!geometry || nh48IntervalPoints.length === 0) {
      return;
    }

    const lastPoint = nh48IntervalPoints[nh48IntervalPoints.length - 1];
    const coords = [];
    for(let i = 0; i < NH48_CHENNAI_KRISHNAGIRI_COORDS.length - 1; i++) {
        coords.push(NH48_CHENNAI_KRISHNAGIRI_COORDS[i]);
        if (NH48_CHENNAI_KRISHNAGIRI_COORDS[i].lat === lastPoint.lat && NH48_CHENNAI_KRISHNAGIRI_COORDS[i].lng === lastPoint.lng) {
            break;
        }
        
        const dist = geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(NH48_CHENNAI_KRISHNAGIRI_COORDS[0]),
            new google.maps.LatLng(NH48_CHENNAI_KRISHNAGIRI_COORDS[i+1])
        ) / 1000;
        if (dist > 100) {
             // Find the exact 100km point
             const heading = geometry.spherical.computeHeading(new google.maps.LatLng(NH48_CHENNAI_KRISHNAGIRI_COORDS[i]), new google.maps.LatLng(NH48_CHENNAI_KRISHNAGIRI_COORDS[i+1]));
             const prevDist = geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(NH48_CHENNAI_KRISHNAGIRI_COORDS[0]),
                new google.maps.LatLng(NH48_CHENNAI_KRISHNAGIRI_COORDS[i])
             ) / 1000;
             const remainingDist = 100 - prevDist;
             const point100km = geometry.spherical.computeOffset(new google.maps.LatLng(NH48_CHENNAI_KRISHNAGIRI_COORDS[i]), remainingDist * 1000, heading);
             coords.push({lat: point100km.lat(), lng: point100km.lng()});
             break;
        }
    }
    setNh48_100km_coords(coords);

  }, [geometry, nh48IntervalPoints]);


  return (
    <>
      <Map
        defaultCenter={CHENNAI_CENTER}
        defaultZoom={10}
        mapId={'a12a325a741369e5'}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        zoomControl={true}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        className="h-full w-full"
      >
        {nh48_100km_coords.length > 0 && <RoadPolyline coords={nh48_100km_coords} color={"#808080"} opacity={0.6} weight={2} />}
        {Object.values(ROADS).map(road => (
          <RoadPolyline key={road.name} coords={road.coords} color={road.color} />
        ))}
        {Object.values(PORTS).map(port => (
          <AdvancedMarker key={port.name} position={port.coords}>
            <div className="p-2 bg-blue-500 text-white rounded-full shadow-lg">
              <Ship className="h-6 w-6" />
            </div>
          </AdvancedMarker>
        ))}
        {Object.values(AIRPORTS).map(airport => (
          <AdvancedMarker key={airport.name} position={airport.coords}>
            <div className="p-2 bg-teal-500 text-white rounded-full shadow-lg">
              <Plane className="h-6 w-6" />
            </div>
          </AdvancedMarker>
        ))}
        {Object.values(SIDCO_PARKS).map(park => (
          <ParkMarker key={park.name} park={park} color="bg-indigo-500" />
        ))}
        {Object.values(SIPCOT_PARKS).map(park => (
          <ParkMarker key={park.name} park={park} color="bg-purple-500" />
        ))}
        {nh48IntervalPoints.map((point, index) => (
          <AdvancedMarker key={`nh48-ck-pt-${index}`} position={point}>
            <div className="flex items-center justify-center h-8 w-8 bg-orange-600 text-white rounded-full shadow-md text-xs font-bold">
              {point.distance}
            </div>
          </AdvancedMarker>
        ))}
      </Map>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
        <h2 className="text-3xl font-light text-foreground/30 whitespace-nowrap select-none">
          Lakshmi Balaji <b className="font-bold">O2O</b>
        </h2>
      </div>
      <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
         <Accordion type="single" collapsible className="w-full bg-background/80 backdrop-blur-sm rounded-lg">
          <AccordionItem value="distance" className="border-b-0">
              <Card>
                  <AccordionTrigger className="p-4 w-full">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                          <Route className="h-6 w-6 text-primary" />
                          <span>Distance Calculator</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <DistanceCalculator />
                  </AccordionContent>
              </Card>
          </AccordionItem>
          <AccordionItem value="radius" className="border-b-0">
               <Card className="mt-2">
                  <AccordionTrigger className="p-4 w-full">
                       <div className="flex items-center gap-2 text-lg font-semibold">
                          <CircleDot className="h-6 w-6 text-primary" />
                          <span>Circle Radius</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <RadiusCalculator />
                  </AccordionContent>
              </Card>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};


export default function InfraMap({ apiKey }: { apiKey: string }) {
  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'routes', 'geometry']}>
      <div className="relative h-full w-full">
        <InfraMapContent />
      </div>
    </APIProvider>
  );
}

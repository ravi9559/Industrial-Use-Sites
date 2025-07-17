
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker
} from '@vis.gl/react-google-maps';
import { ROADS, CHENNAI_CENTER, PORTS, AIRPORTS, SIDCO_PARKS, SIPCOT_PARKS, NH48_CHENNAI_KRISHNAGIRI_COORDS, NH32_CHENNAI_TRICHY_COORDS, NH16_CHENNAI_TADA_COORDS } from '@/lib/constants';
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
  const [nh32_100km_coords, setNh32_100km_coords] = useState<({ lat: number; lng: number; }[])>([]);
  const [nh16_100km_coords, setNh16_100km_coords] = useState<({ lat: number; lng: number; }[])>([]);

  const nh48IntervalPoints: IntervalPoint[] = useMemo(() =>
    getPointsAtIntervals(NH48_CHENNAI_KRISHNAGIRI_COORDS, 10, 100),
    []
  );

  const nh32IntervalPoints: IntervalPoint[] = useMemo(() =>
    getPointsAtIntervals(NH32_CHENNAI_TRICHY_COORDS, 10, 100),
    []
  );

  const nh16IntervalPoints: IntervalPoint[] = useMemo(() =>
    getPointsAtIntervals(NH16_CHENNAI_TADA_COORDS, 10, 100),
    []
  );

  useEffect(() => {
    if (!geometry) return;

    const calculate100kmPath = (sourceCoords: {lat: number, lng: number}[]) => {
        if (!sourceCoords || sourceCoords.length === 0) return [];
        const coords = [];
        let totalDistance = 0;
        for(let i = 0; i < sourceCoords.length - 1; i++) {
            coords.push(sourceCoords[i]);
            const startPoint = new google.maps.LatLng(sourceCoords[i]);
            const endPoint = new google.maps.LatLng(sourceCoords[i+1]);
            const segmentDistance = geometry.spherical.computeDistanceBetween(startPoint, endPoint) / 1000;
            
            if (totalDistance + segmentDistance > 100) {
                const remainingDist = 100 - totalDistance;
                const heading = geometry.spherical.computeHeading(startPoint, endPoint);
                const point100km = geometry.spherical.computeOffset(startPoint, remainingDist * 1000, heading);
                coords.push({lat: point100km.lat(), lng: point100km.lng()});
                break;
            }
            totalDistance += segmentDistance;
            if (i === sourceCoords.length - 2) { // Add the last point if we are at the end
                coords.push(sourceCoords[i+1]);
            }
        }
        return coords;
    }
    
    setNh48_100km_coords(calculate100kmPath(NH48_CHENNAI_KRISHNAGIRI_COORDS));
    setNh32_100km_coords(calculate100kmPath(NH32_CHENNAI_TRICHY_COORDS));
    setNh16_100km_coords(calculate100kmPath(NH16_CHENNAI_TADA_COORDS));

  }, [geometry]);


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
        {nh32_100km_coords.length > 0 && <RoadPolyline coords={nh32_100km_coords} color={"#808080"} opacity={0.6} weight={2} />}
        {nh16_100km_coords.length > 0 && <RoadPolyline coords={nh16_100km_coords} color={"#808080"} opacity={0.6} weight={2} />}
        
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

        {nh32IntervalPoints.map((point, index) => (
          <AdvancedMarker key={`nh32-ct-pt-${index}`} position={point}>
            <div className="flex items-center justify-center h-8 w-8 bg-cyan-600 text-white rounded-full shadow-md text-xs font-bold">
              {point.distance}
            </div>
          </AdvancedMarker>
        ))}

        {nh16IntervalPoints.map((point, index) => (
          <AdvancedMarker key={`nh16-ct-pt-${index}`} position={point}>
            <div className="flex items-center justify-center h-8 w-8 bg-green-600 text-white rounded-full shadow-md text-xs font-bold">
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

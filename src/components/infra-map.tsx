
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker
} from '@vis.gl/react-google-maps';
import { CHENNAI_CENTER, PORTS, AIRPORTS, SIDCO_PARKS, SIPCOT_PARKS, NH48_CHENNAI_KRISHNAGIRI_COORDS, NH32_CHENNAI_TRICHY_COORDS, NH16_CHENNAI_TADA_COORDS, CHENNAI_THATCHOOR_EXPRESSWAY_COORDS, CHENNAI_OUTER_RING_ROAD_COORDS, CHENNAI_PERIPHERAL_RING_ROAD_COORDS, STRR_SATELLITE_TOWN_RING_ROAD_COORDS, NE7_CHENNAI_BENGALURU_EXPRESS_HIGHWAY_COORDS } from '@/lib/constants';
import { Ship, Plane, Building2, Warehouse, Route, CircleDot, Info } from 'lucide-react';
import { getPointsAtIntervals } from '@/lib/utils';
import type { IntervalPoint } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { DistanceCalculator } from './distance-calculator';
import { RadiusCalculator } from './radius-calculator';
import { Card, CardContent } from './ui/card';
import { Legend } from './legend';

const RoadPolyline = ({ coords, color, opacity = 0.9, weight = 6 }: { coords: { lat: number, lng: number }[], color: string, opacity?: number, weight?: number }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || coords.length === 0) return;
    
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

const Circle = ({ center, radius, color }: { center: { lat: number, lng: number }, radius: number, color: string }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
      map,
      center,
      radius, // in meters
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, center, radius, color]);

  return null;
}

const ParkMarker = ({ park, color }: { park: { name: string; coords: { lat: number, lng: number } }, color: string }) => {
    return (
      <AdvancedMarker position={park.coords}>
        <div className={`p-1 ${color} rounded-full shadow-lg`}>
          <Building2 className="h-2 w-2 text-white" />
        </div>
      </AdvancedMarker>
    );
};

const InfraMapContent = () => {
  const geometry = useMapsLibrary('geometry');
  const [nh48_100km_coords, setNh48_100km_coords] = useState<({ lat: number; lng: number; }[])>([]);
  const [nh32_100km_coords, setNh32_100km_coords] = useState<({ lat: number; lng: number; }[])>([]);
  const [nh16_100km_coords, setNh16_100km_coords] = useState<({ lat: number; lng: number; }[])>([]);
  const [mapOptions, setMapOptions] = useState<google.maps.MapOptions>({});

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
    if (!geometry || typeof google === 'undefined' || !google.maps) return;

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
    
    setMapOptions({
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ['roadmap', 'hybrid'],
        },
    });

  }, [geometry]);


  return (
    <>
      <Map
        defaultCenter={CHENNAI_CENTER}
        defaultZoom={10}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        zoomControl={true}
        streetViewControl={false}
        fullscreenControl={false}
        className="h-full w-full"
        mapId="DEMO_MAP_ID"
        {...mapOptions}
      >
        <RoadPolyline coords={CHENNAI_OUTER_RING_ROAD_COORDS} color={"hsl(208 98% 73%)"} />
        <RoadPolyline coords={CHENNAI_PERIPHERAL_RING_ROAD_COORDS} color={"hsl(244 98% 73%)"} />
        <RoadPolyline coords={CHENNAI_THATCHOOR_EXPRESSWAY_COORDS} color={"#FFA500"} />
        <RoadPolyline coords={STRR_SATELLITE_TOWN_RING_ROAD_COORDS} color={"#228B22"} />
        <RoadPolyline coords={NE7_CHENNAI_BENGALURU_EXPRESS_HIGHWAY_COORDS} color={"#FF00FF"} />
        
        <RoadPolyline coords={nh48_100km_coords} color={"#808080"} opacity={0.6} weight={2} />
        <RoadPolyline coords={nh32_100km_coords} color={"#808080"} opacity={0.6} weight={2} />
        <RoadPolyline coords={nh16_100km_coords} color={"#808080"} opacity={0.6} weight={2} />
        
        <Circle center={{ lat: 13.256481, lng: 80.050443 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 13.256481, lng: 80.050443 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">235</div>
              <div className="text-[10px] leading-tight">1/5</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.825122, lng: 79.959865 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.825122, lng: 79.959865 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">160</div>
              <div className="text-[10px] leading-tight">40/60</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.935568, lng: 79.911113 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.935568, lng: 79.911113 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">167</div>
              <div className="text-[10px] leading-tight">30/35</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 13.008209, lng: 79.756661 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 13.008209, lng: 79.756661 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">220</div>
              <div className="text-[10px] leading-tight">70/120</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 13.437441, lng: 80.114800 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 13.437441, lng: 80.114800 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">244</div>
              <div className="text-[10px] leading-tight">4/20</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.659998, lng: 78.026792 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.659998, lng: 78.026792 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">269</div>
              <div className="text-[10px] leading-tight">50/90</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.608359, lng: 77.939155 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.608359, lng: 77.939155 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">268</div>
              <div className="text-[10px] leading-tight">40</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.622712, lng: 77.662489 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.622712, lng: 77.662489 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">267</div>
              <div className="text-[10px] leading-tight">30</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.631886, lng: 78.073348 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.631886, lng: 78.073348 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">266</div>
              <div className="text-[10px] leading-tight">50</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.961218, lng: 79.908165 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.961218, lng: 79.908165 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">264</div>
              <div className="text-[10px] leading-tight">&lt;1</div>
            </div>
        </AdvancedMarker>

        <Circle center={{ lat: 12.646769, lng: 77.740105 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.646769, lng: 77.740105 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">254</div>
              <div className="text-[10px] leading-tight">26</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.716767, lng: 77.995736 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.716767, lng: 77.995736 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">253</div>
              <div className="text-[10px] leading-tight">20</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.571404, lng: 78.484333 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.571404, lng: 78.484333 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">252</div>
              <div className="text-[10px] leading-tight">15</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.655961, lng: 77.783632 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.655961, lng: 77.783632 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">251</div>
              <div className="text-[10px] leading-tight">55</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.885979, lng: 79.639464 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.885979, lng: 79.639464 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">243</div>
              <div className="text-[10px] leading-tight">&lt;1</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 13.468979, lng: 80.106495 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 13.468979, lng: 80.106495 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">242</div>
              <div className="text-[10px] leading-tight">17</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.999361, lng: 79.845831 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.999361, lng: 79.845831 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">222</div>
              <div className="text-[10px] leading-tight">17/25</div>
            </div>
        </AdvancedMarker>
        <Circle center={{ lat: 12.906775, lng: 79.477999 }} radius={5000} color="#FFC300" />
        <AdvancedMarker position={{ lat: 12.906775, lng: 79.477999 }}>
            <div className="flex flex-col items-center justify-center h-12 w-12 bg-background text-foreground rounded-full shadow-md p-1">
              <div className="text-sm font-bold">218</div>
              <div className="text-[10px] leading-tight">30/80</div>
            </div>
        </AdvancedMarker>


        {Object.entries(PORTS).map(([key, port]) => (
          <AdvancedMarker key={port.name} position={port.coords}>
            <div className="p-0.5 bg-blue-500 text-white rounded-full shadow-lg">
              {key === 'mappedu-dry-port' ? (
                <Warehouse className="h-2 w-2" />
              ) : (
                <Ship className="h-2 w-2" />
              )}
            </div>
          </AdvancedMarker>
        ))}
        {Object.values(AIRPORTS).map(airport => (
          <AdvancedMarker key={airport.name} position={airport.coords}>
            <div className="p-0.5 bg-teal-500 text-white rounded-full shadow-lg">
              <Plane className="h-2 w-2" />
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
            <div className="flex items-center justify-center h-5 w-5 bg-gray-900/50 text-white rounded-full text-[8px] font-mono">
              {point.distance}
            </div>
          </AdvancedMarker>
        ))}

        {nh32IntervalPoints.map((point, index) => (
          <AdvancedMarker key={`nh32-ct-pt-${index}`} position={point}>
            <div className="flex items-center justify-center h-5 w-5 bg-gray-900/50 text-white rounded-full text-[8px] font-mono">
              {point.distance}
            </div>
          </AdvancedMarker>
        ))}

        {nh16IntervalPoints.map((point, index) => (
          <AdvancedMarker key={`nh16-ct-pt-${index}`} position={point}>
            <div className="flex items-center justify-center h-5 w-5 bg-gray-900/50 text-white rounded-full text-[8px] font-mono">
              {point.distance}
            </div>
          </AdvancedMarker>
        ))}

      </Map>
      <div className="absolute bottom-4 right-4 z-10 w-full max-w-xs">
         <Accordion type="single" collapsible className="w-full bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
            <AccordionItem value="legend">
               <Card>
                  <AccordionTrigger className="p-4 w-full">
                       <div className="flex items-center gap-2 text-lg font-semibold">
                          <Info className="h-6 w-6 text-primary" />
                          <span>Legend</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="p-4 pt-0">
                      <Legend />
                    </CardContent>
                  </AccordionContent>
              </Card>
            </AccordionItem>
            <AccordionItem value="distance" className="mt-2">
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
            <AccordionItem value="radius" className="mt-2">
               <Card>
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

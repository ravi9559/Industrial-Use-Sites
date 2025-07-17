
'use client';

import { useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker
} from '@vis.gl/react-google-maps';
import { ROADS, CHENNAI_CENTER, PORTS, AIRPORTS, CHENNAI_BENGALURU_EXPRESSWAY_COORDS, CHENNAI_CHITHOOR_EXPRESSWAY_COORDS } from '@/lib/constants';
import { Ship, Plane } from 'lucide-react';
import { getPointsAtIntervals } from '@/lib/utils';
import type { IntervalPoint } from '@/lib/utils';

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
    <APIProvider apiKey={apiKey}>
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
      </div>
    </APIProvider>
  );
}

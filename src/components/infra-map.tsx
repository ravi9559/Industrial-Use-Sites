'use client';

import { useEffect } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker
} from '@vis.gl/react-google-maps';
import { ROADS, CHENNAI_CENTER, PORTS } from '@/lib/constants';
import { Ship } from 'lucide-react';

type Point = {
  key: string;
  lat: number;
  lng: number;
};

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
        </Map>
      </div>
    </APIProvider>
  );
}

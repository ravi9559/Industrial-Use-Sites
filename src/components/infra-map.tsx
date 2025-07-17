'use client';

import { useMemo, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ROADS, CHENNAI_CENTER } from '@/lib/constants';

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
  const points = useMemo(() => {
    return Object.entries(ROADS).flatMap(([roadId, roadData]) => 
      roadData.coords.map((coord, index) => ({
        ...coord,
        key: `${roadId}-point-${index}`,
      }))
    );
  }, []);
  
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

          {points.map((point) => (
            <AdvancedMarker
              key={point.key}
              position={point}
            >
              <div className="w-4 h-4 rounded-full bg-accent border-2 border-accent-foreground/80 shadow-md cursor-pointer transition-transform hover:scale-125" />
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}

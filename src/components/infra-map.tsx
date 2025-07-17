'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { CHENNAI_OUTER_RING_ROAD_COORDS, CHENNAI_CENTER } from '@/lib/constants';
import { getInfrastructureDescription } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type Point = {
  key: string;
  lat: number;
  lng: number;
};

const points: Point[] = CHENNAI_OUTER_RING_ROAD_COORDS.map((coord, index) => ({
  ...coord,
  key: `point-${index}`,
}));

const RoadPolyline = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const polyline = new google.maps.Polyline({
      path: CHENNAI_OUTER_RING_ROAD_COORDS,
      geodesic: true,
      strokeColor: "hsl(var(--primary))",
      strokeOpacity: 0.9,
      strokeWeight: 6,
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map]);

  return null;
}

export default function InfraMap({ apiKey }: { apiKey: string }) {
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleMarkerClick = useCallback(async (point: Point) => {
    if (selectedPoint?.key === point.key) {
      return;
    }
    setSelectedPoint(point);
    setLoading(true);
    setDescription('');

    const result = await getInfrastructureDescription(point.lat, point.lng);
    
    if (result.success) {
      setDescription(result.description);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setSelectedPoint(null); // Close info window on error
    }
    setLoading(false);
  }, [toast, selectedPoint]);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPoint(null);
  }, []);
  
  const mapId = 'a12a325a741369e5';

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={CHENNAI_CENTER}
        defaultZoom={10}
        mapId={mapId}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="h-full w-full"
      >
        <RoadPolyline />

        {points.map((point) => (
          <AdvancedMarker
            key={point.key}
            position={point}
            onClick={() => handleMarkerClick(point)}
          >
            <div className="w-4 h-4 rounded-full bg-accent border-2 border-accent-foreground/80 shadow-md cursor-pointer transition-transform hover:scale-125" />
          </AdvancedMarker>
        ))}

        {selectedPoint && (
          <InfoWindow
            position={selectedPoint}
            onCloseClick={handleInfoWindowClose}
            minWidth={300}
            headerDisabled
          >
            <div className="bg-background text-foreground rounded-lg p-1">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="p-2">
                  <CardTitle className="text-base">Infrastructure Details</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[230px]" />
                    </div>
                  ) : (
                    <p className="text-sm text-foreground max-w-sm">{description}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}

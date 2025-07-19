
'use client';

import { useState, useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Button } from './ui/button';
import { CardContent } from './ui/card';
import { Input } from './ui/input';
import { X, Search } from 'lucide-react';

export function DistanceCalculator() {
  const map = useMap();
  const places = useMapsLibrary('places');
  const routes = useMapsLibrary('routes');

  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [fromPlace, setFromPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [toPlace, setToPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!places || !fromInputRef.current || !toInputRef.current) return;

    const fromAutocomplete = new places.Autocomplete(fromInputRef.current);
    const toAutocomplete = new places.Autocomplete(toInputRef.current);

    fromAutocomplete.addListener('place_changed', () => {
      setFromPlace(fromAutocomplete.getPlace());
    });

    toAutocomplete.addListener('place_changed', () => {
      setToPlace(toAutocomplete.getPlace());
    });
  }, [places]);

  useEffect(() => {
    if (!routes || !map) return;
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new routes.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#FF5733',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
    }

    if (directions) {
      directionsRendererRef.current.setDirections(directions);
    } else {
      directionsRendererRef.current.setDirections({routes: []});
    }
  }, [routes, map, directions]);

  const handleCalculate = async () => {
    if (!fromPlace || !toPlace || !routes) return;
    
    const directionsService = new routes.DirectionsService();

    directionsService.route(
      {
        origin: fromPlace.geometry?.location,
        destination: toPlace.geometry?.location,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const route = result.routes[0];
          if (route && route.legs && route.legs[0] && route.legs[0].distance) {
            setDistance(route.legs[0].distance.text);
          }
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  };

  const handleClear = () => {
    setFromValue('');
    setToValue('');
    setFromPlace(null);
    setToPlace(null);
    setDirections(null);
    setDistance('');
    if(fromInputRef.current) fromInputRef.current.value = '';
    if(toInputRef.current) toInputRef.current.value = '';
  };
  
  useEffect(() => {
    if (fromPlace) {
      setFromValue(fromPlace.name || '');
    }
  }, [fromPlace]);

  useEffect(() => {
    if (toPlace) {
      setToValue(toPlace.name || '');
    }
  }, [toPlace]);

  return (
    <CardContent className="space-y-4 pt-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={fromInputRef}
          placeholder="From"
          className="pl-10"
          defaultValue={fromValue}
        />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={toInputRef}
          placeholder="To"
          className="pl-10"
          defaultValue={toValue}
        />
      </div>
      <div className="flex justify-between items-center">
          <Button onClick={handleCalculate} disabled={!fromPlace || !toPlace}>
              Calculate
          </Button>
          <Button variant="ghost" onClick={handleClear} className="text-muted-foreground">
              <X className="h-4 w-4 mr-2" />
              Clear
          </Button>
      </div>
      {distance && (
        <div className="text-center font-bold text-lg text-primary">
          Distance: {distance}
        </div>
      )}
    </CardContent>
  );
}

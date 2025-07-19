
'use client';

import { useState, useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Button } from './ui/button';
import { CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Search } from 'lucide-react';

export function RadiusCalculator() {
  const map = useMap();
  const places = useMapsLibrary('places');

  const [locationValue, setLocationValue] = useState('');
  const [radiusValue, setRadiusValue] = useState(10);
  const [locationPlace, setLocationPlace] = useState<google.maps.places.PlaceResult | null>(null);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);


  useEffect(() => {
    if (!places || !locationInputRef.current) return;

    if (!autocompleteRef.current) {
      const autocomplete = new places.Autocomplete(locationInputRef.current);
      autocompleteRef.current = autocomplete;
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        setLocationPlace(place);
        setLocationValue(place.name || '');
      });
    }
  }, [places]);

  const handleDrawCircle = () => {
    if (!map || !locationPlace?.geometry?.location) return;

    if (circleRef.current) {
        circleRef.current.setMap(null);
    }

    const newCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map,
      center: locationPlace.geometry.location,
      radius: radiusValue * 1000, // Convert km to meters
    });
    
    circleRef.current = newCircle;

    const bounds = newCircle.getBounds();
    if (bounds) {
        map.fitBounds(bounds);
    }
  };

  const handleClear = () => {
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
    setLocationValue('');
    setLocationPlace(null);
    if (locationInputRef.current) {
        locationInputRef.current.value = '';
    }
  };

  return (
    <CardContent className="space-y-4 pt-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={locationInputRef}
          placeholder="Location"
          className="pl-10"
          value={locationValue}
          onChange={(e) => setLocationValue(e.target.value)}
        />
      </div>
      <div className="space-y-2">
          <Label htmlFor="radius">Radius (km)</Label>
          <Input
              id="radius"
              type="number"
              value={radiusValue}
              onChange={(e) => setRadiusValue(Number(e.target.value))}
              placeholder="Radius in km"
          />
      </div>
      <div className="flex justify-between items-center">
          <Button onClick={handleDrawCircle} disabled={!locationPlace}>
              Draw Circle
          </Button>
          <Button variant="ghost" onClick={handleClear} className="text-muted-foreground">
              <X className="h-4 w-4 mr-2" />
              Clear
          </Button>
      </div>
    </CardContent>
  );
}

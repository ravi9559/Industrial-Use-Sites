import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Coord = { lat: number; lng: number };
export type IntervalPoint = Coord & { distance: number };


// Haversine distance formula
function getDistance(coord1: Coord, coord2: Coord): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to get points at intervals along a polyline
export function getPointsAtIntervals(coords: Coord[], intervalKm: number, maxDistanceKm: number): IntervalPoint[] {
  const points: IntervalPoint[] = [];
  let distanceTraveled = 0;
  let nextInterval = intervalKm;

  for (let i = 0; i < coords.length - 1; i++) {
    const start = coords[i];
    const end = coords[i + 1];
    const segmentDistance = getDistance(start, end);

    while (nextInterval <= distanceTraveled + segmentDistance) {
        if (nextInterval > maxDistanceKm) {
            return points;
        }

      const fraction = (nextInterval - distanceTraveled) / segmentDistance;
      const lat = start.lat + (end.lat - start.lat) * fraction;
      const lng = start.lng + (end.lng - start.lng) * fraction;
      points.push({ lat, lng, distance: nextInterval });

      nextInterval += intervalKm;
    }
    
    distanceTraveled += segmentDistance;

    if (distanceTraveled > maxDistanceKm) {
        break;
    }
  }

  return points;
}

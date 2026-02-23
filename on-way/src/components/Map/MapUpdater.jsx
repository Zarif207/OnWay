import { useEffect } from "react";
import { useMap } from "react-leaflet";

// This is required to access the leaflet map instance and smoothly pan
export default function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      // Use flyTo for a smooth animation to the new coordinate
      map.flyTo(position, map.getZoom(), {
          animate: true,
          duration: 1.5 // seconds
      });
    }
  }, [position, map]);

  return null;
}

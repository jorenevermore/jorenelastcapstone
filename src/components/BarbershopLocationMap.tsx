'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SimpleMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ onLocationSelect, initialLocation = null }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation
  );

  // default loc cebu city
  const DEFAULT_LOCATION = { lat: 10.3157, lng: 123.8854 };
  const ZOOM_LEVEL = 15;

  // get users loc using googlemaps api
  const getUserExactLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };
        setSelectedLocation(userLocation);
        onLocationSelect(userLocation);

        // center map to user loc
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(userLocation);

          // update marker position
          if (markerRef.current) {
            markerRef.current.setPosition(userLocation);
          } else {
            // create marker if missing
            const marker = new window.google.maps.Marker({
              position: userLocation,
              map: mapInstanceRef.current,
              draggable: true,
              animation: window.google.maps.Animation.DROP
            });
            markerRef.current = marker;

            // add drag listener
            marker.addListener('dragend', function() {
              const newPosition = marker.getPosition();
              const newLocation = { lat: newPosition.lat(), lng: newPosition.lng() };
              setSelectedLocation(newLocation);
              onLocationSelect(newLocation);
            });
          }
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your location. Please enable location access in your browser settings.');
        setIsLoading(false);
      }
    );
  };

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) return;

    // Only initialize the map once
    if (mapInstanceRef.current) return;

    setIsLoading(true);

    // helper to set default location on error
  const setDefaultLocationOnError = () => {
    if (!selectedLocation) {
      setSelectedLocation(DEFAULT_LOCATION);
      onLocationSelect(DEFAULT_LOCATION);
    }
  };

  // map init
  const initializeMap = () => {
    try {
      // check googlemaps api
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // check script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // wait script to load if ever
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            initMap();
          }
        }, 100);
        return;
      }

      // if not loaded, create a script
      const script = document.createElement('script');

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAAlwboaaSEPBpdZqSJXmbGIRdQS9TYHlc';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;

      // set a timeout
      const timeoutId = setTimeout(() => {
        setError('Google Maps is taking too long to load. You can continue without setting a location and update it later.');
        setIsLoading(false);
        setDefaultLocationOnError();
      }, 5000); // 5 second timeout

      script.onload = () => {
        clearTimeout(timeoutId);
        initMap();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        console.error('Failed to load Google Maps API');
        setError('Failed to load Google Maps. You can continue without setting a location and update it later.');
        setIsLoading(false);
        setDefaultLocationOnError();
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error setting up map:', error);
      setError('Failed to initialize map. You can continue without setting a location and update it later.');
      setIsLoading(false);
      setDefaultLocationOnError();
    }
  };

    const initMap = () => {
      try {
        const map = new window.google.maps.Map(mapRef.current!, {
          center: initialLocation || DEFAULT_LOCATION,
          zoom: ZOOM_LEVEL,
          mapTypeControl: false,
          streetViewControl: false, 
          fullscreenControl: false, 
          zoomControl: true,
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#333333" }]
            },
            {
              featureType: "landscape",
              elementType: "all",
              stylers: [{ color: "#f5f5f5" }]
            },
            {
              featureType: "poi",
              elementType: "all",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "road",
              elementType: "all",
              stylers: [{ saturation: -100 }, { lightness: 45 }]
            },  
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ visibility: "simplified" }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Create marker with default red pin
        let marker = new window.google.maps.Marker({
          position: initialLocation || DEFAULT_LOCATION,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP
        });

        markerRef.current = marker;

        // Set initial location
        if (initialLocation) {
          map.setCenter(initialLocation);
          marker.setPosition(initialLocation);
          setSelectedLocation(initialLocation);
        } else {
          // Use default location
          map.setCenter(DEFAULT_LOCATION);
          marker.setPosition(DEFAULT_LOCATION);
          setSelectedLocation(DEFAULT_LOCATION);
          onLocationSelect(DEFAULT_LOCATION);
        }

        marker.addListener('dragend', function() {
          let position = marker.getPosition();
          let newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          setSelectedLocation(newLocation);
          onLocationSelect(newLocation);
        });

        map.addListener('click', function(event: any) {
          let clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          marker.setPosition(clickedLocation);
          setSelectedLocation(clickedLocation);
          onLocationSelect(clickedLocation);
        });



        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to load map. Please try again.');
        setIsLoading(false);
      }
    };


    initializeMap();
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  // display coordinates
  let formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  return (
    <div className="map-container relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10 rounded-lg">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-3">
        <button
          type="button"
          onClick={getUserExactLocation}
          className="inline-flex items-center gap-2 text-sm font-medium text-black transition-colors duration-200 hover:opacity-70"
        >
          <i className="fas fa-location-arrow"></i>
          Get My Current Location
        </button>
      </div>



      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-300 shadow-md transition-all duration-300 overflow-hidden"
        style={{ height: '350px' }}
      />

      {selectedLocation && (
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <div>
            <span className="font-medium">Lat:</span> {formatCoordinate(selectedLocation.lat)}
          </div>
          <div>
            <span className="font-medium">Lng:</span> {formatCoordinate(selectedLocation.lng)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMap;

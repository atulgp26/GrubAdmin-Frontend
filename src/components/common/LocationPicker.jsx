"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  useJsApiLoader,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: 40.7128, lng: -74.006 };

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function LocationPicker({
  open,
  onClose,
  onConfirm,
  initialLocation = null,
}) {
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(
    initialLocation?.latlng || defaultCenter,
  );
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [placeId, setPlaceId] = useState(initialLocation?.placeId || "");
  const [loadError, setLoadError] = useState(null);
  const searchRef = useRef(null);

  const { isLoaded, loadError: jsLoaderError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  useEffect(() => {
    if (jsLoaderError) {
      console.error("Google Maps API load error:", jsLoaderError);
      setLoadError(jsLoaderError.message || "Failed to load Google Maps API");
    }
  }, [jsLoaderError]);

  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        setAddress(place.formatted_address || place.name);
        setPlaceId(place.place_id);
        map?.panTo({ lat, lng });
        map?.setZoom(15);
      }
    }
  };

  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });

    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === "OK" && results[0]) {
            setAddress(results[0].formatted_address);
            setPlaceId(results[0].place_id);
          }
        },
      );
    }
  };

  const handleConfirm = () => {
    if (onConfirm && address) {
      onConfirm({
        address,
        placeId,
        latlng: markerPosition,
        latitude: markerPosition.lat,
        longitude: markerPosition.lng,
      });
    }
    onClose();
  };

  const renderError = (message) => (
    <div className="p-8 text-center">
      <div className="text-[var(--color-alert-warm)] text-lg font-medium mb-2">
        Location services unavailable
      </div>
      <p className="text-[var(--color-stroke-brand)] text-sm">{message}</p>
      <p className="text-[var(--color-stroke-brand)] text-sm mt-1">
        Please contact administrator.
      </p>
    </div>
  );

  if (!open) return null;

  if (!API_KEY) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
    return (
      <Modal open={open} onClose={onClose} width="max-w-2xl">
        {renderError("Google Maps API key is not configured.")}
      </Modal>
    );
  }

  if (loadError) {
    return (
      <Modal open={open} onClose={onClose} width="max-w-2xl">
        {renderError(loadError)}
      </Modal>
    );
  }

  if (!isLoaded) {
    return (
      <Modal open={open} onClose={onClose} width="max-w-2xl">
        <div className="p-8 text-center">
          <p className="text-[var(--color-stroke-brand)]">Loading Maps...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-2xl">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--color-neutral-primary)]">
          Select Location
        </h2>

        <div className="relative">
          <Autocomplete
            onLoad={(a) => setAutocomplete(a)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              ref={searchRef}
              type="text"
              placeholder="Search for an address or place..."
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-box-border)] text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] outline-none focus:border-[var(--info-panel-view-bg)] focus:shadow-[0_0_0_4px_var(--color-shadow-select)]"
            />
          </Autocomplete>
        </div>

        <div className="rounded-lg overflow-hidden border border-[var(--color-stroke-neutral)]">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={markerPosition}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
            />
          </GoogleMap>
        </div>

        {address && (
          <div className="text-sm text-[var(--color-stroke-brand)] space-y-1">
            <p>
              <span className="font-medium text-[var(--color-neutral-secondary)]">Address:</span>{" "}
              {address}
            </p>
            <p>
              <span className="font-medium text-[var(--color-neutral-secondary)]">Lat:</span>{" "}
              {markerPosition.lat.toFixed(6)},{" "}
              <span className="font-medium text-[var(--color-neutral-secondary)]">Lng:</span>{" "}
              {markerPosition.lng.toFixed(6)}
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-[var(--color-stroke-neutral)]">
          <Button variant="grayOutline" onClick={onClose} className="flex-1">
            CANCEL
          </Button>
          <Button
            variant={address ? "primary" : "disabledPrimary"}
            disabled={!address}
            onClick={handleConfirm}
            className="flex-1"
          >
            CONFIRM LOCATION
          </Button>
        </div>
      </div>
    </Modal>
  );
}

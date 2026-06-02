"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LocationPicker({
  open,
  onClose,
  onConfirm,
  initialLocation = null,
}) {
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [latitude, setLatitude] = useState(initialLocation?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(initialLocation?.longitude?.toString() || "");

  const handleConfirm = () => {
    if (onConfirm) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      onConfirm({
        address,
        placeId: "",
        latlng: { lat: isNaN(lat) ? 0 : lat, lng: isNaN(lng) ? 0 : lng },
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
      });
    }
    onClose();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} width="max-w-2xl">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--color-neutral-primary)]">
          Select Location
        </h2>

        <div>
          <label className="block text-sm font-medium text-[var(--color-neutral-secondary)] mb-1">
            Address
          </label>
          <Input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-neutral-secondary)] mb-1">
              Latitude
            </label>
            <Input
              type="text"
              placeholder="e.g. 40.7128"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-neutral-secondary)] mb-1">
              Longitude
            </label>
            <Input
              type="text"
              placeholder="e.g. -74.006"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>

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
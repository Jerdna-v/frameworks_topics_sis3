import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Default icon fix
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const redIcon = new L.Icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  iconSize: [25, 41],
  className: "machine-icon"
});

const blueIcon = new L.Icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  iconSize: [25, 41],
  className: "worker-icon",
  iconUrl: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0000FF"
});

const machines = [
  { id: 1, name: "Machine 1", position: [41.0315, 21.3347] },
  { id: 2, name: "Machine 2", position: [41.0297, 21.3410] },
  { id: 3, name: "Machine 3", position: [41.0333, 21.3300] },
  { id: 4, name: "Machine 4", position: [45.5481, 13.7302] },
  { id: 5, name: "Machine 5", position: [45.5470, 13.7315] },
  { id: 6, name: "Machine 6", position: [45.5490, 13.7290] }
];

function MapClickHandler({ onClick }) {
  useMapEvent("click", (e) => {
    onClick([e.latlng.lat, e.latlng.lng]);
  });
  return null;
}

function LocateUser({ setUserLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        map.setView([latitude, longitude], 14);
      },
      (err) => {
        console.error("Geolocation error:", err);
      }
    );
  }, [map, setUserLocation]);

  return null;
}

function Routing({ from, to }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !map) return;

    if (routingRef.current && map.hasLayer(routingRef.current)) {
      try {
        map.removeControl(routingRef.current);
      } catch (err) {
        console.warn("Could not remove routing control:", err);
      }
    }

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1"
      }),
      lineOptions: { styles: [{ color: "blue", weight: 4 }] },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true
    });

    control.addTo(map);
    routingRef.current = control;

    return () => {
      if (routingRef.current && map.hasLayer(routingRef.current)) {
        try {
          map.removeControl(routingRef.current);
        } catch (err) {
          console.warn("Cleanup error:", err);
        }
        routingRef.current = null;
      }
    };
  }, [from, to, map]);

  return null;
}

function AddMachinePopup({ location, onClose }) {
  const [form, setForm] = useState({
    mid: "",
    name: "",
    isStore: false,
    type: "",
    startDate: "",
    locationText: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMachine = {
      ...form,
      coordinates: form.isStore ? null : location,
      locationText: form.isStore ? "Store (no location)" : form.locationText
    };
    console.log("New Machine Data:", newMachine);
    onClose();
  };

  return (
    <div className="absolute bg-white p-4 border shadow rounded z-[1000] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <h3 className="font-bold mb-2">Add New Machine</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          name="mid"
          placeholder="Machine ID (optional)"
          value={form.mid}
          onChange={handleChange}
          className="border p-1 w-full"
        />
        <input
          type="text"
          name="name"
          placeholder="Machine Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border p-1 w-full"
        />
        <label className="block">
          <input
            type="checkbox"
            name="isStore"
            checked={form.isStore}
            onChange={handleChange}
          />
          <span className="ml-1">Store (no location)</span>
        </label>
        {!form.isStore && (
          <>
            <input
              type="text"
              name="locationText"
              placeholder="Location description (e.g., Main Street 12)"
              value={form.locationText}
              onChange={handleChange}
              className="border p-1 w-full"
            />
            <p className="text-sm text-gray-500">
              Coordinates: {location[0].toFixed(4)}, {location[1].toFixed(4)}
            </p>
          </>
        )}
        <input
          type="text"
          name="type"
          placeholder="Type of Machine"
          value={form.type}
          onChange={handleChange}
          className="border p-1 w-full"
        />
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="border p-1 w-full"
        />
        <div className="flex justify-end space-x-2">
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
            Add
          </button>
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function MapView() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [popupLocation, setPopupLocation] = useState(null);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Machine & Worker Map</h2>
      <MapContainer
        center={[41.0328, 21.3347]}
        zoom={6}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapClickHandler onClick={(coords) => setPopupLocation(coords)} />

        {machines.map((machine) => (
          <Marker
            key={machine.id}
            position={machine.position}
            icon={redIcon}
            eventHandlers={{
              click: () => setSelectedMachine(machine.position)
            }}
          >
            <Popup>
              {machine.name} <br /> ID: {machine.id}
            </Popup>
          </Marker>
        ))}

        <LocateUser setUserLocation={setUserLocation} />

        {userLocation && (
          <Marker position={userLocation} icon={blueIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {userLocation && selectedMachine && (
          <Routing from={userLocation} to={selectedMachine} />
        )}
      </MapContainer>

      {popupLocation && (
        <AddMachinePopup location={popupLocation} onClose={() => setPopupLocation(null)} />
      )}
    </div>
  );
}

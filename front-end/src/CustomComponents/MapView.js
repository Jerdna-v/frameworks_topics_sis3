import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import axios from "axios";
import { useSocket } from "../SocketContext";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const redIcon = new L.Icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  iconSize: [25, 41],
  className: "machine-icon",
});

const blueIcon = new L.Icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  iconSize: [25, 41],
});

function MapClickHandler({ onClick }) {
  useMapEvent("click", (e) => onClick([e.latlng.lat, e.latlng.lng]));
  return null;
}

function LocateUser({ setUserLocation }) {
  const map = useMap();

  React.useEffect(() => {
    if (!navigator.geolocation) return;
    let cancelled = false;

    const applyLocation = (lat, lng) => {
      if (cancelled) return;
      setUserLocation([lat, lng]);
      try {
        if (map && map._loaded && map._container) {
          map.setView([lat, lng], 14, { animate: false });
        }
      } catch (_) {}
    };

    const onSuccess = (pos) => {
      const { latitude, longitude } = pos.coords;
      if (!map) return;
      if (map._loaded) applyLocation(latitude, longitude);
      else map.whenReady(() => applyLocation(latitude, longitude));
    };

    const onError = () => {};

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    return () => {
      cancelled = true;
    };
  }, [map, setUserLocation]);

  return null;
}


function Routing({ from, to }) {
  const map = useMap();
  const ctrlRef = React.useRef(null);
  const [mapReady, setMapReady] = React.useState(false);

  React.useEffect(() => {
    if (!map) return;
    if (map._loaded) setMapReady(true);
    else map.whenReady(() => setMapReady(true));
  }, [map]);

  React.useEffect(() => {
    if (!mapReady || !map || ctrlRef.current) return;
    const ctrl = L.Routing.control({
      waypoints: [],
      router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
      lineOptions: { styles: [{ weight: 4 }] },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
    });
    const origClear = ctrl._clearLines?.bind(ctrl);
    ctrl._clearLines = function () { try { if (origClear) origClear(); } catch (e) {} };
    ctrl.on("routingerror", () => {});
    try { ctrl.addTo(map); } catch { return; }
    ctrlRef.current = ctrl;
    return () => {
      const c = ctrlRef.current;
      if (!c) return;
      try {
        const req = c._router?._request;
        if (req && typeof req.abort === "function") { try { req.abort(); } catch {} }
        c.remove();
      } catch {}
      ctrlRef.current = null;
    };
  }, [map, mapReady]);

  React.useEffect(() => {
    const c = ctrlRef.current;
    if (!c || !c._map) return;
    const req = c._router?._request;
    if (req && typeof req.abort === "function") { try { req.abort(); } catch {} }
    try {
      if (from && to) c.setWaypoints([L.latLng(from[0], from[1]), L.latLng(to[0], to[1])]);
      else c.setWaypoints([]);
    } catch {}
  }, [from?.[0], from?.[1], to?.[0], to?.[1], mapReady]);

  return null;
}

class AddMachinePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mid: "",
      name: "",
      isStore: false,
      type: "",
      useCurrent: true,
      startDateTime: "",
      locationText: "",
    };
  }

  QChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState({ [name]: type === "checkbox" ? checked : value });
  };

  QSubmit = async (e) => {
    e.preventDefault();
    const { location, onClose, onCreated } = this.props;
    const { mid, name, type, isStore, locationText, useCurrent, startDateTime } = this.state;
    try {
      const payload = {
        mid: mid ? Number(mid) : undefined,
        name,
        type: type || null,
        isStore,
        locationText,
        coordinates: isStore ? null : location,
        useCurrent: !!useCurrent,
        startDateTime: useCurrent ? null : startDateTime || null,
      };
      const res = await axios.post("/map/machines", payload);
      if (res.data?.success && res.data.machine) {
        onCreated(res.data.machine);
        onClose();
      } else {
        alert(res.data?.msg || "Failed to add machine");
      }
    } catch {
      alert("Failed to add machine");
    }
  };

  render() {
    const { onClose, location } = this.props;
    const { mid, name, isStore, type, useCurrent, startDateTime, locationText } = this.state;
    return (
      <div className="absolute bg-white p-4 border shadow rounded z-[1000] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h3 className="font-bold mb-2">Add New Machine</h3>
        <form onSubmit={this.QSubmit} className="space-y-2">
          <input type="text" name="mid" placeholder="Machine ID (optional)" value={mid} onChange={this.QChange} className="border p-1 w-full" />
          <input type="text" name="name" placeholder="Machine Name" value={name} onChange={this.QChange} required className="border p-1 w-full" />
          <label className="block">
            <input type="checkbox" name="isStore" checked={isStore} onChange={this.QChange} />
            <span className="ml-1">Store (no location)</span>
          </label>
          {!isStore && (
            <>
              <input type="text" name="locationText" placeholder="Location description" value={locationText} onChange={this.QChange} className="border p-1 w-full" />
              <p className="text-sm text-gray-500">Coordinates: {location[0].toFixed(5)}, {location[1].toFixed(5)}</p>
            </>
          )}
          <input type="text" name="type" placeholder="Type of Machine" value={type} onChange={this.QChange} className="border p-1 w-full" />
          <label className="block">
            <input type="checkbox" name="useCurrent" checked={useCurrent} onChange={this.QChange} />
            <span className="ml-1">Use current date & time</span>
          </label>
          <input type="datetime-local" name="startDateTime" value={startDateTime} onChange={this.QChange} disabled={useCurrent} className="border p-1 w-full" />
          <div className="flex justify-end space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    );
  }
}

class MapViewClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      machines: [],
      userLocation: null,
      popupLocation: null,
      selectedTargets: [],
      workerLocs: {},
    };
  }

  get isAdmin() {
    const t = this.props.user?.type;
    return t === "owner" || t === "manager";
  }

  async componentDidMount() {
    try {
      const res = await axios.get("/map/machines");
      if (res.data?.success) {
        this.setState({
          machines: (res.data.machines || []).filter((m) => m.latitude != null && m.longitude != null),
        });
      }
    } catch {}
    if (this.props.socket) {
      this.props.socket.on("user-location", this.QOnUserLoc);
    }
  }

  componentWillUnmount() {
    if (this.props.socket) {
      this.props.socket.off("user-location", this.QOnUserLoc);
    }
  }

  QOnUserLoc = (payload) => {
    if (!this.isAdmin) return;
    this.setState((prev) => ({
      workerLocs: {
        ...prev.workerLocs,
        [payload.uid]: { lat: payload.lat, lng: payload.lng, when: payload.when },
      },
    }));
  };

  QRequestAllWorkers = () => {
    if (!this.props.socket || !this.isAdmin) return;
    this.props.socket.emit("request-location-all");
  };

  QOnMachineClick = (m) => {
    if (m.latitude == null || m.longitude == null) return;
    const coord = [m.latitude, m.longitude];
    this.setState((prev) => {
      const exists = prev.selectedTargets.find(
        (p) => Math.abs(p[0] - coord[0]) < 1e-9 && Math.abs(p[1] - coord[1]) < 1e-9
      );
      return {
        selectedTargets: exists
          ? prev.selectedTargets.filter(
              (p) => !(Math.abs(p[0] - coord[0]) < 1e-9 && Math.abs(p[1] - coord[1]) < 1e-9)
            )
          : [...prev.selectedTargets, coord],
      };
    });
  };

  QAddCreatedMachine = (m) => {
    if (m.latitude == null || m.longitude == null) return;
    this.setState((prev) => ({ machines: [...prev.machines, m] }));
  };

  render() {
    const { QSetView } = this.props;
    const { machines, userLocation, popupLocation, selectedTargets, workerLocs } = this.state;

    return (
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <button className="btn btn-secondary" onClick={() => QSetView?.({ page: "home" })}>← Back</button>
          {this.isAdmin && (
            <button onClick={this.QRequestAllWorkers} className="btn btn-secondary" title="Ask all workers to report their current location">
              Refresh workers’ locations
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold mb-4">Machine & Worker Map</h2>

        <MapContainer center={[41.0328, 21.3347]} zoom={7} style={{ height: "600px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          <MapClickHandler onClick={(coords) => this.setState({ popupLocation: coords })} />
          {machines.map((m) => (
            <Marker key={m.mid} position={[m.latitude, m.longitude]} icon={redIcon} eventHandlers={{ click: () => this.QOnMachineClick(m) }}>
              <Popup>
                <div>
                  <div><b>{m.name || `Machine ${m.mid}`}</b></div>
                  <div>ID: {m.mid}</div>
                  <div>Type: {m.type || "-"}</div>
                  <div>{m.location || ""}</div>
                  {m.startDate && <div className="text-xs text-gray-500">Start: {String(m.startDate).replace("T", " ")}</div>}
                </div>
              </Popup>
            </Marker>
          ))}
          <LocateUser setUserLocation={(loc) => this.setState({ userLocation: loc })} />
          {userLocation && (
            <Marker position={userLocation} icon={blueIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          {this.isAdmin &&
            Object.entries(workerLocs).map(([uid, loc]) => (
              <Marker key={uid} position={[loc.lat, loc.lng]} icon={blueIcon}>
                <Popup>
                  Worker #{uid}
                  <br />
                  {new Date(loc.when).toLocaleString()}
                </Popup>
              </Marker>
            ))}
          {userLocation &&
            selectedTargets.map((to, idx) => (
              <Routing key={`${to[0]}-${to[1]}-${idx}`} from={userLocation} to={to} />
            ))}
        </MapContainer>

        {popupLocation && (
          <AddMachinePopup
            location={popupLocation}
            onClose={() => this.setState({ popupLocation: null })}
            onCreated={this.QAddCreatedMachine}
          />
        )}

        <div className="mt-3 text-sm text-gray-600">
          Tip: click a machine marker to toggle a driving route from your location. Click on the map to add a new machine.
        </div>
      </div>
    );
  }
}

export default function MapView(props) {
  const socket = useSocket();
  return <MapViewClass {...props} socket={socket} />;
}

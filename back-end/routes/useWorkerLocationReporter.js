import { useEffect } from "react";
import { useSocket } from "../SocketContext";

export default function useWorkerLocationReporter(user) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !user || user.type !== "worker") return;

    const onPing = async () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const payload = {
            uid: user.uid,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          socket.emit("worker-location", payload);
        },
        (err) => {
          console.warn("Geolocation denied/unavailable", err);
        },
        { enableHighAccuracy: false, maximumAge: 0, timeout: 10000 }
      );
    };

    socket.on("location-ping", onPing);
    return () => socket.off("location-ping", onPing);
  }, [socket, user]);
}

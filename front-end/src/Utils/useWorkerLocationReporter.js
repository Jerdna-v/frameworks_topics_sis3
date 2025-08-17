// useWorkerLocationReporter.js
import { useEffect } from "react";
import { useSocket } from "../SocketContext";

export default function useWorkerLocationReporter(user) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !user || user.type !== "worker") return;

    const handler = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          socket.emit("report-location", {
            uid: user.uid,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            when: new Date().toISOString(),
          });
        },
        (err) => {
          console.warn("worker geolocation error:", err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    socket.on("request-location", handler);
    return () => socket.off("request-location", handler);
  }, [socket, user]);
}

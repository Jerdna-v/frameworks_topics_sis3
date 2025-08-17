import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../SocketContext"; // adjust path if needed

export default function NotificationsView({ user }) {
  const [notifications, setNotifications] = useState([]);
  const socket = useSocket();

useEffect(() => {
  if (!socket || !user) return;

  // 🔔 Listen for new notifications
  socket.on("new-notification", (notif) => {
    if (user.role === "owner" || notif.receiver_id === user.uid) {
      alert("🔔 New Notification: " + notif.title);
      setNotifications((prev) => [notif, ...prev]);
    }
  });

  // ✅ Listen for marked-as-done updates
  socket.on("notification-done", (nid) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.nid === nid ? { ...n, is_done: true, done_at: new Date().toISOString() } : n
      )
    );
  });

  return () => {
    socket.off("new-notification");
    socket.off("notification-done");
  };
}, [socket, user]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await axios.get("/users/getNotifications", {
          params: user.role === "owner" ? {} : { wid: user.uid },
        });
        setNotifications(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch notifications.");
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [user]);

  const markAsDone = async (nid) => {
    try {
      await axios.post("/users/markNotificationDone", {
        nid,
        sender: user.uid,
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.nid === nid ? { ...n, is_done: true, done_at: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error("Error marking as done:", err);
    }
    if (socket) {
    socket.emit("mark-done", nid);
}
  };

  if (loading) return <p className="p-4">Loading notifications...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.nid}
              className={`border p-4 rounded shadow-sm ${n.urgent ? "border-red-500" : "border-gray-300"}`}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{n.title}</h3>
                  <p className="text-gray-700">{n.message}</p>
                  <p className="text-sm text-gray-500">Machine ID: {n.mid}</p>
                  {n.is_done && (
                    <p className="text-green-600 text-sm mt-1">Marked as done on {new Date(n.done_at).toLocaleString()}</p>
                  )}
                </div>
                {!n.is_done && user.role === "worker" && (
                  <button
                    onClick={() => markAsDone(n.nid)}
                    className="bg-green-600 text-white px-3 py-1 rounded h-fit"
                  >
                    Mark as Done
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

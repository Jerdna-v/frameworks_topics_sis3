import React, { Component } from "react";
import axios from "axios";
import { useSocket } from "../SocketContext";

class NotificationsViewClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      loading: true,
      error: "",
    };
  }

  isOwnerOrManager = () =>
    this.props.user?.type === "owner" || this.props.user?.type === "manager";

  normalizeToArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.notifications)) return raw.notifications;
    if (Array.isArray(raw?.rows)) return raw.rows;
    return [];
  };

  componentDidMount() {
    const { user, socket } = this.props;
    if (!user) {
      this.setState({ loading: false, notifications: [] });
    } else {
      const params = this.isOwnerOrManager() ? { all: 1 } : { uid: user.uid };
      axios
        .get("/notification", { params })
        .then((res) =>
          this.setState({
            notifications: this.normalizeToArray(res.data),
            loading: false,
          })
        )
        .catch(() =>
          this.setState({ error: "Failed to fetch notifications.", loading: false })
        );
    }

    if (socket && user) {
      this._onNewNotif = (notif) => {
        if (this.isOwnerOrManager() || notif.uid === user.uid) {
          this.setState((prev) => ({
            notifications: [notif, ...this.normalizeToArray(prev.notifications)],
          }));
        }
      };
      this._onDone = (nid) => {
        this.setState((prev) => ({
          notifications: this.normalizeToArray(prev.notifications).map((n) =>
            n.nid === nid ? { ...n, is_done: 1 } : n
          ),
        }));
      };
      socket.on("new-notification", this._onNewNotif);
      socket.on("notification-done", this._onDone);
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;
    if (socket) {
      if (this._onNewNotif) socket.off("new-notification", this._onNewNotif);
      if (this._onDone) socket.off("notification-done", this._onDone);
    }
  }

  markAsDone = async (nid) => {
    const { socket } = this.props;
    try {
      await axios.post("/notification/done", { nid });
      this.setState((prev) => ({
        notifications: this.normalizeToArray(prev.notifications).map((n) =>
          n.nid === nid ? { ...n, is_done: 1 } : n
        ),
      }));
      socket?.emit("mark-done", nid);
    } catch (err) {
      console.error("Error marking as done:", err);
    }
  };

  render() {
    const { QSetView, user } = this.props;
    const { notifications, loading, error } = this.state;
    const items = this.normalizeToArray(notifications);
    const isOwnerOrManager = this.isOwnerOrManager();

    if (!user) return <p className="p-4">Loading user...</p>;
    if (loading) return <p className="p-4">Loading notifications...</p>;
    if (error) return <p className="p-4 text-red-600">{error}</p>;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-3">
          <button
            onClick={() => QSetView?.({ page: "home" })}
            className="btn btn-secondary"
          >
            ← Back
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4">
          {isOwnerOrManager ? "All Notifications" : "Your Notifications"}
        </h2>

        {items.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((n) => (
              <li
                key={n.nid}
                className={`border p-4 rounded shadow-sm ${
                  n.urgent ? "border-red-500" : "border-gray-300"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{n.title}</h3>
                    <p className="text-gray-700">{n.message}</p>
                    {n.mid != null && (
                      <p className="text-sm text-gray-500">Machine ID: {n.mid}</p>
                    )}
                    {n.username && (
                      <p className="text-xs text-gray-500">To: {n.username}</p>
                    )}
                    {n.timestamp && (
                      <p className="text-xs text-gray-400">
                        Date and Time: {new Date(n.timestamp).toLocaleString()}
                      </p>
                    )}
                    {n.is_done ? (
                      <p className="text-green-600 text-sm mt-1">Done</p>
                    ) : null}
                  </div>

                  {!n.is_done &&
                    user?.type === "worker" &&
                    n.uid === user.uid && (
                      <button
                        onClick={() => this.markAsDone(n.nid)}
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
}

export default function NotificationsView(props) {
  const socket = useSocket();
  return <NotificationsViewClass {...props} socket={socket} />;
}

import React, { Component } from "react";
import axios from "axios";
import { useSocket } from "../SocketContext";

function toLocalDateTimeInputValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

class SendNotificationClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workers: [],
      selectedWorkerId: "",
      machineId: "",
      title: "",
      message: "",
      urgent: false,
      dateTime: toLocalDateTimeInputValue(),
      responseMsg: "",
    };
  }

  componentDidMount() {
    axios
      .get("/users/list")
      .then((res) => this.setState({ workers: res.data || [] }))
      .catch((err) => console.error("Failed to fetch users:", err));
  }

  QSetViewInParent = (obj) => {
    this.props.QSetView?.(obj);
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { selectedWorkerId, machineId, title, message, urgent, dateTime } = this.state;
    try {
      const ts = new Date(dateTime);
      const sqlTimestamp = new Date(ts.getTime() - ts.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const payload = {
        uid: Number(selectedWorkerId),
        mid: machineId ? Number(machineId) : null,
        title,
        message,
        urgent,
        timestamp: sqlTimestamp,
      };

      const res = await axios.post("/notification/send", payload);
      this.setState({ responseMsg: res.data.msg || "Notification sent." });

      this.props.socket?.emit("send-notification", {
        worker_id: Number(selectedWorkerId),
        uid: Number(selectedWorkerId),
        mid: payload.mid,
        title,
        message,
        urgent,
        timestamp: sqlTimestamp,
      });

      this.setState({
        selectedWorkerId: "",
        machineId: "",
        title: "",
        message: "",
        urgent: false,
        dateTime: toLocalDateTimeInputValue(),
      });
    } catch (err) {
      console.error(err);
      this.setState({
        responseMsg: err.response?.data?.msg || "Failed to send notification.",
      });
    }
  };

  render() {
    const {
      workers,
      selectedWorkerId,
      machineId,
      title,
      message,
      urgent,
      dateTime,
      responseMsg,
    } = this.state;

    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="mb-3">
          <button
            onClick={() => this.QSetViewInParent({ page: "home" })}
            className="btn btn-secondary"
          >
            ← Back
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Send Notification</h2>

        <form onSubmit={this.handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Select User</label>
            <select
              className="border p-2 w-full"
              value={selectedWorkerId}
              onChange={(e) => this.setState({ selectedWorkerId: e.target.value })}
              required
            >
              <option value="">-- Select User --</option>
              {workers.map((w) => (
                <option key={w.uid} value={w.uid}>
                  {w.name || w.username || `User ${w.uid}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Machine ID</label>
            <input
              type="number"
              className="border p-2 w-full"
              value={machineId}
              onChange={(e) => this.setState({ machineId: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block font-medium">Date & Time</label>
            <input
              type="datetime-local"
              className="border p-2 w-full"
              value={dateTime}
              onChange={(e) => this.setState({ dateTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Title</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={title}
              onChange={(e) => this.setState({ title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Message</label>
            <textarea
              className="border p-2 w-full"
              value={message}
              onChange={(e) => this.setState({ message: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="urgent"
              type="checkbox"
              checked={urgent}
              onChange={(e) => this.setState({ urgent: e.target.checked })}
            />
            <label htmlFor="urgent">Urgent</label>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Send Notification
          </button>
        </form>

        {responseMsg && (
          <p className="mt-4 text-green-700 font-medium">{responseMsg}</p>
        )}
      </div>
    );
  }
}

export default function SendNotification(props) {
  const socket = useSocket();
  return <SendNotificationClass {...props} socket={socket} />;
}

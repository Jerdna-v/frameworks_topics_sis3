import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../SocketContext";
export default function SendNotification() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const socket = useSocket();
  useEffect(() => {
    // Fetch list of workers from backend
    axios.get("/users/workers")
      .then((res) => setWorkers(res.data))
      .catch((err) => console.error("Failed to fetch workers:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        wid: selectedWorkerId,
        mid: parseInt(machineId),
        title,
        message,
        urgent
      };
      const res = await axios.post("/users/sendNotification", payload);
      
      setResponseMsg(res.data.msg || "Notification sent.");
      setSelectedWorkerId("");
      setMachineId("");
      setTitle("");
      setMessage("");
      setUrgent(false);
      socket.emit("send-notification", {
        worker_id: selectedWorkerId,   // Include this in your form
        title,
        message,
        mid: parseInt(machineId),
        urgent
      });
    } catch (err) {
      console.error(err);
      setResponseMsg(err.response?.data?.msg || "Failed to send notification.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Send Notification to Worker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Select Worker</label>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            required
            className="border p-2 w-full"
          >
            <option value="">-- Select Worker --</option>
            {workers.map((w) => (
              <option key={w.uid} value={w.uid}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Machine ID</label>
          <input
            type="number"
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Notification Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
          />
          <label>Urgent</label>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Send Notification
        </button>
      </form>

      {responseMsg && <p className="mt-4 text-green-700 font-medium">{responseMsg}</p>}
    </div>
  );
}

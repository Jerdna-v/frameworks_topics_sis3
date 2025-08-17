import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UsersRoleManagerView({ user }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role !== "owner") return;
    axios.get("/users/getAllUsers")
      .then(res => setUsers(res.data))
      .catch(() => setError("Failed to fetch users."));
  }, [user]);

  const toggleManager = async (uid, makeManager) => {
    try {
      await axios.post("/users/updateUserRole", {
        uid,
        role: makeManager ? "manager" : "worker"
      });
      setUsers(prev =>
        prev.map(u => (u.uid === uid ? { ...u, role: makeManager ? "manager" : "worker" } : u))
      );
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  if (user.role !== "owner") return <p className="p-4">Access Denied</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">User Role Manager</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Manager?</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.uid} className="text-center border">
              <td className="p-2 border">{u.username}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">
                <input
                  type="checkbox"
                  checked={u.role === "manager"}
                  onChange={(e) => toggleManager(u.uid, e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

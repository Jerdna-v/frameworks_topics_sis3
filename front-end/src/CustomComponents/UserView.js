import React from "react";
import axios from "axios";

class UsersManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      original: [],
      error: "",
      saving: {}
    };
  }

  componentDidMount() {
    axios
      .get("/admin/users", { withCredentials: true })
      .then((res) => {
        const data = res.data || [];
        this.setState({ rows: data, original: data });
      })
      .catch(() => this.setState({ error: "Failed to fetch users." }));
  }

  QSetViewInParent = (obj) => {
    if (this.props.QSetView) this.props.QSetView(obj);
  };

  QUpdateField = (uid, field, value) => {
    this.setState((prev) => ({
      rows: prev.rows.map((r) => (r.uid === uid ? { ...r, [field]: value } : r))
    }));
  };

  QResetRow = (uid) => {
    const snap = this.state.original.find((r) => r.uid === uid);
    if (!snap) return;
    this.setState((prev) => ({
      rows: prev.rows.map((r) => (r.uid === uid ? { ...snap } : r))
    }));
  };

  QSaveRow = async (u) => {
    this.setState((prev) => ({ saving: { ...prev.saving, [u.uid]: true } }));
    try {
      await axios.put(
        `/admin/users/${u.uid}`,
        {
          username: u.username,
          name: u.name,
          phone_number: u.phone_number,
          type: u.type
        },
        { withCredentials: true }
      );
      this.setState((prev) => ({
        original: prev.original.map((r) => (r.uid === u.uid ? { ...u } : r))
      }));
    } catch {
      alert("Failed to save user");
    } finally {
      this.setState((prev) => ({ saving: { ...prev.saving, [u.uid]: false } }));
    }
  };

  render() {
    const { rows, error, saving } = this.state;

    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-3">
          <button
            onClick={() => this.QSetViewInParent({ page: "home" })}
            className="btn btn-secondary"
          >
            ← Back
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Users</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">UID</th>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.uid} className="border">
                <td className="p-2 border text-center">{u.uid}</td>
                <td className="p-2 border">
                  <input
                    className="border p-1 w-full"
                    value={u.username || ""}
                    onChange={(e) => this.QUpdateField(u.uid, "username", e.target.value)}
                  />
                </td>
                <td className="p-2 border">
                  <input
                    className="border p-1 w-full"
                    value={u.name || ""}
                    onChange={(e) => this.QUpdateField(u.uid, "name", e.target.value)}
                  />
                </td>
                <td className="p-2 border">
                  <input
                    className="border p-1 w-full"
                    value={u.phone_number || ""}
                    onChange={(e) => this.QUpdateField(u.uid, "phone_number", e.target.value)}
                  />
                </td>
                <td className="p-2 border">
                  <select
                    className="border p-1 w-full"
                    value={u.type || "worker"}
                    onChange={(e) => this.QUpdateField(u.uid, "type", e.target.value)}
                  >
                    <option value="owner">owner</option>
                    <option value="manager">manager</option>
                    <option value="worker">worker</option>
                  </select>
                </td>
                <td className="p-2 border text-center">
                  <button
                    className="btn btn-primary"
                    onClick={() => this.QSaveRow(u)}
                    disabled={!!saving[u.uid]}
                  >
                    {saving[u.uid] ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="btn btn-secondary ms-2"
                    onClick={() => this.QResetRow(u.uid)}
                    disabled={!!saving[u.uid]}
                  >
                    Reset
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-center" colSpan={6}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default UsersManager;

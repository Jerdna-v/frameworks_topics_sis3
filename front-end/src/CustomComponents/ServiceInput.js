import React from "react";
import axios from "axios";

class ServiceInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      useNow: false,
      date: "",
      time: "",
      mid: "",
      description: "",
      message: "",
      machineCheck: null, // { valid: true/false, name: "machine name" }
    };
  }

  QSetViewInParent = (obj) => {
    if (this.props.QSetView) this.props.QSetView(obj);
  };

  QHandleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ message: "" });

    const { useNow, date, time, mid, description } = this.state;

    if (!useNow && (!date || !time)) {
      this.setState({
        message: "Please provide both date and time, or enable 'Use current time'.",
      });
      return;
    }
    const desc = String(description || "").trim();
    if (!desc) {
      this.setState({ message: "Please enter what was fixed/changed (description)." });
      return;
    }
    if (!mid) {
      this.setState({ message: "Machine ID is required." });
      return;
    }

    try {
      const payload = {
        current: useNow,
        date,
        time,
        mid: parseInt(mid, 10),
        description: desc,
      };
      const res = await axios.post("/service", payload);
      this.setState({ message: res.data?.msg || "Service entry saved." });
    } catch (err) {
      this.setState({
        message: err.response?.data?.msg || "Submission failed.",
      });
    }
  };

  // ✅ use new /machines/:mid/check route
  QCheckMachine = async (mid) => {
    if (!mid) {
      this.setState({ machineCheck: null });
      return;
    }
    try {
      const res = await axios.get(`/machines/${mid}/check`);
      if (res.data && res.data.exists) {
        this.setState({ machineCheck: { valid: true, name: res.data.name } });
      } else {
        this.setState({ machineCheck: { valid: false } });
      }
    } catch {
      this.setState({ machineCheck: { valid: false } });
    }
  };

  render() {
    const { useNow, date, time, mid, description, message, machineCheck } = this.state;

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <button
            className="btn btn-secondary"
            onClick={() => this.QSetViewInParent({ page: "home" })}
          >
            ← Back
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Service Entry</h2>

        <form onSubmit={this.QHandleSubmit} className="space-y-4">
          {/* Current time checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="useNow"
              type="checkbox"
              checked={useNow}
              onChange={(e) => this.setState({ useNow: e.target.checked })}
            />
            <label htmlFor="useNow" className="font-medium">
              Use current date & time
            </label>
          </div>

          {/* Date & time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => this.setState({ date: e.target.value })}
                disabled={useNow}
                required={!useNow}
                className="border p-2 w-full"
              />
            </div>
            <div>
              <label className="block font-medium">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => this.setState({ time: e.target.value })}
                disabled={useNow}
                required={!useNow}
                className="border p-2 w-full"
              />
            </div>
          </div>

          {/* Machine ID with validation */}
          <div>
            <label className="block font-medium">Machine ID</label>
            <input
              type="number"
              value={mid}
              onChange={(e) => {
                const val = e.target.value;
                this.setState({ mid: val });
                this.QCheckMachine(val);
              }}
              required
              className="border p-2 w-full"
            />
            {machineCheck && (
              <p
                className={`mt-1 ${
                  machineCheck.valid ? "text-green-600" : "text-red-600"
                }`}
              >
                {machineCheck.valid
                  ? `✓ Machine: ${machineCheck.name}`
                  : "✗ Invalid machine ID"}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium">What was serviced</label>
            <textarea
              placeholder="Describe what you changed/fixed (e.g., replaced coin mech, cleaned sensors, updated firmware)"
              value={description}
              onChange={(e) => this.setState({ description: e.target.value })}
              required
              rows={4}
              className="border p-2 w-full"
            />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Submit
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-700 font-medium">{message}</p>
        )}
      </div>
    );
  }
}

export default ServiceInput;

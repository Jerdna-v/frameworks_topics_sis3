import React from "react";
import axios from "axios";

class CashFlowInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      useNow: false,
      date: "",
      time: "",
      mid: "",
      rows: [{ cashtype: "", amount: "", description: "" }],
      message: "",
      machineCheck: null, // { valid: bool, name?: string }
    };
  }

  QSetViewInParent = (obj) => {
    if (this.props.QSetView) this.props.QSetView(obj);
  };

  // --- validate machine id ---
  QCheckMachine = async (mid) => {
    if (!mid) {
      this.setState({ machineCheck: null });
      return;
    }
    try {
      const res = await axios.get(`/machines/${mid}/check`);
      if (res.data && res.data.exists) {
        this.setState({
          machineCheck: { valid: true, name: res.data.name || "(no name)" },
        });
      } else {
        this.setState({ machineCheck: { valid: false } });
      }
    } catch {
      this.setState({ machineCheck: { valid: false } });
    }
  };

  QHandleRowChange = (index, field, value) => {
    const updated = [...this.state.rows];
    updated[index][field] = value;
    this.setState({ rows: updated });
  };

  QAddRow = () => {
    this.setState((prev) => ({
      rows: [...prev.rows, { cashtype: "", amount: "", description: "" }],
    }));
  };

  QRemoveRow = (index) => {
    this.setState((prev) => ({
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  };

  QHandleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ message: "" });
    const { useNow, date, time, mid, rows } = this.state;

    if (!useNow && (!date || !time)) {
      this.setState({
        message:
          "Please provide both date and time, or enable 'Use current time'.",
      });
      return;
    }

    try {
      const payload = {
        current: useNow,
        date,
        time,
        mid: parseInt(mid, 10),
        items: rows.map((r) => ({
          cashtype: r.cashtype,
          amount: Number(r.amount),
          description: r.description?.trim() || null,
        })),
      };

      const res = await axios.post("/cashflow/bulk", payload);
      this.setState({ message: res.data?.msg || "Cash flow saved." });
    } catch (err) {
      this.setState({
        message: err.response?.data?.msg || "Submission failed.",
      });
    }
  };

  render() {
    const { useNow, date, time, mid, rows, message, machineCheck } = this.state;

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded"
            onClick={() => this.QSetViewInParent({ page: "home" })}
          >
            ← Back
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Cash Flow Input</h2>

        <form onSubmit={this.QHandleSubmit} className="space-y-4">
          {/* Current time */}
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

          {/* Machine ID with check */}
          <div>
            <label className="block font-medium">Machine ID</label>
            <input
              type="number"
              value={mid}
              onChange={(e) => {
                const val = e.target.value;
                this.setState({ mid: val }, () => this.QCheckMachine(val));
              }}
              required
              className="border p-2 w-full"
            />
            {machineCheck && (
              <p
                className={`mt-1 text-sm ${
                  machineCheck.valid ? "text-green-600" : "text-red-600"
                }`}
              >
                {machineCheck.valid
                  ? `✔ Machine: ${machineCheck.name}`
                  : "✖ Invalid machine ID"}
              </p>
            )}
          </div>

          {/* Cash items */}
          <div>
            <label className="block font-medium">Cash Items</label>
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Cashflow Type (e.g., refill, service, rent)"
                  value={r.cashtype}
                  onChange={(e) =>
                    this.QHandleRowChange(i, "cashtype", e.target.value)
                  }
                  required
                  className="border p-2 flex-1"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={r.amount}
                  onChange={(e) =>
                    this.QHandleRowChange(i, "amount", e.target.value)
                  }
                  required
                  className="border p-2 w-28"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={r.description}
                  onChange={(e) =>
                    this.QHandleRowChange(i, "description", e.target.value)
                  }
                  className="border p-2 flex-[1.2]"
                />
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => this.QRemoveRow(i)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={this.QAddRow}
              className="text-blue-500 mt-2"
            >
              + Add Another Item
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>

        {message && <p className="mt-4 text-green-700 font-medium">{message}</p>}
      </div>
    );
  }
}

export default CashFlowInput;

import React from "react";
import axios from "axios";

class PriceMappingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mid: "",
      machineCheck: null,
      selections: [],
      priceGroups: [5, 10, 15, 20, 25, 30, 35, 40, 45],
      mapping: {}, // { selectionNumber: price_group }
      message: "",
    };
  }

  QSetViewInParent = (obj) => {
    if (this.props.QSetView) this.props.QSetView(obj);
  };

  // -----------------------------------------------------------
  // CHECK MACHINE → THEN LOAD SELECTIONS + PRICE MAPPING
  // -----------------------------------------------------------
  QCheckMachine = async (mid) => {
    if (!mid) {
      this.setState({ machineCheck: null, selections: [], mapping: {} });
      return;
    }

    try {
      const res = await axios.get(`/machines/${mid}/check`);
      if (res.data?.exists) {
        this.setState({
          machineCheck: { valid: true, name: res.data.name || "(no name)" },
        });

        await this.LoadSelections(mid);
        await this.LoadMapping(mid);

      } else {
        this.setState({
          machineCheck: { valid: false },
          selections: [],
          mapping: {},
        });
      }
    } catch (err) {
      this.setState({
        machineCheck: { valid: false },
        selections: [],
        mapping: {},
      });
    }
  };

  // -----------------------------------------------------------
  // LOAD UNIQUE SELECTIONS
  // -----------------------------------------------------------
  LoadSelections = async (mid) => {
    try {
      const res = await axios.get(`/prices/selections/${mid}`);
      this.setState({ selections: res.data?.selections || [] });
    } catch {
      this.setState({ selections: [] });
    }
  };

  // -----------------------------------------------------------
  // LOAD EXISTING PRICE MAPPING
  // -----------------------------------------------------------
  LoadMapping = async (mid) => {
    try {
      const res = await axios.get(`/prices/mapping/${mid}`);
      if (Array.isArray(res.data?.mapping)) {
        const map = {};
        res.data.mapping.forEach((row) => {
          map[row.selection] = row.price_group;
        });
        this.setState({ mapping: map });
      }
    } catch {
      this.setState({ mapping: {} });
    }
  };

  // -----------------------------------------------------------
  // UPDATE MAPPING
  // -----------------------------------------------------------
  SetPrice = (selection, price_group) => {
    this.setState((prev) => ({
      mapping: { ...prev.mapping, [selection]: price_group },
    }));
  };

  // -----------------------------------------------------------
  // SAVE TO DB
  // -----------------------------------------------------------
  QHandleSubmit = async (e) => {
    e.preventDefault();
    const { mid, mapping } = this.state;

    if (!mid) {
      this.setState({ message: "Machine ID is required." });
      return;
    }

    const payload = {
      mid: parseInt(mid, 10),
      links: Object.entries(mapping).map(([sel, price]) => ({
        selection: sel.toString(),
        price_group: price.toString(),
      })),
    };

    try {
      const res = await axios.post("/prices/save", payload);
      this.setState({ message: res.data?.msg || "Prices saved." });
    } catch (err) {
      this.setState({
        message: err.response?.data?.msg || "Saving failed.",
      });
    }
  };

  render() {
    const { mid, machineCheck, selections, priceGroups, mapping, message } =
      this.state;

    return (
      <div className="p-6 max-w-3xl mx-auto">

        {/* Back Button */}
        <div className="mb-4">
          <button
            className="btn btn-secondary"
            onClick={() => this.QSetViewInParent({ page: "home" })}
          >
            ← Back
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Price Mapping for Selections</h2>

        {/* Machine ID */}
        <div className="mb-4">
          <label className="block font-medium">Machine ID</label>
          <input
            type="number"
            value={mid}
            onChange={(e) => {
              const val = e.target.value;
              this.setState({ mid: val }, () => this.QCheckMachine(val));
            }}
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

        {/* Selections */}
        {machineCheck?.valid && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Selections</h3>

            {selections.length === 0 && (
              <p className="text-red-600">
                This machine does not have any selections.
              </p>
            )}

            {selections.length > 0 && (
              <form onSubmit={this.QHandleSubmit} className="space-y-4">

                {selections.map((sel) => (
                  <div
                    key={sel}
                    className="p-3 border rounded flex items-center justify-between"
                  >
                    <span className="font-medium">Selection {sel}</span>

                    <select
                      className="border p-2"
                      value={mapping[sel] || ""}
                      onChange={(e) =>
                        this.SetPrice(sel, e.target.value)
                      }
                    >
                      <option value="">Choose price</option>
                      {priceGroups.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save Prices
                </button>
              </form>
            )}
          </div>
        )}

        {message && (
          <p className="mt-4 text-green-700 font-medium">{message}</p>
        )}
      </div>
    );
  }
}

export default PriceMappingPage;

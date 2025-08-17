import React from "react";
import axios from "axios";

class InventoryInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      useNow: false,
      date: "",
      time: "",
      mid: "",
      products: [{ product_type: "", grams: "" }],
      message: ""
    };
  }

  QSetViewInParent = (obj) => {
    if (this.props.QSetView) this.props.QSetView(obj);
  };

  QHandleProductChange = (index, field, value) => {
    const updated = [...this.state.products];
    updated[index][field] = value;
    this.setState({ products: updated });
  };

  QAddProductField = () => {
    this.setState((prev) => ({
      products: [...prev.products, { product_type: "", grams: "" }]
    }));
  };

  QRemoveProductField = (index) => {
    this.setState((prev) => ({
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  QHandleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ message: "" });
    const { useNow, date, time, mid, products } = this.state;

    if (!useNow && (!date || !time)) {
      this.setState({
        message: "Please provide both date and time, or enable 'Use current time'."
      });
      return;
    }

    try {
      const payload = {
        current: useNow,
        date,
        time,
        mid: parseInt(mid, 10),
        products: products.map((p) => ({
          product_type: p.product_type,
          grams: parseFloat(p.grams)
        }))
      };

      const res = await axios.post("/inventory", payload);
      this.setState({ message: res.data?.msg || "Inventory saved." });
    } catch (err) {
      this.setState({
        message: err.response?.data?.msg || "Submission failed."
      });
    }
  };

  render() {
    const { useNow, date, time, mid, products, message } = this.state;

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

        <h2 className="text-xl font-bold mb-4">Inventory Input</h2>

        <form onSubmit={this.QHandleSubmit} className="space-y-4">
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

          <div>
            <label className="block font-medium">Machine ID</label>
            <input
              type="number"
              value={mid}
              onChange={(e) => this.setState({ mid: e.target.value })}
              required
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block font-medium">Products</label>
            {products.map((p, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Product Type"
                  value={p.product_type}
                  onChange={(e) =>
                    this.QHandleProductChange(i, "product_type", e.target.value)
                  }
                  required
                  className="border p-2 flex-1"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Grams"
                  value={p.grams}
                  onChange={(e) =>
                    this.QHandleProductChange(i, "grams", e.target.value)
                  }
                  required
                  className="border p-2 w-28"
                />
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => this.QRemoveProductField(i)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={this.QAddProductField}
              className="text-blue-500 mt-2"
            >
              + Add Another Product
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

export default InventoryInput;

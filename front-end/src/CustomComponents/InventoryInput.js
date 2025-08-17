import React, { useState } from "react";
import axios from "axios";

export default function InventoryInput() {
  const [date, setDate] = useState("");
  const [mid, setMid] = useState("");
  const [products, setProducts] = useState([{ product_type: "", grams: "" }]);
  const [message, setMessage] = useState("");

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProductField = () => {
    setProducts([...products, { product_type: "", grams: "" }]);
  };

  const removeProductField = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date,
        mid: parseInt(mid),
        products: products.map((p) => ({
          product_type: p.product_type,
          grams: parseFloat(p.grams)
        }))
      };
      const res = await axios.post("/api/inventory", payload);
      setMessage(res.data.msg);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.msg || "Submission failed.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Inventory Input</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Machine ID</label>
          <input
            type="number"
            value={mid}
            onChange={(e) => setMid(e.target.value)}
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
                onChange={(e) => handleProductChange(i, "product_type", e.target.value)}
                required
                className="border p-2 flex-1"
              />
              <input
                type="number"
                placeholder="Grams"
                value={p.grams}
                onChange={(e) => handleProductChange(i, "grams", e.target.value)}
                required
                className="border p-2 w-28"
              />
              {products.length > 1 && (
                <button type="button" onClick={() => removeProductField(i)} className="text-red-500">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addProductField} className="text-blue-500 mt-2">+ Add Another Product</button>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>

      {message && <p className="mt-4 text-green-700 font-medium">{message}</p>}
    </div>
  );
}

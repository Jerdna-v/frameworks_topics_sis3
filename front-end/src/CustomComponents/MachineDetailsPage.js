import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

export default function MachineDetailsPage() {
  const { mid } = useParams();
  const [data, setData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, bands, mech, failures, product, totals, cashflow, selections, ml] = await Promise.all([
          axios.get(`${API_URL}/machines/${mid}/info?date=${date}`),
          axios.get(`${API_URL}/machines/${mid}/bands?date=${date}`),
          axios.get(`${API_URL}/machines/${mid}/mech?date=${date}`),
          axios.get(`${API_URL}/machines/${mid}/failures?date=${date}`),
          axios.get(`${API_URL}/machines/${mid}/product?date=${date}`),
          axios.get(`${API_URL}/machines/${mid}/totals?date=${date}`),
          axios.get(`${API_URL}/machines/${mid}/cashflow?date=${date}`),
          axios.get(`${API_URL}/machines/${mid}/selections?date=${date}`),
          axios.get(`${API_URL}/machines/${mid}/predict-refill?date=${date}`)
        ]);

        setData({
          info: info.data,
          bands: bands.data,
          mech: mech.data,
          failures: failures.data,
          product: product.data,
          totals: totals.data,
          cashflow: cashflow.data,
          selections: selections.data,
          ml: ml.data
        });
      } catch (error) {
        console.error("Failed to fetch machine details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mid, date]);

  if (loading) return <p className="p-4">Loading machine details...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Machine: {data.info?.name || mid}</h1>
      <div className="mb-4">
        <label className="font-semibold mr-2">Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-1 rounded"
        />
      </div>

      {[
        "info",
        "bands",
        "mech",
        "failures",
        "product",
        "totals",
        "cashflow",
        "selections",
        "ml"
      ].map((key) => (
        <section key={key} className="mb-6">
          <h2 className="text-xl font-bold mb-2 capitalize">{key}</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(data[key], null, 2)}
          </pre>
        </section>
      ))}
    </div>
  );
}

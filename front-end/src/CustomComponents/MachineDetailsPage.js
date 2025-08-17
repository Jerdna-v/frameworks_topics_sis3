import React, { Component } from "react";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleString();
}
function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function weekAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}
function buildTotals(rows, { amountKey, dateKey = "date_time" }) {
  const map = new Map();
  (rows || []).forEach((r) => {
    const t = r[dateKey];
    const v = Number(r[amountKey] ?? 0);
    if (!t) return;
    map.set(t, (map.get(t) || 0) + (isNaN(v) ? 0 : v));
  });
  const out = Array.from(map.entries()).map(([date_time, total]) => ({ date_time, total }));
  out.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  return out;
}
function cumulizeTotals(rows) {
  let acc = 0;
  return (rows || []).map((r) => {
    const v = Number(r.total ?? 0);
    acc += isNaN(v) ? 0 : v;
    return { date_time: r.date_time, total: acc };
  });
}
function Card({ title, right, children }) {
  return (
    <div className="border rounded shadow-sm p-3 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}
function DataTable({ rows, columns, emptyText = "No data." }) {
  if (!rows || rows.length === 0) return <div className="text-sm text-gray-500">{emptyText}</div>;
  return (
    <div className="overflow-auto" style={{ maxHeight: 320 }}>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((c) => (
              <th key={c.key} className="p-2 border text-left">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border">
              {columns.map((c) => (
                <td key={c.key} className="p-2 border">
                  {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function SectionToggle({ title, checked, onToggle, table, chart }) {
  return (
    <Card
      title={title}
      right={
        <label className="text-sm d-flex align-items-center gap-2">
          <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} style={{ marginRight: 6 }} />
          Show as graph
        </label>
      }
    >
      {checked ? <div style={{ height: 320, width: "100%" }}>{chart}</div> : table}
    </Card>
  );
}
function OneLineChart({ data }) {
  if (!data || data.length === 0) return <div className="text-sm text-gray-500 p-2">No data for this range.</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date_time" tickFormatter={fmtDate} />
        <YAxis />
        <Tooltip labelFormatter={(l) => fmtDate(l)} />
        <Line type="monotone" dataKey="total" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

class MachineDetailsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start: weekAgo(),
      end: today(),
      info: null,
      edit: null,
      saving: false,
      product: [],
      cashflow: [],
      selections: [],
      bands: [],
      mech: [],
      failures: [],
      totals: [],
      loading: true,
      showGraph: {
        product: false,
        cashflow: false,
        selections: false,
        bands: false,
        mech: false,
        failures: false,
        totals: false
      }
    };
  }

  componentDidMount() {
    if (this.mid()) this.loadAll();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.mid() && (prevState.start !== this.state.start || prevState.end !== this.state.end)) {
      this.loadAll();
    }
    if (prevProps.mid !== this.props.mid && this.mid()) {
      this.loadAll();
    }
  }

  mid() {
    return this.props.mid ?? null;
  }

  async loadAll() {
    this.setState({ loading: true });
    try {
      const { start, end } = this.state;
      const params = { start, end };
      const mid = this.mid();
      const [infoRes, prodRes, cashRes, selRes, bandRes, mechRes, failRes, totRes] = await Promise.all([
        axios.get(`${API_URL}/machines/${mid}/info`),
        axios.get(`${API_URL}/machines/${mid}/product`, { params }),
        axios.get(`${API_URL}/machines/${mid}/cashflow`, { params }),
        axios.get(`${API_URL}/machines/${mid}/selections`, { params }),
        axios.get(`${API_URL}/machines/${mid}/bands`, { params }),
        axios.get(`${API_URL}/machines/${mid}/mech`, { params }),
        axios.get(`${API_URL}/machines/${mid}/failures`, { params }),
        axios.get(`${API_URL}/machines/${mid}/totals`, { params })
      ]);
      const infoData = infoRes.data || null;
      this.setState({
        info: infoData,
        edit: infoData,
        product: prodRes.data || [],
        cashflow: cashRes.data || [],
        selections: selRes.data || [],
        bands: bandRes.data || [],
        mech: mechRes.data || [],
        failures: failRes.data || [],
        totals: totRes.data || [],
        loading: false
      });
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
    }
  }

  async saveInfo() {
    const { edit } = this.state;
    if (!edit) return;
    this.setState({ saving: true });
    try {
      const mid = this.mid();
      const payload = {
        name: edit.name ?? null,
        type: edit.type ?? null,
        location: edit.location ?? null,
        startDate: edit.startDate ?? null,
        latitude: edit.latitude ?? null,
        longitude: edit.longitude ?? null
      };
      const res = await axios.put(`${API_URL}/machines/${mid}`, payload, { withCredentials: true });
      if (!res.data?.success) alert(res.data?.msg || "Failed to save");
      else this.setState({ info: { ...edit } });
    } catch {
      alert("Failed to save");
    } finally {
      this.setState({ saving: false });
    }
  }

  setEditField(key, val) {
    this.setState((s) => ({ edit: { ...s.edit, [key]: val } }));
  }

  setRange(key, val) {
    this.setState({ [key]: val });
  }

  toggleGraph(key, val) {
    this.setState((s) => ({ showGraph: { ...s.showGraph, [key]: val } }));
  }

  buildCumulative(data, amountKey) {
    const totals = buildTotals(data, { amountKey, dateKey: "date_time" });
    return cumulizeTotals(totals);
  }

  render() {
    const mid = this.mid();
    if (!mid) return <div className="p-6">No machine selected.</div>;

    const {
      start, end, info, edit, saving, product, cashflow, selections, bands, mech, failures, totals, loading, showGraph
    } = this.state;

    const productCum = this.buildCumulative(product, "product_amount");
    const cashflowCum = this.buildCumulative(cashflow, "cash_amount");
    const selectionsCum = this.buildCumulative(selections, "amount");
    const bandsCum = this.buildCumulative(bands, "amount");
    const mechCum = this.buildCumulative(mech, "amount");
    const failuresCum = this.buildCumulative(failures, "amount");
    const totalsCum = this.buildCumulative(totals, "amount");

    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button className="btn btn-secondary" onClick={() => this.props.QSetView?.({ page: "machines" })}>← Back</button>
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-sm font-medium">Start</label>
              <input type="date" className="border p-1 rounded" value={start} onChange={(e) => this.setRange("start", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">End</label>
              <input type="date" className="border p-1 rounded" value={end} onChange={(e) => this.setRange("end", e.target.value)} />
            </div>
          </div>
        </div>

        <Card
          title={`Machine #${mid} Details`}
          right={
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => this.saveInfo()} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          }
        >
          {loading && !info ? (
            <div>Loading…</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm">Name</label>
                <input className="border p-2 w-full rounded" value={edit?.name || ""} onChange={(e) => this.setEditField("name", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Type</label>
                <input className="border p-2 w-full rounded" value={edit?.type || ""} onChange={(e) => this.setEditField("type", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Location</label>
                <input className="border p-2 w-full rounded" value={edit?.location || ""} onChange={(e) => this.setEditField("location", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Start Date</label>
                <input type="date" className="border p-2 w-full rounded" value={edit?.startDate ? String(edit.startDate).slice(0, 10) : ""} onChange={(e) => this.setEditField("startDate", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Latitude</label>
                <input className="border p-2 w-full rounded" value={edit?.latitude ?? ""} onChange={(e) => this.setEditField("latitude", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Longitude</label>
                <input className="border p-2 w-full rounded" value={edit?.longitude ?? ""} onChange={(e) => this.setEditField("longitude", e.target.value)} />
              </div>
            </div>
          )}
        </Card>

        <SectionToggle
          title="Product (grams)"
          checked={showGraph.product}
          onToggle={(v) => this.toggleGraph("product", v)}
          table={
            <DataTable
              rows={product}
              columns={[
                { key: "date_time", label: "Date/Time", render: (v) => fmtDate(v) },
                { key: "product_type", label: "Type" },
                { key: "product_amount", label: "Grams" }
              ]}
            />
          }
          chart={<OneLineChart data={productCum} />}
        />

        <SectionToggle
          title="Cash Flow (amount)"
          checked={showGraph.cashflow}
          onToggle={(v) => this.toggleGraph("cashflow", v)}
          table={
            <DataTable
              rows={cashflow}
              columns={[
                { key: "date_time", label: "Date/Time", render: (v) => fmtDate(v) },
                { key: "cashflow_type", label: "Type" },
                { key: "cash_amount", label: "Amount" },
                { key: "description", label: "Description" }
              ]}
            />
          }
          chart={<OneLineChart data={cashflowCum} />}
        />

        <SectionToggle
          title="Selections (total)"
          checked={showGraph.selections}
          onToggle={(v) => this.toggleGraph("selections", v)}
          table={
            <DataTable
              rows={selections}
              columns={[
                { key: "date_time", label: "Date/Time", render: (v) => fmtDate(v) },
                { key: "type", label: "Type" },
                { key: "amount", label: "Amount" }
              ]}
            />
          }
          chart={<OneLineChart data={selectionsCum} />}
        />

        <SectionToggle
          title="Price Bands (total)"
          checked={showGraph.bands}
          onToggle={(v) => this.toggleGraph("bands", v)}
          table={
            <DataTable
              rows={bands}
              columns={[
                { key: "date_time", label: "Date/Time", render: (v) => fmtDate(v) },
                { key: "type", label: "Type" },
                { key: "amount", label: "Amount" }
              ]}
            />
          }
          chart={<OneLineChart data={bandsCum} />}
        />

        <SectionToggle
          title="Coin Mech Data (total)"
          checked={showGraph.mech}
          onToggle={(v) => this.toggleGraph("mech", v)}
          table={
            <DataTable
              rows={mech}
              columns={[
                { key: "date_time", label: "Date/Time", render: (v) => fmtDate(v) },
                { key: "type", label: "Type" },
                { key: "amount", label: "Amount" }
              ]}
            />
          }
          chart={<OneLineChart data={mechCum} />}
        />

        <SectionToggle
          title="Failures (total)"
          checked={showGraph.failures}
          onToggle={(v) => this.toggleGraph("failures", v)}
          table={
            <DataTable
              rows={failures}
              columns={[
                { key: "date_time", label: "Date/Time", render: (v) => fmtDate(v) },
                { key: "type", label: "Type" },
                { key: "amount", label: "Amount" }
              ]}
            />
          }
          chart={<OneLineChart data={failuresCum} />}
        />

        <SectionToggle
          title="Report Totals (total)"
          checked={showGraph.totals}
          onToggle={(v) => this.toggleGraph("totals", v)}
          table={
            <DataTable
              rows={totals}
              columns={[
                { key: "date_time", label: "Date/Time", render: (v) => fmtDate(v) },
                { key: "type", label: "Type" },
                { key: "amount", label: "Amount" }
              ]}
            />
          }
          chart={<OneLineChart data={totalsCum} />}
        />
      </div>
    );
  }
}

export default MachineDetailsPage;

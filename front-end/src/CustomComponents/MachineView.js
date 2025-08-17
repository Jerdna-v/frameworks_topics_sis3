import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

class MachineView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      machines: [],
      sortKey: "name",
      sortOrder: "asc",
      showFilterPopup: false,
      filters: { name: "", type: "", location: "" },
    };
  }

  QSetViewInParent = (obj) => {
    this.props.QSetView(obj);
  };

  componentDidMount() {
    axios
      .get(API_URL + "/machines")
      .then((response) => this.setState({ machines: response.data || [] }))
      .catch((err) => console.error(err));
  }

  toggleFilterPopup = () => {
    this.setState((s) => ({ showFilterPopup: !s.showFilterPopup }));
  };

  handleFilterChange = (e) => {
    const { name, value } = e.target;
    this.setState((s) => ({ filters: { ...s.filters, [name]: value } }));
  };

  handleSortChange = (e) => {
    this.setState({ sortKey: e.target.value });
  };

  handleSortOrderToggle = () => {
    this.setState((s) => ({ sortOrder: s.sortOrder === "asc" ? "desc" : "asc" }));
  };

  safeStr = (v) => (v == null ? "" : String(v));
  safeLower = (v) => this.safeStr(v).toLowerCase();

  getSortValue = (m, key) => {
    if (key === "mid") return Number(m.mid) || 0;
    if (key === "startDate") return this.safeStr(m.startDate);
    return this.safeLower(m.name);
  };

  render() {
    const { machines, sortKey, sortOrder, showFilterPopup, filters } = this.state;

    const filteredMachines = machines.filter((machine) => {
      const n = this.safeLower(machine.name);
      const t = this.safeLower(machine.type);
      const l = this.safeLower(machine.location);
      const fn = this.safeLower(filters.name);
      const ft = this.safeLower(filters.type);
      const fl = this.safeLower(filters.location);
      const nameOk = !fn || n.includes(fn);
      const typeOk = !ft || t.includes(ft);
      const locOk = !fl || l.includes(fl);
      return nameOk && typeOk && locOk;
    });

    const sortedMachines = [...filteredMachines].sort((a, b) => {
      const av = this.getSortValue(a, sortKey);
      const bv = this.getSortValue(b, sortKey);
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return (
      <div className="container" style={{ marginTop: "10px" }}>
        <div className="row" style={{ marginBottom: "10px" }}>
          <div className="col-md-12 d-flex justify-content-between align-items-center">
            <div>
              <button
                className="btn btn-secondary me-2"
                onClick={() => this.QSetViewInParent({ page: "home" })}
              >
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => this.QSetViewInParent({ page: "map" })}
              >
                Add Machine
              </button>
            </div>

            <button className="btn btn-secondary" onClick={this.toggleFilterPopup}>
              Filter
            </button>

            <div>
              <select
                className="form-select d-inline"
                style={{ width: "150px", display: "inline" }}
                value={sortKey}
                onChange={this.handleSortChange}
              >
                <option value="mid">Machine ID</option>
                <option value="name">Name</option>
                <option value="startDate">Start Date</option>
              </select>
              <button className="btn btn-secondary d-inline" onClick={this.handleSortOrderToggle}>
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-2 g-4">
          {sortedMachines.length > 0 ? (
            sortedMachines.map((machine) => (
              <div className="col" key={machine.mid}>
                <div
                  className="card cursor-pointer"
                  onClick={() => this.QSetViewInParent({ page: "machinedetails", id: machine.mid })}
                >
                  <div className="card-body">
                    <h5 className="card-title">{machine.name || `Machine ${machine.mid}`}</h5>
                    <p className="card-text">
                      Type: {this.safeStr(machine.type) || "-"} <br />
                      Location: {this.safeStr(machine.location) || "Store"} <br />
                      Start Date: {this.safeStr(machine.startDate) || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="px-2">No machines found...</p>
          )}
        </div>

        {showFilterPopup && (
          <div
            className="p-3 border rounded bg-white shadow"
            style={{
              position: "fixed",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              width: 360,
              maxWidth: "90vw",
            }}
          >
            <h5>Filter Machines</h5>
            <div className="mb-2">
              <input
                type="text"
                name="name"
                placeholder="Filter by name"
                value={filters.name}
                onChange={this.handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <input
                type="text"
                name="type"
                placeholder="Filter by type"
                value={filters.type}
                onChange={this.handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="location"
                placeholder="Filter by location"
                value={filters.location}
                onChange={this.handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ filters: { name: "", type: "", location: "" } })}
              >
                Clear
              </button>
              <button className="btn btn-primary" onClick={this.toggleFilterPopup}>
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

MachineView.propTypes = {
  QSetView: PropTypes.func.isRequired,
};

export default MachineView;

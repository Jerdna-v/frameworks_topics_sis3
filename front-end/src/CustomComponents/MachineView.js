import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

class MachineView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      machines: [],
      filterText: "",
      filterType: "",
      filterLocation: "",
      sortKey: "name",
      sortOrder: "asc", 
      showAddMachinePopup: false,
      showFilterPopup: false,
      newMachine: {
        mid: "",
        name: "",
        type: "astra",
        location: "",
        store: false,
        startDate: "",
      },
      filters: {
        name: "",
        type: "",
        location: "",
      },
    };
  }

  QSetViewInParent = (obj) => {
    this.props.QSetView(obj);
  };

  componentDidMount() {
    axios
      .get(API_URL + "/machines")
      .then((response) => {
        console.log(response.data);
        this.setState({
          machines: response.data,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  toggleAddMachinePopup = () => {
    this.setState({ showAddMachinePopup: !this.state.showAddMachinePopup });
  };

  toggleFilterPopup = () => {
    this.setState({ showFilterPopup: !this.state.showFilterPopup });
  };

  handleFilterChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSort = () => {
    const sortKey = this.state.sortKey === "name" ? "startDate" : "name";
    const sortOrder = this.state.sortOrder === "asc" ? "desc" : "asc";
    this.setState({ sortKey, sortOrder });
  };

  toggleAddMachinePopup = () => {
    this.setState({ showAddMachinePopup: !this.state.showAddMachinePopup });
  };

  toggleFilterPopup = () => {
    this.setState({ showFilterPopup: !this.state.showFilterPopup });
  };

  handleAddMachineChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    this.setState({
        newMachine: {
          ...this.state.newMachine,
          [name]: fieldValue,
          ...(name === "store" && { location: fieldValue ? "" : this.state.newMachine.location }),
        },
      });
    };

  handleAddMachineSubmit = () => {
    const { newMachine } = this.state;

    axios
      .post(API_URL + "/machines", newMachine)
      .then((response) => {
        this.setState({
          machines: [...this.state.machines, response.data],
          showAddMachinePopup: false,
          newMachine: {
            mid: "",
            name: "",
            type: "astra",
            location: "",
            store: false,
            startDate: "",
          },
        });
      })
      .catch((err) => console.error(err));
  };

  handleFilterChange = (e) => {
    this.setState({
      filters: { ...this.state.filters, [e.target.name]: e.target.value },
    });
  };

  handleSortChange = (e) => {
    this.setState({ sortKey: e.target.value });
  };

  handleSortOrderToggle = () => {
    this.setState({ sortOrder: this.state.sortOrder === "asc" ? "desc" : "asc" });
  };

  render() {
    const {
      machines,
      sortKey,
      sortOrder,
      showAddMachinePopup,
      showFilterPopup,
      newMachine,
      filters,
    } = this.state;

    const filteredMachines = machines.filter((machine) => {
        return (
          (!filters.name || machine.name.toLowerCase().includes(filters.name.toLowerCase())) &&
          (!filters.type || machine.type.toLowerCase() === filters.type.toLowerCase()) && 
          (!filters.location || machine.location.toLowerCase().includes(filters.location.toLowerCase()))
        );
      });
    // Apply sort
    const sortedMachines = [...filteredMachines].sort((a, b) => {
        const comparison = a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0; // ADDED
        return sortOrder === "asc" ? comparison : -comparison; // ADDED
      });

      return (
        <div className="container" style={{ marginTop: "10px" }}>
          {/* Buttons */}
          <div className="row" style={{ marginBottom: "10px" }}>
            <div className="col-md-12 d-flex justify-content-between">
              <button className="btn btn-primary" onClick={this.toggleAddMachinePopup}>
                Add Machine
              </button>
              <button className="btn btn-secondary" onClick={this.toggleFilterPopup}>
                Filter
              </button>
              <div>
                <select
                  className="form-select d-inline"
                  style={{ width: "150px", display: "inline" }}
                  value={sortKey}
                  onChange={this.handleSortChange} // ADDED
                >
                  <option value="mid">Machine ID</option>
                  <option value="name">Name</option>
                  <option value="startDate">Start Date</option>
                </select>
                <button className="btn btn-secondary d-inline" onClick={this.handleSortOrderToggle}>
                  {sortOrder === "asc" ? "↑" : "↓"} {/* ADDED */}
                </button>
              </div>
            </div>
          </div>
  
          {/* Machine List */}
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {sortedMachines.length > 0 ? (
              sortedMachines.map((machine) => (
                <div className="col" key={machine.mid}>
                  <div
                    className="card cursor-pointer"
                    onClick={() => this.QSetViewInParent({ page: "machinedetails", id: machine.mid })}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{machine.name}</h5>
                      <p className="card-text">
                        Type: {machine.type} <br />
                        Location: {machine.location || "Store"} <br />
                        Start Date: {machine.startDate}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No machines found...</p>
            )}
          </div>

  
          {/* Filter Popup */}
          {showFilterPopup && (
            <div className="popup">
              <h5>Filter Machines</h5>
              <input
                type="text"
                name="name"
                placeholder="Filter by name" // ADDED
                value={filters.name} // ADDED
                onChange={this.handleFilterChange} // ADDED
                className="form-control"
              />
              <input
                type="text"
                name="type"
                placeholder="Filter by type" // ADDED
                value={filters.type} // ADDED
                onChange={this.handleFilterChange} // ADDED
                className="form-control"
              />
              <input
                type="text"
                name="location"
                placeholder="Filter by location" // ADDED
                value={filters.location} // ADDED
                onChange={this.handleFilterChange} // ADDED
                className="form-control"
              />
              <button className="btn btn-primary" onClick={this.toggleFilterPopup}>
                Apply
              </button>
              <button className="btn btn-secondary" onClick={this.toggleFilterPopup}>
                Cancel
              </button>
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

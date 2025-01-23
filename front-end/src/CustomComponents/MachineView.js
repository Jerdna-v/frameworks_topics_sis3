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
      sortKey: "name", // Default sort key
      sortOrder: "asc", // Sort order: asc or desc
      showAddMachinePopup: false,
      showFilterPopup: false,
      newMachine: {
        name: "",
        type: "",
        location: "",
        startDate: "",
      },
    };
  }

  QSetViewInParent = (obj) => {
    this.props.QSetView(obj);
  };

  componentDidMount() {
    axios
      .get(API_URL + "/machines") // Assuming `/machines` is the endpoint
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
    this.setState({
      newMachine: {
        ...this.state.newMachine,
        [e.target.name]: e.target.value,
      },
    });
  };

  handleAddMachineSubmit = () => {
    const { newMachine } = this.state;
    axios
      .post(API_URL + "/machines", newMachine)
      .then((response) => {
        console.log("Machine added:", response.data);
        this.setState({
          machines: [...this.state.machines, response.data],
          showAddMachinePopup: false,
          newMachine: { name: "", type: "", location: "", startDate: "" },
        });
      })
      .catch((err) => console.error(err));
  };

  render() {
    const {
      machines,
      filterText,
      filterType,
      filterLocation,
      sortKey,
      sortOrder,
      showAddMachinePopup,
      showFilterPopup,
      newMachine,
    } = this.state;

    // Apply filters
    const filteredMachines = machines
      .filter((machine) =>
        machine.name.toLowerCase().includes(filterText.toLowerCase())
      )
      .filter(
        (machine) =>
          !filterType || machine.type.toLowerCase() === filterType.toLowerCase()
      )
      .filter(
        (machine) =>
          !filterLocation ||
          machine.location.toLowerCase() === filterLocation.toLowerCase()
      );

    // Apply sort
    const sortedMachines = [...filteredMachines].sort((a, b) => {
      const comparison =
        a[sortKey] > b[sortKey]
          ? 1
          : a[sortKey] < b[sortKey]
          ? -1
          : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return (
      <div className="container" style={{ marginTop: "10px" }}>
        <div className="row">
          {/* Machines List - Left Column */}
          <div className="col-md-8">
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {sortedMachines.length > 0 ? (
                sortedMachines.map((machine) => (
                  <div className="col" key={machine.id}>
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">{machine.name}</h5>
                        <p className="card-text">
                          Type: {machine.type} <br />
                          Location: {machine.location} <br />
                          Start Date: {machine.startDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ margin: "10px" }}>No machines found...</p>
              )}
            </div>
          </div>

          {/* Options - Right Column */}
          <div className="col-md-4">
            <div className="card" style={{ padding: "10px" }}>
              <h4>Options</h4>
              {/* Sort Button */}
              <button
                className="btn btn-secondary"
                style={{ marginBottom: "10px" }}
                onClick={this.handleSort}
              >
                Sort by {sortKey} {sortOrder === "asc" ? "↑" : "↓"}
              </button>

              {/* Buttons */}
              <div>
                <button
                  className="btn btn-primary"
                  style={{ margin: "5px" }}
                  onClick={this.toggleAddMachinePopup}
                >
                  Add Machine
                </button>
                <button
                  className="btn btn-primary"
                  style={{ margin: "5px" }}
                  onClick={this.toggleFilterPopup}
                >
                  Filter
                </button>
                <button
                  className="btn btn-primary"
                  style={{ margin: "5px" }}
                  onClick={() => this.QSetViewInParent({ page: "compare" })}
                >
                  Compare
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Machine Popup */}
        {showAddMachinePopup && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              border: "1px solid black",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <h5>Add Machine</h5>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newMachine.name}
              onChange={this.handleAddMachineChange}
              className="form-control"
              style={{ marginBottom: "10px" }}
            />
            <input
              type="text"
              name="type"
              placeholder="Type"
              value={newMachine.type}
              onChange={this.handleAddMachineChange}
              className="form-control"
              style={{ marginBottom: "10px" }}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={newMachine.location}
              onChange={this.handleAddMachineChange}
              className="form-control"
              style={{ marginBottom: "10px" }}
            />
            <input
              type="date"
              name="startDate"
              placeholder="Start Date"
              value={newMachine.startDate}
              onChange={this.handleAddMachineChange}
              className="form-control"
              style={{ marginBottom: "10px" }}
            />
            <button
              className="btn btn-primary"
              onClick={this.handleAddMachineSubmit}
              style={{ marginRight: "10px" }}
            >
              Submit
            </button>
            <button
              className="btn btn-secondary"
              onClick={this.toggleAddMachinePopup}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Filter Popup */}
        {showFilterPopup && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              border: "1px solid black",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <h5>Filter Machines</h5>
            <input
              type="text"
              name="filterText"
              placeholder="Filter by name"
              value={filterText}
              onChange={this.handleFilterChange}
              className="form-control"
              style={{ marginBottom: "10px" }}
            />
            <input
              type="text"
              name="filterType"
              placeholder="Filter by type"
              value={filterType}
              onChange={this.handleFilterChange}
              className="form-control"
              style={{ marginBottom: "10px" }}
            />
            <input
              type="text"
              name="filterLocation"
              placeholder="Filter by location"
              value={filterLocation}
              onChange={this.handleFilterChange}
              className="form-control"
              style={{ marginBottom: "10px" }}
            />
            <button
              className="btn btn-primary"
              onClick={this.toggleFilterPopup}
              style={{ marginRight: "10px" }}
            >
              Apply
            </button>
            <button
              className="btn btn-secondary"
              onClick={this.toggleFilterPopup}
            >
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

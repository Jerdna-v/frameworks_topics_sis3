import React from "react";

class AboutView extends React.Component {
  QBack = () => {
    if (this.props.QSetView) this.props.QSetView({ page: "home" });
  };

  render() {
    return (
      <div className="card" style={{ margin: "10px", padding: "16px" }}>
        <div className="mb-3">
          <button className="btn btn-secondary" onClick={this.QBack}>
            ← Back
          </button>
        </div>

        <h3 className="mb-3">About This Application</h3>

        <div className="mb-4">
          <h5 className="mb-2">Overview</h5>
          <p className="mb-0">
            This system manages coffee vending machines, their product stock, cash flow,
            reports from machines, user notifications, and map locations. It supports
            three roles: <b>Owner</b>, <b>Manager</b>, and <b>Worker</b>, and uses
            real-time updates over Socket.IO.
          </p>
        </div>

        <div className="mb-4">
          <h5 className="mb-2">Main Features</h5>
          <ul className="mb-0">
            <li><b>Machines:</b> Browse all machines, filter/sort, open a machine to edit details and view its data by date range.</li>
            <li><b>Data Upload:</b> Upload a machine report file; the server parses it and stores Selections, Failures, Totals, Price Bands, Coin Mech, etc.</li>
            <li><b>Product:</b> Insert product grams per machine with date/time.</li>
            <li><b>Cash Flow:</b> Insert cashflow rows (type, amount, optional description) with date/time.</li>
            <li><b>Notifications:</b> Send to any user; notifications show recipient name and timestamp; workers can mark them as done.</li>
            <li><b>Map:</b> See machines; click the map to add a machine. Owners/managers can request workers to refresh their live location for routing.</li>
            <li><b>Users:</b> Manage user info and roles (owner only).</li>
          </ul>
        </div>

        <div className="mb-4">
          <h5 className="mb-2">Roles & Permissions</h5>
          <ul className="mb-0">
            <li><b>Owner:</b> Full access to all features, including Users, Machines, Product, Cash Flow, Notifications, Upload, and Map; can refresh all workers’ locations.</li>
            <li><b>Manager:</b> Full operational access except Users; can refresh all workers’ locations.</li>
            <li><b>Worker:</b> Sees only personal notifications, can upload reports, and use Map routing; no access to Users, Cash Flow, or Machines administration.</li>
          </ul>
        </div>

        <div className="mb-4">
          <h5 className="mb-2">Real-Time</h5>
          <p className="mb-0">
            Notifications are delivered instantly. When a worker marks a task as done,
            owner/manager views update live. Owners/managers can broadcast a one-time
            request for workers to report their current location.
          </p>
        </div>

        <div>
          <h5 className="mb-2">Adding Machines</h5>
          <p className="mb-0">
            Use the Map: click a location to open the form, enter machine details,
            choose “use current date & time” or pick a custom start date/time, and save.
            If the machine is stored off-site, mark it as “Store”.
          </p>
        </div>
      </div>
    );
  }
}

export default AboutView;

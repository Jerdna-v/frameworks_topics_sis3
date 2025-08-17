import React from "react";
import PropTypes from "prop-types";

class HomeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [
        { id: 1, label: "Notifications", page: "notifications" },
        { id: 2, label: "Product", page: "product" },
        { id: 3, label: "Data Upload", page: "upload" },
        { id: 4, label: "Machines", page: "machines" },
        { id: 5, label: "CashFlow", page: "cashflow" },
        { id: 6, label: "Users", page: "users" },
        { id: 7, label: "Send Notification", page: "sendnotification" },
        { id: 8, label: "Map", page: "map" },
        { id: 9, label: "About", page: "about" },
      ],
    };
  }

  QVisibleButtonsForRole = (role) => {
    if (role === "owner") return this.state.buttons;
    if (role === "manager") return this.state.buttons.filter((b) => b.label !== "Users");
    return this.state.buttons.filter((b) => !["Users", "CashFlow", "Machines"].includes(b.label));
  };

  render() {
    const role = this.props.user?.type || "worker";
    const visibleButtons = this.QVisibleButtonsForRole(role);

    return (
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <div style={{ margin: "20px", textAlign: "center" }}>
          <h2>Welcome {this.props.user ? this.props.user.user_name : "Guest"}</h2>
          <div style={{ fontSize: 12, color: "#666" }}>Role: {role}</div>
        </div>

        <div className="button-grid" style={styles.grid}>
          {visibleButtons.map((button) => (
            <button
              key={button.id}
              className="btn btn-primary"
              style={styles.button}
              onClick={() => this.props.QSetView({ page: button.page })}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button className="btn btn-danger" onClick={this.props.QLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    padding: "10px",
  },
  button: {
    height: "60px",
    fontSize: "14px",
  },
};

HomeView.propTypes = {
  QSetView: PropTypes.func.isRequired,
  QLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default HomeView;

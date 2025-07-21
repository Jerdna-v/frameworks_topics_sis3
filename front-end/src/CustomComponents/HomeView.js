import React from "react";
import { API_URL } from "../Utils/Configuration";
import PropTypes from "prop-types";


class HomeView extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        buttons: [
          { id: 1, label: "Notifications", onClick: () => this.props.QSetView({ page: "notifications" }) },
          { id: 2, label: "Product", onClick: () => this.props.QSetView({ page: "product" }) },
          { id: 3, label: "Data Upload", onClick: () => this.props.QSetView({ page: "upload" }) },
          { id: 4, label: "Machines", onClick: () => this.props.QSetView({ page: "machines" }) }, // New Machines Button
          { id: 5, label: "CashFlow", onClick: () => this.props.QSetView({ page: "cashflow" }) },
          { id: 6, label: "Users", onClick: () => this.props.QSetView({ page: "users" }) },
          { id: 7, label: "Send Notification", onClick: () => this.props.QSetView({ page: "sendnotification" }) },
          { id: 8, label: "Map", onClick: () => this.props.QSetView({ page: "map" }) },
          { id: 9, label: "About", onClick: () => this.props.QSetView({ page: "about" }) },
        ],
      };
    }
  
    render() {
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
            <h2>Welcome, {this.props.user ? this.props.user.user_name : "Guest"}</h2>
          </div>
          <div className="button-grid" style={styles.grid}>
            {this.state.buttons.map((button) => (
              <button
                key={button.id}
                className="btn btn-primary"
                style={styles.button}
                onClick={button.onClick}
              >
                {button.label}
              </button>
            ))}
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
    user: PropTypes.object,
  };


export default HomeView
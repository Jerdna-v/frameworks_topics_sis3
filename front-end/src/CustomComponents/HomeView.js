import React from "react";
import PropTypes from "prop-types";

class HomeView extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        buttons: [
          { id: 1, label: "Option 1", onClick: () => console.log("Option 1 clicked") },
          { id: 2, label: "Option 2", onClick: () => console.log("Option 2 clicked") },
          { id: 3, label: "Data Upload", onClick: () => this.props.QSetView({ page: "upload" }) },
          { id: 4, label: "Machines", onClick: () => this.props.QSetView({ page: "machines" }) }, // New Machines Button
          { id: 5, label: "Option 5", onClick: () => console.log("Option 5 clicked") },
          { id: 6, label: "Option 6", onClick: () => console.log("Option 6 clicked") },
          { id: 7, label: "Option 7", onClick: () => console.log("Option 7 clicked") },
          { id: 8, label: "Option 8", onClick: () => console.log("Option 8 clicked") },
          { id: 9, label: "Option 9", onClick: () => console.log("Option 9 clicked") },
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
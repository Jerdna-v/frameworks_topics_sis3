import React from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { API_URL } from "../Utils/Configuration";
import Cookies from 'universal-cookie';
const cookies = new Cookies();


class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_input: {
        username: "",
        password: "",
        remember_me: false
      },
      user: null,
      phone_number: "",
      showForgotPopup: false,
      status: {
        success: null,
        msg: ""
      }
    }
  }

  componentDidMount = () => {
    if (cookies.get('user_name') != null && this.state.user == null) {
      this.state.user_input.username = String(cookies.get('user_name'))
      this.state.user_input.password = String(cookies.get('user_password'))
      this.setState(this.state.user_input = this.state.user_input)
      this.QPostLogin()
    }
  }

  QGetTextFromField(e) {
    this.state.user_input[e.target.name] = e.target.value;
    this.setState({ user_input: this.state.user_input });
  }

  QGetRememberMe(e) {
    this.state.user_input.remember_me = !this.state.user_input.remember_me;
    this.setState({ user_input: this.state.user_input });
    console.log(this.state)
  }

  QPostLogin = () => {
    // Validate input fields before sending to the server
    if (
      this.state.user_input.username === "" ||
      this.state.user_input.password === ""
    ) {
      this.setState(
        this.state.status = { success: false, msg: "Missing input field" }
      );
      return;
    }

    let req = axios.create({
      timeout: 20000,
      withCredentials: true,
    });

    req
      .post(
        API_URL + "/users/login",
        {
          username: this.state.user_input.username,
          password: this.state.user_input.password,
        },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("Sent to server...");
        console.log(this.state.user_input);
        console.log(response.status);
        if (response.status === 200 && response.data.status.success) {
          console.log(response.data);
          this.setState((this.state.status = response.data.status));
          this.setState((this.state.user = response.data.user));
          if (this.state.status.success) {
            // Set cookies for 24 hours if "Remember Me" is checked
            if (this.state.user_input.remember_me) {
              cookies.set("user_name", this.state.user.user_name, {
                path: "/",
                expires: new Date(Date.now() + 86400000), // 24 hours
              });
              cookies.set("user_password", this.state.user.user_password, {
                path: "/",
                expires: new Date(Date.now() + 86400000), // 24 hours
              });
            } else {
              // Clear cookies if "Remember Me" is not checked
              cookies.remove("user_name", { path: "/" });
              cookies.remove("user_password", { path: "/" });
            }
            this.props.QUserFromChild(this.state);
          }
        } else {
          console.log("Invalid credentials, clearing cookies.");
          cookies.remove("user_name", { path: "/" });
          cookies.remove("user_password", { path: "/" });
          this.setState({
            status: { success: false, msg: "Invalid username or password." },
            user_input: { ...this.state.user_input, password: "" },
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
handleForgotInfo = () => {
  console.log(`Sending recovery info to: ${this.state.phone_number}`);
  this.setState({
    showForgotPopup: false,
    status: {
      success: true,
      msg: `Recovery instructions sent to ${this.state.phone_number}`,
    },
  });
};
  render() {
    return (
      <div
        className="card"
        style={{
          width: "400px",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <form style={{ margin: "20px" }}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              name="username"
              value={this.state.user_input.username}
              onChange={(e) => this.QGetTextFromField(e)}
              type="text"
              className="form-control"
              id="exampleInputEmail1"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              value={this.state.user_input.password}
              onChange={(e) => this.QGetTextFromField(e)}
              type="password"
              className="form-control"
              id="exampleInputPassword1"
            />
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="true"
              name="remember_me"
              id="flexCheckDefault"
              onChange={(e) => this.QGetRememberMe(e)}
              checked={this.state.user_input.remember_me}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              Remember me
            </label>
          </div>
        </form>
        <div style={{ textAlign: "center" }}>
        <button
          style={{ margin: "10px" }}
          onClick={() => this.QPostLogin()}
          className="btn btn-primary bt"
        >
          Sign
        </button>
        <button
            style={{ margin: "10px" }}
            onClick={() => this.props.QSetView({ page: "signup" })}
            className="btn btn-secondary"
          >
            Register
          </button>
          <button
            style={{ margin: "10px" }}
            onClick={() => this.setState({ showForgotPopup: true })}
            className="btn btn-warning"
          >
            Forgot Login Info
          </button>
          </div>

        {/* Display success or error messages */}
        {this.state.status.success ? (
          <p className="alert alert-success" role="alert">
            {this.state.status.msg}
          </p>
        ) : null}

        {!this.state.status.success && this.state.status.msg !== "" ? (
          <p className="alert alert-danger" role="alert">
            {this.state.status.msg}
          </p>
        ) : null}
        {/* Forgot Login Info Popup */}
        {this.state.showForgotPopup && (
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
            <h5>Forgot Login Info</h5>
            <p>Enter your phone number to receive recovery instructions:</p>
            <input
              type="text"
              className="form-control"
              value={this.state.phone_number}
              onChange={(e) =>
                this.setState({ phone_number: e.target.value })
              }
              placeholder="Enter your phone number"
            />
            <button
              className="btn btn-primary"
              style={{ marginTop: "10px" }}
              onClick={this.handleForgotInfo}
            >
              Submit
            </button>
            <button
              className="btn btn-secondary"
              style={{ marginTop: "10px", marginLeft: "10px" }}
              onClick={() => this.setState({ showForgotPopup: false })}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }
}


LoginView.propTypes = {
  QUserFromChild: PropTypes.func.isRequired,
  QSetView: PropTypes.func.isRequired,
};



export default LoginView
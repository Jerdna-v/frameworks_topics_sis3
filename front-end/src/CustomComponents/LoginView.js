import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";
import Cookies from "universal-cookie";

const cookies = new Cookies();
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_input: { username: "", password: "", remember_me: false },
      user: null,
      phone_number: "",
      showForgotPopup: false,
      status: { success: null, msg: "" },
      loading: false,
    };
  }

  componentDidMount = () => {
    const remembered = cookies.get("remember_me") === "true";
    const rememberedUsername = cookies.get("remembered_username") || "";
    if (remembered && rememberedUsername) {
      this.setState((prev) => ({
        user_input: { ...prev.user_input, username: rememberedUsername, remember_me: true },
      }));
    }
  };

  QGetTextFromField = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      user_input: { ...prev.user_input, [name]: value },
      status: { success: null, msg: "" },
    }));
  };

  QGetRememberMe = () => {
    this.setState((prev) => ({
      user_input: { ...prev.user_input, remember_me: !prev.user_input.remember_me },
    }));
  };

  QPostLogin = async () => {
    const { username, password, remember_me } = this.state.user_input;
    if (!username || !password) {
      this.setState({ status: { success: false, msg: "Missing input field" } });
      return;
    }
    this.setState({ loading: true, status: { success: null, msg: "" } });
    try {
      const { data, status } = await axios.post("/users/login", { username, password });
      if (status === 200 && data.status?.success) {
        if (remember_me) {
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          cookies.set("remembered_username", username, { path: "/", expires });
          cookies.set("remember_me", "true", { path: "/", expires });
        } else {
          cookies.remove("remembered_username", { path: "/" });
          cookies.remove("remember_me", { path: "/" });
        }
        this.setState({ status: data.status, user: data.user, loading: false });
        this.props.QUserFromChild({ user: data.user });
      } else {
        this.setState({
          status: { success: false, msg: "Invalid username or password." },
          loading: false,
          user_input: { ...this.state.user_input, password: "" },
        });
      }
    } catch (err) {
      const msg = err?.response?.status === 401 ? "Invalid username or password." : "Login failed. Please try again.";
      this.setState({ status: { success: false, msg }, loading: false });
    }
  };

  QHandleForgot = async () => {
    const phone = this.state.phone_number?.trim();
    if (!phone) {
      this.setState({ status: { success: false, msg: "Please enter a phone number." } });
      return;
    }
    try {
      const res = await axios.post("/users/forgot", { phone_number: phone });
      const msg = res.data?.status?.msg || `Recovery instructions sent to ${this.state.phone_number}`;
      this.setState({ showForgotPopup: false, status: { success: true, msg } });
    } catch {
      this.setState({ showForgotPopup: false, status: { success: false, msg: "Could not send recovery instructions." } });
    }
  };

  render() {
    const { user_input, status, showForgotPopup, phone_number, loading } = this.state;

    return (
      <div
        className="card"
        style={{ width: "400px", marginLeft: "auto", marginRight: "auto", marginTop: "10px", marginBottom: "10px" }}
      >
        <form style={{ margin: "20px" }} onSubmit={(e) => e.preventDefault()}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              name="username"
              value={user_input.username}
              onChange={this.QGetTextFromField}
              type="text"
              className="form-control"
              id="loginUsername"
              autoComplete="username"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              value={user_input.password}
              onChange={this.QGetTextFromField}
              onKeyDown={(e) => e.key === "Enter" && this.QPostLogin()}
              type="password"
              className="form-control"
              id="loginPassword"
              autoComplete="current-password"
            />
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="remember_me"
              id="rememberMe"
              onChange={this.QGetRememberMe}
              checked={user_input.remember_me}
            />
            <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
          </div>
        </form>

        <div style={{ textAlign: "center" }}>
          <button style={{ margin: "10px" }} onClick={this.QPostLogin} className="btn btn-primary bt" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <button
            style={{ margin: "10px" }}
            onClick={() => this.props.QSetView({ page: "signup" })}
            className="btn btn-secondary"
            type="button"
          >
            Register
          </button>
          <button
            style={{ margin: "10px" }}
            onClick={() => this.setState({ showForgotPopup: true })}
            className="btn btn-warning"
            type="button"
          >
            Forgot Login Info
          </button>
        </div>

        {status.msg ? (
          <p className={`alert ${status.success ? "alert-success" : "alert-danger"}`} role="alert" style={{ margin: "0 20px 20px" }}>
            {status.msg}
          </p>
        ) : null}

        {showForgotPopup && (
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
              width: 360,
              maxWidth: "90vw",
            }}
          >
            <h5>Forgot Login Info</h5>
            <p>Enter your phone number to receive recovery instructions:</p>
            <input
              type="text"
              className="form-control"
              value={phone_number}
              onChange={(e) => this.setState({ phone_number: e.target.value })}
              placeholder="Enter your phone number"
            />
            <div style={{ marginTop: "10px" }}>
              <button className="btn btn-primary" onClick={this.QHandleForgot}>Submit</button>
              <button className="btn btn-secondary" style={{ marginLeft: "10px" }} onClick={() => this.setState({ showForgotPopup: false })}>
                Cancel
              </button>
            </div>
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

export default LoginView;

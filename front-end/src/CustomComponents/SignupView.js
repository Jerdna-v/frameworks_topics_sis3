import React from "react";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

class SignupView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_input: {
        username: "",
        phone: "",
        name: "",
        password: "",
        confirm_password: "",
      },
      status: {
        success: false,
        msg: "",
      },
      submitting: false,
    };
  }

  QGetTextFromField = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      user_input: {
        ...prev.user_input,
        [name]: value,
      },
    }));
  };

  QPostSignup = async () => {
    const { name, username, phone, password, confirm_password } =
      this.state.user_input;

    if (!username || !password || !confirm_password || !name || !phone) {
      this.setState({
        status: { success: false, msg: "A field is missing!" },
      });
      return;
    }
    if (String(password) !== String(confirm_password)) {
      this.setState({
        status: { success: false, msg: "Passwords do not match!" },
      });
      return;
    }

    try {
      this.setState({ submitting: true, status: { success: false, msg: "" } });

      const res = await axios.post(`${API_URL}/users/register`, {
        username,
        password,
        name,
        phone,
      });

      const serverStatus = res.data?.status || {};
      this.setState({
        status: serverStatus,
        submitting: false,
      });

      if (serverStatus.success) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      this.setState({
        status: { success: false, msg: "Something went wrong. Please try again." },
        submitting: false,
      });
    }
  };

  render() {
    const { username, phone, name, password, confirm_password } =
      this.state.user_input;

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
        <form style={{ margin: "20px" }} onSubmit={(e)=>{e.preventDefault(); this.QPostSignup();}}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              name="name"
              value={name}
              onChange={this.QGetTextFromField}
              type="text"
              className="form-control"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              name="username"
              value={username}
              onChange={this.QGetTextFromField}
              type="text"
              className="form-control"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              name="phone"
              value={phone}
              onChange={this.QGetTextFromField}
              type="text"
              className="form-control"
              placeholder="Enter your phone number"
            />
            <div id="phoneHelp" className="form-text">
              We'll never share your phone number with anyone else.
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              value={password}
              onChange={this.QGetTextFromField}
              type="password"
              className="form-control"
              placeholder="Enter your password"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              name="confirm_password"
              value={confirm_password}
              onChange={this.QGetTextFromField}
              type="password"
              className="form-control"
              placeholder="Re-enter your password"
            />
          </div>

          <div className="d-flex justify-content-between mt-3">
            {/* ✅ Back to login */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { window.location.href = "/"; }} // change "/" if your login page route is different
            >
              Back to Login
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={this.state.submitting}
            >
              {this.state.submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {/* messages */}
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
      </div>
    );
  }
}

export default SignupView;

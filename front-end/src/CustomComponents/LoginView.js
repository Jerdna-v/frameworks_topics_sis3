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
        if (response.status === 200) {
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
          console.log("Something is really wrong, DEBUG!");
        }
      })
      .catch((err) => {
        console.log(err);
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
        <button
          style={{ margin: "10px" }}
          onClick={() => this.QPostLogin()}
          className="btn btn-primary bt"
        >
          Sign
        </button>

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
      </div>
    );
  }
}


LoginView.propTypes = {
  QUserFromChild: PropTypes.func.isRequired,
};



export default LoginView
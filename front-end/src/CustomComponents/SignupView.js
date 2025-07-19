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
        msg: ""
      }
    }
  }

  // QGetTextFromField=(e)=>{
  //   this.setState({ [e.target.name]: e.target.value})
  //   console.log(this.state)
  // }
  QGetTextFromField = (e) => {
    this.setState(this.state.user_input[e.target.name] = [e.target.value])
    console.log(this.state)
  }

  QPostSignup = () => {
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
    console.log()
    axios.post(API_URL + '/users/register', {
      username: this.state.user_input.username,
      email: this.state.user_input.email,
      password: this.state.user_input.password
    })
      .then(response => {
        /// TODO: You should indicate if the element was added, or if not show the error
        this.setState(this.state.status = response.data)
        console.log("Sent to server...")
      })
      .catch(err => {
        console.log(err)
        this.setState({
          status: { success: false, msg: "Something went wrong. Please try again." },
      });
      })
  }

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
            <label className="form-label">Name</label>
            <input
              name="name"
              onChange={(e) => this.QGetTextFromField(e)}
              type="text"
              className="form-control"
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              name="username"
              onChange={(e) => this.QGetTextFromField(e)}
              type="text"
              className="form-control"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              name="phone"
              onChange={(e) => this.QGetTextFromField(e)}
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
              onChange={(e) => this.QGetTextFromField(e)}
              type="password"
              className="form-control"
              placeholder="Enter your password"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              name="confirm_password"
              onChange={(e) => this.QGetTextFromField(e)}
              type="password"
              className="form-control"
              placeholder="Re-enter your password"
            />
          </div>
        </form>
        <button
          style={{ margin: "10px" }}
          onClick={() => this.QPostSignup()}
          className="btn btn-primary"
        >
          Submit
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

export default SignupView
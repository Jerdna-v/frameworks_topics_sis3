import React from "react";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

class SignupView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_input: {
        username: "",
        email: "",
        password: ""
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
    // TODO: you should validate the data before sending it to the server,

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
      })
  }

  render() {
    return (
      <div className="card"
        style={{ width: "400px", marginLeft: "auto", marginRight: "auto", marginTop: "10px", marginBottom: "10px" }}>
        <form style={{ margin: "20px" }} >
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input name="username" onChange={(e) => this.QGetTextFromField(e)}
              type="text"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp" />
          </div>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input name="email" onChange={(e) => this.QGetTextFromField(e)}
              type="email"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp" />
            <div id="emailHelp"
              className="form-text">We'll never share your email with anyone else.
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input name="password" onChange={(e) => this.QGetTextFromField(e)}
              type="password"
              className="form-control"
              id="exampleInputPassword1" />
          </div>
        </form>
        <button style={{ margin: "10px" }} onClick={() => this.QPostSignup()}
          className="btn btn-primary bt">Submit</button>
       
        {/* TODO: We should display error to the user if something went wrong or a
        success message  if an item was added. Use paragraph with the following classNmes:
          => no success: <p className="alert alert-danger" role="alert"> 
          => success: <p className="alert alert-success" role="alert">*/}
        {this.state.status.success ?
          <p className="alert alert-success"
            role="alert">{this.state.status.msg}</p> : null}

        {!this.state.status.success &&
          this.state.status.msg != "" ?
          <p className="alert alert-danger"
            role="alert">{this.state.status.msg}</p> : null}

      </div>
    )
  }
}

export default SignupView
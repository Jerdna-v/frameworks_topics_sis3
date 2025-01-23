import { Component } from "react";
import { SIGNUP, LOGIN, HOME, UPLOAD } from "./Utils/Constants";
import HomeView from "./CustomComponents/HomeView";
import SignupView from "./CustomComponents/SignupView";
import LoginView from "./CustomComponents/LoginView";
import FilesUploadComponent from "./CustomComponents/FilesUpload";
import axios from "axios";
import { API_URL } from "./Utils/Configuration";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      CurrentPage: LOGIN,
      Novica: 1,
      status: {
        success: null,
        msg: ""
      },
      user: null
    };
    if (cookies.get('user_name') != null && this.state.user == null) {
      this.state.CurrentPage = LOGIN
    }

  }

  QGetView(state) {
    const { CurrentPage } = state;
    switch (CurrentPage) {
      case SIGNUP:
        return <SignupView />;
      case LOGIN:
        return <LoginView QUserFromChild={this.QSetLoggedIn} />;
      case HOME:
        return <HomeView user={this.state.user} QLogout={this.QHandleLogout} />;
      case UPLOAD:
        return <FilesUploadComponent />;
      default:
        return <LoginView QUserFromChild={this.QSetLoggedIn} />;
    }
  }
  QPostLogout = () => {
    let req = axios.create({
      timeout: 20000,
      withCredentials: true,
    });

    req
      .get(`${API_URL}/users/logout`, {}, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          this.setState((this.state.status = response.data));
          this.setState({ user: null, CurrentPage: LOGIN }); // Redirect to LoginView
        } else {
          console.log("Something is really wrong, DEBUG!");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  QSetView = (obj) => {
    this.setState(this.state.status = { success: null, msg: "" })

    console.log("QSetView");
    this.setState({
      CurrentPage: obj.page,
      Novica: obj.id || 0
    });
  };
  QSetLoggedIn = (obj) => {
    this.setState(this.state.user = obj.user)
  }

  render() {
    return (
      <div id="APP" className="container">
        <div id="viewer" className="row container">
          {this.QGetView(this.state)}
          {this.state.status.success && (
            <p className="alert alert-success" role="alert">
              {this.state.status.msg}
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default App;

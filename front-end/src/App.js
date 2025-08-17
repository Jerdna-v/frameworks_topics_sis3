import { Component } from "react";
import axios from "axios";
import { API_URL } from "./Utils/Configuration";

import {
  SIGNUP,
  LOGIN,
  HOME,
  UPLOAD,
  MACHINES,
  NOTIFICATIONS,
  PRODUCT,
  CASHFLOW,
  SENDNOTIFICATION,
  MAP,
  USERS,
  ABOUT,
  MACHINEDETAILS,
} from "./Utils/Constants";

import HomeView from "./CustomComponents/HomeView";
import SignupView from "./CustomComponents/SignupView";
import LoginView from "./CustomComponents/LoginView";
import FilesUploadComponent from "./CustomComponents/FilesUpload";
import MachineView from "./CustomComponents/MachineView";
import CashFlowForm from "./CustomComponents/CashFlowForm";
import InventoryInput from "./CustomComponents/InventoryInput";
import NotificationView from "./CustomComponents/NotificationView";
import SendNotification from "./CustomComponents/SendNotification";
import UserView from "./CustomComponents/UserView";
import AboutView from "./CustomComponents/AboutView";
import MachineDetailsPage from "./CustomComponents/MachineDetailsPage";
import MapView from "./CustomComponents/MapView";
import useWorkerLocationReporter from "./Utils/useWorkerLocationReporter";

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

function WorkerLocationReporter({ user }) {
  useWorkerLocationReporter(user);
  return null;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      CurrentPage: LOGIN,
      Novica: 1,
      status: { success: null, msg: "" },
      user: null,
      bootstrapping: true,
    };
  }

  async componentDidMount() {
    try {
      const res = await axios.get(`${API_URL}/users/session`, { withCredentials: true });
      if (res.data?.logged_in && res.data?.user) {
        this.setState({
          CurrentPage: HOME,
          user: res.data.user,
          bootstrapping: false,
        });
      } else {
        this.setState({ bootstrapping: false });
      }
    } catch {
      this.setState({ bootstrapping: false });
    }
  }

  QGetView(state) {
    const { CurrentPage } = state;
    switch (CurrentPage) {
      case SIGNUP:
        return <SignupView QSetView={this.QSetView} />;
      case LOGIN:
        return (
          <LoginView
            QUserFromChild={this.QSetLoggedIn}
            QSetView={this.QSetView}
          />
        );
      case HOME:
        return (
          <HomeView
            user={this.state.user}
            QSetView={this.QSetView}
            QLogout={this.QPostLogout}
          />
        );
      case UPLOAD:
        return <FilesUploadComponent  QSetView={this.QSetView}/>;
      case NOTIFICATIONS:
        return <NotificationView user={this.state.user} QSetView={this.QSetView} />;
      case PRODUCT:
        return <InventoryInput QSetView={this.QSetView} />;
      case CASHFLOW:
        return <CashFlowForm QSetView={this.QSetView} />;
      case SENDNOTIFICATION:
        return <SendNotification QSetView={this.QSetView} />;
      case MAP:
        return <MapView QSetView={this.QSetView}  user={this.state.user}/>;
      case MACHINES:
        return <MachineView QSetView={this.QSetView} />;
      case USERS:
        return <UserView QSetView={this.QSetView} />;
      case ABOUT:
        return <AboutView QSetView={this.QSetView} />;
      case MACHINEDETAILS:
        return <MachineDetailsPage mid={this.state.Novica} QSetView={this.QSetView} />;
      default:
        return (
          <LoginView
            QUserFromChild={this.QSetLoggedIn}
            QSetView={this.QSetView}
          />
        );
    }
  }

  QPostLogout = async () => {
    try {
      await axios.post(`${API_URL}/users/logout`, {}, { withCredentials: true });
      this.setState({
        user: null,
        CurrentPage: LOGIN,
        status: { success: true, msg: "Logged out" },
      });
    } catch (err) {
      console.error("Logout failed:", err);
      this.setState({ status: { success: false, msg: "Logout failed. Please try again." } });
    }
  };

  QSetView = (obj) => {
    this.setState((this.state.status = { success: null, msg: "" }));
    this.setState({
      CurrentPage: obj.page,
      Novica: obj.id || 0,
    });
  };

  QSetLoggedIn = (obj) => {
    this.setState({
      user: obj.user,
      CurrentPage: HOME,
      status: { success: null, msg: "" },
    });
  };

  render() {
    if (this.state.bootstrapping) {
      return (
        <div className="container">
          <div className="row container p-4">Loading…</div>
        </div>
      );
    }

    return (
      <div id="APP" className="container">
        <WorkerLocationReporter user={this.state.user} />

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

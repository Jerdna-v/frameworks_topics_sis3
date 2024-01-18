import { Component } from "react";
import { ABOUT, NOVICE, ADDNEW, SIGNUP, LOGIN, NOVICA, HOME, LOGOUT, UPLOAD } from "./Utils/Constants"
import HomeView from "./CustomComponents/HomeView";
import AboutView from "./CustomComponents/AboutView";
import NoviceView from "./CustomComponents/NoviceView";
import AddNovicaView from "./CustomComponents/AddNovicaView";
import SignupView from "./CustomComponents/SignupView";
import LoginView from "./CustomComponents/LoginView";
import SingleNovicaView from "./CustomComponents/SingleNovicaView";
import FilesUploadComponent from "./CustomComponents/FilesUpload";
import axios from "axios";
import { API_URL } from "./Utils/Configuration";
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      CurrentPage: HOME,
      Novica: 1,
      status: {
        success: null,
        msg: ""
      },
      user: null
    };
  }

  QGetView(state) {
    const page = state.CurrentPage;
    switch (page) {
      case ABOUT:
        return <AboutView />;
      case NOVICE:
        return <NoviceView QIDFromChild={this.QSetView} />;
      case ADDNEW:
        return <AddNovicaView />;
      case SIGNUP:
        return <SignupView />;
      case LOGIN:
        return <LoginView QUserFromChild={this.QSetLoggedIn} />;
      case LOGOUT:
        return <HomeView />;
      case UPLOAD:
        return <FilesUploadComponent />;
      case NOVICA:
        return <SingleNovicaView data={state.Novica} QIDFromChild={this.QSetView} />;
      default:
        return <HomeView />;
    }
  };

  QSetView = (obj) => {
    this.setState(this.state.status = { success: null, msg: "" })

    console.log("QSetView");
    this.setState({
      CurrentPage: obj.page,
      Novica: obj.id || 0
    });
  };

  render() {
    return (
      <div id="APP" className="container">
        <div id="menu" className="row">
          <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
              <a
                //onClick={() => this.QSetView({ page: "home" })}
                onClick={this.QSetView.bind(this, { page: "home" })}
                className="navbar-brand"
                href="#"
              >
                Home
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a
                      // onClick={() => this.QSetView({ page: ABOUT })}
                      onClick={this.QSetView.bind(this, { page: ABOUT })}
                      className="nav-link "
                      href="#"
                    >
                      About
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      // onClick={() => this.QSetView({ page: NOVICE })}
                      onClick={this.QSetView.bind(this, { page: NOVICE })}
                      className="nav-link "
                      href="#"
                    >
                      News
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      //onClick={() => this.QSetView({ page: ADDNEW })}
                      onClick={this.QSetView.bind(this, { page: ADDNEW })}
                      className="nav-link"
                      href="#"
                    >
                      Add news
                    </a>
                  </li>


                  <li className="nav-item">
                    <a
                      //onClick={() => this.QSetView({ page: ADDNEW })}
                      onClick={this.QSetView.bind(this, { page: UPLOAD })}
                      className="nav-link"
                      href="#"
                    >
                      Upload
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      //onClick={() => this.QSetView({ page: SIGNUP })}
                      onClick={this.QSetView.bind(this, { page: SIGNUP })}
                      className="nav-link "
                      href="#"
                    >
                      Sign up
                    </a>
                  </li>

                 <li className="nav-item" ><a onClick={this.QSetView.bind(this, { page: LOGIN })}
                      className="nav-link " href="#"> Login </a>
                 </li>
                
                </ul>
              </div>
            </div>
          </nav>
        </div>

        <div id="viewer" className="row container">
          {this.QGetView(this.state)}
        </div>
      </div>
    );
  }
}

export default App;

import {Component} from "react";

import HomeView from "./CustomComponents/HomeView";
import AboutView from "./CustomComponents/AboutView";
import NoviceView from "./CustomComponents/NoviceView";
import AddNovicaView from "./CustomComponents/AddNovicaView";
import SignupView from "./CustomComponents/SignupView";
import LoginView from "./CustomComponents/LoginView";
import SingleNovicaView from "./CustomComponents/SingleNovicaView";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      CurrentPage: "home",
      Novica:1,
    };
  }

  QGetView = (state) => {
    const page = state.CurrentPage;
    switch (page) {
      case "about":
        return <AboutView />;
      case "novice":
        return <NoviceView QIDFromChild={this.QSetView}/>;
      case "addnew":
        return <AddNovicaView />;
      case "signup":
        return <SignupView />;
      case "login":
        return <LoginView />;
      case "novica":
        return <SingleNovicaView  data={state.Novica}  QIDFromChild={this.QSetView}/>;
      default:
        return <HomeView />;
    }
  };

  QSetView = (obj) => {
    console.log("QSetView");
    this.setState({ 
      CurrentPage: obj.page,
      Novica:obj.id || 0
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
                      // onClick={() => this.QSetView({ page: "about" })}
                      onClick={this.QSetView.bind(this, { page: "about" })}
                      className="nav-link "
                      href="#"
                    >
                      About
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      // onClick={() => this.QSetView({ page: "novice" })}
                      onClick={this.QSetView.bind(this, { page: "novice" })}                
                      className="nav-link "
                      href="#"
                    >
                      News
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                     //onClick={() => this.QSetView({ page: "addnew" })}
                      onClick={this.QSetView.bind(this, { page: "addnew" })}
                      className="nav-link"
                    >
                      Add news
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      //onClick={() => this.QSetView({ page: "signup" })}
                      onClick={this.QSetView.bind(this, { page: "signup" })}
                      className="nav-link "
                      href="#"
                    >
                      Sign up
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      //onClick={() => this.QSetView({ page: "login" })}
                      onClick={this.QSetView.bind(this, { page: "login" })}
                      className="nav-link "
                      href="#"
                    >
                      Login
                    </a>
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

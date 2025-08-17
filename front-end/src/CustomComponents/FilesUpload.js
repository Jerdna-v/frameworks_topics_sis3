import React from "react";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

class FilesUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadStatus: { success: null, msg: "" }
    };
  }

  QBack = () => {
    if (this.props.QSetView) this.props.QSetView({ page: "home" });
  };

  QFileUpload = (e) => {
    const data = new FormData();
    data.append("file", e.target.files[0]);
    axios
      .post(`${API_URL}/uploadFile`, data)
      .then(() => {
        this.setState({ uploadStatus: { success: true, msg: "File uploaded successfully!" } });
      })
      .catch(() => {
        this.setState({ uploadStatus: { success: false, msg: "File upload failed. Try again." } });
      });
  };

  render() {
    return (
      <div className="card" style={{ margin: "10px", padding: "20px", width: "100%", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
        <div className="mb-3">
          <button className="btn btn-secondary" onClick={this.QBack}>
            ← Back
          </button>
        </div>

        <h3 style={{ margin: "10px" }}>File Upload</h3>
        <div className="mb-3" style={{ margin: "10px" }}>
          <label htmlFor="file" className="form-label">Select a file to upload:</label>
          <input className="form-control" type="file" id="file" onChange={this.QFileUpload} />
        </div>

        {this.state.uploadStatus.msg !== "" && (
          <p className={`alert ${this.state.uploadStatus.success ? "alert-success" : "alert-danger"}`} role="alert">
            {this.state.uploadStatus.msg}
          </p>
        )}
      </div>
    );
  }
}

export default FilesUpload;

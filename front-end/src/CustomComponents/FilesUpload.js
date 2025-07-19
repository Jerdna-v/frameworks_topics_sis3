import React, { Component } from "react";
import axios from "axios";

import { API_URL } from "../Utils/Configuration";


class FilesUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadStatus: {
        success: null,
        msg: "",
      },
    };
  }
  
  // differnt types of encoding of sending from data. Deafualt is application/x-www-form-urlencoded 
  // for sending files you need to do multipart/form-data
  uploadFile(event){
    const data = new FormData() ;
    data.append('file', event.target.files[0]);
    axios
    .post(`${API_URL}/uploadFile`, data)
    .then((res) => {
      this.setState({
        uploadStatus: { success: true, msg: "File uploaded successfully!" },
      });
      console.log(res.data);
    })
    .catch((err) => {
      this.setState({
        uploadStatus: { success: false, msg: "File upload failed. Try again." },
      });
      console.error(err);
    });
}

  render() {
    return (
<div
        className="card"
        style={{
          margin: "10px",
          padding: "20px",
          width: "100%",
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h3 style={{ margin: "10px" }}>File Upload</h3>
        <div className="mb-3" style={{ margin: "10px" }}>
          <label htmlFor="file" className="form-label">
            Select a file to upload:
          </label>
          <input
            className="form-control"
            type="file"
            id="file"
            onChange={(e) => this.uploadFile(e)}
          />
        </div>
        {this.state.uploadStatus.msg && (
          <p
            className={`alert ${
              this.state.uploadStatus.success ? "alert-success" : "alert-danger"
            }`}
            role="alert"
          >
            {this.state.uploadStatus.msg}
          </p>
        )}
      </div>
    );
  }
}

export default FilesUpload
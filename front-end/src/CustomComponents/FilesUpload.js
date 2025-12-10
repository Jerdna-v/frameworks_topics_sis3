import React from "react";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

class FilesUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      results: [],
      uploadStatus: null,
    };
  }

  QBack = () => {
    if (this.props.QSetView) this.props.QSetView({ page: "home" });
  };

  onFileSelect = (e) => {
    this.setState({
      files: Array.from(e.target.files),
      results: [],
      uploadStatus: null,
    });
  };

  QFileUpload = async () => {
    if (this.state.files.length === 0) {
      this.setState({ uploadStatus: { success: false, msg: "No files selected." } });
      return;
    }

    this.setState({ uploading: true, results: [], uploadStatus: null });

    const data = new FormData();
    this.state.files.forEach((file) => data.append("files", file));

    try {
      const res = await axios.post(API_URL + "/uploadFile", data);

      this.setState({
        uploading: false,
        results: res.data.results || [],
        uploadStatus: { success: true, msg: "Upload finished." },
      });
    } catch (err) {
      this.setState({
        uploading: false,
        uploadStatus: { success: false, msg: "Upload failed. Try again." },
      });
    }
  };

  render() {
    return (
      <div
        className="card"
        style={{
          margin: "10px",
          padding: "20px",
          width: "100%",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Back button */}
        <div className="mb-3">
          <button className="btn btn-secondary" onClick={this.QBack}>
            ← Back
          </button>
        </div>

        <h3 className="mb-3">Upload Reports</h3>

        {/* File input */}
        <div className="mb-3">
          <label htmlFor="file" className="form-label">
            Select one or more files:
          </label>
          <input
            className="form-control"
            type="file"
            id="file"
            multiple
            onChange={this.onFileSelect}
          />
        </div>

        {/* Selected files preview */}
        {this.state.files.length > 0 && (
          <div className="mb-3">
            <strong>Files to upload:</strong>
            <ul>
              {this.state.files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload button */}
        <button
          className="btn btn-primary"
          onClick={this.QFileUpload}
          disabled={this.state.uploading}
        >
          {this.state.uploading ? "Uploading…" : "Upload"}
        </button>

        {/* Spinner */}
        {this.state.uploading && (
          <div className="mt-3 text-center">
            <div className="spinner-border" role="status"></div>
          </div>
        )}

        {/* Global upload status */}
        {this.state.uploadStatus && (
          <p
            className={`alert mt-3 ${
              this.state.uploadStatus.success ? "alert-success" : "alert-danger"
            }`}
          >
            {this.state.uploadStatus.msg}
          </p>
        )}

        {/* Per-file results table */}
        {this.state.results.length > 0 && (
          <div className="mt-4">
            <h5>Result:</h5>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Status</th>
                  <th>Machine ID</th>
                  <th>Report ID</th>
                </tr>
              </thead>
              <tbody>
                {this.state.results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.file}</td>
                    <td>
                      {r.success ? (
                        <span className="text-success">✓ Success</span>
                      ) : (
                        <span className="text-danger">✗ Failed</span>
                      )}
                    </td>
                    <td>{r.mid || "-"}</td>
                    <td>{r.rid || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default FilesUpload;

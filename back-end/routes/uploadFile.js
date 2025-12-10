import React from "react";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

class FilesUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],              // { file: File, progress: number }
      uploading: false,
      results: [],
      uploadStatus: null,
      dragActive: false,
    };
  }

  QBack = () => {
    if (this.props.QSetView) this.props.QSetView({ page: "home" });
  };

  // Convert FileList → array of file objects with progress
  prepareFiles(rawFiles) {
    return Array.from(rawFiles).map(f => ({
      file: f,
      progress: 0
    }));
  }

  // -------------------------------
  // File selection (manual)
  // -------------------------------
  onFileSelect = (e) => {
    const files = this.prepareFiles(e.target.files);
    this.setState({
      files,
      results: [],
      uploadStatus: null
    });
  };

  // -------------------------------
  // Folder selection (webkitdirectory)
  // -------------------------------
  onFolderSelect = (e) => {
    const files = this.prepareFiles(e.target.files);
    this.setState({
      files,
      results: [],
      uploadStatus: null
    });
  };

  // -------------------------------
  // Drag & drop
  // -------------------------------
  onDragOver = (e) => {
    e.preventDefault();
    this.setState({ dragActive: true });
  };

  onDragLeave = (e) => {
    e.preventDefault();
    this.setState({ dragActive: false });
  };

  onDrop = (e) => {
    e.preventDefault();
    this.setState({ dragActive: false });

    const items = e.dataTransfer.items;
    let files = [];

    const traverseDirectory = async (item, path = "") => {
      return new Promise((resolve) => {
        if (item.isFile) {
          item.file((file) => {
            file.fullPath = path + file.name;
            resolve([file]);
          });
        } else if (item.isDirectory) {
          const reader = item.createReader();
          reader.readEntries(async (entries) => {
            let all = [];
            for (let entry of entries) {
              const sub = await traverseDirectory(entry, path + item.name + "/");
              all = all.concat(sub);
            }
            resolve(all);
          });
        } else resolve([]);
      });
    };

    const processItems = async () => {
      let collected = [];

      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
          const result = await traverseDirectory(entry);
          collected = collected.concat(result);
        }
      }

      const prepared = this.prepareFiles(collected);
      this.setState({ files: prepared, results: [], uploadStatus: null });
    };

    processItems();
  };

  // -------------------------------
  // Upload with per-file progress
  // -------------------------------
  QFileUpload = async () => {
    if (this.state.files.length === 0) {
      this.setState({ uploadStatus: { success: false, msg: "No files selected." } });
      return;
    }

    this.setState({ uploading: true, results: [], uploadStatus: null });

    let results = [];

    for (let i = 0; i < this.state.files.length; i++) {
      const fileObj = this.state.files[i];
      const formData = new FormData();
      formData.append("files", fileObj.file);

      try {
        const res = await axios.post(API_URL + "/uploadFile", formData, {
          onUploadProgress: (p) => {
            const percent = Math.round((p.loaded * 100) / p.total);
            this.updateProgress(i, percent);
          }
        });

        results.push({
          ...res.data.results?.[0],
          file: fileObj.file.name
        });
      } catch (err) {
        results.push({
          success: false,
          msg: "Failed",
          file: fileObj.file.name
        });
      }
    }

    this.setState({
      uploading: false,
      results,
      uploadStatus: { success: true, msg: "Upload finished." }
    });
  };

  updateProgress(index, value) {
    const files = [...this.state.files];
    files[index].progress = value;
    this.setState({ files });
  }

  // Trigger hidden inputs
  clickFileInput = () => document.getElementById("hiddenFileInput").click();
  clickFolderInput = () => document.getElementById("hiddenFolderInput").click();

  // -------------------------------
  // RENDER
  // -------------------------------
  render() {
    return (
      <div
        className="card"
        style={{
          margin: "10px",
          padding: "20px",
          width: "100%",
          maxWidth: "650px",
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

        {/* Drag & Drop */}
        <div
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
          onClick={() => {}}
          style={{
            border: this.state.dragActive ? "3px dashed #0d6efd" : "2px dashed #666",
            padding: "40px",
            borderRadius: "10px",
            textAlign: "center",
            background: this.state.dragActive ? "#e7f1ff" : "#fafafa",
            cursor: "pointer",
            transition: "0.2s",
            marginBottom: "15px"
          }}
        >
          <p style={{ margin: 0, fontSize: "16px" }}>
            {this.state.dragActive
              ? "Drop files or folders here…"
              : "Drag & drop files or folders here"}
          </p>
        </div>

        {/* File input */}
        <button className="btn btn-outline-primary me-2" onClick={this.clickFileInput}>
          Select Files
        </button>

        <button className="btn btn-outline-success" onClick={this.clickFolderInput}>
          Select Folder
        </button>

        <input
          type="file"
          id="hiddenFileInput"
          style={{ display: "none" }}
          multiple
          onChange={this.onFileSelect}
        />

        {/* Folder upload (webkitdirectory) */}
        <input
          type="file"
          id="hiddenFolderInput"
          style={{ display: "none" }}
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={this.onFolderSelect}
        />

        {/* File list */}
        {this.state.files.length > 0 && (
          <div className="mt-3">
            <strong>Files loaded:</strong>
            <ul className="list-group">
              {this.state.files.map((f, i) => (
                <li key={i} className="list-group-item">
                  <div>{f.file.name}</div>
                  {this.state.uploading && (
                    <div className="progress mt-2">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: f.progress + "%" }}
                      >
                        {f.progress}%
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload button */}
        <button
          className="btn btn-primary mt-3"
          onClick={this.QFileUpload}
          disabled={this.state.uploading}
        >
          {this.state.uploading ? "Uploading…" : "Upload"}
        </button>

        {this.state.uploadStatus && (
          <div
            className={`alert mt-3 ${
              this.state.uploadStatus.success ? "alert-success" : "alert-danger"
            }`}
          >
            {this.state.uploadStatus.msg}
          </div>
        )}

        {/* Results table */}
        {this.state.results.length > 0 && (
          <div className="mt-4">
            <h5>Upload Results</h5>
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

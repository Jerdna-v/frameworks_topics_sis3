import React, { Component } from "react";
import axios from "axios";

import { API_URL } from "../Utils/Configuration";


class FilesUpload extends Component {
  
  // differnt types of encoding of sending from data. Deafualt is application/x-www-form-urlencoded 
  // for sending files you need to do multipart/form-data
  uploadFile(event){
    const data = new FormData() ;
    data.append('file', event.target.files[0]);
    axios.post(API_URL+"/uploadFile", data)
        .then(res => { // then print response status
          console.log(res.data)
        })
  }

  render() {
    return (

      <div className="card"
        style={{ margin: "10px" }}>
        <h3 style={{ margin: "10px" }}>File upload</h3>
        <div className="mb-3"
          style={{ margin: "10px" }}>
              <div className="mb-3">
                <label for="formFile" class="form-label">Default file input example</label>
                <input class="form-control" type="file" id="file" onChange={(e) => {this.uploadFile(e)}} />
              </div>
          </div>
      </div>
    );
  }
}

export default FilesUpload
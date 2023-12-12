import React from "react";
import PropTypes from 'prop-types';
import axios from "axios";


class LoginView extends React.Component{
  constructor(props)
    {
        super(props);
        this.state={
          logged: true,
          user: {
              id: null,
              user_name: "",
              user_email: "",
              user_password: ""
          },
          status: {
              success: null,
              msg: ""
          }
        }
    }

    QGetTextFromField=(e)=>{
      this.setState(this.state.user[e.target.name] = [e.target.value])
      console.log(this.state)
    }

  QPostLogin=()=>{
    // TODO: you should validate the data before sending it to the server,
    
    axios.post('http://88.200.63.148:5000/users/login',
    {
      username:this.state.username,
      password:this.state.password
    })
    .then(response=>{
      console.log("Sent to server...")
      console.log(response.status)
      if(response.status == 200){
        console.log(response.data)
        this.props.QUserFromChild(response.data)
      }else if(response.status == 204){
         // Request was processed but user is not registered, or credentials are incorrect, do something.
         console.log("Request was ok but something with user data is not correct")
      }else{
        console.log("Something is really wrong, DEBUG!")
      }

    })
    .catch(err=>{
      console.log(err)
    })
  }    

    render(){
        return(
              <div className="card" 
                    style={{width:"400px", marginLeft:"auto", marginRight:"auto", marginTop:"10px", marginBottom:"10px"}}>
                <form style={{margin:"20px"}} >
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input name="username" onChange={(e)=>this.QGetTextFromField(e)}
                          type="text" 
                          className="form-control" 
                          id="exampleInputEmail1"/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input name="password" onChange={(e)=>this.QGetTextFromField(e)}
                          type="password"  
                          className="form-control" 
                          id="exampleInputPassword1"/>
                  </div>
                </form>
                <button style={{margin:"10px"}} onClick={()=>this.QPostLogin()}
                        className="btn btn-primary bt">Sign in</button>
              </div>
        )
    }
}


LoginView.propTypes = {
  QUserFromChild: PropTypes.func.isRequired,
};



export default LoginView
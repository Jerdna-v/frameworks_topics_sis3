import React from "react";
import PropTypes from 'prop-types';
import axios from "axios";


class LoginView extends React.Component{
  constructor(props)
    {
        super(props);
        this.state={
          user_input: {
             
          },
          user:{},
          status: {
              success: null,
              msg: ""
          }
        }
    }

    QGetTextFromField=(e)=>{
      this.setState(prevState=>({
        user_input:{...prevState.user_input,[e.target.name]:e.target.value}
      }))
    }
    
  QPostLogin=()=>{
    // TODO: you should validate the data before sending it to the server,
    
    axios.post('http://88.200.63.148:5000/users/login',
    {
      username:this.state.user_input.username,
      password:this.state.user_input.password
    })
    .then(response=>{
      console.log("Sent to server...")
      console.log(response.status)
      if(response.status == 200){
        console.log(response.data)
        this.setState(this.state.status = response.data.status)
        this.setState(this.state.user = response.data.user)
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
                        className="btn btn-primary bt">Sign in 123</button>

                {/* TODO: We should display error to the user if something went wrong or a
                success message  if an item was added. Use paragraph with the following classNmes:
                => no success: <p className="alert alert-danger" role="alert"> 
                => success: <p className="alert alert-success" role="alert"> 
                */}
              </div>
        )
    }
}


LoginView.propTypes = {
  QUserFromChild: PropTypes.func.isRequired,
};



export default LoginView
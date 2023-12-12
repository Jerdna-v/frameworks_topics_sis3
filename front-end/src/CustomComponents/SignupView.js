import React from "react";
import axios from "axios";

class SignupView extends React.Component{
  constructor(props)
  {
      super(props);
      this.state={
          user:{
            username: "",
            email: "",
            password: ""
          },
          status:{
            success: true,
            msg: ""
          }
      }
  }

  // QGetTextFromField=(e)=>{
  //   this.setState({ [e.target.name]: e.target.value})
  //   console.log(this.state)
  // }
  QGetTextFromField=(e)=>{
    this.setState(this.state.user[e.target.name] = [e.target.value])
    console.log(this.state)
  }

  QPostSignup=()=>{
    // TODO: you should validate the data before sending it to the server,
    
    axios.post('http://88.200.63.148:5000/users/register',{
      username:this.state.user.username,
      email:this.state.user.email,
      password:this.state.user.password
    })
    .then(response=>{
     /// TODO: You should indicate if the element was added, or if not show the error
     this.setState(this.state.status = response.data)      
      console.log("Sent to server...")
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
      <input name="username"  onChange={(e)=>this.QGetTextFromField(e)}
             type="text" 
             className="form-control"  
             id="exampleInputEmail1" 
             aria-describedby="emailHelp"/>
    </div>
    <div className="mb-3">
      <label className="form-label">Email address</label>
      <input name="email"  onChange={(e)=>this.QGetTextFromField(e)}
             type="email" 
             className="form-control" 
             id="exampleInputEmail1" 
             aria-describedby="emailHelp"/>
      <div id="emailHelp" 
           className="form-text">We`&apos;`ll never share your email with anyone else.
      </div>
    </div>
    <div className="mb-3">
      <label className="form-label">Password</label>
      <input name="password"  onChange={(e)=>this.QGetTextFromField(e)}
             type="password"
             className="form-control"
             id="exampleInputPassword1"/>
    </div>
  </form>
  <button style={{margin:"10px"}}  onClick={()=>this.QPostSignup()}
          className="btn btn-primary bt">Submit</button>

  {/* TODO: We should display error to the user if something went wrong or a
  success message  if an item was added. Use paragraph with the following classNmes:
    => no success: <p className="alert alert-danger" role="alert"> 
    => success: <p className="alert alert-success" role="alert"> 
  */}
</div>
        )
    }
}

export default SignupView
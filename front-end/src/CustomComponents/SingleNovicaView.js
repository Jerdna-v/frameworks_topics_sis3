import React from "react";
import PropTypes from 'prop-types';
import axios from 'axios'
import { API_URL } from "../Utils/Configuration";

class SingleNovicaView extends React.Component{
    constructor(props){
        super(props);
        this.state={
            novica:{}
        }
    }
    QSetViewInParent=(obj)=>{
        this.props.QIDFromChild(obj)
    }


    componentDidMount(){
    axios.get(API_URL + "/novice/"+this.props.data)
    .then(response =>{
        console.log(response.data)
        this.setState({
            novica:response.data
        })
    })
    }

    render(){
        let novica= this.state.novica
        return(
        <div className="card" style={{margin:"10px"}}>
           {novica.length>0 ?
            <div>
                <h5 className="card-header">{novica[0].title}</h5>
                <div className="card-body">
                <h5 className="card-title">{novica[0].slug}</h5>
                <p className="card-text">{novica[0].text}</p>
                <button onClick={()=>this.QSetViewInParent({page:"novice"})}  className="btn btn-primary">Return news</button>
                </div>
            </div>
           :"Loading..."}
        </div>
        )
    }
}

SingleNovicaView.propTypes = {
    QIDFromChild: PropTypes.func.isRequired,
    data: PropTypes.number.isRequired
}
  
export default SingleNovicaView
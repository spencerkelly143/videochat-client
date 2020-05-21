import React from 'react';
import { withRouter } from 'react-router-dom'
import axios from 'axios'

axios.defaults.baseURL = "http://localhost:5000"
axios.defaults.headers.common = {
  "Content-Type": "application/json"
}

class Home extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      user: ''
    }
  }

  userChange = (e) =>{
    this.setState({
      user: e.target.value
    })
  }

  submitUser = (e) => {
    console.log(this.state.user)
    axios.post('/user', {'user': this.state.user})
          .then(res => {
            console.log(res)
            this.props.history.push(`/chat/${this.state.user}`)
          })
  }

  render(){
    return(
      <div>
        <label>User</label>
        <input onChange={this.userChange} value={this.state.user}/>
        <button onClick={this.submitUser}>submit</button>
      </div>
    )
  }
}

export default withRouter(Home)

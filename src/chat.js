import React from 'react';
import { withRouter } from 'react-router-dom'
import socketIOClient from "socket.io-client";
import axios from 'axios'

axios.defaults.baseURL = "http://localhost:5000"
axios.defaults.headers.common = {
  "Content-Type": "application/json"
}
const ENDPOINT = "http://127.0.0.1:5000";

class Chat extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      messages: [],
      message: "",
    }
  }

  getMessages = () => {
    console.log("fire")

    axios.get('/messages')
          .then(res =>{
            this.setState({
              messages: res.data.map(string => JSON.parse(string))
            },() => console.log(this.state))
          })
  }

  getUsers = () => {
    console.log("fire")
    axios.get('/users')
          .then(res =>{
            this.setState({
              users: res.data
            },() => console.log(this.state))
          })
  }

  componentDidMount = () => {
    this.scrollToBottom();
    this.setState({
      user: this.props.match.params.user,
    },() => console.log(this.state))
    this.getMessages();
    this.getUsers();
    const socket = socketIOClient(ENDPOINT)
    socket.on("message", message => {
      this.updateMessages(message)
    })
    socket.on("users", users => {
      console.log(users)
      this.setState({
        users: users
      }, () => console.log(this.state))
    })
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }

  updateMessages = message => {
    this.setState(prevState => ({
      messages: [...prevState.messages, message]
    }), () => console.log(this.state))
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  sendMessage = () => {
    axios.post('/message', {message: this.state.message, user: this.state.user})
          .then(res =>{
            this.setState({message: ''})
            console.log("message sent")
          })
  }
  key = (e) => {
    if(e.keyCode== 13){
      this.sendMessage()
    }
  }
  render(){
    return(
      <div>
        <p>{this.state.user}</p>
          {this.state.messages.map((message, key) =>
            <div key={key}>
              <p >{message.user}</p>
              <p>{message.message}</p>
            </div>
          )}
          <div style={{ float:"left", clear: "both" }}
               ref={(el) => { this.messagesEnd = el; }}>
          </div>
          <div>
            <input onChange={e => this.setState({message: e.target.value})} onKeyDown={this.key} value={this.state.message}/>
            <button onClick={this.sendMessage} onEnter={this.sendMessage}>Send</button>
          </div>
      </div>
    )
  }
}

export default withRouter(Chat)

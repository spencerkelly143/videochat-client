import React from 'react';
import { withRouter } from 'react-router-dom'
import socketIOClient from "socket.io-client";
import VideoChat from './videochat'
import axios from 'axios'

axios.defaults.baseURL = "http://localhost:5000"
axios.defaults.headers.common = {
  "Content-Type": "application/json"
}
const ENDPOINT = "http://127.0.0.1:5000";
const socket = socketIOClient(ENDPOINT)

class Chat extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      messages: [],
      message: "",
      videoChat: undefined,
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

    socket.on("message", message => {
      this.updateMessages(message)
    })
    socket.on("users", users => {
      console.log(users)
      this.setState({
        users: users
      }, () => console.log(this.state))
    })
    socket.on("PCSignalingOffer", content =>{
      console.log("WELL<JFDSAF")
      if(content.to === this.state.user){
        content.calling = false
        this.setState({
          videoChat: content
        }, () => console.log(this.state))
    }
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
  sendSignalingMessage = (content) => {
    console.log(content)
    if(content.type === "offer"){
      socket.emit("PCSignalingOffer", content)
    } else if (content.type === "answer") {
      socket.emit(socket.emit("PCSignalingAnswer", content))
    }
  }

  sendIceCandidate = (content) => {
    console.log("yuuuup")
    console.log(content)
    socket.emit("IceCandidate", content)
  }

  key = (e) => {
    if(e.keyCode== 13){
      this.sendMessage()
    }
  }

  sendCall = (e) => {
    let videoChat = {
      desc: undefined,
      to: "Sabrina",
      from: this.state.username,
      room: "main",
      calling: true,
    }
    this.setState({
      videoChat: videoChat
    })
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
            <button onClick={this.sendMessage}>Send</button>
            <button onClick={this.sendCall}>Call</button>
          </div>
          {this.state.user && this.state.videoChat && <VideoChat user={this.state.user} sendSignalingMessage={this.sendSignalingMessage}
                                sendIceCandidate={this.sendIceCandidate} socket={socket} videoChat={this.state.videoChat}/>}
      </div>
    )
  }
}

export default withRouter(Chat)

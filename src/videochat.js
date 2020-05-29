import React from 'react'
import socketIOClient from "socket.io-client";

const constraints = {'video': true, 'audio': true}
export default class VideoChat extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      myVideo: {
        srcObject: undefined
      }
    }
    this.handleAnswer = this.handleAnswer.bind(this)
  }

  async componentDidMount(){
    this.getUserMedia();
  }


getUserMedia(){

    if("mediaDevices" in navigator){
      console.log("here")
      console.log(navigator.mediaDevices.getUserMedia(constraints))
      navigator.mediaDevices.getUserMedia(constraints)
              .then(function(stream){
                console.log("here")
                const videoElement = document.querySelector('video#localVideo');
                console.log(videoElement)
                videoElement.srcObject = stream;
                this.setState({
                  localStream: stream
                }, () => {
                  this.createPeerConnection();
                })
              })
              .catch(error => {
      console.log(`error with media: ${error}`);
    })
  }
}
  createPeerConnection = () => {
    const pc = new RTCPeerConnection()
    console.log(pc)
    this.setState({
      pc: pc
    },() => {
      console.log("yup")
      this.addLocalStream();
      this.onIceCandidates();
      if(this.props.videoChat.calling){
        this.callFriend();
      } else {
        this.handleAnswer();
      }
    })
  }

  addLocalStream = () => {
    console.log(this.state.localStream)
    this.state.pc.addStream(this.state.localStream)
  }


  async callFriend(){
    try{
      const offer = await this.state.pc.createOffer(this.props.offerOptions);
      await this.state.pc.setLocalDescription(offer)
      this.sendSignalingMessage(this.state.pc.localDescription, "offer")
    } catch(error) {
      console.log(`error creating offer from ${this.props.username}: ${error}`)
    }
  }

  sendSignalingMessage = (desc, type) => {
    if(type === "offer"){
      this.props.sendSignalingMessage({
        desc,
        to: this.props.videoChat.to,
        from: this.props.user,
        room: this.props.videoChat.room,
        type: type,
      })
    } else if(type === "answer"){
      this.props.sendSignalingMessage({
        desc,
        to: this.props.videoChat.from,
        from: this.props.user,
        room: this.props.videoChat.room,
        type: type,
      })
    }
  }

  async handleAnswer(){
    console.log(this.state.pc)
    await this.state.pc.setRemoteDescription(this.props.videoChat.desc)
    this.createAnswer();
  }

  async createAnswer(){
  try {
    const answer = await this.state.pc.createAnswer() // Create answer
    console.log("made it")
    await this.state.pc.setLocalDescription(answer) // Add local description
    console.log('made it')
    this.sendSignalingMessage(this.state.pc.localDescription, "answer") // Send signaling message
  } catch (error) {
    console.log(`Error creating the answer from ${this.username}. Error: ${error}`);
  }
}

//listeners
remoteCandidates(){
  this.props.socket.on("IceCandidate", async ({candidate, to, from, room}) => {
    if(to === this.state.user){
      try {
        await this.state.pc.addIceCandidate(candidate)
      } catch (e){
        console.log(e)
      }
    }
  })
}

onIceCandidates = () => {
  this.state.pc.onicecandidate = ({candidate}) => {   //change this to callback
    if(candidate && this.props.videoChat.calling){
      this.props.sendIceCandidate({
        candidate,
        to: this.props.videoChat.to,
        from: this.props.videoChat.from,
        room: this.props.videoChat.room,
      })
    } else if(candidate && !this.props.videoChat.calling){
      this.props.sendIceCandidate({
        candidate,
        to: this.props.videoChat.from,
        from: this.props.videoChat.to,
        room: this.props.videoChat.room,
      })
    }
  }
}

onAddStream = () => {
  this.state.pc.onaddstream = (e) => {
  const remoteVideo = document.querySelector('video#remoteVideo');
    if(!remoteVideo.srcObject && e.stream){
      remoteVideo.srcObject = this.remoteStream
    }
  }
}
render(){
  return(
    <div>
      <video id="localVideo" autoPlay playsInline controls="false"/>
      <video id='remoteVideo' autoPlay playsInline controls="false"/>
    </div>
  )
}
}
